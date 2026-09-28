import type { ISODate, WeekDay } from '@dashforge/calendar-core';

/**
 * Subset of `<Calendar>` props theme-configurable via
 * `theme.components.Calendar.defaults` (Option C).
 */
export interface CalendarVariantProps {
  weekStartDay?: WeekDay;
  locale?: string;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Calendar?: {
      defaults?: Partial<CalendarVariantProps>;
      slotProps?: CalendarSlotProps;
    };
  }
}

/**
 * The four booleans the day recipe is keyed on, handed to a functional
 * `slotProps.day` so a consumer can restyle ONE state without touching the
 * others.
 *
 * Before this existed, `slotProps.day.className` was a flat string applied
 * to all 42 cells, so an app that wanted, say, sibling-month days to read
 * as selectable had to restyle every cell identically (which also erased
 * the disabled treatment), reach into the DOM after render, or fork the
 * component. See README-BUG § BUG 31.
 */
export interface CalendarDayState {
  /** The cell belongs to the previous or next month. */
  siblingMonth: boolean;
  /** The cell is today. */
  today: boolean;
  /** The cell is the selected date. */
  selected: boolean;
  /** The cell cannot be picked (outside min/max, or explicitly disabled). */
  disabled: boolean;
}

/** Per-slot `className` overrides for `<Calendar>`. */
export interface CalendarSlotProps {
  root?: { className?: string };
  header?: { className?: string };
  grid?: { className?: string };
  /**
   * Applied to every day-cell button.
   *
   * Accepts either a flat object, which lands on all 42 cells, or a
   * function of the cell's state, which is what lets a theme address a
   * single state. Passing an object keeps working unchanged.
   *
   * @example
   * ```tsx
   * slotProps={{
   *   day: ({ siblingMonth }) =>
   *     siblingMonth ? { className: 'opacity-100 text-neutral-500' } : {},
   * }}
   * ```
   */
  day?:
    | { className?: string }
    | ((state: CalendarDayState) => { className?: string } | undefined);
}

/**
 * Props for the `<Calendar>` primitive — a standalone, inline month grid.
 *
 * `Calendar` is NOT a form field (no bridge / RBAC integration). It is the
 * low-level building block used inside `<DatePicker>`. For a form-bound date
 * input use `<DatePicker>`.
 *
 * Dates are ISO `YYYY-MM-DD` strings throughout. The headless date engine is
 * `@dashforge/calendar-core` — shared with the MUI `@dashforge/ui` calendar.
 */
export interface CalendarProps {
  /** Selected date (controlled). */
  value?: ISODate | null;
  /** Initial selected date (uncontrolled). */
  defaultValue?: ISODate | null;
  /** Fired when a day is chosen. */
  onChange?: (value: ISODate) => void;
  /** Controlled displayed month (1-indexed). Pair with `year`. */
  month?: number;
  /** Controlled displayed year. Pair with `month`. */
  year?: number;
  /** Initial displayed month (1-indexed, uncontrolled). */
  defaultMonth?: number;
  /** Initial displayed year (uncontrolled). */
  defaultYear?: number;
  /** Fired when the displayed month changes. */
  onMonthChange?: (month: number, year: number) => void;
  /** Earliest selectable date (inclusive). */
  minDate?: ISODate;
  /** Latest selectable date (inclusive). */
  maxDate?: ISODate;
  /** Explicit list of disabled dates. */
  disabledDates?: readonly ISODate[];
  /** Predicate marking arbitrary dates disabled. */
  isDateDisabled?: (date: ISODate) => boolean;
  /** Weekday of the grid's first column (`0` = Sunday). Default `0`. */
  weekStartDay?: WeekDay;
  /** BCP-47 locale for month/weekday names. Default `"en-US"`. */
  locale?: string;
  /** Overrides "today" (ISO `YYYY-MM-DD`), mainly for testing. */
  today?: ISODate;
  /** Disables the whole calendar. */
  disabled?: boolean;
  /**
   * Render the leading and trailing cells that belong to the neighbouring
   * months. Default `true`, which is the convention React Day Picker, MUI's
   * `DateCalendar` and the native pickers all follow.
   *
   * Set `false` and those cells become empty placeholders that keep the
   * 7-column geometry. Worth doing for any form where "a day of the next
   * month" is not a distinct concept, because a muted-but-selectable day
   * reads as unavailable at a glance. See README-BUG § BUG 31.
   *
   * @default true
   */
  showSiblingDays?: boolean;
  /** Moves DOM focus to the active day cell on mount. */
  autoFocus?: boolean;
  /** Accessible label for the grid. Default `"Calendar"`. */
  'aria-label'?: string;
  /** Root-level Tailwind class override. */
  sx?: string;
  /** Per-slot `className` overrides. */
  slotProps?: CalendarSlotProps;
  /** Test id applied to the root element. */
  testId?: string;
}
