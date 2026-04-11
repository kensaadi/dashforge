# @dashforge/theme-mui

Material-UI theme integration for Dashforge.

## Installation

```bash
npm install @dashforge/theme-mui @dashforge/theme-core @dashforge/tokens
npm install @mui/material @emotion/react @emotion/styled
```

## Peer Dependencies

- `@mui/material@^7.0.0`
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

## License

MIT
