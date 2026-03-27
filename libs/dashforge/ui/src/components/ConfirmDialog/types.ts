import type { ReactNode } from 'react';

/**
 * Options for configuring a confirmation dialog.
 */
export interface ConfirmOptions {
  /**
   * Dialog title (required - no default).
   * Must be already translated by the consumer.
   */
  title: string;

  /**
   * Description content (optional).
   *
   * Rendering behavior:
   * - If string → wrapped in DialogContentText (MUI typography theming)
   * - If ReactNode → rendered directly inside DialogContent (no wrapper)
   *
   * Use string for simple text descriptions.
   * Use ReactNode for formatted content (bold, links, lists, etc.)
   *
   * @example
   * // String (recommended for simple text)
   * description: 'This action cannot be undone.'
   * // Renders: <DialogContentText>This action cannot be undone.</DialogContentText>
   *
   * @example
   * // ReactNode (for formatting)
   * description: (
   *   <>
   *     This will delete <strong>all data</strong>.
   *     <br />
   *     Are you sure?
   *   </>
   * )
   * // Renders directly inside DialogContent (no DialogContentText wrapper)
   */
  description?: ReactNode;

  /**
   * Confirm button text (default: 'Confirm').
   * Must be already translated by the consumer.
   */
  confirmText?: string;

  /**
   * Cancel button text (default: 'Cancel').
   * Must be already translated by the consumer.
   */
  cancelText?: string;

  /**
   * Props forwarded to confirm button.
   * Allows color, variant, startIcon customization.
   */
  confirmButtonProps?: {
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    variant?: 'text' | 'outlined' | 'contained';
    startIcon?: ReactNode;
  };

  /**
   * Props forwarded to cancel button.
   * Minimal customization (usually not needed).
   */
  cancelButtonProps?: {
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    variant?: 'text' | 'outlined' | 'contained';
    startIcon?: ReactNode;
  };

  /**
   * MUI Dialog props (passthrough limited).
   * Supports: maxWidth, fullWidth, fullScreen.
   * Does NOT support: open, onClose, children (managed internally).
   */
  dialogProps?: {
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fullWidth?: boolean;
    fullScreen?: boolean;
  };
}

/**
 * Result of a confirmation dialog.
 *
 * Discriminated union providing semantic meaning for each outcome:
 *
 * - `{ status: 'confirmed' }` → User clicked confirm button
 * - `{ status: 'cancelled', reason: ... }` → User cancelled via cancel button, backdrop, ESC, or provider unmount
 * - `{ status: 'blocked', reason: 'reentrant-call' }` → confirm() called while another dialog was open
 *
 * This semantic model eliminates ambiguity between user cancellation and blocked re-entrant calls.
 *
 * @example
 * ```tsx
 * const result = await confirm({ title: 'Delete?' });
 * if (result.status === 'confirmed') {
 *   // User confirmed
 * } else if (result.status === 'cancelled') {
 *   // User cancelled - check result.reason for specific cause
 *   console.log('Cancelled via:', result.reason);
 * } else if (result.status === 'blocked') {
 *   // Re-entrant call was blocked
 * }
 * ```
 */
export type ConfirmResult =
  | { status: 'confirmed' }
  | {
      status: 'cancelled';
      reason: 'cancel-button' | 'backdrop' | 'escape-key' | 'provider-unmount';
    }
  | {
      status: 'blocked';
      reason: 'reentrant-call';
    };
