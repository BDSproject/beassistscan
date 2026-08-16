const crypto = require('crypto');
const rawKey = process.env.EBAY_PRIVATE_KEY || '';

let rawBase64 = rawKey.replace(/\\n/g, '').replace(/\n/g, '').replace(/-----.*?-----/g, '').replace(/\s+/g, '');

const pkcs8 = `-----BEGIN PRIVATE KEY-----\n${rawBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;

try {
  crypto.createPrivateKey(pkcs8);
  console.log("Success with PKCS#8!");
} catch (e) {
  console.log("Failed PKCS8:", e.message);
}

