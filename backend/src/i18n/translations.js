/**
 * Traductions complètes pour FR / EN / ES / DE / IT
 * Couverture : interface, paiement, emails, erreurs, blog, dashboard
 */

const translations = {
  fr: {
    // Navigation
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'nav.tagline': 'Analyse eBay en temps réel',

    // Hero
    'hero.title1': "Découvrez ce qu'eBay",
    'hero.title2': 'vous coûte vraiment',
    'hero.subtitle': 'Connectez votre boutique en 1 clic et recevez votre rapport de rentabilité gratuit en moins de 2 minutes.',
    'hero.cta': 'Analyser mes frais gratuitement',
    'hero.nocb': '✦ Sans CB · Résultat immédiat',
    'hero.stat1.value': '+2 800€',
    'hero.stat1.label': 'Récupérés en moyenne / an',
    'hero.stat2.value': '3 000+',
    'hero.stat2.label': 'Vendeurs analysés',
    'hero.stat3.value': '100%',
    'hero.stat3.label': 'Gratuit & sans CB',

    // Carte principale
    'card.title': 'Rapport de Rentabilité',
    'card.subtitle': 'Connectez votre eBay pour recevoir votre analyse gratuite.',
    'card.subtitle.report': 'Analysez vos frais et découvrez vos économies.',

    // Étape eBay
    'ebay.connect.title': 'Connectez votre boutique eBay',
    'ebay.connect.subtitle': 'En 1 clic, on analyse vos frais des 90 derniers jours. Aucun mot de passe stocké.',
    'ebay.connect.btn': 'Connecter mon compte eBay',
    'ebay.trust.secure': '✓ Gratuit',
    'ebay.trust.free': '✓ 100% sécurisé',
    'ebay.trust.revoke': '✓ Révocable à tout moment',
    'ebay.already': 'Déjà un compte BeassistScan ?',
    'ebay.signin': 'Se connecter',
    'ebay.connected': 'Compte eBay connecté',

    // Formulaire rapport
    'form.storeName': 'Nom de votre boutique',
    'form.storeName.optional': '(optionnel)',
    'form.storeName.placeholder': 'Ex: TechStoreFrance',
    'form.email': 'Email pour recevoir votre rapport PDF',
    'form.email.placeholder': 'contact@votre-boutique.com',
    'form.period': 'Période analysée',
    'form.period.default': '90 derniers jours (par défaut)',
    'form.submit': '🔍 Analyser mes frais gratuitement',
    'form.submitting': 'Analyse en cours...',

    // Résultats
    'results.success': 'Rapport envoyé avec succès !',
    'results.sales': 'CA total',
    'results.fees': 'Commissions',
    'results.saving': 'Économie/an',
    'results.email': '📧 Rapport PDF envoyé à',

    // Compte optionnel
    'account.save.title': '💾 Sauvegardez vos rapports',
    'account.save.subtitle': 'Créez un compte gratuit pour retrouver tous vos rapports filtrés par mois.',
    'account.save.btn': 'Créer mon compte gratuitement',

    // Auth
    'auth.login': 'Connexion',
    'auth.register': "Créer un compte",
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': '8 caractères minimum',
    'auth.firstname': 'Prénom',
    'auth.firstname.optional': 'optionnel',
    'auth.login.btn': 'Se connecter',
    'auth.register.btn': 'Créer mon compte',
    'auth.login.error': 'Identifiants incorrects.',
    'auth.register.error': "Erreur lors de l'inscription.",

    // Paiement
    'payment.title': '🔓 Aller plus loin',
    'payment.secure': 'Paiement sécurisé via Stripe · Annulation à tout moment',
    'payment.currency': '€',
    'payment.report.title': 'Rapport Détaillé',
    'payment.report.subtitle': 'Analyse complète avec insights actionnables.',
    'payment.report.feat1': 'Analyse par catégorie',
    'payment.report.feat2': 'Évolution mensuelle',
    'payment.report.feat3': 'Conseils personnalisés',
    'payment.report.price': '5',
    'payment.report.btn': '🛒 Acheter',
    'payment.report.badge': 'POPULAIRE',
    'payment.pro.title': 'Abonnement Pro',
    'payment.pro.subtitle': 'Suivi mensuel automatique de vos frais.',
    'payment.pro.feat1': 'Rapport mensuel auto',
    'payment.pro.feat2': 'Alertes concurrentielles',
    'payment.pro.feat3': 'Suivi en temps réel',
    'payment.pro.price': '19',
    'payment.pro.period': '/mois',
    'payment.pro.btn': "🚀 S'abonner",
    'payment.success': '✅ Paiement réussi ! Votre rapport vous sera envoyé par email.',
    'payment.cancelled': '⚠️ Paiement annulé.',

    // Comment ça marche
    'how.title': '⚙️ Comment ça marche ?',
    'how.subtitle': 'Simple, rapide, sans engagement',
    'how.step1.title': 'Connexion sécurisée',
    'how.step1.text': 'Connectez votre eBay en un clic. Aucun mot de passe stocké.',
    'how.step2.title': 'Analyse automatique',
    'how.step2.text': 'Notre algorithme calcule exactement ce qu\'eBay vous a prélevé.',
    'how.step3.title': 'Rapport PDF',
    'how.step3.text': 'Recevez un PDF avec vos économies potentielles par email.',

    // Exemple rapport
    'example.title': '📈 Exemple de rapport',
    'example.subtitle': 'Résultats réels d\'un vendeur sur 3 mois :',
    'example.sales': 'CA total',
    'example.fees': 'Commissions eBay',
    'example.saving': 'Économie / an',
    'example.note': '* Taux de commission moyen de 12%',

    // Agence
    'agency.badge': '🏪 Notre agence',
    'agency.title': 'Votre propre site e-commerce, sans les commissions eBay',
    'agency.subtitle': 'Nous importons votre catalogue eBay dans une boutique indépendante. Gardez 100% de vos ventes, optimisez votre SEO Google et devenez indépendant des marketplaces.',
    'agency.feature': '🤝 Accompagnement complet par notre agence',
    'agency.feature.text': 'Import catalogue · Design · Synchronisation stocks · SEO · Suivi',
    'agency.cta': '👉 Demander un devis gratuit',

    // Confiance
    'trust.secure.title': '100% sécurisé',
    'trust.secure.text': 'Connexion officielle eBay. Aucun mot de passe collecté.',
    'trust.free.title': 'Gratuit et sans engagement',
    'trust.free.text': 'Le rapport de base est offert. Payez uniquement pour le détail.',
    'trust.fast.title': 'Résultats instantanés',
    'trust.fast.text': 'Moins de 2 minutes pour votre diagnostic complet.',
    'trust.pdf.title': 'PDF par email',
    'trust.pdf.text': 'Conservez et partagez votre rapport facilement.',

    // CTA final
    'cta.final.text': 'Prêt à découvrir combien vous pourriez économiser ?',
    'cta.final.btn': 'Connecter mon compte eBay',

    // Erreurs eBay
    'ebay.error.generic': '❌ La connexion eBay a échoué.',
    'ebay.error.token': 'Erreur token.',
    'ebay.error.csrf': 'Erreur sécurité CSRF.',
    'ebay.error.nocode': 'Aucun code eBay reçu.',

    // Footer
    'footer.rights': '© 2026 Beassist Agency · Votre partenaire e-commerce',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.cgv': 'CGV',

    // Messages
    'msg.ebay.connected': '✅ Compte eBay connecté avec succès !',
    'msg.error.generic': 'Une erreur est survenue.',
    'period.months': '12 derniers mois',

    // ===== NOUVEAU : DASHBOARD =====
    'dashboard.title': 'Tableau de bord',
    'dashboard.greeting': 'Bonjour, {name}',
    'dashboard.new_report': 'Nouveau rapport',
    'dashboard.total_sales': 'CA total',
    'dashboard.total_fees': 'Commissions totales',
    'dashboard.total_saving': 'Économies / an estimées',
    'dashboard.history_title': '📄 Historique des rapports',
    'dashboard.report_count': '{count} rapport{plural}',
    'dashboard.empty_title': 'Aucun rapport généré pour le moment.',
    'dashboard.empty_cta': 'Générer mon premier rapport',
    'dashboard.back_home': '← Retour à l’accueil',
    'dashboard.badge_saving': 'économies/an',
    'dashboard.download_pdf': '📄 PDF',
    'dashboard.store_name_default': 'Boutique sans nom',
    'dashboard.no_store': 'Aucune boutique renseignée',
    'dashboard.period': 'Période',
  },

  en: {
    // Navigation
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Sign in',
    'nav.logout': 'Sign out',
    'nav.tagline': 'Real-time eBay analysis',

    // Hero
    'hero.title1': 'Find out what eBay',
    'hero.title2': 'really costs you',
    'hero.subtitle': 'Connect your store in 1 click and get your free profitability report in under 2 minutes.',
    'hero.cta': 'Analyze my fees for free',
    'hero.nocb': '✦ No credit card · Instant result',
    'hero.stat1.value': '+€2,800',
    'hero.stat1.label': 'Recovered on average / year',
    'hero.stat2.value': '3,000+',
    'hero.stat2.label': 'Sellers analyzed',
    'hero.stat3.value': '100%',
    'hero.stat3.label': 'Free & no credit card',

    // Carte principale
    'card.title': 'Profitability Report',
    'card.subtitle': 'Connect your eBay to receive your free analysis.',
    'card.subtitle.report': 'Analyze your fees and discover your savings.',

    // Étape eBay
    'ebay.connect.title': 'Connect your eBay store',
    'ebay.connect.subtitle': 'In 1 click, we analyze your fees from the last 90 days. No password stored.',
    'ebay.connect.btn': 'Connect my eBay account',
    'ebay.trust.secure': '✓ Free',
    'ebay.trust.free': '✓ 100% secure',
    'ebay.trust.revoke': '✓ Revocable anytime',
    'ebay.already': 'Already have a BeassistScan account?',
    'ebay.signin': 'Sign in',
    'ebay.connected': 'eBay account connected',

    // Formulaire rapport
    'form.storeName': 'Your store name',
    'form.storeName.optional': '(optional)',
    'form.storeName.placeholder': 'e.g. TechStoreFrance',
    'form.email': 'Email to receive your PDF report',
    'form.email.placeholder': 'contact@your-store.com',
    'form.period': 'Analysis period',
    'form.period.default': 'Last 90 days (default)',
    'form.submit': '🔍 Analyze my fees for free',
    'form.submitting': 'Analyzing...',

    // Résultats
    'results.success': 'Report sent successfully!',
    'results.sales': 'Total revenue',
    'results.fees': 'Commissions',
    'results.saving': 'Savings/year',
    'results.email': '📧 PDF report sent to',

    // Compte optionnel
    'account.save.title': '💾 Save your reports',
    'account.save.subtitle': 'Create a free account to access all your reports filtered by month.',
    'account.save.btn': 'Create my free account',

    // Auth
    'auth.login': 'Sign in',
    'auth.register': 'Create account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'Minimum 8 characters',
    'auth.firstname': 'First name',
    'auth.firstname.optional': 'optional',
    'auth.login.btn': 'Sign in',
    'auth.register.btn': 'Create my account',
    'auth.login.error': 'Incorrect credentials.',
    'auth.register.error': 'Error during registration.',

    // Paiement
    'payment.title': '🔓 Go further',
    'payment.secure': 'Secure payment via Stripe · Cancel anytime',
    'payment.currency': '$',
    'payment.report.title': 'Detailed Report',
    'payment.report.subtitle': 'Complete analysis with actionable insights.',
    'payment.report.feat1': 'Category breakdown',
    'payment.report.feat2': 'Monthly trends',
    'payment.report.feat3': 'Personalized advice',
    'payment.report.price': '5',
    'payment.report.btn': '🛒 Buy',
    'payment.report.badge': 'POPULAR',
    'payment.pro.title': 'Pro Subscription',
    'payment.pro.subtitle': 'Automatic monthly tracking of your fees.',
    'payment.pro.feat1': 'Auto monthly report',
    'payment.pro.feat2': 'Competitive alerts',
    'payment.pro.feat3': 'Real-time tracking',
    'payment.pro.price': '19',
    'payment.pro.period': '/month',
    'payment.pro.btn': '🚀 Subscribe',
    'payment.success': '✅ Payment successful! Your report will be sent by email.',
    'payment.cancelled': '⚠️ Payment cancelled.',

    // Comment ça marche
    'how.title': '⚙️ How it works',
    'how.subtitle': 'Simple, fast, no commitment',
    'how.step1.title': 'Secure connection',
    'how.step1.text': 'Connect your eBay in one click. No password stored.',
    'how.step2.title': 'Automatic analysis',
    'how.step2.text': 'Our algorithm calculates exactly what eBay charged you.',
    'how.step3.title': 'PDF Report',
    'how.step3.text': 'Receive a PDF with your potential savings by email.',

    // Exemple rapport
    'example.title': '📈 Report example',
    'example.subtitle': 'Real results from a seller over 3 months:',
    'example.sales': 'Total revenue',
    'example.fees': 'eBay commissions',
    'example.saving': 'Savings / year',
    'example.note': '* Average commission rate of 12%',

    // Agence
    'agency.badge': '🏪 Our agency',
    'agency.title': 'Your own e-commerce site, without eBay commissions',
    'agency.subtitle': 'We import your eBay catalog into an independent store. Keep 100% of your sales, optimize your Google SEO and become independent from marketplaces.',
    'agency.feature': '🤝 Full support from our agency',
    'agency.feature.text': 'Catalog import · Design · Stock sync · SEO · Follow-up',
    'agency.cta': '👉 Request a free quote',

    // Confiance
    'trust.secure.title': '100% secure',
    'trust.secure.text': 'Official eBay connection. No password collected.',
    'trust.free.title': 'Free and no commitment',
    'trust.free.text': 'The basic report is free. Pay only for the detail.',
    'trust.fast.title': 'Instant results',
    'trust.fast.text': 'Less than 2 minutes for your full diagnosis.',
    'trust.pdf.title': 'PDF by email',
    'trust.pdf.text': 'Keep and share your report easily.',

    // CTA final
    'cta.final.text': 'Ready to find out how much you could save?',
    'cta.final.btn': 'Connect my eBay account',

    // Erreurs eBay
    'ebay.error.generic': '❌ eBay connection failed.',
    'ebay.error.token': 'Token error.',
    'ebay.error.csrf': 'CSRF security error.',
    'ebay.error.nocode': 'No eBay code received.',

    // Footer
    'footer.rights': '© 2026 Beassist Agency · Your e-commerce partner',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.cgv': 'Terms',

    // Messages
    'msg.ebay.connected': '✅ eBay account connected successfully!',
    'msg.error.generic': 'An error occurred.',
    'period.months': 'Last 12 months',

    // ===== NOUVEAU : DASHBOARD =====
    'dashboard.title': 'Dashboard',
    'dashboard.greeting': 'Hello, {name}',
    'dashboard.new_report': 'New report',
    'dashboard.total_sales': 'Total revenue',
    'dashboard.total_fees': 'Total commissions',
    'dashboard.total_saving': 'Estimated savings / year',
    'dashboard.history_title': '📄 Report history',
    'dashboard.report_count': '{count} report{plural}',
    'dashboard.empty_title': 'No reports generated yet.',
    'dashboard.empty_cta': 'Generate my first report',
    'dashboard.back_home': '← Back to home',
    'dashboard.badge_saving': 'savings/year',
    'dashboard.download_pdf': '📄 PDF',
    'dashboard.store_name_default': 'Unnamed store',
    'dashboard.no_store': 'No store registered',
    'dashboard.period': 'Period',
  },

  es: {
    // Navigation
    'nav.blog': 'Blog',
    'nav.dashboard': 'Panel',
    'nav.login': 'Iniciar sesión',
    'nav.logout': 'Cerrar sesión',
    'nav.tagline': 'Análisis de eBay en tiempo real',

    // Hero
    'hero.title1': 'Descubre lo que eBay',
    'hero.title2': 'realmente te cuesta',
    'hero.subtitle': 'Conecta tu tienda en 1 clic y recibe tu informe de rentabilidad gratuito en menos de 2 minutos.',
    'hero.cta': 'Analizar mis tarifas gratis',
    'hero.nocb': '✦ Sin tarjeta · Resultado inmediato',
    'hero.stat1.value': '+2.800€',
    'hero.stat1.label': 'Recuperados de media / año',
    'hero.stat2.value': '3.000+',
    'hero.stat2.label': 'Vendedores analizados',
    'hero.stat3.value': '100%',
    'hero.stat3.label': 'Gratis y sin tarjeta',

    // Carte principale
    'card.title': 'Informe de Rentabilidad',
    'card.subtitle': 'Conecta tu eBay para recibir tu análisis gratuito.',
    'card.subtitle.report': 'Analiza tus tarifas y descubre tus ahorros.',

    // Étape eBay
    'ebay.connect.title': 'Conecta tu tienda eBay',
    'ebay.connect.subtitle': 'En 1 clic, analizamos tus tarifas de los últimos 90 días. Sin almacenar contraseñas.',
    'ebay.connect.btn': 'Conectar mi cuenta eBay',
    'ebay.trust.secure': '✓ Gratis',
    'ebay.trust.free': '✓ 100% seguro',
    'ebay.trust.revoke': '✓ Revocable en cualquier momento',
    'ebay.already': '¿Ya tienes una cuenta BeassistScan?',
    'ebay.signin': 'Iniciar sesión',
    'ebay.connected': 'Cuenta eBay conectada',

    // Formulaire rapport
    'form.storeName': 'Nombre de tu tienda',
    'form.storeName.optional': '(opcional)',
    'form.storeName.placeholder': 'Ej: TechStoreFrance',
    'form.email': 'Email para recibir tu informe PDF',
    'form.email.placeholder': 'contacto@tu-tienda.com',
    'form.period': 'Período analizado',
    'form.period.default': 'Últimos 90 días (por defecto)',
    'form.submit': '🔍 Analizar mis tarifas gratis',
    'form.submitting': 'Analizando...',

    // Résultats
    'results.success': '¡Informe enviado con éxito!',
    'results.sales': 'Ingresos totales',
    'results.fees': 'Comisiones',
    'results.saving': 'Ahorro/año',
    'results.email': '📧 Informe PDF enviado a',

    // Compte optionnel
    'account.save.title': '💾 Guarda tus informes',
    'account.save.subtitle': 'Crea una cuenta gratuita para acceder a todos tus informes filtrados por mes.',
    'account.save.btn': 'Crear mi cuenta gratis',

    // Auth
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Crear cuenta',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'Mínimo 8 caracteres',
    'auth.firstname': 'Nombre',
    'auth.firstname.optional': 'opcional',
    'auth.login.btn': 'Iniciar sesión',
    'auth.register.btn': 'Crear mi cuenta',
    'auth.login.error': 'Credenciales incorrectas.',
    'auth.register.error': 'Error durante el registro.',

    // Paiement
    'payment.title': '🔓 Ir más lejos',
    'payment.secure': 'Pago seguro con Stripe · Cancelación en cualquier momento',
    'payment.currency': '€',
    'payment.report.title': 'Informe Detallado',
    'payment.report.subtitle': 'Análisis completo con información útil.',
    'payment.report.feat1': 'Análisis por categoría',
    'payment.report.feat2': 'Evolución mensual',
    'payment.report.feat3': 'Consejos personalizados',
    'payment.report.price': '5',
    'payment.report.btn': '🛒 Comprar',
    'payment.report.badge': 'POPULAR',
    'payment.pro.title': 'Suscripción Pro',
    'payment.pro.subtitle': 'Seguimiento mensual automático de tus tarifas.',
    'payment.pro.feat1': 'Informe mensual auto',
    'payment.pro.feat2': 'Alertas competitivas',
    'payment.pro.feat3': 'Seguimiento en tiempo real',
    'payment.pro.price': '19',
    'payment.pro.period': '/mes',
    'payment.pro.btn': '🚀 Suscribirse',
    'payment.success': '✅ ¡Pago realizado! Tu informe será enviado por email.',
    'payment.cancelled': '⚠️ Pago cancelado.',

    // Comment ça marche
    'how.title': '⚙️ ¿Cómo funciona?',
    'how.subtitle': 'Simple, rápido, sin compromiso',
    'how.step1.title': 'Conexión segura',
    'how.step1.text': 'Conecta tu eBay en un clic. Sin almacenar contraseñas.',
    'how.step2.title': 'Análisis automático',
    'how.step2.text': 'Nuestro algoritmo calcula exactamente lo que eBay te cobró.',
    'how.step3.title': 'Informe PDF',
    'how.step3.text': 'Recibe un PDF con tus ahorros potenciales por email.',

    // Exemple rapport
    'example.title': '📈 Ejemplo de informe',
    'example.subtitle': 'Resultados reales de un vendedor en 3 meses:',
    'example.sales': 'Ingresos totales',
    'example.fees': 'Comisiones eBay',
    'example.saving': 'Ahorro / año',
    'example.note': '* Tasa de comisión media del 12%',

    // Agence
    'agency.badge': '🏪 Nuestra agencia',
    'agency.title': 'Tu propia tienda e-commerce, sin comisiones eBay',
    'agency.subtitle': 'Importamos tu catálogo eBay a una tienda independiente. Conserva el 100% de tus ventas.',
    'agency.feature': '🤝 Acompañamiento completo',
    'agency.feature.text': 'Importación · Diseño · Sincronización · SEO · Seguimiento',
    'agency.cta': '👉 Solicitar presupuesto gratis',

    // Confiance
    'trust.secure.title': '100% seguro',
    'trust.secure.text': 'Conexión oficial eBay. Sin recopilar contraseñas.',
    'trust.free.title': 'Gratis y sin compromiso',
    'trust.free.text': 'El informe básico es gratuito. Paga solo por el detalle.',
    'trust.fast.title': 'Resultados instantáneos',
    'trust.fast.text': 'Menos de 2 minutos para tu diagnóstico completo.',
    'trust.pdf.title': 'PDF por email',
    'trust.pdf.text': 'Conserva y comparte tu informe fácilmente.',

    // CTA final
    'cta.final.text': '¿Listo para descubrir cuánto podrías ahorrar?',
    'cta.final.btn': 'Conectar mi cuenta eBay',

    // Erreurs eBay
    'ebay.error.generic': '❌ La conexión con eBay falló.',
    'ebay.error.token': 'Error de token.',
    'ebay.error.csrf': 'Error de seguridad CSRF.',
    'ebay.error.nocode': 'No se recibió código eBay.',

    // Footer
    'footer.rights': '© 2026 Beassist Agency · Tu socio e-commerce',
    'footer.legal': 'Aviso legal',
    'footer.privacy': 'Privacidad',
    'footer.cgv': 'Condiciones',

    // Messages
    'msg.ebay.connected': '✅ ¡Cuenta eBay conectada con éxito!',
    'msg.error.generic': 'Se produjo un error.',
    'period.months': 'Últimos 12 meses',

    // ===== NOUVEAU : DASHBOARD =====
    'dashboard.title': 'Panel de control',
    'dashboard.greeting': 'Hola, {name}',
    'dashboard.new_report': 'Nuevo informe',
    'dashboard.total_sales': 'Ingresos totales',
    'dashboard.total_fees': 'Comisiones totales',
    'dashboard.total_saving': 'Ahorro estimado / año',
    'dashboard.history_title': '📄 Historial de informes',
    'dashboard.report_count': '{count} informe{plural}',
    'dashboard.empty_title': 'Aún no se ha generado ningún informe.',
    'dashboard.empty_cta': 'Generar mi primer informe',
    'dashboard.back_home': '← Volver al inicio',
    'dashboard.badge_saving': 'ahorro/año',
    'dashboard.download_pdf': '📄 PDF',
    'dashboard.store_name_default': 'Tienda sin nombre',
    'dashboard.no_store': 'Ninguna tienda registrada',
    'dashboard.period': 'Período',
  },

  de: {
    // Navigation
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Anmelden',
    'nav.logout': 'Abmelden',
    'nav.tagline': 'eBay-Analyse in Echtzeit',

    // Hero
    'hero.title1': 'Entdecken Sie, was eBay',
    'hero.title2': 'Sie wirklich kostet',
    'hero.subtitle': 'Verbinden Sie Ihren Shop mit 1 Klick und erhalten Sie Ihren kostenlosen Rentabilitätsbericht in weniger als 2 Minuten.',
    'hero.cta': 'Meine Gebühren kostenlos analysieren',
    'hero.nocb': '✦ Ohne Kreditkarte · Sofortiges Ergebnis',
    'hero.stat1.value': '+2.800€',
    'hero.stat1.label': 'Durchschnittlich zurückgewonnen / Jahr',
    'hero.stat2.value': '3.000+',
    'hero.stat2.label': 'Analysierte Verkäufer',
    'hero.stat3.value': '100%',
    'hero.stat3.label': 'Kostenlos & ohne Kreditkarte',

    // Carte principale
    'card.title': 'Rentabilitätsbericht',
    'card.subtitle': 'Verbinden Sie Ihr eBay, um Ihre kostenlose Analyse zu erhalten.',
    'card.subtitle.report': 'Analysieren Sie Ihre Gebühren und entdecken Sie Ihre Einsparungen.',

    // Étape eBay
    'ebay.connect.title': 'Verbinden Sie Ihren eBay-Shop',
    'ebay.connect.subtitle': 'Mit 1 Klick analysieren wir Ihre Gebühren der letzten 90 Tage. Kein Passwort gespeichert.',
    'ebay.connect.btn': 'Mein eBay-Konto verbinden',
    'ebay.trust.secure': '✓ Kostenlos',
    'ebay.trust.free': '✓ 100% sicher',
    'ebay.trust.revoke': '✓ Jederzeit widerrufbar',
    'ebay.already': 'Haben Sie bereits ein BeassistScan-Konto?',
    'ebay.signin': 'Anmelden',
    'ebay.connected': 'eBay-Konto verbunden',

    // Formulaire rapport
    'form.storeName': 'Name Ihres Shops',
    'form.storeName.optional': '(optional)',
    'form.storeName.placeholder': 'z.B. TechStoreFrance',
    'form.email': 'E-Mail für Ihren PDF-Bericht',
    'form.email.placeholder': 'kontakt@ihr-shop.de',
    'form.period': 'Analysezeitraum',
    'form.period.default': 'Letzte 90 Tage (Standard)',
    'form.submit': '🔍 Meine Gebühren kostenlos analysieren',
    'form.submitting': 'Wird analysiert...',

    // Résultats
    'results.success': 'Bericht erfolgreich gesendet!',
    'results.sales': 'Gesamtumsatz',
    'results.fees': 'Provisionen',
    'results.saving': 'Ersparnis/Jahr',
    'results.email': '📧 PDF-Bericht gesendet an',

    // Compte optionnel
    'account.save.title': '💾 Berichte speichern',
    'account.save.subtitle': 'Erstellen Sie ein kostenloses Konto, um alle Ihre nach Monat gefilterten Berichte abzurufen.',
    'account.save.btn': 'Mein kostenloses Konto erstellen',

    // Auth
    'auth.login': 'Anmelden',
    'auth.register': 'Konto erstellen',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'Mindestens 8 Zeichen',
    'auth.firstname': 'Vorname',
    'auth.firstname.optional': 'optional',
    'auth.login.btn': 'Anmelden',
    'auth.register.btn': 'Mein Konto erstellen',
    'auth.login.error': 'Falsche Anmeldedaten.',
    'auth.register.error': 'Fehler bei der Registrierung.',

    // Paiement
    'payment.title': '🔓 Weiter gehen',
    'payment.secure': 'Sichere Zahlung über Stripe · Jederzeit kündbar',
    'payment.currency': '€',
    'payment.report.title': 'Detaillierter Bericht',
    'payment.report.subtitle': 'Vollständige Analyse mit umsetzbaren Erkenntnissen.',
    'payment.report.feat1': 'Kategorieanalyse',
    'payment.report.feat2': 'Monatliche Entwicklung',
    'payment.report.feat3': 'Persönliche Empfehlungen',
    'payment.report.price': '5',
    'payment.report.btn': '🛒 Kaufen',
    'payment.report.badge': 'BELIEBT',
    'payment.pro.title': 'Pro-Abonnement',
    'payment.pro.subtitle': 'Automatische monatliche Verfolgung Ihrer Gebühren.',
    'payment.pro.feat1': 'Automatischer Monatsbericht',
    'payment.pro.feat2': 'Wettbewerbsalarme',
    'payment.pro.feat3': 'Echtzeit-Tracking',
    'payment.pro.price': '19',
    'payment.pro.period': '/Monat',
    'payment.pro.btn': '🚀 Abonnieren',
    'payment.success': '✅ Zahlung erfolgreich! Ihr Bericht wird per E-Mail gesendet.',
    'payment.cancelled': '⚠️ Zahlung abgebrochen.',

    // Comment ça marche
    'how.title': '⚙️ Wie funktioniert es?',
    'how.subtitle': 'Einfach, schnell, ohne Verpflichtung',
    'how.step1.title': 'Sichere Verbindung',
    'how.step1.text': 'Verbinden Sie Ihr eBay mit einem Klick. Kein Passwort gespeichert.',
    'how.step2.title': 'Automatische Analyse',
    'how.step2.text': 'Unser Algorithmus berechnet genau, was eBay Ihnen berechnet hat.',
    'how.step3.title': 'PDF-Bericht',
    'how.step3.text': 'Erhalten Sie per E-Mail ein PDF mit Ihren potenziellen Einsparungen.',

    // Exemple rapport
    'example.title': '📈 Berichtsbeispiel',
    'example.subtitle': 'Echte Ergebnisse eines Verkäufers über 3 Monate:',
    'example.sales': 'Gesamtumsatz',
    'example.fees': 'eBay-Provisionen',
    'example.saving': 'Ersparnis / Jahr',
    'example.note': '* Durchschnittliche Provisionsrate von 12%',

    // Agence
    'agency.badge': '🏪 Unsere Agentur',
    'agency.title': 'Ihr eigener Online-Shop ohne eBay-Provisionen',
    'agency.subtitle': 'Wir importieren Ihren eBay-Katalog in einen unabhängigen Shop. Behalten Sie 100% Ihrer Verkäufe.',
    'agency.feature': '🤝 Vollständige Begleitung durch unsere Agentur',
    'agency.feature.text': 'Katalogimport · Design · Lagersync · SEO · Nachverfolgung',
    'agency.cta': '👉 Kostenloses Angebot anfragen',

    // Confiance
    'trust.secure.title': '100% sicher',
    'trust.secure.text': 'Offizielle eBay-Verbindung. Kein Passwort gesammelt.',
    'trust.free.title': 'Kostenlos und ohne Verpflichtung',
    'trust.free.text': 'Der Basisbericht ist kostenlos. Zahlen Sie nur für das Detail.',
    'trust.fast.title': 'Sofortige Ergebnisse',
    'trust.fast.text': 'Weniger als 2 Minuten für Ihre vollständige Diagnose.',
    'trust.pdf.title': 'PDF per E-Mail',
    'trust.pdf.text': 'Bewahren und teilen Sie Ihren Bericht einfach.',

    // CTA final
    'cta.final.text': 'Bereit herauszufinden, wie viel Sie sparen könnten?',
    'cta.final.btn': 'Mein eBay-Konto verbinden',

    // Erreurs eBay
    'ebay.error.generic': '❌ eBay-Verbindung fehlgeschlagen.',
    'ebay.error.token': 'Token-Fehler.',
    'ebay.error.csrf': 'CSRF-Sicherheitsfehler.',
    'ebay.error.nocode': 'Kein eBay-Code erhalten.',

    // Footer
    'footer.rights': '© 2026 Beassist Agency · Ihr E-Commerce-Partner',
    'footer.legal': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.cgv': 'AGB',

    // Messages
    'msg.ebay.connected': '✅ eBay-Konto erfolgreich verbunden!',
    'msg.error.generic': 'Ein Fehler ist aufgetreten.',
    'period.months': 'Letzte 12 Monate',

    // ===== NOUVEAU : DASHBOARD =====
    'dashboard.title': 'Dashboard',
    'dashboard.greeting': 'Hallo, {name}',
    'dashboard.new_report': 'Neuer Bericht',
    'dashboard.total_sales': 'Gesamtumsatz',
    'dashboard.total_fees': 'Gesamtprovisionen',
    'dashboard.total_saving': 'Geschätzte Ersparnis / Jahr',
    'dashboard.history_title': '📄 Berichtshistorie',
    'dashboard.report_count': '{count} Bericht{plural}',
    'dashboard.empty_title': 'Bisher wurden keine Berichte generiert.',
    'dashboard.empty_cta': 'Meinen ersten Bericht erstellen',
    'dashboard.back_home': '← Zurück zur Startseite',
    'dashboard.badge_saving': 'Ersparnis/Jahr',
    'dashboard.download_pdf': '📄 PDF',
    'dashboard.store_name_default': 'Unbenannter Shop',
    'dashboard.no_store': 'Kein Shop registriert',
    'dashboard.period': 'Zeitraum',
  },

  it: {
    // Navigation
    'nav.blog': 'Blog',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Accedi',
    'nav.logout': 'Esci',
    'nav.tagline': 'Analisi eBay in tempo reale',

    // Hero
    'hero.title1': 'Scopri quanto eBay',
    'hero.title2': 'ti costa davvero',
    'hero.subtitle': 'Collega il tuo negozio con 1 clic e ricevi il tuo rapporto di redditività gratuito in meno di 2 minuti.',
    'hero.cta': 'Analizza le mie commissioni gratis',
    'hero.nocb': '✦ Senza carta · Risultato immediato',
    'hero.stat1.value': '+2.800€',
    'hero.stat1.label': 'Recuperati in media / anno',
    'hero.stat2.value': '3.000+',
    'hero.stat2.label': 'Venditori analizzati',
    'hero.stat3.value': '100%',
    'hero.stat3.label': 'Gratuito & senza carta',

    // Carte principale
    'card.title': 'Rapporto di Redditività',
    'card.subtitle': 'Collega il tuo eBay per ricevere la tua analisi gratuita.',
    'card.subtitle.report': 'Analizza le tue commissioni e scopri i tuoi risparmi.',

    // Étape eBay
    'ebay.connect.title': 'Collega il tuo negozio eBay',
    'ebay.connect.subtitle': 'In 1 clic, analizziamo le tue commissioni degli ultimi 90 giorni. Nessuna password salvata.',
    'ebay.connect.btn': 'Collega il mio account eBay',
    'ebay.trust.secure': '✓ Gratuito',
    'ebay.trust.free': '✓ 100% sicuro',
    'ebay.trust.revoke': '✓ Revocabile in qualsiasi momento',
    'ebay.already': 'Hai già un account BeassistScan?',
    'ebay.signin': 'Accedi',
    'ebay.connected': 'Account eBay collegato',

    // Formulaire rapport
    'form.storeName': 'Nome del tuo negozio',
    'form.storeName.optional': '(opzionale)',
    'form.storeName.placeholder': 'Es: TechStoreFrance',
    'form.email': 'Email per ricevere il tuo rapporto PDF',
    'form.email.placeholder': 'contatto@tuo-negozio.com',
    'form.period': 'Periodo analizzato',
    'form.period.default': 'Ultimi 90 giorni (predefinito)',
    'form.submit': '🔍 Analizza le mie commissioni gratis',
    'form.submitting': 'Analisi in corso...',

    // Résultats
    'results.success': 'Rapporto inviato con successo!',
    'results.sales': 'Fatturato totale',
    'results.fees': 'Commissioni',
    'results.saving': 'Risparmio/anno',
    'results.email': '📧 Rapporto PDF inviato a',

    // Compte optionnel
    'account.save.title': '💾 Salva i tuoi rapporti',
    'account.save.subtitle': "Crea un account gratuito per accedere a tutti i tuoi rapporti filtrati per mese.",
    'account.save.btn': 'Crea il mio account gratuito',

    // Auth
    'auth.login': 'Accedi',
    'auth.register': 'Crea account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'Minimo 8 caratteri',
    'auth.firstname': 'Nome',
    'auth.firstname.optional': 'opzionale',
    'auth.login.btn': 'Accedi',
    'auth.register.btn': 'Crea il mio account',
    'auth.login.error': 'Credenziali errate.',
    'auth.register.error': "Errore durante la registrazione.",

    // Paiement
    'payment.title': '🔓 Vai oltre',
    'payment.secure': 'Pagamento sicuro tramite Stripe · Annulla in qualsiasi momento',
    'payment.currency': '€',
    'payment.report.title': 'Rapporto Dettagliato',
    'payment.report.subtitle': 'Analisi completa con insight attuabili.',
    'payment.report.feat1': 'Analisi per categoria',
    'payment.report.feat2': 'Evoluzione mensile',
    'payment.report.feat3': 'Consigli personalizzati',
    'payment.report.price': '5',
    'payment.report.btn': '🛒 Acquista',
    'payment.report.badge': 'POPOLARE',
    'payment.pro.title': 'Abbonamento Pro',
    'payment.pro.subtitle': 'Monitoraggio mensile automatico delle tue commissioni.',
    'payment.pro.feat1': 'Rapporto mensile auto',
    'payment.pro.feat2': 'Avvisi competitivi',
    'payment.pro.feat3': 'Monitoraggio in tempo reale',
    'payment.pro.price': '19',
    'payment.pro.period': '/mese',
    'payment.pro.btn': '🚀 Abbonati',
    'payment.success': '✅ Pagamento riuscito! Il tuo rapporto sarà inviato per email.',
    'payment.cancelled': '⚠️ Pagamento annullato.',

    // Comment ça marche
    'how.title': '⚙️ Come funziona?',
    'how.subtitle': 'Semplice, veloce, senza impegno',
    'how.step1.title': 'Connessione sicura',
    'how.step1.text': 'Collega il tuo eBay in un clic. Nessuna password salvata.',
    'how.step2.title': 'Analisi automatica',
    'how.step2.text': 'Il nostro algoritmo calcola esattamente quanto eBay ti ha addebitato.',
    'how.step3.title': 'Rapporto PDF',
    'how.step3.text': 'Ricevi un PDF con i tuoi potenziali risparmi per email.',

    // Exemple rapport
    'example.title': '📈 Esempio di rapporto',
    'example.subtitle': 'Risultati reali di un venditore su 3 mesi:',
    'example.sales': 'Fatturato totale',
    'example.fees': 'Commissioni eBay',
    'example.saving': 'Risparmio / anno',
    'example.note': '* Tasso di commissione medio del 12%',

    // Agence
    'agency.badge': '🏪 La nostra agenzia',
    'agency.title': 'Il tuo e-commerce, senza commissioni eBay',
    'agency.subtitle': 'Importiamo il tuo catalogo eBay in un negozio indipendente. Tieni il 100% delle tue vendite.',
    'agency.feature': '🤝 Supporto completo dalla nostra agenzia',
    'agency.feature.text': 'Importazione · Design · Sincronizzazione · SEO · Monitoraggio',
    'agency.cta': '👉 Richiedi un preventivo gratuito',

    // Confiance
    'trust.secure.title': '100% sicuro',
    'trust.secure.text': 'Connessione ufficiale eBay. Nessuna password raccolta.',
    'trust.free.title': 'Gratuito e senza impegno',
    'trust.free.text': 'Il rapporto base è gratuito. Paga solo per il dettaglio.',
    'trust.fast.title': 'Risultati immediati',
    'trust.fast.text': 'Meno di 2 minuti per la tua diagnosi completa.',
    'trust.pdf.title': 'PDF per email',
    'trust.pdf.text': 'Conserva e condividi facilmente il tuo rapporto.',

    // CTA final
    'cta.final.text': 'Pronto a scoprire quanto potresti risparmiare?',
    'cta.final.btn': 'Collega il mio account eBay',

    // Erreurs eBay
    'ebay.error.generic': '❌ Connessione eBay fallita.',
    'ebay.error.token': 'Errore token.',
    'ebay.error.csrf': 'Errore di sicurezza CSRF.',
    'ebay.error.nocode': 'Nessun codice eBay ricevuto.',

    // Footer
    'footer.rights': '© 2026 Beassist Agency · Il tuo partner e-commerce',
    'footer.legal': 'Note legali',
    'footer.privacy': 'Privacy',
    'footer.cgv': 'Termini',

    // Messages
    'msg.ebay.connected': '✅ Account eBay collegato con successo!',
    'msg.error.generic': 'Si è verificato un errore.',
    'period.months': 'Ultimi 12 mesi',

    // dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.greeting': 'Ciao, {name}',
    'dashboard.new_report': 'Nuovo rapporto',
    'dashboard.total_sales': 'Fatturato totale',
    'dashboard.total_fees': 'Commissioni totali',
    'dashboard.total_saving': 'Risparmio stimato / anno',
    'dashboard.history_title': '📄 Storico rapporti',
    'dashboard.report_count': '{count} rapporto{plural}',
    'dashboard.empty_title': 'Nessun rapporto ancora generato.',
    'dashboard.empty_cta': 'Genera il mio primo rapporto',
    'dashboard.back_home': '← Torna alla home',
    'dashboard.badge_saving': 'risparmio/anno',
    'dashboard.download_pdf': '📄 PDF',
    'dashboard.store_name_default': 'Negozio senza nome',
    'dashboard.no_store': 'Nessun negozio registrato',
    'dashboard.period': 'Periodo',
  },
};

module.exports = translations;