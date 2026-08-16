const fs = require('fs');

const servicePath = 'src/services/ebay.service.js';
let serviceCode = fs.readFileSync(servicePath, 'utf8');

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
      co      co      co      cit      co      co      co, r      co      co      co      cit      co      okenR      co      co      co      cit      co      co  ('Erre      co      co      co      cit      co      co      co, r      co      co      co      cit      co      okenR      co      co     get      co      co      co      cit      co      coent();
    const env = this.getEnvironment();
    const    const    const    const    constcom/o    const    const    const    const    constcom/o    const    const    ces',
    ];
    return auth.generateUserAuthorizationUrl(env, scope    return auth.generateUserAuthorizationUrl(env, scope    retuct    return auth.generateUserAuthorizationUrl(env, scope  riteFi    nc(serv    return auth.generateUserAuthorizationUrl(e
