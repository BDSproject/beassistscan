const nodemailer = require('nodemailer');
const fs = require('fs');

// ── Resend via SMTP relay (fonctionne depuis Railway) ──────────────
// Si RESEND_API_KEY est défini → smtp.resend.com:465
// Sinon fallback SMTP o2switch
function createTransporter() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
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

  const from = process.env.RESEND_API_KEY
    ? 'BeassistScan <rapport@beassistnow.com>'
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
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: port === 465, // true uniquement pour SSL direct (465)
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  tls: {
    rejectUnauthorized: false, // accepte les certs auto-signés (o2switch)
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReport(email, pdfPath) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: '📊 Votre Rapport de Rentabilité eBay - Beassistscan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h1 style="color: #1E3A8A; text-align: center;">Beassistscan</h1>
        <h2 style="text-align: center; color: #374151;">Voici votre analyse eBay !</h2>
        <p>Bonjour,</p>
        <p>Nous avons analysé vos ventes eBay et le rapport complet est en pièce jointe.</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 14px; color: #DC2626; font-weight: bold;">💡 Le saviez-vous ?</p>
          <p style="font-size: 14px;">En créant votre propre site e-commerce, vous pourriez économiser des milliers d'euros de commissions chaque année.</p>
        </div>
        <p style="text-align: center; color: #6B7280; font-size: 12px;">Beassist Agency - Votre agence web spécialisée e-commerce</p>
        <p style="text-align: center; color: #6B7280; font-size: 12px;"><a href="https://beassistnow.com">https://beassistnow.com</a></p>
      </div>
    `,
    attachments: [
      {
        filename: `Rapport_Beassist_${Date.now()}.pdf`,
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendReport };