import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiAvatarOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: dash.color.surface.elevated,
          color: dash.color.text.primary,
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: dash.color.surface.elevated,
          color: dash.color.text.primary,
        },
      },
    },
  };
}
