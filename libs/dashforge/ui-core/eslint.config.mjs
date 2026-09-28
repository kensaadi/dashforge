import baseConfig from '../../../eslint.config.mjs';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  // React Hooks plugin — `src/react/` authors six hooks that every
  // consumer package builds on, so the rule set is required both for
  // `// eslint-disable-next-line react-hooks/exhaustive-deps`
  // directives to be VALID (an unknown rule name is an eslint error,
  // not a no-op) and to catch real rules-of-hooks violations. Mirrors
  // the same block in `libs/dashforge/tw/eslint.config.mjs`.
  {
    files: ['**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
