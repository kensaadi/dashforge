import { useContext, useEffect, useId, useRef } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
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
    checked,
    defaultChecked,
    onCheckedChange,
    sx,
    slotProps,
  } = props;

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Reactive snapshot — see Checkbox.tsx for the same rationale.
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const controlId = useId();

  // StrictMode-safe unregister-on-unmount
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
   
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: cap, name: capName } = unregisterRef.current;
      queueMicrotask(() => {
        if (!isMountedRef.current) cap?.unregister?.(capName);
      });
    };
  }, []);

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
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      <RadixSwitch.Root
        id={controlId}
        name={name}
        {...radixStateProps}
        disabled={effectiveDisabled}
        onCheckedChange={handleCheckedChange}
        onBlur={handleBlur}
        ref={registration?.ref as React.Ref<HTMLButtonElement> | undefined}
        className={cn(v.control(), slotProps?.control?.className)}
      >
        <RadixSwitch.Thumb className={cn(v.thumb(), slotProps?.thumb?.className)} />
      </RadixSwitch.Root>

      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={controlId}
            className={cn(v.label(), slotProps?.label?.className)}
          >
            {label}
          </label>
        )}
        {resolvedHelperText && (
          <p
            className={cn(
              resolvedError ? v.errorText() : v.helperText(),
              resolvedError
                ? slotProps?.errorText?.className
                : slotProps?.helperText?.className
            )}
          >
            {resolvedHelperText}
          </p>
        )}
      </div>
    </div>
  );
}
