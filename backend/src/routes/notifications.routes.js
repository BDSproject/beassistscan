const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * Endpoint requis par eBay pour la conformité GDPR
 * Marketplace Account Deletion / Account Closure Notification
 * https://developer.ebay.com/marketplace-account-deletion
 */

// GET : eBay envoie une requête de validation avec un challenge_code
router.get('/marketplace-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;

  if (!challengeCode) {
    return res.status(400).json({ error: 'challenge_code manquant' });
  }

  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN || 'beassistVerificationToken2026AbCdEfGhIj';
  const endpoint = process.env.EBAY_DELETION_ENDPOINT || `${process.env.APP_URL || 'https://yearbook-plasma-reorder.ngrok-free.dev'}/api/notifications/marketplace-deletion`;

  // Hash SHA256 : challengeCode + verificationToken + endpoint
  const hash = crypto
    .createHash('sha256')
    .update(challengeCode + verificationToken + endpoint)
    .digest('hex');

  console.log('📬 eBay challenge reçu :', challengeCode, '→ réponse :', hash);

  return res.status(200).json({ challengeResponse: hash });
});

// POST : eBay envoie les notifications de suppression de compte
router.post('/marketplace-deletion', (req, res) => {
  const notification = req.body;
  console.log('🗑️ Notification suppression compte eBay reçue :', JSON.stringify(notification, null, 2));

  // Ici on pourrait supprimer les données utilisateur de notre base
  // Pour le MVP on logue juste et on confirme réception

  return res.status(200).send();
});

module.exports = router;
