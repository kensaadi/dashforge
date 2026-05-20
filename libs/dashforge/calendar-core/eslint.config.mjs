import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // `tslib` is a false positive: the rule reads `importHelpers` from
          // the workspace base tsconfig, but this package overrides it to
          // `false` in tsconfig.lib.json — the built `dist/` emits no tslib
          // import. @dashforge/calendar-core has zero runtime dependencies.
          ignoredDependencies: ['tslib'],
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
            '{projectRoot}/**/*.{spec,test}.{js,ts,jsx,tsx}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/out-tsc', '**/dist'],
  },
];
