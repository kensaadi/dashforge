import type { ElementType, HTMLAttributes } from 'react';
import type { TypographyVariants } from './typography.variants.js';

/**
 * Props for `<Typography>`.
 *
 * Composition with native `HTMLAttributes`:
 *   • `className` is omitted in favour of `sx` (string of utility classes)
 *     — same convention as Button/TextField/Checkbox/Switch in this
 *     package. `sx` is merged via `tailwind-merge`, so the consumer's
 *     classes always win over variant defaults.
 *   • `color` is omitted because the native HTML attribute (the
 *     deprecated `color="red"` from HTML4) collides with our intent
 *     prop — TypeScript would otherwise widen to a confusing union.
 *
 * Variant axes picked from `TypographyVariants`:
 *   • `variant`  — the type scale (h1–h6, subtitle1/2, body1/2, caption, overline)
 *   • `color`    — the intent (primary, secondary, success, warning, danger, info, neutral, muted, inherit)
 *   • `weight`   — overrides the variant's default font-weight
 *   • `align`    — text-align
 *   • `truncate` — one-line ellipsis
 *   • `noWrap`   — one-line without ellipsis
 *   • `gutterBottom` — adds mb-3 (mirror of MUI's same prop)
 *
 * Polymorphism:
 *   • `as` — override the HTML tag while keeping the variant's visual
 *            style (e.g. `<Typography variant="h1" as="h2">` renders an
 *            `<h2>` styled like h1 — useful when the semantic heading
 *            level matters more than the type scale).
 *   • `asChild` — render as the single child element via Radix Slot
 *            (so the styles paint onto a `<Link>`, `<a>`, etc.).
 *            Mutually exclusive with `as` — see component header for
 *            the rationale.
 */
export interface TypographyProps
  extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'color'>,
          Pick<TypographyVariants, 'variant' | 'color' | 'weight' | 'align' | 'truncate' | 'noWrap' | 'gutterBottom'> {
  /**
   * Override the HTML tag. Defaults to a sensible mapping per variant
   * (h1→h1, …, body1→p, caption→span, overline→span). Use when the
   * semantic heading level should differ from the visual scale —
   * e.g. a "hero" rendered as an `<h2>` but styled like `h1`.
   *
   * Ignored when `asChild` is true.
   */
  as?: ElementType;

  /**
   * Render via Radix `Slot` — the Typography styles paint onto the
   * single React child instead of wrapping it in our own tag. Useful
   * for `<Typography asChild><Link>...</Link></Typography>` to get a
   * styled router link with no extra DOM.
   *
   * Mutually exclusive with `as` (when both are passed, `asChild` wins
   * and `as` is ignored — see Typography.tsx for the reason).
   */
  asChild?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge` so the consumer's classes always win over the
   * variant defaults — e.g. `sx="text-pink-500"` overrides `color="primary"`.
   */
  sx?: string;
}
