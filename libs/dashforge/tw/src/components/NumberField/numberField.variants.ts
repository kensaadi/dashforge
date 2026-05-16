import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<NumberField>`.
 *
 * Same 7-slot taxonomy as `<TextField>` for visual/override parity, plus
 * a dedicated `stepper` slot for the optional +/- increment buttons.
 */
export const numberFieldVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    inputWrapper: [
      'relative flex items-center',
      // bg-neutral-50 inverts via @dashforge/tw-tokens — dark-mode aware.
      'rounded-md border bg-neutral-50',
      'border-neutral-300',
      'transition-colors',
      'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
    ],
    input: [
      'block w-full bg-transparent outline-none',
      'text-neutral-900 placeholder:text-neutral-400',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'read-only:cursor-default',
      // Suppress the native browser spinner — we ship our own optional stepper
      '[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      // Right-align numeric values by convention
      'text-right',
    ],
    stepper: [
      'flex flex-col border-l border-neutral-300',
      'select-none',
    ],
    stepperButton: [
      'flex items-center justify-center px-2 cursor-pointer',
      'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
      'transition-colors',
    ],
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: {
        inputWrapper: 'h-8',
        input: 'text-sm px-2',
        stepperButton: 'h-4 text-xs',
      },
      md: {
        inputWrapper: 'h-10',
        input: 'text-base px-3',
        stepperButton: 'h-5 text-sm',
      },
      lg: {
        inputWrapper: 'h-12',
        input: 'text-lg px-4',
        stepperButton: 'h-6 text-base',
      },
    },
    layout: {
      stacked: { root: 'flex-col' },
      inline: { root: 'flex-row items-start gap-3', label: 'mb-0 pt-2 whitespace-nowrap shrink-0' },
    },
    error: {
      true: {
        inputWrapper:
          'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500/30',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
        inputWrapper: 'w-full',
      },
    },
    disabled: {
      true: {
        inputWrapper: 'opacity-60 cursor-not-allowed bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'stacked',
    error: false,
    fullWidth: false,
    disabled: false,
  },
});

export type NumberFieldVariants = VariantProps<typeof numberFieldVariants>;
