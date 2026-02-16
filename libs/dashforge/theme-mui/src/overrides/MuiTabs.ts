import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiTabsOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${dash.color.border.default}`,
        },
        indicator: {
          backgroundColor: dash.color.intent.primary,
          height: 2,
        },
      },
    },
  };
}
