const fs = require('fs');

const servicePath = 'src/services/ebay.service.js';
let content = fs.readFileSync(servicePath, 'utf8');

const regex = /static async getAccessToken\([\s\S]*?\/\/ Récupère les transactions financières des 90 derniers jours \(maximum\)/m;

const newCode = `static async getAccessToken(code) {
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
                                   ut                      refre                                   ut             po                                   ut             rre                                   ut                      refre                                   ut             po               c get                                   ut              t();
    con    con    con    con    con    con    st    con    con    con    con    con    /o    con    con    con    con    con    con    st    con    con    coinances',
    con    con    con    con    con utho    con    con   scopes, { state, prompt: 'login' });
  }

  // Récupère les transactions financières des 90 derniers jours (maximum)`;

content = content.repcontent = content.repcontent = content.repconePath, content);
