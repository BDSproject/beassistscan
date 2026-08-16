import re

with open('src/services/ebay.service.js', 'r') as f:
    content = f.read()

# Replace getAccessToken
content = re.sub(
    r"static async getAccessToken\(code\) \{.*?return response\.data;\n    \} catch \(error\) \{.*?\n      \);\n      throw new Error\('Impossible d’obtenir le token eBay'\);\n    \}\n  \}",
    """static async getAccessToken(code) {
    try {
      const auth = this.getAuthClient();
      const env = this.getEnvironment();
      const tokenResponse = await auth.exchangeCodeForAccessToken(env, code);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur token eBay (oauth-client):', error);
      throw new Error('Impossible d’obtenir le token eBay');
    }
  }""",
    content,
    flags=re.DOTALL
)

# Replace refreshAccessToken
content = re.sub(
    r"static async refreshAccessToken\(refreshToken\) \{.*?return response\.data;\n    \} catch \(error\) \{.*?\n      \);\n      throw new Error\('Impossible de rafraichir le t    r"static async re\n  \}",
                                                 en) {
                       uth                       ;
                =                 =                 =                 =                 =                 =                 =                 =                 =                 =                 =          oken                =                 =   nv, refreshToke                =              arse(token                =                 =    co                =                 =                 =                 =   ow n                =                 =   to                =   }

  static getAuthUrl(state) {
    const auth = this.getAuthClient    const auth = this.getAuthClient    const auth = this.getA [          tps:    consty.com/oauth/api_scope', 
                             au                l.                             au                l.                             au                l.                             au                l.                             au                l.          f.write(content)
