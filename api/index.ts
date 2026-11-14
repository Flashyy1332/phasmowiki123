import express, { type Request, type Response, type NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import { createRemoteJWKSet, jwtVerify } from "jose";
import * as dotenv from "dotenv";

dotenv.config();

/* ------------------------------------------------------------------ */
/*  Конфігурація — тільки зі змінних середовища, жодних ключів у коді   */
/* ------------------------------------------------------------------ */

const env = (name: string) => (process.env[name] || "").trim();

const SUPABASE_URL = env("SUPABASE_URL").replace(/\/+$/, "");
const SUPABASE_SECRET_KEY = env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_PUBLIC_KEY = env("SUPABASE_PUBLISHABLE_KEY") || env("SUPABASE_ANON_KEY");
const FIREBASE_PROJECT_ID = env("FIREBASE_PROJECT_ID") || "phasmowiki-prod";
const GEMINI_KEY = env("GEMINI_API_KEY");
const GEMINI_MODEL = env("GEMINI_MODEL") || "gemini-2.5-flash";
const ADMIN_EMAILS = env("ADMIN_EMAILS")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const geminiConfigured = !!GEMINI_KEY && GEMINI_KEY !== "MY_GEMINI_API_KEY";

/* ------------------------------------------------------------------ */
/*  Supabase (PostgREST) — один клієнт з тайм-аутом і зрозумілими       */
/*  помилками                                                           */
/* ------------------------------------------------------------------ */

export type DbErrorCode =
  | "not_configured"
  | "no_write_key"
  | "bad_key"
  | "forbidden"
  | "table_missing"
  | "project_unavailable"
  | "timeout"
  | "network"
  | "unknown";

export class DbError extends Error {
  code: DbErrorCode;
  status: number;
  constructor(code: DbErrorCode, message: string, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function sb(path: string, init: RequestInit = {}, write = false): Promise<any> {
  if (!SUPABASE_URL) {
    throw new DbError("not_configured", "Не задано SUPABASE_URL у файлі .env.", 503);
  }
  const key = write ? SUPABASE_SECRET_KEY : SUPABASE_SECRET_KEY || SUPABASE_PUBLIC_KEY;
  if (!key) {
    throw new DbError(
      write ? "no_write_key" : "not_configured",
      write
        ? "Для запису в базу потрібен SUPABASE_SECRET_KEY у файлі .env."
        : "Не задано ключ Supabase (SUPABASE_SECRET_KEY або SUPABASE_PUBLISHABLE_KEY).",
      503,
    );
  }

  let response: globalThis.Response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e: any) {
    if (e?.name === "TimeoutError" || e?.name === "AbortError") {
      throw new DbError("timeout", "Supabase не відповів за 8 секунд. Можливо, проєкт призупинено.", 504);
    }
    throw new DbError("network", `Не вдалося з'єднатися з Supabase: ${e?.cause?.code || e?.message || e}`, 502);
  }

  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (response.ok) return body;

  const detail = (body && (body.message || body.msg || body.error)) || String(text).slice(0, 200);
  const pgCode = body && body.code;
  if (response.status === 401) {
    throw new DbError("bad_key", `Supabase відхилив ключ (401): ${detail}. Ключ недійсний або відкликаний — створіть новий.`);
  }
  if (response.status === 403 || pgCode === "42501") {
    throw new DbError("forbidden", `Немає прав на таблицю (RLS): ${detail}`);
  }
  if (pgCode === "PGRST205" || pgCode === "42P01" || response.status === 404) {
    throw new DbError("table_missing", `Таблицю не знайдено: ${detail}. Виконайте supabase/schema.sql.`);
  }
  if (response.status >= 500 || response.status === 540) {
    throw new DbError("project_unavailable", `Проєкт Supabase недоступний (${response.status}). Перевірте, чи він не на паузі.`);
  }
  throw new DbError("unknown", `Supabase ${response.status}: ${detail}`);
}

const q = (v: string) => encodeURIComponent(v);

/* ------------------------------------------------------------------ */
/*  Авторизація — перевіряємо підпис Firebase ID-токена, а не email,    */
/*  який надіслав браузер                                               */
/* ------------------------------------------------------------------ */

const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

async function emailFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, firebaseKeys, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    if (!payload.email || payload.email_verified === false) return null;
    return String(payload.email).toLowerCase();
  } catch {
    return null;
  }
}

async function isAdminEmail(email: string | null): Promise<boolean> {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  try {
    const rows = await sb(`admins?select=email&email=ilike.${q(email)}`);
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

type AuthedRequest = Request & { userEmail?: string };

async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const email = await emailFromRequest(req);
  if (!email) return res.status(401).json({ error: "Увійдіть через Google, щоб продовжити." });
  req.userEmail = email;
  next();
}

async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const email = await emailFromRequest(req);
  if (!email) return res.status(401).json({ error: "Увійдіть через Google, щоб продовжити." });
  if (!(await isAdminEmail(email))) return res.status(403).json({ error: "У вас немає прав адміністратора." });
  req.userEmail = email;
  next();
}

