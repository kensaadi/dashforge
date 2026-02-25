import MuiRadioGroup from '@mui/material/RadioGroup';
import type { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { FieldRegistration, Engine } from '@dashforge/ui-core';

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'name'> {
  name: string;
  options: RadioGroupOption[];
  label?: React.ReactNode;
  rules?: unknown;
  helperText?: string;
  error?: boolean;
  visibleWhen?: ((engine: Engine) => boolean) | undefined;
}

/**
 * RadioGroup component that integrates with DashForm.
 *
 * Supports two modes:
 * 1. Plain mode (outside DashFormContext): Renders a standard MUI RadioGroup
 * 2. Bound mode (inside DashFormContext): Integrates with form bridge for value/error binding
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
 * <RadioGroup
 *   name="color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' }
 *   ]}
 *   value={selectedColor}
 *   onChange={(e) => setSelectedColor(e.target.value)}
 * />
 *
 * // Bound mode (inside DashForm)
 * <RadioGroup
 *   name="color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' }
 *   ]}
 *   rules={{ required: true }}
 * />
 * ```
 */
export function RadioGroup(props: RadioGroupProps): React.ReactElement | null {
  const {
    name,
    options,
    label,
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
    return (
      <FormControl error={explicitError}>
        {label && <FormLabel>{label}</FormLabel>}
        <MuiRadioGroup
          name={name}
          value={explicitValue ?? ''}
          onChange={explicitOnChange}
          {...muiProps}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled}
            />
          ))}
        </MuiRadioGroup>
        {explicitHelperText && (
          <FormHelperText>{explicitHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Bound mode: integrate with bridge

  // Register field with bridge (safe check for register function)
  if (!bridge.register) {
    // Fallback to plain mode if register is not available
    return (
      <FormControl error={explicitError}>
        {label && <FormLabel>{label}</FormLabel>}
        <MuiRadioGroup
          name={name}
          value={explicitValue ?? ''}
          onChange={explicitOnChange}
          {...muiProps}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled}
            />
          ))}
        </MuiRadioGroup>
        {explicitHelperText && (
          <FormHelperText>{explicitHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  const registration: FieldRegistration = bridge.register(name, rules);

  // Get current value from bridge (default to empty string if undefined)
  const autoValue = (bridge.getValue?.(name) as string | undefined) ?? '';

  // Resolve final value (explicit prop overrides bridge value)
  const resolvedValue = explicitValue !== undefined ? explicitValue : autoValue;

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
  const resolvedHelperText =
    explicitHelperText !== undefined
      ? explicitHelperText
      : allowAutoError
      ? autoErr?.message
      : undefined;

  // Handle change: update bridge first, then call registration.onChange, then user onChange
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    // Use MUI RadioGroup's second argument as source of truth
    const newValue = value;

    // Update bridge value immediately (no delayed updates)
    if (bridge.setValue) {
      bridge.setValue(name, newValue);
    }

    // Call registration.onChange with event-like shape
    if (registration.onChange) {
      registration.onChange({
        target: {
          name,
          value: newValue,
        },
        type: 'change',
      });
    }

    // Call user onChange last (if provided)
    if (explicitOnChange) {
      explicitOnChange(event, value);
    }
  };

  // Handle blur: mark field as touched
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (registration.onBlur) {
      // Ensure target.value is a string (default to '' if undefined)
      const currentValue =
        (bridge.getValue?.(name) as string | undefined) ?? '';
      registration.onBlur({
        target: {
          name,
          value: currentValue,
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
    <FormControl error={resolvedError}>
      {label && <FormLabel>{label}</FormLabel>}
      <MuiRadioGroup
        name={name}
        value={resolvedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...muiProps}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </MuiRadioGroup>
      {resolvedHelperText && (
        <FormHelperText>{resolvedHelperText}</FormHelperText>
      )}
    </FormControl>
  );
}
