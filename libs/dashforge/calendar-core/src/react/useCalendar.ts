/**
 * `useCalendar` — the headless month-grid hook.
 *
 * Returns a render-ready view-model (`weeks`, `weekdayNames`, `monthLabel`)
 * plus action callbacks. It renders nothing and styles nothing: UI skins map
 * `weeks` to their own markup and wire the callbacks to their own events.
 *
 * @module @dashforge/calendar-core/react/useCalendar
 */
import { useCallback, useMemo, useRef, useState } from 'react';

import { addDays, addMonths, getTodayParts, getWeekday } from '../core/arithmetic.js';
import { compareISODate } from '../core/compare.js';
import { buildMonthGrid, chunkIntoWeeks } from '../core/grid.js';
import { parseISODate, toISODate } from '../core/iso.js';
import { formatMonthYear, getWeekdayNames } from '../core/locale.js';
import type {
  ArrowDirection,
  CalendarDay,
  CalendarWeek,
  DateParts,
  ISODate,
  WeekDay,
} from '../types.js';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_WEEK_START_DAY: WeekDay = 0;

interface MonthView {
  /** 1-indexed month. */
  month: number;
  year: number;
}

/** Options for {@link useCalendar}. Every field is optional. */
export interface UseCalendarOptions {
  /** Controlled displayed month (1-indexed). Pair with `year`. */
  month?: number;
  /** Controlled displayed year. Pair with `month`. */
  year?: number;
  /** Uncontrolled initial displayed month (1-indexed). */
  defaultMonth?: number;
  /** Uncontrolled initial displayed year. */
  defaultYear?: number;
  /** The selected date(s), as ISO strings. Drives the `isSelected` flag. */
  selected?: ISODate | readonly ISODate[] | null;
  /** Controlled roving-focus cell. */
  focusedDate?: ISODate;
  /** Uncontrolled initial roving-focus cell. */
  defaultFocusedDate?: ISODate;
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
  /** Overrides "today" (mainly for testing). Default: the host's local date. */
  today?: ISODate;
  /** Fired when the displayed month changes. */
  onMonthChange?: (month: number, year: number) => void;
  /** Fired when a day is selected. */
  onSelect?: (date: ISODate) => void;
  /** Fired when the roving-focus cell changes. */
  onFocusedDateChange?: (date: ISODate) => void;
}

/** The view-model and actions returned by {@link useCalendar}. */
export interface UseCalendarResult {
  /** Displayed month (1-indexed). */
  month: number;
  /** Displayed year. */
  year: number;
  /** The 6-row month grid, each cell pre-flagged. */
  weeks: CalendarWeek[];
  /** Localized weekday column headers, ordered from `weekStartDay`. */
  weekdayNames: string[];
  /** Localized "month year" label, e.g. `"May 2026"`. */
  monthLabel: string;
  /** The current roving-focus cell. */
  focusedDate: ISODate;
  /** True when a date is outside the selectable range. */
  isDayDisabled: (date: ISODate) => boolean;
  /** Jumps the displayed grid to a specific month/year. */
  goToMonth: (month: number, year: number) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToNextYear: () => void;
  goToPreviousYear: () => void;
  /** Selects a date (no-op if disabled). */
  selectDate: (date: ISODate) => void;
  /** Moves the roving-focus cell to a specific date. */
  setFocusedDate: (date: ISODate) => void;
  /** Moves roving focus by one cell; follows the grid across month edges. */
  navigate: (direction: ArrowDirection) => void;
}

function normalizeSelected(selected: UseCalendarOptions['selected']): ISODate[] {
  if (selected === null || selected === undefined) {
    return [];
  }
  if (typeof selected === 'string') {
    return [selected];
  }
  return [...selected];
}

function resolveInitialView(options: UseCalendarOptions, todayISO: ISODate): MonthView {
  if (options.month !== undefined && options.year !== undefined) {
    return { month: options.month, year: options.year };
  }
  if (options.defaultMonth !== undefined && options.defaultYear !== undefined) {
    return { month: options.defaultMonth, year: options.defaultYear };
  }
  const selected = normalizeSelected(options.selected);
  const seed = selected.length > 0 ? selected[0] : options.defaultFocusedDate;
  const parsed = parseISODate(seed ?? todayISO) ?? parseISODate(todayISO) ?? getTodayParts();
  return { month: parsed.month, year: parsed.year };
}

function resolveInitialFocusedDate(
  options: UseCalendarOptions,
  view: MonthView,
  todayISO: ISODate,
): ISODate {
  if (options.focusedDate !== undefined) {
    return options.focusedDate;
  }
  if (options.defaultFocusedDate !== undefined) {
    return options.defaultFocusedDate;
  }
  const selected = normalizeSelected(options.selected);
  const firstSelected = selected.length > 0 ? selected[0] : undefined;
  if (firstSelected !== undefined) {
    const parsed = parseISODate(firstSelected);
    if (parsed !== null && parsed.month === view.month && parsed.year === view.year) {
      return firstSelected;
    }
  }
  const todayParts = parseISODate(todayISO);
  if (todayParts !== null && todayParts.month === view.month && todayParts.year === view.year) {
    return todayISO;
  }
  return toISODate({ year: view.year, month: view.month, day: 1 });
}

