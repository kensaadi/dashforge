import { useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { SnackbarContext } from './SnackbarProvider';
import type { SnackbarOptions, SnackbarAPI } from './types';

/**
 * useSnackbar hook - Public API
 * Returns imperative functions for managing snackbars
 * @throws {Error} If called outside SnackbarProvider
 */
export function useSnackbar(): SnackbarAPI {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error(
      'useSnackbar must be used within SnackbarProvider. ' +
        'Wrap your app root with <SnackbarProvider>.'
    );
  }

  const { enqueue, close, closeAll } = context;

  // Convenience helpers (thin wrappers over enqueue)
  const success = useCallback(
    (message: ReactNode, options?: Omit<SnackbarOptions, 'variant'>) =>
      enqueue(message, { ...options, variant: 'success' }),
    [enqueue]
  );

  const error = useCallback(
    (message: ReactNode, options?: Omit<SnackbarOptions, 'variant'>) =>
      enqueue(message, { ...options, variant: 'error' }),
    [enqueue]
  );

  const warning = useCallback(
    (message: ReactNode, options?: Omit<SnackbarOptions, 'variant'>) =>
      enqueue(message, { ...options, variant: 'warning' }),
    [enqueue]
  );

  const info = useCallback(
    (message: ReactNode, options?: Omit<SnackbarOptions, 'variant'>) =>
      enqueue(message, { ...options, variant: 'info' }),
    [enqueue]
  );

  return { enqueue, close, closeAll, success, error, warning, info };
}
