import type {
  TWTheme,
  TWColorScale,
  TWColorTokens,
  TWSpacingScale,
  TWRadiusTokens,
  TWFontSizeTokens,
  TWShadowTokens,
} from '@dashforge/tw-tokens';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { slugifyCssVarKey } from '../runtime/cssVars.js';

/**
 * Result shape returned by `dashforgePreset()`. Loose-typed by design —
 * a strict `Partial<tailwindcss.Config>` import would force consumers
 * to install `tailwindcss` even when only the type is desired. The
 * preset object is structurally compatible with Tailwind's preset
 * loader regardless of this typing.
 */
export interface DashforgePresetResult {
  theme: {
    extend: {
      colors: TWColorTokens;
      spacing: TWSpacingScale;
      borderRadius: TWRadiusTokens;
      fontSize: TWFontSizeTokens;
      boxShadow: TWShadowTokens;
    };
  };
  darkMode: [string, string];
  /**
   * Base-layer plugin(s). Tailwind accepts a bare `({ addBase }) =>
   * void` function in `plugins` — no `tailwindcss/plugin` import
   * needed. The preset ships exactly one: it anchors the document
   * `body` to the auto-inverting neutral surface (see
   * `dashforgeBasePlugin`).
   */
  plugins: Array<(api: { addBase: (styles: Record<string, Record<string, string>>) => void }) => void>;
}

/**
 * Build a `TWColorScale`-shaped map where every shade points at a CSS
 * variable formatted for Tailwind's `<alpha-value>` modifier system.
 *
 * The OUTPUT preserves the shape of the input token tree so Tailwind
 * generates classes like `bg-primary-500`, `text-neutral-50`,
 * `border-warning-700/40`, etc. The VALUES are CSS-var references —
 * runtime resolution comes from `DashforgeTailwindProvider` (or
 * `serverSideStyleTag` during SSR).
 *
 * Two-step cast (`as unknown as TWColorScale`) is intentional: the
 * function builds a plain `Record<string, string>` for ergonomic
 * iteration, then projects it back to the strict-keyed interface. The
 * runtime guarantee is that `Object.keys(scale)` produces exactly the
 * `'50' | '100' | ... | '950'` keys (defaults verified by
 * `defaults.spec.ts`).
 *
 * @internal
 */
function colorScaleToCssVarRefs(role: string, scale: TWColorScale): TWColorScale {
  const out: Record<string, string> = {};
  for (const tone of Object.keys(scale)) {
    out[tone] = `rgb(var(--df-tw-color-${role}-${tone}) / <alpha-value>)`;
  }
  return out as unknown as TWColorScale;
}

function buildColorRefs(template: TWColorTokens): TWColorTokens {
  return {
    primary: colorScaleToCssVarRefs('primary', template.primary),
    secondary: colorScaleToCssVarRefs('secondary', template.secondary),
    success: colorScaleToCssVarRefs('success', template.success),
    warning: colorScaleToCssVarRefs('warning', template.warning),
    danger: colorScaleToCssVarRefs('danger', template.danger),
    info: colorScaleToCssVarRefs('info', template.info),
    neutral: colorScaleToCssVarRefs('neutral', template.neutral),
  };
}

/**
 * Generic over the strict-keyed token interfaces (`TWSpacingScale`,
 * `TWRadiusTokens`, `TWFontSizeTokens`). The two-step `as unknown as T`
 * cast lets us return a `Record`-built object as the strict-keyed
 * interface — same runtime, strict typing for callers.
 *
 * @internal
 */
function mapKeysToCssVarRefs<T>(
  keys: T,
  group: 'spacing' | 'radius' | 'fontSize' | 'shadow'
): T {
  const out: Record<string, string> = {};
  for (const key of Object.keys(keys as Record<string, unknown>)) {
    // OUTPUT key preserves the original token name (so Tailwind
    // still generates classes like `p-0.5`), but the CSS-var REFERENCE
    // uses the slugified form (`--df-tw-spacing-0_5`) — matches the
    // names emitted by `twThemeCssVars`.
    out[key] = `var(--df-tw-${group}-${slugifyCssVarKey(key)})`;
  }
  return out as unknown as T;
}

