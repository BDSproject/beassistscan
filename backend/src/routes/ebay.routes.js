const express = require('express');
const router = express.Router();
const EbayService = require('../services/ebay.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Stockage temporaire des tokens en mémoire (pour MVP sans base)
// Mais on va quand même utiliser la table EbayToken pour persister.
// On va simplifier avec une variable globale (pour éviter de bloquer).

let currentToken = null; // { accessToken, refreshToken, expiresAt }

// Route d'autorisation : redirige vers eBay
router.get('/auth', (req, res) => {
  const isProd = process.env.EBAY_ENV === 'production';
  const clientId = isProd ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID;
  const redirectUri = isProd ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI;
  const scopes = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.finances',
  ].join(' ');
  const state = Math.random().toString(36).substring(7);
  res.cookie('ebayState', state, { httpOnly: true, maxAge: 600000, sameSite: 'lax' });
  const authBaseUrl = isProd
    ? 'https://auth.ebay.com'
    : 'https://auth.sandbox.ebay.com';

  const url = `${authBaseUrl}/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&prompt=login`;
  console.log('🔗 URL de redirection eBay :', url);
  res.redirect(url);
});

// Route de callback : eBay renvoie ici après autorisation
router.get('/callback', async (req, res) => {
  const { code, state, success } = req.query;
  const savedState = req.cookies?.ebayState;
  const rawDomain = process.env.DOMAIN || 'localhost:3000';
  const domain = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;

  console.log('🔔 Callback reçu – query :', req.query);
  console.log('🔔 Cookie ebayState :', savedState);
  

  // 1. eBay a renvoyé une erreur (ex: l'utilisateur a refusé l'autorisation)
  if (success) {
    console.log('✅ eBay success param reçu, redirection vers étape 2');
    return res.redirect(`${domain}/?connected=true`);
  }

  // 2. Vérification du state CSRF (optionnelle mais recommandée)
  if (state && savedState && state !== savedState) {
    console.error('❌ État CSRF invalide - reçu:', state, 'attendu:', savedState);
    return res.redirect(`${domain}/?connected=false&reason=csrf`);
  }

  // 3. Vérifier que le code est bien présent
  if (!code) {
    console.error('❌ Aucun code reçu d\'eBay – query reçue :', req.query);
    return res.redirect(`${domain}/?connected=false&reason=no_code`);
  }

  // 4. Échange du code contre un token
  try {
    console.log('🔄 Échange du code eBay en cours, code :', code.substring(0, 20) + '...');
    const tokenData = await EbayService.getAccessToken(code);
    const { access_token, refresh_token, expires_in } = tokenData;

    const expiresAt = new Date(Date.now() + expires_in * 1000);
    currentToken = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
    };

    // Sauvegarde en base
    await prisma.ebayToken.create({
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
    });

    console.log('✅ Token stocké, redirection vers étape 2');
    res.clearCookie('ebayState');
    return res.redirect(`${domain}/?connected=true`);
  } catch (err) {
    const ebayError = err.response?.data || err.message;
    console.error('❌ Erreur échange token eBay :', JSON.stringify(ebayError));
    return res.redirect(`${domain}/?connected=false&reason=token_error&detail=` + encodeURIComponent(JSON.stringify(ebayError)));
  }
});
router.post('/generate-report-ebay', async (req, res) => {
  try {
    const { email, storeName, lang } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    const isTestMode = String(req.query.test || '').toLowerCase() === 'true';

    const { calculateFromTransactions } = require('../services/calculator.service');
    let reportData;

    if (isTestMode) {
      const fakeTransactions = [
        { amount: { value: '149.99' }, feeAmount: { value: '19.50' } },
        { amount: { value: '79.99' }, feeAmount: { value: '10.40' } },
        { amount: { value: '200.00' }, feeAmount: { value: '26.00' } },
        { amount: { value: '350.00' }, feeAmount: { value: '45.50' } },
        { amount: { value: '89.99' }, feeAmount: { value: '11.70' } },
      ];
      reportData = calculateFromTransactions(fakeTransactions);
      console.log('🧪 Rapport en mode test (donnees fictives)');
    } else {
      // Récupération du dernier token eBay stocké
      const latestToken = await prisma.ebayToken.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latestToken) {
        return res.status(400).json({
          error: 'Aucun compte eBay connecte. Connectez eBay avant de generer un rapport.',
        });
      }

      let accessToken = latestToken.accessToken;

      // Refresh token si expiré
      if (new Date(latestToken.expiresAt).getTime() <= Date.now()) {
        console.log('🔄 Token eBay expire, refresh en cours...');
        const refreshed = await EbayService.refreshAccessToken(latestToken.refreshToken);
        const expiresAt = new Date(Date.now() + (refreshed.expires_in || 7200) * 1000);

        await prisma.ebayToken.create({
          data: {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token || latestToken.refreshToken,
            expiresAt,
            userId: latestToken.userId || undefined,
          },
        });

        accessToken = refreshed.access_token;
      }

      const transactions = await EbayService.getTransactions(accessToken);
      reportData = calculateFromTransactions(transactions || []);
      console.log(`📊 Transactions eBay recuperees: ${reportData.rowCount}`);
    }

    // Génération du PDF
    const { generateReport } = require('../services/pdf.service');
    const pdfPath = await generateReport(reportData, email, storeName || 'Boutique', lang);
    console.log('✅ PDF généré:', pdfPath);

    // Envoi du mail (si SMTP configuré)
    const { sendReport } = require('../services/email.service');
    const mailTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Mail timeout')), 20000));
    await Promise.race([sendReport(email, pdfPath), mailTimeout]);

    // Sauvegarde en base (optionnelle)
    await prisma.lead.create({
      data: {
        email,
        storeName: storeName || 'Non renseigne',
        totalSales: reportData.totalSales,
        totalFees: reportData.totalFees,
        annualSaving: reportData.annualSaving,
      },
    });

    return res.json({
      success: true,
      message: isTestMode ? 'Rapport envoye ! (mode test)' : 'Rapport envoye !',
    });

  } catch (error) {
    console.error('Erreur generation rapport :', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
});

module.exports = router;