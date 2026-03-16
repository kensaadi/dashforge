import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiFormHelperTextOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  // Disabled helper text should match disabled text affordance
  const helperTextDisabled =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.38)' // MUI disabled text: clear non-interactive affordance
      : 'rgba(255, 255, 255, 0.38)';

  return {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginRight: 0,
          marginTop: dash.spacing.unit,
          color: dash.color.text.muted,

          '&.Mui-error': {
            color: dash.color.intent.danger,
          },

          '&.Mui-disabled': {
            color: helperTextDisabled,
          },
        },
      },
    },
  };
}
