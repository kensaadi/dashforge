const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    format: ['esm'],
    sourcemap: true,
    assets: [{ input: '.', output: '.', glob: 'README.md' }],
  },
  {
    output: {
      sourcemap: true,
    },
  }
);
