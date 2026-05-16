import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Checkbox>` with slots.
 *
 * Slots:
 *   - `root`        — outer flex wrapper enclosing the control + label
 *   - `control`     — the visible square (Radix `Checkbox.Root`)
 *   - `indicator`   — checkmark SVG container (Radix `Checkbox.Indicator`)
 *   - `label`       — text label associated with the control
 *   - `helperText`  — descriptive line below
 *   - `errorText`   — error message line (semantic counterpart of helperText)
 *
 * Variants:
 *   - `size`  : sm / md / lg (drives control box dimensions + label text size)
 *   - `error` : bool — swaps borders + helper-text color to danger tones
 */
export const checkboxVariants = tv({
  slots: {
    root: 'inline-flex items-start gap-2',
    control: [
      'inline-flex items-center justify-center shrink-0',
      'rounded border bg-white',
      'border-neutral-300',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500',
      // Radix data-state hooks
      'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500',
      'data-[state=indeterminate]:bg-primary-500 data-[state=indeterminate]:border-primary-500',
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    ],
    indicator: 'flex items-center justify-center text-white',
    label: 'select-none cursor-pointer text-neutral-900',
    helperText: 'text-sm text-neutral-600 mt-1',
    errorText: 'text-sm text-danger-600 mt-1',
  },
  variants: {
    size: {
      sm: {
        control: 'h-4 w-4',
        label: 'text-sm',
        indicator: 'h-3 w-3',
      },
      md: {
        control: 'h-5 w-5',
        label: 'text-base',
        indicator: 'h-3.5 w-3.5',
      },
      lg: {
        control: 'h-6 w-6',
        label: 'text-lg',
        indicator: 'h-4 w-4',
      },
    },
    error: {
      true: {
        control: 'border-danger-500 focus-visible:ring-danger-500',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
