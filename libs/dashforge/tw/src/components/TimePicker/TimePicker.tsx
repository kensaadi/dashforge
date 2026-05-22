import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import {
  formatTime,
  generateTimeOptions,
  timeStringToMinutes,
} from '@dashforge/calendar-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { Popover } from '../Popover/Popover.js';
import { timePickerVariants } from './timePicker.variants.js';
import type { TimePickerProps } from './timePicker.types.js';

// Inline 16×16 stroke clock glyph — no icon dependency (tw convention).
function ClockIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 4.5V8l2.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Dashforge TW `<TimePicker>` — a form-bound time-of-day field.
 *
 * A read-only trigger button paired with a time-list popover (Radix
 * Popover). Integrates with the Dashforge form bridge + RBAC.
 *
 * Storage contract: a canonical 24-hour `"HH:mm"` string, or `null` —
 * shared with the MUI `@dashforge/ui` `TimePicker`. `hour12` is display-only.
 */
export function TimePicker(props: TimePickerProps) {
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
    minTime,
    maxTime,
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

  const v = timePickerVariants({ layout, error: resolvedError, fullWidth });
  const displayValue =
    resolvedValue != null && resolvedValue !== ''
      ? formatTime(resolvedValue, { hour12 })
      : '';

  const options = generateTimeOptions({
    ...(minTime !== undefined && { start: minTime }),
    ...(maxTime !== undefined && { end: maxTime }),
    ...(stepMinutes !== undefined && { stepMinutes }),
  });
  const minMinutes = timeStringToMinutes(minTime ?? '00:00') ?? 0;
  const maxMinutes = timeStringToMinutes(maxTime ?? '23:59') ?? 1439;
  const isTimeDisabled = (time: string): boolean => {
    const minutes = timeStringToMinutes(time);
    return minutes === null || minutes < minMinutes || minutes > maxMinutes;
  };

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

  const handleSelect = (time: string) => {
    if (isTimeDisabled(time)) {
      return;
    }
    commitValue(time);
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
          <div role="listbox" aria-label="Time options" className={v.list()}>
            {options.map((time) => (
              <button
                key={time}
                type="button"
                role="option"
                aria-selected={time === resolvedValue}
                aria-disabled={isTimeDisabled(time)}
                className={v.option()}
                onClick={() => {
                  handleSelect(time);
                }}
              >
                {formatTime(time, { hour12 })}
              </button>
            ))}
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
          className={cn(v.trigger(), slotProps?.trigger?.className)}
        >
          <span className={displayValue ? v.value() : v.placeholder()}>
            {displayValue || placeholder || 'Select a time'}
          </span>
          <span className={v.icon()}>
            <ClockIcon />
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
