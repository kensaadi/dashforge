import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useContext, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps
  extends Omit<MuiTextFieldProps, 'name' | 'type' | 'value' | 'onChange'> {
  name: string;
  mode?: DateTimePickerMode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;

  // explicit override (same precedence as other components)
  value?: string | null;

  // simplified callback
  onChange?: (value: string | null) => void;
}

/**
 * Converts ISO 8601 UTC string to local input value string.
 * Returns empty string if iso is null/undefined/invalid.
 */
function isoToInputValue(
  mode: DateTimePickerMode,
  iso: string | null | undefined
): string {
  if (!iso) return '';

  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (mode === 'date') {
      return `${year}-${month}-${day}`;
    } else if (mode === 'time') {
      return `${hours}:${minutes}`;
    } else {
      // datetime
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  } catch {
    return '';
  }
}

/**
 * Converts local input value string to ISO 8601 UTC string.
 * Returns null if input is empty or invalid.
 *
 * For time mode, uses baseIso to preserve the date component.
 */
function inputValueToIso(
  mode: DateTimePickerMode,
  input: string,
  baseIso?: string | null
): string | null {
  if (!input || input.trim() === '') return null;

  try {
    if (mode === 'datetime') {
      // Parse local datetime string: YYYY-MM-DDTHH:mm
      const date = new Date(input);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } else if (mode === 'date') {
      // Parse YYYY-MM-DD as local midday to reduce DST edge cases
      const date = new Date(`${input}T12:00`);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } else {
      // mode === 'time'
      // Time needs a base date to produce an ISO
      let baseDate: string;

      if (baseIso) {
        try {
          const parsedBase = new Date(baseIso);
          if (!isNaN(parsedBase.getTime())) {
            const year = parsedBase.getFullYear();
            const month = String(parsedBase.getMonth() + 1).padStart(2, '0');
            const day = String(parsedBase.getDate()).padStart(2, '0');
            baseDate = `${year}-${month}-${day}`;
          } else {
            // Invalid baseIso, use today
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            baseDate = `${year}-${month}-${day}`;
          }
        } catch {
          // Error parsing baseIso, use today
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          baseDate = `${year}-${month}-${day}`;
        }
      } else {
        // No baseIso, use today local date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        baseDate = `${year}-${month}-${day}`;
      }

      // Combine: baseDate + T + input (HH:mm)
      const date = new Date(`${baseDate}T${input}`);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    }
  } catch {
    return null;
  }
}

