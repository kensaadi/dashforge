/**
 * React hook for reactive visibility evaluation based on engine state.
 *
 * This hook provides a safe, reactive way to compute visibility predicates
 * that depend on engine state. It subscribes to engine changes and re-evaluates
 * the predicate automatically.
 *
 * @module useEngineVisibility
 */

import { useSnapshot } from 'valtio';
import type { Engine } from '../types';

/**
 * Hook to reactively evaluate a visibility predicate based on engine state.
 *
 * This hook subscribes to engine state changes and re-evaluates the predicate
 * whenever the engine state changes. It's designed to be used by UI components
 * that need conditional visibility based on dynamic form state.
 *
 * @param engine - The engine instance (can be null/undefined for safe usage)
 * @param visibleWhen - Optional predicate function that receives the engine
 * @returns true if visible, false if hidden
 *
 * Behavior:
 * - If engine is null/undefined: returns true (cannot evaluate, default to visible)
 * - If visibleWhen is not provided: returns true (no condition, always visible)
 * - Otherwise: subscribes to engine changes and evaluates predicate
 * - If predicate throws: returns true (fail-safe to visible) with dev warning
 *
 * @example
 * ```tsx
 * function ConditionalField() {
 *   const engine = useEngineContext();
 *   const isVisible = useEngineVisibility(
 *     engine,
 *     (eng) => eng.getNode('country')?.value === 'US'
 *   );
 *
 *   if (!isVisible) return null;
 *   return <input name="state" />;
 * }
 * ```
 */
export function useEngineVisibility(
  engine: Engine | null | undefined,
  visibleWhen?: ((engine: Engine) => boolean) | undefined
): boolean {
  // Safe defaults: if no engine or no predicate, always visible
  if (!engine || !visibleWhen) {
    return true;
  }

  // Subscribe to engine nodes map - this causes re-render when any node changes
  // We don't need to use the snapshot directly, just accessing it creates the subscription
  useSnapshot(engine.getState().nodes);

  // Evaluate the predicate with error handling
  try {
    return !!visibleWhen(engine);
  } catch (err) {
    // Fail-safe: if predicate throws, default to visible
    // Only warn in development to avoid console spam in production
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[ui-core] visibleWhen predicate threw an error, defaulting to visible',
        err
      );
    }
    return true;
  }
}
