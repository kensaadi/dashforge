import MuiTextField from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashTheme } from '@dashforge/theme-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import type { TextFieldProps } from './textField.types';
import { resolveValidationState } from './textField.validation';
import {
  createSelectIntegration,
  isNativeSelectMode,
} from './textField.select';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';

/**
 * Intelligent TextField component.
 *
 * Behavior:
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 * - Supports layout modes (stacked/inline) via layout prop
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 *
 * Layout:
 * - layout="stacked" (default): label above control
 * - layout="inline": label to the left of control
 * - When layout is specified, uses internal FieldLayoutShell
 * - MUI's variant prop is preserved for appearance (outlined/filled/standard)
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function TextField(props: TextFieldProps) {
  const {
    name,
    rules,
    visibleWhen,
    layout = 'stacked',
    label,
    helperText: userHelperText,
    required,
    error: userError,
    disabled,
    fullWidth,
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();

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

  // Resolve validation state (may come from bridge or explicit props)
  const validation =
    bridge && typeof bridge.register === 'function'
      ? resolveValidationState(name, bridge, userError, userHelperText)
      : { error: userError, helperText: userHelperText };

  // Generate unique ID for label association
  const fieldId = `dashforge-field-${name}`;

  // Standalone mode: no form integration
  if (!bridge || typeof bridge.register !== 'function') {
    const control = (
      <MuiTextField
        {...rest}
        id={fieldId}
        name={name}
        label={undefined}
        helperText={undefined}
        required={required}
        error={validation.error}
        disabled={disabled}
        fullWidth={fullWidth}
      />
    );

    return (
      <FieldLayoutShell
        layout={layout}
        label={label}
        required={required}
        helperText={validation.helperText}
        error={validation.error}
        disabled={disabled}
        htmlFor={fieldId}
        fullWidth={fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    );
  }

  // Form-integrated mode
  const registration = bridge.register(name, rules);

  // Select mode: requires special handling for controlled value and touch tracking
  if (rest.select) {
    const selectProps = createSelectIntegration(
      name,
      bridge,
      registration,
      rest.slotProps,
      isNativeSelectMode(rest.slotProps)
    );

    const control = (
      <MuiTextField
        {...rest}
        id={fieldId}
        name={name}
        label={undefined}
        helperText={undefined}
        required={required}
        value={selectProps.value}
        error={validation.error}
        disabled={disabled}
        fullWidth={fullWidth}
        onChange={selectProps.onChange}
        onBlur={selectProps.onBlur}
        inputRef={selectProps.inputRef}
        slotProps={selectProps.slotProps}
      />
    );

    return (
      <FieldLayoutShell
        layout={layout}
        label={label}
        required={required}
        helperText={validation.helperText}
        error={validation.error}
        disabled={disabled}
        htmlFor={fieldId}
        fullWidth={fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    );
  }

  // Standard TextField mode
  const control = (
    <MuiTextField
      {...rest}
      {...registration}
      id={fieldId}
      name={name}
      label={undefined}
      helperText={undefined}
      required={required}
      error={validation.error}
      disabled={disabled}
      fullWidth={fullWidth}
    />
  );

  return (
    <FieldLayoutShell
      layout={layout}
      label={label}
      required={required}
      helperText={validation.helperText}
      error={validation.error}
      disabled={disabled}
      htmlFor={fieldId}
      fullWidth={fullWidth}
      theme={dashTheme}
    >
      {control}
    </FieldLayoutShell>
  );
}
