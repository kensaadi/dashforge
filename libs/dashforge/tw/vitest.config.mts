import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/dashforge/tw',
  plugins: [react()],
  test: {
    name: '@dashforge/tw',
    watch: false,
    globals: true,
    // Default 'node'. Specs that mount React opt in via the
    // `// @vitest-environment jsdom` magic comment at file top.
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
