import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiOutlinedInputOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  // Derive lighter input border colors from text colors with alpha
  // This matches MUI's approach: rgba(0,0,0,0.23) in light mode
  // Uses text.muted as base for semantic consistency
  const inputBorderDefault =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.23)' // MUI default: subtle, neutral gray
      : 'rgba(255, 255, 255, 0.23)';

  const inputBorderHover =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.87)' // MUI hover: darker but not harsh
      : 'rgba(255, 255, 255, 0.87)';

  const inputBorderDisabled =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.12)' // Softer than default, still visible
      : 'rgba(255, 255, 255, 0.12)';

  const inputTextDisabled =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.38)' // MUI disabled text: clear non-interactive affordance
      : 'rgba(255, 255, 255, 0.38)';

  const inputBackgroundDisabled =
    dash.meta.mode === 'light'
      ? 'rgba(0, 0, 0, 0.02)' // Subtle fill to reinforce disabled state
      : 'rgba(255, 255, 255, 0.02)';

  return {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.md,

          // default - lighter, more neutral border
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: inputBorderDefault,
          },

          // hover - subtle emphasis increase
          '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
            borderColor: inputBorderHover,
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

          // disabled - clear affordance with softer border + subtle background
          '&.Mui-disabled': {
            backgroundColor: inputBackgroundDisabled,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: inputBorderDisabled,
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
          // disabled text - lower contrast for clear non-interactive state
          '&:disabled': {
            color: inputTextDisabled,
            WebkitTextFillColor: inputTextDisabled, // Safari fix
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
