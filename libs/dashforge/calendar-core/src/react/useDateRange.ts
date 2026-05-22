/**
 * `useDateRange` — the headless date-range-selection hook.
 *
 * Composes {@link useCalendar} for the month grid and layers a range
 * state machine on top: a first click sets the range start, a second
 * click sets the end (auto-swapped if it lands before the start), a
 * third click restarts. While a start is picked but the end is not,
 * `hoverDate` drives a live preview band.
 *
 * Renders one or more consecutive months (`monthCount`) so a skin can
 * present a single calendar or a side-by-side dual-month range picker.
 * Like the rest of `@dashforge/calendar-core` it renders nothing — the
 * MUI and Tailwind `DateRangePicker` skins map `months` (whose cells
 * carry pre-computed range flags) to their own markup.
 *
 * @module @dashforge/calendar-core/react/useDateRange
 */
import { useCallback, useMemo, useRef, useState } from 'react';

import { addMonths, getTodayParts, getWeekday } from '../core/arithmetic.js';
import { isWithinISORange } from '../core/compare.js';
import { buildMonthGrid, chunkIntoWeeks } from '../core/grid.js';
import { toISODate } from '../core/iso.js';
import { formatMonthYear } from '../core/locale.js';
import type {
  ArrowDirection,
  CalendarDay,
  ISODate,
  WeekDay,
} from '../types.js';
import { useCalendar } from './useCalendar.js';
import type { UseCalendarOptions } from './useCalendar.js';

/** A start/end date pair. Either side may be `null` (empty or partial). */
export interface DateRange {
  /** Range start — ISO `YYYY-MM-DD`, or `null`. */
  start: ISODate | null;
  /** Range end — ISO `YYYY-MM-DD`, or `null` while only a start is picked. */
  end: ISODate | null;
}

/** A day cell ({@link CalendarDay}) extended with range-selection flags. */
export interface CalendarRangeDay extends CalendarDay {
  /** The cell is the committed range start. */
  isRangeStart: boolean;
  /** The cell is the committed range end. */
  isRangeEnd: boolean;
  /** The cell is inside the committed `[start, end]` band (inclusive). */
  isInRange: boolean;
  /** The cell is inside the hovered preview band (start picked, end pending). */
  isRangePreview: boolean;
}

/** A week row whose cells are {@link CalendarRangeDay}. */
export interface CalendarRangeWeek {
  /** A stable React key (the ISO of the row's first day). */
  key: string;
  days: CalendarRangeDay[];
}

/** A single rendered month of a {@link useDateRange} grid. */
export interface CalendarRangeMonth {
  /** Displayed month (1-indexed). */
  month: number;
  /** Displayed year. */
  year: number;
  /** Localized "month year" label, e.g. `"May 2026"`. */
  monthLabel: string;
  /** The 6-row month grid, each cell carrying range flags. */
  weeks: CalendarRangeWeek[];
}

const EMPTY_RANGE: DateRange = { start: null, end: null };
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_WEEK_START_DAY: WeekDay = 0;

/** Options for {@link useDateRange}. Every field is optional. */
export interface UseDateRangeOptions {
  /** Controlled range. */
  value?: DateRange;
  /** Uncontrolled initial range. */
  defaultValue?: DateRange;
  /** Fired when the range changes (partial on the first click, complete on the second). */
  onChange?: (range: DateRange) => void;
  /** How many consecutive months to render. Default `1`. */
  monthCount?: 1 | 2;
  /** Controlled displayed month (1-indexed) of the leading calendar. */
  month?: number;
  /** Controlled displayed year of the leading calendar. */
  year?: number;
  /** Uncontrolled initial displayed month (1-indexed). */
  defaultMonth?: number;
  /** Uncontrolled initial displayed year. */
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
  /** Weekday the grid's first column represents (`0` = Sunday). */
  weekStartDay?: WeekDay;
  /** BCP-47 locale for month/weekday names. Default `"en-US"`. */
  locale?: string;
  /** Overrides "today" (mainly for testing). */
  today?: ISODate;
}

