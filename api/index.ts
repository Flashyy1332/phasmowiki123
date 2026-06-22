import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { pool } from "../src/db/index.js";

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.get("/api/ghosts", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ghosts');
    
    const mappedGhosts = result.rows.map((row: any) => ({
      name: row.Name || row.name,
      huntThreshold: row.HuntThreshold || row.huntthreshold,
      evidences: row.Evidences || row.evidences,
      description: row.Description || row.description,
      strength: row.Strength || row.strength,
      weakness: row.Weakness || row.weakness,
      testToVerify: row.TestToVerify || row.testtoverify
    }));
    res.json(mappedGhosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ghosts" });
  }
});

app.get("/api/equipment", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment');
    
    const mappedEquipment = result.rows.map((row: any) => ({
      name: row.Name || row.name,
      icon: row.Icon || row.icon,
      imageName: row.ImageName || row.imagename,
      description: row.Description || row.description
    }));
    res.json(mappedEquipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, previousMessages } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

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

export default app;
