import { useContext, useEffect, useId, useRef } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { resolveFieldTooltip, renderLabelWithTooltip } from '../_shared/fieldTooltip.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { useStandaloneFieldWarning } from '../../hooks/useStandaloneFieldWarning.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { switchVariants } from './switch.variants.js';
import type { SwitchProps } from './switch.types.js';

/**
 * Dashforge TW Switch — bridge-integrated toggle.
 *
 * Implementation mirrors `<Checkbox>` (same 8-step bridge integration
 * pattern, same StrictMode-safe unregister, same controlled-vs-
 * uncontrolled Radix props logic) — the only differences are:
 *
 *  - Renders Radix `Switch.Root` + `Switch.Thumb` instead of `Checkbox`.
 *  - No indicator icon (the thumb position is the visual state).
 *  - Variants drive both control track dimensions AND the thumb
 *    translate-x distance so the knob lands flush at each end.
 */
export function Switch(props: SwitchProps) {
  const themeDefaults = useComponentDefaults('Switch');
  const merged: SwitchProps = { ...themeDefaults?.defaults, ...props };
  const themeSlotProps = themeDefaults?.slotProps;
  // Option C deep-merge: instance `tooltip` over `theme…defaults.tooltip`.
  const tooltipConfig = resolveFieldTooltip(props.tooltip, themeDefaults?.defaults?.tooltip);
  const {
    name,
    rules,
    visibleWhen,
    label,
    helperText,
    error,
    access,
    size,
    disabled,
    required,
    checked,
    defaultChecked,
    onCheckedChange,
    sx,
    slotProps,
  } = merged;

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Reactive snapshot — see Checkbox.tsx for the same rationale.
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const controlId = useId();

  // BUG 21 v2: local ref + post-mount `aria-required` setter — same
  // pattern as Checkbox.tsx. Radix.Switch.Root reads `required` prop
  // into context but the JSX `aria-required` attribute does not reach
  // the browser DOM in production builds. Setting via ref is
  // Radix-version-agnostic. See README-BUG.md § BUG 21.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const setControlRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    const regRef = registration?.ref as
      | React.RefCallback<HTMLButtonElement>
      | React.MutableRefObject<HTMLButtonElement | null>
      | null
      | undefined;
    if (typeof regRef === 'function') {
      regRef(node);
    } else if (regRef && typeof regRef === 'object') {
      regRef.current = node;
    }
  };
  useEffect(() => {
    const node = buttonRef.current;
    if (!node) return;
    if (required) {
      node.setAttribute('aria-required', 'true');
    } else {
      node.removeAttribute('aria-required');
    }
  }, [required]);

  // StrictMode-safe unregister-on-unmount
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
   
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: cap, name: capName } = unregisterRef.current;
      // BUG 22: only release bridge state on unmount if the form
      // is configured to forget unmounted fields. Default `false`
      // keeps values in RHF so <Stepper> / tab-swap patterns can
      // read earlier answers back on later steps. See README-BUG.md § BUG 22.
      if (!cap?.shouldUnregister) return;
      queueMicrotask(() => {
        if (!isMountedRef.current) cap?.unregister?.(capName);
      });
    };
  }, []);

  // Dev-only guard against a standalone widget without controlled props —
  // must run before the visibility early-returns so hook ordering is
  // consistent across renders. See #113 / useStandaloneFieldWarning.
  useStandaloneFieldWarning(
    'Switch',
    name,
    Boolean(bridge?.register),
    checked,
    onCheckedChange,
  );

  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedChecked = checked ?? defaultChecked ?? false;
  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    resolvedChecked =
      checked !== undefined ? checked : Boolean(fieldMeta.value);
  }

  const handleCheckedChange = (next: boolean) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      const syntheticEvent = {
        target: { name, checked: next, value: next },
        type: 'change',
      };
      void registration?.onChange?.(syntheticEvent);
    }
    onCheckedChange?.(next);
  };

  const handleBlur = () => {
    if (!isFormMode || !bridge) return;
    const currentChecked = bridge.getValue(name) === true;
    const syntheticEvent = {
      target: { name, checked: currentChecked, value: currentChecked },
      type: 'blur',
    };
    registration?.onBlur?.(syntheticEvent);
  };

  const v = switchVariants({ size, error: resolvedError });

  // Controlled vs uncontrolled (same logic as Checkbox).
  const radixStateProps: { checked?: boolean; defaultChecked?: boolean } = isFormMode
    ? { checked: resolvedChecked }
    : checked !== undefined
      ? { checked }
      : { defaultChecked: defaultChecked ?? false };

  return (
    <div className={cn(v.root(), sx, themeSlotProps?.root?.className, slotProps?.root?.className)}>
      <RadixSwitch.Root
        id={controlId}
        name={name}
        {...radixStateProps}
        disabled={effectiveDisabled}
        required={required}
        onCheckedChange={handleCheckedChange}
        onBlur={handleBlur}
        // BUG 21 v2: `aria-required` set via `setControlRef` + `useEffect`
        // above, not via JSX prop. See Checkbox.tsx for the same pattern
        // and the reasoning.
        ref={setControlRef}
        className={cn(v.control(), themeSlotProps?.control?.className, slotProps?.control?.className)}
      >
        <RadixSwitch.Thumb className={cn(v.thumb(), themeSlotProps?.thumb?.className, slotProps?.thumb?.className)} />
      </RadixSwitch.Root>

      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={controlId}
            className={cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className)}
          >
            {renderLabelWithTooltip(label, tooltipConfig)}
            {required && (
              <span
                aria-hidden="true"
                className={cn(
                  v.requiredMark(),
                  themeSlotProps?.requiredMark?.className,
                  slotProps?.requiredMark?.className,
                )}
              >
                *
              </span>
            )}
          </label>
        )}
        {resolvedHelperText && (
          <p
            className={cn(
              resolvedError ? v.errorText() : v.helperText(),
              resolvedError
                ? [themeSlotProps?.errorText?.className, slotProps?.errorText?.className]
                : [themeSlotProps?.helperText?.className, slotProps?.helperText?.className]
            )}
          >
            {resolvedHelperText}
          </p>
        )}
      </div>
    </div>
  );
}
