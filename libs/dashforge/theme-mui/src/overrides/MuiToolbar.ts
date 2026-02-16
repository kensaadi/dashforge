import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiToolbarOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiToolbar: {
      styleOverrides: {
        root: {
          color: 'inherit',
        },
      },
    },
  };
}
