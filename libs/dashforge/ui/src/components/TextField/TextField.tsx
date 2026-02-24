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
  // @ts-expect-error - Intentionally unused, for subscription only
  const _valuesVersion = bridge?.valuesVersion;

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

    // Special handling for MUI Select (when select prop is true)
    // MUI Select requires controlled value prop for proper integration with RHF
    if (rest.select) {
      // Get current value from RHF for controlled component
      const currentValue = bridge.getValue?.(name) ?? '';

      // Wrap onChange to provide correct event shape for RHF
      // MUI Select onChange passes SelectChangeEvent which has different structure
      // RHF expects: event.target.name and event.target.value
      const handleChange = async (event: unknown) => {
        // Extract value from MUI SelectChangeEvent
        let value: unknown;
        if (event && typeof event === 'object' && 'target' in event) {
          const target = (event as { target: unknown }).target;
          if (target && typeof target === 'object' && 'value' in target) {
            value = (target as { value: unknown }).value;
          }
        }

        // Create a properly structured synthetic event for RHF
        const syntheticEvent = {
          target: { name, value },
          type: 'change',
        };

        // Call RHF's onChange handler with the synthetic event
        // RHF's onChange accepts unknown, so we pass the synthetic event directly
        if (registration.onChange) {
          await registration.onChange(syntheticEvent);
        }

        // ALSO use bridge.setValue to ensure value is updated
        // This is necessary because MUI Select doesn't have a real DOM input
        // that RHF can track via ref
        if (bridge.setValue) {
          bridge.setValue(name, value);
        }
      };

      // For MUI Select, we need to handle touch state via onClose instead of onBlur
      // because MUI Select doesn't properly trigger onBlur on the combobox div
      const handleClose = () => {
        // Create a synthetic blur event for RHF's touch tracking
        // RHF expects: { type: 'blur', target: { name } }
        if (registration.onBlur) {
          const syntheticEvent = new FocusEvent('blur', {
            bubbles: true,
            cancelable: true,
          });

          // Attach target with name for RHF field identification
          Object.defineProperty(syntheticEvent, 'target', {
            writable: false,
            value: { name, value: currentValue },
          });

          // RHF's onBlur accepts unknown, so we pass the synthetic event directly
          registration.onBlur(syntheticEvent);
        }

        // Call any existing onClose from SelectProps
        // Type guard to ensure we have the correct shape
        if (rest.SelectProps?.onClose) {
          const onCloseHandler = rest.SelectProps.onClose as (
            event: unknown,
            reason?: string
          ) => void;
          onCloseHandler({}, 'selectOption');
        }
      };

      return (
        <MuiTextField
          name={name}
          value={currentValue}
          error={resolvedError}
          helperText={resolvedHelperText}
          {...rest}
          // IMPORTANT: Put RHF handlers AFTER {...rest} spread
          // to ensure they override any handlers from rest
          // Pass wrapped onChange handler for MUI Select
          // MUI TextField onChange expects React.ChangeEventHandler
          // Our handleChange matches this signature (accepts unknown event)
          onChange={handleChange as MuiTextFieldProps['onChange']}
          // For MUI Select, use onClose to mark as touched
          SelectProps={{
            ...rest.SelectProps,
            // MUI SelectProps.onClose expects (event: {}, reason: string) => void
            // Our handleClose matches this signature
            onClose: handleClose as NonNullable<
              MuiTextFieldProps['SelectProps']
            >['onClose'],
          }}
          // For MUI Select, inputRef connects to the hidden input element
          inputRef={registration.ref}
          // Ensure inputProps has the name for the hidden input
          inputProps={{
            ...rest.inputProps,
            name,
          }}
        />
      );
    }

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
