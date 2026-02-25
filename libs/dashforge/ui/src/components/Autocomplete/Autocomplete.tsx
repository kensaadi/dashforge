import MuiAutocomplete from '@mui/material/Autocomplete';
import type { AutocompleteProps as MuiAutocompleteProps } from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';

export interface AutocompleteOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

// Type-safe props: extends MUI Autocomplete props but with simplified API
// MUI generic signature: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>
// Our case: T = AutocompleteOption, Multiple = false, DisableClearable = false, FreeSolo = true
type BaseMuiAutocompleteProps = MuiAutocompleteProps<
  AutocompleteOption,
  false,
  false,
  true
>;

// For passthrough props, use Partial to be more permissive with type checking
// This avoids complex render prop type issues while still providing autocomplete for common props
type PassthroughProps = Partial<
  Omit<
    BaseMuiAutocompleteProps,
    | 'options'
    | 'freeSolo'
    | 'value'
    | 'onChange'
    | 'renderInput'
    | 'onBlur'
    | 'onInputChange'
    | 'name'
  >
>;

export interface AutocompleteProps extends PassthroughProps {
  name: string;
  options: AutocompleteOption[];
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  // Controlled storage value (string|null), explicit overrides bridge value
  value?: string | null;
  // Simplified callback: receives string | null
  onChange?: (value: string | null) => void;
  // Allow user to provide onBlur (will be called after our blur handling)
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
}

