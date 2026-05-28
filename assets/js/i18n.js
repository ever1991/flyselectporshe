/* Fly Select — i18n engine (ES/EN)
 * Marca textos con: data-i18n="key"           (textContent)
 *                  data-i18n-html="key"       (innerHTML — usar si hay <br>, <em>, <strong>, etc.)
 *                  data-i18n-attr="placeholder:key, aria-label:key2"
 * El diccionario vive en i18n-dict.js (window.I18N_DICT).
 */
(function () {
  const STORAGE_KEY = 'fs_lang';
  const SUPPORTED = ['es', 'en'];
  const DEFAULT_LANG = 'es';

  function detectLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG).toLowerCase();
    if (nav.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  function t(lang, key) {
    const dict = window.I18N_DICT || {};
    const bucket = dict[lang] || {};
    if (key in bucket) return bucket[key];
    const fallback = dict[DEFAULT_LANG] || {};
    return fallback[key] != null ? fallback[key] : key;
  }

  function applyI18n(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = t(lang, key);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(function (pair) {
        const parts = pair.split(':');
        if (parts.length !== 2) return;
        const attr = parts[0].trim();
        const key = parts[1].trim();
        if (attr && key) el.setAttribute(attr, t(lang, key));
      });
    });

    document.querySelectorAll('[data-i18n-toggle]').forEach(function (el) {
      el.textContent = lang === 'es' ? 'EN' : 'ES';
      el.setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
    });

    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    window.__FS_LANG__ = lang;
    applyI18n(lang);
  }

  function toggleLang() {
    const next = (window.__FS_LANG__ || detectLang()) === 'es' ? 'en' : 'es';
    setLang(next);
  }

  function init() {
    const lang = detectLang();
    window.__FS_LANG__ = lang;
    applyI18n(lang);
    document.querySelectorAll('[data-i18n-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleLang);
    });
  }

  window.FSI18n = { setLang: setLang, toggleLang: toggleLang, apply: applyI18n, get: function () { return window.__FS_LANG__; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
