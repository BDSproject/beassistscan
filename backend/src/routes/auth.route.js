const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, storeName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, storeName },
    });
    req.session.userId = user.id;
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
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

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

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
  if (!req.session.userId) return res.status(401).json({ error: 'Non connecté' });
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { id: true, email: true, firstName: true, lastName: true, storeName: true },
  });
  res.json({ user });
});

module.exports = router;