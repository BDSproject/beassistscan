const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true pour 465, false pour autres
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