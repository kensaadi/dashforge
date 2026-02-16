import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiSnackbarOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: dash.color.surface.overlay,
          color: dash.color.text.primary,
          backgroundImage: 'none',
          boxShadow: dash.shadow.md,
          borderRadius: dash.radius.md,
        },
      },
    },
  };
}
