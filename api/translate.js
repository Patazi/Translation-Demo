// Microsoft Translator (Azure) - Vercel Serverless Function (JavaScript)
// Expects POST { sourceLanguage, targetLanguage, text } and returns { translatedText }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { sourceLanguage, targetLanguage, text } = req.body || {};
  if (!sourceLanguage || !targetLanguage || typeof text !== 'string') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  if (sourceLanguage === targetLanguage || (sourceLanguage === 'en' && targetLanguage === 'en')) {
    res.status(200).json({ translatedText: text });
    return;
  }

  try {
    const endpointBase = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
    const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    if (!subscriptionKey || !region) {
      res.status(500).json({ error: 'Missing Azure Translator credentials', detail: 'Set AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION' });
      return;
    }

    const params = new URLSearchParams({ 'api-version': '3.0', to: targetLanguage });
    if (sourceLanguage && sourceLanguage !== 'auto') {
      params.set('from', sourceLanguage);
    }

    const url = `${endpointBase}/translate?${params.toString()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': region,
      },
      body: JSON.stringify([{ Text: text }]),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      res.status(502).json({ error: 'Translation upstream failed', detail: errText });
      return;
    }
    const data = await response.json();
    const translated = data && data[0] && data[0].translations && data[0].translations[0] && data[0].translations[0].text || '';
    res.status(200).json({ translatedText: translated });
  } catch (e) {
    res.status(500).json({ error: 'Translation error', detail: e && e.message ? e.message : String(e) });
  }
};


