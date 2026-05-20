/**
 * Tailwind-shaped design token interfaces for the Dashforge TW renderer.
 *
 * SOURCE OF TRUTH for the @dashforge/tw ecosystem. Intentionally isolated
 * from `@dashforge/tokens` (MUI shape) — see the architecture plan v2
 * (2026-05-15) for the full rationale. Two parallel ecosystems share only
 * the bridge layer (forms + ui-core + rbac); tokens never cross.
 *
 * The shape mirrors Tailwind's idiomatic numeric color scales (50–950),
 * a 0–96 spacing scale, and named radius/font tiers. Concrete defaults
 * live in `defaults.ts`.
 */

/**
 * Tailwind-style numeric color scale.
 * Maps tonal steps from lightest (50) to darkest (950).
 */
export interface TWColorScale {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
  '950': string;
}

/**
 * Semantic color roles. Each role exposes the full numeric scale so
 * components and `sx` overrides can pick any tone (e.g. `primary.500`
 * for default, `primary.700` for hover).
 */
export interface TWColorTokens {
  primary: TWColorScale;
  secondary: TWColorScale;
  success: TWColorScale;
  warning: TWColorScale;
  danger: TWColorScale;
  info: TWColorScale;
  neutral: TWColorScale;
}

/**
 * Tailwind spacing scale (rem). Keyed by the conventional Tailwind step
 * names (`0`, `0.5`, `1`, `1.5`, `2`, ... up to `96`). F1 declares the
 * minimal subset; the full scale is populated in F2.
 */
export type TWSpacingScale = Record<string, string>;

/**
 * Named border-radius tiers. F1 declares the typical Tailwind tiers.
 */
export interface TWRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

/**
 * Font-size tiers (rem). Tailwind-idiomatic names.
 */
export interface TWFontSizeTokens {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Box-shadow / elevation tiers. Tailwind-idiomatic names — `DEFAULT`
 * backs the bare `shadow` utility, the rest back `shadow-{tier}`.
 *
 * Making shadow a theme token (rather than relying on Tailwind's
 * built-in `boxShadow` scale) means the elevation language becomes
 * part of the Dashforge identity AND is runtime-patchable via
 * `patchTheme({ shadow: { md: '...' } })` — same mechanism as colors.
 *
 * `<Box elevation={0..5}>` maps onto this scale:
 * `0→none, 1→sm, 2→DEFAULT, 3→md, 4→lg, 5→xl`.
 */
export interface TWShadowTokens {
  none: string;
  sm: string;
  /** Backs the bare `shadow` utility (Tailwind's `DEFAULT` key). */
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Theme metadata. Carries identity + active mode so the runtime store
 * can model "two themes swap" semantics symmetrically to the MUI side
 * (`@dashforge/tokens` `DashforgeThemeMeta`) — but **without** importing
 * from MUI tokens. The two ecosystems are deliberately isolated; this
 * interface is a parallel, independent definition.
 *
 * Architecture plan v2 (2026-05-15): isolamento totale tra MUI e TW.
 */
export interface TWThemeMeta {
  /** Human-readable theme name, e.g. "Dashforge TW Light". */
  name: string;
  /** Semver version of the theme definition (not the package). */
  version: string;
  /** Active mode. The two default themes shipped by this package have
   * `mode: 'light'` and `mode: 'dark'` respectively; a runtime store
   * swap (`setMode('dark')`) replaces the entire theme. */
  mode: 'light' | 'dark';
}

/**
 * Top-level Dashforge TW theme object.
 *
 * Concrete defaults exposed by `defaultTWThemeLight` / `defaultTWThemeDark`
 * in `defaults.ts` (`defaultTWTheme` is a back-compat alias for the light
 * default). Consumers extend/override via `@dashforge/tw-theme`
 * augmentation API (F2 deliverable: `setTheme`, `patchTheme`).
 */
export interface TWTheme {
  /** Identity + active mode. */
  meta: TWThemeMeta;
  color: TWColorTokens;
  spacing: TWSpacingScale;
  radius: TWRadiusTokens;
  fontSize: TWFontSizeTokens;
  shadow: TWShadowTokens;
}
