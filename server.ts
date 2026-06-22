import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mnsqbsxazooykgzmjzug.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || 'sb_secret_7xJyw_T-VFh2VYCar1WD9w_0FM7fsiE';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function checkIsAdmin(email: string) {
  if (!email) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/admins?select=email&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!response.ok) return false;
    const result = await response.json();
    if (result.code === 'PGRST205') return false;
    return result.length > 0;
  } catch (e) {
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/is-admin", async (req, res) => {
    const email = req.query.email as string;
    const isAdmin = await checkIsAdmin(email);
    res.json({ isAdmin });
  });

  app.get("/api/ghosts", async (req, res) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ghosts?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        throw new Error(`Supabase error: ${response.statusText}`);
      }
      const result = await response.json();
      
      const mappedGhosts = result.map((row: any) => ({
        name: row.Name || row.name,
        huntThreshold: row.HuntThreshold || row.huntthreshold || row.hunt_threshold,
        evidences: row.Evidences || row.evidences,
        description: row.Description || row.description,
        strength: row.Strength || row.strength,
        weakness: row.Weakness || row.weakness,
        testToVerify: row.TestToVerify || row.testtoverify || row.test
      }));
      res.json(mappedGhosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch ghosts" });
    }
  });

  app.post("/api/ghosts", async (req, res) => {
    try {
      const { adminEmail, ghost } = req.body;
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

      const insertData = {
        name: ghost.name,
        hunt_threshold: ghost.huntThreshold,
        evidences: ghost.evidences,
        description: ghost.description,
        strength: ghost.strength,
        weakness: ghost.weakness,
        test: ghost.testToVerify
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/ghosts`, {
        method: "POST",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insertData)
      });

      if (!response.ok) throw new Error(await response.text());
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/ghosts/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { adminEmail, ghost } = req.body;
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

      const updateData = {
        name: ghost.name,
        hunt_threshold: ghost.huntThreshold,
        evidences: ghost.evidences,
        description: ghost.description,
        strength: ghost.strength,
        weakness: ghost.weakness,
        test: ghost.testToVerify
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/ghosts?name=eq.${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error(await response.text());
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/ghosts/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const adminEmail = req.query.adminEmail as string;
      console.log(`Deleting ghost: ${name} by ${adminEmail}`);
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) {
        console.log(`Delete failed: not admin`);
        return res.status(403).json({ error: "Forbidden" });
      }

      console.log(`Calling Supabase: ${SUPABASE_URL}/rest/v1/ghosts?name=eq.${encodeURIComponent(name)}`);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ghosts?name=eq.${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Supabase error:`, errText);
        throw new Error(errText);
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Delete ghost caught error:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/equipment", async (req, res) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/equipment?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        throw new Error(`Supabase error: ${response.statusText}`);
      }
      const result = await response.json();
      
      const mappedEquipment = result.map((row: any) => ({
        name: row.Name || row.name,
        icon: row.Icon || row.icon,
        imageName: row.ImageName || row.imagename || row.image_url,
        description: row.Description || row.description
      }));
      res.json(mappedEquipment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const { adminEmail, equipment } = req.body;
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

      const insertData = {
        name: equipment.name,
        icon: equipment.icon,
        image_url: equipment.imageName,
        description: equipment.description
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/equipment`, {
        method: "POST",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insertData)
      });

      if (!response.ok) throw new Error(await response.text());
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/equipment/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { adminEmail, equipment } = req.body;
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

      const updateData = {
        name: equipment.name,
        icon: equipment.icon,
        image_url: equipment.imageName,
        description: equipment.description
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/equipment?name=eq.${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error(await response.text());
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/equipment/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const adminEmail = req.query.adminEmail as string;
      const isAdmin = await checkIsAdmin(adminEmail);
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

      const response = await fetch(`${SUPABASE_URL}/rest/v1/equipment?name=eq.${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      });

      if (!response.ok) throw new Error(await response.text());
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API route for chat assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, previousMessages } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Convert previous generic messages to Gemini format
      // In the frontend we send `{ role: 'user' | 'assistant', text: string }`
      const chatOptions = {
        model: "gemini-3.5-flash",
        config: {
          systemInstruction:
            "Ти — ШІ-асистент(експерт з гри Phasmophobia), який допомагає гравцям створювати власні(кастомні) складності. Знаєш всі механіки, привидів та предмети. Давай короткі, зрозумілі та корисні поради щодо налаштування множників та складності. Спілкуйся українською мовою.",
        },
      };

      const chat = ai.chats.create(chatOptions);

      // Replay previous messages
      if (previousMessages && Array.isArray(previousMessages)) {
        for (const msg of previousMessages) {
          if (msg.role === "user") {
            await chat.sendMessage({ message: msg.text });
          } else {
            // we simulate assistant messages if needed, but SDK might not easily support injecting past assistant messages directly in `chat`.
            // Instead, we can just use generateContent with history.
          }
        }
      }

      // Since the simple `chat` API might not easily take history like this without actually sending,
      // Let's use it by just sending the message (if history is not strictly needed for this simple impl) or use `generateContent` with structure.
      // Wait, let me use `GenerateContent` with `contents` array to pass the full history.

      const contents = (previousMessages || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction:
            "Ти — Експерт з Phasmophobia, який допомагає гравцю створити ідеальну кастомну складність під його бажання. Ти знаєш як працюють всі модифікатори(початковий глузд, відновлення глузду, швидкість привидів, кількість доказів, укриття тощо). Допомагай збалансувати множник щоб отримати максимальну вигоду, або створити челенджі (наприклад, 0 доказів). Форматуй результати красиво з markdown. Спілкуйся українською мовою.",
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
