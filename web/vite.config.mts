/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = 'https://dashforge-ui.com';

function getPriority(route: string): number {
  if (route === '/') return 1.0;
  if (route.startsWith('/docs/getting-started')) return 0.9;
  if (route.startsWith('/docs/components')) return 0.8;
  if (route.startsWith('/docs')) return 0.7;
  if (route === '/starter-kits') return 0.8;
  if (route.startsWith('/starter-kits/')) return 0.7;
  if (route === '/components') return 0.8;
  if (route === '/pricing') return 0.7;
  return 0.6;
}

function getChangeFreq(route: string): 'daily' | 'weekly' | 'monthly' {
  if (route === '/') return 'weekly';
  if (route.startsWith('/docs')) return 'weekly';
  return 'monthly';
}

function buildSitemap(routes: string[]): string {
  const entries = routes
    .filter((r) => r !== '*' && !r.includes(':'))
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${getChangeFreq(route)}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../node_modules/.vite/web',
  server: {
    port: 4300,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/system',
      '@mui/styled-engine',
      '@emotion/react',
      '@emotion/styled',
      '@dashforge/tokens',
      '@dashforge/theme-core',
      '@dashforge/theme-mui',
      '@dashforge/ui-core',
    ],
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  ssgOptions: {
    dirStyle: 'nested',
    onFinished(dir) {
      // collect all rendered routes from the flat file listing
      const rendered: string[] = ['/'];
      function walk(base: string, prefix = '') {
        for (const entry of readdirSync(base)) {
          const full = join(base, entry);
          if (statSync(full).isDirectory()) {
            walk(full, `${prefix}/${entry}`);
          } else if (entry === 'index.html' && prefix) {
            rendered.push(prefix);
          }
        }
      }
      walk(dir);
      const sitemap = buildSitemap(rendered);
      writeFileSync(join(dir, 'sitemap.xml'), sitemap, 'utf-8');
      console.log(`\n✅ sitemap.xml generata: ${rendered.length} URL`);
    },
  },
  test: {
    name: 'dashforge-web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
