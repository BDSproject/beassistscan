const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ── i18n ── (ASCII only - PDFKit Helvetica limitation) ───────────────────────
const TRANSLATIONS = {
  fr: {
    subtitle:     'Rapport de Rentabilite eBay',
    storeLabel:   'Boutique :',
    storeDefault: 'Non specifiee',
    emailLabel:   'Email :',
    card1Label:   "Chiffre d'affaires",
    card1Sub:     '90 derniers jours',
    card2Label:   'Commissions eBay',
    card2Sub:     'Frais preleves',
    card3Label:   'Economies / an est.',
    card3Sub:     'En boutique indep.',
    divider:      "Detail de l'analyse",
    row1:         'Nombre de transactions',
    row2:         "Chiffre d'affaires total",
    row3:         'Commissions eBay totales',
    row4:         'Taux de commission moyen',
    row5:         'Economies annuelles est.',
    insightTitle: 'Ce que vous pourriez economiser',
    insightText:  (s, m) => `En ouvrant votre propre boutique e-commerce, vous economiseriez environ ${s} EUR par an en commissions eBay - soit ${m} EUR par mois.`,
    cta:          'Pret a recuperer vos marges ? -> www.beassistscan.com',
  },
  en: {
    subtitle:     'eBay Profitability Report',
    storeLabel:   'Store:',
    storeDefault: 'Not specified',
    emailLabel:   'Email:',
    card1Label:   'Revenue',
    card1Sub:     'Last 90 days',
    card2Label:   'eBay Fees',
    card2Sub:     'Fees charged',
    card3Label:   'Est. Yearly Savings',
    card3Sub:     'Own e-commerce store',
    divider:      'Analysis Details',
    row1:         'Number of transactions',
    row2:         'Total revenue',
    row3:         'Total eBay fees',
    row4:         'Avg commission rate',
    row5:         'Est. yearly savings',
    insightTitle: 'What you could save',
    insightText:  (s, m) => `By opening your own e-commerce store, you could save about ${s} EUR per year in eBay fees - that is ${m} EUR per month.`,
    cta:          'Ready to get your margins back? -> www.beassistscan.com',
  },
  es: {
    subtitle:     'Informe de Rentabilidad eBay',
    storeLabel:   'Tienda:',
    storeDefault: 'No especificada',
    emailLabel:   'Email:',
    card1Label:   'Facturacion',
    card1Sub:     'Ultimos 90 dias',
    card2Label:   'Comisiones eBay',
    card2Sub:     'Comisiones cobradas',
    card3Label:   'Ahorro / ano est.',
    card3Sub:     'Tienda propia',
    divider:      'Detalle del analisis',
    row1:         'Numero de transacciones',
    row2:         'Facturacion total',
    row3:         'Comisiones eBay totales',
    row4:         'Tasa de comision media',
    row5:         'Ahorro anual est.',
    insightTitle: 'Lo que podrias ahorrar',
    insightText:  (s, m) => `Abriendo tu propia tienda e-commerce, ahorrarias unos ${s} EUR al ano en comisiones eBay - es decir ${m} EUR al mes.`,
    cta:          'Listo para recuperar tus margenes? -> www.beassistscan.com',
  },
  de: {
    subtitle:     'eBay Rentabilitaetsbericht',
    storeLabel:   'Shop:',
    storeDefault: 'Nicht angegeben',
    emailLabel:   'E-Mail:',
    card1Label:   'Umsatz',
    card1Sub:     'Letzte 90 Tage',
    card2Label:   'eBay-Gebuehren',
    card2Sub:     'Erhobene Gebuehren',
    card3Label:   'Gesch. Jahreseinsparung',
    card3Sub:     'Eigener Online-Shop',
    divider:      'Analysedetails',
    row1:         'Anzahl der Transaktionen',
    row2:         'Gesamtumsatz',
    row3:         'Gesamte eBay-Gebuehren',
    row4:         'Durchschn. Provisionssatz',
    row5:         'Gesch. Jahreseinsparung',
    insightTitle: 'Was Sie sparen koennten',
    insightText:  (s, m) => `Durch Eroeffnung Ihres eigenen Online-Shops koennten Sie ca. ${s} EUR pro Jahr an eBay-Gebuehren sparen - das sind ${m} EUR pro Monat.`,
    cta:          'Bereit, Ihre Margen zurueckzugewinnen? -> www.beassistscan.com',
  },
  it: {
    subtitle:     'Report di Redditivita eBay',
    storeLabel:   'Negozio:',
    storeDefault: 'Non specificato',
    emailLabel:   'Email:',
    card1Label:   'Fatturato',
    card1Sub:     'Ultimi 90 giorni',
    card2Label:   'Commissioni eBay',
    card2Sub:     'Commissioni applicate',
    card3Label:   'Risparmio / anno est.',
    card3Sub:     'Negozio indipendente',
    divider:      "Dettaglio dell'analisi",
    row1:         'Numero di transazioni',
    row2:         'Fatturato totale',
    row3:         'Commissioni eBay totali',
    row4:         'Tasso medio di commissione',
    row5:         'Risparmio annuo est.',
    insightTitle: 'Quanto potresti risparmiare',
    insightText:  (s, m) => `Aprendo il tuo e-commerce, potresti risparmiare circa ${s} EUR all'anno in commissioni eBay - ovvero ${m} EUR al mese.`,
    cta:          'Pronto a recuperare i tuoi margini? -> www.beassistscan.com',
  },
};

