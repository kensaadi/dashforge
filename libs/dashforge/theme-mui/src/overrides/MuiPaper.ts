import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiPaperOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: any }) => ({
          // CRITICAL: MUI v7 applies translucent overlay gradients via backgroundImage
          // Must use function form with !important to override MUI's elevation-based overlays
          backgroundImage: 'none !important',
        }),
      },
      variants: [
        { props: { elevation: 0 }, style: { boxShadow: 'none' } },
        { props: { elevation: 1 }, style: { boxShadow: dash.shadow.sm } },
        { props: { elevation: 2 }, style: { boxShadow: dash.shadow.md } },
        { props: { elevation: 3 }, style: { boxShadow: dash.shadow.lg } },
        // clamp: tutto sopra 3 resta lg (coerenza)
        { props: { elevation: 4 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 5 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 6 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 7 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 8 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 9 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 10 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 11 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 12 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 13 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 14 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 15 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 16 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 17 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 18 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 19 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 20 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 21 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 22 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 23 }, style: { boxShadow: dash.shadow.lg } },
        { props: { elevation: 24 }, style: { boxShadow: dash.shadow.lg } },
      ],
    },
  };
}
