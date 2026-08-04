const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const BRAND = {
  violet:     '#7C3AED',
  violetDark: '#5B21B6',
  dark:       '#1E1B4B',
  midDark:    '#312E81',
  gray:       '#374151',
  grayLight:  '#6B7280',
  bg:         '#F5F3FF',
  white:      '#FFFFFF',
  red:        '#DC2626',
  redBg:      '#FEE2E2',
  green:      '#059669',
  greenBg:    '#D1FAE5',
  border:     '#E5E7EB',
};

const PAGE_W = 595.28; // A4 width pts
const MARGIN  = 45;
const INNER_W = PAGE_W - MARGIN * 2;
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── helpers ────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return [r,g,b];
}

function gradientRect(doc, x, y, w, h, color1, color2) {
  // PDFKit ne gere pas les degrades natifs -> on simule avec bandes fines
  const steps = 40;
  const [r1,g1,b1] = hexToRgb(color1);
  const [r2,g2,b2] = hexToRgb(color2);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = r1 + (r2-r1)*t;
    const g = g1 + (g2-g1)*t;
    const b = b1 + (b2-b1)*t;
    doc.rect(x + (w/steps)*i, y, w/steps + 1, h).fill([r*255,g*255,b*255]);
  }
}

function pill(doc, x, y, text, bg, fg, fontSize = 8) {
  const pad = 8;
  doc.fontSize(fontSize).font('Helvetica-Bold');
  const tw = doc.widthOfString(text);
  const pw = tw + pad * 2;
  const ph = fontSize + pad;
  doc.roundedRect(x, y, pw, ph, ph/2).fill(bg);
  doc.fillColor(fg).text(text, x + pad, y + pad/2, { width: tw, lineBreak: false });
  return pw;
}

// ── SECTIONS ───────────────────────────────────────────────

function drawHeader(doc) {
  const H = 110;
  // fond sombre
  doc.rect(0, 0, PAGE_W, H).fill(BRAND.dark);
  // bande violette decorative a droite
  doc.rect(PAGE_W - 160, 0, 160, H).fill(BRAND.midDark);
  doc.rect(PAGE_W - 80,  0, 80,  H).fill(BRAND.violet);

  // Nom app
  doc.fontSize(26).font('Helvetica-Bold')
     .fillColor(BRAND.white)
     .text('Beassist', MARGIN, 30, { continued: true })
     .fillColor('#C4B5FD')
     .text('Scan', { continued: false });

  // Sous-titre
  doc.fontSize(11).font('Helvetica')
     .fillColor('#A78BFA')
     .text('Rapport de Rentabilite eBay', MARGIN, 62);

  // Date badge
  const dateStr = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  doc.fontSize(8).font('Helvetica')
     .fillColor('#C4B5FD')
     .text(dateStr, MARGIN, 83);

  return H;
}

function drawInfoBand(doc, y, email, storeName) {
  const H = 44;
  doc.rect(0, y, PAGE_W, H).fill(BRAND.bg);
  doc.rect(0, y, 4, H).fill(BRAND.violet); // bord gauche colore

  doc.fontSize(9).font('Helvetica').fillColor(BRAND.grayLight)
     .text('Boutique :', MARGIN + 10, y + 8, { continued: true })
     .font('Helvetica-Bold').fillColor(BRAND.gray)
     .text(` ${storeName || 'Non specifiee'}`, { continued: false });

  doc.fontSize(9).font('Helvetica').fillColor(BRAND.grayLight)
     .text('Email :', MARGIN + 10, y + 23, { continued: true })
     .font('Helvetica-Bold').fillColor(BRAND.gray)
     .text(` ${email}`, { continued: false });

  return y + H;
}

function drawStatCards(doc, y, data) {
  const GAP   = 12;
  const CW    = (INNER_W - GAP * 2) / 3;
  const CH    = 85;
  const cards = [
    { label: 'Chiffre d\'affaires',  value: data.totalSales,   bg: BRAND.bg,      valColor: BRAND.dark,   sub: '90 derniers jours' },
    { label: 'Commissions eBay',     value: data.totalFees,    bg: BRAND.redBg,   valColor: BRAND.red,    sub: 'Frais preleves' },
    { label: 'Economies / an est.',  value: data.annualSaving, bg: BRAND.greenBg, valColor: BRAND.green,  sub: 'En boutique indep.' },
  ];

  y += 18;
  cards.forEach((c, i) => {
    const x = MARGIN + i * (CW + GAP);
    // Carte
    doc.roundedRect(x, y, CW, CH, 8).fill(c.bg);
    doc.roundedRect(x, y, CW, CH, 8).strokeColor(BRAND.border).lineWidth(1).stroke();

    // Label
    doc.fontSize(8.5).font('Helvetica').fillColor(BRAND.grayLight)
       .text(c.label, x + 12, y + 13, { width: CW - 24 });

    // Valeur
    doc.fontSize(22).font('Helvetica-Bold').fillColor(c.valColor)
       .text(`${c.value.toFixed(2)} EUR`, x + 12, y + 29, { width: CW - 24 });

    // Sous-label
    doc.fontSize(7.5).font('Helvetica').fillColor(BRAND.grayLight)
       .text(c.sub, x + 12, y + 62, { width: CW - 24 });
  });

  return y + CH;
}

