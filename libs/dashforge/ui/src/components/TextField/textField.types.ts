import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

/**
 * TextField props - extends MUI TextField but:
 * - Makes `name` required
 * - Removes deprecated MUI props (use slotProps instead)
 * - Adds Dashforge-specific props (rules, visibleWhen, layout, access)
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
   *
   * Note: This is separate from RBAC access control.
   * Both visibleWhen and RBAC visibility must be true for field to render.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * Field layout mode
   * - 'floating': standard MUI floating label behavior (default)
   * - 'stacked': external label above control
   * - 'inline': external label to the left of control
   */
  layout?: FieldLayout;

  /**
   * RBAC access requirement for this field.
   *
   * When provided, the field's visibility, disabled state, and readonly state
   * are controlled by RBAC permissions.
   *
   * Access state is resolved using the RBAC system and combined with
   * explicit props using OR logic for disabled and readonly states.
   *
   * @example
   * ```tsx
   * <TextField
   *   name="salary"
   *   label="Salary"
   *   access={{
   *     resource: 'employee',
   *     action: 'update',
   *     onUnauthorized: 'readonly'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;

  /**
   * Internal prop: Available option values for Select mode (Step 05b).
   * Used to sanitize display value and prevent MUI out-of-range warnings.
   * Only used internally by Select component.
   * @internal
   */
  __selectAvailableValues?: (string | number)[];
}
