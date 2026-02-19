import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'name'> {
  name: string;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
}

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

  // DEV ONLY: Render instrumentation for stress testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('TextField render:', name);
  }

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures TextField re-renders when validation errors or touched state changes
  // Must be read at top level to guarantee subscription
  // @ts-expect-error - Intentionally unused, for subscription only
  const _errorVersion = bridge?.errorVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _touchedVersion = bridge?.touchedVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _dirtyVersion = bridge?.dirtyVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _submitCount = bridge?.submitCount;

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // Early return for visibility
  if (!isVisible) {
    return null;
  }

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

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
    const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
    const resolvedHelperText =
      rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);

    return (
      <MuiTextField
        {...rest}
        {...registration}
        name={name}
        error={resolvedError}
        helperText={resolvedHelperText}
      />
    );
  }

  // Standalone fallback
  return <MuiTextField {...rest} name={name} />;
}
