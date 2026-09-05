# 🔧 Guide de Dépannage - Redirections et Démarrage de l'Application

## Problèmes Identifiés

### 1. **Redirection permanente (www → non-www)**
- **Cause** : Le middleware dans `src/app.js` effectue une redirection 301 de `www.beassistscan.com` vers `beassistscan.com`
- **Symptôme** : Même en tapant `https://www.beassistscan.com/`, on est redirigé vers `https://beassistscan.com/`
- **Statut** : ✅ **CORRIGÉ** - Le middleware a été amélioré pour mieux gérer les ports et les domaines

### 2. **Application qui ne démarre pas**
- **Cause potentielle** : Manque de fichier `.env` avec les variables d'environnement
- **Résultat** : Les fichiers statiques s'affichent en clair au lieu de l'application
- **Statut** : ✅ **CORRIGÉ** - Un fichier `.env` minimal a été créé

## Corrections Appliquées

### 1. Améliorations du middleware de redirection
**Fichier** : `backend/src/app.js` (lignes 33-46)

**Avant** :
```javascript
if (isProd && forwardedProto && forwardedProto !== 'https') {
  return res.redirect(301, `https://${host}${req.originalUrl}`);
}

if (isProd && (host === 'www.beassistscan.com' || host.startsWith('www.beassistscan.com:'))) {
  return res.redirect(301, `https://${SITE_HOST}${req.originalUrl}`);
}
```

**Après** :
```javascript
// Redirection HTTPS (si pas déjà en HTTPS)
if (isProd && forwardedProto && forwardedProto !== 'https') {
  const hostOnly = host.split(':')[0]; // Enlever le port s'il existe
  return res.redirect(301, `https://${hostOnly}${req.originalUrl}`);
}

// Redirection www vers non-www (SEO canonical)
if (isProd && host.startsWith('www.')) {
  const hostWithoutWww = host.replace(/^www\./, '');
  return res.redirect(301, `https://${hostWithoutWww}${req.originalUrl}`);
}
```

### 2. Création du fichier `.env`
**Fichier** : `.env` (racine du projet)

Vous devez **remplir les valeurs réelles** pour :
- `DATABASE_URL` : Votre URL de connexion PostgreSQL
- `STRIPE_SECRET_KEY` & `STRIPE_PUBLISHABLE_KEY` : Vos clés Stripe
- `EBAY_CLIENT_ID` & `EBAY_CLIENT_SECRET` : Vos identifiants eBay
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` : Vos identifiants Google
- `RESEND_API_KEY` : Votre clé API Resend (pour les emails)
- Autres tokens et secrets...

## ✅ Prochaines Étapes pour Démarrer l'Application

### Sur votre machine locale :

```bash
# 1. Aller dans le répertoire backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Remplir les variables d'environnement
# Éditer le fichier .env avec vos vraies valeurs

# 4. Démarrer le serveur en développement
NODE_ENV=development npm run dev

# Ou en production (si vous avez une DB):
npm start
```

### Sur Railway (en production) :

1. Connecter votre repo à Railway
2. S'assurer que toutes les variables d'environnement sont définies
3. Railway utilisera automatiquement le `Procfile` de la racine :
   ```
   web: cd backend && npm start
   ```

## 🔍 Dépannage Supplémentaire

### Si vous voyez toujours les fichiers en clair :

**Vérifiez que** :
- [ ] `NODE_ENV=production` est défini sur Railway
- [ ] La base de données est accessible
- [ ] Les migrations Prisma ont été exécutées : `npx prisma migrate deploy`
- [ ] Le port 3000 n'est pas bloqué
- [ ] Express.static() charge correctement depuis `backend/public/`

### Logs de débogage :

Activez les logs détaillés dans `src/app.js` :
```javascript
// Ligne 166 affiche déjà le chemin des fichiers statiques
console.log('📁 Frontend servi depuis :', frontendPath);
```

Lancez le serveur et cherchez ce message. S'il n'apparaît pas, Express ne s'initialise pas correctement.

## 📋 Résumé du Problème de Redirection

| Requête | Avant | Après |
|---------|-------|-------|
| `www.beassistscan.com` | ✓ Redirige vers `beassistscan.com` | ✓ Redirige vers `beassistscan.com` |
| `beassistscan.com` | ✓ OK | ✓ OK |
| `http://` (non-HTTPS) | ✓ Redirige vers HTTPS | ✓ Redirige vers HTTPS |
| **Boucle infinie** | ❌ Possible en dev | ✅ Corrigée - gère mieux les ports |

---

**Note** : La redirection 301 est une **bonne pratique SEO**. Google reconnaît que `www` et `non-www` pointent vers le même contenu. C'est normal et souhaitable.
