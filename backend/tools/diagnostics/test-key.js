const crypto = require('crypto');
let raw = process.env.EBAY_PRIVATE_KEY || '';
console.log("Raw length:", raw.length);
console.log("Starts with:", raw.substring(0, 30));
