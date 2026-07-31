const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');  
const path = require('path');
const reportRoutes = require('./routes/report.routes');
const ebayRoutes = require('./routes/ebay.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const paymentRoutes = require('./routes/payment.routes');


const app = express();

// Bypass ngrok browser warning page
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use(cors());

// ⚠️ IMPORTANT : Le webhook Stripe doit recevoir le body RAW (avant express.json)
// Cette route doit être déclarée AVANT app.use(express.json())
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // nécessaire pour lire les cookies

// Sert le frontend (fonctionne en local et sur Railway)
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Routes
app.use('/api', reportRoutes);
app.use('/api/ebay', ebayRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payment', paymentRoutes);

// Toutes les routes non-API renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

module.exports = app;