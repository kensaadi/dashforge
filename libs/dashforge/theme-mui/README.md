# @dashforge/theme-mui

Material-UI theme integration for Dashforge.

## Installation

```bash
npm install @dashforge/theme-mui @dashforge/theme-core @dashforge/tokens
npm install @mui/material @emotion/react @emotion/styled
```

## Peer Dependencies

- `@mui/material@^9.0.0` (since `0.1.7-alpha`)
- `@emotion/react@^11.0.0`
- `@emotion/styled@^11.0.0`

## Usage

```typescript
import { createDashforgeMuiTheme } from '@dashforge/theme-mui';
import { ThemeProvider } from '@mui/material/styles';

const theme = createDashforgeMuiTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>{/* Your MUI components */}</ThemeProvider>
  );
}
```

## Features

- Pre-configured MUI theme based on Dashforge tokens
- Consistent design system integration
- Customizable and extensible
- Full TypeScript support

## Documentation

- [Package CHANGELOG](./CHANGELOG.md) — release history for this package.
- [Top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md) — cross-package release context.
- [MIGRATION.md](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) — breaking-change upgrade guides.

## License

MIT
