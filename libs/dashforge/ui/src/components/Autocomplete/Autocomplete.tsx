import MuiAutocomplete from '@mui/material/Autocomplete';
import type { AutocompleteProps as MuiAutocompleteProps } from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import { useContext, useMemo, useState, useEffect } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';
import { useFieldRuntime } from '@dashforge/forms';
import type { AccessRequirement } from '@dashforge/rbac';
import { useAccessState } from '../../hooks/useAccessState';

// Module-level deduplication for unresolved value warnings (Phase 2)
// Tracks warned field:value combinations per bridge instance
// WeakMap ensures automatic cleanup when bridge is garbage collected
const warnedUnresolvedValues = new WeakMap<
  DashFormBridge,
  Set<string> // "fieldName:value" keys
>();

/**
 * Emit development-only warning for unresolved values.
 * Deduplicated per bridge instance and field:value combination.
 * Effect-safe (called from useEffect, not render).
 *
 * Policy: reaction-v2.md Section 3.3
 * - Dev-only (never in production)
 * - Deduplicated (no console spam)
 * - Only when runtime is ready and value doesn't match
 * - Called from useEffect (not during render)
 */
function warnUnresolvedValue(
  bridge: DashFormBridge,
  fieldName: string,
  fieldValue: unknown,
  availableValues: (string | number)[]
): void {
  // GUARD: Production mode (compile-time eliminated)
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // GUARD: Deduplication
  const key = `${fieldName}:${String(fieldValue)}`;
  let warned = warnedUnresolvedValues.get(bridge);

  if (!warned) {
    warned = new Set();
    warnedUnresolvedValues.set(bridge, warned);
  }

  if (warned.has(key)) {
    return; // Already warned
  }

  warned.add(key);

  // Emit developer warning
  const optionsDisplay =
    availableValues.length > 0
      ? availableValues.join(', ')
      : '(empty - no options loaded)';

  console.warn(
    `[Dashforge Autocomplete] Unresolved value for field "${fieldName}".\n` +
      `Current value "${String(
        fieldValue
      )}" does not match any loaded option.\n` +
      `The form value remains unchanged (no automatic reset).\n` +
      `Available options: ${optionsDisplay}`
  );
}

export interface AutocompleteOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Internal normalized option structure.
 * Stores mapped value/label/disabled along with raw option for renderOption customization.
 * @internal
 */
