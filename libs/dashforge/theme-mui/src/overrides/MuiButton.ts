import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiButtonOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true,
      },

      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: dash.radius.md,
          fontWeight: 600,

          '&:focus-visible': {
            outline: `2px solid ${dash.color.border.focus}`,
            outlineOffset: 2,
          },

          '&.MuiButton-contained': {
            boxShadow: dash.shadow.sm,

            '&:hover': {
              boxShadow: dash.shadow.md,
            },

            '&:active': {
              boxShadow: dash.shadow.sm,
            },
          },

          '&.MuiButton-outlined': {
            borderColor: dash.color.border.default,

            '&:hover': {
              borderColor: dash.color.border.strong,
              backgroundColor: dash.color.border.subtle,
            },

            '&:active': {
              borderColor: dash.color.border.focus,
            },
          },

          '&.Mui-disabled': {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
            opacity: 1,

            '&.MuiButton-contained': {
              backgroundColor: dash.color.border.subtle,
              color: dash.color.text.muted,
              boxShadow: 'none',
            },

            '&.MuiButton-outlined': {
              borderColor: dash.color.border.subtle,
              color: dash.color.text.muted,
            },

            '&.MuiButton-text': {
              color: dash.color.text.muted,
            },
          },
        },

        sizeSmall: {
          height: dash.spacing.unit * 4,
          fontSize: dash.typography.scale.sm,
          padding: `${dash.spacing.unit}px ${dash.spacing.unit * 1.5}px`,
        },

        sizeMedium: {
          height: dash.spacing.unit * 5,
          fontSize: dash.typography.scale.md,
          padding: `${dash.spacing.unit * 1.5}px ${dash.spacing.unit * 2}px`,
        },

        sizeLarge: {
          height: dash.spacing.unit * 6,
          fontSize: dash.typography.scale.lg,
          padding: `${dash.spacing.unit * 2}px ${dash.spacing.unit * 2.5}px`,
        },
      },
    },
  };
}
