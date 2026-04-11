import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateRoutes } from './generate-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://dashforge-ui.com';

interface SitemapEntry {
  url: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

function getPriority(route: string): number {
  if (route === '/') return 1.0;
  if (route.startsWith('/docs/getting-started')) return 0.9;
  if (route.startsWith('/docs/components')) return 0.8;
  if (route.startsWith('/docs')) return 0.7;
  if (route.startsWith('/starter-kits/')) return 0.7;
  if (route === '/starter-kits') return 0.8;
  if (route === '/components') return 0.8;
  if (route === '/pricing') return 0.7;
  return 0.6;
}

function getChangeFreq(
  route: string
): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  if (route === '/') return 'weekly';
  if (route.startsWith('/docs')) return 'weekly';
  if (route.startsWith('/starter-kits')) return 'monthly';
  return 'monthly';
}

async function generateSitemap(): Promise<string> {
  const routes = await generateRoutes();
  const entries: SitemapEntry[] = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    priority: getPriority(route),
    changefreq: getChangeFreq(route),
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

// Generate and write sitemap
generateSitemap()
  .then((sitemap) => {
    const outputPath = resolve(__dirname, '../dist/sitemap.xml');
    writeFileSync(outputPath, sitemap, 'utf-8');

    const urlCount = sitemap.split('<url>').length - 1;

    console.log('\n========================================');
    console.log('SITEMAP GENERATION');
    console.log('========================================');
    console.log(`✅ Sitemap generated: ${outputPath}`);
    console.log(`   Total URLs: ${urlCount}`);
    console.log('========================================\n');
  })
  .catch((error) => {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  });