interface NormalizedOption<TValue extends string | number> {
  value: TValue;
  label: string;
  disabled: boolean;
  raw: unknown; // Original option for renderOption customization
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
    | 'getOptionLabel'
    | 'getOptionDisabled'
  >
>;

export interface AutocompleteProps<
  TValue extends string | number = string,
  TOption = AutocompleteOption
> extends PassthroughProps {
  name: string;
  options: TOption[];
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  // Controlled storage value (TValue|null), explicit overrides bridge value
  value?: TValue | null;
  // Simplified callback: receives TValue | null
  onChange?: (value: TValue | null) => void;
  // Allow user to provide onBlur (will be called after our blur handling)
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;

  // Mapper functions for generic option support
  getOptionValue?: (option: TOption) => TValue;
  getOptionLabel?: (option: TOption) => string;
  getOptionDisabled?: (option: TOption) => boolean;

  /**
   * Access control requirement for this field (RBAC).
   *
   * Controls field visibility and interactivity based on user permissions.
   * Uses the nearest RbacProvider to resolve access state.
   *
   * Behaviors:
   * - `onUnauthorized: 'hide'` → Field not rendered (returns null)
   * - `onUnauthorized: 'disable'` → Field disabled (grayed out, non-interactive)
   * - `onUnauthorized: 'readonly'` → Field read-only (visible, cannot edit/select/clear, value submitted)
   *
   * Readonly semantics for Autocomplete:
   * - Input is read-only (no typing)
   * - Popup disabled (cannot select different option)
   * - Clear button hidden (cannot clear value)
   * - Value remains visible and is submitted with form
   *
   * @example
   * ```tsx
   * // Hide assignee field from non-managers
   * <Autocomplete
   *   name="assignee"
   *   label="Assignee"
   *   options={userOptions}
   *   access={{
   *     resource: 'task.assignee',
   *     action: 'edit',
   *     onUnauthorized: 'hide'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;

  // Phase 2: Runtime integration
  /**
   * When true, load options from field runtime data instead of static options prop.
   * Requires DashFormContext. Runtime data shape: { options: TOption[] }
   */
  optionsFromFieldData?: boolean;
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
 * - Stores TValue | null (string or number) in bridge
 *
 * Storage Policy:
 * - Selecting an option stores mapped option.value (TValue)
 * - Free typing stores the typed string (cast to TValue if applicable)
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
export function Autocomplete<
  TValue extends string | number = string,
  TOption = AutocompleteOption
>(props: AutocompleteProps<TValue, TOption>) {
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
    getOptionValue,
    getOptionLabel,
    getOptionDisabled,
    access,
    optionsFromFieldData,
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Phase 2: Runtime integration (unconditional hook call)
  // Hook must be called unconditionally (React rules)
  interface AutocompleteFieldRuntimeData {
    options: TOption[];
  }
  const runtime = useFieldRuntime<AutocompleteFieldRuntimeData>(name);

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

  // Subscribe to form state changes by accessing version strings
  // This ensures Autocomplete re-renders when validation errors or touched state changes
  // Using void to explicitly mark as intentional subscription without side effects
  void bridge?.errorVersion;
  void bridge?.touchedVersion;
  void bridge?.dirtyVersion;
  void bridge?.submitCount;
  void bridge?.valuesVersion;

  // Phase 2: Dev warnings for invalid prop combinations
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    // ERROR: optionsFromFieldData without DashForm
    if (optionsFromFieldData && !bridge) {
      console.error(
        `[Dashforge Autocomplete] Field "${name}" has optionsFromFieldData=true but is not inside DashFormProvider.\n` +
          `Runtime options require DashFormContext. Either:\n` +
          `1. Wrap component in <DashFormProvider>\n` +
          `2. Remove optionsFromFieldData prop and use static options`
      );
    }

    // WARN: optionsFromFieldData + options prop together
    if (optionsFromFieldData && options && options.length > 0) {
      console.warn(
        `[Dashforge Autocomplete] Field "${name}" has both optionsFromFieldData=true and static options prop.\n` +
          `Runtime options take precedence. Static options will be ignored.\n` +
          `Remove the options prop to avoid confusion.`
      );
    }

    // ERROR: value prop in DashForm mode
    if (bridge && explicitValue !== undefined) {
      console.error(
        `[Dashforge Autocomplete] Field "${name}" is in DashForm mode but has explicit value prop.\n` +
          `In DashForm mode, value is controlled by the form (react-hook-form).\n` +
          `Remove the value prop. Use form.setValue() or defaultValues instead.`
      );
    }
  }, [optionsFromFieldData, bridge, name, options, explicitValue]);

  // Default mappers (with correction: String(option ?? ''))
  const defaultGetValue = (opt: TOption): TValue => {
    // For backward compatibility: if opt has a 'value' property, use it
    if (opt && typeof opt === 'object' && 'value' in opt) {
      return (opt as any).value as TValue;
    }
    // Otherwise treat opt itself as TValue (for primitive arrays)
    return opt as unknown as TValue;
  };
  const defaultGetLabel = (opt: TOption): string => {
    // For backward compatibility: if opt has a 'label' property, use it
    if (opt && typeof opt === 'object' && 'label' in opt) {
      return String((opt as any).label ?? '');
    }
    // Otherwise convert opt itself to string
    return String(opt ?? '');
  };
  const defaultGetDisabled = (_opt: TOption): boolean => false;

  const actualGetValue = getOptionValue ?? defaultGetValue;
  const actualGetLabel = getOptionLabel ?? defaultGetLabel;
  const actualGetDisabled = getOptionDisabled ?? defaultGetDisabled;

