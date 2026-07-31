const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');  
const path = require('path');
const reportRoutes = require('./routes/report.routes');
const ebayRoutes = require('./routes/ebay.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const paymentRoutes = require('./routes/payment.routes');

// Trust proxy, obligatoire sur Railway
const app = express();
app.set('trust proxy', 1);

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

// Sert le frontend — cherche dans plusieurs chemins selon l'environnement
const fs = require('fs');
const possibleFrontendPaths = [
  path.join(__dirname, '../../frontend'),   // local : backend/src/ -> ../../frontend
  path.join(__dirname, '../frontend'),       // Railway root dir
  path.join(process.cwd(), 'frontend'),      // Railway depuis /app
  path.join(process.cwd(), '../frontend'),   // Railway depuis /app/backend
];
const frontendPath = possibleFrontendPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || possibleFrontendPaths[0];
console.log('📁 Frontend servi depuis :', frontendPath);
app.use(express.static(frontendPath));

// Middleware pour gérer les erreurs

const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    sameSite: 'lax',
  },
}));

// Routes
app.use('/api', reportRoutes);
app.use('/api/ebay', ebayRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payment', paymentRoutes);

// Toutes les routes non-API renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;