import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiAppBarOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
        enableColorOnDark: true,
      },
      styleOverrides: {
        root: {
          backgroundColor: dash.color.surface.elevated,
          backgroundImage: 'none',
          boxShadow: dash.shadow.sm,

          // force foreground for nested content
          color: dash.color.text.primary,

          // IMPORTANT: set the CSS vars used by MUI AppBar pipeline
          '--AppBar-background': dash.color.surface.elevated,
          '--AppBar-color': dash.color.text.primary,

          // Scoped inheritance: AppBar buttons/text should match AppBar color scheme
          // This applies to direct AppBar controls (IconButton, Typography in Toolbar)
          // Nested complex components (Cards, Dialogs) will override via their own root styles
          '& .MuiTypography-root': { color: 'inherit' },
          '& .MuiButton-root': { color: 'inherit' },
        } as any,
      },
    },
  };
}