  // Phase 2: Resolve options source (runtime vs static)
  const rawRuntimeOptions =
    optionsFromFieldData &&
    runtime?.data?.options &&
    Array.isArray(runtime.data.options)
      ? runtime.data.options
      : [];

  const sourceOptions = optionsFromFieldData
    ? rawRuntimeOptions
    : options || [];

  // Normalization pipeline: map → filter pattern
  // useMemo to ensure stable option references across renders
  const normalizedOptions: NormalizedOption<TValue>[] = useMemo(
    () =>
      sourceOptions
        .map((opt): NormalizedOption<TValue> | null => {
          if (opt == null) return null;
          try {
            return {
              value: actualGetValue(opt),
              label: actualGetLabel(opt),
              disabled: actualGetDisabled(opt),
              raw: opt,
            };
          } catch {
            return null;
          }
        })
        .filter((opt): opt is NormalizedOption<TValue> => opt !== null),
    [sourceOptions, actualGetValue, actualGetLabel, actualGetDisabled]
  );

  // Early return for visibleWhen
  if (!isVisible) {
    return null;
  }

  // Early return for RBAC visibility
  if (!accessState.visible) {
    return null;
  }

  // Compute effective disabled state (OR logic: any source can disable)
  const effectiveDisabled = Boolean(rest.disabled) || accessState.disabled;

  // Compute effective readonly state (OR logic)
  // For Autocomplete, readonly means:
  // - Input is read-only (no typing)
  // - Popup disabled (cannot select different option)
  // - Clear button hidden (cannot clear value)
  const effectiveReadonly = accessState.readonly;

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
    const resolvedValue: TValue | null =
      explicitValue !== undefined
        ? explicitValue
        : (autoValue as TValue | null);

    // Phase 2: Loading state
    const isLoading = optionsFromFieldData && runtime?.status === 'loading';

    // Find matching normalized option for the resolved value
    const matchingOption =
      normalizedOptions.find((opt) => opt.value === resolvedValue) || null;

    // Phase 2: Display sanitization for unresolved values
    // Rule: IF optionsFromFieldData=true AND runtime.status='ready':
    //   - IF value matches normalizedOptions → show option
    //   - ELSE → sanitize to null (display empty string)
    // ELSE (static mode):
    //   - preserve freeSolo behavior: sanitize numeric, show string
    const isRuntimeMode = optionsFromFieldData && runtime?.status === 'ready';
    const isValueResolved =
      matchingOption !== null || resolvedValue === null || resolvedValue === '';

    let shouldSanitize: boolean;
    if (isRuntimeMode) {
      // Runtime mode: sanitize ALL unresolved values (type-independent)
      shouldSanitize = !isValueResolved;
    } else {
      // Static mode: preserve freeSolo behavior (only sanitize numeric)
      shouldSanitize = !isValueResolved && typeof resolvedValue === 'number';
    }

    const displayInputValue = shouldSanitize ? null : resolvedValue;

    // For MUI Autocomplete value prop:
    // - In freeSolo mode with objects, pass the option object if it matches
    // - Otherwise pass null and let freeSolo handle the typed text
    const valueForAutocomplete: NormalizedOption<TValue> | null =
      matchingOption;

    // Control inputValue to display the correct text in the input field
    // This is critical for freeSolo mode with object options
    // Phase 2: Use displayInputValue for sanitization
    const computedInputValue = matchingOption
      ? matchingOption.label
      : displayInputValue != null
      ? String(displayInputValue)
      : '';

    const [inputValue, setInputValue] = useState(computedInputValue);

    // Sync inputValue when resolvedValue or matchingOption changes
    useEffect(() => {
      setInputValue(computedInputValue);
    }, [computedInputValue]);

