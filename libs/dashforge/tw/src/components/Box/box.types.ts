import type { ElementType, HTMLAttributes } from 'react';
import type { BoxVariants } from './box.variants.js';

/**
 * Props for `<Box>` — the surface primitive.
 *
 * What lives in props (typed, ergonomic):
 *   • Surface          — variant, color, elevation, rounded
 *   • Spacing          — p, px, py, m, mx, my (token-scale steps)
 *   • Sizing           — fullWidth, fullHeight
 *   • Polymorphism     — as, asChild
 *   • Override escape  — sx (utility string, merged via tailwind-merge)
 *
 * What does NOT live here (deliberate, see Box.tsx header):
 *   • display / flex / grid / gap   → use Stack or Grid
 *   • position / top / z-index      → use sx
 *   • overflow / cursor             → use sx
 *   • animation / transition        → use sx
 *
 * Native attribute overrides:
 *   • `className` is omitted in favour of `sx` (string of utilities,
 *     resolved by tailwind-merge so consumer wins over variant defaults)
 *     — same convention as Button/TextField/Checkbox/Switch.
 *   • `color` is omitted: collides with the deprecated HTML4 `color`
 *     attribute. Our typed `color` (intent) is the right one.
 */
export interface BoxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'color'>,
          Pick<BoxVariants,
            'variant' | 'color' | 'elevation' | 'rounded'
            | 'p' | 'px' | 'py' | 'm' | 'mx' | 'my'
            | 'fullWidth' | 'fullHeight'> {
  /**
   * Override the rendered HTML tag. Defaults to `'div'`. Useful when
   * the surface should also carry semantic meaning — `<Box as="section">`
   * for a page section, `<Box as="article">` for a card-shaped article.
   *
   * Ignored when `asChild` is true.
   */
  as?: ElementType;

  /**
   * Render via Radix `Slot` — the Box styles paint onto the single
   * React child instead of wrapping it in our own element. Useful for
   * `<Box asChild><Link>...</Link></Box>` to get a styled router link
   * with no extra DOM wrapper.
   *
   * Mutually exclusive with `as` (when both are passed, `asChild` wins
   * — see Box.tsx for the reasoning).
   */
  asChild?: boolean;

  /**
   * Utility classes appended to the variant chain. Resolved via
   * `tailwind-merge` so the consumer's classes always win over the
   * variant defaults. Use for one-off overrides AND for utility
   * dimensions Box deliberately doesn't expose as props (overflow,
   * position, animation, etc.).
   */
  sx?: string;
}
