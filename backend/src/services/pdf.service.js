const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateReport(data, email, storeName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filePath = path.join(__dirname, '../../uploads', `report_${Date.now()}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // ----- DESIGN DU RAPPORT -----
      // En-tête avec votre marque
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1E3A8A') // Bleu foncé
        .text('Beassist Agency', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#374151')
        .text('Rapport de Rentabilité eBay', { align: 'center' })
        .moveDown(1.5);

      // Informations client
      doc.fontSize(12).fillColor('#1F2937');
      doc.text(`Destinataire : ${email}`);
      doc.text(`Store analysé : ${storeName || 'Votre boutique'}`);
      doc.text(`Date du rapport : ${new Date().toLocaleDateString('fr-FR')}`);
      doc.moveDown(2);

      // ----- CHIFFRES CLÉS (Style "Dashboard") -----
      const totalSales = data.totalSales;
      const totalFees = data.totalFees;
      const annualSaving = data.annualSaving;

      // Box 1 : Chiffre d'affaires
      doc
        .rect(50, doc.y, 150, 60)
        .fillAndStroke('#E5E7EB', '#9CA3AF')
        .fillColor('#111827');
      doc.text('CA Total', 60, doc.y - 55, { width: 130, align: 'center' });
      doc.fontSize(16).font('Helvetica-Bold').text(`${totalSales.toFixed(2)} €`, 60, doc.y - 35, { width: 130, align: 'center' });

      // Box 2 : Commissions versées
      doc
        .rect(210, doc.y - 60, 150, 60)
        .fillAndStroke('#FEE2E2', '#EF4444')
        .fillColor('#991B1B');
      doc.fontSize(10).font('Helvetica').text('Commissions eBay', 220, doc.y - 55, { width: 130, align: 'center' });
      doc.fontSize(16).font('Helvetica-Bold').text(`${totalFees.toFixed(2)} €`, 220, doc.y - 35, { width: 130, align: 'center' });

      // Box 3 : Économies potentielles (ANNUEL)
      doc
        .rect(370, doc.y - 60, 150, 60)
        .fillAndStroke('#D1FAE5', '#10B981')
        .fillColor('#064E3B');
      doc.fontSize(10).font('Helvetica').text('Économies / AN', 380, doc.y - 55, { width: 130, align: 'center' });
      doc.fontSize(16).font('Helvetica-Bold').text(`${annualSaving.toFixed(2)} €`, 380, doc.y - 35, { width: 130, align: 'center' });

      doc.moveDown(4);

      // ----- MESSAGE PERSUASIF -----
      doc.fontSize(12).font('Helvetica');
      doc.fillColor('#1F2937');
      doc.text(`Avec ${data.rowCount} transactions analysées, vous avez reversé une somme considérable à eBay.`, { align: 'center' });
      doc.moveDown(1);
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#DC2626')
        .text(`Imaginez économiser ${annualSaving.toFixed(2)} € par an en vendant sur votre propre site !`, { align: 'center' });
      doc.moveDown(2);

      // Pied de page
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text("Beassist'Agency - Votre partenaire e-commerce", 50, 780, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReport };