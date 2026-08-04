function toNumber(value) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
}

function readMoneyValue(obj) {
  if (!obj) return 0;
  return toNumber(obj.value);
}

function calculateFromTransactions(transactions,) {
  let totalSales = 0;
  let totalFees = 0;

  transactions.forEach(trx => {
    // Montant de vente (champs possibles selon endpoint eBay)
    const amount =
      readMoneyValue(trx.amount) ||
      readMoneyValue(trx.totalAmount);

    totalSales += amount;

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

    totalFees += fee;
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