const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { generateReport } = require('../../src/services/pdf.service');
const { calculateFromTransactions } = require('../../src/services/calculator.service');

const txs = [
  { amount: { value: '100.00', currency: 'EUR' }, feeAmount: { value: '13.00', currency: 'EUR' } },
  { amount: { value: '50.00', currency: 'EUR' }, feeAmount: { value: '6.50', currency: 'EUR' } },
  { amount: { value: '80.00', currency: 'GBP' }, feeAmount: { value: '10.00', currency: 'GBP' } },
  { amount: { value: '120.00', currency: 'USD' }, feeAmount: { value: '15.00', currency: 'USD' } },
];

const data = calculateFromTransactions(txs);
console.log('Devise dominante :', data.currency);
console.log('Devises trouvées :', data.byCurrency.map(c => c.currency).join(', '));

generateReport(data, 'test@test.com', 'TestShop', 'fr')
  .then(p => console.log('✅ PDF multi-devises généré :', p))
  .catch(e => { console.error('❌', e); process.exit(1); });