    // Phase 2: Unresolved value detection
    // Only warn in dev mode, only when runtime is ready, deduplicate warnings
    const unresolvedDetection = useMemo(() => {
      if (!optionsFromFieldData || runtime?.status !== 'ready' || !bridge) {
        return null;
      }

      const currentValue = bridge.getValue?.(name);
      if (currentValue == null || currentValue === '') return null;

      const isResolved = normalizedOptions.some(
        (opt) => opt.value === currentValue
      );
      if (isResolved) return null;

      return {
        fieldName: name,
        fieldValue: currentValue,
        availableValues: normalizedOptions.map((opt) => opt.value),
      };
    }, [
      optionsFromFieldData,
      runtime?.status,
      bridge,
      name,
      normalizedOptions,
    ]);

    // Phase 2: Emit unresolved value warning (effect-safe)
    useEffect(() => {
      if (!unresolvedDetection || !bridge) return;

      warnUnresolvedValue(
        bridge,
        unresolvedDetection.fieldName,
        unresolvedDetection.fieldValue,
        unresolvedDetection.availableValues
      );
    }, [unresolvedDetection, bridge]);

    // Wrap onChange to update both registration and bridge
    const handleChange = async (
      _event: unknown,
      newValue: NormalizedOption<TValue> | TValue | null
    ) => {
      // Extract TValue from newValue
      let mappedValue: TValue | null = null;
      if (newValue === null) {
        mappedValue = null;
      } else if (typeof newValue === 'string' || typeof newValue === 'number') {
        // freeSolo typed text (cast to TValue)
        mappedValue = newValue as TValue;
      } else if (
        newValue &&
        typeof newValue === 'object' &&
        'value' in newValue
      ) {
        // Selected normalized option
        mappedValue = newValue.value;
      }

      // Create a properly structured synthetic event for registration
      const syntheticEvent = {
        target: { name, value: mappedValue },
        type: 'change',
      };

      // 1. Call registration.onChange first
      if (registration.onChange) {
        await registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, mappedValue);
      }

