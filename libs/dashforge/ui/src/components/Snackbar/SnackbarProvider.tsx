import {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  SnackbarOptions,
  SnackbarProviderState,
  SnackbarContextValue,
  SnackbarQueueItem,
  SnackbarTimer,
} from './types';
import { SnackbarHost } from './SnackbarHost';

// ============================================================================
// Constants
// ============================================================================

const MAX_VISIBLE_SNACKBARS = 3;
const DEFAULT_AUTO_HIDE_DURATION = 5000;

// ============================================================================
// Context
// ============================================================================

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarProviderState>({ queue: [] });
  const timersRef = useRef<Map<string, SnackbarTimer>>(new Map());
  const nextIdRef = useRef(1);

  // ==========================================================================
  // Timer Management
  // ==========================================================================

  const startTimer = useCallback((id: string, duration: number) => {
    const timer = setTimeout(() => {
      close(id);
    }, duration);
    timersRef.current.set(id, timer);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  // ==========================================================================
  // ID Generation
  // ==========================================================================

  const generateId = useCallback((): string => {
    const id = `snackbar-${nextIdRef.current}`;
    nextIdRef.current += 1;
    return id;
  }, []);

  // ==========================================================================
  // Queue Operations
  // ==========================================================================

  const enqueue = useCallback(
    (message: ReactNode, options?: SnackbarOptions): string => {
      const id = generateId();

      setState((prev) => {
        // Determine initial status
        const visibleCount = prev.queue.filter(
          (item) => item.status === 'visible' || item.status === 'exiting'
        ).length;
        const initialStatus =
          visibleCount < MAX_VISIBLE_SNACKBARS ? 'visible' : 'queued';

        const item: SnackbarQueueItem = {
          id,
          message,
          variant: options?.variant ?? 'default',
          options: {
            variant: options?.variant ?? 'default',
            autoHideDuration:
              options?.autoHideDuration ?? DEFAULT_AUTO_HIDE_DURATION,
            action: options?.action,
            preventDismiss: options?.preventDismiss ?? false,
          },
          status: initialStatus,
          enqueuedAt: Date.now(),
        };

        // CRITICAL: Start timer ONLY if item is immediately visible
        if (
          initialStatus === 'visible' &&
          item.options.autoHideDuration !== null
        ) {
          startTimer(id, item.options.autoHideDuration);
        }

        return { queue: [...prev.queue, item] };
      });

      return id;
    },
    [generateId, startTimer]
  );

  const close = useCallback(
    (id: string) => {
      setState((prev) => {
        const item = prev.queue.find((i) => i.id === id);

        // No-op if item not found or already exiting
        if (!item || item.status === 'exiting') {
          return prev;
        }

        // Cancel timer
        clearTimer(id);

        // Queued items are removed immediately
        if (item.status === 'queued') {
          return {
            queue: prev.queue.filter((i) => i.id !== id),
          };
        }

        // Visible items transition to exiting
        return {
          queue: prev.queue.map((i) =>
            i.id === id ? { ...i, status: 'exiting' as const } : i
          ),
        };
      });
    },
    [clearTimer]
  );

  const closeAll = useCallback(() => {
    // Clear all timers
    clearAllTimers();

    setState((prev) => {
      // Queued items removed immediately
      // Visible items transition to exiting
      // NO PROMOTION during closeAll
      return {
        queue: prev.queue
          .filter((item) => item.status !== 'queued') // Remove queued immediately
          .map((item) => ({ ...item, status: 'exiting' as const })), // Exit visible
      };
    });
  }, [clearAllTimers]);

  const handleExited = useCallback(
    (id: string) => {
      setState((prev) => {
        // Remove exited item from queue
        const newQueue = prev.queue.filter((i) => i.id !== id);

        // Check if we can promote a queued item
        const visibleCount = newQueue.filter(
          (i) => i.status === 'visible' || i.status === 'exiting'
        ).length;
        const queuedItems = newQueue.filter((i) => i.status === 'queued');

        if (visibleCount < MAX_VISIBLE_SNACKBARS && queuedItems.length > 0) {
          const nextItem = queuedItems[0]; // FIFO

          // Promote to visible
          const promotedQueue = newQueue.map((i) =>
            i.id === nextItem.id ? { ...i, status: 'visible' as const } : i
          );

          // CRITICAL: Start timer for promoted item NOW
          if (nextItem.options.autoHideDuration !== null) {
            startTimer(nextItem.id, nextItem.options.autoHideDuration);
          }

          return { queue: promotedQueue };
        }

        return { queue: newQueue };
      });
    },
    [startTimer]
  );

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const contextValue = useMemo(
    () => ({ enqueue, close, closeAll }),
    [enqueue, close, closeAll]
  );

  // ==========================================================================
  // Cleanup on Unmount
  // ==========================================================================

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <SnackbarHost
        queue={state.queue}
        onExited={handleExited}
        onClose={close}
      />
    </SnackbarContext.Provider>
  );
}
