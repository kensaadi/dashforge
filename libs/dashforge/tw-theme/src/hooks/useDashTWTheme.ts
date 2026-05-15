import { useSnapshot } from 'valtio';
import type { TWTheme } from '@dashforge/tw-tokens';
import { twThemeStore } from '../store/tw-theme.store.js';

/**
 * Recursive readonly utility. **Locally defined** so the public `.d.ts`
 * of `@dashforge/tw-theme` does not leak `Snapshot<T>` from `valtio` —
 * consumers see a plain `Readonly`-tree shape and never need to know
 * Valtio is the runtime backbone.
 *
 * @internal
 */
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/**
 * Reactive snapshot of the active Dashforge TW theme.
 *
 * Re-renders the calling component whenever any tracked path on the
 * theme mutates via `setTheme` / `setMode` / `toggleMode` / `patchTheme`.
 * Path tracking is per-call: a component that reads only
 * `theme.meta.mode` does **not** re-render when an unrelated color
 * triplet changes.
 *
 * @returns The frozen, deeply-readonly current theme.
 *
 * @example
 * ```tsx
 * function Sparkline() {
 *   const theme = useDashTWTheme();
 *   return <svg stroke={theme.color.primary['500']} />;
 * }
 * ```
 */
export function useDashTWTheme(): DeepReadonly<TWTheme> {
  // The cast launders `Snapshot<TWTheme>` (a Valtio type) into a plain
  // `DeepReadonly<TWTheme>` — runtime behaviour is identical (Valtio's
  // snapshots are already frozen) but the emitted `.d.ts` no longer
  // mentions `valtio`. See "zero-valtio public API" contract.
  return useSnapshot(twThemeStore) as DeepReadonly<TWTheme>;
}
