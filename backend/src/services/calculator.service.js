function calculateFromTransactions(transactions,) {
  let totalSales = 0;
  let totalFees = 0;

  transactions.forEach(trx => {
    // Montant total de la vente (peut être dans trx.amount.value)
    if (trx.amount && trx.amount.value) {
      totalSales += parseFloat(trx.amount.value);
    }
    // Frais eBay (peut être dans trx.feeAmount.value)
    if (trx.feeAmount && trx.feeAmount.value) {
      totalFees += parseFloat(trx.feeAmount.value);
    }
  });

  // Estimation annuelle basée sur les 90 derniers jours
  const days = 90;
  const dailyFees = totalFees / days;
  const annualSaving = (dailyFees * 365).toFixed(2);

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    annualSaving: Math.round(annualSaving * 100) / 100,
    rowCount: transactions.length,
  };
}

module.exports = { calculateFromTransactions };