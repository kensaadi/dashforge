import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useContext, useEffect, useId, useRef } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import { useAccessState } from '../../hooks/useAccessState';
import { renderLabelWithTooltip, normalizeFieldTooltip } from '../_internal/fieldTooltip';
import type { FieldTooltipProp } from '../_internal/fieldTooltip';
import { FieldLayoutShell, type FieldLayout } from '../_internal/FieldLayoutShell';

export interface TextareaProps extends Omit<MuiTextFieldProps, 'name'> {
  name: string;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * Field layout mode. See README-BUG.md § BUG 15 for why `<Textarea>`
   * needed this prop to reach parity with `<TextField>`.
   *
   * - `'floating'` (default): standard MUI floating label inside the input.
   * - `'stacked'`: external label rendered above the control.
   * - `'inline'`: external label rendered to the left of the control.
   *
   * @default 'floating'
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
   * <Textarea
   *   name="description"
   *   label="Description"
   *   access={{
   *     resource: 'document',
   *     action: 'update',
   *     onUnauthorized: 'readonly'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;

  /** Optional label-help tooltip (ⓘ in the label row). String or `{ content, icon?, position?, side? }`. */
  tooltip?: FieldTooltipProp;
}

/**
 * Intelligent Textarea component.
 *
 * Behavior:
 * - Always renders as multiline textarea (multiline={true})
 * - Defaults to minRows={3} (can be overridden)
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI TextField with multiline
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 * - Supports RBAC access control via access prop
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
export function Textarea(props: TextareaProps) {
  const {
    name,
    rules,
    visibleWhen,
    minRows = 3,
    access,
    label,
    tooltip,
    layout = 'floating',
    ...rest
  } = props;

  // Always call hooks at top level (unconditionally)
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();
  const fieldId = useId();

  // Granular per-field subscription (replaces legacy global void-version trick).
  useDashFieldMeta(name);

  // Hook always called, regardless of bridge/visibleWhen state
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
  const readonlySlotProps = shouldApplyReadonly
    ? {
        ...rest.slotProps,
        input: {
          ...(rest.slotProps?.input || {}),
          readOnly: true,
        },
      }
    : rest.slotProps;

  // The required `*` is part of the PRIMARY label block; the tooltip `ⓘ` is
  // secondary. MUI appends its own `*` after the label node — which would land
  // after the tooltip icon — so when a tooltip is present we render the asterisk
  // ourselves (before the icon) and disable MUI's via the inputLabel slot.
  const hasTooltip = normalizeFieldTooltip(tooltip) != null;
  const ownAsterisk =
    hasTooltip && rest.required ? (
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

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

    // Get current value from bridge (default to empty string)
    const currentValue = bridge.getValue(name) ?? '';

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

    // BUG 17: the validation message wins over the explicit hint while it is
    // showing; the explicit prop is the fallback for the "no error" state.
    // `rest.error === false` still suppresses the auto message: an author who
    // pins error false wants to hide the auto channel entirely. See
    // README-BUG.md § BUG 17.
    const autoMessage =
      rest.error === false
        ? undefined
        : allowAutoError
        ? autoErr?.message
        : undefined;
    const resolvedHelperText = autoMessage ?? rest.helperText;

    // Handle value precedence: explicit prop overrides bridge value
    const resolvedValue = rest.value !== undefined ? rest.value : currentValue;

    // Wrap onChange to update both registration and bridge
    const handleChange = async (event: unknown) => {
      // Extract value from event
      let value: unknown;
      if (event && typeof event === 'object' && 'target' in event) {
        const target = (event as { target: unknown }).target;
        if (target && typeof target === 'object' && 'value' in target) {
          value = (target as { value: unknown }).value;
        }
      }

      // Create a properly structured synthetic event
      const syntheticEvent = {
        target: { name, value },
        type: 'change',
      };

      // 1. Call registration.onChange first
      if (registration.onChange) {
        await registration.onChange(syntheticEvent);
      }

      // 2. Then bridge.setValue to ensure value is updated
      if (bridge.setValue) {
        bridge.setValue(name, value);
      }

      // 3. Finally call user's onChange if provided
      if (rest.onChange) {
        await rest.onChange(
          event as Parameters<NonNullable<typeof rest.onChange>>[0]
        );
      }
    };

    // Wrap onBlur to mark as touched and call user handler
    const handleBlur = async (event: unknown) => {
      // Get the current value at blur time to avoid stale closure
      const valueAtBlurTime = bridge.getValue(name) ?? '';

      // Create a synthetic blur event for touch tracking
      const syntheticEvent = {
        target: { name, value: valueAtBlurTime },
        type: 'blur',
      };

      // 1. Call registration.onBlur to mark as touched
      if (registration.onBlur) {
        await registration.onBlur(syntheticEvent);
      }

      // 2. Then call user's onBlur if provided
      if (rest.onBlur) {
        await rest.onBlur(
          event as Parameters<NonNullable<typeof rest.onBlur>>[0]
        );
      }
    };

    // MUI v9: route the RHF ref through the html-input slot so it lands on
    // the `<textarea>` (the actual focusable element MUI multiline renders),
    // not on the FormControl wrapper. Merging preserves any existing
    // `readOnly` already configured on `slotProps.input`.
    const slotPropsWithRef = {
      ...(mergedSlotProps ?? {}),
      htmlInput: {
        ...(mergedSlotProps?.htmlInput as Record<string, unknown> | undefined),
        ref: registration.ref,
      },
    } as MuiTextFieldProps['slotProps'];

    // BUG 15: when layout is stacked/inline the label/helperText move to the
    // external FieldLayoutShell so the row aligns with sibling stacked fields.
    const useShell = layout !== 'floating';

    const control = (
      <MuiTextField
        id={fieldId}
        name={name}
        multiline={true}
        minRows={minRows}
        value={resolvedValue}
        error={resolvedError}
        helperText={useShell ? undefined : resolvedHelperText}
        disabled={effectiveDisabled}
        {...rest}
        label={
          useShell
            ? undefined
            : renderLabelWithTooltip(label, tooltip, ownAsterisk)
        }
        // IMPORTANT: Put handlers AFTER {...rest} spread
        // to ensure they override any handlers from rest
        onChange={handleChange as MuiTextFieldProps['onChange']}
        onBlur={handleBlur as MuiTextFieldProps['onBlur']}
        slotProps={slotPropsWithRef}
      />
    );

    if (!useShell) return control;

    return (
      <FieldLayoutShell
        layout={layout as 'stacked' | 'inline'}
        label={label}
        tooltip={tooltip}
        required={rest.required}
        helperText={resolvedHelperText}
        error={resolvedError}
        disabled={effectiveDisabled}
        htmlFor={fieldId}
        fullWidth={rest.fullWidth}
        theme={dashTheme}
      >
        {control}
      </FieldLayoutShell>
    );
  }

  // Standalone fallback (plain mode)
  const plainUseShell = layout !== 'floating';

  const plainControl = (
    <MuiTextField
      id={fieldId}
      name={name}
      multiline={true}
      minRows={minRows}
      disabled={effectiveDisabled}
      {...rest}
      label={plainUseShell ? undefined : renderLabelWithTooltip(label, tooltip)}
      helperText={plainUseShell ? undefined : rest.helperText}
      slotProps={mergedSlotProps}
    />
  );

  if (!plainUseShell) return plainControl;

  return (
    <FieldLayoutShell
      layout={layout as 'stacked' | 'inline'}
      label={label}
      tooltip={tooltip}
      required={rest.required}
      helperText={rest.helperText}
      error={rest.error}
      disabled={effectiveDisabled}
      htmlFor={fieldId}
      fullWidth={rest.fullWidth}
      theme={dashTheme}
    >
      {plainControl}
    </FieldLayoutShell>
  );
}
