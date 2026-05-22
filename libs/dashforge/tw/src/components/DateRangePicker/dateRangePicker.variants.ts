import { tv } from 'tailwind-variants';

/**
 * Slots for `<DateRangePicker>` — a bridge-integrated start/end date field
 * whose trigger is a `<button>` styled as an input, opening a dual-month
 * range calendar popover.
 *
 * Theme identity: bare neutral / brand token-backed classes only — no
 * `dark:` variants on the neutral palette (the preset CSS-var swap
 * auto-inverts). See `_shared/themeIdentity.test.ts`.
 */
export const dateRangePickerVariants = tv({
  slots: {
    root: 'flex flex-col',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    trigger:
      'flex items-center gap-2 h-10 min-w-[15rem] rounded-md border border-neutral-300 bg-neutral-50 px-3 text-base text-neutral-900 cursor-pointer transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-neutral-200',
    value: 'flex-1 truncate text-left',
    placeholder: 'flex-1 truncate text-left text-neutral-400',
    icon: 'shrink-0 text-[1rem] text-neutral-500',
    panel: 'flex gap-3 p-3 select-none',
    month: 'flex flex-col gap-2',
    header: 'flex items-center justify-between gap-1',
    navButton:
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[1rem] text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
    navSpacer: 'h-7 w-7 shrink-0',
    monthLabel: 'flex-1 text-center text-sm font-semibold text-neutral-900',
    grid: 'flex flex-col gap-1',
    weekdayRow: 'grid grid-cols-7 gap-1',
    weekday:
      'flex h-8 items-center justify-center text-xs font-semibold text-neutral-500',
    weekRow: 'grid grid-cols-7 gap-1',
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    layout: {
      stacked: {},
      inline: {
        root: 'flex-row items-start gap-3',
        label: 'mb-0 pt-2.5 whitespace-nowrap shrink-0',
      },
    },
    error: {
      true: {
        trigger:
          'border-danger-500 hover:border-danger-500 focus-visible:border-danger-500 focus-visible:ring-danger-500/30',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
        trigger: 'w-full min-w-0',
      },
    },
  },
  defaultVariants: {
    layout: 'stacked',
    error: false,
    fullWidth: false,
  },
});

/**
 * Per-day-cell recipe for the range grid. `endpoint` (a committed start/end)
 * is the solid fill; `inBand` (inside the committed or previewed range) is
 * the light tint. Declared `inBand` before `endpoint` so an endpoint cell —
 * which is also in-band — resolves to the solid fill.
 */
export const dateRangeDayVariants = tv({
  base: 'flex h-9 w-9 items-center justify-center rounded-md text-sm text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
  variants: {
    inBand: {
      true: 'bg-primary-100 hover:bg-primary-100',
    },
    endpoint: {
      true: 'bg-primary-600 text-white hover:bg-primary-600',
    },
    siblingMonth: {
      true: 'text-neutral-400',
    },
    today: {
      true: 'font-bold ring-1 ring-inset ring-primary-400',
    },
    disabled: {
      true: 'cursor-default text-neutral-300 opacity-60 hover:bg-transparent',
    },
  },
  compoundVariants: [
    { endpoint: true, today: true, class: 'ring-0' },
    { endpoint: true, siblingMonth: true, class: 'text-white' },
  ],
  defaultVariants: {
    inBand: false,
    endpoint: false,
    siblingMonth: false,
    today: false,
    disabled: false,
  },
});
