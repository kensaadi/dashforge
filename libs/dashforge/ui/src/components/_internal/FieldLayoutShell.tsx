import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { ReactNode } from 'react';
import type { DashforgeTheme } from '@dashforge/tokens';

export type FieldLayout = 'floating' | 'stacked' | 'inline';
export type CustomFieldLayout = 'stacked' | 'inline';

export interface FieldLayoutShellProps {
  /**
   * Layout mode: stacked (label above) or inline (label left)
   * Note: 'floating' is not handled by this shell - it uses standard MUI behavior
   */
  layout: CustomFieldLayout;

  /**
   * Field label text
   */
  label?: ReactNode;

  /**
   * Whether field is required (adds asterisk to label)
   */
  required?: boolean;

  /**
   * Helper text or error message to display below control
   */
  helperText?: ReactNode;

  /**
   * Whether field is in error state (affects helper text color)
   */
  error?: boolean;

  /**
   * Whether field is disabled (affects label color)
   */
  disabled?: boolean;

  /**
   * ID for label htmlFor association
   */
  htmlFor?: string;

  /**
   * The actual form control (input, select, etc.)
   */
  children: ReactNode;

  /**
   * Whether field should take full width
   */
  fullWidth?: boolean;

  /**
   * Theme object for layout configuration and colors
   */
  theme: DashforgeTheme;
}

/**
 * Internal layout shell for form fields.
 *
 * Handles two layout modes:
 * - stacked: label above control, helper text below
 * - inline: label left, control right, helper text below control area
 *
 * This component is NOT exported publicly.
 * It is used internally by TextField, Select, Autocomplete, etc.
 *
 * Layout configuration is theme-aware via DashforgeTheme.fieldLayout
 */
export function FieldLayoutShell(props: FieldLayoutShellProps) {
  const {
    layout,
    label,
    required,
    helperText,
    error,
    disabled,
    htmlFor,
    children,
    fullWidth,
    theme,
  } = props;

  // Stacked layout: label above, control below, helper below control
  if (layout === 'stacked') {
    const stackedConfig = theme.fieldLayout.stacked;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        {label && (
          <FormLabel
            htmlFor={htmlFor}
            required={required}
            error={error}
            disabled={disabled}
            sx={{
              marginBottom: `${stackedConfig.labelGap}px`,
              color: disabled
                ? theme.color.text.muted
                : theme.color.text.primary,
              fontSize: theme.typography.scale.sm,
              fontWeight: 500,
              '&.Mui-error': {
                color: theme.color.intent.danger,
              },
            }}
          >
            {label}
          </FormLabel>
        )}

        <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>{children}</Box>

        {helperText && (
          <FormHelperText
            error={error}
            sx={{
              marginTop: `${stackedConfig.helperGap}px`,
              marginLeft: 0,
              color: error
                ? theme.color.intent.danger
                : theme.color.text.secondary,
              fontSize: theme.typography.scale.xs,
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }

  // Inline layout: label left, control right, helper below control area
  const inlineConfig = theme.fieldLayout.inline;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {label && (
        <FormLabel
          htmlFor={htmlFor}
          required={required}
          error={error}
          disabled={disabled}
          sx={{
            width: `${inlineConfig.labelWidth}px`,
            flexShrink: 0,
            marginRight: `${inlineConfig.controlGap}px`,
            paddingTop: '8px',
            color: disabled ? theme.color.text.muted : theme.color.text.primary,
            fontSize: theme.typography.scale.sm,
            fontWeight: 500,
            '&.Mui-error': {
              color: theme.color.intent.danger,
            },
          }}
        >
          {label}
        </FormLabel>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Box>{children}</Box>

        {helperText && (
          <FormHelperText
            error={error}
            sx={{
              marginTop: `${inlineConfig.helperGap}px`,
              marginLeft: 0,
              color: error
                ? theme.color.intent.danger
                : theme.color.text.secondary,
              fontSize: theme.typography.scale.xs,
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </Box>
  );
}
