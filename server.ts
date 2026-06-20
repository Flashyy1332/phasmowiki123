import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
        model: "gemini-3.5-flash",
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
