import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiCardOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiCard: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          borderRadius: dash.radius.lg,
          boxShadow: dash.shadow.sm,
          backgroundImage: 'none',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: dash.spacing.unit * 2,
          '&:last-child': {
            paddingBottom: dash.spacing.unit * 2,
          },
        },
      },
    },
  };
}
