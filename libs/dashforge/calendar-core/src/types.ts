/**
 * Shared types for the headless calendar engine.
 *
 * @module @dashforge/calendar-core/types
 */

/** An ISO 8601 calendar date — `YYYY-MM-DD`. No time component, no zone. */
export type ISODate = string;

/**
 * A calendar date as numeric parts.
 *
 * `month` is **1-indexed** (1 = January … 12 = December) — unlike the
 * JavaScript `Date` month, which is 0-indexed.
 */
export interface DateParts {
  year: number;
  /** 1-indexed: 1 = January … 12 = December. */
  month: number;
  /** 1-indexed day of month. */
  day: number;
}

/** Day of week — `0` = Sunday … `6` = Saturday (the `Date.getUTCDay()` scale). */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A roving-focus movement direction inside the day grid. */
export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

/** A single day cell of the month grid, with all render flags pre-computed. */
export interface CalendarDay {
  /** The cell's date as an ISO `YYYY-MM-DD` string. */
  iso: ISODate;
  year: number;
  /** 1-indexed month. */
  month: number;
  day: number;
  weekday: WeekDay;
  /** The cell belongs to the previous/next month (a leading/trailing cell). */
  isSiblingMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  /** The cell currently holding roving focus. */
  isFocused: boolean;
}

/** A single week row of the month grid. */
export interface CalendarWeek {
  /** A stable React key (the ISO of the row's first day). */
  key: string;
  days: CalendarDay[];
}
