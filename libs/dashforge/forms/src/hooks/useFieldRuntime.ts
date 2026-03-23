import { useContext, useSyncExternalStore, useCallback } from 'react';
import { DashFormContext } from '@dashforge/ui-core';
import type { FieldRuntimeState } from '../runtime/runtime.types';

/**
 * Default runtime state for standalone mode.
 * Constant reference prevents infinite re-renders.
 */
const DEFAULT_RUNTIME_STATE: FieldRuntimeState = {
  status: 'idle',
  error: null,
  data: null,
};

/**
 * Hook to subscribe to runtime state for a specific field (READ-ONLY).
 * Uses useSyncExternalStore for concurrent-safe subscriptions.
 *
 * ⚠️ UI COMPONENTS: This is your PRIMARY runtime API
 *
 * This hook provides READ-ONLY access to runtime state.
 * UI components MUST NOT call setFieldRuntime directly.
 *
 * Subscriptions are ISOLATED per field - changes to other fields
 * will NOT trigger re-renders of this hook.
 *
 * @template TData - Type of runtime data
 * @param name - Field name to subscribe to
 * @returns Current runtime state for the field
 *
 * @example
 * ```tsx
 * function MySelect({ name }) {
 *   // Hook automatically subscribes to this field only
 *   const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
 *
 *   if (runtime.status === 'loading') {
 *     return <CircularProgress />;
 *   }
 *
 *   if (runtime.status === 'error') {
 *     return <Alert severity="error">{runtime.error}</Alert>;
 *   }
 *
 *   const options = runtime.data?.options ?? [];
 *   return <Select name={name} options={options} />;
 * }
 * ```
 */
export function useFieldRuntime<TData = unknown>(
  name: string
): FieldRuntimeState<TData> {
  const bridge = useContext(DashFormContext);

  // Define subscribe function for useSyncExternalStore
  // Subscribes to this specific field only (isolated)
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!bridge?.subscribeFieldRuntime) {
        // No runtime store - return no-op unsubscribe
        return () => {};
      }

      // Subscribe to this specific field (via subscribe internally)
      return bridge.subscribeFieldRuntime(name, onStoreChange);
    },
    [bridge, name]
  );

  // Define getSnapshot function for useSyncExternalStore
  const getSnapshot = useCallback((): FieldRuntimeState<TData> => {
    if (!bridge?.getFieldRuntime) {
      // No runtime store - return default state (constant reference)
      return DEFAULT_RUNTIME_STATE as FieldRuntimeState<TData>;
    }

    return bridge.getFieldRuntime<TData>(name);
  }, [bridge, name]);

  // Use React's concurrent-safe subscription mechanism
  const runtime = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return runtime;
}
