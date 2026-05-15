import type { TWTheme } from '@dashforge/tw-tokens';
import { twThemeStore, setTheme } from './tw-theme.store.js';

/**
 * Type-only deep-partial helper. Local to this module to avoid pulling
 * in a utility-types dependency for one usage.
 *
 * @internal
 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Replace the entire active theme. Alias of `setTheme` provided for
 * symmetry with the MUI side (`@dashforge/theme-core/replaceTheme`).
 *
 * Prefer `setMode('dark' | 'light')` if you only need to switch between
 * the two shipped defaults — it ships less work to the Valtio subscriber
 * chain than rebuilding the theme object.
 */
export function replaceTheme(next: TWTheme): void {
  setTheme(next);
}

/**
 * Deep-merge a partial theme onto the active one. Useful for runtime
 * brand overrides without rebuilding the Tailwind CSS at build time —
 * the new color triplets are picked up by the runtime CSS-vars
 * injection in `DashforgeTailwindProvider`.
 *
 * @example
 * ```ts
 * import { patchTheme } from '@dashforge/tw-theme';
 *
 * patchTheme({
 *   color: {
 *     primary: {
 *       '500': '#9333ea',
 *       '600': '#7e22ce',
 *     },
 *   },
 * });
 * ```
 */
export function patchTheme(partial: DeepPartial<TWTheme>): void {
  deepMergeInto(twThemeStore as unknown as Record<string, unknown>, partial);
}

/**
 * Recursive in-place deep-merge of plain-object trees. Arrays are
 * replaced wholesale (matches MUI-side semantics in
 * `@dashforge/theme-core/patchTheme`).
 *
 * @internal
 */
function deepMergeInto(target: Record<string, unknown>, source: unknown): void {
  if (source === null || typeof source !== 'object') return;
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const value = (source as Record<string, unknown>)[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const existing = target[key];
      if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
        target[key] = {};
      }
      deepMergeInto(target[key] as Record<string, unknown>, value);
    } else {
      target[key] = value;
    }
  }
}

// Re-export the imperative action APIs so consumers of the actions
// module can import everything from one place.
export { setTheme, setMode, toggleMode } from './tw-theme.store.js';
