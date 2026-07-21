const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleReportUpload } = require('../controllers/report.controller');

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

// Route POST pour uploader le CSV et générer le rapport
router.post('/upload-report', upload.single('csvFile'), handleReportUpload);

module.exports = router;