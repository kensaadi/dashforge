import type { ReactNode } from 'react';
import type { SnackbarVariants } from './snackbar.variants.js';

/** Visual severity — drives icon color + accent on the snackbar surface. */
export type SnackbarSeverity = 'info' | 'success' | 'warning' | 'danger';

/** Corner anchor for the snackbar stack. */
export type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** One snackbar instance — what `useSnackbar().enqueue()` accepts. */
export interface SnackbarOptions {
  /** Required text/content. */
  message: ReactNode;
  /** Visual severity. @default 'info' */
  severity?: SnackbarSeverity;
  /**
   * Auto-dismiss after this many ms. `0` / negative ⇒ persistent
   * (only dismissed by the close button or `dismiss(id)`).
   * @default 4000
   */
  autoHideMs?: number;
  /** Optional action button label + handler. */
  action?: { label: ReactNode; onClick: () => void };
  /** Per-instance close-button visibility. @default true */
  showClose?: boolean;
  /**
   * Stable identifier for de-duplication. If a snackbar with the same
   * `id` is enqueued while already visible, the existing one is REUSED
   * (auto-dismiss timer reset) instead of stacking a duplicate. Useful
   * for "Saved" toasts triggered repeatedly from the same action.
   */
  id?: string;
}

/** Internal model — every enqueued snackbar gets a unique id + a tick. */
export interface SnackbarRecord extends SnackbarOptions {
  id: string;
  /**
   * Monotonic creation tick, used to drive the entry CSS transition
   * (the consumer's CSS can target `data-state="entered"` keyed by tick).
   */
  tick: number;
}

export interface SnackbarSlotProps {
  container?: { className?: string };
  item?: { className?: string };
  icon?: { className?: string };
  message?: { className?: string };
  action?: { className?: string };
  closeButton?: { className?: string };
}

/** API exposed by `useSnackbar()`. */
export interface SnackbarApi {
  /** Show a snackbar — returns its assigned id (auto-generated if not provided). */
  enqueue: (options: SnackbarOptions) => string;
  /** Dismiss a specific snackbar. */
  dismiss: (id: string) => void;
  /** Dismiss every visible snackbar. */
  dismissAll: () => void;
}

export interface SnackbarProviderProps extends SnackbarVariants {
  children: ReactNode;
  /** Corner the stack anchors to. @default 'bottom-right' */
  position?: SnackbarPosition;
  /**
   * Hard cap on simultaneously visible snackbars. Excess enqueued
   * items wait FIFO until a slot frees up. @default 5
   */
  maxVisible?: number;
  /** Defaults merged into every enqueue. */
  defaults?: Pick<SnackbarOptions, 'severity' | 'autoHideMs' | 'showClose'>;
  /** Per-slot className overrides. */
  slotProps?: SnackbarSlotProps;
}
