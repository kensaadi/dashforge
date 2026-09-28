import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // A leading underscore is the repo's way of saying "named on purpose,
      // used on purpose nowhere": `tooltip: _tooltip` in the field
      // components strips a prop out of `...rest` so it cannot leak onto the
      // DOM (README-BUG § BUG 9), and `_props` / `_v` mark a signature that
      // has to keep its shape. Without these patterns the convention reads
      // as six warnings, which is how a genuinely dropped variable — the
      // `ref` that `<Slider>` never attached — sat unnoticed in the noise.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  // Test files — rules that are noisy on legitimate test patterns
  // (e.g., `onClick: () => {}` mocks, `expect(x!.foo).toBe(...)` after
  // a guaranteed non-null assertion) are relaxed here. Failures in
  // production code remain enforced.
  {
    files: [
      '**/*.{test,spec}.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
      '**/__tests__/**/*.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
    ],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // no-unused-vars deliberately not restated: the block above already
      // sets it to `warn` with the `^_` patterns, and repeating it here
      // without them silently dropped the convention in test files.
    },
  },
];
