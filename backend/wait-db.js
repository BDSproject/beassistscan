/**
 * wait-db.js – Attend que PostgreSQL soit accessible avant de démarrer.
 * Version améliorée : détecte automatiquement si SSL est requis, 
 * et ne bloque pas le démarrage de l'app si les vérifications échouent.
 */
const { Client } = require('pg');

const MAX_RETRIES = 15;
const RETRY_INTERVAL_MS = 2000;

async function tryConnect(url, useSSL) {
  const client = new Client({
    connectionString: url,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    return false;
  }
}

async function waitForDB() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('⚠️ DATABASE_URL non définie. Démarrage de l\'application direct...');
    process.exit(0);
  }

  console.log('⏳ Vérification de la disponibilité de la base de données…');

  // Déterminer le mode SSL par défaut selon l'hôte (public proxy vs réseau privé)
  const isPublicProxy = url.includes('proxy.rlwy.net') || url.includes('public.rlwy') || url.includes('amazonaws.com');
  const defaultSSL = isPublicProxy;

  for (let i = 1; i <= MAX_RETRIES; i++) {
    // Essayer d'abord la méthode préconisée
    let ok = await tryConnect(url, defaultSSL);
    if (!ok) {
      // Essayer le mode alternatif (avec ou sans SSL) en cas d'échec
      ok = await tryConnect(url, !defaultSSL);
    }

    if (ok) {
      console.log(`✅ Base de données accessible de manière vérifiée.`);
      process.exit(0);
    }

    console.log(`⏳ [${i}/${MAX_RETRIES}] Base de données indisponible temporairement, nouvelle tentative...`);
    await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
  }

  console.warn('⚠️ La base de données ne répond pas aux vérifications initiales.');
  console.warn('⚠️ Passage outre pour laisser Prisma de l\'application gérer ses propres reconnexions.');
  process.exit(0); // Exit 0 pour ne pas planter le déploiement Railway !
}

waitForDB();
