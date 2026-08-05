require('dotenv').config();
const app = require('./app');

// Use PORT provided in environment or default to 3000
const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
app.listen(port, "0.0.0.0", function () {
  console.log(`🚀 Serveur Beassist lance sur port http://localhost:${port}`);
});
