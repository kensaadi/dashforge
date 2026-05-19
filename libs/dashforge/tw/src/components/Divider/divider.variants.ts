import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `dividerVariants` — visual separator with two rendering modes (line-only
 * vs labeled). Two interconnected TV recipes:
 *
 *   • `dividerVariants`      — root container (block layout, alignment)
 *   • `dividerLineVariants`  — the actual line segments (border style,
 *                              color, orientation)
 *
 * Two recipes (not one with slots) because the labeled mode renders
 * THREE elements (left line · label · right line) while the line-only
 * mode is ONE element. Splitting keeps each TV catalogue small and
 * the type unions narrow.
 *
 * Mental model:
 *   • Without `children` → renders an `<hr>` (or a div if vertical)
 *     with the line styles applied directly.
 *   • With `children`    → renders a flex row with two `<span>` line
 *     segments either side of the label. The label's flex-shrink keeps
 *     it from being squashed; the line segments share the remaining
 *     space according to `align`.
 *
 * a11y: the root always carries `role="separator"` + `aria-orientation`
 * — handled in Divider.tsx, not in TV (it's a prop, not a class).
 */

/*
 * Root container — only relevant when label is present (flex layout).
 * For line-only, the root IS the line.
 */
export const dividerVariants = tv({
  base: 'flex items-center',

  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical:   'h-full flex-col',
    },

    /*
     * Label alignment along the divider's main axis. Implemented by
     * setting the flex-basis of the two line segments asymmetrically
     * — handled in the variants for `dividerLineVariants` below via
     * compound logic. The root just needs the flex layout.
     */
    align: {
      start:  '',
      center: '',
      end:    '',
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    align:       'center',
  },
});

export type DividerVariants = VariantProps<typeof dividerVariants>;

/*
 * Line segment(s).
 *
 * Border styles (solid/dashed/dotted) are applied as `border-t-{style}`
 * for horizontal, `border-l-{style}` for vertical. Color drives the
 * border-* color token to the intent.
 *
 * The `segment` axis distinguishes whether this is a line-only render
 * (full width) vs a labeled-mode segment (flex-1 grows to share space).
 */
export const dividerLineVariants = tv({
  base: '',

  variants: {
    orientation: {
      horizontal: 'h-0 border-t',
      vertical:   'w-0 border-l self-stretch',
    },

    variant: {
      solid:  'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },

    color: {
      // Neutral palette auto-inverts via CSS-var swap (no `dark:`).
      neutral:   'border-neutral-200',
      primary:   'border-primary-300 dark:border-primary-700',
      secondary: 'border-secondary-300 dark:border-secondary-700',
      success:   'border-success-300 dark:border-success-700',
      warning:   'border-warning-300 dark:border-warning-700',
      danger:    'border-danger-300 dark:border-danger-700',
      info:      'border-info-300 dark:border-info-700',
    },

    /*
     * `segment` controls whether the line spans full width (line-only
     * mode) or grows to fill space (labeled-mode flex segment).
     */
    segment: {
      full:  'w-full',
      grow:  'flex-1',
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    variant:     'solid',
    color:       'neutral',
    segment:     'full',
  },
});

export type DividerLineVariants = VariantProps<typeof dividerLineVariants>;
