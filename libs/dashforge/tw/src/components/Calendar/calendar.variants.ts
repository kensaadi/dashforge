import { tv } from 'tailwind-variants';

/**
 * Structural slots for `<Calendar>`.
 *
 * Theme identity: every class is a bare neutral / brand token-backed
 * Tailwind class. The `dashforgePreset()` CSS-variable swap auto-inverts
 * the neutral palette, so there are NO `dark:` variants here (a `dark:` on
 * a neutral class would double-invert — see `_shared/themeIdentity.test.ts`).
 */
export const calendarVariants = tv({
  slots: {
    root: 'inline-flex w-fit flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 select-none',
    header: 'flex items-center justify-between gap-1',
    navButton:
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-40',
    monthLabel: 'flex-1 text-center text-sm font-semibold text-neutral-900',
    grid: 'flex flex-col gap-1 focus:outline-none',
    weekdayRow: 'grid grid-cols-7 gap-1',
    weekday:
      'flex h-8 items-center justify-center text-xs font-semibold text-neutral-500',
    weekRow: 'grid grid-cols-7 gap-1',
  },
  variants: {
    disabled: {
      true: { root: 'opacity-60' },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

/**
 * Per-day-cell recipe. Each of the 42 grid cells is rendered with its own
 * state (`siblingMonth` / `today` / `selected` / `disabled`).
 */
export const calendarDayVariants = tv({
  base: 'flex h-9 w-9 items-center justify-center rounded-md text-sm text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
  variants: {
    siblingMonth: {
      /*
       * `neutral-600`, not `neutral-400`, and not `neutral-500` either.
       *
       * A sibling-month cell is ACTIVE: it is selectable, so its label is
       * subject to WCAG 1.4.3, and at 14px / weight 400 the threshold is
       * 4.5:1. Measured on the running app, `neutral-400` gave **2.42:1**
       * in light and **2.53:1** in dark. Both fail. (The disabled cells sit
       * at 1.23:1 and are fine: WCAG exempts the text of inactive
       * components.)
       *
       * `neutral-500` is the pivot of the scale — it stays rgb(115,115,115)
       * in both themes — so it clears light at 4.54:1 but **fails dark at
       * 4.18:1**. `neutral-600` is the first tier that passes both:
       * 7.49:1 light, 7.85:1 dark, while still reading clearly muted
       * against the current month's 17:1.
       *
       * See README-BUG § BUG 31. Do not soften this without re-measuring
       * BOTH themes: the neutral scale inverts, so one number proves
       * nothing.
       */
      true: 'text-neutral-600',
    },
    today: {
      true: 'font-bold ring-1 ring-inset ring-primary-400',
    },
    selected: {
      true: 'bg-primary-600 text-white hover:bg-primary-600',
    },
    disabled: {
      true: 'cursor-default text-neutral-300 opacity-60 hover:bg-transparent',
    },
  },
  compoundVariants: [
    // A selected cell drops the "today" ring — the solid fill is enough.
    { selected: true, today: true, class: 'ring-0' },
  ],
  defaultVariants: {
    siblingMonth: false,
    today: false,
    selected: false,
    disabled: false,
  },
});
