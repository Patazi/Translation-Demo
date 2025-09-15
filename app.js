const UI_TEXT = {
  en: {
    title: "User Ideas",
    subtitle: "Collect ideas and translate to English",
    language: "Language",
    eid: "EID / Contract ID",
    subject: "Subject",
    description: "Description",
    hintDescription: "Translation will target English",
    translation: "Translation (English)",
    attachment: "Attachment",
    btnTranslate: "Translate",
    btnSubmit: "Submit",
    submitting: "Submitting...",
    translating: "Translating...",
    ready: "",
    errorNoDescription: "Please enter a description first.",
  },
  es: {
    title: "Ideas de usuarios",
    subtitle: "Recopila ideas y tradúcelas al inglés",
    language: "Idioma",
    eid: "EID / ID de contrato",
    subject: "Asunto",
    description: "Descripción",
    hintDescription: "La traducción será al inglés",
    translation: "Traducción (inglés)",
    attachment: "Adjunto",
    btnTranslate: "Traducir",
    btnSubmit: "Enviar",
    submitting: "Enviando...",
    translating: "Traduciendo...",
    ready: "",
    errorNoDescription: "Ingrese una descripción primero.",
  },
  fr: {
    title: "Idées des utilisateurs",
    subtitle: "Collecter des idées et traduire en anglais",
    language: "Langue",
    eid: "EID / ID de contrat",
    subject: "Sujet",
    description: "Description",
    hintDescription: "La traduction sera en anglais",
    translation: "Traduction (anglais)",
    attachment: "Pièce jointe",
    btnTranslate: "Traduire",
    btnSubmit: "Envoyer",
    submitting: "Envoi...",
    translating: "Traduction...",
    ready: "",
    errorNoDescription: "Veuillez d'abord entrer une description.",
  },
  de: {
    title: "Ideen der Nutzer",
    subtitle: "Ideen sammeln und ins Englische übersetzen",
    language: "Sprache",
    eid: "EID / Vertrags-ID",
    subject: "Betreff",
    description: "Beschreibung",
    hintDescription: "Übersetzung erfolgt ins Englische",
    translation: "Übersetzung (Englisch)",
    attachment: "Anhang",
    btnTranslate: "Übersetzen",
    btnSubmit: "Senden",
    submitting: "Senden...",
    translating: "Übersetzen...",
    ready: "",
    errorNoDescription: "Bitte zuerst eine Beschreibung eingeben.",
  },
  vi: {
    title: "Ý tưởng của người dùng",
    subtitle: "Thu thập ý tưởng và dịch sang tiếng Anh",
    language: "Ngôn ngữ",
    eid: "EID / Mã hợp đồng",
    subject: "Chủ đề",
    description: "Mô tả",
    hintDescription: "Bản dịch sẽ sang tiếng Anh",
    translation: "Bản dịch (Tiếng Anh)",
    attachment: "Tệp đính kèm",
    btnTranslate: "Dịch",
    btnSubmit: "Gửi",
    submitting: "Đang gửi...",
    translating: "Đang dịch...",
    ready: "",
    errorNoDescription: "Vui lòng nhập mô tả trước.",
  },
  "zh-TW": {
    title: "使用者想法",
    subtitle: "收集想法並翻譯成英文",
    language: "語言",
    eid: "EID / 合約編號",
    subject: "主旨",
    description: "描述",
    hintDescription: "將翻譯為英文",
    translation: "翻譯（英文）",
    attachment: "附件",
    btnTranslate: "翻譯",
    btnSubmit: "送出",
    submitting: "送出中...",
    translating: "翻譯中...",
    ready: "",
    errorNoDescription: "請先輸入描述。",
  },
  "zh-CN": {
    title: "用户想法",
    subtitle: "收集想法并翻译成英文",
    language: "语言",
    eid: "EID / 合同编号",
    subject: "主题",
    description: "描述",
    hintDescription: "将翻译为英文",
    translation: "翻译（英文）",
    attachment: "附件",
    btnTranslate: "翻译",
    btnSubmit: "提交",
    submitting: "提交中...",
    translating: "翻译中...",
    ready: "",
    errorNoDescription: "请先输入描述。",
  },
};

const form = document.getElementById("idea-form");
const els = {
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  language: document.getElementById("language"),
  eid: document.getElementById("eid"),
  subject: document.getElementById("subject"),
  description: document.getElementById("description"),
  translation: document.getElementById("translation"),
  attachment: document.getElementById("attachment"),
  status: document.getElementById("status"),
  btnTranslate: document.getElementById("btn-translate"),
  btnSubmit: document.getElementById("btn-submit"),
  // labels
  labelLanguage: document.getElementById("label-language"),
  labelEid: document.getElementById("label-eid"),
  labelSubject: document.getElementById("label-subject"),
  labelDescription: document.getElementById("label-description"),
  labelAttachment: document.getElementById("label-attachment"),
  labelTranslation: document.getElementById("label-translation"),
  hintDescription: document.getElementById("hint-description"),
};

