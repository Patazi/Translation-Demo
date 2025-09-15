// Vercel serverless function for translation via LibreTranslate
// Expects POST { sourceLanguage, targetLanguage, text } and returns { translatedText }

import type { VercelRequest, VercelResponse } from "@vercel/node";

type TranslateBody = {
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { sourceLanguage, targetLanguage, text } = (req.body || {}) as TranslateBody;
  if (!sourceLanguage || !targetLanguage || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (sourceLanguage === targetLanguage || sourceLanguage === "en" && targetLanguage === "en") {
    return res.status(200).json({ translatedText: text });
  }

  try {
    const endpoint = process.env.LIBRETRANSLATE_ENDPOINT || "https://libretranslate.com/translate";
    const apiKey = process.env.LIBRETRANSLATE_API_KEY; // optional
    const payload: Record<string, unknown> = {
      q: text,
      source: sourceLanguage || "auto",
      target: targetLanguage,
      format: "text",
      alternatives: 0,
    };
    if (apiKey) payload.api_key = apiKey;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(502).json({ error: "Translation upstream failed", detail: errText });
    }
    const data = await response.json() as { translatedText?: string };
    return res.status(200).json({ translatedText: data.translatedText || "" });
  } catch (e: any) {
    return res.status(500).json({ error: "Translation error", detail: e?.message || String(e) });
  }
}


