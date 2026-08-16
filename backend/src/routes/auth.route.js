const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail } = require('../services/email.service');
const prisma = new PrismaClient();
const router = express.Router();

// Inscription — le compte doit être vérifié par email avant l'accès
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, storeName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, storeName, verifyToken, emailVerified: false },
    });

    // Envoi de l'email de vérification (l'inscription reste valide même si l'envoi échoue)
    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (mailErr) {
      console.error('⚠️ Envoi email de vérification échoué :', mailErr.message);
    }

    // Pas de session tant que l'email n'est pas confirmé
    res.json({
      success: true,
      requiresVerification: true,
      message: 'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse.',
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Vérification de l'email via le lien reçu
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.redirect('/login.html?verified=invalid');

    const user = await prisma.user.findUnique({ where: { verifyToken: String(token) } });
    if (!user) return res.redirect('/login.html?verified=invalid');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    // Connexion automatique après vérification
    req.session.userId = user.id;
    return res.redirect('/dashboard.html?verified=true');
  } catch (error) {
    console.error('Erreur verify:', error);
    return res.redirect('/login.html?verified=error');
  }
});

// Renvoyer l'email de vérification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse identique que le compte existe ou non (pas de fuite d'information)
    if (user && !user.emailVerified) {
      const verifyToken = user.verifyToken || crypto.randomBytes(32).toString('hex');
      if (!user.verifyToken) {
        await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });
      }
      try { await sendVerificationEmail(email, verifyToken); } catch (e) { console.error(e.message); }
    }
    res.json({ success: true, message: 'Si un compte non vérifié existe, un email a été renvoyé.' });
  } catch (error) {
    console.error('Erreur resend-verification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion Google — vérification du token côté serveur auprès de Google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Token Google manquant' });

    // Validation du id_token auprès de Google (signature, expiration, audience)
    const { data: payload } = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Token Google invalide (audience)' });
    }
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      return res.status(401).json({ error: 'Email Google non vérifié' });
    }

    const email = payload.email;
    const googleId = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Lier le compte Google si pas encore fait + marquer l'email vérifié (Google le garantit)
      if (!user.googleId || !user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, emailVerified: true, verifyToken: null },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          emailVerified: true, // email garanti par Google
          firstName: payload.given_name || null,
          lastName: payload.family_name || null,
        },
      });
    }

    req.session.userId = user.id;
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Erreur Google auth:', error.response?.data || error.message);
    res.status(401).json({ error: 'Authentification Google échouée' });
  }
});

// Config publique pour le bouton Google côté frontend
router.get('/google-config', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || null });
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    // Compte créé via Google uniquement (pas de mot de passe)
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Ce compte utilise la connexion Google. Cliquez sur « Continuer avec Google ».' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

    // Email non confirmé → accès refusé
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte mail.',
        requiresVerification: true,
      });
    }

    req.session.userId = user.id;
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Déconnexion
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Erreur déconnexion' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Récupérer le profil connecté
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { id: true, email: true, firstName: true, lastName: true, storeName: true },
  });
  res.json({ user });
});

module.exports = router;