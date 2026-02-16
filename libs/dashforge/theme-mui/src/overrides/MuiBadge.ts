import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiBadgeOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: dash.typography.scale.xs,
        },
        colorPrimary: {
          backgroundColor: dash.color.intent.primary,
          color: dash.color.text.inverse,
        },
        colorSecondary: {
          backgroundColor: dash.color.intent.secondary,
          color: dash.color.text.inverse,
        },
        colorSuccess: {
          backgroundColor: dash.color.intent.success,
          color: dash.color.text.inverse,
        },
        colorWarning: {
          backgroundColor: dash.color.intent.warning,
          color: dash.color.text.inverse,
        },
        colorError: {
          backgroundColor: dash.color.intent.danger,
          color: dash.color.text.inverse,
        },
      },
    },
  };
}