function getLang(lang) {
  const code = (lang || 'fr').toLowerCase().split('-')[0];
  return TRANSLATIONS[code] || TRANSLATIONS['fr'];
}

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

function drawHeader(doc, T) {
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
      .text(T.subtitle, MARGIN, 62);

  // Date badge
  const locale = T === TRANSLATIONS.en ? 'en-GB' : T === TRANSLATIONS.de ? 'de-DE' : T === TRANSLATIONS.es ? 'es-ES' : T === TRANSLATIONS.it ? 'it-IT' : 'fr-FR';
  const dateStr = new Date().toLocaleDateString(locale, { day:'numeric', month:'long', year:'numeric' });
  doc.fontSize(8).font('Helvetica')
     .fillColor('#C4B5FD')
     .text(dateStr, MARGIN, 83);

  return H;
}

function drawInfoBand(doc, y, email, storeName, T) {
  const H = 52;
  doc.rect(0, y, PAGE_W, H).fill(BRAND.bg);
  doc.rect(0, y, 4, H).fill(BRAND.violet); // bord gauche colore

  doc.fontSize(9).font('Helvetica').fillColor(BRAND.grayLight)
    .text(T.storeLabel, MARGIN + 10, y + 10, { continued: true })
     .font('Helvetica-Bold').fillColor(BRAND.gray)
    .text(` ${storeName || T.storeDefault}`, { continued: false });

  doc.fontSize(9).font('Helvetica').fillColor(BRAND.grayLight)
    .text(T.emailLabel, MARGIN + 10, y + 29, { continued: true })
     .font('Helvetica-Bold').fillColor(BRAND.gray)
     .text(` ${email}`, { continued: false });

  return y + H;
}

function drawStatCards(doc, y, data, T) {
  const GAP   = 12;
  const CW    = (INNER_W - GAP * 2) / 3;
  const CH    = 92;
  const cards = [
    { label: T.card1Label, value: data.totalSales,   bg: BRAND.bg,      valColor: BRAND.dark,  sub: T.card1Sub },
    { label: T.card2Label, value: data.totalFees,    bg: BRAND.redBg,   valColor: BRAND.red,   sub: T.card2Sub },
    { label: T.card3Label, value: data.annualSaving, bg: BRAND.greenBg, valColor: BRAND.green, sub: T.card3Sub },
  ];

  y += 20;
  cards.forEach((c, i) => {
    const x = MARGIN + i * (CW + GAP);
    // Carte
    doc.roundedRect(x, y, CW, CH, 8).fill(c.bg);
    doc.roundedRect(x, y, CW, CH, 8).strokeColor(BRAND.border).lineWidth(1).stroke();

    // Label
    doc.fontSize(8.5).font('Helvetica').fillColor(BRAND.grayLight)
       .text(c.label, x + 12, y + 12, { width: CW - 24, lineBreak: false });

    // Valeur
    doc.fontSize(21).font('Helvetica-Bold').fillColor(c.valColor)
       .text(`${c.value.toFixed(2)} EUR`, x + 12, y + 30, { width: CW - 24, lineBreak: false });

    // Sous-label
    doc.fontSize(7.5).font('Helvetica').fillColor(BRAND.grayLight)
       .text(c.sub, x + 12, y + 68, { width: CW - 24, lineBreak: false });
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

function drawDetailTable(doc, y, data, T) {
  y = drawDivider(doc, y, T.divider);

  const rows = [
    [T.row1, `${data.rowCount || 'N/A'}`],
    [T.row2, `${data.totalSales.toFixed(2)} EUR`],
    [T.row3, `${data.totalFees.toFixed(2)} EUR`],
    [T.row4, `${data.totalSales > 0 ? ((data.totalFees/data.totalSales)*100).toFixed(1) : 0} %`],
    [T.row5, `${data.annualSaving.toFixed(2)} EUR`],
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

function drawInsightBox(doc, y, data, T) {
  y += 24;
  const BH = 100;
  // fond violet degrade simule
  doc.roundedRect(MARGIN, y, INNER_W, BH, 10).fill(BRAND.dark);
  doc.roundedRect(MARGIN, y, 5, BH, 3).fill(BRAND.violet);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(BRAND.white)
    .text(T.insightTitle, MARGIN + 18, y + 14, { width: INNER_W - 30, lineBreak: false });

  doc.fontSize(9.5).font('Helvetica').fillColor('#C4B5FD')
     .text(
      T.insightText(data.annualSaving.toFixed(2), (data.annualSaving/12).toFixed(2)),
       MARGIN + 18, y + 36,
       { width: INNER_W - 36 }
     );

  return y + BH;
}

function drawCTA(doc, y, T) {
  y += 20;
  const BH = 50;
  doc.roundedRect(MARGIN, y, INNER_W, BH, 8).fill(BRAND.violet);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BRAND.white)
    .text(T.cta, MARGIN, y + 19, {
       width: INNER_W, align: 'center', lineBreak: false
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
function generateReport(data, email, storeName, lang) {
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
      const T = getLang(lang);
      y = drawHeader(doc, T);
      y = drawInfoBand(doc, y, email, storeName, T);
      y = drawStatCards(doc, y, data, T);
      y = drawDetailTable(doc, y, data, T);
      y = drawInsightBox(doc, y, data, T);
      y = drawCTA(doc, y, T);
      drawFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateReport };