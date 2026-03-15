import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { Engine } from '@dashforge/ui-core';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

/**
 * TextField props - extends MUI TextField but:
 * - Makes `name` required
 * - Removes deprecated MUI props (use slotProps instead)
 * - Adds Dashforge-specific props (rules, visibleWhen, layout)
 */
export interface TextFieldProps
  extends Omit<
    MuiTextFieldProps,
    | 'name'
    | 'SelectProps'
    | 'InputProps'
    | 'InputLabelProps'
    | 'FormHelperTextProps'
    | 'inputProps'
  > {
  /**
   * Field name (required)
   */
  name: string;

  /**
   * Validation rules (optional)
   * Format depends on the form integration (e.g., react-hook-form rules)
   */
  rules?: unknown;

  /**
   * Conditional visibility based on engine state
   * If provided, field only renders when function returns true
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * Field layout mode
   * - 'floating': standard MUI floating label behavior (default)
   * - 'stacked': external label above control
   * - 'inline': external label to the left of control
   */
  layout?: FieldLayout;
}
