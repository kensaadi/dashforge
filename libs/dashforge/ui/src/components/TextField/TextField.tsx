import MuiTextField from '@mui/material/TextField';
import { useContext, useEffect, useRef } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import type { TextFieldProps } from './textField.types';
import { resolveValidationState } from './textField.validation';
import {
  createSelectIntegration,
  isNativeSelectMode,
  sanitizeSelectDisplayValue,
} from './textField.select';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import { useAccessState } from '../../hooks/useAccessState';

/**
 * Intelligent TextField component.
 *
 * Behavior:
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 * - Supports layout modes (floating/stacked/inline) via layout prop
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 *
 * Layout:
 * - layout="floating" (default): standard MUI floating label behavior
 * - layout="stacked": external label above control
 * - layout="inline": external label to the left of control
 * - When layout is stacked/inline, uses internal FieldLayoutShell
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
    layout = 'floating',
    label,
    helperText: userHelperText,
    required,
    error: userError,
    disabled,
    fullWidth,
    __selectAvailableValues,
    access,
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();

  // Granular per-field subscription: re-renders this component ONLY when
  // its own field state changes (value/error/touched/dirty/submitCount).
  // Replaces the legacy `void bridge?.errorVersion` global subscribe trick
  // which forced every consumer to re-render on every keystroke anywhere
  // in the form.
  const fieldMeta = useDashFieldMeta(name);

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

  // Release engine/RHF state on REAL unmount when registered through the
  // bridge. Important details:
  //  - The bridge object identity changes on every keystroke (its memo deps
  //    include version strings). We must NOT re-run cleanup on those changes,
  //    otherwise rhf.unregister() would fire mid-typing and wipe the value.
  //  - StrictMode performs a fake mount/unmount/remount in dev. We defer the
  //    unregister to a microtask and skip it if the component is still
  //    mounted (i.e. it was a StrictMode double-invoke, not a real unmount).
  //  - We capture the latest bridge/name via a ref so the cleanup uses the
  //    current values without taking them as effect dependencies.
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: capturedBridge, name: capturedName } =
        unregisterRef.current;
      queueMicrotask(() => {
        if (!isMountedRef.current) {
          capturedBridge?.unregister?.(capturedName);
        }
      });
    };
  }, []);

  // Early return for visibleWhen
  if (!isVisible) {
    return null;
  }

  // Early return for RBAC visibility
  if (!accessState.visible) {
    return null;
  }

  // Compute effective disabled state (OR logic: any source can disable)
  // Special case: readonly + select mode → use disabled instead
  const effectiveDisabled =
    Boolean(disabled) ||
    accessState.disabled ||
    (accessState.readonly && Boolean(rest.select));

  // Compute effective readonly state (OR logic, only for non-select mode)
  // Check if slotProps.input.readOnly is already set
  const existingReadOnly =
    rest.slotProps?.input &&
    typeof rest.slotProps.input === 'object' &&
    'readOnly' in rest.slotProps.input
      ? rest.slotProps.input.readOnly
      : false;
  const shouldApplyReadonly =
    !rest.select && (existingReadOnly || accessState.readonly);

  // Merge readonly into slotProps (preserving existing slotProps)
  const mergedSlotProps = shouldApplyReadonly
    ? {
        ...rest.slotProps,
        input: {
          ...(rest.slotProps?.input || {}),
          readOnly: true,
        },
      }
    : rest.slotProps;

  // Resolve validation state (may come from bridge or explicit props)
  const validation =
    bridge && typeof bridge.register === 'function'
      ? resolveValidationState(name, bridge, userError, userHelperText)
      : { error: userError, helperText: userHelperText };

  // Generate unique ID for label association
  const fieldId = `dashforge-field-${name}`;

  // Step 05c/05d: Sanitize display value for standalone select mode
  // If in select mode with available values, apply same sanitization as bridge mode
  // This includes controlled (with value prop) and uncontrolled (without value prop) cases
  const sanitizedRest = { ...rest };
  if (rest.select && __selectAvailableValues !== undefined) {
    // Sanitize value if present (controlled mode)
    if ('value' in rest) {
      sanitizedRest.value = sanitizeSelectDisplayValue(
        rest.value,
        __selectAvailableValues
      );
    }
    // Sanitize defaultValue if present (uncontrolled mode - Step 05d)
    else if ('defaultValue' in rest) {
      sanitizedRest.defaultValue = sanitizeSelectDisplayValue(
        rest.defaultValue,
        __selectAvailableValues
      );
    }
    // No value/defaultValue: sanitize to empty string (plain mode - Step 05d)
    else {
      sanitizedRest.value = '';
    }
  }

  // Standalone mode: no form integration
  if (!bridge || typeof bridge.register !== 'function') {
    // Floating layout: use standard MUI TextField with internal label
    if (layout === 'floating') {
      return (
        <MuiTextField
          {...sanitizedRest}
          id={fieldId}
          name={name}
          label={label}
          helperText={validation.helperText}
          required={required}
          error={validation.error}
          disabled={effectiveDisabled}
          fullWidth={fullWidth}
          slotProps={mergedSlotProps}
        />
      );
    }

    // Custom layouts (stacked/inline): use external shell
    const control = (
      <MuiTextField
        {...sanitizedRest}
        id={fieldId}
        name={name}
        label={undefined}
        helperText={undefined}
        required={required}
        error={validation.error}
        disabled={effectiveDisabled}
        fullWidth={fullWidth}
        slotProps={mergedSlotProps}
      />
    );

    return (
      <FieldLayoutShell
        layout={layout}
        label={label}
        required={required}
        helperText={validation.helperText}
        error={validation.error}
        disabled={effectiveDisabled}
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
      isNativeSelectMode(rest.slotProps),
      __selectAvailableValues
    );

    // Floating layout: use standard MUI TextField with internal label
    if (layout === 'floating') {
      return (
        <MuiTextField
          {...rest}
          id={fieldId}
          name={name}
          label={label}
          helperText={validation.helperText}
          required={required}
          value={selectProps.value}
          error={validation.error}
          disabled={effectiveDisabled}
          fullWidth={fullWidth}
          onChange={selectProps.onChange}
          onBlur={selectProps.onBlur}
          inputRef={selectProps.inputRef}
          slotProps={selectProps.slotProps}
        />
      );
    }

    // Custom layouts (stacked/inline): use external shell
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
        disabled={effectiveDisabled}
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
        disabled={effectiveDisabled}
        htmlFor={fieldId}
        fullWidth={fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    );
  }

  // Standard TextField mode
  // Read the current value from the granular subscription. The hook keeps
  // this component in sync without triggering re-renders for unrelated
  // field changes elsewhere in the form.
  const fieldValue = (fieldMeta.value as string | number | undefined) ?? '';

  // Floating layout: use standard MUI TextField with internal label
  if (layout === 'floating') {
    return (
      <MuiTextField
        {...rest}
        {...registration}
        id={fieldId}
        name={name}
        label={label}
        helperText={validation.helperText}
        required={required}
        value={fieldValue}
        error={validation.error}
        disabled={effectiveDisabled}
        fullWidth={fullWidth}
        slotProps={mergedSlotProps}
      />
    );
  }

  // Custom layouts (stacked/inline): use external shell
  const control = (
    <MuiTextField
      {...rest}
      {...registration}
      id={fieldId}
      name={name}
      label={undefined}
      helperText={undefined}
      required={required}
      value={fieldValue}
      error={validation.error}
      disabled={effectiveDisabled}
      fullWidth={fullWidth}
      slotProps={mergedSlotProps}
    />
  );

  return (
    <FieldLayoutShell
      layout={layout}
      label={label}
      required={required}
      helperText={validation.helperText}
      error={validation.error}
      disabled={effectiveDisabled}
      htmlFor={fieldId}
      fullWidth={fullWidth}
      theme={dashTheme}
    >
      {control}
    </FieldLayoutShell>
  );
}
