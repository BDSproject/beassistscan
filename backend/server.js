require('dotenv').config();
const app = require('./src/app');

const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
app.listen(port, "0.0.0.0", function () {
  console.log(`🚀 Serveur Beassist lance sur port ${port}`);
});
