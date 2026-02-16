import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiFormControlOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiFormControl: {
      defaultProps: {
        // evita margin "dense/normal" random, restiamo controllati
        margin: 'none',
      },
      styleOverrides: {
        root: {
          // MUI spesso mette margini impliciti in combinazioni varie:
          // li standardizziamo lato helper/label, non qui.
          // Qui lasciamo solo un hook coerente se serve in futuro.
          '--dashforge-spacing-unit': `${dash.spacing.unit}px`,
        } as any,
      },
    },
  };
}
