import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiMenuOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: dash.color.surface.overlay,
          backgroundImage: 'none',
          boxShadow: dash.shadow.lg,
          borderRadius: dash.radius.lg,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          // optional: feel more "app" than material
          borderRadius: dash.radius.md,
          '&:hover': {
            backgroundColor: dash.color.border.subtle,
          },
          '&:focus-visible': {
            outline: `2px solid ${dash.color.border.focus}`,
            outlineOffset: 2,
          },
        },
      },
    },
  };
}
