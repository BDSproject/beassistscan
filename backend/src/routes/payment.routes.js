const express = require('express');
const router = express.Router();
const stripe = require('../services/stripe.service');
const { generateReport } = require('../services/pdf.service');
const { sendReport } = require('../services/email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

// Route pour créer une session de paiement
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { plan } = req.body; // "report" ou "pro"

    // Sélection du prix en fonction du plan
    let priceId;
    let mode;
    if (plan === 'pro') {
      priceId = process.env.STRIPE_PRICE_PRO;
      mode = 'subscription';
    } else {
      priceId = process.env.STRIPE_PRICE_REPORT;
      mode = 'payment';
    }

    if (!priceId) {
      return res.status(400).json({ error: 'Plan invalide ou prix non configuré.' });
    }

    // Création de la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancel`,
      // On peut passer des métadonnées pour lier l'email après paiement
      // metadata: { email: req.body.email, storeName: req.body.storeName },
    });

    // Redirection vers l'URL de paiement Stripe
    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement.' });
  }
});

// Route de succès (appelée après le paiement)
router.get('/success', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).send('Session manquante.');
    }

    // Récupération de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      // Ici, normalement vous générez le rapport premium et l'envoyez par email.
      // Pour l'instant, nous allons simplement afficher un message de succès.
      // Vous pouvez récupérer l'email et le storeName depuis les métadonnées si vous les avez passées.
      res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><title>Paiement réussi</title>
        <link href="https://cdn.tailwindcss.com" rel="stylesheet"></head>
        <body class="bg-gray-50 flex items-center justify-center min-h-screen">
          <div class="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md">
            <div class="text-4xl mb-4">✅</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Paiement réussi !</h1>
            <p class="text-gray-600 mb-4">Merci pour votre achat. Votre rapport détaillé vous sera envoyé par email d’ici quelques minutes.</p>
            <a href="/" class="inline-block bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-800">Retour à l'accueil</a>
          </div>
        </body>
        </html>
      `);
    } else {
      res.send('Paiement non confirmé. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Erreur succès:', error);
    res.status(500).send('Erreur lors de la vérification du paiement.');
  }
});

// Route d'annulation
router.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Paiement annulé</title>
    <link href="https://cdn.tailwindcss.com" rel="stylesheet"></head>
    <body class="bg-gray-50 flex items-center justify-center min-h-screen">
      <div class="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md">
        <div class="text-4xl mb-4">❌</div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Paiement annulé</h1>
        <p class="text-gray-600 mb-4">Votre paiement n'a pas été finalisé. Vous pouvez réessayer quand vous le souhaitez.</p>
        <a href="/" class="inline-block bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-800">Retour à l'accueil</a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;