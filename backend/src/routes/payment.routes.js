const express = require('express');
const router = express.Router();
const stripe = require('../services/stripe.service');
const { generateReport } = require('../services/pdf.service');
const { sendReport } = require('../services/email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawDomain = process.env.DOMAIN || 'localhost:3000';
const DOMAIN = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;

// Route GET /api/checkout?plan=report|pro&email=...&storeName=...
// Appelée depuis les boutons du frontend
router.get('/checkout', async (req, res) => {
  try {
    const { plan, email, storeName } = req.query;

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
      return res.status(400).send('Plan invalide ou prix non configuré.');
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      customer_email: email || undefined,
      metadata: {
        email: email || '',
        storeName: storeName || '',
        plan: plan || 'report',
      },
      success_url: `${DOMAIN}/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/?cancelled=true`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Erreur création session Stripe (GET):', error);
    res.redirect(`${DOMAIN}/?error=payment`);
  }
});

// Route pour créer une session de paiement
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { plan, email, storeName } = req.body;

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

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      customer_email: email || undefined,
      metadata: {
        email: email || '',
        storeName: storeName || '',
        plan: plan || 'report',
      },
      success_url: `${DOMAIN}/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/?cancelled=true`,
    });

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

// ============================================================
// Route Webhook Stripe (signature vérifiée, body RAW requis)
// ============================================================
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Signature webhook Stripe invalide :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Webhook Stripe reçu :', event.type);

  try {
    switch (event.type) {

      // Paiement unique (Rapport Détaillé 5€) réussi
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_details?.email || session.metadata?.email;
        const storeName = session.metadata?.storeName || 'Non renseigné';
        const plan = session.metadata?.plan || 'report';

        console.log(`💳 Paiement complété – email: ${email}, plan: ${plan}`);

        if (session.payment_status === 'paid') {
          // Sauvegarde en base
          await prisma.lead.upsert({
            where: { email: email || 'unknown' },
            update: { storeName, paidReport: plan === 'report', proSubscription: plan === 'pro' },
            create: { email: email || 'unknown', storeName, paidReport: plan === 'report', proSubscription: plan === 'pro', totalSales: 0, totalFees: 0, annualSaving: 0 },
          }).catch(e => console.error('Erreur DB webhook:', e.message));

          // TODO : Générer et envoyer le rapport premium par email
          // const pdfPath = await generateReport(reportData, email, storeName);
          // await sendReport(email, pdfPath);
        }
        break;
      }

      // Abonnement Pro activé
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`🔄 Abonnement ${event.type} – status: ${subscription.status}`);
        break;
      }

      // Abonnement Pro annulé
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`❌ Abonnement annulé – customer: ${subscription.customer}`);
        break;
      }

      // Paiement mensuel abonnement réussi
      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`💰 Facture payée – customer: ${invoice.customer}`);
        break;
      }

      // Paiement mensuel échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`⚠️ Paiement échoué – customer: ${invoice.customer}`);
        break;
      }

      default:
        console.log(`ℹ️ Événement non géré : ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Erreur traitement webhook :', err);
    return res.status(500).send('Erreur interne');
  }

  res.json({ received: true });
});

// Route d'annulation legacy
router.get('/cancel', (req, res) => {
  res.redirect(`${DOMAIN}/?cancelled=true`);
});

module.exports = router;