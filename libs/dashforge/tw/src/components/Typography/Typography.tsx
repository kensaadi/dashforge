import { forwardRef, type ElementType, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn.js';
import { typographyVariants } from './typography.variants.js';
import type { TypographyProps } from './typography.types.js';

/**
 * Default HTML tag per variant. Headings get their semantic level (h1→h1
 * etc.); subtitle/body get `<p>` (block, paragraph semantics);
 * caption/overline get `<span>` (inline, no implicit block break).
 *
 * Override per-instance via the `as` prop — useful when the semantic
 * heading level should differ from the visual scale (e.g. a hero
 * rendered as `<h2>` but visually styled `h1`).
 */
const VARIANT_TO_TAG: Record<NonNullable<TypographyProps['variant']>, ElementType> = {
  h1:        'h1',
  h2:        'h2',
  h3:        'h3',
  h4:        'h4',
  h5:        'h5',
  h6:        'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1:     'p',
  body2:     'p',
  caption:   'span',
  overline:  'span',
};

/**
 * `<Typography>` — semantic typed text, the foundation of every readable
 * surface in @dashforge/tw.
 *
 * Why this exists:
 *   Tailwind ships a typographic scale (`text-xl`, `font-bold`,
 *   `leading-relaxed`) but leaves the SEMANTIC HTML tag and the
 *   intent-coloured palette to the consumer. That's fine for one-off
 *   marketing surfaces, but at app scale it means every `<h2>` and every
 *   body paragraph re-derives its own utility chain — and they drift.
 *
 *   Typography moves that decision into a typed prop set: the visual
 *   scale, the intent colour, the alignment, the truncation all live in
 *   `tailwind-variants` and resolve to the same utility chain everywhere
 *   in the app. The default HTML tag is inferred from `variant` so the
 *   semantic layer follows the visual layer; `as` and `asChild` are the
 *   two escape hatches when you need something else.
 *
 * Layering:
 *   • Sits BENEATH every component that renders text — `<Button>`'s
 *     label, `<TextField>`'s helper text, MDX prose in our own docs.
 *   • Composes ON TOP of `@dashforge/tw-tokens` colour scales (so
 *     `color="primary"` paints `text-primary-700` in light, `-400` in dark,
 *     reactive to `setMode()`).
 *   • Polymorphic via Radix Slot — pairs cleanly with router `<Link>`,
 *     `<button>`, or `<a>` without injecting an extra wrapper element.
 *
 * Polymorphism rules — `as` vs `asChild`:
 *   • `as` swaps the rendered tag (we still render the element ourselves).
 *   • `asChild` removes our element entirely — the single React child
 *     becomes the rendered tag, with our className/ref merged onto it.
 *     This is the Radix Slot pattern; use when you need a router Link
 *     to style as a heading.
 *   When BOTH are passed, `asChild` wins. We considered making this a
 *   compile-time error via discriminated unions, but the API surface
 *   already has 8 axes and adding one more dimension to the props type
 *   would inflate IntelliSense suggestions for marginal benefit. The
 *   runtime preference is documented; the test asserts it.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function Typography(props, ref) {
    const {
      variant = 'body1',
      color,
      weight,
      align,
      truncate,
      noWrap,
      gutterBottom,
      as,
      asChild = false,
      sx,
      children,
      ...rest
    } = props;

    const classes = cn(
      typographyVariants({ variant, color, weight, align, truncate, noWrap, gutterBottom }),
      sx,
    );

    // asChild wins over `as` when both are passed (see component header).
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...rest}>
          {children as ReactElement}
        </Slot>
      );
    }

    // Resolve the rendered tag: explicit `as` > variant default > fallback.
    const Tag = (as ?? VARIANT_TO_TAG[variant] ?? 'span') as ElementType;

    return (
      <Tag ref={ref as never} className={classes} {...rest}>
        {children}
      </Tag>
    );
  },
);

Typography.displayName = 'Typography';
