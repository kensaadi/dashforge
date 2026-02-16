import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiTooltipOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: dash.color.surface.overlay,
          color: dash.color.text.primary,
          boxShadow: dash.shadow.md,
          borderRadius: dash.radius.md,
        },
        arrow: {
          color: dash.color.surface.overlay,
        },
      },
    },
  };
}
