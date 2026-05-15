/**
 * @dashforge/tw-theme
 *
 * Theme adapter + runtime provider for the Dashforge TW renderer
 * ecosystem. Consumes `@dashforge/tw-tokens` token shapes; isolated
 * from the MUI theme stack (`@dashforge/theme-core` + `@dashforge/theme-mui`)
 * per the architecture plan v2 (2026-05-15).
 *
 * Public API surface (F2):
 *
 * Build-time (Tailwind config):
 *   - `dashforgePreset()` — Tailwind preset whose token values resolve
 *     to CSS variables (alpha-value friendly).
 *
 * Runtime (React component tree):
 *   - `<DashforgeTailwindProvider>` — reactive provider that injects
 *     CSS vars on `<html>` and wires the dark-mode attribute.
 *   - `useDashTWTheme()` — reactive hook returning the active theme.
 *
 * Imperative actions (programmatic mode/theme swap):
 *   - `setMode('light' | 'dark')`
 *   - `toggleMode()`
 *   - `setTheme(theme)`
 *   - `replaceTheme(theme)` — alias of `setTheme`
 *   - `patchTheme(deepPartial)`
 *
 * SSR helpers:
 *   - `serverSideStyleTag(theme)` — inline `<style>` block for the
 *     initial paint, preventing FOUC.
 *
 * Lower-level (for advanced consumers):
 *   - `twThemeCssVars(theme)` — pure CSS-var map builder.
 *
 * Types: re-exported from `@dashforge/tw-tokens` for convenience.
 *
 * @module @dashforge/tw-theme
 */
export {
  dashforgePreset,
  type DashforgePresetResult,
} from './adapter/dashforgePreset.js';

export {
  DashforgeTailwindProvider,
  type DashforgeTailwindProviderProps,
} from './provider/DashforgeTailwindProvider.js';

export { useDashTWTheme } from './hooks/useDashTWTheme.js';

export {
  setTheme,
  setMode,
  toggleMode,
  replaceTheme,
  patchTheme,
} from './store/tw-theme.actions.js';

export { twThemeCssVars, hexToRgbTriplet } from './runtime/cssVars.js';
export { serverSideStyleTag } from './runtime/serverSideStyleTag.js';

/**
 * Re-export the canonical TW theme types so consumers don't need to
 * import from `@dashforge/tw-tokens` separately for type-only use.
 */
export type {
  TWTheme,
  TWThemeMeta,
  TWColorScale,
  TWColorTokens,
  TWSpacingScale,
  TWRadiusTokens,
  TWFontSizeTokens,
} from '@dashforge/tw-tokens';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '0.0.1';
