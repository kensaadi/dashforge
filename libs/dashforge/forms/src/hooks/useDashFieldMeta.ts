import {
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { DashFormContext } from '@dashforge/ui-core';
import type { BridgeFieldError } from '@dashforge/ui-core';

/**
 * Aggregated per-field meta state surfaced to UI components.
 *
 * Reading this single object via `useDashFieldMeta` is the canonical way to
 * subscribe a UI component to *its own* field — the component re-renders
 * only when one of these properties changes for that field, never when
 * another field changes.
 */
export interface DashFieldMeta {
  /** Current value of the field (from RHF / bridge.getValue). */
  value: unknown;
  /** Validation error, or null. */
  error: BridgeFieldError | null;
  /** Field has been touched (blurred at least once). */
  touched: boolean;
  /** Field value differs from its default. */
  dirty: boolean;
  /** Number of submit attempts (form-level, kept here for ergonomics). */
  submitCount: number;
  /**
   * Convenience flag: an error should be displayed because the field is
   * touched OR the form has been submitted at least once. Implements the
   * "Form Closure v1" gating policy without forcing every consumer to
   * recompute it.
   */
  allowAutoError: boolean;
}

const EMPTY_META: DashFieldMeta = {
  value: undefined,
  error: null,
  touched: false,
  dirty: false,
  submitCount: 0,
  allowAutoError: false,
};

/**
 * Subscribe a UI component to per-field state changes for `name`.
 *
 * This hook is the canonical replacement for the legacy
 * `void bridge?.errorVersion` "global subscribe" trick. It uses the
 * bridge's `subscribeField` API (provided by DashFormProvider) and
 * `useSyncExternalStore`, so the consumer re-renders only when its own
 * field state actually changes — never when an unrelated field is edited.
 *
 * Returns a stable-identity object (memoized on inputs) so spreading or
 * destructuring stays cheap.
 *
 * @param name - Field name to subscribe to
 * @returns DashFieldMeta with value / error / touched / dirty / submitCount
 *
 * @example
 * ```tsx
 * function MyTextField({ name }: { name: string }) {
 *   const { value, error, touched, allowAutoError } = useDashFieldMeta(name);
 *   // re-renders ONLY when this field's state changes.
 * }
 * ```
 */
export function useDashFieldMeta(name: string): DashFieldMeta {
  const bridge = useContext(DashFormContext);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!bridge?.subscribeField) {
        // Provider not present (standalone/plain mode): no-op subscription.
        return () => {};
      }
      return bridge.subscribeField(name, onStoreChange);
    },
    [bridge, name]
  );

  // useSyncExternalStore requires getSnapshot to return a referentially
  // stable value when nothing changed — otherwise React enters a tear loop.
  // bridge.getError is allowed to allocate a fresh `{ message }` object on
  // every call, so we cannot rely on object identity. Instead we cache the
  // last snapshot AND its primitive identity (errorMessage string,
  // value/touched/dirty/submitCount) and only mint a new snapshot when one
  // of those primitives actually differs.
  const cacheRef = useMemo(
    () => ({
      primitives: null as
        | [unknown, string | null, boolean, boolean, number]
        | null,
      snapshot: null as DashFieldMeta | null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getSnapshot = useCallback((): DashFieldMeta => {
    if (!bridge) {
      return EMPTY_META;
    }
    const value = bridge.getValue?.(name);
    const errorObj = bridge.getError?.(name) ?? null;
    const errorMessage = errorObj?.message ?? null;
    const touched = bridge.isTouched?.(name) ?? false;
    const dirty = bridge.isDirty?.(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;

    const prev = cacheRef.primitives;
    const prevSnapshot = cacheRef.snapshot;
    if (
      prev &&
      prevSnapshot &&
      prev[0] === value &&
      prev[1] === errorMessage &&
      prev[2] === touched &&
      prev[3] === dirty &&
      prev[4] === submitCount
    ) {
      return prevSnapshot;
    }

    const allowAutoError = touched || submitCount > 0;
    const snapshot: DashFieldMeta = {
      value,
      error: errorMessage != null ? { message: errorMessage } : null,
      touched,
      dirty,
      submitCount,
      allowAutoError,
    };
    cacheRef.primitives = [value, errorMessage, touched, dirty, submitCount];
    cacheRef.snapshot = snapshot;
    return snapshot;
  }, [bridge, name, cacheRef]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
