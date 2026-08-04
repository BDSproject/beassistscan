const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================================
// COULEURS & CONSTANTES BeassistScan
// ============================================================
const BRAND = {
  violet: '#7C3AED',
  dark: '#1E1B4B',
  gray: '#374151',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  red: '#EF4444',
  redLight: '#FEE2E2',
  green: '#10B981',
  greenLight: '#D1FAE5',
};

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// ============================================================
// FONCTIONS DE DESSIN
// ============================================================

/** Crée le dossier d'upload s'il n'existe pas */
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/** Ajoute le bandeau supérieur avec le logo */
function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 120).fill(BRAND.dark);

  doc.fontSize(28)
    .font('Helvetica-Bold')
    .fillColor(BRAND.white)
    .text('Be', 50, 30, { continued: true })
    .fillColor('#A78BFA')
    .text('assist')
    .fillColor(BRAND.white)
    .text('Scan', { continued: false });

  doc.fontSize(12)
    .font('Helvetica')
    .fillColor('#A78BFA')
    .text('Rapport de Rentabilité eBay', 50, 70);
}

/** Ajoute les informations du destinataire */
function drawRecipientInfo(doc, email, storeName) {
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor(BRAND.gray)
    .text(`Généré le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}`)
    .text(`Boutique : ${storeName || 'Non spécifiée'}`)
    .text(`Email : ${email}`)
    .moveDown(2);
}

/** Dessine une carte de statistique */
function drawStatCard(doc, x, y, width, height, label, value, backgroundColor, textColor) {
  doc.roundedRect(x, y, width, height, 10).fill(backgroundColor);
  doc.roundedRect(x, y, width, height, 10).stroke('#E5E7EB');

  doc.fontSize(10)
    .font('Helvetica')
    .fillColor(textColor)
    .text(label, x + 10, y + 15, { width: width - 20, align: 'center' });

  doc.fontSize(20)
    .font('Helvetica-Bold')
    .fillColor(textColor)
    .text(`${value.toFixed(2)} €`, x + 10, y + 35, { width: width - 20, align: 'center' });
}

/** Dessine les trois cartes de statistiques principales */
function drawStatsCards(doc, data) {
  const cardWidth = 150;
  const cardHeight = 80;
  const gap = 15;
  const startX = 50;
  const cardY = doc.y;

  drawStatCard(doc, startX, cardY, cardWidth, cardHeight,
    'CA Total', data.totalSales, BRAND.lightGray, BRAND.dark);

  drawStatCard(doc, startX + cardWidth + gap, cardY, cardWidth, cardHeight,
    'Commissions eBay', data.totalFees, BRAND.redLight, '#991B1B');

  drawStatCard(doc, startX + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight,
    'Économies / AN', data.annualSaving, BRAND.greenLight, '#064E3B');

  doc.moveDown(7);
}

/** Ajoute le message d'alerte et de persuasion */
function drawInsight(doc, data) {
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(BRAND.violet)
    .text('💡 Le saviez-vous ?', { align: 'center' })
    .moveDown(0.5);

  doc.fontSize(12)
    .font('Helvetica')
    .fillColor(BRAND.gray)
    .text(`Avec ${data.rowCount || 'plusieurs'} transactions analysées, vous avez reversé une somme importante à eBay.`, { align: 'center' })
    .moveDown(0.5);

  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(BRAND.red)
    .text(`Imaginez économiser ${data.annualSaving.toFixed(2)} € par an en vendant sur votre propre site !`, { align: 'center' })
    .moveDown(2);
}

/** Ajoute le pied de page */
function drawFooter(doc) {
  const bottomY = doc.page.height - 80;
  doc.rect(0, bottomY, doc.page.width, 80).fill(BRAND.dark);

  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#A78BFA')
    .text('BeassistScan - Votre partenaire e-commerce', 50, bottomY + 20, { align: 'center' });

  doc.fontSize(9)
    .fillColor('#9CA3AF')
    .text('www.beassistscan.com', 50, bottomY + 35, { align: 'center' });
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================
function generateReport(data, email, storeName) {
  return new Promise((resolve, reject) => {
    try {
      ensureUploadsDir();

      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
      const filePath = path.join(UPLOADS_DIR, `report_${Date.now()}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      writeStream.on('error', reject);
      writeStream.on('finish', () => {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          reject(new Error('Fichier PDF vide'));
        } else {
          resolve(filePath);
        }
      });

      doc.pipe(writeStream);

      // Composition du document
      drawHeader(doc);
      doc.moveDown(8); // laisse l'espace après le bandeau
      drawRecipientInfo(doc, email, storeName);
      drawStatsCards(doc, data);
      drawInsight(doc, data);
      drawFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReport };