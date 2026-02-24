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

      // Check if this is a native select
      const isNativeSelect = rest.SelectProps?.native === true;

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

      // For native select, create onBlur handler
      // For non-native MUI Select, we use onClose (see below)
      const handleBlur = isNativeSelect
        ? (event: unknown) => {
            // Get the current value at blur time to avoid stale closure
            const valueAtBlurTime = bridge.getValue?.(name) ?? '';

            // Create a synthetic blur event for RHF's touch tracking
            const syntheticEvent = new FocusEvent('blur', {
              bubbles: true,
              cancelable: true,
            });

            // Attach target with name for RHF field identification
            Object.defineProperty(syntheticEvent, 'target', {
              writable: false,
              value: { name, value: valueAtBlurTime },
            });

            // Call RHF's onBlur handler
            if (registration.onBlur) {
              registration.onBlur(syntheticEvent);
            }
          }
        : undefined;

      // For MUI Select (non-native), we need to handle touch state via onClose instead of onBlur
      // because MUI Select doesn't properly trigger onBlur on the combobox div
      const handleClose = !isNativeSelect
        ? () => {
            // Create a synthetic blur event for RHF's touch tracking
            // RHF expects: { type: 'blur', target: { name } }
            if (registration.onBlur) {
              // Get the current value at close time to avoid stale closure
              const valueAtCloseTime = bridge.getValue?.(name) ?? '';

              const syntheticEvent = new FocusEvent('blur', {
                bubbles: true,
                cancelable: true,
              });

              // Attach target with name for RHF field identification
              Object.defineProperty(syntheticEvent, 'target', {
                writable: false,
                value: { name, value: valueAtCloseTime },
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
          }
        : rest.SelectProps?.onClose;

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
          // For native select, attach onBlur. For non-native, use onClose
          onBlur={handleBlur as MuiTextFieldProps['onBlur']}
          SelectProps={{
            ...rest.SelectProps,
            // For non-native MUI Select, use onClose to mark as touched
            // For native select, onClose is either undefined or user-provided
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
