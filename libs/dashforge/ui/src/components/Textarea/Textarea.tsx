import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';

export interface TextareaProps extends Omit<MuiTextFieldProps, 'name'> {
  name: string;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
}

/**
 * Intelligent Textarea component.
 *
 * Behavior:
 * - Always renders as multiline textarea (multiline={true})
 * - Defaults to minRows={3} (can be overridden)
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField with multiline
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function Textarea(props: TextareaProps) {
  const { name, rules, visibleWhen, minRows = 3, ...rest } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures Textarea re-renders when validation errors or touched state changes
  // Using void to explicitly mark as intentional subscription without side effects
  void bridge?.errorVersion;
  void bridge?.touchedVersion;
  void bridge?.dirtyVersion;
  void bridge?.submitCount;
  void bridge?.valuesVersion;

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // Early return for visibility
  if (!isVisible) {
    return null;
  }

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

    // Get current value from bridge (default to empty string)
    const currentValue = bridge.getValue?.(name) ?? '';

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

    // Handle value precedence: explicit prop overrides bridge value
    const resolvedValue = rest.value !== undefined ? rest.value : currentValue;

    // Wrap onChange to update both registration and bridge
    const handleChange = async (event: unknown) => {
      // Extract value from event
      let value: unknown;
      if (event && typeof event === 'object' && 'target' in event) {
        const target = (event as { target: unknown }).target;
        if (target && typeof target === 'object' && 'value' in target) {
          value = (target as { value: unknown }).value;
        }
      }

      // Create a properly structured synthetic event
      const syntheticEvent = {
        target: { name, value },
        type: 'change',
      };

      // 1. Call registration.onChange first
      if (registration.onChange) {
        await registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, value);
      }

      // 3. Finally call user's onChange if provided
      if (rest.onChange) {
        await rest.onChange(
          event as Parameters<NonNullable<typeof rest.onChange>>[0]
        );
      }
    };

    // Wrap onBlur to mark as touched and call user handler
    const handleBlur = async (event: unknown) => {
      // Get the current value at blur time to avoid stale closure
      const valueAtBlurTime = bridge.getValue?.(name) ?? '';

      // Create a synthetic blur event for touch tracking
      const syntheticEvent = {
        target: { name, value: valueAtBlurTime },
        type: 'blur',
      };

      // 1. Call registration.onBlur to mark as touched
      if (registration.onBlur) {
        await registration.onBlur(syntheticEvent);
      }

      // 2. Then call user's onBlur if provided
      if (rest.onBlur) {
        await rest.onBlur(
          event as Parameters<NonNullable<typeof rest.onBlur>>[0]
        );
      }
    };

    return (
      <MuiTextField
        name={name}
        multiline={true}
        minRows={minRows}
        value={resolvedValue}
        error={resolvedError}
        helperText={resolvedHelperText}
        {...rest}
        // IMPORTANT: Put handlers AFTER {...rest} spread
        // to ensure they override any handlers from rest
        onChange={handleChange as MuiTextFieldProps['onChange']}
        onBlur={handleBlur as MuiTextFieldProps['onBlur']}
        inputRef={registration.ref}
      />
    );
  }

  // Standalone fallback (plain mode)
  return (
    <MuiTextField name={name} multiline={true} minRows={minRows} {...rest} />
  );
}