      // 3. Finally call user's onChange if provided
      if (explicitOnChange) {
        explicitOnChange(mappedValue);
      }
    };

    // Handle input change (for freeSolo typing)
    // Update inputValue state to allow typing while preserving value sync
    const handleInputChange = (
      _event: unknown,
      newInputValue: string,
      reason: string
    ) => {
      // Update inputValue state for all reasons except 'reset'
      // MUI uses 'reset' for internal state management
      if (reason !== 'reset') {
        setInputValue(newInputValue);
      }
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

        // Normalize typed value: empty string => null, otherwise cast to TValue
        const valueToSet = typedValue === '' ? null : (typedValue as TValue);

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
      <MuiAutocomplete<NormalizedOption<TValue>, false, false, true>
        {...(rest as any)}
        freeSolo
        disabled={effectiveDisabled || isLoading}
        readOnly={effectiveReadonly}
        disableClearable={effectiveReadonly || rest.disableClearable}
        value={valueForAutocomplete}
        inputValue={inputValue}
        options={normalizedOptions}
        getOptionLabel={(option: NormalizedOption<TValue> | string) => {
          // In freeSolo mode, option can be from options array OR a typed string
          if (typeof option === 'string') {
            return option;
          }
          // option is NormalizedOption
          return option.label;
        }}
        renderOption={(props, option: NormalizedOption<TValue>) => {
          // MUI v7: Explicitly add aria-disabled for accessibility
          // Note: Props AFTER spread override props FROM spread
          return (
            <li {...props} aria-disabled={option.disabled ? 'true' : 'false'}>
              {option.label}
            </li>
          );
        }}
        isOptionEqualToValue={(
          option: NormalizedOption<TValue>,
          value: NormalizedOption<TValue>
        ) => {
          // Compare by value field
          return option.value === value.value;
        }}
        getOptionDisabled={(option: NormalizedOption<TValue>) => {
          // Support disabled options from normalized structure
          return option.disabled;
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
            InputProps={{
              ...params.InputProps,
              readOnly: effectiveReadonly,
            }}
          />
        )}
      />
    );
  }

  // Standalone fallback (plain mode)
  // In plain mode, we don't control inputValue - let MUI manage it for freeSolo

  // For plain mode, use explicit value if provided, else null
  const plainValue: TValue | null = explicitValue ?? null;

  // Find matching normalized option for the plain value
  const plainMatchingOption =
    normalizedOptions.find((opt) => opt.value === plainValue) || null;

  // For MUI Autocomplete value prop:
  // - In freeSolo mode with objects, pass the option object if it matches
  // - Otherwise pass null and let freeSolo handle the typed text
  const plainValueForAutocomplete: NormalizedOption<TValue> | null =
    plainMatchingOption;

  // Control inputValue to display the correct text in the input field
  const plainComputedInputValue = plainMatchingOption
    ? plainMatchingOption.label
    : plainValue != null
    ? String(plainValue)
    : '';

  const [plainInputValue, setPlainInputValue] = useState(
    plainComputedInputValue
  );

  // Sync inputValue when plainValue or plainMatchingOption changes
  useEffect(() => {
    setPlainInputValue(plainComputedInputValue);
  }, [plainComputedInputValue]);

  // Plain mode onChange handler
  const handlePlainChange = (
    _event: unknown,
    newValue: NormalizedOption<TValue> | TValue | null
  ) => {
    // Extract TValue
    let mappedValue: TValue | null = null;
    if (newValue === null) {
      mappedValue = null;
    } else if (typeof newValue === 'string' || typeof newValue === 'number') {
      mappedValue = newValue as TValue;
    } else if (
      newValue &&
      typeof newValue === 'object' &&
      'value' in newValue
    ) {
      mappedValue = newValue.value;
    }

    // Call user's onChange if provided
    if (explicitOnChange) {
      explicitOnChange(mappedValue);
    }
  };

  // Plain mode onBlur handler to commit freeSolo text
  const handlePlainBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // HARDENING B: Use currentTarget + querySelector for robust input detection
    const inputElement = event.currentTarget.querySelector('input');

    if (inputElement) {
      const typedValue = inputElement.value;

      // Normalize typed value: empty string => null, otherwise cast to TValue
      const valueToSet = typedValue === '' ? null : (typedValue as TValue);

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

  // Handle plain input change
  const handlePlainInputChange = (
    _event: unknown,
    newInputValue: string,
    reason: string
  ) => {
    // Update inputValue state for all reasons except 'reset'
    if (reason !== 'reset') {
      setPlainInputValue(newInputValue);
    }
  };

  return (
    <MuiAutocomplete<NormalizedOption<TValue>, false, false, true>
      {...(rest as any)}
      freeSolo
      disabled={effectiveDisabled}
      readOnly={effectiveReadonly}
      disableClearable={effectiveReadonly || rest.disableClearable}
      value={plainValueForAutocomplete}
      inputValue={plainInputValue}
      onInputChange={handlePlainInputChange}
      options={normalizedOptions}
      getOptionLabel={(option: NormalizedOption<TValue> | string) => {
        // In freeSolo mode, option can be from options array OR a typed string
        if (typeof option === 'string') {
          return option;
        }
        return option.label;
      }}
      renderOption={(props, option: NormalizedOption<TValue>) => {
        // MUI v7: Explicitly add aria-disabled for accessibility
        // Note: Props AFTER spread override props FROM spread
        return (
          <li {...props} aria-disabled={option.disabled ? 'true' : 'false'}>
            {option.label}
          </li>
        );
      }}
      isOptionEqualToValue={(
        option: NormalizedOption<TValue>,
        value: NormalizedOption<TValue>
      ) => {
        // Compare by value field
        return option.value === value.value;
      }}
      getOptionDisabled={(option: NormalizedOption<TValue>) => {
        // Support disabled options from normalized structure
        return option.disabled;
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
          InputProps={{
            ...params.InputProps,
            readOnly: effectiveReadonly,
          }}
        />
      )}
    />
  );
}
