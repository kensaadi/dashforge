import {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { ConfirmDialogHost } from './ConfirmDialogHost';
import type { ConfirmOptions, ConfirmResult } from './types';

/**
 * Internal dialog state (discriminated union).
 * Rendering-only state - no side-effectful resolvers stored here.
 */
type ConfirmDialogState =
  | { status: 'idle' }
  | { status: 'open'; options: ConfirmOptions };

/**
 * Context value shape (NOT exported).
 */
interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<ConfirmResult>;
}

/**
 * Internal context for ConfirmDialog (NOT exported).
 * Only the provider and useConfirm hook have access to this.
 */
export const ConfirmDialogContext =
  createContext<ConfirmDialogContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  ConfirmDialogContext.displayName = 'ConfirmDialogContext';
}

/**
 * Provider props.
 */
interface ConfirmDialogProviderProps {
  children: ReactNode;
}

/**
 * ConfirmDialogProvider - Context provider for imperative confirmation dialogs.
 *
 * Wrap your app root with this provider to enable useConfirm() hook.
 *
 * @example
 * ```tsx
 * <ConfirmDialogProvider>
 *   <App />
 * </ConfirmDialogProvider>
 * ```
 *
 * Responsibilities:
 * - Manages dialog state (discriminated union: idle | open)
 * - Stores resolver in ref (NOT in React state)
 * - Provides confirm function via context
 * - Renders ConfirmDialogHost when dialog is open
 * - Handles re-entrancy (BLOCK new calls when dialog open)
 * - Handles provider unmount (safely resolves pending promise)
 */
export function ConfirmDialogProvider({
  children,
}: ConfirmDialogProviderProps) {
  // Rendering-oriented state (discriminated union)
  const [state, setState] = useState<ConfirmDialogState>({ status: 'idle' });

  // Resolver stored in ref (NOT in React state - no side effects in setState)
  const resolverRef = useRef<((result: ConfirmResult) => void) | null>(null);

  // Track open state in ref for re-entrancy check (avoids stale closure)
  const isOpenRef = useRef(false);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<ConfirmResult> => {
      // GUARD: Re-entrancy protection
      // If dialog is already open, return blocked result immediately
      if (isOpenRef.current) {
        // Dev warning
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[Dashforge ConfirmDialog] Cannot open new confirm dialog while another is pending. ' +
              'Wait for current dialog to close before calling confirm() again.'
          );
        }

        // Return immediately resolved promise with blocked result
        return Promise.resolve({ status: 'blocked', reason: 'reentrant-call' });
      }

      // Mark as open
      isOpenRef.current = true;

      // Normal flow: open dialog and return promise
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setState({ status: 'open', options });
      });
    },
    []
  );

  const handleClose = useCallback((result: ConfirmResult) => {
    // Resolve pending promise if resolver exists
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }

    // Mark as closed
    isOpenRef.current = false;

    // Close dialog
    setState({ status: 'idle' });
  }, []);

  // Provider unmount: safely resolve pending promise
  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current({
          status: 'cancelled',
          reason: 'provider-unmount',
        });
        resolverRef.current = null;
      }
    };
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialogHost
        options={state.status === 'open' ? state.options : null}
        onClose={handleClose}
      />
    </ConfirmDialogContext.Provider>
  );
}
