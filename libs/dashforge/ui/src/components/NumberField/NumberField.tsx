import TextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { FieldRegistration, Engine } from '@dashforge/ui-core';

export interface NumberFieldProps
  extends Omit<MuiTextFieldProps, 'name' | 'type' | 'value' | 'onChange'> {
  name: string;
  rules?: unknown;
  visibleWhen?: ((engine: Engine) => boolean) | undefined;
  value?: number | string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * NumberField component that integrates with DashForm.
 *
 * Supports two modes:
 * 1. Plain mode (outside DashFormContext): Renders a standard MUI TextField with type="number"
 * 2. Bound mode (inside DashFormContext): Integrates with form bridge for value/error binding
 *
 * Value policy:
 * - Bound-mode storage type: number | null
 * - UI input display:
 *   - number -> String(number)
 *   - null/undefined -> '' (empty string)
 * - On user input:
 *   - '' -> setValue(name, null)
 *   - valid number -> setValue(name, parsedNumber)
 * - Parsing: Uses Number(...) and Number.isFinite(...) (no locale parsing)
 * - Does not allow NaN into the bridge
 *
 * Features:
 * - Automatic registration with DashForm bridge
 * - Form Closure v1 error gating (touched OR submitCount > 0)
 * - Prop precedence (explicit props override bridge values)
 * - Visibility control via visibleWhen predicate
 * - Touch tracking on blur
 * - Immediate UI updates (no delayed state)
 *
 * @example
 * ```tsx
 * // Plain mode
 * <NumberField
 *   name="age"
 *   label="Age"
 *   value={age}
 *   onChange={(e) => setAge(Number(e.target.value))}
 * />
 *
 * // Bound mode (inside DashForm)
 * <NumberField
 *   name="age"
 *   label="Age"
 *   rules={{ required: true, min: 0, max: 120 }}
 * />
 * ```
 */
export function NumberField(
  props: NumberFieldProps
): React.ReactElement | null {
  const {
    name,
    rules,
    helperText: explicitHelperText,
    error: explicitError,
    visibleWhen,
    value: explicitValue,
    onChange: explicitOnChange,
    ...muiProps
  } = props;

  const bridge = useContext(DashFormContext);

  // Get engine for visibility evaluation
  const engine = bridge?.engine;

  // Subscribe to bridge state changes for reactive updates
  // Access version strings to create subscriptions (causes re-render when they change)
  void bridge?.errorVersion;
  void bridge?.touchedVersion;
  void bridge?.dirtyVersion;
  void bridge?.submitCount;
  void bridge?.valuesVersion;

  // Evaluate visibility predicate
  const isVisible = useEngineVisibility(engine, visibleWhen);
  if (!isVisible) {
    return null;
  }

  // Plain mode: render without bridge integration
  if (!bridge) {
    // Convert value to input string
    const inputValue =
      explicitValue == null
        ? ''
        : typeof explicitValue === 'number'
        ? String(explicitValue)
        : explicitValue;

    return (
      <TextField
        name={name}
        type="number"
        value={inputValue}
        onChange={explicitOnChange}
        helperText={explicitHelperText}
        error={explicitError}
        {...muiProps}
      />
    );
  }

  // Bound mode: integrate with bridge

  // Register field with bridge (safe check for register function)
  if (!bridge.register) {
    // Fallback to plain mode if register is not available
    const inputValue =
      explicitValue == null
        ? ''
        : typeof explicitValue === 'number'
        ? String(explicitValue)
        : explicitValue;

    return (
      <TextField
        name={name}
        type="number"
        value={inputValue}
        onChange={explicitOnChange}
        helperText={explicitHelperText}
        error={explicitError}
        {...muiProps}
      />
    );
  }

  const registration: FieldRegistration = bridge.register(name, rules);

  // Get current value from bridge (number | null | undefined)
  const autoValue = bridge.getValue?.(name) as number | null | undefined;

  // Convert bridge value to input string
  // number -> String(number), null/undefined -> ''
  const autoInputValue = autoValue == null ? '' : String(autoValue);

  // Resolve final input value (explicit prop overrides bridge value)
  let resolvedInputValue: string;
  if (explicitValue !== undefined) {
    // Explicit value provided - convert to string
    if (explicitValue == null) {
      resolvedInputValue = '';
    } else if (typeof explicitValue === 'number') {
      resolvedInputValue = String(explicitValue);
    } else {
      // explicitValue is string (allow it for controlled empty state)
      resolvedInputValue = explicitValue;
    }
  } else {
    resolvedInputValue = autoInputValue;
  }

  // Get error state from bridge
  const autoErr = bridge.getError?.(name) ?? null;

  // Get touched state and submit count for error gating
  const autoTouched = bridge.isTouched?.(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  // Form Closure v1: Show error only if touched OR submitCount > 0
  const allowAutoError = autoTouched || submitCount > 0;

  // Resolve final error state (explicit prop overrides bridge error)
  const resolvedError =
    explicitError !== undefined
      ? explicitError
      : Boolean(autoErr) && allowAutoError;

  // Resolve final helper text (explicit prop overrides bridge error message)
  // When explicitHelperText is provided, use it
  // When explicitError is explicitly false, suppress bridge error message
  // Otherwise show bridge error message if allowAutoError
  const resolvedHelperText =
    explicitHelperText !== undefined
      ? explicitHelperText
      : explicitError === false
      ? undefined
      : allowAutoError
      ? autoErr?.message
      : undefined;

  // Handle change: update bridge FIRST (source of truth), then notify registration, then user onChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value; // string from input

    // Parse value: '' -> null, valid number -> number, invalid -> do not write to bridge
    let parsedValue: number | null;
    if (raw === '') {
      parsedValue = null;
    } else {
      const num = Number(raw);
      if (Number.isFinite(num)) {
        parsedValue = num;
      } else {
        // Invalid number (NaN or Infinity) - do not write to bridge
        if (explicitOnChange) {
          explicitOnChange(event);
        }
        return;
      }
    }

    // 1) Update bridge immediately with normalized value (number|null)
    // This guarantees the bridge never stores strings for NumberField.
    if (bridge.setValue) {
      bridge.setValue(name, parsedValue);
    }

    // 2) Notify registration (validation, touched logic, etc.)
    // We pass the raw string because validators may want the original input text.
    if (registration.onChange) {
      registration.onChange({
        target: {
          name,
          value: raw,
        },
        type: 'change',
      });
    }

    // 3) Re-assert bridge value to avoid any registration implementation
    // accidentally writing a string into the bridge.
    if (bridge.setValue) {
      bridge.setValue(name, parsedValue);
    }

    // 4) Call user onChange last (if provided)
    if (explicitOnChange) {
      explicitOnChange(event);
    }
  };

  // Handle blur: mark field as touched
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (registration.onBlur) {
      // Use current input value (string) from the event
      const currentRawValue = event.target.value;
      registration.onBlur({
        target: {
          name,
          value: currentRawValue,
        },
        type: 'blur',
      });
    }

    // Call user onBlur if provided via muiProps
    if (muiProps.onBlur) {
      muiProps.onBlur(event);
    }
  };

  return (
    <TextField
      name={name}
      type="number"
      value={resolvedInputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={resolvedHelperText}
      error={resolvedError}
      {...muiProps}
    />
  );
}
