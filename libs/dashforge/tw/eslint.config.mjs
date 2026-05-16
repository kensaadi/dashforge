import baseConfig from '../../../eslint.config.mjs';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  // React Hooks plugin — every component in this package authors
  // hooks, so the rule set is required for `// eslint-disable-next-line
  // react-hooks/exhaustive-deps` directives to be valid AND to catch
  // real rules-of-hooks violations (hook called after early-return).
  // Scoped here (not at workspace root) to avoid surfacing pre-existing
  // unrelated bugs in sibling packages that fall outside this sprint's
  // scope — those should be cleaned up in a dedicated workspace pass.
  {
    files: ['**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/rollup.config.{js,ts,mjs,mts,cjs,cts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          ],
          // tw-tokens (CSS vars + Tailwind preset) and tw-theme
          // (Provider that injects the runtime vars) are CONSUMER-FACING
          // peer dependencies: the runtime requires them, but @dashforge/tw
          // itself never imports them. Declaring them as peers documents
          // the requirement without triggering the "not used" check.
          ignoredDependencies: ['@dashforge/tw-tokens', '@dashforge/tw-theme'],
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
