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

`DashforgeThemeProvider` wraps MUI's `ThemeProvider` and (optionally) `CssBaseline` for you, and reads the active Dashforge theme from `@dashforge/theme-core`. You don't need to construct the MUI theme yourself.

```tsx
import { DashforgeThemeProvider } from '@dashforge/theme-mui';

function App() {
  return (
    <DashforgeThemeProvider>
      {/* Your MUI components */}
    </DashforgeThemeProvider>
  );
}
```

Pass a custom Dashforge theme explicitly if you want to override the one resolved by `@dashforge/theme-core`:

```tsx
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import type { DashforgeTheme } from '@dashforge/tokens';

const customTheme: DashforgeTheme = /* ... */;

<DashforgeThemeProvider theme={customTheme} withCssBaseline={false}>
  {children}
</DashforgeThemeProvider>
```

For the low-level MUI theme object (e.g. to merge with another MUI provider), use the adapter directly:

```ts
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';
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
