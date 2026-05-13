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
    assets: [
      // Workspace-root-relative; point at the package folder so dist/
      // gets the PACKAGE README/CHANGELOG, not the workspace ones.
      { input: 'libs/dashforge/rbac', output: '.', glob: 'README.md' },
      { input: 'libs/dashforge/rbac', output: '.', glob: 'CHANGELOG.md' },
    ],
  },
  {
    output: {
      sourcemap: true,
    },
  }
);