/**
 * Intelligent Autocomplete component (freeSolo mode).
 *
 * Behavior:
 * - Always in freeSolo mode (allows typing arbitrary text)
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain controlled Autocomplete
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 * - Stores string | null (NEVER object) in bridge
 *
 * Storage Policy:
 * - Selecting an option stores option.value (string)
 * - Free typing stores the typed string
 * - Clearing stores null
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam before user interaction
 *
 * Precedence:
 * - Explicit value/error/helperText props override auto values
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function Autocomplete(props: AutocompleteProps) {
  const {
    name,
    rules,
    visibleWhen,
    options,
    label,
    helperText: explicitHelperText,
    error: explicitError,
    value: explicitValue,
    onChange: explicitOnChange,
    onBlur: userOnBlur,
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes by accessing version strings
  // This ensures Autocomplete re-renders when validation errors or touched state changes
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

    // Get current value from bridge (string | null)
    const autoValue = (bridge.getValue?.(name) as string | null) ?? null;

    // Get auto error from form validation
    const autoErr = bridge.getError?.(name) ?? null;

    // Get touched state and submit count for error gating
    const autoTouched = bridge.isTouched?.(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;

    // Gate error display: only show if field touched OR form submitted
    // This prevents error spam before user interaction
    const allowAutoError = autoTouched || submitCount > 0;

    // Compute resolved props with precedence:
    // 1. Explicit props override auto values (explicit wins)
    // 2. Auto values from form validation (gated by touched/submit)
    const resolvedError =
      explicitError !== undefined
        ? explicitError
        : Boolean(autoErr) && allowAutoError;

    // Resolve final helper text (explicit prop overrides bridge error message)
    // When explicitHelperText is provided, use it
    // When explicitError is explicitly false, suppress bridge error message
    // Otherwise show bridge error message if allowAutoError
    const resolvedHelperText =
      explicitHelperText !== undefined
        ? explicitHelperText
        : explicitError === false
        ? undefined
        : allowAutoError
        ? autoErr?.message
        : undefined;

    // Resolve final value (explicit prop overrides bridge value)
    const resolvedValue =
      explicitValue !== undefined ? explicitValue : autoValue;

    // Find matching option for the resolved value (if it exists)
    const matchingOption =
      options.find((opt) => opt.value === resolvedValue) || null;

    // In freeSolo mode, the value prop can be either an option object OR a string
    // If we have a matching option, use it; otherwise use the string value directly
    const valueForAutocomplete: AutocompleteOption | string | null =
      matchingOption || resolvedValue;

    // Wrap onChange to update both registration and bridge
    const handleChange = async (
      _event: unknown,
      newValue: AutocompleteOption | string | null
    ) => {
      // Extract string value from newValue
      let stringValue: string | null = null;
      if (newValue === null) {
        stringValue = null;
      } else if (typeof newValue === 'string') {
        // freeSolo typed text
        stringValue = newValue;
      } else if (
        newValue &&
        typeof newValue === 'object' &&
        'value' in newValue
      ) {
        // Selected option
        stringValue = String(newValue.value);
      }

      // Create a properly structured synthetic event for registration
      const syntheticEvent = {
        target: { name, value: stringValue },
        type: 'change',
      };

      // 1. Call registration.onChange first
      if (registration.onChange) {
        await registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, stringValue);
      }

      // 3. Finally call user's onChange if provided
      if (explicitOnChange) {
        explicitOnChange(stringValue);
      }
    };

    // Handle input change (for freeSolo typing)
    // We track the input changes but don't commit until blur
    const handleInputChange = (
      _event: unknown,
      _newInputValue: string,
      reason: string
    ) => {
      // Don't trigger changes on 'reset' - that's MUI internal
      if (reason === 'reset') {
        return;
      }
      // For freeSolo typing, we let MUI manage the inputValue internally
      // and commit the value on blur
    };

    // Wrap onBlur to mark as touched AND commit freeSolo value
    const handleBlur = async (event: React.FocusEvent<HTMLDivElement>) => {
      // HARDENING B: Use currentTarget + querySelector for robust input detection
      // event.currentTarget is the Autocomplete root div, event.target might be any child
      const inputElement = event.currentTarget.querySelector('input');

      if (inputElement) {
        const typedValue = inputElement.value;

        // Get current bridge value
        const currentBridgeValue = bridge.getValue?.(name) ?? null;

        // Normalize typed value: empty string => null
        const valueToSet = typedValue === '' ? null : typedValue;

        // If the typed value is different from current value, update it
        if (valueToSet !== currentBridgeValue) {
          // Create synthetic event
          const syntheticEvent = {
            target: { name, value: valueToSet },
            type: 'change',
          };

          // Update via registration and bridge
          if (registration.onChange) {
            await registration.onChange(syntheticEvent);
          }
          if (bridge.setValue) {
            bridge.setValue(name, valueToSet);
          }
          // Call user's onChange if provided
          if (explicitOnChange) {
            explicitOnChange(valueToSet);
          }
        }
      }

      // Get the current value at blur time to avoid stale closure
      const valueAtBlurTime = bridge.getValue?.(name) ?? null;

      // Create a synthetic blur event for touch tracking
      const blurEvent = {
        target: { name, value: valueAtBlurTime },
        type: 'blur',
      };

      // Call registration.onBlur to mark as touched
      if (registration.onBlur) {
        await registration.onBlur(blurEvent);
      }

      // If user passed onBlur, call it too
      if (userOnBlur) {
        await userOnBlur(event);
      }
    };

    return (
      <MuiAutocomplete<AutocompleteOption | string, false, false, true>
        freeSolo
        value={valueForAutocomplete}
        {...(rest as any)}
        options={options}
        getOptionLabel={(option: AutocompleteOption | string) => {
          // option can be AutocompleteOption or string (freeSolo)
          if (typeof option === 'string') {
            return option;
          }
          // option is AutocompleteOption
          // label could be ReactNode, convert to string
          if (typeof option.label === 'string') {
            return option.label;
          }
          // For non-string labels, return the value
          return option.value;
        }}
        isOptionEqualToValue={(
          option: AutocompleteOption | string,
          value: AutocompleteOption | string
        ) => {
          // HARDENING C: Handle both string and option object comparisons
          // If value is a string (freeSolo), compare with option.value
          if (typeof value === 'string') {
            if (typeof option === 'string') {
              return option === value;
            }
            // option is object, value is string
            return option.value === value;
          }
          // Both are objects
          if (typeof option === 'object' && typeof value === 'object') {
            return option.value === value.value;
          }
          return false;
        }}
        getOptionDisabled={(option: AutocompleteOption | string) => {
          // HARDENING D: Support disabled options
          if (typeof option === 'object' && 'disabled' in option) {
            return Boolean(option.disabled);
          }
          return false;
        }}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onBlur={handleBlur}
        renderInput={(params) => (
          <MuiTextField
            {...params}
            name={name}
            label={label}
            error={resolvedError}
            helperText={resolvedHelperText}
            inputRef={registration.ref}
          />
        )}
      />
    );
  }

  // Standalone fallback (plain mode)
  // In plain mode, we don't control inputValue - let MUI manage it for freeSolo

  // For plain mode, use explicit value if provided, else null
  const plainValue = explicitValue ?? null;

  // Find matching option for the plain value
  const plainMatchingOption =
    options.find((opt) => opt.value === plainValue) || null;

  // In freeSolo mode, the value can be an option object OR a string
  const plainValueForAutocomplete: AutocompleteOption | string | null =
    plainMatchingOption || plainValue;

  // Plain mode onChange handler
  const handlePlainChange = (
    _event: unknown,
    newValue: AutocompleteOption | string | null
  ) => {
    // Extract string value
    let stringValue: string | null = null;
    if (newValue === null) {
      stringValue = null;
    } else if (typeof newValue === 'string') {
      stringValue = newValue;
    } else if (
      newValue &&
      typeof newValue === 'object' &&
      'value' in newValue
    ) {
      stringValue = String(newValue.value);
    }

    // Call user's onChange if provided
    if (explicitOnChange) {
      explicitOnChange(stringValue);
    }
  };

  // Plain mode onBlur handler to commit freeSolo text
  const handlePlainBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // HARDENING B: Use currentTarget + querySelector for robust input detection
    const inputElement = event.currentTarget.querySelector('input');

    if (inputElement) {
      const typedValue = inputElement.value;

      // Normalize typed value: empty string => null
      const valueToSet = typedValue === '' ? null : typedValue;

      // If the typed value is different from current value, call onChange
      if (valueToSet !== plainValue) {
        if (explicitOnChange) {
          explicitOnChange(valueToSet);
        }
      }
    }

    // If user passed onBlur, call it too
    if (userOnBlur) {
      userOnBlur(event);
    }
  };

  return (
    <MuiAutocomplete<AutocompleteOption | string, false, false, true>
      freeSolo
      value={plainValueForAutocomplete}
      {...(rest as any)}
      options={options}
      getOptionLabel={(option: AutocompleteOption | string) => {
        if (typeof option === 'string') {
          return option;
        }
        if (typeof option.label === 'string') {
          return option.label;
        }
        return option.value;
      }}
      isOptionEqualToValue={(
        option: AutocompleteOption | string,
        value: AutocompleteOption | string
      ) => {
        // HARDENING C: Handle both string and option object comparisons
        if (typeof value === 'string') {
          if (typeof option === 'string') {
            return option === value;
          }
          return option.value === value;
        }
        if (typeof option === 'object' && typeof value === 'object') {
          return option.value === value.value;
        }
        return false;
      }}
      getOptionDisabled={(option: AutocompleteOption | string) => {
        // HARDENING D: Support disabled options
        if (typeof option === 'object' && 'disabled' in option) {
          return Boolean(option.disabled);
        }
        return false;
      }}
      onChange={handlePlainChange}
      onBlur={handlePlainBlur}
      renderInput={(params) => (
        <MuiTextField
          {...params}
          name={name}
          label={label}
          error={explicitError}
          helperText={explicitHelperText}
        />
      )}
    />
  );
}
