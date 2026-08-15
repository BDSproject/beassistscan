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

function calculateFromTransactions(transactions) {
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
    // Montant de vente (champs possibles selon endpoint eBay)
    const amount =
      readMoneyValue(trx.amount) ||
      readMoneyValue(trx.totalAmount);

    const currency =
      readCurrency(trx.amount) ||
      readCurrency(trx.totalAmount) ||
      readCurrency(trx.totalFeeBasisAmount) ||
      readCurrency(trx.totalFeeAmount) ||
      readCurrency(trx.feeAmount) ||
      'EUR';

    const bucket = getBucket(currency);
    bucket.totalSales += amount;
    bucket.rowCount += 1;

    // Frais eBay : plusieurs formats possibles dans Finances API
    let fee = 0;

    if (trx.totalFeeBasisAmount) {
      fee = Math.abs(readMoneyValue(trx.totalFeeBasisAmount));
    } else if (trx.totalFeeAmount) {
      fee = Math.abs(readMoneyValue(trx.totalFeeAmount));
    } else if (trx.feeAmount) {
      fee = Math.abs(readMoneyValue(trx.feeAmount));
    } else if (Array.isArray(trx.marketplaceFees) && trx.marketplaceFees.length > 0) {
      fee = trx.marketplaceFees.reduce((sum, f) => {
        const v = Math.abs(readMoneyValue(f.amount) || readMoneyValue(f.feeAmount));
        return sum + v;
      }, 0);
    }

    bucket.totalFees += fee;
  });

  // Estimation annuelle par devise (basée sur les 90 derniers jours)
  const days = 90;
  const currencies = Object.values(byCurrency).map(b => {
    const annualSaving = (b.totalFees / days) * 365;
    return {
      currency: b.currency,
      totalSales: Math.round(b.totalSales * 100) / 100,
      totalFees: Math.round(b.totalFees * 100) / 100,
      annualSaving: Math.round(annualSaving * 100) / 100,
      rowCount: b.rowCount,
    };
  });

  // Tri : devise dominante (plus gros CA) en premier
  currencies.sort((a, b) => b.totalSales - a.totalSales);

  // Devise principale = celle avec le plus de ventes (EUR par défaut)
  const primary = currencies[0] || {
    currency: 'EUR', totalSales: 0, totalFees: 0, annualSaving: 0, rowCount: 0,
  };

  return {
    // Chiffres principaux = devise dominante (affichés dans les cartes du PDF)
    currency: primary.currency,
    totalSales: primary.totalSales,
    totalFees: primary.totalFees,
    annualSaving: primary.annualSaving,
    rowCount: transactions.length,
    // Détail complet par devise
    byCurrency: currencies,
  };
}

module.exports = { calculateFromTransactions };