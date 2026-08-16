const nodemailer = require('nodemailer');
const fs = require('fs');

// ── Envoi via API HTTP Resend (contourne les blocages de port Railway) ──
async function sendViaResendAPI(to, subject, html, attachments) {
  const https = require('https');
  const payload = {
    from: String(process.env.RESEND_DOMAIN_VERIFIED || '').toLowerCase() === 'true'
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
    console.log(`📧 Resend API → to: ${to}, attachments: ${payload.attachments.length}, from: ${payload.from}`);
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
    const stats = fs.statSync(pdfPath);
    console.log(`📄 PDF trouvé: ${pdfPath} (${stats.size} octets)`);
    attachments.push({ filename: `Rapport_BeassistScan_${Date.now()}.pdf`, path: pdfPath });
  } else {
    console.warn(`⚠️ PDF absent ou chemin vide: "${pdfPath}"`);
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

// ── Envoi générique (sans pièce jointe) ──
async function sendMail(to, subject, html) {
  if (process.env.RESEND_API_KEY) {
    await sendViaResendAPI(to, subject, html, []);
    return;
  }
  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'contact@beassistnow.com',
    to,
    subject,
    html,
  });
}

// ── Email de vérification d'adresse ──
async function sendVerificationEmail(email, token) {
  const rawDomain = process.env.DOMAIN || 'localhost:3000';
  const domain = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;
  const verifyUrl = `${domain}/auth/verify?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e1b4b; margin: 0;">Beassist<span style="color: #7c3aed;">Scan</span></h1>
        <p style="color: #6B7280; margin: 4px 0 0;">Confirmez votre adresse email</p>
      </div>
      <p style="color: #374151;">Bonjour,</p>
      <p style="color: #374151;">Merci de vous être inscrit sur BeassistScan ! Pour activer votre compte et accéder à votre tableau de bord, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Confirmer mon email</a>
      </div>
      <p style="color: #6B7280; font-size: 13px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/><a href="${verifyUrl}" style="color: #7c3aed; word-break: break-all;">${verifyUrl}</a></p>
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
    </div>
  `;
  await sendMail(email, '✉️ Confirmez votre email - BeassistScan', html);
}

module.exports = { sendReport, sendMail, sendVerificationEmail };