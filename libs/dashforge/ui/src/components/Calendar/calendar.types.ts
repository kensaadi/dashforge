import type { ISODate, WeekDay } from '@dashforge/calendar-core';

/**
 * Props for the {@link Calendar} primitive — a standalone, inline month grid.
 *
 * `Calendar` is NOT a form field: it has no bridge / RBAC integration. It is
 * the low-level building block used inside `DatePicker` (and, later, the
 * range picker). For a form-bound date input use `DatePicker`.
 *
 * Dates are ISO `YYYY-MM-DD` strings throughout.
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
  /** Moves DOM focus to the active day cell on mount. */
  autoFocus?: boolean;
  /** Accessible label for the grid. Default `"Calendar"`. */
  'aria-label'?: string;
  /** Test id applied to the root element. */
  testId?: string;
}
