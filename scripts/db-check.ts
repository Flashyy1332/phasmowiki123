/**
 * Перевірка підключення до бази: npm run db:check
 * Читає .env і по черзі перевіряє URL, ключі та кожну таблицю.
 */
import * as dotenv from "dotenv";

dotenv.config();

const url = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const pub = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

const ok = (s: string) => console.log(`  [OK]   ${s}`);
const bad = (s: string) => console.log(`  [FAIL] ${s}`);
const hint = (s: string) => console.log(`         -> ${s}`);

async function probe(table: string, key: string) {
  try {
    const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text();
    if (r.ok) {
      const rows = JSON.parse(text);
      ok(`${table}: ${rows.length} записів`);
      if (rows.length === 0) hint("Таблиця порожня (або RLS ховає рядки). Заповніть її кнопкою «Заповнити базу» в адмін-панелі.");
      return true;
    }
    bad(`${table}: HTTP ${r.status} ${text.slice(0, 160)}`);
    if (r.status === 401) hint("Ключ недійсний або відкликаний. Створіть новий: Supabase -> Project Settings -> API Keys.");
    else if (r.status === 404 || text.includes("PGRST205")) hint("Таблиці немає. Виконайте supabase/schema.sql у SQL Editor.");
    else if (r.status >= 500) hint("Проєкт недоступний. Перевірте в панелі Supabase, чи він не на паузі (Restore project).");
    return false;
  } catch (e: any) {
    bad(`${table}: ${e?.cause?.code || e?.message || e}`);
    hint("Немає з'єднання. Перевірте SUPABASE_URL та інтернет; проєкт міг бути видалений або призупинений.");
    return false;
  }
}

async function main() {
  console.log("\nPhasmoWiki — перевірка бази даних\n");
  if (!url) {
    bad("SUPABASE_URL не задано");
    hint("Скопіюйте .env.example у .env і заповніть значення.");
    process.exit(1);
  }
  ok(`SUPABASE_URL = ${url}`);
  if (secret) ok("SUPABASE_SECRET_KEY задано (читання і запис)");
  else bad("SUPABASE_SECRET_KEY не задано — адмін-панель не зможе зберігати зміни");
  if (pub) ok("SUPABASE_PUBLISHABLE_KEY задано");
  const key = secret || pub;
  if (!key) {
    bad("Немає жодного ключа Supabase");
    process.exit(1);
  }
  console.log(`\nТаблиці (ключ: ${secret ? "secret" : "publishable"}):`);
  const results = [await probe("ghosts", key), await probe("equipment", key), await probe("admins", key)];
  console.log(results.every(Boolean) ? "\nБаза працює.\n" : "\nЄ проблеми — див. підказки вище.\n");
  process.exit(results.every(Boolean) ? 0 : 1);
}

main();
