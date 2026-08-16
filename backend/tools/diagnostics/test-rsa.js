const crypto = require('crypto');
const raw = "MIIEowIBAAKCAQEAxI5Po6wRx6lkvP"; // just checking if Node accepts it with RSA PRIVATE KEY or PRIVATE KEY
// We will grab the env var
const rawKey = process.env.EBAY_PRIVATE_KEY;
if (!rawKey) { console.log("no key"); process.exit(1); }

let rawBase64 = rawKey.replace(/\\n/g, '').replace(/\n/g, '').replace(/-----BEGIN (.*?)-----/g, '').replace(/-----END (.*?)-----/g, '').replace(/\s+/g, '').trim();

try {
  const pkcs1 = `-----BEGIN RSA PRIVATE KEY-----\n${rawBase64.match(/.{1,64}/g).join('\n')}\n-----END RSA PRIVATE KEY-----\n`;
  crypto.createPrivateKey(pkcs1);
  console.log("Success with PKCS#1 format (RSA PRIVATE KEY)!");
} catch (e) {
  console.log("Failed PKCS1:", e.message);
}

try {
  const pkcs8 = `-----BEGIN PRIVATE KEY-----\n${rawBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
  crypto.createPrivateKey(pkcs8);
  console.log("Success with PKCS#8 format (PRIVATE KEY)!");
} catch (e) {
  console.log("Failed PK  console.log("Faile
