import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiAlertOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  // Fallback: info → primary if info is not defined (backward compatibility)
  const infoColor = dash.color.intent.info ?? dash.color.intent.primary;

  // Helper for standard variant (neutral background, only icon colored)
  const standardStyle = (iconColor: string) => ({
    backgroundColor: dash.color.surface.overlay,
    color: dash.color.text.primary,
    '& .MuiAlert-icon': { color: iconColor },
  });

  // Helper for filled variant (colored background, inverse text)
  const filledStyle = (bgColor: string) => ({
    backgroundColor: bgColor,
    color: dash.color.text.inverse,
    '& .MuiAlert-icon': { color: dash.color.text.inverse },
  });

  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.md,
          backgroundImage: 'none',
        },

        standardSuccess: standardStyle(dash.color.intent.success),
        standardWarning: standardStyle(dash.color.intent.warning),
        standardError: standardStyle(dash.color.intent.danger),
        standardInfo: standardStyle(infoColor),

        filledSuccess: filledStyle(dash.color.intent.success),
        filledWarning: filledStyle(dash.color.intent.warning),
        filledError: filledStyle(dash.color.intent.danger),
        filledInfo: filledStyle(infoColor),
      },
    },
  };
}
