import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<OTPField>`.
 *
 * Slots:
 *   - `root`         — outer wrapper (label + slots row + helper/error)
 *   - `label`        — group-level label
 *   - `requiredMark` — red `*` for required fields
 *   - `slotsRow`     — flex row holding the visible slot boxes
 *   - `slot`         — single slot cell (visual representation of a char)
 *   - `slotChar`     — the character displayed inside a slot
 *   - `hiddenInput`  — the actual <input> absorbing keystrokes (visually
 *                      hidden but focusable + reads as a single
 *                      one-line text input to AT)
 *   - `helperText`   — descriptive line below
 *   - `errorText`    — semantic counterpart of helperText for error mode
 *
 * Variants:
 *   - `size`  : sm / md / lg — drives slot box dimensions + text size
 *   - `error` : bool — swaps slot border + helperText color to danger tones
 */
export const otpFieldVariants = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'block text-sm font-medium text-neutral-900',
    requiredMark: 'text-danger-500 ml-0.5',
    slotsRow: 'relative inline-flex items-center gap-2',
    slot: [
      'flex items-center justify-center',
      'rounded-md border bg-white',
      'border-neutral-300',
      'text-neutral-900 font-mono',
      'transition-colors',
      'data-[active=true]:border-primary-500 data-[active=true]:ring-2 data-[active=true]:ring-primary-500/30',
      'data-[disabled=true]:opacity-60 data-[disabled=true]:cursor-not-allowed',
    ],
    slotChar: 'select-none',
    hiddenInput: [
      'absolute inset-0 w-full h-full opacity-0',
      'cursor-text outline-none',
      'disabled:cursor-not-allowed',
    ],
    helperText: 'text-sm text-neutral-600',
    errorText: 'text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: {
        slot: 'h-9 w-7 text-base',
      },
      md: {
        slot: 'h-11 w-9 text-lg',
      },
      lg: {
        slot: 'h-14 w-11 text-2xl',
      },
    },
    error: {
      true: {
        slot: 'border-danger-500 data-[active=true]:border-danger-500 data-[active=true]:ring-danger-500/30',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

export type OTPFieldVariants = VariantProps<typeof otpFieldVariants>;
