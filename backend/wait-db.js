/**
 * wait-db.js – attend que PostgreSQL soit accessible avant de démarrer.
 * Retry toutes les 3s pendant max 90s.
 */
const { Client } = require('pg');

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 3000;

async function waitForDB() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL non définie');
    process.exit(1);
  }

  console.log('⏳ Attente de la base de données…');

  for (let i = 1; i <= MAX_RETRIES; i++) {
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.end();
      console.log(`✅ Base de données accessible (tentative ${i})`);
      process.exit(0);
    } catch (err) {
      console.log(`⏳ Tentative ${i}/${MAX_RETRIES} – ${err.message}`);
      await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
    }
  }

  console.error('❌ Base de données inaccessible après 90s – abandon');
  process.exit(1);
}

waitForDB();
