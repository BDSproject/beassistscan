const axios = require('axios');

const EBAY_API_BASE = process.env.EBAY_ENV === 'production'
  ? 'https://api.ebay.com'
  : 'https://api.sandbox.ebay.com';

class EbayService {
  static getAuthHeaders(accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  static async getAccessToken(code) {
    const tokenBaseUrl = process.env.EBAY_ENV === 'sandbox'
  ? 'https://api.sandbox.ebay.com'
  : 'https://api.ebay.com';

const url = `${tokenBaseUrl}/identity/v1/oauth2/token`;
    const basicAuth = Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.EBAY_REDIRECT_URI);

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
    const url = 'https://api.ebay.com/identity/v1/oauth2/token';
    const basicAuth = Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
    });
    return response.data;
  }

  // Récupère les transactions financières des 90 derniers jours (maximum)
  static async getTransactions(accessToken) {
    const url = `${EBAY_API_BASE}/sell/finances/v1/transaction?limit=100&filter=transactionStatus:{PAYOUT}`;
    // Note : l'API Finances nécessite parfois un filtre de date, mais pour simplifier on utilise transactionStatus=PAYOUT pour avoir les ventes payées.
    // Pour couvrir les 90 jours, on pourrait ajouter &filter=transactionDate:[2024-10-01T00:00:00.000Z..2025-01-01T00:00:00.000Z]
    // On va faire une boucle pour récupérer toutes les transactions.

    let transactions = [];
    let nextPageUrl = url;

    while (nextPageUrl) {
      try {
        const response = await axios.get(nextPageUrl, {
          headers: this.getAuthHeaders(accessToken),
        });
        const data = response.data;
        if (data.transactions) {
          transactions = transactions.concat(data.transactions);
        }
        nextPageUrl = data.next || null;
      } catch (error) {
        console.error('Erreur API Finances eBay:', error.response?.data || error.message);
        throw new Error('Erreur lors de la récupération des transactions eBay');
      }
    }

    return transactions;
  }
}

module.exports = EbayService;