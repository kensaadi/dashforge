import baseConfig from '../../../eslint.config.mjs';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  // React Hooks plugin. Added in the 2.0.0 sweep: this package authors
  // hooks that consumers build on, and the rule set was registered in only
  // three packages of the catalog. On its first run against `ui-core` it
  // found two real rules-of-hooks violations (README-BUG § BUG 33, § BUG
  // 34), one of them on the render path of every field in the library.
  {
    files: ['**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
