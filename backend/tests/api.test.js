require('dotenv').config();
const request = require('supertest');

// ── MOCKS ───────────────────────────────────────────────────────────

// Mock de connect-pg-simple pour éviter d'instancier PostgreSQL en mode test
jest.mock('connect-pg-simple', () => {
  return () => {
    return function MockPgStore() {
      this.get = (sid, cb) => cb(null, null);
      this.set = (sid, sess, cb) => cb && cb(null);
      this.destroy = (sid, cb) => cb && cb(null);
      this.on = () => {};
    };
  };
});

// Mock Prisma Client complet pour simuler la BDD, déclaré pour éviter l'erreur d'initialisation
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user_123', email: 'test@test.com' }),
    },
    ebayToken: {
      create: jest.fn().mockResolvedValue({ id: 'token_123' }),
      findFirst: jest.fn().mockResolvedValue({
        accessToken: 'fake_access',
        refreshToken: 'fake_refresh',
        expiresAt: new Date(Date.now() + 3600000),
      }),
    },
    lead: {
      create: jest.fn().mockResolvedValue({ id: 'lead_123' }),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({ id: 'lead_123' }),
    },
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mPrisma),
  };
});

const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Ceci récupère l'instance mocked

// Mock Stripe Service
jest.mock('../src/services/stripe.service', () => ({
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.test' }),
      retrieve: jest.fn().mockResolvedValue({
        payment_status: 'paid',
        customer_details: { email: 'test@stripe.com' },
        metadata: { storeName: 'Store Test', plan: 'report' },
      }),
    },
  },
  webhooks: {
    constructEvent: jest.fn().mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          payment_status: 'paid',
          customer_details: { email: 'test@stripe.com' },
          metadata: { storeName: 'Store Test', plan: 'report' },
        },
      },
    }),
  },
}));

// Mock Email Service
jest.mock('../src/services/email.service', () => ({
  sendReport: jest.fn().mockResolvedValue(true),
}));

// Mock PDF Service
jest.mock('../src/services/pdf.service', () => ({
  generateReport: jest.fn().mockResolvedValue('/tmp/fake-report.pdf'),
}));

// Mock eBay Service
jest.mock('../src/services/ebay.service', () => ({
  getAccessToken: jest.fn().mockResolvedValue({
    access_token: 'fake_access',
    refresh_token: 'fake_refresh',
    expires_in: 7200,
  }),
  refreshAccessToken: jest.fn().mockResolvedValue({
    access_token: 'refreshed_access',
    refresh_token: 'refreshed_refresh',
    expires_in: 7200,
  }),
  getTransactions: jest.fn().mockResolvedValue([
    { amount: { value: '100' }, feeAmount: { value: '10' } },
  ]),
}));

// ── TESTS ───────────────────────────────────────────────────────────

describe('🧪 BeassistScan API Route Test Suite', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. i18n Routes
  describe('🌐 Routes i18n', () => {
    it('GET /api/i18n - doit retourner toutes les langues', async () => {
      const res = await request(app).get('/api/i18n');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('fr');
      expect(res.body).toHaveProperty('en');
    });

    it('GET /api/i18n/fr - doit retourner le dictionnaire francais', async () => {
      const res = await request(app).get('/api/i18n/fr');
      expect(res.statusCode).toBe(200);
      expect(res.body['nav.blog']).toBeDefined(); // Vérifie une clé réelle du translations.js
    });
  });

  // 2. Auth Routes
  describe('🔑 Routes d\'Authentification', () => {
    it('POST /auth/register - validation si donnees manquantes', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('requis');
    });

    it('POST /auth/login - validation si donnees manquantes', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('requis');
    });

    it('GET /auth/me - retourner user null si non connecte', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeNull();
    });

    it('POST /auth/logout - deconnexion reussie', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 3. Reports & Upload Routes
  describe('📄 Routes de Rapports et Upload', () => {
    it('GET /api/reports - doit retourner 401 si non connecte', async () => {
      const res = await request(app).get('/api/reports');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toContain('Non connecté');
    });

    it('POST /api/upload-report - doit valider l\'absence de fichier', async () => {
      const res = await request(app)
        .post('/api/upload-report')
        .field('email', 'test@test.com');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Aucun fichier CSV');
    });
  });

  // 4. eBay Integration Routes
  describe('🔌 Routes d\'Integration eBay', () => {
    it('GET /api/ebay/auth - doit rediriger vers eBay OAuth', async () => {
      const res = await request(app).get('/api/ebay/auth');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('ebay');
    });

    it('GET /api/ebay/callback - doit lever une erreur s\'il n\'y a pas de code', async () => {
      const res = await request(app).get('/api/ebay/callback');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('connected=false');
    });

    it('POST /api/ebay/generate-report-ebay - validation email', async () => {
      const res = await request(app)
        .post('/api/ebay/generate-report-ebay')
        .send({ storeName: 'test' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Email requis');
    });

    it('POST /api/ebay/generate-report-ebay - OK en mode test', async () => {
      const res = await request(app)
        .post('/api/ebay/generate-report-ebay?test=true')
        .send({ email: 'test@test.com', storeName: 'Boutique Test' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 5. Payment Routes (Stripe)
  describe('💳 Routes de Paiement (Stripe)', () => {
    it('GET /api/payment/checkout - doit rediriger vers Stripe', async () => {
      process.env.STRIPE_PRICE_REPORT = 'price_fake_123';
      const res = await request(app)
        .get('/api/payment/checkout')
        .query({ plan: 'report', email: 'test@test.com' });
      expect(res.statusCode).toBe(303);
      expect(res.headers.location).toBe('https://checkout.stripe.test');
    });

    it('POST /api/payment/create-checkout-session - doit creer une session et renvoyer l\'URL', async () => {
      process.env.STRIPE_PRICE_REPORT = 'price_fake_123';
      const res = await request(app)
        .post('/api/payment/create-checkout-session')
        .send({ plan: 'report', email: 'test@test.com' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('url');
      expect(res.body.url).toBe('https://checkout.stripe.test');
    });

    it('GET /api/payment/success - doit afficher la page de succes sur session_id', async () => {
      const res = await request(app)
        .get('/api/payment/success')
        .query({ session_id: 'sess_123' });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Paiement');
    });

    it('GET /api/payment/cancel - doit rediriger vers l\'accueil', async () => {
      const res = await request(app).get('/api/payment/cancel');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('cancelled=true');
    });

    it('POST /api/payment/webhook - doit repondre 200 sur webhook Stripe', async () => {
      const res = await request(app)
        .post('/api/payment/webhook')
        .set('stripe-signature', 'fake_sig')
        .send({ id: 'evt_123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });

  // 6. Marketplace Notification Routes (GDPR)
  describe('🛡️ Routes de Conformite GDPR eBay', () => {
    it('GET /api/notifications/marketplace-deletion - doit gerer le challenge de validation', async () => {
      const res = await request(app)
        .get('/api/notifications/marketplace-deletion')
        .query({ challenge_code: 'challenge_123' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('challengeResponse');
    });

    it('POST /api/notifications/marketplace-deletion - doit repondre 200 sur reception de notification', async () => {
      const res = await request(app)
        .post('/api/notifications/marketplace-deletion')
        .send({ user: 'dummy' });
      expect(res.statusCode).toBe(200);
    });
  });

});
