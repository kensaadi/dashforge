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
 *   - `chipsList`    — wrapper around selected chips (multi-select only)
 *   - `chip`         — individual selected chip
 *   - `chipRemove`   — `×` button on a chip
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
      // Chevron flip on open — targets the SVG child via the aria-
      // expanded state on the button itself (set by React). Smooth
      // rotate gated on prefers-reduced-motion (WCAG 2.3.3); the
      // 180° state still applies, just without the animated tween.
      '[&[aria-expanded=true]>svg]:rotate-180',
      '[&>svg]:transition-transform [&>svg]:duration-150 motion-reduce:[&>svg]:transition-none',
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
    chipsList: 'flex flex-wrap items-center gap-1 px-1 py-1',
    chip: [
      'inline-flex items-center gap-1 shrink-0',
      'rounded-md bg-primary-100 text-primary-900',
      'px-2 py-0.5 text-xs font-medium',
      'border border-primary-200',
    ],
    chipRemove: [
      'inline-flex items-center justify-center',
      'rounded-sm w-4 h-4 text-primary-700',
      'hover:bg-primary-200 hover:text-primary-900',
      'transition-colors',
    ],
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
