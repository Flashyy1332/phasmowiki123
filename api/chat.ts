import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { message, previousMessages } = req.body || {};

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

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}
