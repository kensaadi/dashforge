import type { TWTheme, TWColorTokens, TWSpacingScale, TWRadiusTokens, TWFontSizeTokens } from '@dashforge/tw-tokens';
import { defaultTWTheme } from '@dashforge/tw-tokens';

/**
 * Tailwind preset object shape (loose typing for F1 — full
 * `Partial<TailwindConfig>` typing arrives with the F2 theme adapter
 * implementation, once tailwindcss is wired as a peer dependency).
 *
 * The `theme.extend.*` fields preserve the strongly-typed TW token
 * shapes so consumers writing `dashforgePreset(customTheme)` keep
 * type-safety on the token names. Tailwind's runtime accepts these
 * shapes structurally without an explicit index signature.
 */
export interface DashforgePresetResult {
  theme: {
    extend: {
      colors: TWColorTokens;
      spacing: TWSpacingScale;
      borderRadius: TWRadiusTokens;
      fontSize: TWFontSizeTokens;
    };
  };
  darkMode: [string, string];
}

/**
 * Generate a Tailwind preset from a Dashforge TW theme.
 *
 * F1 placeholder — emits a passthrough preset that maps token values to
 * the `theme.extend.*` keys Tailwind expects. F2 will replace direct
 * value maps with CSS variable references (`var(--df-tw-color-primary-500)`)
 * so the runtime provider can swap themes without rebuilding CSS.
 *
 * @param theme - Dashforge TW theme. Defaults to `defaultTWTheme` from
 *   `@dashforge/tw-tokens`.
 * @returns Object spreadable into a consumer `tailwind.config.ts` via
 *   `presets: [dashforgePreset()]`.
 *
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { dashforgePreset } from '@dashforge/tw-theme';
 *
 * export default {
 *   presets: [dashforgePreset()],
 *   content: ['./src/**\/*.{ts,tsx}'],
 * };
 * ```
 */
export function dashforgePreset(theme: TWTheme = defaultTWTheme): DashforgePresetResult {
  return {
    theme: {
      extend: {
        colors: theme.color,
        spacing: theme.spacing,
        borderRadius: theme.radius,
        fontSize: theme.fontSize,
      },
    },
    // Dashforge dark-mode toggle attribute. F2 wires this to the runtime
    // theme store; consumers can toggle by setting `data-dash-tw-theme="dark"`
    // on the root element.
    darkMode: ['selector', '[data-dash-tw-theme="dark"]'],
  };
}
