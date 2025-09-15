// Vercel serverless function for translation via Microsoft Translator (Azure)
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
    const endpointBase = process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
    const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    if (!subscriptionKey || !region) {
      return res.status(500).json({ error: "Missing Azure Translator credentials", detail: "Set AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION" });
    }

    const params = new URLSearchParams({ "api-version": "3.0", to: targetLanguage });
    if (sourceLanguage && sourceLanguage !== "auto") {
      params.set("from", sourceLanguage);
    }

    const url = `${endpointBase}/translate?${params.toString()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Ocp-Apim-Subscription-Region": region,
      },
      body: JSON.stringify([{ Text: text }]),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(502).json({ error: "Translation upstream failed", detail: errText });
    }
    const data = await response.json() as Array<{ translations?: Array<{ text: string }> }>;
    const translated = data?.[0]?.translations?.[0]?.text || "";
    return res.status(200).json({ translatedText: translated });
  } catch (e: any) {
    return res.status(500).json({ error: "Translation error", detail: e?.message || String(e) });
  }
}


