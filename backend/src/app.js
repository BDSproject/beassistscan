const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');  
const compression = require('compression');
const path = require('path');
const reportRoutes = require('./routes/report.routes');
const ebayRoutes = require('./routes/ebay.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const paymentRoutes = require('./routes/payment.routes');
const authRoutes = require('./routes/auth.route');
const i18nRoutes = require('./routes/i18n.routes');

// Trust proxy, obligatoire sur Railway
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const SITE_HOST = 'beassistscan.com';
const TRACKING_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
]);

// SEO/Canonical redirects: HTTPS + host + nettoyage des paramètres de tracking
app.use((req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const host = String(req.headers.host || '').toLowerCase();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();

  if (isProd && forwardedProto && forwardedProto !== 'https') {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  if (isProd && (host === 'www.beassistscan.com' || host.startsWith('www.beassistscan.com:'))) {
    return res.redirect(301, `https://${SITE_HOST}${req.originalUrl}`);
  }

  if (req.method === 'GET') {
    const query = new URLSearchParams(req.query);
    let changed = false;

    for (const param of TRACKING_QUERY_PARAMS) {
      if (query.has(param)) {
        query.delete(param);
        changed = true;
      }
    }

    if (changed) {
      const cleanQuery = query.toString();
      const cleanUrl = cleanQuery ? `${req.path}?${cleanQuery}` : req.path;
      return res.redirect(301, cleanUrl);
    }
  }

  next();
});

// 🛡️ En-têtes de sécurité (XSS, clickjacking, MIME sniffing...)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tailwindcss.com', 'https://accounts.google.com'],
      scriptSrcAttr: ["'unsafe-inline'"], // onclick= utilisés dans les pages
      styleSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://accounts.google.com'],
      frameSrc: ['https://accounts.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // requis pour Google Sign-In
}));

// Bypass ngrok browser warning page
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// 🛡️ CORS restreint à nos domaines (plus d'accès cross-origin libre)
const ALLOWED_ORIGINS = [
  'https://www.beassistscan.com',
  'https://beassistscan.com',
];
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:8080');
}
app.use(cors({
  origin: (origin, cb) => {
    // Requêtes same-origin/serveur (pas d'en-tête Origin) : autorisées
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Origine non autorisée par CORS'));
  },
  credentials: true,
}));

// 🛡️ Limitation de débit : anti brute-force sur l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,                  // 20 tentatives max / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});
// Limite globale API (anti-abus)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/resend-verification', authLimiter);
app.use('/auth/google', authLimiter);
app.use('/api', apiLimiter);

// ⚠️ IMPORTANT : Le webhook Stripe doit recevoir le body RAW (avant express.json)
// Cette route doit être déclarée AVANT app.use(express.json())
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser()); // nécessaire pour lire les cookies
app.use(compression());

// 📚 Blog : /blog et /blog/ redirigent vers la langue (fr par défaut)
app.get(['/blog', '/blog/'], (req, res) => {
  const supported = ['fr', 'en', 'es', 'de', 'it'];
  const accept = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  const lang = supported.includes(accept) ? accept : 'fr';
  res.redirect(302, `/blog/${lang}/`);
});

// Canonical SEO pour les versions blog sans slash ou avec index.html
app.get('/blog/:lang', (req, res, next) => {
  const supported = new Set(['fr', 'en', 'es', 'de', 'it']);
  const lang = String(req.params.lang || '').toLowerCase();
  if (!supported.has(lang)) return next();
  return res.redirect(301, `/blog/${lang}/`);
});

app.get('/blog/:lang/index.html', (req, res, next) => {
  const supported = new Set(['fr', 'en', 'es', 'de', 'it']);
  const lang = String(req.params.lang || '').toLowerCase();
  if (!supported.has(lang)) return next();
  return res.redirect(301, `/blog/${lang}/`);
});

// Sert le frontend depuis backend/public/ (copie du dossier frontend/)
const frontendPath = path.join(__dirname, '../public');
console.log('📁 Frontend servi depuis :', frontendPath);
app.use(express.static(frontendPath, {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  },
}));

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
app.use('/auth', authRoutes);
app.use('/api/i18n', i18nRoutes);

// Toutes les routes non-API inconnues renvoient une vraie 404 HTML
app.get('*', (req, res) => {
  // Ne jamais renvoyer index.html pour les routes API ou les fichiers manquants
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'Route introuvable' });
  }
  return res.status(404).sendFile(path.join(frontendPath, '404.html'));
});

module.exports = app;