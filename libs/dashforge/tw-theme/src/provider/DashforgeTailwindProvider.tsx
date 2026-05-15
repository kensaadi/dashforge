import { useEffect, type ReactNode } from 'react';
import type { TWTheme } from '@dashforge/tw-tokens';
import { defaultTWTheme } from '@dashforge/tw-tokens';

/**
 * Props for `DashforgeTailwindProvider`.
 */
export interface DashforgeTailwindProviderProps {
  /**
   * Children rendered inside the themed surface.
   */
  children: ReactNode;
  /**
   * Override the active TW theme. Defaults to `defaultTWTheme` from
   * `@dashforge/tw-tokens` (F1 placeholder values). F2 will introduce
   * a runtime Valtio store so this prop becomes optional in most cases.
   */
  theme?: TWTheme;
  /**
   * Dark mode toggle. F2 will wire this to the runtime store; F1
   * accepts the prop and applies the `data-dash-tw-theme` attribute on
   * the document root so consumers can wire Tailwind's dark selector
   * already today (`darkMode: ['selector', '[data-dash-tw-theme="dark"]']`).
   */
  mode?: 'light' | 'dark';
}

/**
 * Dashforge TW theme provider.
 *
 * F1 placeholder — accepts the theme + mode props and sets the
 * `data-dash-tw-theme` attribute on `<html>` so Tailwind's dark-mode
 * selector resolves correctly. F2 will add:
 * - Valtio runtime store with `useDashTWTheme()` hook
 * - CSS-variables injection from `theme` (so token swaps don't require
 *   a Tailwind rebuild)
 * - Storage/system-preference sync
 *
 * For F1, this lets consumers wire `<DashforgeTailwindProvider>` into
 * their app shell while the real reactive engine lands in F2.
 *
 * @example
 * ```tsx
 * <DashforgeTailwindProvider mode="dark">
 *   <App />
 * </DashforgeTailwindProvider>
 * ```
 */
export function DashforgeTailwindProvider({
  children,
  theme: _theme = defaultTWTheme,
  mode = 'light',
}: DashforgeTailwindProviderProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-dash-tw-theme', mode);
    return () => {
      // Only clear if WE set it — but in F1 this is a single-source provider,
      // so we leave the attribute on unmount to avoid flicker if the consumer
      // swaps providers. F2 will track ownership precisely.
    };
  }, [mode]);

  // F1: theme is accepted but not yet consumed at runtime (no CSS vars
  // injection). The prop signature is forward-compatible with F2's
  // reactive store implementation.

  return <>{children}</>;
}
