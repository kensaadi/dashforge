import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiInputLabelOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: dash.color.text.secondary,

          '&.Mui-focused': {
            color: dash.color.intent.primary,
          },

          '&.Mui-error': {
            color: dash.color.intent.danger,
          },

          '&.Mui-disabled': {
            color: dash.color.text.muted,
          },
        },
      },
    },
  };
}
