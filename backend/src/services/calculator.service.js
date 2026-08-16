function toNumber(value) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
}

function readMoneyValue(obj) {
  if (!obj) return 0;
  return toNumber(obj.value);
}

function readCurrency(obj) {
  if (!obj || !obj.currency) return null;
  return String(obj.currency).toUpperCase();
}

function calculateFromTransactions(transactions, options = {}) {
  // Forfait gratuit : on ajoute par defaut une estimation de 2% d'Annonces
  // sponsorisees (Promoted Listings Standard) car ces frais ne sont pas
  // toujours detailles dans les transactions de l'API Finances.
  const sponsoredAdsRate = typeof options.sponsoredAdsRate === 'number' ? options.sponsoredAdsRate : 0;

  // Regroupement par devise : { EUR: {...}, USD: {...} }
  const byCurrency = {};

  const getBucket = (currency) => {
    const cur = currency || 'EUR';
    if (!byCurrency[cur]) {
      byCurrency[cur] = { currency: cur, totalSales: 0, totalFees: 0, rowCount: 0 };
    }
    return byCurrency[cur];
  };

  transactions.forEach(trx => {
    // Type de transaction : on ne compte comme vente que les SALE.
    // REFUND est déduit, les autres types (NON_SALE_CHARGE, DISPUTE, SHIPPING_LABEL,
    // TRANSFER, ADJUSTMENT...) ne sont pas du chiffre d'affaires.
    const type = String(trx.transactionType || 'SALE').toUpperCase();

    const currency =
      readCurrency(trx.amount) ||
      readCurrency(trx.totalAmount) ||
      readCurrency(trx.totalFeeAmount) ||
      readCurrency(trx.feeAmount) ||
      'EUR';

    const bucket = getBucket(currency);

    // ⚠️ Dans l'API Finances, `amount` d'une SALE est le montant NET versé au
    // vendeur (après déduction des frais). Le vrai CA (montant payé par
    // l'acheteur) est `totalFeeBasisAmount`. À défaut : net + frais.
    const netAmount = Math.abs(
      readMoneyValue(trx.amount) ||
      readMoneyValue(trx.totalAmount)
    );

    // Frais eBay : totalFeeAmount est le champ officiel de l'API Finances.
    let fee = 0;
    if (trx.totalFeeAmount) {
      fee = Math.abs(readMoneyValue(trx.totalFeeAmount));
    } else if (trx.feeAmount) {
      fee = Math.abs(readMoneyValue(trx.feeAmount));
    } else if (Array.isArray(trx.marketplaceFees) && trx.marketplaceFees.length > 0) {
      fee = trx.marketplaceFees.reduce((sum, f) => {
        const v = Math.abs(readMoneyValue(f.amount) || readMoneyValue(f.feeAmount));
        return sum + v;
      }, 0);
    }

    // Montant BRUT de la vente (CA réel boutique)
    const grossAmount = trx.totalFeeBasisAmount
      ? Math.abs(readMoneyValue(trx.totalFeeBasisAmount))
      : netAmount + fee;

    if (type === 'SALE') {
      bucket.totalSales += grossAmount;
      bucket.totalFees += fee;
      bucket.rowCount += 1;
    } else if (type === 'REFUND') {
      // Un remboursement réduit le CA ; les frais remboursés (avoirs) réduisent les frais
      bucket.totalSales -= grossAmount;
      bucket.totalFees -= fee;
    } else if (type === 'NON_SALE_CHARGE') {
      // Frais hors vente (ex: frais d'annonces, options de mise en vente, boutique)
      bucket.totalFees += netAmount;
    }
    // Autres types (TRANSFER, SHIPPING_LABEL, DISPUTE, ADJUSTMENT...) : ignorés du CA
  });

  // Garde-fou de cohérence : d'après la grille eBay.fr, les commissions représentent
  // ~10% + 0,42% + 0,35 EUR/commande (+ éventuels frais internationaux ~2-4%).
  // Si les frais calculés dépassent 50% du CA, c'est un signe de données anormales :
  // on plafonne avec une estimation basée sur la grille officielle eBay.fr.
  Object.values(byCurrency).forEach(b => {
    if (b.totalSales > 0 && b.totalFees > b.totalSales * 0.5) {
      const estimated = b.totalSales * 0.1042 + b.rowCount * 0.35;
      console.warn(
        `⚠️ Frais incohérents détectés (${b.totalFees.toFixed(2)} ${b.currency} pour ${b.totalSales.toFixed(2)} ${b.currency} de CA). ` +
        `Remplacement par l'estimation grille eBay.fr : ${estimated.toFixed(2)} ${b.currency}`
      );
      b.totalFees = estimated;
    }
    // Ne jamais retourner de valeurs négatives
    b.totalSales = Math.max(0, b.totalSales);
    b.totalFees = Math.max(0, b.totalFees);
  });

  // Estimation annuelle par devise (basée sur les 90 derniers jours)
  const days = 90;
  const currencies = Object.values(byCurrency).map(b => {
    // Estimation Annonces sponsorisées (ex: 2% du CA pour le forfait gratuit)
    const sponsoredAdsEstimate = Math.round(b.totalSales * sponsoredAdsRate * 100) / 100;
    const totalFees = b.totalFees + sponsoredAdsEstimate;
    const annualSaving = (totalFees / days) * 365;
    return {
      currency: b.currency,
      totalSales: Math.round(b.totalSales * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      sponsoredAdsEstimate,
      annualSaving: Math.round(annualSaving * 100) / 100,
      rowCount: b.rowCount,
    };
  });

  // Tri : devise dominante (plus gros CA) en premier
  currencies.sort((a, b) => b.totalSales - a.totalSales);

  // Devise principale = celle avec le plus de ventes (EUR par défaut)
  const primary = currencies[0] || {
    currency: 'EUR', totalSales: 0, totalFees: 0, sponsoredAdsEstimate: 0, annualSaving: 0, rowCount: 0,
  };

  return {
    // Chiffres principaux = devise dominante (affichés dans les cartes du PDF)
    currency: primary.currency,
    totalSales: primary.totalSales,
    totalFees: primary.totalFees,
    sponsoredAdsEstimate: primary.sponsoredAdsEstimate || 0,
    sponsoredAdsRate,
    annualSaving: primary.annualSaving,
    rowCount: transactions.length,
    // Détail complet par devise
    byCurrency: currencies,
  };
}

module.exports = { calculateFromTransactions };