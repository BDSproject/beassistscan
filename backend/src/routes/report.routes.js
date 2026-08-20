const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleReportUpload } = require('../controllers/report.controller');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Configuration de Multer pour l'upload des CSV

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `ebay_${Date.now()}.csv`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers CSV sont acceptés.'), false);
    }
  },
});

// Route API pour récupérer les rapports de l’utilisateur

router.get('/reports', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Non connecté' });
  // Rattacher automatiquement les anciens rapports générés avec le même email
  const me = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (me) {
    await prisma.lead.updateMany({
      where: { email: me.email, userId: null },
      data: { userId: me.id },
    });
  }
  const leads = await prisma.lead.findMany({
    where: { userId: req.session.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ leads });
});

// Téléchargement sécurisé du PDF d'un rapport (propriétaire uniquement)
router.get('/reports/:id/download', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Non connecté' });
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead || lead.userId !== req.session.userId) {
    return res.status(404).json({ error: 'Rapport introuvable' });
  }
  if (!lead.pdfPath) {
    return res.status(404).json({ error: 'PDF non disponible pour ce rapport' });
  }
  const fs = require('fs');
  if (!fs.existsSync(lead.pdfPath)) {
    return res.status(410).json({ error: 'PDF expiré. Générez un nouveau rapport.' });
  }
  res.download(lead.pdfPath, `rapport-ebay-${lead.createdAt.toISOString().slice(0, 10)}.pdf`);
});

// Route POST pour uploader le CSV et générer le rapport
router.post('/upload-report', upload.single('csvFile'), handleReportUpload);

module.exports = router;