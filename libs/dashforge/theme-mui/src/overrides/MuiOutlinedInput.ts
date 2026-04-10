import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiOutlinedInputOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.md,

          // default border - use theme border token
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: dash.color.border.default,
          },

          // hover - use strong border token
          '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
            borderColor: dash.color.border.strong,
          },

          // focus (border + ring)
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: dash.color.border.focus,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 0px ${dash.color.border.focus}33`,
          },

          // error (MUI uses "error", our token name is "danger")
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: dash.color.intent.danger,
          },
          '&.Mui-error.Mui-focused': {
            boxShadow: `0 0 0 0px ${dash.color.intent.danger}33`,
          },

          // disabled - use subtle border and muted text
          '&.Mui-disabled': {
            backgroundColor: dash.color.surface.elevated,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: dash.color.border.subtle,
          },

          // Fix vertical centering for small size inputs
          // Use MUI's default 8.5px padding which is calibrated for proper visual balance
          // with the label at 9px transform
          '&.MuiInputBase-sizeSmall input': {
            padding: '8.5px 14px',
          },
        },

        input: {
          color: dash.color.text.primary,
          '&::placeholder': {
            color: dash.color.text.muted,
            opacity: 1,
          },
          // disabled text - use muted text token
          '&:disabled': {
            color: dash.color.text.muted,
            WebkitTextFillColor: dash.color.text.muted, // Safari fix
          },
        },
      },
    },
    // Special styling for Select inputs when open
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  };
}
