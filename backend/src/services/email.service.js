const nodemailer = require('nodemailer');
const fs = require('fs');

// ── Envoi via API HTTP Resend (contourne les blocages de port Railway) ──
async function sendViaResendAPI(to, subject, html, attachments) {
  const https = require('https');
  const payload = {
    from: process.env.RESEND_DOMAIN_VERIFIED === 'true'
      ? 'BeassistScan <rapport@beassistnow.com>'
      : 'BeassistScan <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
    attachments: attachments.map(a => ({
      filename: a.filename,
      content: fs.readFileSync(a.path).toString('base64'),
    })),
  };

  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Resend API error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Fallback SMTP o2switch ──
function createSmtpTransporter() {
  const port = parseInt(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendReport(email, pdfPath) {
  const subject = '📊 Votre Rapport de Rentabilité eBay - BeassistScan';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e1b4b; margin: 0;">Beassist<span style="color: #7c3aed;">Scan</span></h1>
        <p style="color: #6B7280; margin: 4px 0 0;">Votre rapport de rentabilité eBay</p>
      </div>
      <p style="color: #374151;">Bonjour,</p>
      <p style="color: #374151;">Nous avons analysé vos ventes eBay. Votre rapport complet est en pièce jointe (PDF).</p>
      <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
        <p style="font-size: 14px; color: #5b21b6; font-weight: bold; margin: 0 0 8px;">💡 Le saviez-vous ?</p>
        <p style="font-size: 14px; color: #374151; margin: 0;">En créant votre propre boutique e-commerce, vous pourriez économiser des milliers d'euros de commissions eBay chaque année.</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://beassistnow.com" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Découvrir nos solutions →</a>
      </div>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
      <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0;">
        Beassist Agency · Votre agence web spécialisée e-commerce<br>
        <a href="https://beassistnow.com" style="color: #7c3aed;">beassistnow.com</a>
      </p>
    </div>
  `;

  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({ filename: `Rapport_BeassistScan_${Date.now()}.pdf`, path: pdfPath });
  }

  // Priorité : API Resend (HTTP, aucun port bloqué)
  if (process.env.RESEND_API_KEY) {
    await sendViaResendAPI(email, subject, html, attachments);
    return;
  }

  // Fallback SMTP o2switch
  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'contact@beassistnow.com',
    to: email,
    subject,
    html,
    attachments,
  });
}

module.exports = { sendReport };

// ── Resend via SMTP relay (fonctionne depuis Railway) ──────────────
// Si RESEND_API_KEY est défini → smtp.resend.com:465
// Sinon fallback SMTP o2switch
function createTransporter() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true, // SSL direct sur 465
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }
  const port = parseInt(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendReport(email, pdfPath) {
  const transporter = createTransporter();

  // Si RESEND_DOMAIN_VERIFIED=true → domaine perso, sinon domaine Resend par défaut
  const from = process.env.RESEND_API_KEY
    ? (process.env.RESEND_DOMAIN_VERIFIED === 'true'
        ? 'BeassistScan <rapport@beassistnow.com>'
        : 'BeassistScan <onboarding@resend.dev>')
    : (process.env.FROM_EMAIL || 'contact@beassistnow.com');

  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `Rapport_BeassistScan_${Date.now()}.pdf`,
      path: pdfPath,
    });
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: '📊 Votre Rapport de Rentabilité eBay - BeassistScan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e1b4b; margin: 0;">Beassist<span style="color: #7c3aed;">Scan</span></h1>
          <p style="color: #6B7280; margin: 4px 0 0;">Votre rapport de rentabilité eBay</p>
        </div>
        <p style="color: #374151;">Bonjour,</p>
        <p style="color: #374151;">Nous avons analysé vos ventes eBay. Votre rapport complet est en pièce jointe (PDF).</p>
        <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <p style="font-size: 14px; color: #5b21b6; font-weight: bold; margin: 0 0 8px;">💡 Le saviez-vous ?</p>
          <p style="font-size: 14px; color: #374151; margin: 0;">En créant votre propre boutique e-commerce, vous pourriez économiser des milliers d'euros de commissions eBay chaque année.</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://beassistnow.com" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Découvrir nos solutions →</a>
        </div>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
        <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0;">
          Beassist Agency · Votre agence web spécialisée e-commerce<br>
          <a href="https://beassistnow.com" style="color: #7c3aed;">beassistnow.com</a>
        </p>
      </div>
    `,
    attachments,
  });
}

module.exports = { sendReport };