import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Select>` — enum picker with slots.
 *
 * Slots (mirror Autocomplete where semantics overlap so Blueprint's
 * TwSelect binding migration is a rename, not a rewrite):
 *   - `root`               — outer wrapper (label + trigger + helper/error)
 *   - `label`              — text label above the trigger
 *   - `requiredMark`       — red `*` for required fields
 *   - `trigger`            — button surface displaying the current value
 *   - `triggerText`        — the selected label text (or placeholder)
 *   - `triggerPlaceholder` — muted placeholder when no value is selected
 *   - `chevron`            — caret glyph on the trigger, rotates on open
 *   - `popover`            — floating panel containing the option list
 *   - `listBox`            — the `<ul>` wrapping the options
 *   - `listItem`           — single option row
 *   - `listItemIndicator`  — checkmark on the currently-selected option
 *   - `emptyState`         — fallback when the options array is empty
 *   - `helperText`         — descriptive line below the trigger
 *   - `errorText`          — semantic counterpart for error mode
 *   - `chipsList`          — wrapper around selected chips (multi-select only)
 *   - `chip`               — individual selected chip
 *   - `chipRemove`         — `×` button on a chip
 *
 * Sized / laid-out via the same axes as Autocomplete for consistency —
 * consumers switching between the two get identical density knobs.
 */
export const selectVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    trigger: [
      'relative flex items-center justify-between w-full',
      'rounded-md border bg-neutral-50',
      'border-neutral-300',
      'text-left cursor-pointer',
      'transition-colors',
      'outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30',
      'hover:border-neutral-400',
    ],
    triggerText: [
      'flex-1 truncate',
      'text-neutral-900',
    ],
    triggerPlaceholder: [
      'flex-1 truncate',
      'text-neutral-400',
    ],
    chevron: [
      'shrink-0 ml-2 text-neutral-500',
      'transition-transform duration-150 motion-reduce:transition-none',
      '[&[data-open=true]]:rotate-180',
    ],
    popover: [
      'z-50 mt-1 max-h-64 overflow-auto',
      'rounded-md border bg-neutral-50 border-neutral-300 shadow-lg',
      'min-w-[var(--trigger-width)]',
    ],
    listBox: 'outline-none py-1 list-none pl-0 m-0',
    listItem: [
      'flex items-center gap-2 cursor-pointer select-none px-3 py-2 text-sm text-neutral-900',
      'outline-none',
      'data-[focused=true]:bg-primary-50 data-[focused=true]:text-primary-900',
      'data-[selected=true]:bg-primary-100 data-[selected=true]:text-primary-900 data-[selected=true]:font-medium',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
    ],
    listItemIndicator: [
      'shrink-0 w-4 text-primary-700',
      'opacity-0 data-[selected=true]:opacity-100',
    ],
    emptyState: 'px-3 py-2 text-sm text-neutral-500',
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
    chipsList: 'flex flex-wrap items-center gap-1 flex-1 min-w-0',
    chip: [
      'inline-flex items-center gap-1 shrink-0 max-w-full',
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
        trigger:     'h-8 px-2 text-sm',
        chevron:     'w-3.5 h-3.5',
      },
      md: {
        trigger:     'h-10 px-3 text-base',
        chevron:     'w-4 h-4',
      },
      lg: {
        trigger:     'h-12 px-4 text-lg',
        chevron:     'w-5 h-5',
      },
    },
    layout: {
      stacked: { root: 'flex-col' },
      inline: {
        root:  'flex-row items-start gap-3',
        label: 'mb-0 pt-2 whitespace-nowrap shrink-0',
      },
    },
    error: {
      true: {
        trigger:
          'border-danger-500 focus-visible:border-danger-500 focus-visible:ring-danger-500/30',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
        trigger: 'w-full',
      },
    },
    disabled: {
      true: {
        trigger: 'opacity-60 cursor-not-allowed bg-neutral-200 hover:border-neutral-300',
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

export type SelectVariants = VariantProps<typeof selectVariants>;
