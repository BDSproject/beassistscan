const fs = require('fs');
const file = 'src/services/ebay.service.js';
let content = fs.readFileSync(file, 'utf8');

const regexRefresh = /static async getTransactions/m;

const newRefresh = `static async refreshAccessToken(refreshToken) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const scopes = [
        'https://api.ebay.com/oauth/api_scope', 
        'https://api.ebay.com/oauth/api_scope/sell.finances',
      ];
      const tokenResponse = await auth.getAccessToken(env, refreshToken, scopes);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur refresh token eBay (oauth-client):', error);
      throw new Error('Impossible de rafraichir le token eBay');
    }
  }

  static getAuthUrl(state) {
    const auth = this.getAuthClient();
    const env = this.getEnvironment();
    const scopes = [
      'https://api.ebay.com/oauth/api_scope', 
      'https://api.ebay.com/oauth/api_scope/se      'https://api.ebay.com/oauthut      'https://api.ebzatio      'https://api.ebay.com/oauth/api_scope})      'https://api.ebay.com/oauth/api_scoconte      'https://api.ebay.com/oauth/api_scope/se      riteFileSync(file, content);
