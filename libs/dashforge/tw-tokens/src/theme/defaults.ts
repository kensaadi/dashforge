import type { TWTheme, TWColorScale, TWColorTokens } from './types.js';

/**
 * Tonal palette (Tailwind-shaped 50-950). Reused as-is across both
 * `defaultTWThemeLight` and `defaultTWThemeDark` for brand roles
 * (primary/secondary/success/warning/danger/info). The dark theme
 * only inverts `neutral` (surfaces + text), leaving brand hues
 * untouched — this is the simplest defensible default that lets the
 * "two themes swap" mechanism demonstrate end-to-end without
 * committing to brand-tone-shifting choices that belong to design
 * (deferred to a real design pass).
 */
const primaryScale: TWColorScale = {
  '50': '#eff6ff',
  '100': '#dbeafe',
  '200': '#bfdbfe',
  '300': '#93c5fd',
  '400': '#60a5fa',
  '500': '#3b82f6',
  '600': '#2563eb',
  '700': '#1d4ed8',
  '800': '#1e40af',
  '900': '#1e3a8a',
  '950': '#172554',
};

const secondaryScale: TWColorScale = {
  '50': '#f5f3ff',
  '100': '#ede9fe',
  '200': '#ddd6fe',
  '300': '#c4b5fd',
  '400': '#a78bfa',
  '500': '#8b5cf6',
  '600': '#7c3aed',
  '700': '#6d28d9',
  '800': '#5b21b6',
  '900': '#4c1d95',
  '950': '#2e1065',
};

const successScale: TWColorScale = {
  '50': '#f0fdf4',
  '100': '#dcfce7',
  '200': '#bbf7d0',
  '300': '#86efac',
  '400': '#4ade80',
  '500': '#22c55e',
  '600': '#16a34a',
  '700': '#15803d',
  '800': '#166534',
  '900': '#14532d',
  '950': '#052e16',
};

const warningScale: TWColorScale = {
  '50': '#fffbeb',
  '100': '#fef3c7',
  '200': '#fde68a',
  '300': '#fcd34d',
  '400': '#fbbf24',
  '500': '#f59e0b',
  '600': '#d97706',
  '700': '#b45309',
  '800': '#92400e',
  '900': '#78350f',
  '950': '#451a03',
};

const dangerScale: TWColorScale = {
  '50': '#fef2f2',
  '100': '#fee2e2',
  '200': '#fecaca',
  '300': '#fca5a5',
  '400': '#f87171',
  '500': '#ef4444',
  '600': '#dc2626',
  '700': '#b91c1c',
  '800': '#991b1b',
  '900': '#7f1d1d',
  '950': '#450a0a',
};

const infoScale: TWColorScale = {
  '50': '#ecfeff',
  '100': '#cffafe',
  '200': '#a5f3fc',
  '300': '#67e8f9',
  '400': '#22d3ee',
  '500': '#06b6d4',
  '600': '#0891b2',
  '700': '#0e7490',
  '800': '#155e75',
  '900': '#164e63',
  '950': '#083344',
};

/**
 * Light neutrals: bright surfaces (50 = near-white) to dark text (950).
 */
const neutralLightScale: TWColorScale = {
  '50': '#fafafa',
  '100': '#f5f5f5',
  '200': '#e5e5e5',
  '300': '#d4d4d4',
  '400': '#a3a3a3',
  '500': '#737373',
  '600': '#525252',
  '700': '#404040',
  '800': '#262626',
  '900': '#171717',
  '950': '#0a0a0a',
};

/**
 * Dark neutrals: dark surfaces (50 = near-black) to bright text (950).
 * Mirrored from `neutralLightScale` along the tonal axis so consumers
 * can write `bg-neutral-50` / `text-neutral-950` in component code and
 * have the semantics swap when the mode flips (surface vs foreground).
 */
const neutralDarkScale: TWColorScale = {
  '50': neutralLightScale['950'],
  '100': neutralLightScale['900'],
  '200': neutralLightScale['800'],
  '300': neutralLightScale['700'],
  '400': neutralLightScale['600'],
  '500': neutralLightScale['500'],
  '600': neutralLightScale['400'],
  '700': neutralLightScale['300'],
  '800': neutralLightScale['200'],
  '900': neutralLightScale['100'],
  '950': neutralLightScale['50'],
};

const lightColors: TWColorTokens = {
  primary: primaryScale,
  secondary: secondaryScale,
  success: successScale,
  warning: warningScale,
  danger: dangerScale,
  info: infoScale,
  neutral: neutralLightScale,
};

const darkColors: TWColorTokens = {
  primary: primaryScale,
  secondary: secondaryScale,
  success: successScale,
  warning: warningScale,
  danger: dangerScale,
  info: infoScale,
  neutral: neutralDarkScale,
};

const sharedSpacing = {
  '0': '0rem',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
  '16': '4rem',
  '24': '6rem',
};

const sharedRadius = {
  none: '0rem',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

const sharedFontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

/**
 * Default Dashforge TW theme — **light mode**. Provides a Tailwind-shaped
 * palette + spacing/radius/fontSize defaults. F2 placeholder values; design
 * pass will refine the brand hues.
 */
export const defaultTWThemeLight: TWTheme = {
  meta: {
    name: 'Dashforge TW Light',
    version: '0.0.1',
    mode: 'light',
  },
  color: lightColors,
  spacing: sharedSpacing,
  radius: sharedRadius,
  fontSize: sharedFontSize,
};

/**
 * Default Dashforge TW theme — **dark mode**. Shares brand palettes
 * with the light default; only `color.neutral` is inverted along the
 * tonal axis so `bg-neutral-50` always means "page surface" and
 * `text-neutral-950` always means "primary text", regardless of mode.
 *
 * Consumers using the "two themes swap" runtime (`setMode('dark')`)
 * receive this whole object — see `@dashforge/tw-theme` store actions.
 */
export const defaultTWThemeDark: TWTheme = {
  meta: {
    name: 'Dashforge TW Dark',
    version: '0.0.1',
    mode: 'dark',
  },
  color: darkColors,
  spacing: sharedSpacing,
  radius: sharedRadius,
  fontSize: sharedFontSize,
};

/**
 * Back-compat alias — equals `defaultTWThemeLight`. Kept so F1 callers
 * (`dashforgePreset()` default arg, `DashforgeTailwindProvider` `theme`
 * fallback) continue to compile. New code should prefer the explicit
 * `defaultTWThemeLight` / `defaultTWThemeDark` exports.
 */
export const defaultTWTheme: TWTheme = defaultTWThemeLight;
