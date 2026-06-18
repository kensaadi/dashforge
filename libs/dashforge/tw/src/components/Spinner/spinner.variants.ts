import { tv, type VariantProps } from 'tailwind-variants';
import type { SpinnerColor } from './spinner.types.js';

/**
 * Tailwind-variants recipe for `<Spinner>`.
 *
 * Axes:
 *   - `size`      — 5 steps (xs/sm/md/lg/xl) → w/h spacing tokens
 *   - `thickness` — 3 steps (thin/md/thick) → SVG stroke-width
 *   - `color`     — 7 intents (or omitted → `currentColor`)
 *
 * The stroke + fill of the SVG paths are governed by
 * `stroke="currentColor"` (set inline in Spinner.tsx), so the root
 * `text-*` class drives the color. When `color` is omitted, no
 * `text-*` class is emitted at all — `currentColor` resolves to
 * whatever the parent's text color is.
 */
export const spinnerVariants = tv({
  base: 'inline-block animate-spin motion-reduce:animate-none',
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
    /**
     * Color → text-{color}-600 (mid-tone, readable on most surfaces).
     * Note: text-{color}-600 acts on currentColor inside the SVG via
     * `stroke="currentColor"`. Neutral uses `text-neutral-600` which
     * auto-inverts via the dashforgePreset CSS-var swap (no `dark:`
     * needed). Color rows do NOT carry `dark:` either — the chosen
     * 600 step works in both modes for the spinner's specific use
     * (small element, brief visibility).
     */
    color: {
      neutral: 'text-neutral-600',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      info: 'text-info-600',
    },
  },
  defaultVariants: {
    size: 'md',
    // No default `color` — when omitted, the spinner inherits via
    // `currentColor`, which is the right default for nested use.
  },
});

export type SpinnerVariants = VariantProps<typeof spinnerVariants>;

/**
 * SVG stroke-width per thickness step. Picked to read well at every
 * size — thin (1.5px) is the minimum readable; thick (3px) saturates
 * the available radius at sizes xs/sm.
 */
export const SPINNER_STROKE_WIDTH: Record<'thin' | 'md' | 'thick', number> = {
  thin: 1.5,
  md: 2.25,
  thick: 3,
};

/**
 * The track ring renders at this opacity of `currentColor`. 0.2 is
 * the sweet spot — visible enough to anchor the eye, faint enough
 * to read as background.
 */
export const SPINNER_TRACK_OPACITY = 0.2;

/** Re-export the color name list so playground demos can iterate. */
export const SPINNER_COLORS: SpinnerColor[] = [
  'neutral',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
];
