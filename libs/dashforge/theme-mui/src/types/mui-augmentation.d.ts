import type { DashforgeTheme } from '@dashforge/tokens';

declare module '@mui/material/styles' {
  interface Theme {
    dashforge: DashforgeTheme;
  }

  interface ThemeOptions {
    dashforge?: DashforgeTheme;
  }
}
