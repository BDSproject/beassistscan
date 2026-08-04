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
  const leads = await prisma.lead.findMany({
    where: { userId: req.session.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ leads });
});

// Route POST pour uploader le CSV et générer le rapport
router.post('/upload-report', upload.single('csvFile'), handleReportUpload);

module.exports = router;