import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const PUBLIC_DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...headers,
  });
  res.end(body);
}

async function handleTranslate(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }), { 'Content-Type': 'application/json' });

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { sourceLanguage, targetLanguage, text } = JSON.parse(body || '{}');
      if (!sourceLanguage || !targetLanguage || typeof text !== 'string') {
        return send(res, 400, JSON.stringify({ error: 'Invalid request body' }), { 'Content-Type': 'application/json' });
      }
      if (sourceLanguage === targetLanguage || (sourceLanguage === 'en' && targetLanguage === 'en')) {
        return send(res, 200, JSON.stringify({ translatedText: text }), { 'Content-Type': 'application/json' });
      }

      const endpointBase = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
      const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
      const region = process.env.AZURE_TRANSLATOR_REGION;
      if (!subscriptionKey || !region) {
        return send(res, 500, JSON.stringify({ error: 'Missing Azure Translator credentials', detail: 'Set AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION' }), { 'Content-Type': 'application/json' });
      }
      const params = new URLSearchParams({ 'api-version': '3.0', to: targetLanguage });
      if (sourceLanguage && sourceLanguage !== 'auto') params.set('from', sourceLanguage);
      const urlTranslate = `${endpointBase}/translate?${params.toString()}`;

      const upstream = await fetch(urlTranslate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Ocp-Apim-Subscription-Region': region,
        },
        body: JSON.stringify([{ Text: text }]),
      });
      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => '');
        return send(res, 502, JSON.stringify({ error: 'Translation upstream failed', detail: errText }), { 'Content-Type': 'application/json' });
      }
      const data = await upstream.json();
      const translated = data?.[0]?.translations?.[0]?.text || '';
      return send(res, 200, JSON.stringify({ translatedText: translated }), { 'Content-Type': 'application/json' });
    } catch (e) {
      return send(res, 500, JSON.stringify({ error: 'Translation error', detail: e?.message || String(e) }), { 'Content-Type': 'application/json' });
    }
  });
}

function serveStatic(req, res) {
  let pathname = url.parse(req.url).pathname || '/';
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return send(res, 403, 'Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (pathname.endsWith('/api/translate')) return handleTranslate(req, res);
      return send(res, 404, 'Not Found');
    }
    const ext = path.extname(filePath);
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;
  if (method === 'OPTIONS') return send(res, 204, '');
  if (reqUrl.startsWith('/api/translate')) return handleTranslate(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});


