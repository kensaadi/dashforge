import MuiTextField from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import type { TextFieldProps } from './textField.types';
import { resolveValidationState } from './textField.validation';
import {
  createSelectIntegration,
  isNativeSelectMode,
} from './textField.select';

/**
 * Intelligent TextField component.
 *
 * Behavior:
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField
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
export function TextField(props: TextFieldProps) {
  const { name, rules, visibleWhen, ...rest } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures TextField re-renders when validation errors or touched state changes
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

  // Standalone mode: no form integration
  if (!bridge || typeof bridge.register !== 'function') {
    return <MuiTextField {...rest} name={name} />;
  }

  // Form-integrated mode
  const registration = bridge.register(name, rules);
  const validation = resolveValidationState(
    name,
    bridge,
    rest.error,
    rest.helperText
  );

  // Select mode: requires special handling for controlled value and touch tracking
  if (rest.select) {
    const selectProps = createSelectIntegration(
      name,
      bridge,
      registration,
      rest.slotProps,
      isNativeSelectMode(rest.slotProps)
    );

    return (
      <MuiTextField
        {...rest}
        name={name}
        value={selectProps.value}
        error={validation.error}
        helperText={validation.helperText}
        onChange={selectProps.onChange}
        onBlur={selectProps.onBlur}
        inputRef={selectProps.inputRef}
        slotProps={selectProps.slotProps}
      />
    );
  }

  // Standard TextField mode
  return (
    <MuiTextField
      {...rest}
      {...registration}
      name={name}
      error={validation.error}
      helperText={validation.helperText}
    />
  );
}
