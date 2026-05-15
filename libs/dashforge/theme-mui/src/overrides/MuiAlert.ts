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
          // Remove hover background effect from close button (IconButton inside Alert)
          '& .MuiIconButton-root': {
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
      // MUI v9 removed the compound `standard{Severity}` / `filled{Severity}`
      // override slots from `styleOverrides`. Per-severity styling now goes
      // through the `variants` array (MUI v6+ pattern), matched on the
      // `severity` + `variant` props.
      variants: [
        {
          props: { severity: 'success' as const, variant: 'standard' as const },
          style: standardStyle(dash.color.intent.success),
        },
        {
          props: { severity: 'warning' as const, variant: 'standard' as const },
          style: standardStyle(dash.color.intent.warning),
        },
        {
          props: { severity: 'error' as const, variant: 'standard' as const },
          style: standardStyle(dash.color.intent.danger),
        },
        {
          props: { severity: 'info' as const, variant: 'standard' as const },
          style: standardStyle(infoColor),
        },
        {
          props: { severity: 'success' as const, variant: 'filled' as const },
          style: filledStyle(dash.color.intent.success),
        },
        {
          props: { severity: 'warning' as const, variant: 'filled' as const },
          style: filledStyle(dash.color.intent.warning),
        },
        {
          props: { severity: 'error' as const, variant: 'filled' as const },
          style: filledStyle(dash.color.intent.danger),
        },
        {
          props: { severity: 'info' as const, variant: 'filled' as const },
          style: filledStyle(infoColor),
        },
      ],
    },
  };
}
