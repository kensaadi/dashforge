import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { numberFieldVariants } from './numberField.variants.js';
import type { NumberFieldProps } from './numberField.types.js';

/**
 * Format a numeric bridge value for the input UI.
 *
 * Strict rules (mirror the MUI side):
 *  - `number` → `String(n)` (no thousands separators, no locale)
 *  - `null` / `undefined` → empty string (so the input shows blank)
 *  - non-finite numbers (NaN, ±Infinity) are coerced to `""` and never written
 *    back to the bridge
 *
 * @internal
 */
function formatForDisplay(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') {
    return Number.isFinite(v) ? String(v) : '';
  }
  if (typeof v === 'string') return v;
  return '';
}

/**
 * Coerce a string from the input back to the bridge storage type.
 *
 *  - `""` → `null` (cleared)
 *  - parseable finite number → that number
 *  - anything else → `undefined` (caller should NOT write to the bridge)
 *
 * @internal
 */
function parseFromInput(str: string): number | null | undefined {
  if (str === '') return null;
  // Allow the user to type the leading sign or a trailing decimal point without
  // committing a partial number to the bridge — those parse to NaN here.
  const n = Number(str);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Dashforge TW NumberField — bridge-integrated numeric input.
 *
 * Mirrors `@dashforge/ui/NumberField` semantics: storage type is
 * `number | null`, NaN is never written, `Number.isFinite` is the guard.
 * Renders a native `<input type="number">` with an OPTIONAL +/− stepper
 * (opt-in via `showStepper`). The native browser spinner is suppressed
 * in CSS so visual consistency is preserved cross-browser.
 *
 * **A11y**:
 *  - `aria-invalid` from resolved validation state
 *  - `aria-describedby` links the input to the helper/error text
 *  - `min` / `max` / `step` forwarded to the native input (which exposes
 *    `aria-valuemin` / `aria-valuemax` automatically)
 */
export function NumberField(props: NumberFieldProps) {
  const themeDefaults = useComponentDefaults('NumberField');
  const merged: NumberFieldProps = { ...themeDefaults?.defaults, ...props };
  const {
    name,
    rules,
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
    step = 1,
    showStepper = false,
    onChange: userOnChange,
    onBlur: userOnBlur,
    value: userValue,
    defaultValue,
    ...rest
  } = merged;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Per-field subscription side-effect. Value read happens via
  // `bridge.getValue(name)` (mirrors MUI side — avoids first-render
  // undefined window from `useDashFieldMeta.value`).
  useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const inputId = useId();

  /*
   * Local state for the STANDALONE UNCONTROLLED case (no bridge, no
   * `value` prop, only `defaultValue`). Mirrors OTPField. Without this,
   * `resolvedDisplayValue` would be a snapshot computed ONCE from
   * `defaultValue` and the controlled `<input value={...}>` would
   * snap user input back on every keystroke / stepper click — same
   * trap that hit Checkbox + RadioGroup in this package.
   *
   * In form mode the bridge owns state. In standalone CONTROLLED mode
   * (consumer passes `value`) the consumer owns state. Only this
   * branch needs the local hook.
   */
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(() =>
    formatForDisplay(defaultValue)
  );
  const helperId = `${inputId}-help`;

  // StrictMode-safe unregister-on-unmount
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

  // ───── Derived (every hook MUST be called above the early returns) ─────
  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedDisplayValue: string;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    resolvedDisplayValue =
      userValue !== undefined
        ? formatForDisplay(userValue)
        : formatForDisplay(bridge.getValue(name));
  } else {
    resolvedDisplayValue =
      userValue !== undefined
        ? formatForDisplay(userValue)
        : uncontrolledValue;
  }

  const writeToBridge = (parsed: number | null | undefined) => {
    if (!isFormMode || !bridge) return;
    if (parsed === undefined) return; // partial/invalid — don't pollute the bridge
    bridge.setValue?.(name, parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFromInput(e.target.value);
    writeToBridge(parsed);
    if (isFormMode && registration?.onChange) {
      // Forward to RHF — pass through the original event so RHF's
      // internal logic still sees the raw string change.
      void registration.onChange(e);
    }
    // Standalone uncontrolled mode: mirror the raw input string so the
    // controlled `<input value={...}>` reflects what the user typed.
    // Partial states (e.g. "-", "1.") are kept verbatim — `parseFromInput`
    // returns `undefined` for them so `writeToBridge` is a no-op above.
    if (!isFormMode && userValue === undefined) {
      setUncontrolledValue(e.target.value);
    }
    userOnChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isFormMode && registration?.onBlur) {
      registration.onBlur(e);
    }
    userOnBlur?.(e);
  };

  const stepBy = (delta: number) => {
    const current = isFormMode && bridge
      ? (bridge.getValue(name) as number | null | undefined)
      : parseFromInput(resolvedDisplayValue);
    const base = typeof current === 'number' && Number.isFinite(current) ? current : 0;
    let next = base + delta;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    writeToBridge(next);
    // Standalone uncontrolled: also persist the new value to local
    // state so the visible display tracks the stepper click.
    if (!isFormMode && userValue === undefined) {
      setUncontrolledValue(formatForDisplay(next));
    }
  };

  const canIncrement =
    !effectiveDisabled && (typeof max !== 'number' || (parseFromInput(resolvedDisplayValue) ?? -Infinity) < max);
  const canDecrement =
    !effectiveDisabled && (typeof min !== 'number' || (parseFromInput(resolvedDisplayValue) ?? Infinity) > min);

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

  const v = numberFieldVariants({
    size,
    layout,
    error: resolvedError,
    fullWidth,
    disabled: effectiveDisabled,
  });

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
              className={cn(v.requiredMark(), slotProps?.requiredMark?.className)}
            >
              *
            </span>
          )}
        </label>
      )}

      <div className={cn(v.inputWrapper(), slotProps?.inputWrapper?.className)}>
        <input
          {...rest}
          id={inputId}
          name={name}
          type="number"
          placeholder={placeholder}
          value={resolvedDisplayValue}
          min={min}
          max={max}
          step={step}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          required={required}
          aria-invalid={resolvedError || undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={inputRef}
          className={cn(v.input(), slotProps?.input?.className)}
        />

        {showStepper && (
          <div
            className={cn(v.stepper(), slotProps?.stepper?.className)}
            aria-hidden="true"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => stepBy(step)}
              disabled={!canIncrement}
              className={cn(v.stepperButton(), slotProps?.stepperButton?.className)}
              aria-label="Increment"
            >
              ▲
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => stepBy(-step)}
              disabled={!canDecrement}
              className={cn(v.stepperButton(), slotProps?.stepperButton?.className)}
              aria-label="Decrement"
            >
              ▼
            </button>
          </div>
        )}
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
