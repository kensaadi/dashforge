import MenuItem from '@mui/material/MenuItem';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useMemo, useEffect, useContext } from 'react';
import { useFieldRuntime } from '@dashforge/forms';
import { DashFormContext } from '@dashforge/ui-core';
import type { Engine, DashFormBridge } from '@dashforge/ui-core';
import type { FieldLayout } from '../_internal/FieldLayoutShell';
import { TextField } from '../TextField/TextField';

// Module-level deduplication for unresolved value warnings (Step 05)
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
  const optionsDisplay = availableValues.length > 0
    ? availableValues.join(', ')
    : '(empty - no options loaded)';

  console.warn(
    `[Dashforge Select] Unresolved value for field "${fieldName}".\n` +
    `Current value "${String(fieldValue)}" does not match any loaded option.\n` +
    `The form value remains unchanged (no automatic reset).\n` +
    `Available options: ${optionsDisplay}`
  );
}

export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

/**
 * Component consumption contract for Select runtime options.
 * 
 * This describes how Select consumes runtime data, not a canonical runtime type.
 * Do NOT use this as a separate source of truth for runtime shape.
 * 
 * Reactions/runtime producers provide raw data in any shape.
 * Select component interprets option shape via mapper functions.
 * 
 * The options array can contain any shape.
 * By default, component attempts to use { value, label } shape.
 * For custom shapes, provide getOptionValue/getOptionLabel/getOptionDisabled props.
 * 
 * Example raw data from reaction (any shape):
 * ```
 * {
 *   options: [
 *     { id: 1, name: 'Option 1', active: true },
 *     { id: 2, name: 'Option 2', active: false },
 *   ]
 * }
 * ```
 * 
 * Example with mappers:
 * ```tsx
 * <Select
 *   name="item"
 *   optionsFromFieldData
 *   getOptionValue={(opt) => opt.id}
 *   getOptionLabel={(opt) => opt.name}
 *   getOptionDisabled={(opt) => !opt.active}
 * />
 * ```
 */
export interface SelectFieldRuntimeData<TOption = unknown> {
  options: TOption[];
}

export interface SelectProps<T extends string | number = string | number>
  extends Omit<
    MuiTextFieldProps,
    | 'name'
    | 'select'
    | 'SelectProps'
    | 'InputProps'
    | 'InputLabelProps'
    | 'FormHelperTextProps'
    | 'inputProps'
  > {
  name: string;
  rules?: unknown;
  label?: string;
  options?: SelectOption<T>[];
  
  /**
   * If true, reads options from field runtime state via useFieldRuntime.
   * When enabled, 'options' prop is ignored.
   * 
   * Runtime data is consumed as-is from runtime state.
   * Component interprets option shape via mapper functions.
   * 
   * If no mappers provided, attempts to use { value, label } shape (default).
   * 
   * Example (simple - default { value, label } shape):
   * ```tsx
   * <Select name="city" optionsFromFieldData />
   * ```
   * 
   * Example (generic shape with mappers):
   * ```tsx
   * <Select 
   *   name="city"
   *   optionsFromFieldData
   *   getOptionValue={(opt) => opt.id}
   *   getOptionLabel={(opt) => opt.name}
   * />
   * ```
   */
  optionsFromFieldData?: boolean;

  /**
   * Extract value from runtime option object.
   * Only used when optionsFromFieldData is true.
   * Return undefined for soft failure (option will be filtered out).
   * Default: attempts (option) => option.value
   */
  getOptionValue?: (option: unknown) => T | undefined;

  /**
   * Extract label from runtime option object.
   * Only used when optionsFromFieldData is true.
   * Return empty string for soft failure (option will be filtered if value is undefined).
   * Default: attempts (option) => option.label
   */
  getOptionLabel?: (option: unknown) => string;

  /**
   * Determine if runtime option is disabled.
   * Only used when optionsFromFieldData is true.
   * Default: () => false
   */
  getOptionDisabled?: (option: unknown) => boolean;

  visibleWhen?: (engine: Engine) => boolean;
  layout?: FieldLayout;
  minWidth?: number;
}

