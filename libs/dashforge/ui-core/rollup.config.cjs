const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'valtio'],
    format: ['esm'],
    sourcemap: true,
    assets: [
      { input: '.', output: '.', glob: 'README.md' },
      {
        input: 'libs/dashforge/ui-core/src/animations',
        output: 'animations',
        glob: '*.css',
      },
    ],
  },
  {
    output: {
      sourcemap: true,
    },
  }
);
