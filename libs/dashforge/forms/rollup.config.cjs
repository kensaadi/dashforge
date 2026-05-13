const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ['react', 'react-dom', 'react/jsx-runtime', '@dashforge/ui-core'],
    format: ['esm'],
    sourcemap: true,
    assets: [
      // Paths are resolved relative to the workspace root by @nx/rollup,
      // not to this config file. Pointing at the package's own folder
      // ensures we copy the PACKAGE README/CHANGELOG into dist/, not the
      // workspace root ones.
      { input: 'libs/dashforge/forms', output: '.', glob: 'README.md' },
      { input: 'libs/dashforge/forms', output: '.', glob: 'CHANGELOG.md' },
    ],
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    plugins: [
      svg({
        svgo: false,
        titleProp: true,
        ref: true,
      }),
      url({
        limit: 10000, // 10kB
      }),
    ],
  }
);
