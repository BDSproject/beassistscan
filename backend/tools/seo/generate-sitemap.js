const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://beassistscan.com';
const PUBLIC_DIR = path.join(__dirname, '../../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

const EXCLUDED = new Set([
  '404.html',
  'dashboard.html',
  'login.html',
  'google7d682d7bb0a1cc04.html',
]);

const CHANGEFREQ = {
  '/': 'weekly',
  '/blog/fr/': 'weekly',
  '/blog/en/': 'weekly',
  '/blog/es/': 'weekly',
  '/blog/de/': 'weekly',
  '/blog/it/': 'weekly',
};

const PRIORITY = {
  '/': '1.0',
  '/blog/fr/': '0.9',
  '/blog/en/': '0.8',
  '/blog/es/': '0.7',
  '/blog/de/': '0.7',
  '/blog/it/': '0.7',
};

function toRoute(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');

  if (EXCLUDED.has(relativePath)) return null;

  if (relativePath === 'index.html') return '/';

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.replace('/index.html', '')}/`;
  }

  return `/${relativePath}`;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    files.push(fullPath);
  }

  return files;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function main() {
  const htmlFiles = walk(PUBLIC_DIR);

  const urls = htmlFiles
    .map((filePath) => {
      const route = toRoute(filePath);
      if (!route) return null;

      const stat = fs.statSync(filePath);
      return {
        route,
        loc: `${SITE_URL}${route}`,
        lastmod: formatDate(stat.mtime),
        changefreq: CHANGEFREQ[route] || 'monthly',
        priority: PRIORITY[route] || '0.6',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.route.localeCompare(b.route));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  console.log(`✅ Sitemap generated: ${OUTPUT_FILE} (${urls.length} URLs)`);
}

main();
