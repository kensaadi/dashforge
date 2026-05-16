const { withNx } = require('@nx/rollup/with-nx');
const { flattenDts } = require('./scripts/flat-dts.cjs');

/** See `libs/dashforge/forms/rollup.config.cjs` for the rationale. */
const flatDtsPlugin = () => ({
  name: 'flat-dts',
  writeBundle() {
    flattenDts(__dirname);
  },
});

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
      // Paths are workspace-root-relative; point at the package folder
      // so dist/ gets the PACKAGE README/CHANGELOG, not the workspace ones.
      { input: 'libs/dashforge/ui-core', output: '.', glob: 'README.md' },
      { input: 'libs/dashforge/ui-core', output: '.', glob: 'CHANGELOG.md' },
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
    plugins: [flatDtsPlugin()],
  }
);
