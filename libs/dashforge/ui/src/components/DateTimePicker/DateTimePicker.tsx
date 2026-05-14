import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import { useDashTheme } from '@dashforge/theme-core';
import { useAccessState } from '../../hooks/useAccessState';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

/**
 * Layout for DateTimePicker label/control.
 *
 * Native `<input type="date|time|datetime-local">` always renders a
 * visible placeholder (e.g. `mm/dd/yyyy`) and may be pre-filled with
 * the current value. MUI's `floating` label would overlap that text,
 * so this component does NOT support `floating` and uses `stacked` as
 * the default. If `floating` is passed, it falls back to `stacked`
 * (with a dev warning) for safety.
 */
export type DateTimePickerLayout = Exclude<FieldLayout, 'floating'>;

export interface DateTimePickerProps
  extends Omit<MuiTextFieldProps, 'name' | 'type' | 'value' | 'onChange'> {
  name: string;
  mode?: DateTimePickerMode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  /**
   * Layout for the label/control. Defaults to `stacked` because the
   * native date/time inputs always show a placeholder mask, which makes
   * the floating label pattern unusable. `floating` is silently downgraded
   * to `stacked` (with a dev warning).
   */
  layout?: FieldLayout;

  /**
   * RBAC access requirement for this field.
   *
   * When provided, the field's visibility, disabled state, and readonly state
   * are controlled by RBAC permissions.
   *
   * Access state is resolved using the RBAC system and combined with
   * explicit props using OR logic for disabled and readonly states.
   *
   * @example
   * ```tsx
   * <DateTimePicker
   *   name="publishedAt"
   *   label="Published At"
   *   access={{
   *     resource: 'article',
   *     action: 'update',
   *     onUnauthorized: 'readonly'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;

  // explicit override (same precedence as other components)
  value?: string | null;

  // simplified callback
  onChange?: (value: string | null) => void;

  /**
   * @deprecated Pass via `slotProps.htmlInput` instead. Kept for
   * backward compatibility with consumers written against MUI v7 / earlier
   * Dashforge releases — the component forwards this value to
   * `slotProps.htmlInput` internally. Removed in MUI v9's `TextFieldProps`.
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;

  /**
   * @deprecated Pass via `slotProps.inputLabel` instead. Kept for
   * backward compatibility — the component forwards this value to
   * `slotProps.inputLabel` internally. Removed in MUI v9's `TextFieldProps`.
   */
  InputLabelProps?: Record<string, unknown>;
}

/**
 * Converts ISO 8601 UTC string to local input value string.
 * Returns empty string if iso is null/undefined/invalid.
 */
function isoToInputValue(
  mode: DateTimePickerMode,
  iso: string | null | undefined
): string {
  if (!iso) return '';

  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (mode === 'date') {
      return `${year}-${month}-${day}`;
    } else if (mode === 'time') {
      return `${hours}:${minutes}`;
    } else {
      // datetime
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  } catch {
    return '';
  }
}

/**
 * Converts local input value string to ISO 8601 UTC string.
 * Returns null if input is empty or invalid.
 *
 * For time mode, uses baseIso to preserve the date component.
 */
function inputValueToIso(
  mode: DateTimePickerMode,
  input: string,
  baseIso?: string | null
): string | null {
  if (!input || input.trim() === '') return null;

  try {
    if (mode === 'datetime') {
      // Parse local datetime string: YYYY-MM-DDTHH:mm
      const date = new Date(input);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } else if (mode === 'date') {
      // Parse YYYY-MM-DD as local midday to reduce DST edge cases
      const date = new Date(`${input}T12:00`);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } else {
      // mode === 'time'
      // Time needs a base date to produce an ISO
      let baseDate: string;

      if (baseIso) {
        try {
          const parsedBase = new Date(baseIso);
          if (!isNaN(parsedBase.getTime())) {
            const year = parsedBase.getFullYear();
            const month = String(parsedBase.getMonth() + 1).padStart(2, '0');
            const day = String(parsedBase.getDate()).padStart(2, '0');
            baseDate = `${year}-${month}-${day}`;
          } else {
            // Invalid baseIso, use today
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            baseDate = `${year}-${month}-${day}`;
          }
        } catch {
          // Error parsing baseIso, use today
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          baseDate = `${year}-${month}-${day}`;
        }
      } else {
        // No baseIso, use today local date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        baseDate = `${year}-${month}-${day}`;
      }

      // Combine: baseDate + T + input (HH:mm)
      const date = new Date(`${baseDate}T${input}`);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    }
  } catch {
    return null;
  }
}