/**
 * Generate a Tailwind preset whose token values are **CSS variable
 * references**, not the raw token literals. The actual triplets / rem
 * values are injected at runtime by `DashforgeTailwindProvider` (or by
 * `serverSideStyleTag` during SSR).
 *
 * Why CSS vars instead of literal values:
 *
 * - **Runtime theme swap without rebuilding Tailwind.** Calling
 *   `setMode('dark')` or `patchTheme({ color: { primary: ... } })`
 *   mutates the injected CSS vars; the same compiled Tailwind
 *   stylesheet picks up the new values immediately. With literal
 *   values you'd need a second Tailwind build per theme.
 *
 * - **`<alpha-value>` support.** Colors are wrapped as
 *   `rgb(var(--df-tw-color-primary-500) / <alpha-value>)`, so the
 *   modifier syntax (`bg-primary-500/50`, `text-danger-700/30`)
 *   keeps working.
 *
 * The `theme` argument is used **only** to determine which token KEYS
 * exist in the output preset (so Tailwind generates the right class
 * names). The token VALUES are ignored — they always resolve to CSS
 * var refs. Pass a theme with a different keyspace (e.g. extra color
 * roles) and the preset will mirror it.
 *
 * @param theme - Template theme. Defaults to `defaultTWThemeLight` —
 *   keys mirror the default Dashforge TW shape.
 * @returns A preset spreadable into a Tailwind config's `presets`
 *   array.
 *
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { dashforgePreset } from '@dashforge/tw-theme';
 *
 * export default {
 *   presets: [dashforgePreset()],
 *   content: [
 *     './src/**\/*.{ts,tsx}',
 *     './node_modules/@dashforge/tw/dist/**\/*.js',
 *   ],
 * };
 * ```
 */
/**
 * Base-layer plugin — anchors the document `body` to the Dashforge
 * neutral surface.
 *
 * Why this is part of the preset (not left to the consumer):
 *
 * `<Typography>` (and any bare text) defaults to `color: inherit`.
 * Without a Dashforge-controlled base color, default text inherits
 * whatever the consuming app put on `:root` / `body` — and a typical
 * app drives that off the OS `prefers-color-scheme`, NOT off the
 * Dashforge `data-dash-tw-theme` mode. The two signals diverge:
 * explicitly-coloured text (`<Typography color="neutral">` →
 * `text-neutral-900`) follows the Dashforge mode via the CSS-var
 * swap, while default text follows the OS — so the two never match.
 *
 * Anchoring `body` to `--df-tw-color-neutral-900` (text) +
 * `--df-tw-color-neutral-50` (surface) means default text inherits
 * the auto-inverting Dashforge neutral, and light/dark follow the
 * Dashforge mode in lockstep with every component. This IS the
 * Dashforge surface identity — see
 * `feedback_dashforge_preset_is_identity`.
 *
 * `body` (not `:root`) is deliberate: a direct `body { color }`
 * rule beats a consumer's inherited `:root { color }` regardless of
 * stylesheet source order.
 *
 * @internal
 */
function dashforgeBasePlugin(api: {
  addBase: (styles: Record<string, Record<string, string>>) => void;
}): void {
  api.addBase({
    body: {
      color: 'rgb(var(--df-tw-color-neutral-900))',
      backgroundColor: 'rgb(var(--df-tw-color-neutral-50))',
    },
  });
}

export function dashforgePreset(theme: TWTheme = defaultTWThemeLight): DashforgePresetResult {
  return {
    theme: {
      extend: {
        colors: buildColorRefs(theme.color),
        spacing: mapKeysToCssVarRefs(theme.spacing, 'spacing'),
        borderRadius: mapKeysToCssVarRefs(theme.radius, 'radius'),
        fontSize: mapKeysToCssVarRefs(theme.fontSize, 'fontSize'),
        // `boxShadow` extend MERGES with Tailwind's built-in scale —
        // the keys we declare (none/sm/DEFAULT/md/lg/xl/2xl) resolve
        // to CSS-var refs, any others fall back to Tailwind defaults.
        boxShadow: mapKeysToCssVarRefs(theme.shadow, 'shadow'),
      },
    },
    // Dashforge dark-mode toggle attribute. The runtime provider
    // (`DashforgeTailwindProvider`) sets `data-dash-tw-theme` on
    // `<html>` whenever the store's `meta.mode` changes.
    darkMode: ['selector', '[data-dash-tw-theme="dark"]'],
    // Base-layer anchor for the neutral surface (see plugin doc).
    plugins: [dashforgeBasePlugin],
  };
}
