const fs = require('fs');
const file = 'src/services/ebay.service.js';
let content = fs.readFileSync(file, 'utf8');

const regexAccessToken = /static async getAccessToken\(code\) \{[\s\S]*?return response\.data;\n    \} catch \(error\) \{[\s\S]*?\}\n  \}/m;

const newAccessToken = `static async getAccessToken(code) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const tokenResponse = await auth.exchangeCodeForAccessToken(env, code);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur token eBay (oauth-client):', error);
      throw new Error('Impossible d\\’obtenir le token eBay');
    }
  }`;

content = content.replace(regexAccessToken, newAccessToken);
fs.writeFileSync(file, content);
