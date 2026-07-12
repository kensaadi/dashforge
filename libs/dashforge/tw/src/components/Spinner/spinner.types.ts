import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';

/**
 * Size scale — maps to spacing tokens (w/h) and matching stroke
 * width in the variants recipe.
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Intent color. When omitted, the spinner inherits the parent's
 * text color via `currentColor` — the right default for nested
 * usage (inside Button, Alert, Card, etc.).
 */
export type SpinnerColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** Stroke thickness — 3 steps mapped to SVG stroke-width. */
export type SpinnerThickness = 'thin' | 'md' | 'thick';

/**
 * Props for `<Spinner>` — rotating-arc loading indicator.
 *
 * A11y: the spinner renders with `role="status"` + `aria-live="polite"`
 * + a visually-hidden text label (default `'Loading'`). Screen readers
 * announce the label politely (queued, doesn't interrupt) when the
 * spinner mounts.
 *
 * Performance: SVG `animate-spin` (Tailwind built-in) — pure CSS,
 * GPU-accelerated, motion-reduce-safe (skips animation entirely
 * under `prefers-reduced-motion`).
 */
export interface SpinnerProps {
  // ─── Visual ────────────────────────────────────────────────────
  /**
   * Diameter tier — xs:12px, sm:16px, md:20px, lg:24px, xl:32px.
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Intent color. **When omitted, inherits parent's text color via
   * `currentColor`** — works seamlessly inside Button, Alert, Card,
   * or any colored container without configuration. Pass explicitly
   * for standalone usage on neutral surfaces.
   */
  color?: SpinnerColor;

  /**
   * SVG stroke-width — thin:1.5, md:2.25, thick:3.
   * @default 'md'
   */
  thickness?: SpinnerThickness;

  /**
   * Renders a faint "ghost ring" behind the spinning arc (20%
   * opacity of `currentColor`). Improves contrast on busy or dark
   * backgrounds, reads as more "premium" on slow operations.
   *
   * Visually: WITHOUT track you see a rotating partial arc (3/4
   * circle missing in any frame). WITH track you see the full
   * circle (low-opacity) AND the arc on top. The track stays put
   * while the arc rotates.
   *
   * @default false
   */
  withTrack?: boolean;

  // ─── A11y ──────────────────────────────────────────────────────
  /**
   * Accessible label announced by screen readers via
   * `role="status"` + `aria-live="polite"`. Rendered as a visually-
   * hidden `<span>` inside the spinner.
   * @default 'Loading'
   */
  label?: string;

  /**
   * Wait N milliseconds before rendering — prevents a flash of the
   * spinner on quick operations (Atlassian-style anti-flash). The
   * spinner mounts as `null` for the first N ms, then swaps to the
   * actual SVG. Pairs naturally with `visibleWhen`.
   *
   * Common pattern:
   * ```tsx
   * <Spinner
   *   visibleWhen={(e) => e.isSubmitting()}
   *   delay={150}
   * />
   * // Spinner appears only when isSubmitting AND that has been
   * // true for 150ms — quick submits never flash.
   * ```
   *
   * @default 0
   */
  delay?: number;

  // ─── Bridge ────────────────────────────────────────────────────
  /**
   * Reactive visibility predicate — same contract as Alert/Chip/
   * Button/etc. Spinner is intrinsically conditional (loading IS a
   * state), so this fits naturally even though the component is
   * otherwise display-only.
   */
  visibleWhen?: (engine: Engine) => boolean;

  // No `access` — loading state is not permission-driven by
  // category. For permission-gated spinners, wrap in `<Box access>`.

  // ─── Override ──────────────────────────────────────────────────
  /** Standard React `className` — appended to the root via `cn()`. */
  className?: string;

  /** Root-element class shortcut (string or clsx-compatible value). Wins over variant classes via `tailwind-merge`. */
  sx?: ClassValue;
}

/**
 * Subset of `<Spinner>` props theme-configurable via
 * `theme.components.Spinner.defaults` (Option C).
 */
export type SpinnerVariantProps = Pick<
  SpinnerProps,
  'size' | 'color' | 'thickness' | 'withTrack'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Spinner?: {
      defaults?: Partial<SpinnerVariantProps>;
    };
  }
}
