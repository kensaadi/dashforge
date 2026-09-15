import MuiRadioGroup from '@mui/material/RadioGroup';
import type { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import { useContext, useEffect, useRef } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import type { FieldRegistration, Engine } from '@dashforge/ui-core';
import { useAccessState, useAccessStates } from '../../hooks/useAccessState';
import { renderLabelWithTooltip } from '../_internal/fieldTooltip';
import type { FieldTooltipProp } from '../_internal/fieldTooltip';

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  /**
   * RBAC access control requirement for this specific option.
   *
   * Controls option visibility and selectability based on user permissions:
   * - `onUnauthorized: 'hide'` → option is hidden (unless it is the currently selected value)
   * - `onUnauthorized: 'disable'` → option is visible but not selectable
   * - `onUnauthorized: 'readonly'` → option is disabled (radio options do not support true readonly semantics; disabled is used as fallback)
   *
   * Note: Group-level access has precedence over option-level access.
   */
  access?: AccessRequirement;
}

export interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'name'> {
  name: string;
  options: RadioGroupOption[];
  label?: React.ReactNode;
  rules?: unknown;
  helperText?: string;
  error?: boolean;
  /**
   * Marks the group as required in the UI. Passes through to the wrapping
   * `<FormControl required>`, which renders the asterisk on `<FormLabel>` and
   * sets `aria-required` on the group. Presentational only: enforcement at
   * submit time still requires `rules={{ required: … }}`. See README-BUG.md
   * § BUG 20.
   */
  required?: boolean;
  visibleWhen?: ((engine: Engine) => boolean) | undefined;
  /**
   * RBAC access control requirement for the entire radio group.
   *
   * Controls group visibility and interaction based on user permissions:
   * - `onUnauthorized: 'hide'` → entire group returns null
   * - `onUnauthorized: 'disable'` → group is visible but all options are non-interactive
   * - `onUnauthorized: 'readonly'` → group is disabled (radio groups do not support true readonly semantics; disabled is used as fallback)
   *
   * Group-level access has precedence over option-level access.
   * Combines with explicit `disabled` prop via OR logic.
   */
  access?: AccessRequirement;
  /** Optional label-help tooltip (ⓘ in the label row). String or `{ content, icon?, position?, side? }`. */
  tooltip?: FieldTooltipProp;
}

/**
 * RadioGroup component that integrates with DashForm.
 *
 * Supports two modes:
 * 1. Plain mode (outside DashFormContext): Renders a standard MUI RadioGroup
 * 2. Bound mode (inside DashFormContext): Integrates with form bridge for value/error binding
 *
 * Features:
 * - Automatic registration with DashForm bridge
 * - Form Closure v1 error gating (touched OR submitCount > 0)
 * - Prop precedence (explicit props override bridge values)
 * - Visibility control via visibleWhen predicate
 * - Touch tracking on blur
 * - Immediate UI updates (no delayed state)
 *
 * @example
 * ```tsx
 * // Plain mode
 * <RadioGroup
 *   name="color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' }
 *   ]}
 *   value={selectedColor}
 *   onChange={(e) => setSelectedColor(e.target.value)}
 * />
 *
 * // Bound mode (inside DashForm)
 * <RadioGroup
 *   name="color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' }
 *   ]}
 *   rules={{ required: true }}
 * />
 * ```
 */
