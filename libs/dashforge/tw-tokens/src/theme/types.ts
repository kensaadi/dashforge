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
 * Top-level Dashforge TW theme object.
 *
 * Concrete defaults exposed by `defaultTWTheme` in `defaults.ts`.
 * Consumers extend/override via `@dashforge/tw-theme` augmentation API
 * (F2 deliverable).
 */
export interface TWTheme {
  color: TWColorTokens;
  spacing: TWSpacingScale;
  radius: TWRadiusTokens;
  fontSize: TWFontSizeTokens;
}
