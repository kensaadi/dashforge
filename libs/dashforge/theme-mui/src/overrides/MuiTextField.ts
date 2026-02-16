import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiTextFieldOverrides(
  _dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  };
}
