import MuiSwitch from '@mui/material/Switch';
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';

export interface SwitchProps extends Omit<MuiSwitchProps, 'name'> {
  name: string;
  label?: React.ReactNode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  helperText?: string;
  error?: boolean;
}

/**
 * Intelligent Switch component.
 *
 * Behavior:
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI Switch
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while user is interacting
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
export function Switch(props: SwitchProps) {
  const { name, rules, visibleWhen, label, helperText, error, ...rest } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures Switch re-renders when validation errors or touched state changes
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
    // This prevents error spam while user is interacting with field
    const allowAutoError = autoTouched || submitCount > 0;

    // Compute resolved props with precedence:
    // 1. Explicit props override auto values (explicit wins)
    // 2. Auto values from form validation (gated by touched/submit)
    const resolvedError = error ?? (Boolean(autoErr) && allowAutoError);
    const resolvedHelperText =
      helperText ?? (allowAutoError ? autoErr?.message : undefined);

    // Get current checked value from bridge (default to false if undefined)
    const currentValue = bridge.getValue?.(name);
    const autoChecked = currentValue === true;

    // Compute resolved checked with precedence:
    // Explicit checked prop overrides bridge value
    const resolvedChecked = rest.checked ?? autoChecked;

    // Wrap onChange to provide correct event shape for bridge
    // Switch needs to pass both checked and value properties
    const handleChange = async (event: unknown) => {
      // Extract checked from MUI Switch event
      let newChecked = false;
      if (event && typeof event === 'object' && 'target' in event) {
        const target = (event as { target: unknown }).target;
        if (target && typeof target === 'object' && 'checked' in target) {
          newChecked = Boolean((target as { checked: unknown }).checked);
        }
      }

      // IMPORTANT: Update bridge value FIRST
      // This ensures the value is available for subsequent reads
      if (bridge.setValue) {
        bridge.setValue(name, newChecked);
      }

      // Create a properly structured synthetic event for bridge
      // Include both target.checked and target.value (as boolean)
      const syntheticEvent = {
        target: {
          name,
          checked: newChecked,
          value: newChecked,
        },
        type: 'change',
      };

      // Call registration's onChange handler with the synthetic event
      if (registration.onChange) {
        await registration.onChange(syntheticEvent);
      }

      // Call original onChange if provided in props
      if (rest.onChange) {
        await (rest.onChange as (event: unknown) => Promise<void> | void)(
          event
        );
      }
    };

    // Handle blur for touched tracking
    const handleBlur = async (event: unknown) => {
      // Get current checked value at blur time
      const currentChecked = bridge.getValue?.(name) === true;

      // Create a synthetic blur event for bridge's touch tracking
      const syntheticEvent = {
        target: {
          name,
          checked: currentChecked,
          value: currentChecked,
        },
        type: 'blur',
      };

      // Call registration's onBlur handler
      if (registration.onBlur) {
        registration.onBlur(syntheticEvent);
      }

      // Call original onBlur if provided in props
      if (rest.onBlur) {
        await (rest.onBlur as (event: unknown) => Promise<void> | void)(event);
      }
    };

    const switchElement = (
      <MuiSwitch
        {...rest}
        name={name}
        checked={resolvedChecked}
        onChange={handleChange as MuiSwitchProps['onChange']}
        onBlur={handleBlur as MuiSwitchProps['onBlur']}
        inputRef={registration.ref}
      />
    );

    // Wrap switch with FormControlLabel if label is provided
    const controlElement = label ? (
      <FormControlLabel control={switchElement} label={label} />
    ) : (
      switchElement
    );

    // Show helper text or error message if present
    if (resolvedHelperText) {
      return (
        <div>
          {controlElement}
          <FormHelperText error={resolvedError}>
            {resolvedHelperText}
          </FormHelperText>
        </div>
      );
    }

    return controlElement;
  }

  // Standalone fallback (plain mode)
  const switchElement = <MuiSwitch {...rest} name={name} />;

  // Wrap switch with FormControlLabel if label is provided
  if (label) {
    return <FormControlLabel control={switchElement} label={label} />;
  }

  return switchElement;
}