function applyLanguage(lang) {
  const t = UI_TEXT[lang] || UI_TEXT.en;
  els.title.textContent = t.title;
  els.subtitle.textContent = t.subtitle;
  els.labelLanguage.textContent = t.language;
  els.labelEid.textContent = t.eid;
  els.labelSubject.textContent = t.subject;
  els.labelDescription.textContent = t.description;
  els.hintDescription.textContent = t.hintDescription;
  els.labelTranslation.textContent = t.translation;
  els.labelAttachment.textContent = t.attachment;
  els.btnTranslate.textContent = t.btnTranslate;
  els.btnSubmit.textContent = t.btnSubmit;
}

applyLanguage(els.language.value);

els.language.addEventListener("change", () => applyLanguage(els.language.value));

// Map UI language values to LibreTranslate codes when needed
function normalizeSourceLangForApi(uiLang) {
  if (uiLang === "zh-TW" || uiLang === "zh-CN") return "zh";
  return uiLang;
}

async function populateLanguages() {
  // Show a temporary loading option
  els.language.innerHTML = "";
  const loading = document.createElement("option");
  loading.value = "en";
  loading.textContent = "Loading languages...";
  els.language.appendChild(loading);

  try {
    const res = await fetch("https://libretranslate.com/languages");
    if (!res.ok) throw new Error("Failed to load languages");
    const langs = await res.json(); // [{code:"en", name:"English"}, ...]

    // Build a set to avoid duplicates
    const seen = new Set();
    els.language.innerHTML = "";

    // Ensure English first
    const english = langs.find(l => l.code === "en") || { code: "en", name: "English" };
    const enOpt = document.createElement("option");
    enOpt.value = english.code;
    enOpt.textContent = english.name || "English";
    els.language.appendChild(enOpt);
    seen.add("en");

    // Insert others, skipping zh (we'll add variants below) and en which is added
    for (const l of langs) {
      if (!l || !l.code) continue;
      if (l.code === "en" || l.code === "zh" || seen.has(l.code)) continue;
      const opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.name || l.code;
      els.language.appendChild(opt);
      seen.add(l.code);
    }

    // Handle Chinese variants
    const zhTw = document.createElement("option");
    zhTw.value = "zh-TW";
    zhTw.textContent = "繁體中文";
    els.language.appendChild(zhTw);

    const zhCn = document.createElement("option");
    zhCn.value = "zh-CN";
    zhCn.textContent = "简体中文";
    els.language.appendChild(zhCn);

    // Default to English
    els.language.value = "en";
    applyLanguage("en");
  } catch (e) {
    // Fallback to a minimal set if fetch fails
    const fallback = [
      { code: "en", name: "English" },
      { code: "es", name: "Español" },
      { code: "fr", name: "Français" },
      { code: "de", name: "Deutsch" },
      { code: "vi", name: "Tiếng Việt" },
    ];
    els.language.innerHTML = "";
    for (const l of fallback) {
      const opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.name;
      els.language.appendChild(opt);
    }
    const zhTw = document.createElement("option");
    zhTw.value = "zh-TW";
    zhTw.textContent = "繁體中文";
    els.language.appendChild(zhTw);
    const zhCn = document.createElement("option");
    zhCn.value = "zh-CN";
    zhCn.textContent = "简体中文";
    els.language.appendChild(zhCn);
    els.language.value = "en";
    applyLanguage("en");
  }
}

populateLanguages();

async function translateToEnglish() {
  const lang = els.language.value;
  const text = els.description.value.trim();
  const t = UI_TEXT[lang] || UI_TEXT.en;
  if (!text) {
    els.status.textContent = t.errorNoDescription;
    return;
  }
  if (lang === "en") {
    els.translation.value = text;
    els.status.textContent = t.ready;
    return;
  }
  els.status.textContent = t.translating;
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceLanguage: normalizeSourceLangForApi(lang), targetLanguage: "en", text }),
    });
    if (!res.ok) throw new Error("Translate failed");
    const data = await res.json();
    els.translation.value = data.translatedText || "";
    els.status.textContent = t.ready;
  } catch (err) {
    console.error(err);
    els.status.textContent = "Translation failed.";
  }
}

els.btnTranslate.addEventListener("click", translateToEnglish);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lang = els.language.value;
  const t = UI_TEXT[lang] || UI_TEXT.en;
  els.status.textContent = t.submitting;

  if (!els.translation.value) {
    await translateToEnglish();
  }

  // In free-tier demo, we just echo the translation result on submit
  els.status.textContent = els.translation.value ? "Translated." : "No translation.";
});


