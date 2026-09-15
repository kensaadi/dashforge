import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<RadioGroup>` with slots.
 *
 * Slots:
 *   - `root`         — outer wrapper (label + option list + helper/error)
 *   - `label`        — group-level label (rendered above the option list)
 *   - `requiredMark` — red asterisk for required groups
 *   - `optionList`   — container for the radio options (flex direction
 *                      decided by the `layout` variant)
 *   - `option`       — wrapper for a single option (control + label)
 *   - `control`      — visible circle (Radix `RadioGroup.Item`)
 *   - `indicator`    — inner dot (Radix `RadioGroup.Indicator`)
 *   - `optionLabel`  — text label associated with the control
 *   - `helperText`   — descriptive line below the option list
 *   - `errorText`    — semantic counterpart of helperText for error mode
 *
 * Variants:
 *   - `size`   : sm / md / lg — drives control circle + label text size
 *   - `layout` : stacked (vertical, default) / row (horizontal)
 *   - `error`  : bool — swaps borders + helperText color to danger tones
 */
export const radioGroupVariants = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'block text-sm font-medium text-neutral-900',
    requiredMark: 'text-danger-500 ml-0.5',
    optionList: 'flex gap-3',
    option: 'inline-flex items-center gap-2',
    control: [
      'inline-flex items-center justify-center shrink-0',
      // bg-neutral-50 inverts — dark-mode aware via the dashforge preset.
      'rounded-full border bg-neutral-50',
      'border-neutral-300',
      'transition-colors',
      // Radix.RadioGroup.Item renders a `<button>`, whose UA cursor
      // is `default`. optionLabel already reads `cursor-pointer`, but
      // the control itself needs the same affordance when the pointer
      // sits directly on the circle. See README-BUG § BUG 13.
      'cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-500',
      'data-[state=checked]:border-primary-500',
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    ],
    indicator: 'block rounded-full bg-primary-500',
    optionLabel: 'select-none cursor-pointer text-neutral-900',
    helperText: 'text-sm text-neutral-600',
    errorText: 'text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: {
        control: 'h-4 w-4',
        indicator: 'h-2 w-2',
        optionLabel: 'text-sm',
      },
      md: {
        control: 'h-5 w-5',
        indicator: 'h-2.5 w-2.5',
        optionLabel: 'text-base',
      },
      lg: {
        control: 'h-6 w-6',
        indicator: 'h-3 w-3',
        optionLabel: 'text-lg',
      },
    },
    layout: {
      stacked: { optionList: 'flex-col' },
      row: { optionList: 'flex-row flex-wrap' },
    },
    error: {
      true: {
        control: 'border-danger-500 focus-visible:ring-danger-500',
      },
    },
    disabled: {
      true: {
        control: 'opacity-50 cursor-not-allowed',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'stacked',
    error: false,
    disabled: false,
  },
});

export type RadioGroupVariants = VariantProps<typeof radioGroupVariants>;
