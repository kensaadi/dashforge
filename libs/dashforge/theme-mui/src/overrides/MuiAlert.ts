import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiAlertOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  const iconColor = (c: string) => ({
    backgroundColor: dash.color.surface.overlay,
    color: dash.color.text.primary,
    '& .MuiAlert-icon': { color: c },
  });

  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.md,
          backgroundColor: dash.color.surface.overlay,
          color: dash.color.text.primary,
          backgroundImage: 'none',
        },

        standardSuccess: iconColor(dash.color.intent.success),
        standardWarning: iconColor(dash.color.intent.warning),
        standardError: iconColor(dash.color.intent.danger),
        standardInfo: iconColor(dash.color.intent.primary),
      },
    },
  };
}
