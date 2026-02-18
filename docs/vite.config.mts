/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

import { fileURLToPath, URL } from 'node:url';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../node_modules/.vite/docs',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    dedupe: ['react', 'react-dom', '@dashforge/ui-core'],
    alias: {
      // '@dashforge/ui-core': path.resolve(
      //   import.meta.dirname,
      //   '../libs/dashforge/ui-core/src/index.ts'
      // ),
      '@dashforge/ui': path.resolve(
        import.meta.dirname,
        '../libs/dashforge/ui/src/index.ts'
      ),
      '@dashforge/ui-core': fileURLToPath(
        new URL('../libs/dashforge/ui-core/src/index.ts', import.meta.url)
      ),
      '@dashforge/forms': path.resolve(
        import.meta.dirname,
        '../libs/dashforge/forms/src/index.ts'
      ),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@org/docs',
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
