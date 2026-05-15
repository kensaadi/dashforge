/**
 * @dashforge/tw-theme
 *
 * Theme adapter + runtime provider for the Dashforge TW renderer
 * ecosystem. Consumes `@dashforge/tw-tokens` token shapes; isolated
 * from the MUI theme stack (`@dashforge/theme-core` + `@dashforge/theme-mui`)
 * per the architecture plan v2 (2026-05-15).
 *
 * F1 surface (placeholder/forward-compatible):
 * - `dashforgePreset()` — Tailwind preset factory from a TW theme.
 *   Consumers spread it into `tailwind.config.ts` `presets: [...]`.
 * - `<DashforgeTailwindProvider>` — React provider shell that wires
 *   the dark-mode attribute. F2 brings the Valtio store + CSS-vars
 *   injection.
 *
 * @module @dashforge/tw-theme
 */
export * from './adapter/dashforgePreset.js';
export * from './provider/DashforgeTailwindProvider.js';

/**
 * Re-export the canonical TW theme types so consumers don't need to
 * import from `@dashforge/tw-tokens` separately for type-only use.
 */
export type { TWTheme, TWColorScale, TWColorTokens, TWSpacingScale, TWRadiusTokens, TWFontSizeTokens } from '@dashforge/tw-tokens';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '0.0.0';
