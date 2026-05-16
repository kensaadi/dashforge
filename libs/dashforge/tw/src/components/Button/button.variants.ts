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
