const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const crypto = require('crypto');

const sigKey = process.env.EBAY_SIGNATURE_KEY;
let key = process.env.EBAY_PRIVATE_KEY;

console.log('EBAY_SIGNATURE_KEY présent :', !!sigKey, sigKey ? `(${sigKey.length} chars)` : '');
console.log('EBAY_PRIVATE_KEY présent  :', !!key, key ? `(${key.length} chars)` : '');

if (!key) {
  console.log('❌ Pas de clé privée dans .env — impossible de tester localement.');
  process.exit(0);
}

console.log('Début clé :', key.substring(0, 45));

// Même logique de nettoyage que ebay.service.js
key = key.replace(/\\n/g, '').replace(/\n/g, '');
const isPkcs1 = /BEGIN RSA PRIVATE KEY/.test(key);
let rawBase64 = key
  .replace(/-----BEGIN PRIVATE KEY-----/g, '')
  .replace(/-----END PRIVATE KEY-----/g, '')
  .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
  .replace(/-----END RSA PRIVATE KEY-----/g, '')
  .replace(/\s+/g, '')
  .trim();

console.log('Base64 brut :', rawBase64.length, 'chars — format détecté :', isPkcs1 ? 'PKCS#1 (RSA)' : 'PKCS#8');

const chunks = rawBase64.match(/.{1,64}/g);
const header = isPkcs1 ? 'RSA PRIVATE KEY' : 'PRIVATE KEY';
const pem = `-----BEGIN ${header}-----\n${chunks.join('\n')}\n-----END ${header}-----\n`;

try {
  const keyObject = crypto.createPrivateKey(pem);
  console.log('✅ Clé décodée avec succès — type :', keyObject.asymmetricKeyType);
  const algorithm = keyObject.asymmetricKeyType === 'ed25519' ? null : 'RSA-SHA256';
  const sig = crypto.sign(algorithm, Buffer.from('test'), keyObject).toString('base64');
  console.log('✅ Signature test OK :', sig.substring(0, 40) + '...');
} catch (e) {
  console.error('❌ Échec décodage/signature :', e.message);
}
