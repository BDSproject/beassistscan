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

## Déploiement

Suivez le guide de déploiement Render avec les variables d'environnement configurées dans l'interface.
