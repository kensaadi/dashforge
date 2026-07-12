import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  formatLongDate,
  resolveCalendarKey,
  useCalendar,
} from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { calendarDayVariants, calendarVariants } from './calendar.variants.js';
import type { CalendarProps } from './calendar.types.js';

// Inline 16×16 stroke chevrons — no icon dependency (tw convention).
function ChevronLeftIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 4 6 8l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * `<Calendar>` — a standalone, inline month-grid date picker.
 *
 * The Tailwind presentation layer over the headless `useCalendar` engine
 * from `@dashforge/calendar-core` (the same engine the MUI `@dashforge/ui`
 * calendar consumes — only the skin differs). Implements the WCAG grid
 * pattern with roving tab-index focus.
 *
 * It is a primitive: no form-bridge / RBAC integration — use `<DatePicker>`
 * for a form-bound date field.
 */
export function Calendar(props: CalendarProps) {
  const themeDefaults = useComponentDefaults('Calendar');
  const merged: CalendarProps = { ...themeDefaults?.defaults, ...props };
  const {
    value,
    defaultValue,
    onChange,
    month,
    year,
    defaultMonth,
    defaultYear,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    today,
    disabled = false,
    autoFocus = false,
    sx,
    slotProps,
    testId,
    'aria-label': ariaLabel = 'Calendar',
  } = merged;

  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ISODate | null>(
    defaultValue ?? null,
  );
  const selectedValue: ISODate | null = isValueControlled
    ? value
    : internalValue;

  const handleSelect = useCallback(
    (iso: ISODate) => {
      if (!isValueControlled) {
        setInternalValue(iso);
      }
      onChange?.(iso);
    },
    [isValueControlled, onChange],
  );

  const calendar = useCalendar({
    selected: selectedValue,
    month,
    year,
    defaultMonth,
    defaultYear,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    today,
    onSelect: handleSelect,
  });

  // Roving focus: the active day cell holds DOM focus; it is moved only
  // after a keyboard interaction (or on mount when `autoFocus`). `focus`
  // uses `preventScroll` so opening the calendar inside a popup never
  // scroll-jumps the page before the popup is positioned.
  const focusedCellRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusRef = useRef(autoFocus);

  useEffect(() => {
    if (shouldFocusRef.current && focusedCellRef.current) {
      focusedCellRef.current.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
  }, [calendar.focusedDate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      const action = resolveCalendarKey(event.key);
      if (action === null) {
        return;
      }
      event.preventDefault();
      shouldFocusRef.current = true;
      switch (action) {
        case 'select':
          calendar.selectDate(calendar.focusedDate);
          break;
        case 'monthForward':
          calendar.goToNextMonth();
          break;
        case 'monthBackward':
          calendar.goToPreviousMonth();
          break;
        default:
          calendar.navigate(action);
      }
    },
    [disabled, calendar],
  );

  const resolvedLocale = locale ?? 'en-US';
  const v = calendarVariants({ disabled });

  return (
    <div
      data-testid={testId}
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      {/* Header: month navigation + label */}
      <div className={cn(v.header(), slotProps?.header?.className)}>
        <button
          type="button"
          className={v.navButton()}
          disabled={disabled}
          aria-label="Previous month"
          onClick={() => {
            calendar.goToPreviousMonth();
          }}
        >
          <ChevronLeftIcon />
        </button>
        <span aria-live="polite" className={v.monthLabel()}>
          {calendar.monthLabel}
        </span>
        <button
          type="button"
          className={v.navButton()}
          disabled={disabled}
          aria-label="Next month"
          onClick={() => {
            calendar.goToNextMonth();
          }}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Grid */}
      <div
        role="grid"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={cn(v.grid(), slotProps?.grid?.className)}
      >
        <div role="row" className={v.weekdayRow()}>
          {calendar.weekdayNames.map((dayName, index) => (
            <span
              key={`weekday-${String(index)}`}
              role="columnheader"
              className={v.weekday()}
            >
              {dayName}
            </span>
          ))}
        </div>

        {calendar.weeks.map((week) => (
          <div key={week.key} role="row" className={v.weekRow()}>
            {week.days.map((day) => {
              const isActiveCell = day.iso === calendar.focusedDate;
              return (
                <span key={day.iso} role="gridcell" className="flex">
                  <button
                    type="button"
                    ref={isActiveCell ? focusedCellRef : null}
                    tabIndex={isActiveCell ? 0 : -1}
                    disabled={disabled}
                    aria-label={formatLongDate(
                      { year: day.year, month: day.month, day: day.day },
                      resolvedLocale,
                    )}
                    aria-current={day.isToday ? 'date' : undefined}
                    aria-pressed={day.isSelected}
                    aria-disabled={day.isDisabled}
                    onClick={() => {
                      calendar.selectDate(day.iso);
                    }}
                    className={cn(
                      calendarDayVariants({
                        siblingMonth: day.isSiblingMonth,
                        today: day.isToday,
                        selected: day.isSelected,
                        disabled: day.isDisabled,
                      }),
                      slotProps?.day?.className,
                    )}
                  >
                    {day.day}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
