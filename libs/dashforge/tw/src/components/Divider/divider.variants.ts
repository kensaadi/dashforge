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
 * (spans its own main axis) vs a labeled-mode segment (flex-1 grows to
 * share space).
 *
 * `full` means "span the divider's OWN main axis", which is the width
 * for a horizontal rule and the HEIGHT for a vertical one. It is
 * therefore orientation-dependent and lives in `compoundVariants`, not
 * on the plain axis. See README-BUG § BUG 25: an unconditional
 * `w-full` here fought the `w-0` from the orientation axis, tailwind-
 * merge kept the later `w-full`, and every vertical line-only divider
 * came out as a full-width bar with a left border.
 */
export const dividerLineVariants = tv({
  base: '',

  variants: {
    orientation: {
      horizontal: 'h-0 border-t',
      /*
       * `w-0` does double duty and must NOT be dropped:
       *   - in a `flex-row` parent it is the main-axis size, so the
       *     visible width is exactly the 1px `border-l`;
       *   - in a `flex-col` parent (labeled vertical mode) it is the
       *     CROSS size, and being definite it stops `self-stretch` from
       *     stretching the rule to the full width.
       */
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
     * `segment` controls whether the line spans its own main axis
     * (line-only mode) or grows to fill space (labeled-mode flex
     * segment).
     *
     * `full` is empty here on purpose: what "full" resolves to depends
     * on the orientation, so it is emitted from `compoundVariants`.
     * `grow` is genuinely orientation-agnostic — `flex-1` grows along
     * whichever main axis the parent sets — so it stays on the axis.
     */
    segment: {
      full:  '',
      grow:  'flex-1',
    },
  },

  compoundVariants: [
    /*
     * Horizontal: `w-full` is load-bearing. A block child does NOT fill
     * the width once it is a flex item, which is exactly the toolbar
     * case, so the rule would collapse without this.
     */
    { orientation: 'horizontal', segment: 'full', class: 'w-full' },

    /*
     * Vertical: deliberately NOTHING.
     *
     * The span is already handled by `self-stretch` on the orientation
     * axis, which is what `divider.types.ts` promises in the public
     * JSDoc for `flexItem` ("already applied on the vertical line
     * segment by default in the TV").
     *
     * Measured in Chrome, `flex-row` with a button either side:
     *   w-0 border-l self-stretch           -> 1px wide, 32px tall  ✓
     *   w-0 border-l self-stretch h-full    -> 1px wide, 0px tall   ✗
     *
     * `align-self: stretch` only applies while the cross size is
     * `auto`, so adding a definite `h-full` SUPPRESSES the stretch and
     * then resolves the percentage to zero against an auto-height flex
     * parent. An `h-full` here would trade a full-width bar for an
     * invisible divider. See README-BUG § BUG 25.
     */
  ],

  defaultVariants: {
    orientation: 'horizontal',
    variant:     'solid',
    color:       'neutral',
    segment:     'full',
  },
});

export type DividerLineVariants = VariantProps<typeof dividerLineVariants>;
