import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiInputLabelOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  // Disabled label should match disabled text affordance
  const labelDisabled =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.38)' // MUI disabled text: clear non-interactive affordance
      : 'rgba(255, 255, 255, 0.38)';

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
            color: labelDisabled,
          },

          // Fix vertical centering for outlined small labels
          // Use MUI's default 9px transform which is calibrated for proper visual balance
          // with font metrics and baseline
          '&.MuiInputLabel-outlined.MuiInputLabel-sizeSmall:not(.MuiInputLabel-shrink)':
            {
              transform: 'translate(14px, 9px) scale(1)',
            },
        },
      },
    },
  };
}
