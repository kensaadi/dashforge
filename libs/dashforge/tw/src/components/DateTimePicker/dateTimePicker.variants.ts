import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<DateTimePicker>` with 6 slots.
 *
 * Styling mirrors `<TextField>` for layout / sizes / error states so
 * the two field types compose visually in the same form.
 *
 * Native `<input type="date|time|datetime-local">` quirks handled here:
 *
 *  - The browser-rendered placeholder mask (e.g., `mm/dd/yyyy`) is
 *    invisible on `bg-neutral-50` by default in some themes; we keep
 *    the same neutral palette and rely on the input's own contrast
 *    rules (no extra `::placeholder` styling — browsers don't honor it
 *    on these input types).
 *  - The native picker indicator (calendar / clock icon) is
 *    browser-supplied; we ensure it stays visible in dark mode via
 *    `color-scheme: light dark` on the input (set inline below).
 */
export const dateTimePickerVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    inputWrapper: [
      'relative flex items-center',
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
      // `color-scheme` lets the native calendar / clock icon respect
      // the dark mode (otherwise it stays light-themed against dark bg)
      '[color-scheme:light_dark]',
    ],
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: { inputWrapper: 'h-8 px-2', input: 'text-sm' },
      md: { inputWrapper: 'h-10 px-3', input: 'text-base' },
      lg: { inputWrapper: 'h-12 px-4', input: 'text-lg' },
    },
    layout: {
      stacked: { root: 'flex-col' },
      inline: {
        root: 'flex-row items-start gap-3',
        label: 'mb-0 pt-2 whitespace-nowrap shrink-0',
      },
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

export type DateTimePickerVariants = VariantProps<typeof dateTimePickerVariants>;
