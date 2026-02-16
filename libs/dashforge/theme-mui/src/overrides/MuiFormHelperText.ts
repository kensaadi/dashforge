import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiFormHelperTextOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
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
            color: dash.color.text.muted,
          },
        },
      },
    },
  };
}
