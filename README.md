# eBay Profit Report - SaaS

## 🔒 Configuration Sécurisée

### Variables d'environnement

**IMPORTANT** : Ne jamais commiter le fichier `.env` qui contient vos vraies clés !

1. Copiez `.env.example` vers `.env` :
```bash
cd backend
cp .env.example .env
```

2. Remplissez les vraies valeurs dans `.env`

### Déploiement sur Render

Les variables d'environnement doivent être configurées dans l'interface Render (Settings → Environment).

**Ne jamais** :
- ❌ Commiter le fichier `.env`
- ❌ Partager vos clés API sur GitHub/Slack/Email
- ❌ Logger les secrets dans la console

**Toujours** :
- ✅ Utiliser `.env.example` comme template
- ✅ Configurer les secrets sur Render directement
- ✅ Vérifier que `.env` est dans `.gitignore`

## Installation locale

```bash
cd backend
npm install
cp .env.example .env
# Remplissez les vraies valeurs dans .env
npx prisma migrate dev
npm run dev
```

## Déploiement PM2 (O2switch / VPS)

```bash
cd ~/beassistscan/backend
npx pm2 start src/app.js --name beassistscan
npx pm2 save
npx pm2 restart beassistscan
npx pm2 status
npx pm2 logs beassistscan --lines 20
```

---

## 🚂 Railway CLI — Commandes essentielles

### Authentification
```bash
railway login          # Connexion via navigateur
railway logout         # Déconnexion
railway whoami         # Voir l'utilisateur connecté
```

### Lier un projet
```bash
# Depuis le dossier backend/
railway link           # Lier au projet Railway existant (menu interactif)
railway unlink         # Délier le projet
```

### Variables d'environnement
```bash
railway variables                          # Lister toutes les variables
railway variables set CLE=valeur           # Ajouter/modifier une variable
railway variables set CLE1=val1 CLE2=val2  # Plusieurs à la fois
railway variables delete CLE               # Supprimer une variable

# Envoyer tout le .env en une seule commande
railway variables set $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
```

### Déploiement
```bash
railway up             # Déployer le code local manuellement
railway up --detach    # Déployer en arrière-plan
```
cp /Users/mac/Desktop/SaaS/ebay-profit-report/frontend/index.html /Users/mac/Desktop/SaaS/ebay-profit-report/backend/public/index.html && cd /Users/mac/Desktop/SaaS/ebay-profit-report && git add frontend/index.html backend/public/index.html backend/src/app.js && git commit -m "feat: login/register + flux eBay + filtre par mois" && git push origin main && cd backend && railway up --service backend --detach 2>&1

### Logs & Statut
```bash
railway logs             # Voir les logs en temps réel
railway logs --tail 100  # 100 dernières lignes
railway status           # Statut du projet
```

### Base de données
```bash
railway connect        # Se connecter à la base PostgreSQL (shell psql)

# Lancer les migrations Prisma depuis votre machine (utilise le proxy public)
DATABASE_URL="postgresql://postgres:aKebYmfgnnhPsiLcmvdHBvyKbKNtEudl@sakura.proxy.rlwy.net:19422/railway" npx prisma migrate deploy

# Ouvrir Prisma Studio sur la base Railway
DATABASE_URL="postgresql://postgres:aKebYmfgnnhPsiLcmvdHBvyKbKNtEudl@sakura.proxy.rlwy.net:19422/railway" npx prisma studio
```

### Lancer l'app localement avec les variables Railway
```bash
railway run npm start    # Démarre avec les variables Railway injectées
railway run npm run dev
```

### Domaine
```bash
railway domain         # Voir/générer le domaine public Railway
```