/* ------------------------------------------------------------------ */
/*  Перетворення рядків БД <-> об'єкти API                              */
/* ------------------------------------------------------------------ */

const NEW_MARK = "<!--NEW-->";

function toEvidenceList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        return toEvidenceList(JSON.parse(trimmed));
      } catch {
        /* звичайний рядок через кому */
      }
    }
    return trimmed.replace(/^\{|\}$/g, "").split(",").map((s) => s.replace(/^"|"$/g, "").trim()).filter(Boolean);
  }
  return [];
}

function ghostFromRow(row: any) {
  let description: string = row.description ?? row.Description ?? "";
  const isNew = description.includes(NEW_MARK);
  if (isNew) description = description.replace(NEW_MARK, "").trim();
  return {
    name: row.name ?? row.Name ?? "",
    isNew,
    huntThreshold: row.hunt_threshold ?? row.huntthreshold ?? row.HuntThreshold ?? "",
    evidences: toEvidenceList(row.evidences ?? row.Evidences),
    description,
    strength: row.strength ?? row.Strength ?? "",
    weakness: row.weakness ?? row.Weakness ?? "",
    testToVerify: row.test ?? row.testtoverify ?? row.TestToVerify ?? "",
  };
}

function ghostToRow(ghost: any) {
  const name = String(ghost?.name || "").trim();
  if (!name) throw new DbError("unknown", "Вкажіть назву привида.", 400);
  const description = String(ghost.description || "").replace(NEW_MARK, "").trim();
  return {
    name,
    hunt_threshold: String(ghost.huntThreshold || "").trim(),
    evidences: toEvidenceList(ghost.evidences).join(", "),
    description: ghost.isNew ? `${description}\n\n${NEW_MARK}` : description,
    strength: String(ghost.strength || "").trim(),
    weakness: String(ghost.weakness || "").trim(),
    test: String(ghost.testToVerify || "").trim(),
  };
}

function equipmentFromRow(row: any) {
  return {
    name: row.name ?? row.Name ?? "",
    icon: row.icon ?? row.Icon ?? "",
    imageName: row.image_url ?? row.imagename ?? row.ImageName ?? "",
    description: row.description ?? row.Description ?? "",
  };
}

