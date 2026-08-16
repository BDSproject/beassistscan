const crypto = require('crypto');
const rawKey = process.env.EBAY_PRIVATE_KEY || '';

let rawBase64 = rawKey.replace(/\\n/g, '').replace(/\n/g, '').replace(/-----.*?-----/g, '').replace(/\s+/g, '');

const pkcs1 = `-----BEGIN RSA PRIVATE KEY-----\n${rawBase64.match(/.{1,64}/g).join('\n')}\n-----END RSA PRIVATE KEY-----\n`;

try {
  crypto.createPrivateKey(pkcs1);
  console.log("Success with PKCS#1!");
} catch (e) {
  console.log("Failed PKCS1:", e.message);
}