/** The view-model and actions returned by {@link useDateRange}. */
export interface UseDateRangeResult {
  /** The rendered months — length equals `monthCount`. */
  months: CalendarRangeMonth[];
  /** Localized weekday column headers, ordered from `weekStartDay`. */
  weekdayNames: string[];
  /** Displayed month (1-indexed) of the leading calendar. */
  month: number;
  /** Displayed year of the leading calendar. */
  year: number;
  /** Localized label of the leading month. */
  monthLabel: string;
  /** The current roving-focus cell. */
  focusedDate: ISODate;
  /** The current range. */
  range: DateRange;
  /** True when a date is outside the selectable range. */
  isDayDisabled: (date: ISODate) => boolean;
  /** Jumps the leading calendar to a specific month/year. */
  goToMonth: (month: number, year: number) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToNextYear: () => void;
  goToPreviousYear: () => void;
  /** Advances the range state machine — start, then end (no-op if disabled). */
  selectDate: (date: ISODate) => void;
  /** Sets the hovered cell for the preview band (`null` clears it). */
  hoverDate: (date: ISODate | null) => void;
  /** Moves the roving-focus cell to a specific date. */
  setFocusedDate: (date: ISODate) => void;
  /** Moves roving focus by one cell; follows the grid across month edges. */
  navigate: (direction: ArrowDirection) => void;
}

/**
 * The headless date-range engine. See {@link UseDateRangeOptions} and
 * {@link UseDateRangeResult}.
 */