/**
 * Intelligent Select component with runtime option support.
 *
 * Behavior:
 * - Composed from intelligent TextField with select mode
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField select
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 * - Enforces minimum width (220px) unless fullWidth is enabled
 *
 * Runtime Options (Reactive V2):
 * - Set optionsFromFieldData={true} to read options from field runtime state
 * - Supports generic option shapes via mapper functions (getOptionValue, getOptionLabel, getOptionDisabled)
 * - Loading state disables the field (no UI messaging)
 * - Unresolved values: UI displays no selected value, form value remains unchanged (no automatic reset)
 * - Development-only warnings: If value cannot be resolved, a console warning is emitted (deduplicated, effect-based)
 * - Empty options with non-null value triggers warning (helps detect data loading issues)
 * - Production mode: No warnings, silent operation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam before user interaction
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
export function Select<T extends string | number = string | number>(
  props: SelectProps<T>
) {
  const {
    name,
    rules,
    label,
    options,
    optionsFromFieldData = false,
    getOptionValue,
    getOptionLabel,
    getOptionDisabled,
    visibleWhen,
    layout,
    fullWidth,
    minWidth = 200,
    sx,
    ...rest
  } = props;

  // Access bridge for unresolved value detection (Step 05)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;

  // Default mapper functions with soft failure (return undefined/empty, NOT throw)
  const defaultGetOptionValue = (option: unknown): T | undefined => {
    if (option && typeof option === 'object' && 'value' in option) {
      return option.value as T;
    }
    return undefined;
  };

  const defaultGetOptionLabel = (option: unknown): string => {
    if (option && typeof option === 'object' && 'label' in option) {
      return String(option.label);
    }
    return '';
  };

  const defaultGetOptionDisabled = (): boolean => false;

  // CRITICAL: Always call useFieldRuntime unconditionally (React rules)
  // Runtime result is ignored when optionsFromFieldData is false
  const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);

  // Resolve options from static or runtime source
  const rawRuntimeOptions =
    optionsFromFieldData &&
    runtime?.data?.options &&
    Array.isArray(runtime.data.options)
      ? runtime.data.options
      : [];

  const sourceOptions = optionsFromFieldData ? rawRuntimeOptions : options || [];

  // Use provided mappers or defaults
  const mapValue = getOptionValue || defaultGetOptionValue;
  const mapLabel = getOptionLabel || defaultGetOptionLabel;
  const mapDisabled = getOptionDisabled || defaultGetOptionDisabled;

  // Normalize options: map raw options to { value, label, disabled? } format
  // Filter out failed mappings (where value is undefined)
  const normalizedOptions = sourceOptions
    .map((rawOption) => {
      const value = mapValue(rawOption);
      const label = mapLabel(rawOption);
      const disabled = mapDisabled(rawOption);

      return {
        value,
        label,
        disabled,
      };
    })
    .filter((opt) => opt.value !== undefined) as Array<{
      value: T;
      label: string;
      disabled: boolean;
    }>;

  // Extract available values for display value sanitization (Step 05b/05d)
  // Static mode: always sanitize (always provide available values)
  // Runtime mode: sanitize in ALL states (Step 05d fix)
  //   - During loading/idle/error: normalizedOptions is empty, sanitization uses empty array
  //   - This prevents MUI warnings when value exists but options haven't loaded yet
  //   - Empty array causes sanitization to return '' (empty display), which is correct
  const availableValues = normalizedOptions.map((opt) => opt.value);

  // Derive loading state from runtime status
  const isLoading = optionsFromFieldData && runtime?.status === 'loading';

  // PHASE 1: Compute unresolved detection data (pure - no side effects)
  // Policy: reaction-v2.md Section 3.2, 3.3
  // Detection conditions:
  // - Using runtime options
  // - Runtime status is 'ready'
  // - Field has a non-null, non-empty value
  // - Value doesn't match any option (including when options are empty)
  const unresolvedDetection = useMemo(() => {
    // Only detect when using runtime options and runtime is ready
    if (!optionsFromFieldData || runtime?.status !== 'ready' || !bridge || !bridge.getValue) {
      return null;
    }

    const currentValue = bridge.getValue(name);

    // Don't check null/undefined/empty values
    // Empty string is treated as "no selection" (same as null)
    if (currentValue == null || currentValue === '') {
      return null;
    }

    // Check if value exists in normalized options
    // NOTE: If normalizedOptions is empty, isResolved will be false (correct)
    const isResolved = normalizedOptions.some(
      (opt) => opt.value === currentValue
    );

    if (isResolved) {
      return null; // Value is resolved, nothing to warn about
    }

    // Value is unresolved - return detection data for effect
    const availableValues = normalizedOptions.map((opt) => opt.value);
    
    return {
      fieldName: name,
      fieldValue: currentValue as string | number,
      availableValues,
    };
  }, [optionsFromFieldData, runtime?.status, bridge, name, normalizedOptions]);

  // PHASE 2: Emit warning in effect (side effect isolation)
  // This ensures warnings are not emitted during render (React best practice)
  useEffect(() => {
    if (!unresolvedDetection || !bridge) {
      return; // Nothing to warn about or no bridge available
    }

    // Emit warning (deduplication handled in utility)
    warnUnresolvedValue(
      bridge,
      unresolvedDetection.fieldName,
      unresolvedDetection.fieldValue,
      unresolvedDetection.availableValues
    );
  }, [unresolvedDetection, bridge]);

  // Compose Select from TextField with select mode enabled
  // TextField handles all form integration, error binding, and gating
  return (
    <TextField
      {...rest}
      name={name}
      rules={rules}
      label={label}
      visibleWhen={visibleWhen}
      layout={layout}
      fullWidth={fullWidth}
      select
      disabled={rest.disabled || isLoading}
      __selectAvailableValues={availableValues}
      sx={{
        // Apply minimum width only when fullWidth is not enabled
        // Prevents Select from collapsing to icon width when empty
        ...(!fullWidth && { minWidth: minWidth }),
        ...sx,
      }}
      slotProps={{
        ...rest.slotProps,
        select: {
          native: false,
          ...(rest.slotProps?.select as Record<string, unknown> | undefined),
        },
      }}
    >
      {normalizedOptions.map((option) => (
        <MenuItem
          key={String(option.value)}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
