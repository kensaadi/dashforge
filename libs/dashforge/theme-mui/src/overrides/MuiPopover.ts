import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiPopoverOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: dash.color.surface.overlay,
          backgroundImage: 'none',
          boxShadow: dash.shadow.lg,
          borderRadius: dash.radius.lg,
        },
      },
    },
  };
}
