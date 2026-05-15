/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/dashforge/tw-theme',
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: '@dashforge/tw-theme',
    watch: false,
    globals: true,
    // Default 'node' — individual specs that mount React components
    // opt in via the `// @vitest-environment jsdom` magic comment at
    // file top (DashforgeTailwindProvider.spec, useDashTWTheme.spec,
    // store/actions specs that touch localStorage).
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
