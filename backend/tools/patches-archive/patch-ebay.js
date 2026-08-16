const fs = require('fs');

const servicePath = 'src/services/ebay.service.js';
let serviceCode = fs.readFileSync(servicePath, 'utf8');

serviceCode = serviceCode.replace(/static async getAccessToken[\s\S]*?\/\/ Récupère les transactions financières/, `static async getAccessToken(code) {
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
      const tokenResponse = await aut      const tokenResponse = hT      const token    return      const tokenResponse = await aut      cor) {
                                                        ien                                                        ien                                                        ien                                 ent(        on                                       st                                      m/o                                                        ien                 ,
    ];
    return auth.generateUserAuthorizationUrl(env, scope    return auth.generateUserAuthorizationUrl(env, scope    ansact    return auth.generateUserAuthorizationUrl(env, scope   eCode);

const rconst rconst rconst rconst rconst rconst rco routeconst rcfs.readFileSync(routesPath, 'utf8');

routerouterouterouterouterouterouterouRoute d'routerouterouterouterge vers eBay[\s\S]*?\/\/ Route de callback/, `// RorouterouterouterouterouterouterouterouRoute d'routerouter', (rrouterouterouteroonrouterouterouterouterouterouterouterouRoute d'routerouterouterouterge vers eBay[\s\S]*?\/\/ Route de callback/, `// Rorouterouterouterouteroutonst url = EbayService.getAuthUrl(state);
  console.log('🔗 URL de redirection eBay :', url);
  res.redirect(url);
});

// Route de callback`);

fs.writeFileSync(routesPath, routesCode);
