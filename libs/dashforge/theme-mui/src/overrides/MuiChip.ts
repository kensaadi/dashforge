import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiChipOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.pill,
          fontWeight: 500,
          '&.MuiChip-clickable:focus-visible': {
            outline: `2px solid ${dash.color.border.focus}`,
            outlineOffset: 2,
          },
        },
        filled: {
          backgroundColor: dash.color.surface.elevated,
          color: dash.color.text.primary,
        },
        outlined: {
          borderColor: dash.color.border.default,
          backgroundColor: 'transparent',
        },
        // Color variants - apply to both filled and outlined
        colorPrimary: {
          // Filled variant (default)
          '&.MuiChip-filled': {
            backgroundColor: dash.color.intent.primary,
            color: dash.color.text.inverse,
            '& .MuiChip-deleteIcon': {
              color: dash.color.text.inverse,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
          // Outlined variant
          '&.MuiChip-outlined': {
            borderColor: dash.color.intent.primary,
            color: dash.color.intent.primary,
            backgroundColor: 'transparent',
            '& .MuiChip-deleteIcon': {
              color: dash.color.intent.primary,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
        },
        colorSecondary: {
          '&.MuiChip-filled': {
            backgroundColor: dash.color.intent.secondary,
            color: dash.color.text.inverse,
            '& .MuiChip-deleteIcon': {
              color: dash.color.text.inverse,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
          '&.MuiChip-outlined': {
            borderColor: dash.color.intent.secondary,
            color: dash.color.intent.secondary,
            backgroundColor: 'transparent',
            '& .MuiChip-deleteIcon': {
              color: dash.color.intent.secondary,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
        },
        colorSuccess: {
          '&.MuiChip-filled': {
            backgroundColor: dash.color.intent.success,
            color: dash.color.text.inverse,
            '& .MuiChip-deleteIcon': {
              color: dash.color.text.inverse,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
          '&.MuiChip-outlined': {
            borderColor: dash.color.intent.success,
            color: dash.color.intent.success,
            backgroundColor: 'transparent',
            '& .MuiChip-deleteIcon': {
              color: dash.color.intent.success,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
        },
        colorWarning: {
          '&.MuiChip-filled': {
            backgroundColor: dash.color.intent.warning,
            color: dash.color.text.inverse,
            '& .MuiChip-deleteIcon': {
              color: dash.color.text.inverse,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
          '&.MuiChip-outlined': {
            borderColor: dash.color.intent.warning,
            color: dash.color.intent.warning,
            backgroundColor: 'transparent',
            '& .MuiChip-deleteIcon': {
              color: dash.color.intent.warning,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
        },
        colorError: {
          '&.MuiChip-filled': {
            backgroundColor: dash.color.intent.danger,
            color: dash.color.text.inverse,
            '& .MuiChip-deleteIcon': {
              color: dash.color.text.inverse,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
          '&.MuiChip-outlined': {
            borderColor: dash.color.intent.danger,
            color: dash.color.intent.danger,
            backgroundColor: 'transparent',
            '& .MuiChip-deleteIcon': {
              color: dash.color.intent.danger,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          },
        },
      },
    },
  };
}
