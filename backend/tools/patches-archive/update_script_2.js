const fs = require('fs');
const file = 'src/services/ebay.service.js';
let content = fs.readFileSync(file, 'utf8');

const regexRefresh = /static async refreshAccessToken\(refreshToken\) \{[\s\S]*?return response\.data;\n    \} catch \(error\) \{[\s\S]*?\}\n  \}/m;

const newRefresh = `static async refreshAccessToken(refreshToken) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const scopes = [
        'https://api.ebay.com/oauth/api_scope', 
        'https://api.ebay.com/oauth/api_scope/sell.finances',
      ].join(' ');
      const tokenResponse = await auth.getAccessToken(env, refreshToken, scopes);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur refresh token eBay (oauth-client):', error);
      throw new Error('Impossible de rafraichir le token eBay');
    }
  }`;

content = content.replace(regexRefresh, newRefresh);
fs.writeFileSync(file, content);