/**
 * The headless calendar engine. See {@link UseCalendarOptions} and
 * {@link UseCalendarResult}.
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const locale = options.locale ?? DEFAULT_LOCALE;
  const weekStartDay = options.weekStartDay ?? DEFAULT_WEEK_START_DAY;
  const { minDate, maxDate, disabledDates, isDateDisabled } = options;

  // "Today" is captured once (the memo's dep never changes when `today` is
  // omitted) so re-renders cannot make the highlighted day drift.
  const todayISO = useMemo(
    () => options.today ?? toISODate(getTodayParts()),
    [options.today],
  );

  const selectedDates = useMemo(() => normalizeSelected(options.selected), [options.selected]);
  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  // ----- displayed month/year (controllable) -----
  const [internalView, setInternalView] = useState<MonthView>(() =>
    resolveInitialView(options, options.today ?? toISODate(getTodayParts())),
  );
  const view: MonthView =
    options.month !== undefined && options.year !== undefined
      ? { month: options.month, year: options.year }
      : internalView;

  // ----- roving-focus cell (controllable) -----
  const [internalFocusedDate, setInternalFocusedDate] = useState<ISODate>(() => {
    const seedToday = options.today ?? toISODate(getTodayParts());
    return resolveInitialFocusedDate(options, resolveInitialView(options, seedToday), seedToday);
  });
  const focusedDate = options.focusedDate ?? internalFocusedDate;

  const goToMonth = useCallback((month: number, year: number) => {
    const current = optionsRef.current;
    if (current.month === undefined || current.year === undefined) {
      setInternalView({ month, year });
    }
    current.onMonthChange?.(month, year);
  }, []);

  const setFocusedDate = useCallback((date: ISODate) => {
    const current = optionsRef.current;
    if (current.focusedDate === undefined) {
      setInternalFocusedDate(date);
    }
    current.onFocusedDateChange?.(date);
  }, []);

  const isDayDisabled = useCallback(
    (date: ISODate): boolean => {
      if (minDate !== undefined && compareISODate(date, minDate) < 0) {
        return true;
      }
      if (maxDate !== undefined && compareISODate(date, maxDate) > 0) {
        return true;
      }
      if (disabledDates !== undefined && disabledDates.includes(date)) {
        return true;
      }
      if (isDateDisabled !== undefined && isDateDisabled(date)) {
        return true;
      }
      return false;
    },
    [minDate, maxDate, disabledDates, isDateDisabled],
  );

  const selectDate = useCallback(
    (date: ISODate) => {
      if (isDayDisabled(date)) {
        return;
      }
      setFocusedDate(date);
      optionsRef.current.onSelect?.(date);
    },
    [isDayDisabled, setFocusedDate],
  );

  const navigate = useCallback(
    (direction: ArrowDirection) => {
      const current: DateParts =
        parseISODate(focusedDate) ?? { year: view.year, month: view.month, day: 1 };
      const offset =
        direction === 'left' ? -1 : direction === 'right' ? 1 : direction === 'up' ? -7 : 7;
      const next = addDays(current, offset);
      setFocusedDate(toISODate(next));
      if (next.month !== view.month || next.year !== view.year) {
        goToMonth(next.month, next.year);
      }
    },
    [focusedDate, view.month, view.year, setFocusedDate, goToMonth],
  );

  const goToNextMonth = useCallback(() => {
    const next = addMonths({ year: view.year, month: view.month, day: 1 }, 1);
    goToMonth(next.month, next.year);
  }, [view.month, view.year, goToMonth]);

  const goToPreviousMonth = useCallback(() => {
    const next = addMonths({ year: view.year, month: view.month, day: 1 }, -1);
    goToMonth(next.month, next.year);
  }, [view.month, view.year, goToMonth]);

  const goToNextYear = useCallback(() => {
    goToMonth(view.month, view.year + 1);
  }, [view.month, view.year, goToMonth]);

  const goToPreviousYear = useCallback(() => {
    goToMonth(view.month, view.year - 1);
  }, [view.month, view.year, goToMonth]);

  const weeks = useMemo<CalendarWeek[]>(() => {
    const cells = buildMonthGrid(view.year, view.month, weekStartDay);
    return chunkIntoWeeks(cells).map((weekCells, weekIndex) => {
      const days: CalendarDay[] = weekCells.map((parts) => {
        const iso = toISODate(parts);
        return {
          iso,
          year: parts.year,
          month: parts.month,
          day: parts.day,
          weekday: getWeekday(parts),
          isSiblingMonth: parts.month !== view.month || parts.year !== view.year,
          isToday: iso === todayISO,
          isSelected: selectedSet.has(iso),
          isDisabled: isDayDisabled(iso),
          isFocused: iso === focusedDate,
        };
      });
      const firstDay = days[0];
      return { key: firstDay !== undefined ? firstDay.iso : `week-${String(weekIndex)}`, days };
    });
  }, [view.month, view.year, weekStartDay, todayISO, selectedSet, isDayDisabled, focusedDate]);

  const weekdayNames = useMemo(
    () => getWeekdayNames(locale, weekStartDay),
    [locale, weekStartDay],
  );

  const monthLabel = useMemo(
    () => formatMonthYear({ year: view.year, month: view.month, day: 1 }, locale),
    [view.month, view.year, locale],
  );

  return {
    month: view.month,
    year: view.year,
    weeks,
    weekdayNames,
    monthLabel,
    focusedDate,
    isDayDisabled,
    goToMonth,
    goToNextMonth,
    goToPreviousMonth,
    goToNextYear,
    goToPreviousYear,
    selectDate,
    setFocusedDate,
    navigate,
  };
}