function drawDivider(doc, y, label) {
  y += 20;
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(BRAND.border).lineWidth(1).stroke();
  doc.fontSize(9).font('Helvetica-Bold').fillColor(BRAND.violet)
     .text(label, MARGIN, y + 6);
  return y + 24;
}

function drawDetailTable(doc, y, data) {
  y = drawDivider(doc, y, 'Detail de l\'analyse');

  const rows = [
    ['Nombre de transactions',    `${data.rowCount || 'N/A'}`],
    ['Chiffre d\'affaires total', `${data.totalSales.toFixed(2)} EUR`],
    ['Commissions eBay totales',  `${data.totalFees.toFixed(2)} EUR`],
    ['Taux de commission moyen',  `${data.totalSales > 0 ? ((data.totalFees/data.totalSales)*100).toFixed(1) : 0} %`],
    ['Economies annuelles est.',  `${data.annualSaving.toFixed(2)} EUR`],
  ];

  const COL1 = INNER_W * 0.62;
  const COL2 = INNER_W * 0.38;
  const ROW_H = 26;

  rows.forEach((row, i) => {
    const rowY = y + i * ROW_H;
    // fond alterne
    if (i % 2 === 0) doc.rect(MARGIN, rowY, INNER_W, ROW_H).fill('#FAFAFA');
    doc.rect(MARGIN, rowY, INNER_W, ROW_H).strokeColor(BRAND.border).lineWidth(0.5).stroke();

    doc.fontSize(9.5).font('Helvetica').fillColor(BRAND.gray)
       .text(row[0], MARGIN + 10, rowY + 8, { width: COL1 - 10 });
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BRAND.dark)
       .text(row[1], MARGIN + COL1, rowY + 8, { width: COL2 - 10, align: 'right' });
  });

  return y + rows.length * ROW_H;
}

function drawInsightBox(doc, y, data) {
  y += 22;
  const BH = 80;
  // fond violet degrade simule
  doc.roundedRect(MARGIN, y, INNER_W, BH, 10).fill(BRAND.dark);
  doc.roundedRect(MARGIN, y, 5, BH, 3).fill(BRAND.violet);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(BRAND.white)
     .text('Ce que vous pourriez economiser', MARGIN + 18, y + 12);

  doc.fontSize(9.5).font('Helvetica').fillColor('#C4B5FD')
     .text(
       `En ouvrant votre propre boutique e-commerce, vous economiseriez environ ` +
       `${data.annualSaving.toFixed(2)} EUR par an en commissions eBay - soit ${(data.annualSaving/12).toFixed(2)} EUR par mois.`,
       MARGIN + 18, y + 32,
       { width: INNER_W - 30 }
     );

  return y + BH;
}

function drawCTA(doc, y) {
  y += 18;
  const BH = 48;
  doc.roundedRect(MARGIN, y, INNER_W, BH, 8).fill(BRAND.violet);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BRAND.white)
     .text('Pret a recuperer vos marges ? -> www.beassistscan.com', MARGIN, y + 17, {
       width: INNER_W, align: 'center'
     });

  return y + BH;
}

function drawFooter(doc) {
  const FH = 36;
  const fy = doc.page.height - FH;
  doc.rect(0, fy, PAGE_W, FH).fill(BRAND.midDark);

  doc.fontSize(7.5).font('Helvetica').fillColor('#A78BFA')
     .text(
       '(c) 2026 BeassistScan - Beassist Agency . beassistscan.com . contact@beassistnow.com',
       MARGIN, fy + 13,
       { width: INNER_W, align: 'center' }
     );
}

// ── EXPORT ─────────────────────────────────────────────────
function generateReport(data, email, storeName) {
  return new Promise((resolve, reject) => {
    try {
      ensureUploadsDir();
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
      const filePath = path.join(UPLOADS_DIR, `report_${Date.now()}.pdf`);
      const ws = fs.createWriteStream(filePath);

      ws.on('error', reject);
      ws.on('finish', () => {
        const size = fs.statSync(filePath).size;
        if (size === 0) reject(new Error('PDF vide'));
        else resolve(filePath);
      });

      doc.pipe(ws);

      let y = 0;
      y = drawHeader(doc);
      y = drawInfoBand(doc, y, email, storeName);
      y = drawStatCards(doc, y, data);
      y = drawDetailTable(doc, y, data);
      y = drawInsightBox(doc, y, data);
      y = drawCTA(doc, y);
      drawFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateReport };