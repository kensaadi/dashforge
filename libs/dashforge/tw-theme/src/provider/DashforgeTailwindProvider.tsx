import { useEffect, useRef, type ReactNode } from 'react';
import type { TWTheme } from '@dashforge/tw-tokens';
import { twThemeCssVars } from '../runtime/cssVars.js';
import { useDashTWTheme } from '../hooks/useDashTWTheme.js';
import { setTheme, setMode } from '../store/tw-theme.store.js';

type ThemeMode = 'light' | 'dark';

const DATA_ATTR = 'data-dash-tw-theme';

/**
 * Props for `DashforgeTailwindProvider`.
 */
export interface DashforgeTailwindProviderProps {
  /** Subtree to render. */
  children: ReactNode;
  /**
   * One-shot override of the active theme on mount. Skips the store's
   * default priority cascade (localStorage → matchMedia → 'light').
   *
   * Mutually exclusive with `initialMode` — passing both is allowed,
   * but `initialTheme` wins because it carries its own
   * `meta.mode`.
   */
  initialTheme?: TWTheme;
  /**
   * One-shot override of the active mode on mount. Useful when the
   * server already decided (e.g. via cookie) which mode to render
   * and you want the client to match without flicker.
   *
   * If both `initialTheme` and `initialMode` are provided,
   * `initialTheme` takes priority.
   */
  initialMode?: ThemeMode;
  /**
   * Reactive mode prop — the controlled interface (issue #110 / G-23).
   *
   * When provided, the provider treats this value as authoritative:
   * every render syncs the internal store to `mode` (if they differ)
   * so consumer-driven React state can steer theming without reaching
   * for the imperative `setMode()` helper. Omit for the traditional
   * uncontrolled behavior where the store is the source of truth.
   *
   * Pair with `onModeChange` for the full controlled loop.
   */
  mode?: ThemeMode;
  /**
   * Called whenever the store's active mode changes — via
   * `setMode(...)` from any call site, via the initial priority
   * cascade on mount, or as the reflection of a `mode` prop change.
   * Consumers use this to keep their local React state in sync with
   * the provider's authoritative mode.
   */
  onModeChange?: (mode: ThemeMode) => void;
}

/**
 * Reactive theme provider for the Dashforge TW ecosystem.
 *
 * Responsibilities:
 *
 *  1. Apply one-shot `initialTheme` / `initialMode` overrides on mount
 *     (skipping the store's automatic cascade).
 *  2. Subscribe to the Valtio theme store via `useDashTWTheme` and
 *     inject the resolved CSS variables on `document.documentElement`
 *     whenever the theme mutates.
 *  3. Mirror `theme.meta.mode` onto a `data-dash-tw-theme` attribute on
 *     the `<html>` element so Tailwind's `darkMode: ['selector', '[data-dash-tw-theme="dark"]']`
 *     selector resolves correctly.
 *
 * The component renders no DOM of its own — it returns `children`
 * unchanged. The effects are SSR-safe (guards on `typeof document`)
 * and StrictMode-safe (`setProperty` with identical values is a no-op,
 * so the double-invocation in development cannot produce stale state).
 *
 * @example Minimum wiring
 * ```tsx
 * import { DashforgeTailwindProvider } from '@dashforge/tw-theme';
 *
 * export default function App({ children }) {
 *   return <DashforgeTailwindProvider>{children}</DashforgeTailwindProvider>;
 * }
 * ```
 *
 * @example Server-rendered initial mode (no FOUC)
 * ```tsx
 * <DashforgeTailwindProvider initialMode="dark">
 *   ...
 * </DashforgeTailwindProvider>
 * ```
 */
export function DashforgeTailwindProvider({
  children,
  initialTheme,
  initialMode,
  mode,
  onModeChange,
}: DashforgeTailwindProviderProps) {
  // Apply the one-shot overrides exactly once on mount. The ref guard
  // protects against StrictMode's double-invoke and against any future
  // re-mounts that should NOT re-trigger the override.
  //
  // Priority on mount: `initialTheme` > `initialMode` > `mode` (used
  // as an "initial" when no other seed is provided; subsequent renders
  // still sync it via the controlled effect below).
  const overrideApplied = useRef(false);
  if (!overrideApplied.current) {
    overrideApplied.current = true;
    if (initialTheme) {
      setTheme(initialTheme);
    } else if (initialMode) {
      setMode(initialMode);
    } else if (mode) {
      setMode(mode);
    }
  }

  const theme = useDashTWTheme();

  // #110 Option B — controlled `mode` prop. When the consumer supplies
  // it, every render syncs the store to match. Skipping the write when
  // the values already agree keeps this a no-op most of the time and
  // avoids re-render loops with `onModeChange` below.
  useEffect(() => {
    if (mode !== undefined && theme.meta.mode !== mode) {
      setMode(mode);
    }
  }, [mode, theme.meta.mode]);

  // #110 Option B — controlled `onModeChange` callback. Fires whenever
  // the store's active mode transitions to a new value, no matter who
  // triggered it (imperative `setMode`, the initial cascade, or the
  // controlled effect above reacting to a prop change). The ref guard
  // avoids emitting on the very first commit (there was no "previous"
  // value yet — nothing changed).
  const prevModeRef = useRef<ThemeMode | null>(null);
  useEffect(() => {
    const nextMode = theme.meta.mode;
    if (prevModeRef.current !== null && prevModeRef.current !== nextMode) {
      onModeChange?.(nextMode);
    }
    prevModeRef.current = nextMode;
  }, [theme.meta.mode, onModeChange]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const vars = twThemeCssVars(theme as TWTheme);
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }
    root.setAttribute(DATA_ATTR, theme.meta.mode);
    // Intentionally no cleanup: we want the last-applied vars to
    // persist if the provider unmounts mid-app (rare, but avoids a
    // visible flash to unstyled). The provider being the single source
    // means no leak risk between renders.
  }, [theme]);

  // #110 Option A — dev-warn on external writes. A MutationObserver
  // watches `data-dash-tw-theme` on `<html>` and warns whenever the
  // attribute is mutated to a value that doesn't match the store — the
  // signature of a consumer directly poking `dataset.dashTwTheme`
  // instead of going through `setMode()` or the controlled `mode` prop.
  // Guarded on NODE_ENV so it costs nothing in production. Same-value
  // writes from the provider itself (see the sync effect above) match
  // the store and are silently ignored.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof document === 'undefined') return;
    if (typeof MutationObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') continue;
        if (mutation.attributeName !== DATA_ATTR) continue;
        const attr = root.getAttribute(DATA_ATTR);
        const storeMode = theme.meta.mode;
        if (attr !== storeMode) {
          // eslint-disable-next-line no-console -- dev-only guard.
          console.warn(
            `[@dashforge/tw-theme] ${DATA_ATTR} was written outside ` +
              `DashforgeTailwindProvider (attribute is ${JSON.stringify(attr)}, ` +
              `store mode is ${JSON.stringify(storeMode)}). Use setMode() from ` +
              `@dashforge/tw-theme, or the provider's controlled 'mode' prop, ` +
              `to drive theming — direct data-attribute writes are silently ` +
              `overwritten on the next store change.`,
          );
        }
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: [DATA_ATTR],
    });
    return () => observer.disconnect();
  }, [theme.meta.mode]);

  return <>{children}</>;
}
