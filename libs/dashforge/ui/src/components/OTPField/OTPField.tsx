import { useContext } from 'react';
import { Box, FormLabel, FormHelperText } from '@mui/material';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { FieldRegistration } from '@dashforge/ui-core';
import { useAccessState } from '../../hooks/useAccessState';
import type { OTPFieldProps } from './otpField.types';
import { OTPInput } from './OTPInput';
import { getContainerStyles } from './otpField.styles';

/**
 * OTPField component for one-time password / verification code input.
 *
 * Supports two modes:
 * 1. Plain mode (outside DashFormContext): Renders with explicit value/onChange
 * 2. Bound mode (inside DashFormContext): Integrates with form bridge for value/error binding
 *
 * Value policy:
 * - Storage type: string
 * - External value: single string (e.g., "123456")
 * - Empty state: "" (empty string)
 * - Partial state: allowed during typing (e.g., "12")
 *
 * Features:
 * - Single native input + visual slots pattern
 * - Caret is ONLY source of truth for visual slot focus
 * - Automatic registration with DashForm bridge
 * - Form Closure v1 error gating (touched OR submitCount > 0)
 * - Prop precedence (explicit props override bridge values)
 * - Visibility control via visibleWhen predicate
 * - Touch tracking on blur
 * - RBAC access control via access prop
 * - Paste handling with sanitization
 * - Keyboard navigation (arrows, home, end, backspace, delete)
 * - onComplete callback when all slots filled
 *
 * @example
 * ```tsx
 * // Plain mode
 * <OTPField
 *   name="otp"
 *   label="Enter code"
 *   value={otpValue}
 *   onChange={(value) => setOtpValue(value)}
 * />
 *
 * // Bound mode (inside DashForm)
 * <OTPField
 *   name="otp"
 *   label="Enter verification code"
 *   length={6}
 *   mode="numeric"
 *   rules={{ required: true }}
 * />
 * ```
 */
export function OTPField(props: OTPFieldProps): React.ReactElement | null {
  const {
    name,
    rules,
    helperText: explicitHelperText,
    error: explicitError,
    visibleWhen,
    value: explicitValue,
    onChange: explicitOnChange,
    access,
    disabled,
    length = 6,
    mode = 'numeric',
    onComplete,
    autoFocus = false,
    label,
    required = false,
    fullWidth = false,
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

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

  // Early return for visibleWhen
  if (!isVisible) {
    return null;
  }

  // Early return for RBAC visibility
  if (!accessState.visible) {
    return null;
  }

  // Compute effective disabled state (OR logic: any source can disable)
  const effectiveDisabled = Boolean(disabled) || accessState.disabled;

  // Plain mode: render without bridge integration
  if (!bridge) {
    const handleChange = (value: string) => {
      if (explicitOnChange) {
        explicitOnChange(value);
      }
    };

    return (
      <Box sx={getContainerStyles(fullWidth)}>
        {label && (
          <FormLabel required={required} error={explicitError}>
            {label}
          </FormLabel>
        )}
        <OTPInput
          value={explicitValue ?? ''}
          onChange={handleChange}
          length={length}
          mode={mode}
          disabled={effectiveDisabled}
          autoFocus={autoFocus}
          onComplete={onComplete}
          error={explicitError}
          inputProps={{
            id: `${name}-input`,
            name,
            'aria-label':
              typeof label === 'string' ? label : `Enter ${length}-digit code`,
            'aria-required': required,
            'aria-invalid': explicitError,
            'aria-describedby': explicitHelperText
              ? `${name}-helper`
              : undefined,
          }}
        />
        {explicitHelperText && (
          <FormHelperText id={`${name}-helper`} error={explicitError}>
            {explicitHelperText}
          </FormHelperText>
        )}
      </Box>
    );
  }

  // Bound mode: integrate with bridge

  // Register field with bridge (safe check for register function)
  if (!bridge.register) {
    // Fallback to plain mode if register is not available
    const handleChange = (value: string) => {
      if (explicitOnChange) {
        explicitOnChange(value);
      }
    };

    return (
      <Box sx={getContainerStyles(fullWidth)}>
        {label && (
          <FormLabel required={required} error={explicitError}>
            {label}
          </FormLabel>
        )}
        <OTPInput
          value={explicitValue ?? ''}
          onChange={handleChange}
          length={length}
          mode={mode}
          disabled={effectiveDisabled}
          autoFocus={autoFocus}
          onComplete={onComplete}
          error={explicitError}
          inputProps={{
            id: `${name}-input`,
            name,
            'aria-label':
              typeof label === 'string' ? label : `Enter ${length}-digit code`,
            'aria-required': required,
            'aria-invalid': explicitError,
            'aria-describedby': explicitHelperText
              ? `${name}-helper`
              : undefined,
          }}
        />
        {explicitHelperText && (
          <FormHelperText id={`${name}-helper`} error={explicitError}>
            {explicitHelperText}
          </FormHelperText>
        )}
      </Box>
    );
  }

  const registration: FieldRegistration = bridge.register(name, rules);

  // Get current value from bridge (string)
  const autoValue = bridge.getValue?.(name) as string | undefined;

  // Convert bridge value to string (handle null/undefined)
  const autoStringValue = typeof autoValue === 'string' ? autoValue : '';

  // Resolve final value (explicit prop overrides bridge value)
  const resolvedValue =
    explicitValue !== undefined ? explicitValue : autoStringValue;

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
      : explicitError === false
      ? undefined
      : allowAutoError
      ? autoErr?.message
      : undefined;

  // Handle change: update bridge FIRST, then notify registration, then user onChange
  const handleChange = (value: string) => {
    // 1) Update bridge immediately with string value
    if (bridge.setValue) {
      bridge.setValue(name, value);
    }

    // 2) Notify registration (validation, touched logic, etc.)
    if (registration.onChange) {
      registration.onChange({
        target: {
          name,
          value,
        },
        type: 'change',
      });
    }

    // 3) Re-assert bridge value (prevent registration overwrite)
    if (bridge.setValue) {
      bridge.setValue(name, value);
    }

    // 4) Call user onChange last (if provided)
    if (explicitOnChange) {
      explicitOnChange(value);
    }
  };

  // Handle blur: mark field as touched
  const handleBlur = () => {
    if (registration.onBlur) {
      // Use current value from bridge
      const currentValue = bridge.getValue?.(name) as string | undefined;
      const currentStringValue =
        typeof currentValue === 'string' ? currentValue : '';

      registration.onBlur({
        target: {
          name,
          value: currentStringValue,
        },
        type: 'blur',
      });
    }
  };

  return (
    <Box sx={getContainerStyles(fullWidth)}>
      {label && (
        <FormLabel required={required} error={resolvedError}>
          {label}
        </FormLabel>
      )}
      <OTPInput
        value={resolvedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        length={length}
        mode={mode}
        disabled={effectiveDisabled}
        autoFocus={autoFocus}
        onComplete={onComplete}
        error={resolvedError}
        inputProps={{
          id: `${name}-input`,
          name,
          'aria-label':
            typeof label === 'string' ? label : `Enter ${length}-digit code`,
          'aria-required': required,
          'aria-invalid': resolvedError,
          'aria-describedby': resolvedHelperText ? `${name}-helper` : undefined,
        }}
      />
      {resolvedHelperText && (
        <FormHelperText id={`${name}-helper`} error={resolvedError}>
          {resolvedHelperText}
        </FormHelperText>
      )}
    </Box>
  );
}