export function RadioGroup(props: RadioGroupProps): React.ReactElement | null {
  const {
    name,
    options,
    label,
    tooltip,
    rules,
    helperText: explicitHelperText,
    error: explicitError,
    required,
    visibleWhen,
    value: explicitValue,
    onChange: explicitOnChange,
    access,
    ...muiProps
  } = props;

  const bridge = useContext(DashFormContext);

  // Get engine for visibility evaluation
  const engine = bridge?.engine;

  // Granular per-field subscription (replaces legacy global void-version trick).
  useDashFieldMeta(name);

  // RBAC access state for group (hook always called unconditionally)
  const groupAccessState = useAccessState(access);

  // Resolve option-level access states in ONE hook. `options.map(useAccessState)`
  // would tie React's hook count to `options.length` (unsound if options load
  // async) and cannot be moved above the visibility early returns. See
  // README-BUG.md § BUG 16.
  const optionAccessStates = useAccessStates(
    options.map((option) => option.access)
  );

  // Evaluate visibility predicate
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // Release engine/RHF state on REAL unmount when registered through the
  // bridge. See TextField.tsx for the rationale (bridge identity changes
  // on every keystroke, so we must not re-run cleanup on deps changes).
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

  // Early returns come AFTER every hook call above. Moving a return earlier
  // would break the rules of hooks when `visibleWhen` or group access flips.
  if (!isVisible) {
    return null;
  }
  if (!groupAccessState.visible) {
    return null;
  }

  // Compute effective group disabled state (OR logic: any source can activate disabled)
  // Note: Radio groups don't support true readonly semantics, so readonly falls back to disabled
  // This will be combined with option-level disabled state
  const groupEffectiveDisabled =
    groupAccessState.disabled || groupAccessState.readonly;

  // Helper: Process options with option-level RBAC
  // Returns processed options with visibility and disabled state resolved
  const processOptions = (currentValue: string | undefined) => {
    return options
      .map((option, index) => {
        // Get pre-resolved access state for this option
        const optionAccessState = optionAccessStates[index];

        // Determine if option should be visible
        // Option is hidden if access resolves to hide UNLESS it's the currently selected value
        const isSelectedValue = option.value === currentValue;
        const shouldHideOption = !optionAccessState.visible && !isSelectedValue;

        // If option should be hidden, don't include it
        if (shouldHideOption) {
          return null;
        }

        // Compute effective disabled state for this option (OR logic)
        // Disabled if ANY of the following is true:
        // - Group is disabled (group precedence)
        // - Option is explicitly disabled
        // - Option access resolves to disabled
        // - Option access resolves to readonly (fallback to disabled)
        // - Option is selected but would otherwise be hidden (selected-hidden-option edge case)
        const optionEffectiveDisabled =
          groupEffectiveDisabled ||
          Boolean(option.disabled) ||
          optionAccessState.disabled ||
          optionAccessState.readonly ||
          (!optionAccessState.visible && isSelectedValue);

        return {
          ...option,
          effectiveDisabled: optionEffectiveDisabled,
        };
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null);
  };

  // Plain mode: render without bridge integration
  if (!bridge) {
    const processedOptions = processOptions(
      explicitValue as string | undefined
    );

    return (
      <FormControl error={explicitError} required={required}>
        {label && (
          <FormLabel>{renderLabelWithTooltip(label, tooltip)}</FormLabel>
        )}
        <MuiRadioGroup
          name={name}
          value={explicitValue ?? ''}
          onChange={explicitOnChange}
          {...muiProps}
        >
          {processedOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.effectiveDisabled}
            />
          ))}
        </MuiRadioGroup>
        {explicitHelperText && (
          <FormHelperText>{explicitHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Bound mode: integrate with bridge

  // Register field with bridge (safe check for register function)
  if (!bridge.register) {
    // Fallback to plain mode if register is not available
    const processedOptions = processOptions(
      explicitValue as string | undefined
    );

    return (
      <FormControl error={explicitError} required={required}>
        {label && (
          <FormLabel>{renderLabelWithTooltip(label, tooltip)}</FormLabel>
        )}
        <MuiRadioGroup
          name={name}
          value={explicitValue ?? ''}
          onChange={explicitOnChange}
          {...muiProps}
        >
          {processedOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.effectiveDisabled}
            />
          ))}
        </MuiRadioGroup>
        {explicitHelperText && (
          <FormHelperText>{explicitHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  const registration: FieldRegistration = bridge.register(name, rules);

  // Get current value from bridge (default to empty string if undefined)
  const autoValue = (bridge.getValue(name) as string | undefined) ?? '';

  // Resolve final value (explicit prop overrides bridge value)
  const resolvedValue = explicitValue !== undefined ? explicitValue : autoValue;

  // Get error state from bridge
  const autoErr = bridge.getError(name) ?? null;

  // Get touched state and submit count for error gating
  const autoTouched = bridge.isTouched(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  // Form Closure v1: Show error only if touched OR submitCount > 0
  const allowAutoError = autoTouched || submitCount > 0;

  // Resolve final error state (explicit prop overrides bridge error)
  const resolvedError =
    explicitError !== undefined
      ? explicitError
      : Boolean(autoErr) && allowAutoError;

  // BUG 17: the validation message wins over the explicit hint while it is
  // showing; the explicit prop is the fallback for the "no error" state. See
  // README-BUG.md § BUG 17 (same shape lives in textField.validation.ts).
  const autoMessage = allowAutoError ? autoErr?.message : undefined;
  const resolvedHelperText = autoMessage ?? explicitHelperText;

  // Handle change: update bridge first, then call registration.onChange, then user onChange
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    // Use MUI RadioGroup's second argument as source of truth
    const newValue = value;

    // Update bridge value immediately (no delayed updates)
    if (bridge.setValue) {
      bridge.setValue(name, newValue);
    }

    // Call registration.onChange with event-like shape
    if (registration.onChange) {
      registration.onChange({
        target: {
          name,
          value: newValue,
        },
        type: 'change',
      });
    }

    // Call user onChange last (if provided)
    if (explicitOnChange) {
      explicitOnChange(event, value);
    }
  };

  // Handle blur: mark field as touched
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (registration.onBlur) {
      // Ensure target.value is a string (default to '' if undefined)
      const currentValue =
        (bridge.getValue(name) as string | undefined) ?? '';
      registration.onBlur({
        target: {
          name,
          value: currentValue,
        },
        type: 'blur',
      });
    }

    // Call user onBlur if provided via muiProps
    if (muiProps.onBlur) {
      muiProps.onBlur(event);
    }
  };

  // Process options with RBAC logic based on current value
  const processedOptions = processOptions(resolvedValue);

  return (
    <FormControl error={resolvedError} required={required}>
      {label && <FormLabel>{label}</FormLabel>}
      <MuiRadioGroup
        name={name}
        value={resolvedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...muiProps}
      >
        {processedOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.effectiveDisabled}
          />
        ))}
      </MuiRadioGroup>
      {resolvedHelperText && (
        <FormHelperText>{resolvedHelperText}</FormHelperText>
      )}
    </FormControl>
  );
}
