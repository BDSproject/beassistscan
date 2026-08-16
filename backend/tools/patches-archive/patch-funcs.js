const fs = require('fs');
const file = 'src/services/ebay.service.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/static async getAccessToken\([\s\S]*?\/\/ Récupère les transactions financières/, `static async getAccessToken(code) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const tokenResponse = await auth.exchangeCodeForAccessToken(env, code);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur token eBay (oauth-client):', error);
      throw new Error('Impossible d’obtenir le token eBay');
    }
  }

  static async refreshAccessToken(refreshToken) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const scopes = [
        'https://api.ebay.com/oauth/api_scope', 
        'https://api.ebay.com/oauth/api_scope/sell.finances',
      ].join(' ');
      const tokenResponse = await auth.getAccessToken(env, refreshToke      const tokenResponse = a.p      const tokenRespons }      const tokenResponse = await auth.getAr refresh token eBay (oauth-client):', error)      const tokenResponse = await auth.getAccessToken(env, refreshToke      const tokenResponse = a.p      const tokenRespons }      const tot(      coon      const tokenResponse = await a const      const tokenResponse = await aucom/o      const tokenResponse = await auth.getAccessToken(env, refreshToke      ,
      const tokenResponse = await auutho      const tokenRespe      const tokenResponse = await auutho      const tokenReansactions financières`);
fs.writeFileSync(file, code);
