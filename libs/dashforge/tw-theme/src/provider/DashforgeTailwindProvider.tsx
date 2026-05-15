import { useEffect, useRef, type ReactNode } from 'react';
import type { TWTheme } from '@dashforge/tw-tokens';
import { twThemeCssVars } from '../runtime/cssVars.js';
import { useDashTWTheme } from '../hooks/useDashTWTheme.js';
import { setTheme, setMode } from '../store/tw-theme.store.js';

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
  initialMode?: 'light' | 'dark';
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
}: DashforgeTailwindProviderProps) {
  // Apply the one-shot overrides exactly once on mount. The ref guard
  // protects against StrictMode's double-invoke and against any future
  // re-mounts that should NOT re-trigger the override.
  const overrideApplied = useRef(false);
  if (!overrideApplied.current) {
    overrideApplied.current = true;
    if (initialTheme) {
      setTheme(initialTheme);
    } else if (initialMode) {
      setMode(initialMode);
    }
  }

  const theme = useDashTWTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const vars = twThemeCssVars(theme as TWTheme);
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }
    root.setAttribute('data-dash-tw-theme', theme.meta.mode);
    // Intentionally no cleanup: we want the last-applied vars to
    // persist if the provider unmounts mid-app (rare, but avoids a
    // visible flash to unstyled). The provider being the single source
    // means no leak risk between renders.
  }, [theme]);

  return <>{children}</>;
}