/**
 * Intelligent DateTimePicker component.
 *
 * Behavior:
 * - Uses native HTML date/time/datetime-local inputs (no MUI X dependency)
 * - Supports three modes: date, time, datetime (default: datetime)
 * - Storage policy: ISO 8601 UTC string | null
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as controlled component
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 * - Explicit value prop overrides bridge value
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 * - @mui/x-date-pickers
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    name,
    rules,
    visibleWhen,
    access,
    mode = 'datetime',
    value,
    onChange,
    label,
    required,
    fullWidth,
    inputProps: inputPropsProp,
    InputLabelProps: inputLabelPropsProp,
    onBlur: onBlurProp,
    layout = 'stacked',
    ...rest
  } = props;

  // Resolve effective layout: native date/time inputs always show a
  // placeholder mask, so the floating-label pattern is unusable. Downgrade
  // `floating` to `stacked` and emit a dev warning so consumers know.
  const effectiveLayout: DateTimePickerLayout =
    layout === 'floating' ? 'stacked' : layout;
  if (
    process.env.NODE_ENV !== 'production' &&
    layout === 'floating' &&
    typeof console !== 'undefined'
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Dashforge DateTimePicker] layout="floating" is not supported because ` +
        `native <input type="date|time|datetime-local"> always shows a ` +
        `placeholder that overlaps the floating label. Using "stacked" instead.`
    );
  }

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();

  // Granular per-field subscription (replaces legacy global void-version trick).
  useDashFieldMeta(name);

  // Hook always called, regardless of bridge/visibleWhen state
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

  // Internal state for plain mode (when not controlled by explicit value prop)
  const [internalInputValue, setInternalInputValue] = useState('');

  // Last successfully-parsed ISO. Used as a fallback baseIso for time-mode
  // typing so that intermediate invalid keystrokes (e.g. typing the first
  // character of "13:45") don't wipe the date component. Without this the
  // bridge briefly receives `null`, the next keystroke can't recover the
  // base date, and `inputValueToIso` falls back to today — losing the
  // original year/month/day.
  const lastValidIsoRef = useRef<string | null>(null);

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

  // Early return for visibility
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
  // Check if slotProps.input.readOnly is already set
  const existingReadOnly =
    rest.slotProps?.input &&
    typeof rest.slotProps.input === 'object' &&
    'readOnly' in rest.slotProps.input
      ? rest.slotProps.input.readOnly
      : false;
  const shouldApplyReadonly = existingReadOnly || accessState.readonly;

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

  // Determine native input type based on mode
  const inputType =
    mode === 'date' ? 'date' : mode === 'time' ? 'time' : 'datetime-local';

  // MUI v9: `inputProps` and `InputLabelProps` are deprecated top-level
  // props. We now build the merged values once and route them through the
  // `htmlInput` and `inputLabel` slots of `slotProps`. `step: 60` keeps the
  // native time control on whole minutes; `shrink: true` keeps the label
  // floating above the native placeholder mask (which always shows).
  const mergedHtmlInputProps = { step: 60, ...inputPropsProp };
  const mergedInputLabelProps = { shrink: true, ...inputLabelPropsProp };

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

    // Resolve ISO value precedence: explicit prop overrides bridge value
    const bridgeIsoValue = (bridge.getValue(name) as string | null) ?? null;
    const resolvedIsoValue = value !== undefined ? value : bridgeIsoValue;

    // Keep ref in sync with the latest non-null ISO seen during render so it
    // can serve as a fallback baseIso for time-mode mid-typing.
    if (resolvedIsoValue) {
      lastValidIsoRef.current = resolvedIsoValue;
    }

    // Convert ISO to input display string
    const inputValue = isoToInputValue(mode, resolvedIsoValue);

    // Get auto error from form validation
    const autoErr = bridge.getError(name) ?? null;

    // Get touched state and submit count for error gating
    const autoTouched = bridge.isTouched(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;

    // Gate error display: only show if field touched OR form submitted
    // This prevents error spam while typing before user interacts with field
    const allowAutoError = autoTouched || submitCount > 0;

    // Compute resolved props with precedence:
    // 1. Explicit props override auto values (explicit wins)
    // 2. Auto values from form validation (gated by touched/submit)
    const resolvedError =
      rest.error !== undefined
        ? rest.error
        : Boolean(autoErr) && allowAutoError;

    // Resolve final helper text (explicit prop overrides bridge error message)
    // When explicitHelperText is provided, use it
    // When explicitError is explicitly false, suppress bridge error message
    // Otherwise show bridge error message if allowAutoError
    const resolvedHelperText =
      rest.helperText !== undefined
        ? rest.helperText
        : rest.error === false
        ? undefined
        : allowAutoError
        ? autoErr?.message
        : undefined;

    // Wrap onChange to update both registration and bridge
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Extract input string from event
      const inputString = event.target.value;

      // For time mode, prefer the most recent valid ISO as base date so
      // intermediate keystrokes (e.g. just "1" before "13:45") don't lose
      // year/month/day. Falls back to today only when there's no history.
      // Use `||` because some bridge implementations return '' for null —
      // an empty string is just as unusable as null for parsing a date.
      const baseIso = resolvedIsoValue || lastValidIsoRef.current;

      // Convert input string to ISO or null
      const isoOrNull = inputValueToIso(mode, inputString, baseIso);

      // Persist the latest non-null parse so the next intermediate keystroke
      // can recover the date component.
      if (isoOrNull) {
        lastValidIsoRef.current = isoOrNull;
      }

      // Create a properly structured synthetic event
      const syntheticEvent = {
        target: { name, value: isoOrNull },
        type: 'change',
      };

      // 1. Call registration.onChange first (ignore returned promise if any)
      if (registration.onChange) {
        void registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, isoOrNull);
      }

      // 3. Finally call user's onChange if provided
      if (onChange) {
        onChange(isoOrNull);
      }
    };

    // Wrap onBlur to mark as touched and call user handler
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // FIX #2: Read the actual input value at blur time
      const inputString = event.currentTarget.value;

      // Use the same fallback baseIso strategy as handleChange to preserve
      // the date component when blur fires on a partially typed time.
      // `||` instead of `??` to also coalesce '' returned by some bridges.
      const baseIso = resolvedIsoValue || lastValidIsoRef.current;

      // Compute ISO from current input string
      const isoOrNull = inputValueToIso(mode, inputString, baseIso);

      // Create a synthetic blur event for touch tracking
      const syntheticEvent = {
        target: { name, value: isoOrNull },
        type: 'blur',
      };

      // 1. Call registration.onBlur to mark as touched (ignore returned promise if any)
      if (registration.onBlur) {
        void registration.onBlur(syntheticEvent);
      }

      // 2. Then call user's onBlur if provided
      if (onBlurProp) {
        onBlurProp(event);
      }
    };

    const fieldId = `dashforge-field-${name}`;

    // Build the full slotProps object once. We merge:
    //  - mergedSlotProps (may carry `input.readOnly` from RBAC handling)
    //  - htmlInput: step + RHF ref (replaces legacy `inputProps` + `inputRef`)
    //  - inputLabel: shrink:true (replaces legacy `InputLabelProps`)
    const finalSlotProps = {
      ...(mergedSlotProps ?? {}),
      htmlInput: {
        ...mergedHtmlInputProps,
        ...(mergedSlotProps?.htmlInput as Record<string, unknown> | undefined),
        ref: registration.ref,
      },
      inputLabel: {
        ...mergedInputLabelProps,
        ...(mergedSlotProps?.inputLabel as Record<string, unknown> | undefined),
      },
    } as MuiTextFieldProps['slotProps'];

    const control = (
      <MuiTextField
        name={name}
        type={inputType}
        value={inputValue}
        error={resolvedError}
        {...rest}
        id={fieldId}
        // Label and helperText are rendered by FieldLayoutShell to keep
        // them out of the input padding (avoids overlap with the native
        // date/time placeholder).
        label={undefined}
        helperText={undefined}
        disabled={effectiveDisabled}
        fullWidth={fullWidth}
        // FIX #1: Pass merged props AFTER {...rest} to prevent override
        slotProps={finalSlotProps}
        // IMPORTANT: Put handlers AFTER {...rest} spread
        // to ensure they override any handlers from rest
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );

    return (
      <FieldLayoutShell
        layout={effectiveLayout}
        label={label}
        required={required}
        helperText={resolvedHelperText}
        error={resolvedError}
        disabled={effectiveDisabled}
        htmlFor={fieldId}
        fullWidth={fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    );
  }

  // Standalone fallback (plain mode)
  // Determine display value: explicit prop overrides internal state
  const displayInputValue =
    value !== undefined ? isoToInputValue(mode, value) : internalInputValue;

  const handlePlainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Extract input string from event
    const inputString = event.target.value;

    // Update internal state with raw input string (not ISO)
    setInternalInputValue(inputString);

    // Convert input string to ISO or null
    // For plain mode, use current value as baseIso for time mode
    const baseIso = value !== undefined ? value : null;
    const isoOrNull = inputValueToIso(mode, inputString, baseIso);

    // Call user's onChange if provided
    if (onChange) {
      onChange(isoOrNull);
    }
  };

  const fieldId = `dashforge-field-${name}`;

  // Plain mode has no `registration.ref`. Otherwise the slotProps merge is
  // identical to the bound-mode branch above.
  const finalPlainSlotProps = {
    ...(mergedSlotProps ?? {}),
    htmlInput: {
      ...mergedHtmlInputProps,
      ...(mergedSlotProps?.htmlInput as Record<string, unknown> | undefined),
    },
    inputLabel: {
      ...mergedInputLabelProps,
      ...(mergedSlotProps?.inputLabel as Record<string, unknown> | undefined),
    },
  } as MuiTextFieldProps['slotProps'];

  const control = (
    <MuiTextField
      name={name}
      type={inputType}
      value={displayInputValue}
      {...rest}
      id={fieldId}
      label={undefined}
      helperText={undefined}
      disabled={effectiveDisabled}
      fullWidth={fullWidth}
      // FIX #1: Pass merged props AFTER {...rest} to prevent override
      slotProps={finalPlainSlotProps}
      // IMPORTANT: Put handler AFTER {...rest} spread
      onChange={handlePlainChange}
    />
  );

  return (
    <FieldLayoutShell
      layout={effectiveLayout}
      label={label}
      required={required}
      helperText={rest.helperText}
      error={Boolean(rest.error)}
      disabled={effectiveDisabled}
      htmlFor={fieldId}
      fullWidth={fullWidth}
      theme={dashTheme}
    >
      {control}
    </FieldLayoutShell>
  );
}
