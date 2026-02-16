import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiBackdropOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: dash.color.backdrop.dim,

          // CRITICAL: keep Popover/Menu truly non-dimming
          '&.MuiBackdrop-invisible': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  };
}