export function useDateRange(options: UseDateRangeOptions = {}): UseDateRangeResult {
  const { value, defaultValue, onChange, monthCount = 1 } = options;

  const isControlled = value !== undefined;
  const [internalRange, setInternalRange] = useState<DateRange>(
    () => value ?? defaultValue ?? EMPTY_RANGE,
  );
  const range: DateRange = value ?? internalRange;

  const rangeRef = useRef(range);
  rangeRef.current = range;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [hovered, setHovered] = useState<ISODate | null>(null);

  const locale = options.locale ?? DEFAULT_LOCALE;
  const weekStartDay = options.weekStartDay ?? DEFAULT_WEEK_START_DAY;
  const todayISO = useMemo(
    () => options.today ?? toISODate(getTodayParts()),
    [options.today],
  );

  // The committed endpoints double as the calendar's `selected` set, so
  // `useCalendar` seeds the initial view on the start and flags the
  // endpoint cells via `isSelected`.
  const selected = useMemo<ISODate[]>(() => {
    const out: ISODate[] = [];
    if (range.start !== null) {
      out.push(range.start);
    }
    if (range.end !== null) {
      out.push(range.end);
    }
    return out;
  }, [range.start, range.end]);

  // Forward only the defined options — `exactOptionalPropertyTypes` rejects
  // an explicit `undefined` on an optional field.
  const calendar = useCalendar({
    selected,
    ...(options.month !== undefined && { month: options.month }),
    ...(options.year !== undefined && { year: options.year }),
    ...(options.defaultMonth !== undefined && { defaultMonth: options.defaultMonth }),
    ...(options.defaultYear !== undefined && { defaultYear: options.defaultYear }),
    ...(options.onMonthChange !== undefined && { onMonthChange: options.onMonthChange }),
    ...(options.minDate !== undefined && { minDate: options.minDate }),
    ...(options.maxDate !== undefined && { maxDate: options.maxDate }),
    ...(options.disabledDates !== undefined && { disabledDates: options.disabledDates }),
    ...(options.isDateDisabled !== undefined && { isDateDisabled: options.isDateDisabled }),
    ...(options.weekStartDay !== undefined && { weekStartDay: options.weekStartDay }),
    ...(options.locale !== undefined && { locale: options.locale }),
    ...(options.today !== undefined && { today: options.today }),
  } satisfies UseCalendarOptions);

  const isDayDisabled = calendar.isDayDisabled;

  const selectDate = useCallback(
    (date: ISODate) => {
      if (isDayDisabled(date)) {
        return;
      }
      const current = rangeRef.current;
      const next: DateRange =
        current.start === null || current.end !== null
          ? { start: date, end: null }
          : date < current.start
            ? { start: date, end: current.start }
            : { start: current.start, end: date };
      if (!isControlled) {
        setInternalRange(next);
      }
      setHovered(null);
      onChangeRef.current?.(next);
    },
    [isDayDisabled, isControlled],
  );

  const hoverDate = useCallback((date: ISODate | null) => {
    setHovered(date);
  }, []);

  const months = useMemo<CalendarRangeMonth[]>(() => {
    const { start, end } = range;
    const selecting = start !== null && end === null;
    const focusedDate = calendar.focusedDate;

    const decorate = (days: CalendarDay[]): CalendarRangeDay[] =>
      days.map((day) => ({
        ...day,
        isRangeStart: start !== null && day.iso === start,
        isRangeEnd: end !== null && day.iso === end,
        isInRange:
          start !== null && end !== null && isWithinISORange(day.iso, start, end),
        isRangePreview:
          selecting && hovered !== null && isWithinISORange(day.iso, start, hovered),
      }));

    const result: CalendarRangeMonth[] = [
      {
        month: calendar.month,
        year: calendar.year,
        monthLabel: calendar.monthLabel,
        weeks: calendar.weeks.map((week) => ({
          key: week.key,
          days: decorate(week.days),
        })),
      },
    ];

    for (let offset = 1; offset < monthCount; offset += 1) {
      const view = addMonths(
        { year: calendar.year, month: calendar.month, day: 1 },
        offset,
      );
      const cells = buildMonthGrid(view.year, view.month, weekStartDay);
      const weeks: CalendarRangeWeek[] = chunkIntoWeeks(cells).map(
        (weekCells, index) => {
          const days = decorate(
            weekCells.map((parts): CalendarDay => {
              const iso = toISODate(parts);
              return {
                iso,
                year: parts.year,
                month: parts.month,
                day: parts.day,
                weekday: getWeekday(parts),
                isSiblingMonth:
                  parts.month !== view.month || parts.year !== view.year,
                isToday: iso === todayISO,
                isSelected: selected.includes(iso),
                isDisabled: isDayDisabled(iso),
                isFocused: iso === focusedDate,
              };
            }),
          );
          const firstDay = days[0];
          return {
            key: firstDay !== undefined ? firstDay.iso : `week-${String(index)}`,
            days,
          };
        },
      );
      result.push({
        month: view.month,
        year: view.year,
        monthLabel: formatMonthYear(
          { year: view.year, month: view.month, day: 1 },
          locale,
        ),
        weeks,
      });
    }

    return result;
  }, [
    calendar.month,
    calendar.year,
    calendar.monthLabel,
    calendar.weeks,
    calendar.focusedDate,
    monthCount,
    range,
    hovered,
    weekStartDay,
    locale,
    todayISO,
    isDayDisabled,
    selected,
  ]);

  return {
    months,
    weekdayNames: calendar.weekdayNames,
    month: calendar.month,
    year: calendar.year,
    monthLabel: calendar.monthLabel,
    focusedDate: calendar.focusedDate,
    range,
    isDayDisabled,
    goToMonth: calendar.goToMonth,
    goToNextMonth: calendar.goToNextMonth,
    goToPreviousMonth: calendar.goToPreviousMonth,
    goToNextYear: calendar.goToNextYear,
    goToPreviousYear: calendar.goToPreviousYear,
    selectDate,
    hoverDate,
    setFocusedDate: calendar.setFocusedDate,
    navigate: calendar.navigate,
  };
}
