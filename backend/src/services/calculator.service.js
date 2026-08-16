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

// Types de frais publicitaires (Annonces sponsorisées / Promoted Listings)
const AD_FEE_TYPES = new Set(['AD_FEE', 'PROMOTED_LISTINGS_FEE', 'PLA_FEE']);

function isAdFeeType(feeType) {
  return AD_FEE_TYPES.has(String(feeType || '').toUpperCase());
}

function calculateFromTransactions(transactions, options = {}) {
  // Estimation d'Annonces sponsorisées (ex: 2% pour le forfait gratuit).
  // Utilisée UNIQUEMENT si aucun frais publicitaire réel n'est détecté
  // dans les transactions (feeType AD_FEE).
  const sponsoredAdsRate = typeof options.sponsoredAdsRate === 'number' ? options.sponsoredAdsRate : 0;

  // Regroupement par devise : { EUR: {...}, USD: {...} }
  const byCurrency = {};

  const getBucket = (currency) => {
    const cur = currency || 'EUR';
    if (!byCurrency[cur]) {
      byCurrency[cur] = {
        currency: cur,
        totalSales: 0,       // CA brut = produit + frais de port (base de commission eBay)
        totalShipping: 0,    // Part frais de port du CA (si détaillée par l'API)
        totalFees: 0,        // Commissions eBay (hors publicité)
        adFees: 0,           // Frais Annonces sponsorisées RÉELS (AD_FEE)
        rowCount: 0,
      };
    }
    return byCurrency[cur];
  };

  // Sépare les frais d'une transaction : commissions eBay vs frais publicitaires
  const splitFees = (trx) => {
    let ebayFee = 0;
    let adFee = 0;

    if (Array.isArray(trx.marketplaceFees) && trx.marketplaceFees.length > 0) {
      // Détail disponible : on ventile par feeType
      trx.marketplaceFees.forEach((f) => {
        const v = Math.abs(readMoneyValue(f.amount) || readMoneyValue(f.feeAmount));
        if (isAdFeeType(f.feeType)) adFee += v;
        else ebayFee += v;
      });
      // Cohérence : si totalFeeAmount officiel dépasse la somme ventilée,
      // on impute la différence aux commissions eBay
      const officialTotal = Math.abs(readMoneyValue(trx.totalFeeAmount));
      if (officialTotal > 0 && officialTotal > ebayFee + adFee) {
        ebayFee += officialTotal - (ebayFee + adFee);
      }
    } else if (trx.totalFeeAmount) {
      ebayFee = Math.abs(readMoneyValue(trx.totalFeeAmount));
    } else if (trx.feeAmount) {
      ebayFee = Math.abs(readMoneyValue(trx.feeAmount));
    }

    // feeType porté directement par la transaction (cas NON_SALE_CHARGE AD_FEE)
    if (isAdFeeType(trx.feeType)) {
      adFee += ebayFee;
      ebayFee = 0;
    }

    return { ebayFee, adFee };
  };

  // Frais de port facturés à l'acheteur (si le détail ligne de commande existe)
  const readShipping = (trx) => {
    if (!Array.isArray(trx.orderLineItems)) return 0;
    return trx.orderLineItems.reduce((sum, li) => {
      const s =
        Math.abs(readMoneyValue(li.shippingCost)) ||
        Math.abs(readMoneyValue(li.deliveryCost && li.deliveryCost.shippingCost));
      return sum + s;
    }, 0);
  };

  transactions.forEach(trx => {
    // Type de transaction : on ne compte comme vente que les SALE.
    // REFUND est déduit, les autres types (DISPUTE, SHIPPING_LABEL,
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
    // l'acheteur = produit + FRAIS DE PORT) est `totalFeeBasisAmount` :
    // c'est précisément la base sur laquelle eBay applique ses commissions
    // (eBay commissionne aussi les frais de port). À défaut : net + frais.
    const netAmount = Math.abs(
      readMoneyValue(trx.amount) ||
      readMoneyValue(trx.totalAmount)
    );

    const { ebayFee, adFee } = splitFees(trx);
    const fee = ebayFee;
    const shipping = readShipping(trx);

    // Montant BRUT de la vente (CA réel boutique, frais de port inclus)
    const grossAmount = trx.totalFeeBasisAmount
      ? Math.abs(readMoneyValue(trx.totalFeeBasisAmount))
      : netAmount + fee + adFee;

    if (type === 'SALE') {
      bucket.totalSales += grossAmount;
      bucket.totalShipping += shipping;
      bucket.totalFees += fee;
      bucket.adFees += adFee;
      bucket.rowCount += 1;
    } else if (type === 'REFUND') {
      // Un remboursement réduit le CA ; les frais remboursés (avoirs) réduisent les frais
      bucket.totalSales -= grossAmount;
      bucket.totalShipping -= shipping;
      bucket.totalFees -= fee;
      bucket.adFees -= adFee;
    } else if (type === 'NON_SALE_CHARGE') {
      // Frais hors vente : Annonces sponsorisées (AD_FEE), options de mise
      // en vente, abonnement boutique...
      if (adFee > 0 || isAdFeeType(trx.feeType)) {
        bucket.adFees += adFee > 0 ? adFee : netAmount;
      } else {
        bucket.totalFees += netAmount;
      }
    }
    // Autres types (TRANSFER, SHIPPING_LABEL, DISPUTE, ADJUSTMENT...) : ignorés du CA
  });

  // Garde-fou de cohérence : d'après la grille eBay.fr, les commissions
  // représentent ~10% + 0,42% + 0,35 EUR/commande, appliquées sur le montant
  // TOTAL payé par l'acheteur (produit + FRAIS DE PORT). Si les frais calculés
  // dépassent 50% du CA, données anormales : on plafonne avec l'estimation
  // grille officielle (le CA incluant déjà le port, la base est correcte).
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
    b.totalShipping = Math.max(0, b.totalShipping);
    b.totalFees = Math.max(0, b.totalFees);
    b.adFees = Math.max(0, b.adFees);
  });

  // Estimation annuelle par devise (basée sur les 90 derniers jours)
  const days = 90;
  const currencies = Object.values(byCurrency).map(b => {
    // Annonces sponsorisées : frais RÉELS détectés (AD_FEE) en priorité,
    // sinon estimation (ex: 2% du CA pour le forfait gratuit).
    const hasRealAdFees = b.adFees > 0;
    const sponsoredAds = hasRealAdFees
      ? Math.round(b.adFees * 100) / 100
      : Math.round(b.totalSales * sponsoredAdsRate * 100) / 100;

    const totalFees = b.totalFees + sponsoredAds;
    const annualSaving = (totalFees / days) * 365;
    return {
      currency: b.currency,
      totalSales: Math.round(b.totalSales * 100) / 100,
      totalShipping: Math.round(b.totalShipping * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      ebayFees: Math.round(b.totalFees * 100) / 100,
      sponsoredAdsEstimate: sponsoredAds,
      sponsoredAdsIsReal: hasRealAdFees,
      annualSaving: Math.round(annualSaving * 100) / 100,
      rowCount: b.rowCount,
    };
  });

  // Tri : devise dominante (plus gros CA) en premier
  currencies.sort((a, b) => b.totalSales - a.totalSales);

  // Devise principale = celle avec le plus de ventes (EUR par défaut)
  const primary = currencies[0] || {
    currency: 'EUR', totalSales: 0, totalShipping: 0, totalFees: 0, ebayFees: 0,
    sponsoredAdsEstimate: 0, sponsoredAdsIsReal: false, annualSaving: 0, rowCount: 0,
  };

  return {
    // Chiffres principaux = devise dominante (affichés dans les cartes du PDF)
    currency: primary.currency,
    totalSales: primary.totalSales,
    totalShipping: primary.totalShipping || 0,
    totalFees: primary.totalFees,
    ebayFees: primary.ebayFees || 0,
    sponsoredAdsEstimate: primary.sponsoredAdsEstimate || 0,
    sponsoredAdsIsReal: primary.sponsoredAdsIsReal || false,
    sponsoredAdsRate,
    annualSaving: primary.annualSaving,
    rowCount: transactions.length,
    // Détail complet par devise
    byCurrency: currencies,
  };
}

module.exports = { calculateFromTransactions };