function equipmentToRow(item: any) {
  const name = String(item?.name || "").trim();
  if (!name) throw new DbError("unknown", "Вкажіть назву спорядження.", 400);
  return {
    name,
    icon: String(item.icon || "").trim(),
    image_url: String(item.imageName || "").trim().replace(/^\/?items\//, ""),
    description: String(item.description || "").trim(),
  };
}

function sendError(res: Response, err: any) {
  if (err instanceof DbError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  console.error(err);
  res.status(500).json({ error: err?.message || "Внутрішня помилка сервера", code: "unknown" });
}

/* ------------------------------------------------------------------ */
/*  Маршрути                                                            */
/* ------------------------------------------------------------------ */

const app = express();
app.use(express.json({ limit: "1mb" }));

/** Діагностика: показує, що саме не так із базою, не розкриваючи ключів. */
app.get("/api/health", async (_req, res) => {
  const db: any = {
    configured: !!SUPABASE_URL && !!(SUPABASE_SECRET_KEY || SUPABASE_PUBLIC_KEY),
    canWrite: !!SUPABASE_URL && !!SUPABASE_SECRET_KEY,
    ok: false,
  };
  try {
    const [ghosts, equipment] = await Promise.all([sb("ghosts?select=name"), sb("equipment?select=name")]);
    db.ok = true;
    db.ghosts = ghosts.length;
    db.equipment = equipment.length;
  } catch (e: any) {
    db.code = e.code || "unknown";
    db.message = e.message;
  }
  res.json({ db, ai: { configured: geminiConfigured, model: GEMINI_MODEL } });
});

app.get("/api/me", async (req, res) => {
  const email = await emailFromRequest(req);
  res.json({ email, isAdmin: await isAdminEmail(email) });
});

app.get("/api/ghosts", async (_req, res) => {
  try {
    const rows = await sb("ghosts?select=*");
    res.json(rows.map(ghostFromRow));
  } catch (e) {
    sendError(res, e);
  }
});

app.post("/api/ghosts", requireAdmin, async (req, res) => {
  try {
    await sb("ghosts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(ghostToRow(req.body.ghost)) }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

app.put("/api/ghosts/:name", requireAdmin, async (req, res) => {
  try {
    await sb(`ghosts?name=eq.${q(req.params.name)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(ghostToRow(req.body.ghost)) }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

app.delete("/api/ghosts/:name", requireAdmin, async (req, res) => {
  try {
    await sb(`ghosts?name=eq.${q(req.params.name)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

app.get("/api/equipment", async (_req, res) => {
  try {
    const rows = await sb("equipment?select=*");
    res.json(rows.map(equipmentFromRow));
  } catch (e) {
    sendError(res, e);
  }
});

app.post("/api/equipment", requireAdmin, async (req, res) => {
  try {
    await sb("equipment", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(equipmentToRow(req.body.equipment)) }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

app.put("/api/equipment/:name", requireAdmin, async (req, res) => {
  try {
    await sb(`equipment?name=eq.${q(req.params.name)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(equipmentToRow(req.body.equipment)) }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

app.delete("/api/equipment/:name", requireAdmin, async (req, res) => {
  try {
    await sb(`equipment?name=eq.${q(req.params.name)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, true);
    res.json({ success: true });
  } catch (e) {
    sendError(res, e);
  }
});

/**
 * Заповнює порожню базу вбудованим довідником. Додає лише ті записи,
 * яких у базі ще немає — наявні не чіпає.
 */
app.post("/api/admin/import", requireAdmin, async (req, res) => {
  try {
    const ghosts: any[] = Array.isArray(req.body.ghosts) ? req.body.ghosts : [];
    const equipment: any[] = Array.isArray(req.body.equipment) ? req.body.equipment : [];
    const [haveGhosts, haveEquipment] = await Promise.all([sb("ghosts?select=name"), sb("equipment?select=name")]);
    const ghostNames = new Set(haveGhosts.map((r: any) => r.name));
    const equipmentNames = new Set(haveEquipment.map((r: any) => r.name));
    const newGhosts = ghosts.map(ghostToRow).filter((g) => !ghostNames.has(g.name));
    const newEquipment = equipment.map(equipmentToRow).filter((e) => !equipmentNames.has(e.name));
    if (newGhosts.length) {
      await sb("ghosts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(newGhosts) }, true);
    }
    if (newEquipment.length) {
      await sb("equipment", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(newEquipment) }, true);
    }
    res.json({ success: true, ghosts: newGhosts.length, equipment: newEquipment.length });
  } catch (e) {
    sendError(res, e);
  }
});

/* ---------------------------- ШІ-асистент --------------------------- */

const ai = geminiConfigured
  ? new GoogleGenAI({ apiKey: GEMINI_KEY })
  : null;

const chatHits = new Map<string, number[]>();
function chatAllowed(email: string) {
  const now = Date.now();
  const recent = (chatHits.get(email) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 12) return false;
  recent.push(now);
  chatHits.set(email, recent);
  return true;
}

const SYSTEM_PROMPT =
  "Ти — експерт з гри Phasmophobia і помічник сайту PhasmoWiki. Допомагай гравцям: визначати привида за доказами та поведінкою, " +
  "виживати під час полювань, користуватися спорядженням, а також створювати кастомні складності (початковий глузд, відновлення " +
  "глузду, швидкість привидів, кількість доказів, укриття, множник нагороди). Відповідай коротко і по суті, українською мовою, " +
  "використовуй markdown (списки, жирний текст). Якщо не впевнений у точному числі — так і скажи.";

const SYSTEM_PROMPT_EN =
  "You are an expert on the game Phasmophobia and the assistant of the PhasmoWiki site. Help players identify the ghost from " +
  "evidence and behavior, survive hunts, use equipment, and build custom difficulties (starting sanity, sanity restoration, " +
  "ghost speed, number of evidences, hiding spots, reward multiplier). Answer briefly and to the point, in English, " +
  "using markdown (lists, bold text). If you are not sure about an exact number, say so. Use the official English names " +
  "of ghosts, evidence and equipment.";

/** Мова відповіді асистента — та, що вибрана в інтерфейсі сайту. */
const chatLang = (value: unknown): "uk" | "en" => (value === "en" ? "en" : "uk");

app.post("/api/chat", requireUser, async (req: AuthedRequest, res) => {
  const lang = chatLang(req.body?.lang);
  const en = lang === "en";
  try {
    if (!ai) {
      return res.status(503).json({
        error: en ? "The AI assistant is not configured: add GEMINI_API_KEY to the .env file." : "ШІ-асистент не налаштований: додайте GEMINI_API_KEY у файл .env.",
        code: "ai_not_configured",
      });
    }
    const message = String(req.body.message || "").trim().slice(0, 4000);
    if (!message) return res.status(400).json({ error: en ? "Write a message." : "Напишіть повідомлення." });
    if (!chatAllowed(req.userEmail!)) {
      return res.status(429).json({ error: en ? "Too many requests. Wait a minute and try again." : "Забагато запитів. Зачекайте хвилину і спробуйте знову." });
    }

    const history = (Array.isArray(req.body.previousMessages) ? req.body.previousMessages : []).slice(-20);
    const contents = history
      .filter((m: any) => m && typeof m.text === "string" && m.text.trim())
      .map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text.slice(0, 4000) }] }));
    // Gemini вимагає, щоб історія починалась із повідомлення користувача.
    while (contents.length && contents[0].role !== "user") contents.shift();
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction: en ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT },
    });
    res.json({ text: response.text || (en ? "Could not produce an answer. Try rephrasing your question." : "Не вдалося сформувати відповідь. Спробуйте переформулювати запит.") });
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    const status = Number(error?.status) || 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error:
        status === 503 || status === 429
          ? en ? "The model is overloaded right now. Try again in a minute." : "Модель зараз перевантажена. Спробуйте за хвилину."
          : en ? "The AI could not answer. Try again." : "ШІ не зміг відповісти. Спробуйте ще раз.",
    });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Такого маршруту API не існує." }));

export default app;
