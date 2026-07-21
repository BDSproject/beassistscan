const path = require('path');
const fs = require('fs');
const { calculateFromCSV } = require('../services/calculator.service');
const { generateReport } = require('../services/pdf.service');
const { sendReport } = require('../services/email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// On exporte la fonction qui gère l'upload et tout le traitement
exports.handleReportUpload = async (req, res) => {
  try {
    // 1. Récupérer le fichier et l'email
    const file = req.file;
    const { email, storeName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier CSV uploadé.' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Veuillez fournir votre email.' });
    }

    const filePath = file.path;

    // 2. Calculer les données depuis le CSV
    const reportData = await calculateFromCSV(filePath);
    reportData.annualSaving = reportData.annualSaving || 0; // Valeur par défaut

    // 3. Générer le PDF
    const pdfPath = await generateReport(reportData, email, storeName || 'Votre boutique');

    // 4. Envoyer l'email avec le PDF
    await sendReport(email, pdfPath);

    // 5. Sauvegarder le lead en BDD
    await prisma.lead.create({
      data: {
        email: email,
        storeName: storeName || 'Non renseigné',
        totalSales: reportData.totalSales,
        totalFees: reportData.totalFees,
        annualSaving: reportData.annualSaving,
      },
    });

    // 6. Nettoyer les fichiers temporaires (garder le PDF envoyé ? On le supprime après envoi)
    fs.unlinkSync(filePath); // Supprime le CSV
    // On garde le PDF en cache pour les logs, ou on le supprime aussi. On le laisse pour l'exemple.
    // fs.unlinkSync(pdfPath); // Optionnel

    // 7. Retourner une preview au frontend
    res.status(200).json({
      success: true,
      message: 'Rapport envoyé par email avec succès !',
      preview: {
        totalSales: reportData.totalSales,
        totalFees: reportData.totalFees,
        annualSaving: reportData.annualSaving,
        rowCount: reportData.rowCount,
      },
    });

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ error: 'Erreur interne du serveur. Vérifiez votre fichier CSV.' });
  }
};