import type { TWTheme } from '@dashforge/tw-tokens';

/**
 * CSS custom property identifiers allow `[a-zA-Z0-9-_]` only — dots
 * are NOT allowed, but Tailwind's native spacing token keys (`'0.5'`,
 * `'1.5'`) contain dots. Slugify the key by replacing `.` with `_`
 * so a token keyed `'0.5'` becomes the CSS variable
 * `--df-tw-spacing-0_5`. The `dashforgePreset()` applies the same
 * substitution when emitting `var(...)` references, so the round-trip
 * stays consistent.
 *
 * @internal
 */
export function slugifyCssVarKey(key: string): string {
  return key.replace(/\./g, '_');
}

/**
 * Convert a 6-digit hex color (`#3b82f6` or `3b82f6`) to a raw RGB
 * triplet (`"59 130 246"`). This format is required by Tailwind v3's
 * `<alpha-value>` pattern — the generated preset wraps each shade with
 * `rgb(var(--df-tw-color-...) / <alpha-value>)` so the modifier
 * notation (`bg-primary-500/50`) keeps working.
 *
 * Input must be a `#RRGGBB` hex (the only shape produced by the
 * `@dashforge/tw-tokens` defaults). Shorthand `#RGB` is **not**
 * supported — a token shaped that way is treated as a defect and the
 * function throws so the issue surfaces at first paint, not at runtime
 * inside Tailwind's class resolver.
 *
 * @example
 * ```ts
 * hexToRgbTriplet('#3b82f6') === '59 130 246';
 * hexToRgbTriplet('3b82f6')  === '59 130 246';
 * ```
 */
export function hexToRgbTriplet(hex: string): string {
  const stripped = hex.startsWith('#') ? hex.slice(1) : hex;
  if (stripped.length !== 6 || !/^[0-9a-f]{6}$/i.test(stripped)) {
    throw new Error(
      `[dashforge-tw-theme] hexToRgbTriplet: expected 6-digit hex (with or without leading "#"), received: ${JSON.stringify(hex)}`
    );
  }
  const r = parseInt(stripped.slice(0, 2), 16);
  const g = parseInt(stripped.slice(2, 4), 16);
  const b = parseInt(stripped.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Map a `TWTheme` to the flat `Record<cssVarName, value>` payload that
 * `DashforgeTailwindProvider` injects on `<html>` (`document.documentElement.style.setProperty`).
 *
 * Naming convention: every variable is prefixed `--df-tw-` to namespace
 * the TW ecosystem distinctly from the MUI side (which may inject
 * `--df-*` vars in a future iteration). Within the prefix, the path
 * mirrors the token shape — `--df-tw-color-{role}-{tone}`,
 * `--df-tw-spacing-{key}`, `--df-tw-radius-{key}`,
 * `--df-tw-fontSize-{key}`.
 *
 * Color shades emit the **raw RGB triplet** format ("59 130 246")
 * required by the preset's `rgb(var(--df-tw-color-primary-500) / <alpha-value>)`
 * wrapper. Non-color tokens (spacing, radius, fontSize) emit their
 * native CSS value as-is (rem, px, etc.).
 *
 * @example
 * ```ts
 * const vars = twThemeCssVars(defaultTWThemeLight);
 * vars['--df-tw-color-primary-500'] === '59 130 246';
 * vars['--df-tw-spacing-4']          === '1rem';
 * vars['--df-tw-radius-md']          === '0.375rem';
 * ```
 */
export function twThemeCssVars(theme: TWTheme): Record<string, string> {
  const out: Record<string, string> = {};

  // Colors → RGB triplets for alpha-value support
  for (const role of Object.keys(theme.color) as Array<keyof TWTheme['color']>) {
    const scale = theme.color[role];
    for (const tone of Object.keys(scale) as Array<keyof typeof scale>) {
      out[`--df-tw-color-${role}-${tone}`] = hexToRgbTriplet(scale[tone]);
    }
  }

  // Spacing / radius / fontSize → native CSS values. Token keys are
  // slugified (`.` → `_`) because dots are not valid in CSS custom
  // property identifiers — see `slugifyCssVarKey`.
  for (const [key, val] of Object.entries(theme.spacing)) {
    out[`--df-tw-spacing-${slugifyCssVarKey(key)}`] = val;
  }
  for (const [key, val] of Object.entries(theme.radius)) {
    out[`--df-tw-radius-${slugifyCssVarKey(key)}`] = val;
  }
  for (const [key, val] of Object.entries(theme.fontSize)) {
    out[`--df-tw-fontSize-${slugifyCssVarKey(key)}`] = val;
  }

  // Shadow → native CSS box-shadow value as-is (multi-layer rgba
  // strings). The `DEFAULT` key emits `--df-tw-shadow-DEFAULT`,
  // matching the preset's `mapKeysToCssVarRefs(theme.shadow, 'shadow')`.
  for (const [key, val] of Object.entries(theme.shadow)) {
    out[`--df-tw-shadow-${slugifyCssVarKey(key)}`] = val;
  }

  return out;
}
