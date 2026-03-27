import type { ReactNode } from 'react';

/**
 * Snackbar variants (maps to MUI Alert severity)
 */
export type SnackbarVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default';

/**
 * Public options for enqueue()
 */
export interface SnackbarOptions {
  /**
   * Visual variant (default: 'default')
   */
  variant?: SnackbarVariant;

  /**
   * Auto-hide duration in milliseconds
   * Set to null to persist until manually closed
   * @default 5000
   */
  autoHideDuration?: number | null;

  /**
   * Optional action element (e.g., undo button)
   */
  action?: ReactNode;

  /**
   * Prevent dismissal by clicking close button
   * @default false
   */
  preventDismiss?: boolean;
}

/**
 * Public API returned by useSnackbar()
 */
export interface SnackbarAPI {
  enqueue: (message: ReactNode, options?: SnackbarOptions) => string;
  close: (id: string) => void;
  closeAll: () => void;
  success: (
    message: ReactNode,
    options?: Omit<SnackbarOptions, 'variant'>
  ) => string;
  error: (
    message: ReactNode,
    options?: Omit<SnackbarOptions, 'variant'>
  ) => string;
  warning: (
    message: ReactNode,
    options?: Omit<SnackbarOptions, 'variant'>
  ) => string;
  info: (
    message: ReactNode,
    options?: Omit<SnackbarOptions, 'variant'>
  ) => string;
}

// ============================================================================
// Internal Types (NOT exported)
// ============================================================================

/**
 * Snackbar lifecycle status
 */
export type SnackbarItemStatus = 'queued' | 'visible' | 'exiting';

/**
 * Internal resolved options (with defaults applied)
 */
export interface SnackbarResolvedOptions {
  variant: SnackbarVariant;
  autoHideDuration: number | null;
  action?: ReactNode;
  preventDismiss: boolean;
}

/**
 * Internal queue item structure
 */
export interface SnackbarQueueItem {
  id: string;
  message: ReactNode;
  variant: SnackbarVariant;
  options: SnackbarResolvedOptions;
  status: SnackbarItemStatus;
  enqueuedAt: number;
}

/**
 * Provider state model
 */
export interface SnackbarProviderState {
  queue: SnackbarQueueItem[];
}

/**
 * Timer reference type
 */
export type SnackbarTimer = ReturnType<typeof setTimeout>;

/**
 * Context value (internal only)
 */
export interface SnackbarContextValue {
  enqueue: (message: ReactNode, options?: SnackbarOptions) => string;
  close: (id: string) => void;
  closeAll: () => void;
}
