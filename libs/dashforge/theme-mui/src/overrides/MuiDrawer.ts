import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiDrawerOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: dash.color.surface.overlay,
          backgroundImage: 'none',
          boxShadow: dash.shadow.lg,
          // NO borderRadius - flush edge design
        },
      },
    },
  };
}
