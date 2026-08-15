const axios = require('axios');
const EbayAuthToken = require('ebay-oauth-nodejs-client');

const EBAY_API_BASE = process.env.EBAY_ENV === 'production'
  ? 'https://api.ebay.com'
  : 'https://api.sandbox.ebay.com';

const FINANCES_BASE = `${EBAY_API_BASE}/sell/finances/v1`;

class EbayService {
  static getAuthClient() {
    const isProd = process.env.EBAY_ENV === 'production';
    return new EbayAuthToken({
        clientId: isProd ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID,
        clientSecret: isProd ? process.env.EBAY_CLIENT_SECRET_PROD : process.env.EBAY_CLIENT_SECRET,
        redirectUri: isProd ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI,
        env: isProd ? 'PRODUCTION' : 'SANDBOX'
    });
  }

  static getEnvironment() {
    return process.env.EBAY_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';
  }

  static getAuthHeaders(accessToken, method = 'GET', requestUrl = null) {
    const defaultHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const signatureKey = process.env.EBAY_SIGNATURE_KEY;
    let privateKeyPem = process.env.EBAY_PRIVATE_KEY;

    if (!signatureKey || !privateKeyPem || !requestUrl) {
      if (requestUrl && (!signatureKey || !privateKeyPem)) {
        console.warn('⚠️ Signature numérique eBay ignorée : EBAY_SIGNATURE_KEY ou EBAY_PRIVATE_KEY manquant dans l\'environnement.');
      }
      return defaultHeaders;
    }

    try {
      const crypto = require('crypto');
      
      // Nettoyer la clé privée et s'assurer de sa conformité PEM (64 chars par ligne)
      let keyObject = null;
      if (privateKeyPem) {
        // Supprimer toutes les sauts de lignes échappés ou espaces
        privateKeyPem = privateKeyPem.replace(/\\n/g, '').replace(/\n/g, '');
        
        let rawBase64 = privateKeyPem;
        
        // Détecter le format d'origine avant de retirer les en-têtes
        const isPkcs1 = /BEGIN RSA PRIVATE KEY/.test(rawBase64);

        // Retirer les headers et footers s'ils sont collés de manière incorrecte
        rawBase64 = rawBase64.replace(/-----BEGIN PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----END PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----END RSA PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/\s+/g, '');
        rawBase64 = rawBase64.trim();

        const chunks = rawBase64.match(/.{1,64}/g);
        if (!chunks) {
          throw new Error('Clé privée eBay vide ou illisible');
        }

        const header = isPkcs1 ? 'RSA PRIVATE KEY' : 'PRIVATE KEY';
        const pem = `-----BEGIN ${header}-----\n${chunks.join('\n')}\n-----END ${header}-----\n`;

        // Décoder la clé (PKCS#8 : Ed25519 ou RSA — détection automatique)
        keyObject = crypto.createPrivateKey(pem);
      }

      const parsedUrl = new URL(requestUrl);
      const pathWithQuery = parsedUrl.pathname + parsedUrl.search;
      const host = parsedUrl.host;
      const created = Math.floor(Date.now() / 1000);

      const signatureInput = `sig1=("x-ebay-signature-key" "@method" "@path" "@authority");created=${created}`;

      const base = [
        `"x-ebay-signature-key": ${signatureKey}`,
        `"@method": ${method.toUpperCase()}`,
        `"@path": ${pathWithQuery}`,
        `"@authority": ${host}`,
        `"@signature-params": ${signatureInput.replace('sig1=', '')}`
      ].join('\n');

      // Ed25519 => algorithme null ; RSA => RSA-SHA256
      const keyType = keyObject.asymmetricKeyType; // 'ed25519' | 'rsa' | ...
      const algorithm = keyType === 'ed25519' ? null : 'RSA-SHA256';
      const signatureBase64 = crypto
        .sign(algorithm, Buffer.from(base, 'utf8'), keyObject)
        .toString('base64');

      const signatureValue = `sig1=:${signatureBase64}:`;

      console.log(`🔒 Requête eBay signée numériquement avec succès (clé ${keyType}).`);

      return {
        ...defaultHeaders,
        'x-ebay-signature-key': signatureKey,
        'Signature-Input': signatureInput,
        'Signature': signatureValue,
      };
    } catch (err) {
      console.error('❌ Erreur lors de la signature numérique du header eBay:', err);
      return defaultHeaders;
    }
  }

  static async getAccessToken(code) {
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
      const tokenResponse = await auth.getAccessToken(env, refreshToken, scopes);
      return JSON.parse(tokenResponse);
    } catch (error) {
      console.error('Erreur refresh token eBay (oauth-client):', error);
      throw new Error('Impossible de rafraichir le token eBay');
    }
  }

  // Récupère les transactions financières des 90 derniers jours (maximum)
  static async getTransactions(accessToken) {
    const now = new Date();
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const range = `[${from.toISOString()}..${now.toISOString()}]`;
    const filter = encodeURIComponent(`transactionDate:${range},transactionStatus:{PAYOUT}`);
    const url = `${FINANCES_BASE}/transaction?limit=100&sort=transactionDate&filter=${filter}`;

    let transactions = [];
    let nextPageUrl = url;

    while (nextPageUrl) {
      try {
        const response = await axios.get(nextPageUrl, {
          headers: this.getAuthHeaders(accessToken, 'GET', nextPageUrl),
        });
        const data = response.data;
        if (data.transactions) {
          transactions = transactions.concat(data.transactions);
        }
        nextPageUrl =
          (typeof data.next === 'string' && data.next) ||
          (data.next && typeof data.next.href === 'string' && data.next.href) ||
          null;
      } catch (error) {
        const ebayDetails = error.response?.data || error.message;
        console.error('Erreur API Finances eBay:', JSON.stringify(ebayDetails));
        const err = new Error(
          'Erreur API Finances eBay (' + (error.response?.status || 'réseau') + '): ' + JSON.stringify(ebayDetails)
        );
        err.response = error.response;
        throw err;
      }
    }

    return transactions;
  }
}

module.exports = EbayService;