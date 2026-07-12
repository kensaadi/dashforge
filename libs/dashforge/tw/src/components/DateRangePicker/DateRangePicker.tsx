import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import {
  formatLongDate,
  parseISODate,
  resolveCalendarKey,
  useDateRange,
} from '@dashforge/calendar-core';
import type { DateRange, ISODate, WeekDay } from '@dashforge/calendar-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { Popover } from '../Popover/Popover.js';
import {
  dateRangeDayVariants,
  dateRangePickerVariants,
} from './dateRangePicker.variants.js';
import type { DateRangePickerProps } from './dateRangePicker.types.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

function CalendarIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="3.5"
        width="11"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.5 6.5h11M5.5 2v3M10.5 2v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

/** Formats a stored ISO date for the trigger display (medium style). */
function formatEndpoint(iso: ISODate | null, locale: string): string {
  if (iso === null || iso === '') {
    return '';
  }
  const parts = parseISODate(iso);
  if (parts === null) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatRange(range: DateRange, locale: string): string {
  const start = formatEndpoint(range.start, locale);
  const end = formatEndpoint(range.end, locale);
  if (start === '') {
    return '';
  }
  return end === '' ? start : `${start} – ${end}`;
}

interface RangeCalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: ISODate;
  maxDate?: ISODate;
  disabledDates?: readonly ISODate[];
  isDateDisabled?: (date: ISODate) => boolean;
  weekStartDay?: WeekDay;
  locale?: string;
}

