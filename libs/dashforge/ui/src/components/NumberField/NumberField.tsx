import TextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useContext, useEffect, useId, useRef } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import type { FieldRegistration, Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import { useAccessState } from '../../hooks/useAccessState';
import { renderLabelWithTooltip, normalizeFieldTooltip } from '../_internal/fieldTooltip';
import type { FieldTooltipProp } from '../_internal/fieldTooltip';
import { FieldLayoutShell, type FieldLayout } from '../_internal/FieldLayoutShell';

export interface NumberFieldProps
  extends Omit<MuiTextFieldProps, 'name' | 'type' | 'value' | 'onChange'> {
  name: string;
  rules?: unknown;
  visibleWhen?: ((engine: Engine) => boolean) | undefined;
  value?: number | string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Field layout mode. See README-BUG.md § BUG 15.
   *
   * - `'floating'` (default): standard MUI floating label inside the input.
   * - `'stacked'`: external label rendered above the control.
   * - `'inline'`: external label rendered to the left of the control.
   *
   * @default 'floating'
   */
  layout?: FieldLayout;

  /**
   * Optional label-help tooltip (ⓘ in the label row). String or config
   * `{ content, icon?, position?, side? }`.
   */
  tooltip?: FieldTooltipProp;

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
   * <NumberField
   *   name="salary"
   *   label="Salary"
   *   access={{
   *     resource: 'employee.salary',
   *     action: 'update',
   *     onUnauthorized: 'readonly'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;
}

/**
 * NumberField component that integrates with DashForm.
 *
 * Supports two modes:
 * 1. Plain mode (outside DashFormContext): Renders a standard MUI TextField with type="number"
 * 2. Bound mode (inside DashFormContext): Integrates with form bridge for value/error binding
 *
 * Value policy:
 * - Bound-mode storage type: number | null
 * - UI input display:
 *   - number -> String(number)
 *   - null/undefined -> '' (empty string)
 * - On user input:
 *   - '' -> setValue(name, null)
 *   - valid number -> setValue(name, parsedNumber)
 * - Parsing: Uses Number(...) and Number.isFinite(...) (no locale parsing)
 * - Does not allow NaN into the bridge
 *
 * Features:
 * - Automatic registration with DashForm bridge
 * - Form Closure v1 error gating (touched OR submitCount > 0)
 * - Prop precedence (explicit props override bridge values)
 * - Visibility control via visibleWhen predicate
 * - Touch tracking on blur
 * - Immediate UI updates (no delayed state)
 * - RBAC access control via access prop
 *
 * @example
 * ```tsx
 * // Plain mode
 * <NumberField
 *   name="age"
 *   label="Age"
 *   value={age}
 *   onChange={(e) => setAge(Number(e.target.value))}
 * />
 *
 * // Bound mode (inside DashForm)
 * <NumberField
 *   name="age"
 *   label="Age"
 *   rules={{ required: true, min: 0, max: 120 }}
 * />
 * ```
 */
export function NumberField(
  props: NumberFieldProps
): React.ReactElement | null {
  const {
    name,
    rules,
    helperText: explicitHelperText,
    error: explicitError,
    visibleWhen,
    value: explicitValue,
    onChange: explicitOnChange,
    access,
    tooltip,
    disabled,
    layout = 'floating',
    ...muiProps
  } = props;

  const bridge = useContext(DashFormContext);

  // Get engine for visibility evaluation
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();
  const fieldId = useId();

  // Granular per-field subscription (replaces legacy global void-version trick).
  useDashFieldMeta(name);

  // Evaluate visibility predicate
  const isVisible = useEngineVisibility(engine, visibleWhen);

  // RBAC access state (hook always called unconditionally)
  const accessState = useAccessState(access);

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
      // BUG 22: only release bridge state on unmount if the form
      // is configured to forget unmounted fields. Default `false`
      // keeps values in RHF so <Stepper> / tab-swap patterns can
      // read earlier answers back on later steps. See README-BUG.md § BUG 22.
      if (!capturedBridge?.shouldUnregister) return;
      queueMicrotask(() => {
        if (!isMountedRef.current) {
          capturedBridge?.unregister?.(capturedName);
        }
      });
    };
  }, []);

  // Early return for visibleWhen
  if (!isVisible) {
    return null;
  }

  // Early return for RBAC visibility
  if (!accessState.visible) {
    return null;
  }

  // Compute effective disabled state (OR logic: any source can disable)
  const effectiveDisabled = Boolean(disabled) || accessState.disabled;

  // Compute effective readonly state (OR logic)
  // Check if slotProps.input.readOnly is already set
  const existingReadOnly =
    muiProps.slotProps?.input &&
    typeof muiProps.slotProps.input === 'object' &&
    'readOnly' in muiProps.slotProps.input
      ? muiProps.slotProps.input.readOnly
      : false;
  const shouldApplyReadonly = existingReadOnly || accessState.readonly;

  // Merge readonly into slotProps (preserving existing slotProps)
  const readonlySlotProps = shouldApplyReadonly
    ? {
        ...muiProps.slotProps,
        input: {
          ...(muiProps.slotProps?.input || {}),
          readOnly: true,
        },
      }
    : muiProps.slotProps;

  // The required `*` is part of the PRIMARY label block; the tooltip `ⓘ` is
  // secondary. MUI appends its own `*` after the label node — which would land
  // after the tooltip icon — so when a tooltip is present we render the asterisk
  // ourselves (before the icon) and disable MUI's via the inputLabel slot.
  const hasTooltip = normalizeFieldTooltip(tooltip) != null;
  const ownAsterisk =
    hasTooltip && muiProps.required ? (
      <Box component="span" aria-hidden sx={{ color: 'error.main', ml: '2px' }}>
        *
      </Box>
    ) : null;
  const mergedSlotProps = hasTooltip
    ? {
        ...readonlySlotProps,
        inputLabel: {
          ...(readonlySlotProps?.inputLabel as object | undefined),
          required: false,
        },
      }
    : readonlySlotProps;

  // Compose the label with its help-tooltip trigger. NumberField renders the
  // MUI TextField directly (not the intelligent one), so the `tooltip` prop is
  // forwarded through MUI's ReactNode `label` slot via the shared helper —
  // returns the plain label unchanged when no tooltip is provided. The required
  // asterisk is glued to the label (before the tooltip icon) via the 3rd arg.
  const labelNode = renderLabelWithTooltip(muiProps.label, tooltip, ownAsterisk);

  // BUG 15: when layout is stacked/inline, the label + helperText move to an
  // external FieldLayoutShell so the row aligns with sibling stacked fields.
  // The inner MuiTextField gets `label={undefined}` and `helperText={undefined}`
  // to hand control over to the shell.
  const useShell = layout !== 'floating';
  const wrapWithLayout = (
    control: React.ReactElement,
    helperText: React.ReactNode,
    error: boolean | undefined,
  ) =>
    useShell ? (
      <FieldLayoutShell
        layout={layout as 'stacked' | 'inline'}
        label={muiProps.label}
        tooltip={tooltip}
        required={muiProps.required}
        helperText={helperText}
        error={error}
        disabled={effectiveDisabled}
        htmlFor={fieldId}
        fullWidth={muiProps.fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    ) : (
      control
    );

  // Plain mode: render without bridge integration
  if (!bridge) {
    // If explicit value is provided, use controlled mode
    if (explicitValue !== undefined) {
      const inputValue =
        explicitValue == null
          ? ''
          : typeof explicitValue === 'number'
          ? String(explicitValue)
          : explicitValue;

      return wrapWithLayout(
        <TextField
          id={fieldId}
          name={name}
          type="number"
          value={inputValue}
          onChange={explicitOnChange}
          helperText={useShell ? undefined : explicitHelperText}
          error={explicitError}
          disabled={effectiveDisabled}
          {...muiProps}
          label={useShell ? undefined : labelNode}
          slotProps={mergedSlotProps}
        />,
        explicitHelperText,
        explicitError,
      );
    }

    // No explicit value: use uncontrolled mode (let MUI manage internal state)
    return wrapWithLayout(
      <TextField
        id={fieldId}
        name={name}
        type="number"
        onChange={explicitOnChange}
        helperText={useShell ? undefined : explicitHelperText}
        error={explicitError}
        disabled={effectiveDisabled}
        {...muiProps}
        label={useShell ? undefined : labelNode}
        slotProps={mergedSlotProps}
      />,
      explicitHelperText,
      explicitError,
    );
  }

  // Bound mode: integrate with bridge

  // Register field with bridge (safe check for register function)
  if (!bridge.register) {
    // Fallback to plain mode if register is not available
    // If explicit value is provided, use controlled mode
    if (explicitValue !== undefined) {
      const inputValue =
        explicitValue == null
          ? ''
          : typeof explicitValue === 'number'
          ? String(explicitValue)
          : explicitValue;

      return wrapWithLayout(
        <TextField
          id={fieldId}
          name={name}
          type="number"
          value={inputValue}
          onChange={explicitOnChange}
          helperText={useShell ? undefined : explicitHelperText}
          error={explicitError}
          disabled={effectiveDisabled}
          {...muiProps}
          label={useShell ? undefined : labelNode}
          slotProps={mergedSlotProps}
        />,
        explicitHelperText,
        explicitError,
      );
    }

    // No explicit value: use uncontrolled mode
    return wrapWithLayout(
      <TextField
        id={fieldId}
        name={name}
        type="number"
        onChange={explicitOnChange}
        helperText={useShell ? undefined : explicitHelperText}
        error={explicitError}
        disabled={effectiveDisabled}
        {...muiProps}
        label={useShell ? undefined : labelNode}
        slotProps={mergedSlotProps}
      />,
      explicitHelperText,
      explicitError,
    );
  }

  const registration: FieldRegistration = bridge.register(name, rules);

  // Get current value from bridge (number | null | undefined)
  const autoValue = bridge.getValue(name) as number | null | undefined;

  // Convert bridge value to input string
  // number -> String(number), null/undefined -> ''
  const autoInputValue = autoValue == null ? '' : String(autoValue);

  // Resolve final input value (explicit prop overrides bridge value)
  let resolvedInputValue: string;
  if (explicitValue !== undefined) {
    // Explicit value provided - convert to string
    if (explicitValue == null) {
      resolvedInputValue = '';
    } else if (typeof explicitValue === 'number') {
      resolvedInputValue = String(explicitValue);
    } else {
      // explicitValue is string (allow it for controlled empty state)
      resolvedInputValue = explicitValue;
    }
  } else {
    resolvedInputValue = autoInputValue;
  }

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
  // showing; the explicit hint is the fallback. `explicitError === false`
  // still suppresses the auto channel entirely (an author who pins error
  // false wants the field to look clean). See README-BUG.md § BUG 17.
  const autoMessage =
    explicitError === false
      ? undefined
      : allowAutoError
      ? autoErr?.message
      : undefined;
  const resolvedHelperText = autoMessage ?? explicitHelperText;

  // Handle change: update bridge FIRST (source of truth), then notify registration, then user onChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value; // string from input

    // Parse value: '' -> null, valid number -> number, invalid -> do not write to bridge
    let parsedValue: number | null;
    if (raw === '') {
      parsedValue = null;
    } else {
      const num = Number(raw);
      if (Number.isFinite(num)) {
        parsedValue = num;
      } else {
        // Invalid number (NaN or Infinity) - do not write to bridge
        if (explicitOnChange) {
          explicitOnChange(event);
        }
        return;
      }
    }

    // 1) Update bridge immediately with normalized value (number|null)
    // This guarantees the bridge never stores strings for NumberField.
    if (bridge.setValue) {
      bridge.setValue(name, parsedValue);
    }

    // 2) Notify registration (validation, touched logic, etc.)
    // We pass the raw string because validators may want the original input text.
    if (registration.onChange) {
      registration.onChange({
        target: {
          name,
          value: raw,
        },
        type: 'change',
      });
    }

    // 3) Re-assert bridge value to avoid any registration implementation
    // accidentally writing a string into the bridge.
    if (bridge.setValue) {
      bridge.setValue(name, parsedValue);
    }

    // 4) Call user onChange last (if provided)
    if (explicitOnChange) {
      explicitOnChange(event);
    }
  };

  // Handle blur: mark field as touched
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (registration.onBlur) {
      // Use current input value (string) from the event
      const currentRawValue = event.target.value;
      registration.onBlur({
        target: {
          name,
          value: currentRawValue,
        },
        type: 'blur',
      });
    }

    // Call user onBlur if provided via muiProps
    if (muiProps.onBlur) {
      muiProps.onBlur(event);
    }
  };

  return wrapWithLayout(
    <TextField
      id={fieldId}
      name={name}
      type="number"
      value={resolvedInputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={useShell ? undefined : resolvedHelperText}
      error={resolvedError}
      disabled={effectiveDisabled}
      {...muiProps}
      label={useShell ? undefined : labelNode}
      slotProps={mergedSlotProps}
    />,
    resolvedHelperText,
    resolvedError,
  );
}
