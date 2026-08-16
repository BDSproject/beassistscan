const crypto = require('crypto');
const rawKey = process.env.EBAY_PRIVATE_KEY || '';
console.log("Full input length:", rawKey.length);

let cleaned = rawKey.replace(/\\n/g, '').replace(/\n/g, '').replace(/\s+/g, '').replace(/-----.*?-----/g, '');
console.log("Cleaned base64 length:", cleaned.length);

console.log("Last 20 chars:", cleaned.substring(cleaned.length - 20));

