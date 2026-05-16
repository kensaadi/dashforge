import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { dateTimePickerVariants } from './dateTimePicker.variants.js';
import type {
  DateTimePickerMode,
  DateTimePickerProps,
} from './dateTimePicker.types.js';

/**
 * Resolve the native HTML input `type` for a given picker mode.
 */
function inputTypeFor(mode: DateTimePickerMode): string {
  switch (mode) {
    case 'time':
      return 'time';
    case 'datetime':
      return 'datetime-local';
    case 'date':
    default:
      return 'date';
  }
}

/**
 * Coerce a stored/exposed value (ISO 8601-ish string or `null`/`undefined`)
 * into the format the native input expects.
 *
 * Contract:
 *   - `date`     → `YYYY-MM-DD`
 *   - `time`     → `HH:mm` (or `HH:mm:ss` if seconds present)
 *   - `datetime` → `YYYY-MM-DDTHH:mm` (no timezone, datetime-local
 *                  rejects `Z` / offset suffixes)
 *
 * The function is intentionally lenient:
 *   - Pass-through when the input already matches the expected shape.
 *   - Truncates a richer ISO string (e.g. `2026-05-16T10:23:45.000Z`)
 *     down to the mode-appropriate prefix.
 *   - Returns `''` for null / undefined / unparseable inputs (native
 *     inputs use `''` to represent "no value").
 */
export function isoToInputValue(
  mode: DateTimePickerMode,
  raw: string | null | undefined
): string {
  if (raw == null || raw === '') return '';

  // Fast path: already in the expected shape.
  if (mode === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (mode === 'time' && /^\d{2}:\d{2}(:\d{2})?$/.test(raw)) return raw;
  if (
    mode === 'datetime' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(raw)
  ) {
    return raw;
  }

  // Slow path: parse via Date and re-format locally.
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());

  if (mode === 'date') return `${yyyy}-${mm}-${dd}`;
  if (mode === 'time') return `${hh}:${mi}`;
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/**
 * Take a native input string and return the canonical "stored" value:
 * the same string for non-empty input, or `null` for empty (so the
 * bridge / consumer never receives the ambiguous empty string).
 */
function inputValueToStored(raw: string): string | null {
  return raw === '' ? null : raw;
}

/**
 * Dashforge TW DateTimePicker — bridge-integrated native date/time input.
 *
 * Three modes (`mode` prop):
 *   - `date`     — `<input type="date">` → `YYYY-MM-DD`
 *   - `time`     — `<input type="time">` → `HH:mm` (`HH:mm:ss` with `step={1}`)
 *   - `datetime` — `<input type="datetime-local">` → `YYYY-MM-DDTHH:mm`
 *
 * **Why native inputs instead of React Aria `<DatePicker>`?**
 *
 * 1. Zero new deps (`@internationalized/date` would add ~30 KB).
 * 2. Mirrors `@dashforge/ui/DateTimePicker` (MUI side) for API parity.
 * 3. Native inputs are AAA-grade a11y out of the box — screen readers,
 *    keyboard nav, OS-provided calendar/clock UI.
 * 4. Predictable state (no internal Aria state machine that fights
 *    controlled props — the F5-A lesson learned in `<Autocomplete>`).
 *
 * A richer custom-calendar version (range mode, locale awareness,
 * custom popover styling) can land as F5-B-bis built on Aria
 * `<DatePicker>` / `<Calendar>`.
 *
 * **A11y**:
 *   - `aria-invalid` driven by the resolved validation state.
 *   - `aria-describedby` links input ↔ helper/error.
 *   - Required fields get the native `required` attribute + a visual `*`.
 *   - `color-scheme: light dark` keeps the OS calendar icon readable
 *     in both color schemes.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    name,
    rules,
    mode = 'date',
    visibleWhen,
    layout = 'stacked',
    size,
    label,
    helperText,
    required,
    error,
    disabled,
    fullWidth,
    access,
    sx,
    slotProps,
    placeholder,
    min,
    max,
    step,
    value: explicitValue,
    defaultValue,
    onValueChange,
  } = props;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Per-field reactive snapshot. Same pattern as <TextField> — re-renders
  // this component when its OWN bridge value changes, but not when a
  // sibling field changes (perf contract).
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const inputId = useId();
  const helperId = `${inputId}-help`;

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
  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: string | null | undefined;

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
    // Pure uncontrolled mode: defer to native input's defaultValue.
    resolvedValue = undefined;
  }

  // Registration-supplied callback ref (RHF threads its own ref through
  // here in form mode). Stable callback to keep React 19 happy.
  const registrationRefFn = registration?.ref;
  const inputRef = useCallback(
    (instance: HTMLInputElement | null) => {
      if (typeof registrationRefFn === 'function') {
        registrationRefFn(instance);
      }
    },
    [registrationRefFn]
  );

  // ───── Render-time guards (after all hooks) ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = dateTimePickerVariants({
    size,
    layout,
    error: resolvedError,
    fullWidth,
    disabled: effectiveDisabled,
  });

  const inputType = inputTypeFor(mode);
  const nativeValue =
    resolvedValue === undefined ? undefined : isoToInputValue(mode, resolvedValue);
  const nativeDefault =
    !isFormMode && explicitValue === undefined && defaultValue !== undefined
      ? isoToInputValue(mode, defaultValue)
      : undefined;
  const nativeMin = min != null ? isoToInputValue(mode, min) : undefined;
  const nativeMax = max != null ? isoToInputValue(mode, max) : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = inputValueToStored(event.target.value);
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      void registration?.onChange?.({
        target: { name, value: next ?? '' },
        type: 'change',
      });
    }
    onValueChange?.(next);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isFormMode && bridge) {
      registration?.onBlur?.(event);
    }
  };

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(v.label(), slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(
                v.requiredMark(),
                slotProps?.requiredMark?.className
              )}
            >
              *
            </span>
          )}
        </label>
      )}

      <div
        className={cn(v.inputWrapper(), slotProps?.inputWrapper?.className)}
      >
        <input
          id={inputId}
          ref={inputRef}
          name={name}
          type={inputType}
          // Controlled in form / explicit-value mode; uncontrolled with
          // `defaultValue` otherwise. Mirrors the TextField pattern.
          value={nativeValue}
          defaultValue={nativeDefault}
          min={nativeMin}
          max={nativeMax}
          step={step}
          placeholder={placeholder}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          required={required}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(v.input(), slotProps?.input?.className)}
        />
      </div>

      {resolvedHelperText && (
        <p
          id={helperId}
          className={cn(
            resolvedError ? v.errorText() : v.helperText(),
            resolvedError
              ? slotProps?.errorText?.className
              : slotProps?.helperText?.className
          )}
        >
          {resolvedHelperText}
        </p>
      )}
    </div>
  );
}
