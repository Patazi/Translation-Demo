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

## Microsoft Translator (Azure) integration
The backend calls Microsoft Translator. Configure credentials via environment variables.

Env vars:
- `AZURE_TRANSLATOR_KEY` (required)
- `AZURE_TRANSLATOR_REGION` (required; e.g., `eastus`)
- `AZURE_TRANSLATOR_ENDPOINT` (optional; default `https://api.cognitive.microsofttranslator.com`)

How it works:
- Server sends POST to `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=en[&from=xx]`
- Headers: `Ocp-Apim-Subscription-Key`, `Ocp-Apim-Subscription-Region`, `Content-Type: application/json`
- Body: `[{ "Text": "..." }]`
- Response used: `res[0].translations[0].text`

Local dev without Vercel CLI:
```bash
export AZURE_TRANSLATOR_KEY=YOUR_KEY
export AZURE_TRANSLATOR_REGION=YOUR_REGION
node dev-server.mjs
# open http://localhost:8080
```

Vercel:
1. Add env vars in Project Settings → Environment Variables
2. Deploy; function `api/translate.ts` will use them automatically

## Notes
- If the selected language is English, the app does not call the API; it directly mirrors the description to the translation box.
- Attachments are not uploaded anywhere in this demo. If you want to store them, connect an object storage (e.g., Vercel Blob, S3) and add an API route.
