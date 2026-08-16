const crypto = require('crypto');
const { privateKey } = crypto.generateKeyPairSync('ed25519');
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
console.log(pem);
const sig = crypto.sign(null, Buffer.from('test'), pem).toString('base64');
console.log(sig);
