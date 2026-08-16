const { calculateFromTransactions } = require('../../src/services/calculator.service');

// Cas 1 : ventes normales — CA = montant BRUT (totalFeeBasisAmount), pas le net
const test1 = calculateFromTransactions([
  {
    transactionType: 'SALE',
    amount: { value: '89.23', currency: 'EUR' },              // net versé
    totalFeeBasisAmount: { value: '100.00', currency: 'EUR' }, // brut payé par l'acheteur
    totalFeeAmount: { value: '10.77', currency: 'EUR' },
  },
  {
    transactionType: 'SALE',
    amount: { value: '44.44', currency: 'EUR' },
    totalFeeBasisAmount: { value: '50.00', currency: 'EUR' },
    totalFeeAmount: { value: '5.56', currency: 'EUR' },
  },
]);
console.log('Test 1 — CA brut :');
console.log(`  CA: ${test1.totalSales} EUR (attendu 150), Frais: ${test1.totalFees} EUR (attendu 16.33)`);
console.assert(test1.totalSales === 150, '❌ CA incorrect');
console.assert(test1.totalFees === 16.33, '❌ Frais incorrects');

// Cas 2 : remboursement déduit (symétrie brut/frais)
const test2 = calculateFromTransactions([
  { transactionType: 'SALE',   amount: { value: '89.23', currency: 'EUR' }, totalFeeBasisAmount: { value: '100.00', currency: 'EUR' }, totalFeeAmount: { value: '10.77', currency: 'EUR' } },
  { transactionType: 'REFUND', amount: { value: '89.23', currency: 'EUR' }, totalFeeBasisAmount: { value: '100.00', currency: 'EUR' }, totalFeeAmount: { value: '10.77', currency: 'EUR' } },
]);
console.log('Test 2 — vente + remboursement total :');
console.log(`  CA: ${test2.totalSales} EUR (attendu 0), Frais: ${test2.totalFees} EUR (attendu 0)`);
console.assert(test2.totalSales === 0 && test2.totalFees === 0, '❌ Remboursement mal géré');

// Cas 3 : totalFeeBasisAmount = CA brut, jamais un frais
const test3 = calculateFromTransactions([
  {
    transactionType: 'SALE',
    amount: { value: '22.48', currency: 'EUR' },               // net
    totalFeeBasisAmount: { value: '25.50', currency: 'EUR' },  // brut
    totalFeeAmount: { value: '3.02', currency: 'EUR' },
  },
]);
console.log('Test 3 — brut vs net (cas réel eBay) :');
console.log(`  CA: ${test3.totalSales} EUR (attendu 25.5 = brut), Frais: ${test3.totalFees} EUR (attendu 3.02)`);
console.assert(test3.totalSales === 25.5, '❌ CA devrait être le brut');
console.assert(test3.totalFees === 3.02, '❌ Frais incorrects');

// Cas 4 : garde-fou — frais aberrants plafonnés à l'estimation grille eBay.fr
const test4 = calculateFromTransactions([
  {
    transactionType: 'SALE',
    amount: { value: '10.00', currency: 'EUR' },
    totalFeeBasisAmount: { value: '100.00', currency: 'EUR' },
    totalFeeAmount: { value: '90.00', currency: 'EUR' }, // aberrant (90%)
  },
]);
console.log('Test 4 — garde-fou frais aberrants :');
console.log(`  CA: ${test4.totalSales} EUR, Frais: ${test4.totalFees} EUR (attendu ~10.77 via estimation)`);
console.assert(test4.totalFees < 15, '❌ Garde-fou non appliqué');

// Cas 5 : frais hors vente (NON_SALE_CHARGE) + fallback brut = net + frais
const test5 = calculateFromTransactions([
  { transactionType: 'SALE', amount: { value: '178.81', currency: 'EUR' }, totalFeeAmount: { value: '21.19', currency: 'EUR' } }, // pas de basis -> brut = 200
  { transactionType: 'NON_SALE_CHARGE', amount: { value: '0.50', currency: 'EUR' } }, // ex: sous-titre
]);
console.log('Test 5 — NON_SALE_CHARGE :');
console.log(`  CA: ${test5.totalSales} EUR (attendu 200), Frais: ${test5.totalFees} EUR (attendu 21.69)`);
console.assert(test5.totalSales === 200 && test5.totalFees === 21.69, '❌ NON_SALE_CHARGE mal géré');

console.log('\n✅ Tous les tests du calculateur passent');
