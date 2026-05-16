import type { ReactNode } from 'react';
import type { ConfirmDialogVariants } from './confirmDialog.variants.js';

/**
 * Severity / intent of the confirmation request — drives the accent
 * color of the confirm button (info / warning / danger / success).
 */
export type ConfirmSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface ConfirmDialogSlotProps {
  backdrop?: { className?: string };
  dialog?: { className?: string };
  title?: { className?: string };
  body?: { className?: string };
  actions?: { className?: string };
  confirmButton?: { className?: string };
  cancelButton?: { className?: string };
}

/**
 * One-shot confirmation request.
 *
 * Passed to `confirm()` from `useConfirm()` — the consumer awaits the
 * returned promise. Resolves `true` when the user clicks confirm,
 * `false` otherwise (cancel, backdrop, Escape).
 */
export interface ConfirmOptions {
  title?: ReactNode;
  /**
   * Body content. Either a plain node (rendered inside `<p>`) or a
   * fully custom render — accepted as a ReactNode to keep the API simple.
   */
  body?: ReactNode;
  /** Confirm button label. @default 'Confirm' */
  confirmLabel?: ReactNode;
  /** Cancel button label. @default 'Cancel' */
  cancelLabel?: ReactNode;
  /** Severity drives confirm button color. @default 'info' */
  severity?: ConfirmSeverity;
  /** Disable the backdrop-click close. @default false */
  disableBackdropClose?: boolean;
  /** Disable the Escape-key close. @default false */
  disableEscapeClose?: boolean;
  /** Per-slot className overrides for this single invocation. */
  slotProps?: ConfirmDialogSlotProps;
}

/**
 * Imperative API exposed by `useConfirm()`.
 *
 * ```tsx
 * const confirm = useConfirm();
 * const ok = await confirm({
 *   title: 'Delete record?',
 *   body: 'This action cannot be undone.',
 *   severity: 'danger',
 *   confirmLabel: 'Delete',
 * });
 * if (ok) { ... }
 * ```
 */
export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

export interface ConfirmDialogProviderProps extends ConfirmDialogVariants {
  children: ReactNode;
  /** Default options merged into every `confirm()` invocation. */
  defaults?: ConfirmOptions;
  /** Per-slot className overrides applied to ALL invocations. */
  slotProps?: ConfirmDialogSlotProps;
}
