/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/dashforge/tw',
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: '@dashforge/tw',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // No `exclude` here: Vitest 4 ignores `test.exclude`, so the
    // `process.env.CI` exclusion this config used to carry for the
    // `*.perf.test.tsx` specs never took effect. Their wall-clock budgets
    // are tolerance-scaled instead, in src/test-utils/perfBudget.ts.
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
