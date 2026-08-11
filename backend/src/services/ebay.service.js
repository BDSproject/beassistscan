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
        redirectUri: isProd ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI
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
      if (privateKeyPem) {
        // Supprimer toutes les sauts de lignes échappés ou espaces
        privateKeyPem = privateKeyPem.replace(/\\n/g, '').replace(/\n/g, '');
        
        let rawBase64 = privateKeyPem;
        
        // Retirer les headers et footers s'ils sont collés de manière incorrecte
        rawBase64 = rawBase64.replace(/-----BEGIN PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----END PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----BEGIN RSA PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/-----END RSA PRIVATE KEY-----/g, '');
        rawBase64 = rawBase64.replace(/\s+/g, '');
        rawBase64 = rawBase64.trim();

        // eBay délivre généralement des clés Ed25519 par défaut (PKCS#8 sans mot de passe).
        const chunks = rawBase64.match(/.{1,64}/g);
        if (chunks) {
            // Revenir à RSA pour gérer la clé eBay de l'utilisateur (d'après son en-tête)
            privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----\n${chunks.join('\n')}\n-----END RSA PRIVATE KEY-----\n`;
        }
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
        `"@signature-params": ("x-ebay-signature-key" "@method" "@path" "@authority");created=${created}`
      ].join('\n');

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(base);
      signer.end();
      const signatureBase64 = signer.sign(privateKeyPem, 'base64');

      const signatureValue = `sig1=:${signatureBase64}:`;

      console.log('🔒 Requête eBay signée numériquement avec succès.');

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
    const isProd = process.env.EBAY_ENV === 'production';
    const clientId = isProd ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID;
    const clientSecret = isProd ? process.env.EBAY_CLIENT_SECRET_PROD : process.env.EBAY_CLIENT_SECRET;
    const redirectUri = isProd ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI;
    const tokenBaseUrl = isProd ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
    const url = `${tokenBaseUrl}/identity/v1/oauth2/token`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    try {
      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur token eBay:', error.response?.data || error.message);
      throw new Error('Impossible d’obtenir le token eBay');
    }
  }

  static async refreshAccessToken(refreshToken) {
    const isProd = process.env.EBAY_ENV === 'production';
    const clientId = isProd ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID;
    const clientSecret = isProd ? process.env.EBAY_CLIENT_SECRET_PROD : process.env.EBAY_CLIENT_SECRET;
    const tokenBaseUrl = isProd ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
    const url = `${tokenBaseUrl}/identity/v1/oauth2/token`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    try {
      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur refresh token eBay:', error.response?.data || error.message);
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
        console.error('Erreur API Finances eBay:', error.response?.data || error.message);
        throw new Error('Erreur lors de la récupération des transactions eBay');
      }
    }

    return transactions;
  }
}

module.exports = EbayService;