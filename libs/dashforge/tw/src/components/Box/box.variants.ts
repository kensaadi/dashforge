import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `boxVariants` — the surface primitive for @dashforge/tw.
 *
 * Architectural choice (planned with the user — F9 deep dive):
 *
 *   Box replaces FOUR overlapping concepts from MUI in one component:
 *     • Box        (typed div)
 *     • Paper      (surface with elevation)
 *     • Card       (Paper specialisation)
 *     • Surface    (Joy UI's outlined / soft / solid / plain variants)
 *
 *   The reason for the consolidation: in MUI you have to compose two or
 *   three of these to express even basic intent ("an outlined card with
 *   warning tone"). Here, one `<Box variant="outlined" color="warning">`
 *   says exactly that.
 *
 * Variant taxonomy (5 axes, intentionally non-overlapping with Stack/Grid):
 *
 *   • plain     — bare div + padding + radius. The escape hatch.
 *   • outlined  — 1px border + subtle bg tint. The "card lite".
 *   • elevated  — bg surface + shadow scale (0-5). The "floating panel".
 *   • soft      — semi-transparent intent bg + intent text. The "callout".
 *   • solid     — solid intent bg + contrasting text. The "CTA banner".
 *
 *   `color` applies to outlined/soft/solid (each gets the 7 intent
 *   variants). `elevated` is color-agnostic (always neutral surface +
 *   shadow scale). `plain` is everything-agnostic.
 *
 * Spacing axes (p/px/py/m/mx/my): mapped explicitly to the 11 token
 * steps from @dashforge/tw-tokens (0, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24).
 * Tailwind JIT requires literal class strings — building them dynamically
 * with template literals would purge them. The verbosity below is the
 * cost of keeping the bundle CSS-pure and rebuild-free.
 *
 * What this does NOT do (deliberate, see component docs):
 *   • No display / flex / grid props      → use Stack or Grid
 *   • No position / overflow / z-index    → use `sx`
 *   • No animation / transition           → use `sx`
 *
 * The "Box is not flex" rule is the spine of the layout layer. Without
 * it, every `<div>` in an app gravitates back to Box and the surface
 * vs layout distinction collapses — exactly the failure mode this
 * primitive exists to prevent.
 */
export const boxVariants = tv({
  base: 'block',

  variants: {
    /*
     * Surface variant. Compound with `color` for outlined / soft / solid;
     * standalone for plain / elevated.
     */
    variant: {
      plain:    '',
      outlined: 'border',
      elevated: 'bg-white dark:bg-neutral-900',
      soft:     '',
      solid:    '',
    },

    /*
     * Intent color. Only meaningful when variant is outlined / soft /
     * solid (resolved via compoundVariants below). For plain / elevated
     * this axis is ignored at the visual level — but kept in the type
     * so the prop is always available without conditional typing.
     */
    color: {
      primary:   '',
      secondary: '',
      success:   '',
      warning:   '',
      danger:    '',
      info:      '',
      neutral:   '',
    },

    /*
     * Shadow scale — relevant for `variant='elevated'`. We keep elevation
     * as a separate axis (not folded into `variant`) so consumers can
     * dial it up/down without changing the variant. Default `0` = no
     * shadow (consistent with MUI's elevation=0).
     */
    elevation: {
      0: 'shadow-none',
      1: 'shadow-sm',
      2: 'shadow',
      3: 'shadow-md',
      4: 'shadow-lg',
      5: 'shadow-xl',
    },

    rounded: {
      none: 'rounded-none',
      sm:   'rounded-sm',
      md:   'rounded-md',
      lg:   'rounded-lg',
      xl:   'rounded-xl',
      '2xl':'rounded-2xl',
      full: 'rounded-full',
    },

    /*
     * Spacing — six axes (p/px/py/m/mx/my), 11 token steps each.
     * Literals enumerated explicitly so Tailwind's JIT scanner finds
     * every class. Token steps mirror @dashforge/tw-tokens spacing scale.
     */
    p: {
      0:    'p-0',    '0.5': 'p-0.5', 1:  'p-1',  2:  'p-2',  3:  'p-3',
      4:    'p-4',    6:     'p-6',   8:  'p-8',  12: 'p-12', 16: 'p-16',
      24:   'p-24',
    },
    px: {
      0:    'px-0',   '0.5': 'px-0.5', 1:  'px-1',  2:  'px-2',  3:  'px-3',
      4:    'px-4',   6:     'px-6',   8:  'px-8',  12: 'px-12', 16: 'px-16',
      24:   'px-24',
    },
    py: {
      0:    'py-0',   '0.5': 'py-0.5', 1:  'py-1',  2:  'py-2',  3:  'py-3',
      4:    'py-4',   6:     'py-6',   8:  'py-8',  12: 'py-12', 16: 'py-16',
      24:   'py-24',
    },
    m: {
      0:    'm-0',    '0.5': 'm-0.5', 1:  'm-1',  2:  'm-2',  3:  'm-3',
      4:    'm-4',    6:     'm-6',   8:  'm-8',  12: 'm-12', 16: 'm-16',
      24:   'm-24',
    },
    mx: {
      0:    'mx-0',   '0.5': 'mx-0.5', 1:  'mx-1',  2:  'mx-2',  3:  'mx-3',
      4:    'mx-4',   6:     'mx-6',   8:  'mx-8',  12: 'mx-12', 16: 'mx-16',
      24:   'mx-24',
    },
    my: {
      0:    'my-0',   '0.5': 'my-0.5', 1:  'my-1',  2:  'my-2',  3:  'my-3',
      4:    'my-4',   6:     'my-6',   8:  'my-8',  12: 'my-12', 16: 'my-16',
      24:   'my-24',
    },

    fullWidth:  { true: 'w-full' },
    fullHeight: { true: 'h-full' },
  },

  /*
   * Compound variants — where surface × color get their actual visual.
   * Twenty-one entries: 7 (outlined) + 7 (soft) + 7 (solid).
   * `plain` and `elevated` don't appear here (no color contribution).
   *
   * Dark-mode pair is baked in: light-mode picks the 50-300 steps,
   * dark-mode picks the 800-950 steps — both reactive to setMode()
   * via the @dashforge/tw-theme CSS variables.
   */
  compoundVariants: [
    // ─── outlined × color ─────────────────────────────────────────────
    { variant: 'outlined', color: 'primary',
      class: 'border-primary-300 bg-primary-50/40 dark:border-primary-800 dark:bg-primary-950/30' },
    { variant: 'outlined', color: 'secondary',
      class: 'border-secondary-300 bg-secondary-50/40 dark:border-secondary-800 dark:bg-secondary-950/30' },
    { variant: 'outlined', color: 'success',
      class: 'border-success-300 bg-success-50/40 dark:border-success-800 dark:bg-success-950/30' },
    { variant: 'outlined', color: 'warning',
      class: 'border-warning-300 bg-warning-50/40 dark:border-warning-800 dark:bg-warning-950/30' },
    { variant: 'outlined', color: 'danger',
      class: 'border-danger-300 bg-danger-50/40 dark:border-danger-800 dark:bg-danger-950/30' },
    { variant: 'outlined', color: 'info',
      class: 'border-info-300 bg-info-50/40 dark:border-info-800 dark:bg-info-950/30' },
    { variant: 'outlined', color: 'neutral',
      class: 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900' },

    // ─── soft × color ─────────────────────────────────────────────────
    { variant: 'soft', color: 'primary',
      class: 'bg-primary-100 text-primary-900 dark:bg-primary-950/50 dark:text-primary-100' },
    { variant: 'soft', color: 'secondary',
      class: 'bg-secondary-100 text-secondary-900 dark:bg-secondary-950/50 dark:text-secondary-100' },
    { variant: 'soft', color: 'success',
      class: 'bg-success-100 text-success-900 dark:bg-success-950/50 dark:text-success-100' },
    { variant: 'soft', color: 'warning',
      class: 'bg-warning-100 text-warning-900 dark:bg-warning-950/50 dark:text-warning-100' },
    { variant: 'soft', color: 'danger',
      class: 'bg-danger-100 text-danger-900 dark:bg-danger-950/50 dark:text-danger-100' },
    { variant: 'soft', color: 'info',
      class: 'bg-info-100 text-info-900 dark:bg-info-950/50 dark:text-info-100' },
    { variant: 'soft', color: 'neutral',
      class: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' },

    // ─── solid × color ────────────────────────────────────────────────
    { variant: 'solid', color: 'primary',
      class: 'bg-primary-600 text-white dark:bg-primary-500' },
    { variant: 'solid', color: 'secondary',
      class: 'bg-secondary-600 text-white dark:bg-secondary-500' },
    { variant: 'solid', color: 'success',
      class: 'bg-success-600 text-white dark:bg-success-500' },
    { variant: 'solid', color: 'warning',
      class: 'bg-warning-500 text-white dark:bg-warning-600' },
    { variant: 'solid', color: 'danger',
      class: 'bg-danger-600 text-white dark:bg-danger-500' },
    { variant: 'solid', color: 'info',
      class: 'bg-info-600 text-white dark:bg-info-500' },
    { variant: 'solid', color: 'neutral',
      class: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' },
  ],

  defaultVariants: {
    variant:   'plain',
    color:     'neutral',
    elevation: 0,
    rounded:   'none',
  },
});

export type BoxVariants = VariantProps<typeof boxVariants>;
