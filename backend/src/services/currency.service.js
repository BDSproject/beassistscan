const axios = require('axios');

// ── Taux de change ──────────────────────────────────────────
// Source : open.er-api.com (gratuit, sans clé). Fallback statique si l'API échoue.
// Cache en mémoire avec TTL de 24h pour éviter les limites de requêtes.

const RATE_CACHE = {};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Taux de repli approximatifs (1 <base> = <valeur> dans la devise cible)
// Mis à jour manuellement ; utilisés uniquement si l'API est indisponible.
const FALLBACK = {
  EUR: { EUR: 1, USD: 1.08, GBP: 0.85, CHF: 0.94, CAD: 1.47, AUD: 1.64 },
  USD: { USD: 1, EUR: 0.93, GBP: 0.79, CHF: 0.87, CAD: 1.36, AUD: 1.52 },
  GBP: { GBP: 1, EUR: 1.17, USD: 1.27, CHF: 1.11, CAD: 1.73, AUD: 1.93 },
};

async function fetchRates(base) {
  const now = Date.now();
  const cached = RATE_CACHE[base];
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) return cached.rates;

  try {
    const { data } = await axios.get(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
      timeout: 6000,
      headers: { 'User-Agent': 'BeassistScan/1.0' },
    });
    if (data && data.result === 'success' && data.rates) {
      RATE_CACHE[base] = { rates: data.rates, fetchedAt: now };
      return data.rates;
    }
  } catch (err) {
    console.warn(`⚠️ Taux de change indisponible pour ${base} (${err.message}) — fallback statique.`);
  }
  return FALLBACK[base] || { [base]: 1 };
}

// Convertit `amount` de `from` vers `to` (taux = valeur de 1 `to` en `from`).
async function convert(amount, from, to) {
  if (!amount || from === to) return amount;
  const rates = await fetchRates(to);
  const rate = rates[from];
  if (!rate || rate <= 0) return amount; // devise inconnue : pas de conversion
  return amount / rate;
}

// Convertit toutes les devises secondaires du rapport vers la devise principale
// et somme les totaux (CA, commissions, économies annuelles, transactions).
async function convertReportToPrimaryCurrency(reportData) {
  if (!reportData || !reportData.byCurrency || reportData.byCurrency.length <= 1) {
    return reportData;
  }

  const primary = reportData.currency || 'EUR';
  const rates = await fetchRates(primary);

  let totalSales = 0;
  let totalFees = 0;
  let annualSaving = 0;
  let rowCount = 0;

  const byCurrency = reportData.byCurrency.map((c) => {
    const rate = c.currency === primary ? 1 : rates[c.currency];
    const factor = rate && rate > 0 ? 1 / rate : 0; // c.currency → primary
    const convertedSales = c.totalSales * factor;
    const convertedFees = c.totalFees * factor;
    const convertedSaving = c.annualSaving * factor;

    totalSales += convertedSales;
    totalFees += convertedFees;
    annualSaving += convertedSaving;
    rowCount += c.rowCount;

    return {
      ...c,
      convertedTo: primary,
      convertedSales: Math.round(convertedSales * 100) / 100,
      convertedFees: Math.round(convertedFees * 100) / 100,
      convertedAnnualSaving: Math.round(convertedSaving * 100) / 100,
    };
  });

  return {
    ...reportData,
    // Totaux convertis et consolidés dans la devise principale
    totalSales: Math.round(totalSales * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    annualSaving: Math.round(annualSaving * 100) / 100,
    rowCount,
    byCurrency,
  };
}

module.exports = { convert, convertReportToPrimaryCurrency, fetchRates };
