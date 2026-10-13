// Génère la page d'accueil anglaise /en/index.html à partir de index.html + traductions.
// Usage : node tools/seo/generate-en-homepage.js
const fs = require('fs');
const path = require('path');
const translations = require('../../src/i18n/translations');

const SITE = 'https://beassistscan.com';
const PUB = path.join(__dirname, '../../public');
const FR = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
const en = translations.en;

let html = FR;

// 1. Traduire le contenu des éléments data-i18n (texte simple)
html = html.replace(/data-i18n="([^"]+)"([^>]*)>([^<]*)</g, (m, key, attrs, text) => {
  const v = en[key];
  return v !== undefined && v !== key ? `data-i18n="${key}"${attrs}>${v}<` : m;
});

// 2. Traduire les placeholders
html = html.replace(/data-i18n-placeholder="([^"]+)"/g, (m, key) => {
  const v = en[key];
  return v !== undefined ? `data-i18n-placeholder="${key}"` : m; // le placeholder est géré par JS ; on le laisse
});

// (les placeholders sont remplacés par le JS ; rien à faire côté HTML)

// 3. Head : langue, titre, description, meta sociales, canonical, hreflang
html = html.replace('<html lang="fr">', '<html lang="en">');

html = html.replace(
  '<title>BeassistScan - Découvrez ce qu\'eBay vous coûte vraiment</title>',
  '<title>BeassistScan - Find out what eBay really costs you</title>'
);

html = html.replace(
  '<meta name="description" content="Analysez vos frais eBay en 2 minutes. Rapport de rentabilité gratuit pour vendeurs eBay. Découvrez combien vous pouvez économiser.">',
  '<meta name="description" content="Analyze your eBay fees in 2 minutes. Free profitability report for eBay sellers. Find out how much you can save.">'
);

html = html.replace(
  '<link rel="canonical" href="https://beassistscan.com/">',
  `<link rel="canonical" href="${SITE}/en/">\n  <link rel="alternate" hreflang="fr" href="${SITE}/">\n  <link rel="alternate" hreflang="en" href="${SITE}/en/">\n  <link rel="alternate" hreflang="x-default" href="${SITE}/">`
);

html = html.replace(
  '<meta property="og:title" content="BeassistScan - Vos frais eBay analysés gratuitement">',
  '<meta property="og:title" content="BeassistScan - Your eBay fees analyzed for free">'
);

html = html.replace(
  '<meta property="og:description" content="Connectez votre boutique eBay et recevez votre rapport de rentabilité gratuit en 2 minutes.">',
  '<meta property="og:description" content="Connect your eBay store and get your free profitability report in 2 minutes.">'
);

html = html.replace(
  '<meta property="og:url" content="https://beassistscan.com/">',
  '<meta property="og:url" content="https://beassistscan.com/en/">'
);

html = html.replace(
  '<meta property="og:locale" content="fr_FR">',
  '<meta property="og:locale" content="en_US">'
);
html = html.replace(
  '<meta property="og:locale:alternate" content="en_US">',
  '<meta property="og:locale:alternate" content="fr_FR">'
);

html = html.replace(
  '<meta name="twitter:title" content="BeassistScan - Vos frais eBay analysés gratuitement">',
  '<meta name="twitter:title" content="BeassistScan - Your eBay fees analyzed for free">'
);

html = html.replace(
  '<meta name="twitter:description" content="Rapport de rentabilité eBay gratuit en 2 minutes pour vendeurs eBay.">',
  '<meta name="twitter:description" content="Free eBay profitability report in 2 minutes for eBay sellers.">'
);

// 4. Langue par défaut côté client : 'en'
html = html.replace(
  "var _t = {}, _lang = localStorage.getItem('lang') || 'fr';",
  "var _t = {}, _lang = localStorage.getItem('lang') || 'en';"
);

// 4bis. Placeholders (texte FR visible avant le JS)
const placeholders = [
  ['placeholder="Mot de passe (8 car. min.)"', 'placeholder="Password (8+ characters)"'],
  ['placeholder="Mot de passe"', 'placeholder="Password"'],
  ['placeholder="Prénom (optionnel)"', 'placeholder="First name (optional)"'],
  ['placeholder="Ex: TechStoreFrance"', 'placeholder="e.g. TechStoreUSA"'],
  ['placeholder="contact@votre-boutique.com"', 'placeholder="contact@your-store.com"'],
];
for (const [f, e] of placeholders) html = html.split(f).join(e);

// 4ter. Chaînes JS et textes durs (fallbacks + toasts)
const jsStrings = [
  ['Connectez votre boutique eBay en 1 clic.', 'Connect your eBay store in 1 click.'],
  ['Analysez vos frais et découvrez vos économies.', 'Analyze your fees and discover your savings.'],
  ['✅ Compte eBay connecté avec succès !', '✅ eBay account connected successfully!'],
  ['🔍 Analyser mes frais gratuitement', '🔍 Analyze my fees for free'],
  ['✅ Rapport envoyé avec succès ! Vérifiez votre boîte mail (pensez au dossier spam).', '✅ Report sent successfully! Check your inbox (and spam folder).'],
  ['Rapport envoyé avec succès !', 'Report sent successfully!'],
  ['📧 Rapport PDF envoyé à ${email}', '📧 PDF report sent to ${email}'],
  ['❌ Erreur : ${error.message}', '❌ Error: ${error.message}'],
  ["'❌ Erreur : ' + error.message", "'❌ Error: ' + error.message"],
  ['Connexion\n          </a>', 'Sign in\n          </a>'],
];
for (const [f, e] of jsStrings) html = html.split(f).join(e);

// 5. Écrire le fichier
fs.mkdirSync(path.join(PUB, 'en'), { recursive: true });
fs.writeFileSync(path.join(PUB, 'en', 'index.html'), html, 'utf8');

// Rapport : restes de français dans le corps
const frLeft = (html.match(/[À-ÿ]{2,}/g) || []);
console.log('✅ en/index.html généré');
console.log('Mots français résiduels possibles:', frLeft.slice(0, 20).join(', '));