/** The dual-month range grid rendered inside the popover. */
function RangeCalendar(props: RangeCalendarProps) {
  const {
    value,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
  } = props;

  const range = useDateRange({
    value,
    onChange,
    monthCount: 2,
    ...(minDate !== undefined && { minDate }),
    ...(maxDate !== undefined && { maxDate }),
    ...(disabledDates !== undefined && { disabledDates }),
    ...(isDateDisabled !== undefined && { isDateDisabled }),
    ...(weekStartDay !== undefined && { weekStartDay }),
    ...(locale !== undefined && { locale }),
  });

  const focusedCellRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusRef = useRef(false);
  useEffect(() => {
    if (shouldFocusRef.current && focusedCellRef.current) {
      focusedCellRef.current.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
  }, [range.focusedDate]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = resolveCalendarKey(event.key);
    if (action === null) {
      return;
    }
    event.preventDefault();
    shouldFocusRef.current = true;
    switch (action) {
      case 'select':
        range.selectDate(range.focusedDate);
        break;
      case 'monthForward':
        range.goToNextMonth();
        break;
      case 'monthBackward':
        range.goToPreviousMonth();
        break;
      default:
        range.navigate(action);
    }
  };

  const v = dateRangePickerVariants();
  const resolvedLocale = locale ?? 'en-US';
  const lastIndex = range.months.length - 1;

  return (
    <div
      className={v.panel()}
      onMouseLeave={() => {
        range.hoverDate(null);
      }}
    >
      {range.months.map((monthView, monthIndex) => (
        <div
          key={`${String(monthView.year)}-${String(monthView.month)}`}
          className={v.month()}
        >
          <div className={v.header()}>
            {monthIndex === 0 ? (
              <button
                type="button"
                className={v.navButton()}
                aria-label="Previous month"
                onClick={() => {
                  range.goToPreviousMonth();
                }}
              >
                <ChevronLeftIcon />
              </button>
            ) : (
              <span className={v.navSpacer()} />
            )}
            <span aria-live="polite" className={v.monthLabel()}>
              {monthView.monthLabel}
            </span>
            {monthIndex === lastIndex ? (
              <button
                type="button"
                className={v.navButton()}
                aria-label="Next month"
                onClick={() => {
                  range.goToNextMonth();
                }}
              >
                <ChevronRightIcon />
              </button>
            ) : (
              <span className={v.navSpacer()} />
            )}
          </div>

          <div
            role="grid"
            aria-label="Choose date range"
            onKeyDown={handleKeyDown}
            className={v.grid()}
          >
            <div role="row" className={v.weekdayRow()}>
              {range.weekdayNames.map((dayName, index) => (
                <span
                  key={`weekday-${String(index)}`}
                  role="columnheader"
                  className={v.weekday()}
                >
                  {dayName}
                </span>
              ))}
            </div>

            {monthView.weeks.map((week) => (
              <div key={week.key} role="row" className={v.weekRow()}>
                {week.days.map((day) => {
                  const isActiveCell = day.iso === range.focusedDate;
                  const endpoint = day.isRangeStart || day.isRangeEnd;
                  const inBand = day.isInRange || day.isRangePreview;
                  return (
                    <span key={day.iso} role="gridcell" className="flex">
                      <button
                        type="button"
                        ref={isActiveCell ? focusedCellRef : null}
                        tabIndex={isActiveCell ? 0 : -1}
                        aria-label={formatLongDate(
                          { year: day.year, month: day.month, day: day.day },
                          resolvedLocale,
                        )}
                        aria-current={day.isToday ? 'date' : undefined}
                        aria-pressed={endpoint}
                        aria-disabled={day.isDisabled}
                        onClick={() => {
                          range.selectDate(day.iso);
                        }}
                        onMouseEnter={() => {
                          range.hoverDate(day.iso);
                        }}
                        className={dateRangeDayVariants({
                          inBand,
                          endpoint,
                          siblingMonth: day.isSiblingMonth,
                          today: day.isToday,
                          disabled: day.isDisabled,
                        })}
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
      ))}
    </div>
  );
}

/**
 * Dashforge TW `<DateRangePicker>` — a form-bound start/end date field.
 *
 * A read-only trigger button paired with a dual-month range calendar popover
 * (Radix Popover), built on the headless `useDateRange` engine. Integrates
 * with the Dashforge form bridge + RBAC.
 *
 * Storage contract: a `{ start, end }` pair of ISO `YYYY-MM-DD` dates —
 * shared with the MUI `@dashforge/ui` `DateRangePicker`.
 */
export function DateRangePicker(_props: DateRangePickerProps) {
  const themeDefaults = useComponentDefaults('DateRangePicker');
  const props: DateRangePickerProps = { ...themeDefaults?.defaults, ..._props };
  const {
    name,
    rules,
    label,
    helperText,
    error,
    required,
    disabled,
    placeholder,
    layout = 'stacked',
    visibleWhen,
    access,
    value: explicitValue,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    fullWidth,
    sx,
    slotProps,
    testId,
  } = props;

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const fieldId = useId();
  const helperId = `${fieldId}-help`;

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );

  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: cap, name: capName } = unregisterRef.current;
      queueMicrotask(() => {
        if (!isMountedRef.current) cap?.unregister?.(capName);
      });
    };
  }, []);

  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const isInteractive = !effectiveDisabled && !accessState.readonly;
  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: DateRange;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (explicitValue !== undefined) {
      resolvedValue = explicitValue;
    } else {
      const bv = fieldMeta.value as DateRange | null | undefined;
      resolvedValue = bv ?? EMPTY_RANGE;
    }
  } else if (explicitValue !== undefined) {
    resolvedValue = explicitValue;
  } else {
    resolvedValue = internalValue;
  }

  const registrationRefFn = registration?.ref;
  const triggerRef = useCallback(
    (instance: HTMLButtonElement | null) => {
      if (typeof registrationRefFn === 'function') {
        registrationRefFn(instance);
      }
    },
    [registrationRefFn],
  );

  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = dateRangePickerVariants({ layout, error: resolvedError, fullWidth });
  const resolvedLocale = locale ?? 'en-US';
  const displayValue = formatRange(resolvedValue, resolvedLocale);

  const commitValue = (next: DateRange) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      void registration?.onChange?.({
        target: { name, value: next },
        type: 'change',
      });
    } else if (explicitValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const markTouched = () => {
    if (isFormMode && bridge) {
      const committed = bridge.getValue(name);
      void registration?.onBlur?.({
        target: { name, value: committed },
        type: 'blur',
      });
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (next && !isInteractive) {
      return;
    }
    setIsOpen(next);
    if (!next) {
      markTouched();
    }
  };

  const handleRangeChange = (next: DateRange) => {
    commitValue(next);
    if (next.start !== null && next.end !== null) {
      setIsOpen(false);
      markTouched();
    }
  };

  return (
    <div
      data-testid={testId}
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(v.label(), slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(v.requiredMark(), slotProps?.requiredMark?.className)}
            >
              *
            </span>
          )}
        </label>
      )}

      <Popover
        open={isOpen}
        onOpenChange={handleOpenChange}
        side="bottom"
        align="start"
        content={
          <RangeCalendar
            value={resolvedValue}
            onChange={handleRangeChange}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            isDateDisabled={isDateDisabled}
            weekStartDay={weekStartDay}
            locale={locale}
          />
        }
      >
        <button
          type="button"
          id={fieldId}
          ref={triggerRef}
          disabled={effectiveDisabled}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          className={cn(v.trigger(), slotProps?.trigger?.className)}
        >
          <span className={displayValue ? v.value() : v.placeholder()}>
            {displayValue || placeholder || 'Select a date range'}
          </span>
          <span className={v.icon()}>
            <CalendarIcon />
          </span>
        </button>
      </Popover>

      {resolvedHelperText && (
        <p
          id={helperId}
          className={cn(
            resolvedError ? v.errorText() : v.helperText(),
            resolvedError
              ? slotProps?.errorText?.className
              : slotProps?.helperText?.className,
          )}
        >
          {resolvedHelperText}
        </p>
      )}
    </div>
  );
}
