const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@dashforge/ui-core',
      '@mui/material',
      '@mui/material/TextField',
      '@emotion/react',
      '@emotion/styled',
    ],
    format: ['esm'],
    sourcemap: true,
    assets: [
      // Workspace-root-relative; point at the package folder so dist/
      // gets the PACKAGE README/CHANGELOG, not the workspace ones.
      { input: 'libs/dashforge/ui', output: '.', glob: 'README.md' },
      { input: 'libs/dashforge/ui', output: '.', glob: 'CHANGELOG.md' },
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
