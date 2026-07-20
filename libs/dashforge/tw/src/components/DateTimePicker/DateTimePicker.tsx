import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import {
  formatTime,
  generateTimeOptions,
  getTodayISODate,
  parseISODate,
} from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { Popover } from '../Popover/Popover.js';
import { Calendar } from '../Calendar/Calendar.js';
import { dateTimePickerVariants } from './dateTimePicker.variants.js';
import type { DateTimePickerProps } from './dateTimePicker.types.js';

// Inline 16×16 stroke calendar glyph — no icon dependency (tw convention).
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

const DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/;

/** Splits a stored `YYYY-MM-DDTHH:mm` value into its date and time parts. */
function splitDateTime(value: string | null | undefined): {
  date: ISODate | null;
  time: string | null;
} {
  if (value == null || value === '') {
    return { date: null, time: null };
  }
  const match = DATETIME_PATTERN.exec(value);
  if (match !== null) {
    return {
      date: match[1] ?? null,
      time: `${match[2] ?? '00'}:${match[3] ?? '00'}`,
    };
  }
  return { date: parseISODate(value) !== null ? value : null, time: null };
}

/** Combines a date and a time into a `YYYY-MM-DDTHH:mm` value (or `null`). */
function joinDateTime(date: ISODate | null, time: string | null): string | null {
  if (date === null && time === null) {
    return null;
  }
  return `${date ?? getTodayISODate()}T${time ?? '00:00'}`;
}

/** Formats a stored datetime for the trigger display. */
function formatDateTime(
  value: string | null,
  locale: string,
  hour12: boolean,
): string {
  const { date, time } = splitDateTime(value);
  const parts: string[] = [];
  if (date !== null) {
    const parsed = parseISODate(date);
    parts.push(
      parsed === null
        ? date
        : new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeZone: 'UTC',
          }).format(Date.UTC(parsed.year, parsed.month - 1, parsed.day)),
    );
  }
  if (time !== null) {
    parts.push(formatTime(time, { hour12 }));
  }
  return parts.join(', ');
}

/**
 * Dashforge TW `<DateTimePicker>` — a form-bound date + time field.
 *
 * A read-only trigger button paired with a popover combining a `<Calendar>`
 * and a time list (Radix Popover). Integrates with the Dashforge form
 * bridge + RBAC.
 *
 * Storage contract: a naive ISO datetime `"YYYY-MM-DDTHH:mm"` — no seconds,
 * no timezone. Shared with the MUI `@dashforge/ui` `DateTimePicker`.
 */
export function DateTimePicker(_props: DateTimePickerProps) {
  const themeDefaults = useComponentDefaults('DateTimePicker');
  const props: DateTimePickerProps = { ...themeDefaults?.defaults, ..._props };
  const themeSlotProps = themeDefaults?.slotProps;
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
    stepMinutes,
    hour12 = false,
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
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
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
  let resolvedValue: string | null;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (explicitValue !== undefined) {
      resolvedValue = explicitValue;
    } else {
      const bv = fieldMeta.value;
      resolvedValue = bv == null ? null : String(bv);
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

  const v = dateTimePickerVariants({ layout, error: resolvedError, fullWidth });
  const resolvedLocale = locale ?? 'en-US';
  const { date, time } = splitDateTime(resolvedValue);
  const displayValue = formatDateTime(resolvedValue, resolvedLocale, hour12);
  const options = generateTimeOptions({
    ...(stepMinutes !== undefined && { stepMinutes }),
  });

  const commitValue = (next: string | null) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      void registration?.onChange?.({
        target: { name, value: next ?? '' },
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
        target: { name, value: committed == null ? '' : String(committed) },
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

  // Picking a date keeps the popover open — the user still needs a time.
  const handleDateSelect = (nextDate: ISODate) => {
    commitValue(joinDateTime(nextDate, time));
  };
  // Picking a time completes the value and closes the popover.
  const handleTimeSelect = (nextTime: string) => {
    commitValue(joinDateTime(date, nextTime));
    setIsOpen(false);
    markTouched();
  };

  return (
    <div
      data-testid={testId}
      className={cn(v.root(), sx, themeSlotProps?.root?.className, slotProps?.root?.className)}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(v.requiredMark(), themeSlotProps?.requiredMark?.className, slotProps?.requiredMark?.className)}
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
          <div className={v.panel()}>
            <Calendar
              value={date}
              onChange={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              isDateDisabled={isDateDisabled}
              weekStartDay={weekStartDay}
              locale={locale}
              aria-label="Choose date"
              sx="border-0 bg-transparent p-0"
            />
            <div role="listbox" aria-label="Time options" className={v.list()}>
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === time}
                  className={v.option()}
                  onClick={() => {
                    handleTimeSelect(option);
                  }}
                >
                  {formatTime(option, { hour12 })}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <button
          type="button"
          id={fieldId}
          ref={triggerRef}
          disabled={effectiveDisabled}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          className={cn(v.trigger(), themeSlotProps?.trigger?.className, slotProps?.trigger?.className)}
        >
          <span className={displayValue ? v.value() : v.placeholder()}>
            {displayValue || placeholder || 'Select date and time'}
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
              ? [themeSlotProps?.errorText?.className, slotProps?.errorText?.className]
              : [themeSlotProps?.helperText?.className, slotProps?.helperText?.className],
          )}
        >
          {resolvedHelperText}
        </p>
      )}
    </div>
  );
}
