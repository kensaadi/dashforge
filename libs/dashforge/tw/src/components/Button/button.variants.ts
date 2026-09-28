import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Button>`.
 *
 * Three independent axes plus two booleans:
 *   - `variant`: visual treatment (solid / outline / ghost / link)
 *   - `color`:   semantic intent role (primary / secondary / success /
 *                warning / danger)
 *   - `size`:    sm / md / lg
 *   - `fullWidth`: stretches to container width
 *   - `loading`:   visually + functionally disabled, used together with
 *                  an inline spinner rendered by the component
 *
 * Color × variant combinations are expressed via `compoundVariants` so
 * each pair owns its bg / text / border / hover / focus quartet without
 * a `dark:` variant explosion. Dark mode swap is delegated entirely to
 * the runtime CSS-vars from `@dashforge/tw-theme` — the same class
 * resolves to a different value when `data-dash-tw-theme="dark"` flips.
 *
 * Token references:
 *   - Surface bg / border / text   →  `*-primary-*`, `*-danger-*`, etc.
 *                                     (resolved via `dashforgePreset()`)
 *   - Hover / focus / active states→  one tone deeper on the same scale
 *                                     (`primary-600` from `primary-500`)
 *   - Disabled                     →  opacity drop + no pointer-events
 */
export const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium',
    'rounded-md',
    // Pointer affordance — the browser UA cursor for `<button>` is
    // `default`, not `pointer`. Applies to every non-disabled state
    // (disabled + loading override below); `variant='link'` inherits
    // this cursor too, matching what browsers show for anchors. See
    // README-BUG § BUG 13.
    'cursor-pointer',
    'select-none whitespace-nowrap',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      solid: 'border border-transparent text-white',
      outline: 'bg-transparent border',
      ghost: 'bg-transparent border border-transparent',
      link: 'bg-transparent border-0 underline-offset-4 hover:underline px-0',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      /**
       * For a surface that is dark regardless of the theme: a dark hero,
       * an ink footer, an inverted panel. Reads the theme-invariant
       * `inverse` token role, so it does NOT flip with light/dark the way
       * a `neutral`-based treatment would. See kensaadi/dashforge#140.
       */
      inverse: '',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    },
    fullWidth: {
      true: 'w-full',
    },
    loading: {
      true: 'cursor-wait',
    },

    /**
     * Toggle state. Styling lives in `compoundVariants` because "on" reads
     * differently on a filled button than on a quiet one: the quiet
     * variants gain a surface, `solid` deepens the one it already has.
     *
     * The treatment is not invented. It is LeftNav's `itemActive`
     * (`bg-*-100 text-*-900 font-medium`), the catalog's existing way of
     * saying "this is the current thing". kensaadi/dashforge#63 gap C.
     */
    pressed: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    // ───── solid × color ─────
    {
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class: 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-500',
    },
    {
      variant: 'solid',
      color: 'success',
      class: 'bg-success-500 hover:bg-success-600 active:bg-success-700 focus-visible:ring-success-500',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'bg-warning-500 hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500',
    },
    {
      variant: 'solid',
      color: 'danger',
      class: 'bg-danger-500 hover:bg-danger-600 active:bg-danger-700 focus-visible:ring-danger-500',
    },
    // ───── outline × color ─────
    {
      variant: 'outline',
      color: 'primary',
      class: 'border-primary-500 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class: 'border-secondary-500 text-secondary-700 hover:bg-secondary-50 focus-visible:ring-secondary-500',
    },
    {
      variant: 'outline',
      color: 'success',
      class: 'border-success-500 text-success-700 hover:bg-success-50 focus-visible:ring-success-500',
    },
    {
      variant: 'outline',
      color: 'warning',
      class: 'border-warning-500 text-warning-700 hover:bg-warning-50 focus-visible:ring-warning-500',
    },
    {
      variant: 'outline',
      color: 'danger',
      class: 'border-danger-500 text-danger-700 hover:bg-danger-50 focus-visible:ring-danger-500',
    },
    // ───── ghost × color ─────
    {
      variant: 'ghost',
      color: 'primary',
      class: 'text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class: 'text-secondary-700 hover:bg-secondary-50 focus-visible:ring-secondary-500',
    },
    {
      variant: 'ghost',
      color: 'success',
      class: 'text-success-700 hover:bg-success-50 focus-visible:ring-success-500',
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: 'text-warning-700 hover:bg-warning-50 focus-visible:ring-warning-500',
    },
    {
      variant: 'ghost',
      color: 'danger',
      class: 'text-danger-700 hover:bg-danger-50 focus-visible:ring-danger-500',
    },
    // ───── link × color ─────
    { variant: 'link', color: 'primary', class: 'text-primary-700 hover:text-primary-800' },
    { variant: 'link', color: 'secondary', class: 'text-secondary-700 hover:text-secondary-800' },
    { variant: 'link', color: 'success', class: 'text-success-700 hover:text-success-800' },
    { variant: 'link', color: 'warning', class: 'text-warning-700 hover:text-warning-800' },
    { variant: 'link', color: 'danger', class: 'text-danger-700 hover:text-danger-800' },

    // ───── × inverse ─────
    //
    // `focus-visible:ring-offset-transparent` on every row is load-bearing.
    // The base sets `focus-visible:ring-offset-2`, and neither the preset
    // nor the base declares a ring-offset COLOUR, so it falls through to
    // Tailwind v4's default of `#fff`. On a dark surface that paints a
    // white halo around the button the moment it takes keyboard focus.
    {
      variant: 'solid',
      color: 'inverse',
      class:
        'bg-inverse-50 text-inverse-900 hover:bg-inverse-200 active:bg-inverse-300 ' +
        'focus-visible:ring-inverse-50 focus-visible:ring-offset-transparent',
    },
    {
      variant: 'outline',
      color: 'inverse',
      class:
        'border-inverse-50/40 text-inverse-50 hover:bg-inverse-50/10 ' +
        'focus-visible:ring-inverse-50 focus-visible:ring-offset-transparent',
    },
    {
      variant: 'ghost',
      color: 'inverse',
      class:
        'text-inverse-50 hover:bg-inverse-50/10 ' +
        'focus-visible:ring-inverse-50 focus-visible:ring-offset-transparent',
    },
    {
      variant: 'link',
      color: 'inverse',
      class: 'text-inverse-50 hover:text-inverse-200',
    },

    // ───── pressed × color, on the quiet variants ─────
    //
    // `outline` and `ghost` have no surface of their own, so an "on" toggle
    // gains one. Shape borrowed from LeftNav's `itemActive` rather than
    // invented, so a pressed Button and an active nav row read the same.
    {
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'primary',
      class: 'bg-primary-100 text-primary-900 font-medium hover:bg-primary-200',
    },
    {
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'secondary',
      class: 'bg-secondary-100 text-secondary-900 font-medium hover:bg-secondary-200',
    },
    {
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'success',
      class: 'bg-success-100 text-success-900 font-medium hover:bg-success-200',
    },
    {
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'warning',
      class: 'bg-warning-100 text-warning-900 font-medium hover:bg-warning-200',
    },
    {
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'danger',
      class: 'bg-danger-100 text-danger-900 font-medium hover:bg-danger-200',
    },
    {
      // `inverse` keeps its own idiom: a wash over the dark surface rather
      // than a tint from a scale that does not follow the theme. The hover
      // rows above use `/10`, so "on" sits one step up at `/20`.
      variant: ['outline', 'ghost'],
      pressed: true,
      color: 'inverse',
      class:
        'bg-inverse-50/20 text-inverse-50 font-medium hover:bg-inverse-50/25 ' +
        'focus-visible:ring-offset-transparent',
    },

    // ───── pressed × color, on solid ─────
    //
    // Already filled, so "on" deepens instead of tinting: it reuses each
    // row's own `active:` tier, the shade that already means "being pressed
    // right now".
    { variant: 'solid', pressed: true, color: 'primary', class: 'bg-primary-700 hover:bg-primary-800' },
    { variant: 'solid', pressed: true, color: 'secondary', class: 'bg-secondary-700 hover:bg-secondary-800' },
    { variant: 'solid', pressed: true, color: 'success', class: 'bg-success-700 hover:bg-success-800' },
    { variant: 'solid', pressed: true, color: 'warning', class: 'bg-warning-700 hover:bg-warning-800' },
    { variant: 'solid', pressed: true, color: 'danger', class: 'bg-danger-700 hover:bg-danger-800' },
    { variant: 'solid', pressed: true, color: 'inverse', class: 'bg-inverse-300 hover:bg-inverse-400' },

    // `link` gets no pressed treatment on purpose: a link that is also a
    // toggle is a shape worth questioning, and a background behind inline
    // text would fight the underline. `aria-pressed` is still emitted, so
    // the state is announced even where nothing is painted.
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'md',
    fullWidth: false,
    loading: false,
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
