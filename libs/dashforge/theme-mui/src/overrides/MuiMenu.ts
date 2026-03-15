import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiMenuOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  const isDark = dash.meta.mode === 'dark';

  return {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: dash.color.surface.overlay,
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)'
            : '0 4px 16px rgba(15, 23, 42, 0.12), 0 1px 4px rgba(15, 23, 42, 0.08)',
          borderRadius: dash.radius.md,
          marginTop: '4px', // Small gap between trigger and menu
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(15, 23, 42, 0.08)',
        },
        list: {
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.sm,
          fontSize: '14px',
          padding: '8px 12px',
          minHeight: '36px',
          transition: 'background-color 0.15s ease',

          // Hover state - subtle
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(15, 23, 42, 0.04)',
          },

          // Selected state - elegant purple accent
          '&.Mui-selected': {
            backgroundColor: isDark
              ? 'rgba(139, 92, 246, 0.12)'
              : 'rgba(139, 92, 246, 0.08)',
            color: isDark
              ? 'rgba(139, 92, 246, 0.95)'
              : 'rgba(109, 40, 217, 0.95)',
            fontWeight: 500,

            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(139, 92, 246, 0.16)'
                : 'rgba(139, 92, 246, 0.12)',
            },
          },

          // Focus visible - keyboard navigation
          '&:focus-visible': {
            outline: `2px solid ${dash.color.border.focus}`,
            outlineOffset: -2,
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(15, 23, 42, 0.02)',
          },
        },
      },
    },
  };
}
