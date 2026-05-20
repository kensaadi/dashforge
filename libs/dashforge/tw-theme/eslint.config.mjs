import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // Non-shipped files — see @dashforge/tw eslint config for the
          // rationale. Spec/test files import the test runner; config
          // files import build tooling — devDependencies, not deps.
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/rollup.config.{js,ts,mjs,mts,cjs,cts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
            '{projectRoot}/**/*.spec.{ts,tsx}',
            '{projectRoot}/**/*.test.{ts,tsx}',
          ],
          // `tailwindcss` is a build-time peer: the consumer's Tailwind
          // reads the `darkMode: 'selector'` config produced by
          // `dashforgePreset()`. It is never an `import` site here.
          ignoredDependencies: ['tailwindcss'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
