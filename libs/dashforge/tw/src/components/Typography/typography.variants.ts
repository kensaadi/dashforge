import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `typographyVariants` — the full type scale for the @dashforge/tw library.
 *
 * Mirrors the MUI Typography variant set (h1–h6 · subtitle1/2 · body1/2 ·
 * caption · overline) so the mental model carries over for developers
 * moving between the two ecosystems. Each variant baseline maps to a
 * Tailwind utility chain that resolves through the @dashforge/tw-tokens
 * scale (so the visual stays in sync with the rest of the system when the
 * token theme is patched).
 *
 * Variant axes are intentionally ORTHOGONAL — `variant` chooses the type
 * scale, `weight` overrides the variant's default weight (useful for "h2
 * but lighter"), `color` picks the intent, `align` picks the axis. They
 * never collide, so consumers can mix them freely.
 *
 * Two boolean flags (`truncate`, `noWrap`) encode the most common one-line
 * patterns; `gutterBottom` adds the conventional bottom margin used when a
 * heading precedes a paragraph block (mirror of MUI's same flag).
 */
export const typographyVariants = tv({
  base: 'text-inherit',

  variants: {
    /*
     * `variant` is the type-scale axis.
     *
     * The default font-weight is baked into each variant (headings come
     * with semibold/bold by default). Consumers override per-instance via
     * the `weight` axis below — when set, `weight` wins because it's
     * declared later in the cn() chain and tailwind-merge resolves the
     * last `font-*` to win.
     */
    variant: {
      h1:        'text-5xl font-bold leading-[1.05] tracking-[-0.025em]',
      h2:        'text-4xl font-bold leading-[1.1] tracking-[-0.022em]',
      h3:        'text-3xl font-semibold leading-[1.15] tracking-[-0.02em]',
      h4:        'text-2xl font-semibold leading-snug tracking-[-0.015em]',
      h5:        'text-xl font-semibold leading-snug',
      h6:        'text-lg font-semibold leading-normal',
      subtitle1: 'text-base font-medium leading-relaxed',
      subtitle2: 'text-sm font-medium leading-relaxed',
      body1:     'text-base font-normal leading-relaxed',
      body2:     'text-sm font-normal leading-relaxed',
      caption:   'text-xs font-normal leading-normal',
      overline:  'text-xs font-semibold uppercase tracking-[0.12em] leading-normal',
    },

    /*
     * `color` is the intent axis. Pairs with the @dashforge/tw-theme
     * reactive colour vars so the choice survives theme patches and dark
     * mode flips. `inherit` is the escape hatch — used inside a Box that
     * has set its own color (e.g. `<Box variant="solid" color="primary">`
     * paints white text).
     */
    color: {
      inherit:   'text-inherit',
      primary:   'text-primary-700 dark:text-primary-400',
      secondary: 'text-secondary-700 dark:text-secondary-400',
      success:   'text-success-700 dark:text-success-400',
      warning:   'text-warning-700 dark:text-warning-400',
      danger:    'text-danger-700 dark:text-danger-400',
      info:      'text-info-700 dark:text-info-400',
      neutral:   'text-neutral-900 dark:text-neutral-100',
      muted:     'text-neutral-600 dark:text-neutral-400',
    },

    /*
     * `weight` overrides the variant's default weight. When unset, the
     * variant's own weight wins. When set, this axis appears LATER in the
     * cn() chain so tailwind-merge resolves to this value.
     */
    weight: {
      normal:    'font-normal',
      medium:    'font-medium',
      semibold:  'font-semibold',
      bold:      'font-bold',
      extrabold: 'font-extrabold',
    },

    align: {
      left:    'text-left',
      center:  'text-center',
      right:   'text-right',
      justify: 'text-justify',
    },

    /*
     * `truncate` collapses to a one-line ellipsis. `noWrap` is the looser
     * sibling — keeps the text on one line but lets it overflow without
     * the `…`. Mutually-exclusive intent-wise; if both are passed,
     * `truncate` wins (later in the cn() chain).
     */
    truncate: { true: 'truncate' },
    noWrap:   { true: 'whitespace-nowrap' },

    /*
     * `gutterBottom` adds the conventional bottom margin used when a
     * heading precedes a paragraph block. Mirror of MUI's same prop —
     * familiar to developers crossing from the MUI side.
     */
    gutterBottom: { true: 'mb-3' },
  },

  defaultVariants: {
    variant: 'body1',
    color:   'inherit',
    align:   'left',
  },
});

export type TypographyVariants = VariantProps<typeof typographyVariants>;
