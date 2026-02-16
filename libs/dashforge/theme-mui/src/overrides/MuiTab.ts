import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiTabOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: dash.color.text.secondary,
          '&.Mui-selected': {
            color: dash.color.intent.primary,
          },
          '&:hover': {
            color: dash.color.text.primary,
          },
          '&:focus-visible': {
            outline: `2px solid ${dash.color.border.focus}`,
            outlineOffset: 2,
          },
        },
      },
    },
  };
}
