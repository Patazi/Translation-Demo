# User Ideas + Translation (Vercel)

This is a simple, static web app to collect user ideas and translate the description to English using a serverless API. Designed for Vercel Free tier.

## Features
- Language selector (English default; Español, Français, Deutsch, Tiếng Việt, 繁體中文, 简体中文)
- Inputs: EID/Contract ID, Subject, Description
- Translation output textarea (read-only)
- Attachment upload field
- Buttons: Translate, Submit

## Local development
```bash
# Serve locally with any static server
npx serve .
```

The serverless function expects Vercel runtime. When running on Vercel, it will be available at `/api/translate`.

## Deploy to Vercel
1. Push this project to a Git repo.
2. Import into Vercel and deploy.
3. Ensure the following files exist at the project root: `index.html`, `styles.css`, `app.js`, and folder `api/`.

## LivreTranslate integration
The app uses LibreTranslate. Default endpoint is `https://libretranslate.com/translate`. You can override via env var. API key is optional and sent in JSON body.

Env vars:
- `LIBRETRANSLATE_ENDPOINT` (default `https://libretranslate.com/translate`)
- `LIBRETRANSLATE_API_KEY` (optional; only needed if your instance requires a key)

Request body we send to LibreTranslate:
```json
{
  "q": "...text...",
  "source": "<sourceLanguage or auto>",
  "target": "en",
  "format": "text",
  "alternatives": 0,
  "api_key": "<optional>"
}
```

Response shape we use:
```json
{
  "translatedText": "..."
}
```

## Notes
- If the selected language is English, the app does not call the API; it directly mirrors the description to the translation box.
- Attachments are not uploaded anywhere in this demo. If you want to store them, connect an object storage (e.g., Vercel Blob, S3) and add an API route.
