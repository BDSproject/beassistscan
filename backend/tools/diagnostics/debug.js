app.post('/api/ebay/generate-report-ebay', async (req, res) => {
  try {
    // Votre code qui appelle l'API eBay
    const ebayResponse = await callEbayApi(); 
    
    res.status(200).json(ebayResponse);

  } catch (error) {
    // 1. On logue l'erreur complète dans le terminal du serveur
    console.error("Erreur complète :", error);

    // 2. Si c'est une erreur d'une librairie comme Axios, la vraie réponse d'eBay est cachée ici :
    if (error.response) {
      console.error("Réponse d'eBay :", error.response.data);
    }

    // 3. On renvoie une erreur 500 propre au client, avec un petit message (optionnel)
    res.status(500).json({ 
      message: "Erreur lors de la génération du rapport eBay", 
      details: error.message 
    });
  }
});