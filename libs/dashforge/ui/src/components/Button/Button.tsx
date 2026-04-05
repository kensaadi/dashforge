import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import type { AccessRequirement } from '@dashforge/rbac';
import { useAccessState } from '../../hooks/useAccessState';

export interface ButtonProps extends Omit<MuiButtonProps, 'disabled'> {
  /**
   * RBAC access control requirement.
   *
   * Controls button visibility and interaction based on user permissions:
   * - `onUnauthorized: 'hide'` → button does not render
   * - `onUnauthorized: 'disable'` → button renders disabled
   * - `onUnauthorized: 'readonly'` → button renders disabled (buttons do not support true readonly semantics; disabled is used as fallback)
   *
   * Combines with explicit `disabled` prop via OR logic.
   *
   * @example
   * ```tsx
   * <Button
   *   access={{
   *     resource: 'article',
   *     action: 'publish',
   *     onUnauthorized: 'disable'
   *   }}
   * >
   *   Publish Article
   * </Button>
   * ```
   */
  access?: AccessRequirement;

  /**
   * Whether the button is disabled.
   * Combines with RBAC access state via OR logic.
   */
  disabled?: boolean;
}

/**
 * Dashforge Button component with RBAC support.
 *
 * This is an action component (not a form field) that integrates with
 * the Dashforge RBAC system to provide declarative access control for
 * user actions.
 *
 * Key behaviors:
 * - Wraps MUI Button with full prop forwarding
 * - Supports RBAC via `access` prop
 * - `hide` → button does not render
 * - `disable` → button is disabled
 * - `readonly` → falls back to disabled (buttons have no readonly semantics)
 *
 * Use cases:
 * - Primary actions (Save, Submit, Create)
 * - Destructive actions (Delete, Archive)
 * - Publishing workflows (Publish, Approve)
 * - Contextual actions (Edit, Duplicate)
 * - Toolbar actions
 *
 * This component does NOT depend on:
 * - DashFormContext (buttons are not form fields)
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on @dashforge/rbac for access control.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button onClick={handleClick}>Click Me</Button>
 *
 * // With RBAC
 * <Button
 *   variant="contained"
 *   access={{
 *     resource: 'user',
 *     action: 'delete',
 *     onUnauthorized: 'hide'
 *   }}
 *   onClick={handleDelete}
 * >
 *   Delete User
 * </Button>
 * ```
 */
export function Button(props: ButtonProps) {
  const { access, disabled, ...rest } = props;

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

  // Early return for RBAC visibility
  if (!accessState.visible) {
    return null;
  }

  // Compute effective disabled state (OR logic: any source can disable)
  // Note: Buttons don't support true readonly semantics, so readonly falls back to disabled
  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly;

  return <MuiButton disabled={effectiveDisabled} {...rest} />;
}
