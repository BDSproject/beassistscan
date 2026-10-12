// Générateur des 4 nouveaux articles du blog (FR + EN) + mise à jour des index.
// Usage : node tools/seo/generate-blog-articles.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://beassistscan.com';
const PUB = path.join(__dirname, '../../public');

const STYLE = `    :root { --violet-deep: #1e1b4b; }
    .hero-bg { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); }
    .btn-violet { background: linear-gradient(135deg, #7c3aed, #6d28d9); transition: all .2s; }
    .btn-violet:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,.4); }
    .prose h2 { font-size: 1.5rem; font-weight: 800; color: #1e1b4b; margin: 2.5rem 0 1rem; }
    .prose h3 { font-size: 1.15rem; font-weight: 700; color: #312e81; margin: 1.5rem 0 0.5rem; }
    .prose p { color: #374151; line-height: 1.8; margin-bottom: 1rem; }
    .prose ul { list-style: none; padding: 0; margin-bottom: 1rem; }
    .prose ul li { padding: 0.3rem 0 0.3rem 1.5rem; position: relative; color: #374151; line-height: 1.7; }
    .prose ul li::before { content: "→"; position: absolute; left: 0; color: #7c3aed; font-weight: bold; }
    .pro { color: #16a34a; }
    .con { color: #dc2626; }
    .verdict-box { background: linear-gradient(135deg, #f5f3ff, #ede9fe); border: 2px solid #7c3aed; border-radius: 16px; padding: 2rem; margin: 2rem 0; }
    .cta-box { background: linear-gradient(135deg, #1e1b4b, #4c1d95); border-radius: 20px; padding: 2.5rem; text-align: center; margin: 3rem 0; }`;

function cta(lang) {
  if (lang === 'fr') {
    return `<div class="cta-box">
        <p class="text-2xl mb-2">🔍</p>
        <h3 class="font-extrabold text-xl mb-2" style="color:#fff;margin:0 0 .5rem;">Calculez exactement ce qu'eBay vous coûte</h3>
        <p style="color:rgba(255,255,255,.6);font-size:.875rem;margin-bottom:1rem;">Connectez votre boutique eBay et recevez votre rapport gratuit en 2 minutes. Découvrez le montant exact de vos frais et votre économie potentielle.</p>
        <a href="/" class="inline-block bg-white text-violet-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-50 transition">Analyser mes frais eBay gratuitement →</a>
      </div>`;
  }
  return `<div class="cta-box">
        <p class="text-2xl mb-2">🔍</p>
        <h3 class="font-extrabold text-xl mb-2" style="color:#fff;margin:0 0 .5rem;">See exactly what eBay costs you</h3>
        <p style="color:rgba(255,255,255,.6);font-size:.875rem;margin-bottom:1rem;">Connect your eBay store and get your free report in 2 minutes. See the exact amount of your fees and your potential savings.</p>
        <a href="/" class="inline-block bg-white text-violet-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-50 transition">Analyze my eBay fees for free →</a>
      </div>`;
}

function header(lang, slugFr, slugEn) {
  const other = lang === 'fr'
    ? `<a href="/blog/en/${slugEn}.html" class="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition">🇬🇧 EN</a>`
    : `<a href="/blog/fr/${slugFr}.html" class="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition">🇫🇷 FR</a>`;
  const ctaLabel = lang === 'fr' ? 'Analyser mes frais' : 'Analyze my fees';
  const blogLabel = '← Blog';
  return `<header class="hero-bg shadow-xl sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style="background:linear-gradient(135deg,#7c3aed,#4c1d95)">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <span class="text-white font-bold text-lg tracking-tight">Beassist<span class="text-purple-300">Scan</span></span>
        </a>
        <nav class="flex items-center gap-2">
          <a href="/blog/" class="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition">${blogLabel}</a>
          ${other}
          <a href="/" class="text-white font-semibold px-4 py-2 rounded-lg text-sm transition" style="background:linear-gradient(135deg,#7c3aed,#6d28d9)">${ctaLabel}</a>
        </nav>
      </div>
    </div>
  </header>`;
}

function jsonLd(a, lang) {
  const url = `${SITE}/blog/${lang}/${a.slug(lang)}.html`;
  const t = a.title[lang];
  const d = a.description[lang];
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': t,
    'description': d,
    'author': { '@type': 'Organization', 'name': 'BeassistScan' },
    'publisher': { '@type': 'Organization', 'name': 'BeassistScan', 'logo': { '@type': 'ImageObject', 'url': `${SITE}/favicon.png` } },
    'datePublished': '2026-09-23',
    'dateModified': '2026-09-23',
    'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
    'image': `${SITE}/og-image.png`,
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': a.faqs[lang].map(([q, ans]) => ({ '@type': 'Question', 'name': q, 'acceptedAnswer': { '@type': 'Answer', 'text': ans } })),
  };
  const bc = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': `${SITE}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE}/blog/${lang}/` },
      { '@type': 'ListItem', 'position': 3, 'name': t, 'item': url },
    ],
  };
  return `  <script type="application/ld+json">\n  ${JSON.stringify(article)}\n  </script>\n  <script type="application/ld+json">\n  ${JSON.stringify(faq)}\n  </script>\n  <script type="application/ld+json">\n  ${JSON.stringify(bc)}\n  </script>`;
}

