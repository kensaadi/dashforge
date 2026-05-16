import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Autocomplete>` with slots.
 *
 * Slots:
 *   - `root`         — outer wrapper (label + combobox + helper/error)
 *   - `label`        — text label above the input
 *   - `requiredMark` — red `*` for required fields
 *   - `inputWrapper` — surface holding the input + clear/trigger buttons
 *   - `input`        — the typeable text input
 *   - `trigger`      — caret / chevron button that opens the popover
 *   - `clearButton`  — `×` button to clear the current selection
 *   - `popover`      — floating panel containing the option list
 *   - `listBox`      — list element wrapping the options
 *   - `listItem`     — single option row
 *   - `emptyState`   — fallback when no options match the filter
 *   - `helperText`   — descriptive line below the input
 *   - `errorText`    — semantic counterpart for error mode
 */
export const autocompleteVariants = tv({
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
    ],
    trigger: [
      'flex items-center justify-center shrink-0 px-2',
      'text-neutral-600 hover:text-neutral-900',
      'disabled:cursor-not-allowed disabled:opacity-40',
      'transition-colors',
    ],
    clearButton: [
      'flex items-center justify-center shrink-0 px-2',
      'text-neutral-500 hover:text-neutral-900',
      'transition-colors',
    ],
    popover: [
      'z-50 mt-1 max-h-64 overflow-auto',
      'rounded-md border bg-neutral-50 border-neutral-300 shadow-lg',
      'min-w-[var(--trigger-width)]',
    ],
    listBox: 'outline-none py-1',
    listItem: [
      'cursor-pointer select-none px-3 py-2 text-sm text-neutral-900',
      'outline-none',
      'data-[focused]:bg-primary-50 data-[focused]:text-primary-900',
      'data-[selected]:bg-primary-100 data-[selected]:text-primary-900 data-[selected]:font-medium',
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
    ],
    emptyState: 'px-3 py-2 text-sm text-neutral-500',
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: {
        inputWrapper: 'h-8',
        input: 'text-sm px-2',
        trigger: 'h-8 text-xs',
        clearButton: 'h-8',
      },
      md: {
        inputWrapper: 'h-10',
        input: 'text-base px-3',
        trigger: 'h-10 text-sm',
        clearButton: 'h-10',
      },
      lg: {
        inputWrapper: 'h-12',
        input: 'text-lg px-4',
        trigger: 'h-12 text-base',
        clearButton: 'h-12',
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

export type AutocompleteVariants = VariantProps<typeof autocompleteVariants>;