/**
 * Intelligent DateTimePicker component.
 *
 * Behavior:
 * - Uses native HTML date/time/datetime-local inputs (no MUI X dependency)
 * - Supports three modes: date, time, datetime (default: datetime)
 * - Storage policy: ISO 8601 UTC string | null
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as controlled component
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 * - Explicit value prop overrides bridge value
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 * - @mui/x-date-pickers
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    name,
    rules,
    visibleWhen,
    mode = 'datetime',
    value,
    onChange,
    inputProps: inputPropsProp,
    InputLabelProps: inputLabelPropsProp,
    onBlur: onBlurProp,
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures DateTimePicker re-renders when validation errors or touched state changes
  // Using void to explicitly mark as intentional subscription without side effects
  void bridge?.errorVersion;
  void bridge?.touchedVersion;
  void bridge?.dirtyVersion;
  void bridge?.submitCount;
  void bridge?.valuesVersion;

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // Internal state for plain mode (when not controlled by explicit value prop)
  const [internalInputValue, setInternalInputValue] = useState('');

  // Early return for visibility
  if (!isVisible) {
    return null;
  }

  // Determine native input type based on mode
  const inputType =
    mode === 'date' ? 'date' : mode === 'time' ? 'time' : 'datetime-local';

  // Merge inputProps and InputLabelProps with defaults
  const mergedInputProps = { step: 60, ...inputPropsProp };
  const mergedInputLabelProps = { shrink: true, ...inputLabelPropsProp };

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

    // Resolve ISO value precedence: explicit prop overrides bridge value
    const bridgeIsoValue = (bridge.getValue?.(name) as string | null) ?? null;
    const resolvedIsoValue = value !== undefined ? value : bridgeIsoValue;

    // Convert ISO to input display string
    const inputValue = isoToInputValue(mode, resolvedIsoValue);

    // Get auto error from form validation
    const autoErr = bridge.getError?.(name) ?? null;

    // Get touched state and submit count for error gating
    const autoTouched = bridge.isTouched?.(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;

    // Gate error display: only show if field touched OR form submitted
    // This prevents error spam while typing before user interacts with field
    const allowAutoError = autoTouched || submitCount > 0;

    // Compute resolved props with precedence:
    // 1. Explicit props override auto values (explicit wins)
    // 2. Auto values from form validation (gated by touched/submit)
    const resolvedError =
      rest.error !== undefined
        ? rest.error
        : Boolean(autoErr) && allowAutoError;

    // Resolve final helper text (explicit prop overrides bridge error message)
    // When explicitHelperText is provided, use it
    // When explicitError is explicitly false, suppress bridge error message
    // Otherwise show bridge error message if allowAutoError
    const resolvedHelperText =
      rest.helperText !== undefined
        ? rest.helperText
        : rest.error === false
        ? undefined
        : allowAutoError
        ? autoErr?.message
        : undefined;

    // Wrap onChange to update both registration and bridge
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Extract input string from event
      const inputString = event.target.value;

      // Convert input string to ISO or null
      const isoOrNull = inputValueToIso(mode, inputString, resolvedIsoValue);

      // Create a properly structured synthetic event
      const syntheticEvent = {
        target: { name, value: isoOrNull },
        type: 'change',
      };

      // 1. Call registration.onChange first (ignore returned promise if any)
      if (registration.onChange) {
        void registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, isoOrNull);
      }

      // 3. Finally call user's onChange if provided
      if (onChange) {
        onChange(isoOrNull);
      }
    };

    // Wrap onBlur to mark as touched and call user handler
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // FIX #2: Read the actual input value at blur time
      const inputString = event.currentTarget.value;

      // Compute ISO from current input string
      const isoOrNull = inputValueToIso(mode, inputString, resolvedIsoValue);

      // Create a synthetic blur event for touch tracking
      const syntheticEvent = {
        target: { name, value: isoOrNull },
        type: 'blur',
      };

      // 1. Call registration.onBlur to mark as touched (ignore returned promise if any)
      if (registration.onBlur) {
        void registration.onBlur(syntheticEvent);
      }

      // 2. Then call user's onBlur if provided
      if (onBlurProp) {
        onBlurProp(event);
      }
    };

    return (
      <MuiTextField
        name={name}
        type={inputType}
        value={inputValue}
        error={resolvedError}
        helperText={resolvedHelperText}
        {...rest}
        // FIX #1: Pass merged props AFTER {...rest} to prevent override
        InputLabelProps={mergedInputLabelProps}
        inputProps={mergedInputProps}
        // IMPORTANT: Put handlers AFTER {...rest} spread
        // to ensure they override any handlers from rest
        onChange={handleChange}
        onBlur={handleBlur}
        inputRef={registration.ref}
      />
    );
  }

  // Standalone fallback (plain mode)
  // Determine display value: explicit prop overrides internal state
  const displayInputValue =
    value !== undefined ? isoToInputValue(mode, value) : internalInputValue;

  const handlePlainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Extract input string from event
    const inputString = event.target.value;

    // Update internal state with raw input string (not ISO)
    setInternalInputValue(inputString);

    // Convert input string to ISO or null
    // For plain mode, use current value as baseIso for time mode
    const baseIso = value !== undefined ? value : null;
    const isoOrNull = inputValueToIso(mode, inputString, baseIso);

    // Call user's onChange if provided
    if (onChange) {
      onChange(isoOrNull);
    }
  };

  return (
    <MuiTextField
      name={name}
      type={inputType}
      value={displayInputValue}
      {...rest}
      // FIX #1: Pass merged props AFTER {...rest} to prevent override
      InputLabelProps={mergedInputLabelProps}
      inputProps={mergedInputProps}
      // IMPORTANT: Put handler AFTER {...rest} spread
      onChange={handlePlainChange}
    />
  );
}
