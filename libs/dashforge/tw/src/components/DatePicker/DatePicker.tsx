import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { parseISODate } from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { Popover } from '../Popover/Popover.js';
import { Calendar } from '../Calendar/Calendar.js';
import { datePickerVariants } from './datePicker.variants.js';
import type { DatePickerProps } from './datePicker.types.js';

// Inline 16×16 stroke calendar glyph — no icon dependency (tw convention).
function CalendarIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
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

/**
 * Formats a stored ISO date for the trigger display, localized to a medium
 * date style (e.g. `"May 20, 2026"`). Formatting is done in UTC so the
 * displayed day always matches the stored `YYYY-MM-DD`.
 */
function formatDisplayDate(
  iso: ISODate | null | undefined,
  locale: string,
): string {
  if (iso == null || iso === '') {
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

/**
 * Dashforge TW `<DatePicker>` — a form-bound single-date field.
 *
 * A read-only trigger button paired with a `<Calendar>` popover (Radix
 * Popover — toggle / Escape / outside-click / focus-trap are Radix-managed).
 * Integrates with the Dashforge form bridge + RBAC, mirroring the other
 * `@dashforge/tw` form fields.
 *
 * Storage contract: an ISO `YYYY-MM-DD` string, or `null` — shared with the
 * MUI `@dashforge/ui` `DatePicker`.
 */
export function DatePicker(props: DatePickerProps) {
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

  // ───── Hooks (unconditional, before any early return) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const fieldId = useId();
  const helperId = `${fieldId}-help`;

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<ISODate | null>(
    defaultValue ?? null,
  );

  // StrictMode-safe unregister-on-unmount.
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

  // ───── Derived ─────
  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;
  const isInteractive = !effectiveDisabled && !effectiveReadOnly;
  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: ISODate | null;

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

  // RHF threads its own callback ref through here in form mode.
  const registrationRefFn = registration?.ref;
  const triggerRef = useCallback(
    (instance: HTMLButtonElement | null) => {
      if (typeof registrationRefFn === 'function') {
        registrationRefFn(instance);
      }
    },
    [registrationRefFn],
  );

  // ───── Render-time guards (after all hooks) ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = datePickerVariants({
    layout,
    error: resolvedError,
    fullWidth,
  });
  const resolvedLocale = locale ?? 'en-US';
  const displayValue = formatDisplayDate(resolvedValue, resolvedLocale);

  const commitValue = (next: ISODate | null) => {
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

  // Mark the field touched on popover close. Reads the freshest committed
  // value straight from the bridge so the touched-blur never reverts a
  // value just chosen in the calendar.
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

  const handleCalendarChange = (next: ISODate) => {
    commitValue(next);
    setIsOpen(false);
    markTouched();
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
              className={cn(
                v.requiredMark(),
                slotProps?.requiredMark?.className,
              )}
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
          <Calendar
            value={resolvedValue}
            onChange={handleCalendarChange}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            isDateDisabled={isDateDisabled}
            weekStartDay={weekStartDay}
            locale={locale}
            aria-label="Choose date"
            sx="border-0 bg-transparent p-0"
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
            {displayValue || placeholder || 'Select a date'}
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
