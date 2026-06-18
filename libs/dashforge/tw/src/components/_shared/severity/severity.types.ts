/**
 * Shared severity types — consumed by every component that surfaces
 * a "semantic visual tone" (Alert, Snackbar, Banner, Badge, Chip when
 * acting as a status indicator, …).
 *
 * **Naming choice**: we follow MUI's `severity` taxonomy
 * (`info / success / warning / danger`) and `variant` taxonomy
 * (`standard / filled / outlined`) so consumers porting from MUI keep
 * their muscle memory. The single Dashforge-specific divergence is
 * `danger` (not MUI's `error`) — chosen to match the `danger.*` token
 * palette in `@dashforge/tw-tokens`. Semantically identical to MUI's
 * `error`; documented in the migration guide.
 *
 * @module @dashforge/tw/_shared/severity
 */

/**
 * Visual severity — drives the color treatment of a component.
 * `danger` instead of `error` for token-palette alignment.
 */
export type Severity = 'info' | 'success' | 'warning' | 'danger';

/**
 * Variant of the severity surface. Mirrors MUI's `Alert` variant axis
 * 1:1 so the migration story is trivial.
 *
 * - `standard` (default) — tinted soft background with severity-toned
 *   text. The "all-purpose" reading. Most modern design systems call
 *   this "soft".
 * - `filled` — solid severity background with light text. Strong
 *   visual weight, for high-priority callouts.
 * - `outlined` — transparent background with severity border and
 *   severity-toned text. Minimal weight, for dense layouts.
 */
export type SeverityVariant = 'standard' | 'filled' | 'outlined';

/**
 * Per-slot Tailwind class strings emitted by the severity matrix for
 * one (variant, severity) pair. Resolved through `dashforgePreset()`
 * to CSS variables → patch-theme friendly.
 */
export interface SeverityClasses {
  /** `<root>` surface: background + text + border base. */
  surface: string;
  /** Border overrides (kept separate from `surface` so components can
   *  swap `border-2` etc. without losing the color). */
  border: string;
  /** Icon container color (uses `currentColor` on the inner SVG). */
  icon: string;
}
