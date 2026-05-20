import { tv } from 'tailwind-variants';

/**
 * Slots for `<DatePicker>` — a bridge-integrated date field whose trigger
 * is a `<button>` styled as an input, opening a `<Calendar>` popover.
 *
 * Theme identity: bare neutral / brand token-backed classes only — no
 * `dark:` variants on the neutral palette (the preset CSS-var swap
 * auto-inverts). See `_shared/themeIdentity.test.ts`.
 */
export const datePickerVariants = tv({
  slots: {
    root: 'flex flex-col',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    trigger:
      'flex items-center gap-2 h-10 min-w-[12rem] rounded-md border border-neutral-300 bg-neutral-50 px-3 text-base text-neutral-900 cursor-pointer transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-neutral-200',
    value: 'flex-1 truncate text-left',
    placeholder: 'flex-1 truncate text-left text-neutral-400',
    icon: 'shrink-0 text-[1rem] text-neutral-500',
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
