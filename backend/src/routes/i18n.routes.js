const express = require('express');
const router = express.Router();
const translations = require('../i18n/translations');

const SUPPORTED_LANGS = ['fr', 'en', 'es', 'de', 'it'];

/**
 * GET /api/i18n/:lang
 * Returns all translation keys for the requested language.
 * Falls back to 'fr' if lang is unsupported.
 */
router.get('/:lang', (req, res) => {
  const lang = SUPPORTED_LANGS.includes(req.params.lang) ? req.params.lang : 'fr';
  res.json(translations[lang] || translations['fr']);
});

/**
 * GET /api/i18n
 * Returns all languages at once (for preloading).
 */
router.get('/', (req, res) => {
  res.json(translations);
});

module.exports = router;
