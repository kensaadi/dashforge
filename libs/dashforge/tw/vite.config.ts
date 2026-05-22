/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
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
    // Perf specs assert wall-clock budgets calibrated for a dev machine.
    // Shared CI runners are slower, so they false-fail there — skip them
    // when `CI` is set. They still run locally (`nx test @dashforge/tw`).
    exclude: [
      ...configDefaults.exclude,
      ...(process.env.CI ? ['**/*.perf.test.*'] : []),
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