function render(a, lang) {
  const slug = a.slug(lang);
  const url = `${SITE}/blog/${lang}/${slug}.html`;
  const frUrl = `${SITE}/blog/fr/${a.slug('fr')}.html`;
  const enUrl = `${SITE}/blog/en/${a.slug('en')}.html`;
  const ogLocale = lang === 'fr' ? 'fr_FR' : 'en_US';
  const ogAlt = lang === 'fr' ? 'en_US' : 'fr_FR';
  const read = lang === 'fr' ? a.read.fr : a.read.en;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${a.title[lang]} | BeassistScan</title>
  <meta name="description" content="${a.description[lang]}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="x-default" href="${frUrl}">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="BeassistScan">
  <meta property="og:title" content="${a.title[lang]}">
  <meta property="og:description" content="${a.description[lang]}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:locale:alternate" content="${ogAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${a.title[lang]}">
  <meta name="twitter:description" content="${a.description[lang]}">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
${STYLE}
  </style>
${jsonLd(a, lang)}
</head>
<body class="bg-gray-50 text-gray-800">

${header(lang, a.slug('fr'), a.slug('en'))}

  <section class="hero-bg py-16 px-4">
    <div class="max-w-3xl mx-auto text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="bg-violet-400/20 text-violet-200 text-xs font-bold px-3 py-1 rounded-full">${a.category[lang]}</span>
        <span class="text-white/40 text-xs">${a.date[lang]} · ${read}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">${a.h1[lang]}</h1>
      <p class="text-white/60 text-lg max-w-2xl mx-auto">${a.subtitle[lang]}</p>
    </div>
  </section>

  <main class="max-w-3xl mx-auto px-4 py-12">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 prose">

${a.body[lang]}

${cta(lang)}

      <div class="verdict-box">
        <h2 style="margin-top:0;color:#4c1d95;">${lang === 'fr' ? '⚖️ Notre verdict' : '⚖️ Our verdict'}</h2>
        ${a.verdict[lang]}
      </div>

      <h2>❓ ${lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
${a.faqs[lang].map(([q, ans]) => `      <h3>${q}</h3>\n      <p>${ans}</p>`).join('\n')}

    </div>

    <div class="mt-8 flex items-center justify-between">
      <a href="/blog/${lang}/" class="text-violet-600 font-semibold text-sm hover:text-violet-800">← ${lang === 'fr' ? 'Tous les articles' : 'All articles'}</a>
      <a href="/" class="btn-violet text-white font-semibold px-5 py-2.5 rounded-xl text-sm">${lang === 'fr' ? 'Analyser mes frais eBay →' : 'Analyze my eBay fees →'}</a>
    </div>
  </main>

  <footer class="bg-gray-900 py-8 mt-8 text-center">
    <p class="text-gray-400 text-sm">© 2026 BeassistScan · <a href="/" class="hover:text-white">${lang === 'fr' ? 'Accueil' : 'Home'}</a> · <a href="/blog/" class="hover:text-white">Blog</a> · <a href="/mentions-legales.html" class="hover:text-white">${lang === 'fr' ? 'Mentions légales' : 'Legal'}</a></p>
  </footer>

</body>
</html>
`;
}

function card(a, lang) {
  const slug = a.slug(lang);
  return `      <!-- ${a.id} -->
      <article class="card-article bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row">
        <div class="sm:w-48 bg-gradient-to-br ${a.gradient} flex items-center justify-center p-8 flex-shrink-0">
          <span class="text-5xl">${a.emoji}</span>
        </div>
        <div class="p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="${a.badge} text-xs font-bold px-2 py-0.5 rounded-full">${a.category[lang]}</span>
              <span class="text-xs text-gray-400">${a.date[lang]} · ${a.read[lang]}</span>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">${a.cardTitle[lang]}</h2>
            <p class="text-sm text-gray-500">${a.cardDesc[lang]}</p>
          </div>
          <a href="/blog/${lang}/${slug}.html" class="mt-4 inline-flex items-center gap-1 text-violet-600 font-semibold text-sm hover:text-violet-800">
            ${lang === 'fr' ? "Lire l'article →" : 'Read article →'}
          </a>
        </div>
      </article>`;
}

// ---------------- CONTENU ----------------

const articles = [
  {
    id: 'reduire-frais',
    slug: (l) => l === 'fr' ? 'reduire-frais-ebay-7-strategies' : 'reduce-ebay-fees-7-strategies',
    emoji: '📉',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700',
    category: { fr: 'Optimisation', en: 'Optimization' },
    date: { fr: '23 septembre 2026', en: 'September 23, 2026' },
    read: { fr: '9 min de lecture', en: '9 min read' },
    title: {
      fr: 'Réduire ses frais eBay : 7 stratégies concrètes (2026)',
      en: 'How to Reduce eBay Fees: 7 Concrete Strategies (2026)',
    },
    cardTitle: {
      fr: 'Réduire ses frais eBay : 7 stratégies concrètes pour 2026',
      en: 'How to Reduce Your eBay Fees: 7 Concrete Strategies for 2026',
    },
    description: {
      fr: '7 stratégies concrètes pour réduire vos frais eBay et commissions en 2026 : abonnement, catégories, Promoted Listings, livraison, litiges. Augmentez votre marge dès aujourd\'hui.',
      en: '7 concrete strategies to cut your eBay fees and commissions in 2026: subscription, categories, Promoted Listings, shipping, disputes. Boost your margin today.',
    },
    cardDesc: {
      fr: 'Abonnement, catégories, Promoted Listings, livraison : 7 leviers concrets pour payer moins de commissions et augmenter votre marge.',
      en: 'Subscription, categories, Promoted Listings, shipping: 7 concrete levers to pay less in fees and grow your margin.',
    },
    h1: {
      fr: 'Réduire ses frais eBay :<br><span class="text-purple-300">7 stratégies concrètes (2026)</span>',
      en: 'How to Reduce Your eBay Fees:<br><span class="text-purple-300">7 Concrete Strategies (2026)</span>',
    },
    subtitle: {
      fr: 'Chaque vente eBay vous coûte 10 à 17 %. Voici 7 leviers concrets pour reprendre le contrôle de votre marge.',
      en: 'Every eBay sale costs you 10–17%. Here are 7 concrete levers to take back control of your margin.',
    },
    body: {
      fr: `<p>Sur eBay, chaque vente vous coûte entre <strong>10 % et 17 %</strong> de son prix : commission finale (8 à 15 % selon la catégorie) plus les frais de traitement des paiements. Sur un chiffre d'affaires de 40 000 € par an, cela représente <strong>4 000 à 7 000 €</strong> qui s'envolent chaque année.</p>
      <p>Bonne nouvelle : ces frais ne sont pas une fatalité. Voici 7 stratégies concrètes pour les réduire, classées de la plus simple à la plus avancée.</p>

      <h2>1. Choisissez le bon abonnement boutique</h2>
      <p>eBay propose plusieurs formules d'abonnement (de base à premium). Si vous vendez régulièrement, une boutique réduit vos frais d'insertion et débloque des outils de vente. Comparez le coût de l'abonnement avec les frais d'insertion que vous économisez : au-delà d'un certain volume de ventes, l'abonnement est rapidement rentabilisé.</p>

      <h2>2. Vérifiez la catégorie de chaque annonce</h2>
      <p>La commission finale dépend directement de la catégorie dans laquelle vous publiez. Certaines catégories affichent des taux bien plus faibles que d'autres. Un article mal classé peut vous coûter plusieurs points de marge. Vérifiez le taux appliqué avant chaque publication, et si votre produit peut légitimement appartenir à deux catégories, choisissez la moins chère.</p>

      <h2>3. Maîtrisez les Promoted Listings</h2>
      <p>Les annonces sponsorisées dopent vos ventes, mais prélèvent un pourcentage supplémentaire sur chaque vente générée. Le piège : payer de la publicité sur des produits déjà bien positionnés ou à faible marge. Ne sponsorisez que vos produits à forte marge, et mesurez le coût publicitaire réel avant de généraliser.</p>

      <h2>4. Optimisez vos frais de livraison</h2>
      <p>La livraison est un poste où beaucoup de vendeurs perdent de l'argent sans s'en rendre compte. Comparez les transporteurs, fixez des frais de port réalistes et évitez de sous-facturer. Chaque euro perdu sur la livraison est un euro de marge en moins.</p>

      <h2>5. Évitez les litiges et les retours</h2>
      <p>Un litige non résolu peut entraîner des frais et impacter votre visibilité. Des photos claires, des descriptions précises et une communication rapide réduisent drastiquement les retours et les réclamations. La prévention coûte toujours moins cher que le litige.</p>

      <h2>6. Visez le statut Vendeur Top Fiabilité</h2>
      <p>Les vendeurs les mieux notés bénéficient d'avantages concrets : meilleure visibilité dans les résultats, protections renforcées et parfois des réductions de frais. Soignez vos délais d'expédition, vos descriptions et votre service client pour atteindre ce statut.</p>

      <h2>7. Mesurez pour réduire — la clé de tout</h2>
      <p>On ne réduit bien que ce qu'on mesure. La plupart des vendeurs n'ont qu'une vague idée de leurs frais réels : commissions, paiements, promotions, abonnements... C'est précisément là que BeassistScan intervient : connectez votre boutique et obtenez en 2 minutes un rapport détaillé de ce qu'eBay vous prélève vraiment, catégorie par catégorie.</p>`,
      en: `<p>On eBay, every sale costs you between <strong>10% and 17%</strong> of its price: the final value fee (8–15% depending on category) plus payment processing fees. On €40,000 of annual sales, that's <strong>€4,000–7,000</strong> gone every year.</p>
      <p>Good news: these fees are not set in stone. Here are 7 concrete strategies to cut them, ordered from simplest to most advanced.</p>

      <h2>1. Choose the right store subscription</h2>
      <p>eBay offers several subscription tiers. If you sell regularly, a store subscription lowers your insertion fees and unlocks selling tools. Compare the subscription cost with the insertion fees you save: beyond a certain sales volume, the subscription quickly pays for itself.</p>

      <h2>2. Check the category of every listing</h2>
      <p>The final value fee depends directly on the category you list in. Some categories have much lower rates than others. A misplaced item can cost you several points of margin. Check the applied rate before every listing, and if your product can legitimately belong to two categories, pick the cheaper one.</p>

      <h2>3. Master Promoted Listings</h2>
      <p>Promoted listings boost your sales, but they take an extra percentage on every sale they generate. The trap: paying for ads on products that already rank well or have thin margins. Only promote high-margin products, and measure the real ad cost before scaling up.</p>

      <h2>4. Optimize your shipping costs</h2>
      <p>Shipping is where many sellers lose money without realizing it. Compare carriers, set realistic shipping charges, and avoid under-pricing postage. Every euro lost on shipping is a euro of margin gone.</p>

      <h2>5. Avoid disputes and returns</h2>
      <p>An unresolved dispute can trigger fees and hurt your visibility. Clear photos, accurate descriptions, and fast communication drastically reduce returns and complaints. Prevention always costs less than a dispute.</p>

      <h2>6. Aim for Top Rated Seller status</h2>
      <p>Top-rated sellers get concrete advantages: better placement in results, stronger protections, and sometimes fee discounts. Take care of your shipping times, descriptions, and customer service to reach that status.</p>

      <h2>7. Measure before you cut — the key to it all</h2>
      <p>You can only reduce what you measure. Most sellers have only a vague idea of their real fees: commissions, payments, promotions, subscriptions... That's exactly where BeassistScan comes in: connect your store and get a detailed report of what eBay actually charges you, category by category, in 2 minutes.</p>`,
    },
    verdict: {
      fr: `<p>Réduire ses frais eBay ne demande pas un changement radical, mais une suite de petites optimisations qui, cumulées, peuvent représenter <strong>2 à 5 points de marge</strong> en plus. Commencez par mesurer : vous saurez immédiatement où concentrer vos efforts.</p>`,
      en: `<p>Cutting eBay fees doesn't require a radical change — just a series of small optimizations that, combined, can add <strong>2 to 5 points of margin</strong>. Start by measuring: you'll immediately know where to focus.</p>`,
    },
    faqs: {
      fr: [
        ['Quel est le taux de commission d\'eBay en 2026 ?', 'La commission finale d\'eBay varie généralement entre 8 % et 15 % du prix de vente selon la catégorie, auxquels s\'ajoutent environ 2 % de frais de traitement des paiements.'],
        ['Les Promoted Listings sont-ils obligatoires ?', 'Non, ils sont optionnels. Ils sont pertinents uniquement sur les produits à forte marge où le surcoût publicitaire est compensé par les ventes supplémentaires.'],
        ['Comment connaître mes frais eBay exacts ?', 'Connectez votre boutique à BeassistScan : vous recevez gratuitement en 2 minutes un rapport détaillé de vos commissions, frais de paiement et promotions, catégorie par catégorie.'],
      ],
      en: [
        ["What is eBay's commission rate in 2026?", "eBay's final value fee generally ranges from 8% to 15% of the sale price depending on the category, plus roughly 2% in payment processing fees."],
        ['Are Promoted Listings mandatory?', 'No, they are optional. They only make sense on high-margin products where the extra ad cost is offset by the additional sales.'],
        ['How can I know my exact eBay fees?', 'Connect your store to BeassistScan: you get a free, detailed report of your commissions, payment fees, and promotions — category by category — in 2 minutes.'],
      ],
    },
  },

  {
    id: 'promoted-listings',
    slug: (l) => l === 'fr' ? 'ebay-promoted-listings-rentable' : 'ebay-promoted-listings-worth-it',
    emoji: '📣',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-700',
    category: { fr: 'Publicité', en: 'Advertising' },
    date: { fr: '23 septembre 2026', en: 'September 23, 2026' },
    read: { fr: '7 min de lecture', en: '7 min read' },
    title: {
      fr: 'eBay Promoted Listings : est-ce vraiment rentable ?',
      en: 'eBay Promoted Listings: Are They Actually Worth It?',
    },
    cardTitle: {
      fr: 'eBay Promoted Listings : est-ce vraiment rentable en 2026 ?',
      en: 'eBay Promoted Listings: Are They Actually Worth It in 2026?',
    },
    description: {
      fr: 'Promoted Listings eBay : comment ça marche, combien ça coûte et quand c\'est rentable. Analyse coût/bénéfice avec exemples chiffrés et méthode de calcul.',
      en: 'eBay Promoted Listings: how they work, what they cost, and when they pay off. Cost/benefit analysis with concrete examples and a calculation method.',
    },
    cardDesc: {
      fr: 'Comment fonctionne la publicité eBay, combien elle coûte, et à quel moment elle devient rentable. Analyse chiffrée.',
      en: 'How eBay advertising works, what it costs, and when it becomes profitable. A numbers-based analysis.',
    },
    h1: {
      fr: 'eBay Promoted Listings :<br><span class="text-purple-300">est-ce vraiment rentable ?</span>',
      en: 'eBay Promoted Listings:<br><span class="text-purple-300">Are They Actually Worth It?</span>',
    },
    subtitle: {
      fr: 'Comprendre le vrai coût de la publicité eBay avant de cocher la case « Promu ».',
      en: 'Understand the real cost of eBay advertising before you tick the "Promoted" box.',
    },
    body: {
      fr: `<p>Vous avez sûrement déjà vu la case « <strong>Promoted Listings</strong> » au moment de publier une annonce. eBay promet plus de visibilité, donc plus de ventes. Mais derrière cette promesse se cache un coût que beaucoup de vendeurs sous-estiment.</p>
      <p>Alors, la publicité eBay est-elle un investissement ou une fuite de marge ? Réponse chiffrée.</p>

      <h2>Comment fonctionnent les Promoted Listings ?</h2>
      <p>Les annonces sponsorisées apparaissent en meilleure position dans les résultats de recherche. Contrairement à une publicité classique, vous ne payez <strong>que si l'acheteur clique puis achète</strong> : eBay prélève alors un pourcentage du prix de vente (le « taux d'annonce »), en plus de la commission finale classique.</p>

      <h2>Combien ça coûte réellement ?</h2>
      <p>Le taux d'annonce est dynamique et dépend de la concurrence, mais il se situe généralement entre <strong>2 % et 10 %</strong> du prix de vente. Il s'ajoute à la commission finale (8-15 %) et aux frais de paiement (~2 %). Sur un produit vendu 50 €, un Promoted Listing à 5 % vous coûte 2,50 € de plus — qui s'ajoutent aux 5 à 8 € déjà prélevés par eBay.</p>
      <p>Au total, une vente promue peut vous coûter <strong>18 à 25 %</strong> du prix. C'est énorme.</p>

      <h2>Le calcul de rentabilité à faire</h2>
      <p>La publicité n'est rentable que si la vente n'aurait <strong>pas eu lieu sans elle</strong>. Posez-vous trois questions :</p>
      <ul>
        <li>Quelle est ma marge nette sur ce produit (après frais eBay) ?</li>
        <li>Le taux d'annonce me laisse-t-il encore une marge acceptable ?</li>
        <li>Ce produit se vendrait-il aussi bien sans promotion ?</li>
      </ul>
      <p>Règle simple : si votre marge nette est inférieure à 15-20 %, évitez la promotion. Si elle dépasse 30 % et que le produit est noyé dans une catégorie concurrentielle, la publicité peut être un levier puissant.</p>

      <h2>Quand ça vaut le coup</h2>
      <ul>
        <li>Produits à <strong>forte marge</strong> (plus de 30 %)</li>
        <li>Catégories très concurrentielles où il faut sortir du lot</li>
        <li>Lancement d'un nouveau produit sans historique de ventes</li>
      </ul>

      <h2>Quand ça ne vaut pas le coup</h2>
      <ul>
        <li>Produits à <strong>faible marge</strong> ou déjà bien positionnés en organique</li>
        <li>Articles avec un taux de retour élevé</li>
        <li>Quand vous ne mesurez pas vos frais réels</li>
      </ul>`,
      en: `<p>You've probably seen the "<strong>Promoted Listings</strong>" checkbox when creating a listing. eBay promises more visibility, and therefore more sales. But behind that promise is a cost many sellers underestimate.</p>
      <p>So, is eBay advertising an investment or a margin leak? A numbers-based answer.</p>

      <h2>How do Promoted Listings work?</h2>
      <p>Promoted listings appear in better positions in search results. Unlike classic advertising, you <strong>only pay if the buyer clicks and then buys</strong>: eBay takes a percentage of the sale price (the "ad rate") on top of the normal final value fee.</p>

      <h2>How much does it actually cost?</h2>
      <p>The ad rate is dynamic and depends on competition, but it usually sits between <strong>2% and 10%</strong> of the sale price. It stacks on top of the final value fee (8–15%) and payment fees (~2%). On a €50 product, a 5% Promoted Listing costs you €2.50 more — on top of the €5–8 eBay already takes.</p>
      <p>In total, a promoted sale can cost you <strong>18–25%</strong> of the price. That's a lot.</p>

      <h2>The profitability calculation you should run</h2>
      <p>Advertising is only profitable if the sale <strong>wouldn't have happened without it</strong>. Ask yourself three questions:</p>
      <ul>
        <li>What is my net margin on this product (after eBay fees)?</li>
        <li>Does the ad rate still leave me an acceptable margin?</li>
        <li>Would this product sell just as well without promotion?</li>
      </ul>
      <p>A simple rule: if your net margin is under 15–20%, avoid promotion. If it's above 30% and the product is buried in a competitive category, advertising can be a powerful lever.</p>

      <h2>When it's worth it</h2>
      <ul>
        <li><strong>High-margin</strong> products (over 30%)</li>
        <li>Highly competitive categories where you need to stand out</li>
        <li>Launching a new product with no sales history</li>
      </ul>

      <h2>When it's not worth it</h2>
      <ul>
        <li><strong>Low-margin</strong> products or ones already ranking well organically</li>
        <li>Items with a high return rate</li>
        <li>When you don't actually measure your real fees</li>
      </ul>`,
    },
    verdict: {
      fr: `<p>Les Promoted Listings sont un outil, pas une obligation. Ils deviennent rentables uniquement quand <strong>votre marge le permet</strong> et que la visibilité supplémentaire compense le coût. Avant de promouvoir, connaissez précisément vos frais : c'est la condition pour décider en connaissance de cause.</p>`,
      en: `<p>Promoted Listings are a tool, not a requirement. They only become profitable when <strong>your margin allows it</strong> and the extra visibility offsets the cost. Before you promote, know your exact fees: that's the only way to decide with confidence.</p>`,
    },
    faqs: {
      fr: [
        ['Combien coûte un Promoted Listing sur eBay ?', 'Le taux d\'annonce est dynamique et se situe généralement entre 2 % et 10 % du prix de vente, prélevé uniquement en cas de vente issue du clic.'],
        ['Peut-on perdre de l\'argent avec les Promoted Listings ?', 'Oui, si le surcoût publicitaire dépasse votre marge nette. Sur des produits à faible marge, une promotion peut rendre une vente déficitaire.'],
        ['Comment savoir si mes promotions sont rentables ?', 'Calculez votre marge nette par produit, puis mesurez vos frais réels (commission + paiement + publicité). BeassistScan vous donne ce détail en 2 minutes.'],
      ],
      en: [
        ['How much does an eBay Promoted Listing cost?', 'The ad rate is dynamic and usually ranges from 2% to 10% of the sale price, charged only when a click leads to a sale.'],
        ['Can you lose money with Promoted Listings?', 'Yes, if the extra ad cost exceeds your net margin. On low-margin products, promotion can turn a sale into a loss.'],
        ['How do I know if my promotions are profitable?', 'Calculate your net margin per product, then measure your real fees (commission + payment + advertising). BeassistScan gives you this breakdown in 2 minutes.'],
      ],
    },
  },

  {
    id: 'ebay-vs-amazon',
    slug: () => 'ebay-vs-amazon-2026',
    emoji: '⚖️',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
    category: { fr: 'Comparatif', en: 'Comparison' },
    date: { fr: '23 septembre 2026', en: 'September 23, 2026' },
    read: { fr: '8 min de lecture', en: '8 min read' },
    title: {
      fr: 'eBay vs Amazon : quelle plateforme choisir en 2026 ?',
      en: 'eBay vs Amazon: Which Platform Should You Choose in 2026?',
    },
    cardTitle: {
      fr: 'eBay vs Amazon : quelle plateforme choisir en 2026 ?',
      en: 'eBay vs Amazon: Which Platform Should You Choose in 2026?',
    },
    description: {
      fr: 'eBay ou Amazon pour vendre en 2026 ? Comparatif complet : commissions, audience, concurrence, FBA, expérience vendeur. Le guide pour choisir sans se tromper.',
      en: 'eBay or Amazon in 2026? Complete comparison: fees, audience, competition, FBA, seller experience. The guide to choose with confidence.',
    },
    cardDesc: {
      fr: 'Commissions, audience, concurrence, FBA, expérience vendeur : le comparatif complet pour choisir la bonne marketplace en 2026.',
      en: 'Fees, audience, competition, FBA, seller experience: the complete comparison to pick the right marketplace in 2026.',
    },
    h1: {
      fr: 'eBay vs Amazon :<br><span class="text-purple-300">quelle plateforme choisir en 2026 ?</span>',
      en: 'eBay vs Amazon:<br><span class="text-purple-300">Which Platform in 2026?</span>',
    },
    subtitle: {
      fr: 'Le comparatif complet pour choisir la marketplace qui maximisera vos marges — et éviter les pièges.',
      en: 'The complete comparison to pick the marketplace that maximizes your margins — and avoid the traps.',
    },
    body: {
      fr: `<p>eBay ou Amazon ? C'est la question que se posent des milliers de vendeurs avant de se lancer. Les deux géants ont leurs forces et leurs faiblesses, et le bon choix dépend de votre produit, de votre budget et de votre stratégie.</p>

      <h2>Les commissions : un match serré</h2>
      <p>Sur le papier, les deux plateformes affichent des commissions finales similaires : <strong>8 à 15 % selon la catégorie</strong>. Mais la vraie différence se joue ailleurs :</p>
      <ul>
        <li><strong>eBay</strong> : commission + frais de paiement (~2 %). Coût total typique : 10-17 %.</li>
        <li><strong>Amazon</strong> : commission + frais de traitement. Si vous utilisez <strong>FBA</strong> (logistique par Amazon), ajoutez des frais de stockage et d'expédition qui peuvent faire grimper le coût total bien au-delà de 20 %.</li>
      </ul>
      <p>En vendant vous-même (FBM) sur Amazon, vous restez comparable à eBay. Avec FBA, vous payez plus, mais vous déléguez la logistique.</p>

      <h2>L'audience : Amazon gagne en volume</h2>
      <p>Amazon attire un trafic considérablement plus important, notamment sur les produits neufs et grand public. eBay conserve une base fidèle de chasseurs de bonnes affaires, d'acheteurs de produits d'occasion, de collection et de pièces détachées. Si votre produit est neuf et standardisé, Amazon offre plus de volume potentiel. S'il est de niche, d'occasion ou atypique, eBay est souvent plus pertinent.</p>

      <h2>La concurrence : Amazon est saturé</h2>
      <p>Amazon est devenu extrêmement compétitif : des milliers de vendeurs se disputent les mêmes mots-clés, souvent avec une guerre des prix féroce. eBay, bien que concurrentiel, laisse plus de place aux vendeurs spécialisés et aux produits différenciés.</p>

      <h2>L'expérience vendeur</h2>
      <ul>
        <li><strong>eBay</strong> : prise en main plus simple, moins de contraintes, idéal pour démarrer ou tester un produit.</li>
        <li><strong>Amazon</strong> : plus de règles, un compte vendeur plus exigeant, mais des outils puissants (FBA, Brand Registry) si vous visez le volume.</li>
      </ul>

      <h2>Alors, eBay ou Amazon ?</h2>
      <p>En résumé : <strong>Amazon</strong> pour le volume sur des produits neufs et standardisés ; <strong>eBay</strong> pour démarrer vite, vendre de l'occasion ou des produits de niche, avec une prise en main plus douce. Beaucoup de vendeurs avisés utilisent <strong>les deux en parallèle</strong> pour diversifier leurs revenus.</p>`,
      en: `<p>eBay or Amazon? It's the question thousands of sellers ask before starting. Both giants have strengths and weaknesses, and the right choice depends on your product, your budget, and your strategy.</p>

      <h2>Fees: a tight match</h2>
      <p>On paper, both platforms charge similar final value fees: <strong>8–15% depending on the category</strong>. But the real difference lies elsewhere:</p>
      <ul>
        <li><strong>eBay</strong>: fee + payment processing (~2%). Typical total cost: 10–17%.</li>
        <li><strong>Amazon</strong>: fee + processing. If you use <strong>FBA</strong> (fulfillment by Amazon), add storage and shipping fees that can push the total cost well beyond 20%.</li>
      </ul>
      <p>Selling yourself (FBM) on Amazon keeps you comparable to eBay. With FBA, you pay more but outsource logistics.</p>

      <h2>Audience: Amazon wins on volume</h2>
      <p>Amazon attracts considerably more traffic, especially for new, mainstream products. eBay keeps a loyal base of bargain hunters, used-goods buyers, collectors, and spare-parts shoppers. If your product is new and standardized, Amazon offers more potential volume. If it's niche, used, or unusual, eBay is often more relevant.</p>

      <h2>Competition: Amazon is saturated</h2>
      <p>Amazon has become extremely competitive: thousands of sellers fight over the same keywords, often with fierce price wars. eBay, while competitive, leaves more room for specialized sellers and differentiated products.</p>

      <h2>Seller experience</h2>
      <ul>
        <li><strong>eBay</strong>: simpler to start, fewer constraints, ideal for launching or testing a product.</li>
        <li><strong>Amazon</strong>: more rules, a more demanding seller account, but powerful tools (FBA, Brand Registry) if you're aiming for volume.</li>
      </ul>

      <h2>So, eBay or Amazon?</h2>
      <p>In short: <strong>Amazon</strong> for volume on new, standardized products; <strong>eBay</strong> to start fast, sell used or niche products, with a gentler learning curve. Many smart sellers use <strong>both in parallel</strong> to diversify their income.</p>`,
    },
    verdict: {
      fr: `<p>Il n'y a pas de vainqueur absolu : <strong>Amazon brille sur le volume</strong>, <strong>eBay sur l'accessibilité et les niches</strong>. Quel que soit votre choix — ou si vous choisissez les deux — une chose est certaine : vous devez connaître précisément vos frais pour savoir si vous gagnez réellement de l'argent.</p>`,
      en: `<p>There's no absolute winner: <strong>Amazon shines on volume</strong>, <strong>eBay on accessibility and niches</strong>. Whatever you choose — or if you choose both — one thing is certain: you must know your exact fees to know whether you're actually making money.</p>`,
    },
    faqs: {
      fr: [
        ['Est-il moins cher de vendre sur eBay ou Amazon ?', 'Les commissions sont proches (8-15 %). Amazon coûte plus cher si vous utilisez FBA (stockage + expédition). En expédition directe (FBM), les deux restent comparables.'],
        ['Puis-je vendre sur eBay et Amazon en même temps ?', 'Oui, c\'est une stratégie courante pour diversifier les revenus et les audiences. Il faut simplement bien gérer ses stocks et ses marges.'],
        ['Quelle plateforme choisir pour débuter ?', 'eBay est souvent plus accessible pour débuter : moins de règles, prise en main rapide, et un bon terrain pour tester un produit avant de passer à l\'échelle.'],
      ],
      en: [
        ['Is it cheaper to sell on eBay or Amazon?', 'Fees are similar (8–15%). Amazon costs more if you use FBA (storage + shipping). With direct shipping (FBM), both stay comparable.'],
        ['Can I sell on eBay and Amazon at the same time?', 'Yes, it\'s a common strategy to diversify income and audiences. You just need to manage inventory and margins carefully.'],
        ['Which platform is best to start with?', 'eBay is often more accessible to start: fewer rules, fast onboarding, and a good place to test a product before scaling.'],
      ],
    },
  },

  {
    id: 'quitter-ebay',
    slug: (l) => l === 'fr' ? 'quitter-ebay-propre-boutique' : 'leave-ebay-own-store',
    emoji: '🚀',
    gradient: 'from-purple-500 to-violet-700',
    badge: 'bg-purple-100 text-purple-700',
    category: { fr: 'Stratégie', en: 'Strategy' },
    date: { fr: '23 septembre 2026', en: 'September 23, 2026' },
    read: { fr: '8 min de lecture', en: '8 min read' },
    title: {
      fr: 'Quitter eBay : le guide pour migrer vers sa propre boutique',
      en: 'Leaving eBay: The Guide to Migrating to Your Own Store',
    },
    cardTitle: {
      fr: 'Quitter eBay : le guide pour migrer vers sa propre boutique e-commerce',
      en: 'Leaving eBay: The Guide to Migrating to Your Own Online Store',
    },
    description: {
      fr: 'Envisagez-vous de quitter eBay ? Découvrez quand migrer vers votre propre boutique, les alternatives (Shopify, WooCommerce) et les étapes clés pour réussir sans perdre vos ventes.',
      en: 'Thinking about leaving eBay? Learn when to migrate to your own store, the alternatives (Shopify, WooCommerce), and the key steps to succeed without losing sales.',
    },
    cardDesc: {
      fr: 'À partir de quel CA faut-il quitter eBay ? Alternatives, étapes de migration et stratégie hybride pour garder vos ventes.',
      en: 'At what revenue should you leave eBay? Alternatives, migration steps, and a hybrid strategy to keep your sales.',
    },
    h1: {
      fr: 'Quitter eBay :<br><span class="text-purple-300">le guide pour migrer vers sa propre boutique</span>',
      en: 'Leaving eBay:<br><span class="text-purple-300">The Guide to Migrating to Your Own Store</span>',
    },
    subtitle: {
      fr: 'Reprendre le contrôle de vos marges, de vos clients et de votre marque — sans perdre vos ventes en route.',
      en: 'Take back control of your margins, your customers, and your brand — without losing sales along the way.',
    },
    body: {
      fr: `<p>Vous vendez sur eBay depuis des années, et vous en avez assez de voir <strong>10 à 17 % de chaque vente</strong> partir en commissions. Vous rêvez d'une boutique à vous, avec vos clients, vos marges et votre marque. Bonne nouvelle : c'est possible, et de plus en plus de vendeurs franchissent le pas.</p>

      <h2>À partir de quand faut-il quitter eBay ?</h2>
      <p>Il n'y a pas de seuil magique, mais un bon repère : <strong>au-delà de 15 000 € de chiffre d'affaires annuel</strong>, les commissions versées à eBay représentent une somme suffisante pour financer largement votre propre boutique (hébergement + plateforme). En dessous, eBay reste un excellent tremplin.</p>

      <h2>Les alternatives à eBay</h2>
      <ul>
        <li><strong>Shopify</strong> : la solution la plus accessible pour lancer une boutique en quelques jours (~30 €/mois).</li>
        <li><strong>WooCommerce</strong> (WordPress) : idéal si vous avez déjà un site, très flexible et open-source.</li>
        <li><strong>PrestaShop</strong> : une alternative open-source solide pour des besoins plus avancés.</li>
      </ul>

      <h2>Les étapes d'une migration réussie</h2>
      <ul>
        <li><strong>Exporter votre catalogue</strong> depuis eBay (titres, descriptions, photos, prix).</li>
        <li><strong>Choisir un nom de domaine</strong> et configurer votre boutique.</li>
        <li><strong>Mettre en place le paiement</strong> (Stripe, PayPal) et la logistique.</li>
        <li><strong>Optimiser le SEO</strong> pour attirer du trafic Google sans dépendre d'eBay.</li>
        <li><strong>Rediriger progressivement</strong> vos clients eBay vers votre boutique (via les supports autorisés).</li>
      </ul>

      <h2>La stratégie hybride : ne coupez pas tout du jour au lendemain</h2>
      <p>Le piège classique est de tout quitter d'un coup et de perdre ses revenus. La bonne approche : <strong>garder eBay comme canal d'acquisition</strong> pendant que votre boutique monte en puissance, puis réduire progressivement votre dépendance. Vous diversifiez ainsi vos revenus et sécurisez votre transition.</p>

      <h2>Notre accompagnement</h2>
      <p>Migrer peut sembler technique, mais vous n'êtes pas obligé de tout faire seul. BeassistScan propose un <strong>accompagnement complet</strong> : import de votre catalogue eBay, design de la boutique, synchronisation des stocks et optimisation SEO. L'objectif : vous rendre indépendant des commissions eBay en gardant 100 % de vos ventes.</p>`,
      en: `<p>You've been selling on eBay for years, and you're tired of watching <strong>10–17% of every sale</strong> go to fees. You dream of your own store, with your own customers, margins, and brand. Good news: it's possible, and more and more sellers are making the move.</p>

      <h2>When should you leave eBay?</h2>
      <p>There's no magic number, but a good benchmark: <strong>above €15,000 in annual sales</strong>, the fees you pay eBay are enough to fully fund your own store (hosting + platform). Below that, eBay remains an excellent launchpad.</p>

      <h2>The alternatives to eBay</h2>
      <ul>
        <li><strong>Shopify</strong>: the most accessible way to launch a store in a few days (~€30/month).</li>
        <li><strong>WooCommerce</strong> (WordPress): ideal if you already have a website, very flexible and open-source.</li>
        <li><strong>PrestaShop</strong>: a solid open-source alternative for more advanced needs.</li>
      </ul>

      <h2>The steps to a successful migration</h2>
      <ul>
        <li><strong>Export your catalog</strong> from eBay (titles, descriptions, photos, prices).</li>
        <li><strong>Choose a domain name</strong> and set up your store.</li>
        <li><strong>Set up payments</strong> (Stripe, PayPal) and logistics.</li>
        <li><strong>Optimize SEO</strong> to attract Google traffic without depending on eBay.</li>
        <li><strong>Gradually redirect</strong> your eBay customers to your store (through allowed channels).</li>
      </ul>

      <h2>The hybrid strategy: don't cut everything overnight</h2>
      <p>The classic trap is leaving everything at once and losing your income. The right approach: <strong>keep eBay as an acquisition channel</strong> while your store grows, then gradually reduce your dependency. You diversify your revenue and secure your transition.</p>

      <h2>Our support</h2>
      <p>Migrating can feel technical, but you don't have to do it all alone. BeassistScan offers <strong>complete support</strong>: import your eBay catalog, design your store, synchronize inventory, and optimize SEO. The goal: become independent from eBay fees while keeping 100% of your sales.</p>`,
    },
    verdict: {
      fr: `<p>Quitter eBay n'est pas une décision à prendre à la légère, mais c'est souvent la meilleure façon de <strong>reprendre le contrôle de vos marges</strong> et de construire une vraie marque. Commencez par mesurer ce qu'eBay vous coûte réellement : si les chiffres vous donnent le vertige, vous saurez qu'il est temps de passer à l'étape suivante.</p>`,
      en: `<p>Leaving eBay isn't a decision to take lightly, but it's often the best way to <strong>take back control of your margins</strong> and build a real brand. Start by measuring what eBay actually costs you: if the numbers make your head spin, you'll know it's time for the next step.</p>`,
    },
    faqs: {
      fr: [
        ['À partir de quel CA faut-il quitter eBay ?', 'Un bon repère est 15 000 € de chiffre d\'affaires annuel : à ce niveau, les commissions versées financent largement votre propre boutique.'],
        ['Quelle est la meilleure alternative à eBay ?', 'Shopify pour la simplicité, WooCommerce si vous avez déjà un site WordPress, PrestaShop pour des besoins avancés. Tout dépend de votre profil.'],
        ['Puis-je garder eBay en parallèle de ma boutique ?', 'Oui, c\'est même recommandé : utilisez eBay pour l\'acquisition et votre boutique pour fidéliser et améliorer vos marges.'],
      ],
      en: [
        ['At what revenue should I leave eBay?', 'A good benchmark is €15,000 in annual sales: at that level, the fees you pay fully fund your own store.'],
        ['What is the best alternative to eBay?', 'Shopify for simplicity, WooCommerce if you already have a WordPress site, PrestaShop for advanced needs. It depends on your profile.'],
        ['Can I keep eBay alongside my store?', 'Yes, it\'s even recommended: use eBay for acquisition and your store to retain customers and improve margins.'],
      ],
    },
  },
];

// ---------------- GÉNÉRATION ----------------

for (const a of articles) {
  for (const lang of ['fr', 'en']) {
    const file = path.join(PUB, 'blog', lang, `${a.slug(lang)}.html`);
    fs.writeFileSync(file, render(a, lang), 'utf8');
    console.log('✅', path.relative(PUB, file));
  }
}

// Mise à jour des index
for (const lang of ['fr', 'en']) {
  const idx = path.join(PUB, 'blog', lang, 'index.html');
  let s = fs.readFileSync(idx, 'utf8');
  const teaser = '      <!-- Prochains articles (teaser) -->';
  if (!s.includes(teaser)) { console.error('❌ teaser introuvable dans', idx); continue; }
  const cards = articles.map((a) => card(a, lang)).join('\n\n');
  s = s.replace(teaser, `${cards}\n\n${teaser}`);
  fs.writeFileSync(idx, s, 'utf8');
  console.log('✅ index mis à jour:', path.relative(PUB, idx));
}

console.log('\nTerminé.');
