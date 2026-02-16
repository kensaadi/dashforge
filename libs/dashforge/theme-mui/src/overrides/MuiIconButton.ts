import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiIconButtonOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiIconButton: {
      styleOverrides: {
        root: {
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
