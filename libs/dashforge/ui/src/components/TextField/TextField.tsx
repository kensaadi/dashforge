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

  // Subscribe to error changes by accessing errorVersion
  // This ensures TextField re-renders when validation errors change
  // Must be read at top level to guarantee subscription
  const _errorVersion = bridge?.errorVersion;

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

    // Compute resolved props with precedence:
    // 1. Explicit props override auto values
    // 2. Auto values from form validation
    const resolvedError = rest.error ?? Boolean(autoErr);
    const resolvedHelperText = rest.helperText ?? autoErr?.message;

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
