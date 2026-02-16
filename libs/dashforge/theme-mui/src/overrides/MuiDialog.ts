import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiDialogOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiDialog: {
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
