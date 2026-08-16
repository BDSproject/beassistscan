/**
 * Diagnostic : compare les transactions brutes de l'API Finances eBay
 * avec le CA réel de la boutique.
 * Usage : node tools/diagnostics/diag-transactions.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const EbayService = require('../../src/services/ebay.service');
const prisma = new PrismaClient();

const isProd = process.env.EBAY_ENV === 'production';
const APIZ = isProd ? 'https://apiz.ebay.com' : 'https://apiz.sandbox.ebay.com';

async function fetchAll(accessToken, filter) {
  const url = `${APIZ}/sell/finances/v1/transaction?limit=100&sort=transactionDate&filter=${filter}`;
  let transactions = [];
  let next = url;
  while (next) {
    const resp = await axios.get(next, {
      headers: EbayService.getAuthHeaders(accessToken, 'GET', next),
    });
    if (resp.data.transactions) transactions = transactions.concat(resp.data.transactions);
    next = (typeof resp.data.next === 'string' && resp.data.next) || null;
  }
  return transactions;
}

async function main() {
  const latestToken = await prisma.ebayToken.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!latestToken) { console.error('❌ Aucun token'); process.exit(1); }

  let accessToken = latestToken.accessToken;
  if (new Date(latestToken.expiresAt).getTime() <= Date.now()) {
    console.log('🔄 Refresh token...');
    const refreshed = await EbayService.refreshAccessToken(latestToken.refreshToken);
    accessToken = refreshed.access_token;
  }

  const now = new Date();
  const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const range = `[${from.toISOString()}..${now.toISOString()}]`;

  // 1. Avec le filtre actuel (PAYOUT uniquement)
  const withPayout = await fetchAll(accessToken, encodeURIComponent(`transactionDate:${range},transactionStatus:{PAYOUT}`));
  // 2. Sans filtre de statut (toutes les transactions)
  const all = await fetchAll(accessToken, encodeURIComponent(`transactionDate:${range}`));

  console.log(`\n=== COMPARAISON (90 jours) ===`);
  console.log(`Avec filtre PAYOUT : ${withPayout.length} transactions`);
  console.log(`Sans filtre statut : ${all.length} transactions`);

  // Répartition par type et statut
  const stats = {};
  all.forEach(t => {
    const key = `${t.transactionType} / ${t.transactionStatus}`;
    if (!stats[key]) stats[key] = { count: 0, amount: 0, fees: 0 };
    stats[key].count++;
    stats[key].amount += Math.abs(parseFloat(t.amount?.value || 0));
    stats[key].fees += Math.abs(parseFloat(t.totalFeeAmount?.value || 0));
  });

  console.log(`\n=== RÉPARTITION type / statut ===`);
  Object.entries(stats).forEach(([k, v]) => {
    console.log(`${k.padEnd(45)} n=${String(v.count).padEnd(4)} montant=${v.amount.toFixed(2).padStart(10)} frais=${v.fees.toFixed(2).padStart(9)}`);
  });

  // CA des SALE toutes confondues vs PAYOUT uniquement
  const sumSales = (txs) => txs.filter(t => t.transactionType === 'SALE')
    .reduce((s, t) => s + Math.abs(parseFloat(t.amount?.value || 0)), 0);

  console.log(`\n=== CHIFFRE D'AFFAIRES (SALE) ===`);
  console.log(`CA avec filtre PAYOUT : ${sumSales(withPayout).toFixed(2)}`);
  console.log(`CA toutes transactions : ${sumSales(all).toFixed(2)}`);

  // Exemple de transaction SALE pour inspecter les champs de montant
  const sample = all.find(t => t.transactionType === 'SALE');
  if (sample) {
    console.log(`\n=== EXEMPLE DE TRANSACTION SALE ===`);
    console.log(JSON.stringify({
      transactionDate: sample.transactionDate,
      transactionStatus: sample.transactionStatus,
      amount: sample.amount,
      totalFeeBasisAmount: sample.totalFeeBasisAmount,
      totalFeeAmount: sample.totalFeeAmount,
      bookingEntry: sample.bookingEntry,
    }, null, 2));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e.response?.data || e.message); process.exit(1); });
