import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiDividerOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: dash.color.border.subtle,
        },
      },
    },
  };
}
