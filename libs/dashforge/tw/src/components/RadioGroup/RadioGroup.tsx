import { useContext, useEffect, useId, useRef } from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { radioGroupVariants } from './radioGroup.variants.js';
import type { RadioGroupProps } from './radioGroup.types.js';

/**
 * Dashforge TW RadioGroup — bridge-integrated single-choice group.
 *
 * Renders through Radix `RadioGroup.Root` + `Item` + `Indicator`, styled
 * with the `radioGroupVariants` TV recipe. Behaviour at the bridge level
 * is a 1:1 port of `@dashforge/ui/RadioGroup` (MUI):
 *
 *  - Inside `DashFormProvider`: registers with the bridge, reads
 *    `useDashFieldMeta` for the selected value (reactive snapshot),
 *    writes through `bridge.setValue` on change, fires
 *    `registration.onChange` / `onBlur` for RHF.
 *  - Outside: behaves as a plain Radix RadioGroup (controlled by `value`
 *    + `onValueChange`, or uncontrolled via `defaultValue`).
 *  - `visibleWhen` predicates the engine state.
 *  - `useAccessState(access)` resolves group-level RBAC; per-option RBAC
 *    is resolved by calling `useAccessState` for every entry of the
 *    `options` array (Rules of Hooks: stable as long as `options.length`
 *    is stable, which is the documented contract — mutating the array
 *    between renders breaks).
 *  - Group-level RBAC has precedence over option-level (hide-the-group
 *    wins even if some options would be visible).
 *  - Error gating: bridge error shows only after `touched` or after the
 *    form has been submitted at least once (Form Closure v1).
 *  - StrictMode-safe unregister-on-unmount, mirrors Checkbox/Switch.
 *
 * **A11y**:
 *   - The group root is a `<div role="radiogroup">` (Radix default).
 *   - A `<label id="...">` is associated with the group via `aria-labelledby`.
 *   - The helper/error text is linked via `aria-describedby`.
 *   - Each option is a Radix `<RadioGroup.Item>` (`<button role="radio">`)
 *     keyboard-accessible by default (arrow keys move selection).
 */
export function RadioGroup(props: RadioGroupProps) {
  const {
    name,
    options,
    label,
    rules,
    helperText,
    required,
    error,
    disabled,
    size,
    layout,
    access,
    visibleWhen,
    sx,
    slotProps,
    value: explicitValue,
    defaultValue,
    onValueChange,
  } = props;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Granular per-field subscription (side-effect: re-render this
  // component when ITS own bridge state mutates). We DON'T read the
  // value from this hook because it can return `undefined` on the
  // first render before the subscription has primed — use
  // `bridge.getValue(name)` for the actual value (mirrors MUI side).
  useDashFieldMeta(name);
  const groupAccessState = useAccessState(access);

  // Per-option RBAC. Hooks-in-loop is safe as long as `options.length` is
  // stable across renders — documented as the contract for this component.
  const optionAccessStates = options.map((option) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAccessState(option.access)
  );

  const labelId = useId();
  const helperId = `${labelId}-help`;

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

  // ───── Early returns ─────
  if (!isVisible) return null;
  if (!groupAccessState.visible) return null;

  // ───── Effective group disabled (group-level OR explicit) ─────
  const groupEffectiveDisabled =
    Boolean(disabled) || groupAccessState.disabled || groupAccessState.readonly;

  // ───── Form mode vs standalone ─────
  const isFormMode = Boolean(bridge?.register);

  let resolvedValue: string =
    explicitValue ?? defaultValue ?? '';
  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (explicitValue === undefined) {
      const bv = bridge.getValue(name);
      resolvedValue = bv == null ? '' : String(bv);
    }
  }

  // ───── Process per-option visibility / disabled ─────
  const processedOptions = options
    .map((option, index) => {
      const optAccess = optionAccessStates[index];
      const isSelected = option.value === resolvedValue;
      // Option is hidden ONLY if access says hide AND it's not the
      // currently selected value (keep the selected option visible-but-
      // disabled so the user can see what they picked even if perms changed).
      const shouldHide = !optAccess.visible && !isSelected;
      if (shouldHide) return null;

      const optionEffectiveDisabled =
        groupEffectiveDisabled ||
        Boolean(option.disabled) ||
        optAccess.disabled ||
        optAccess.readonly ||
        (!optAccess.visible && isSelected);

      return { ...option, effectiveDisabled: optionEffectiveDisabled };
    })
    .filter((opt): opt is NonNullable<typeof opt> => opt !== null);

  // ───── Handlers ─────
  const handleValueChange = (next: string) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      void registration?.onChange?.({
        target: { name, value: next },
        type: 'change',
      });
    }
    onValueChange?.(next);
  };

  const handleBlur = () => {
    if (!isFormMode || !bridge) return;
    const current = bridge.getValue(name) as string | undefined;
    registration?.onBlur?.({
      target: { name, value: current ?? '' },
      type: 'blur',
    });
  };

  // ───── Render ─────
  const v = radioGroupVariants({
    size,
    layout,
    error: resolvedError,
    disabled: groupEffectiveDisabled,
  });

  return (
    <div
      className={cn(v.root(), sx, slotProps?.root?.className)}
      aria-describedby={resolvedHelperText ? helperId : undefined}
    >
      {label && (
        <div
          id={labelId}
          className={cn(v.label(), slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(v.requiredMark(), slotProps?.requiredMark?.className)}
            >
              *
            </span>
          )}
        </div>
      )}

      {/*
       * Radix RadioGroup mode discrimination — mirrors the same fix
       * applied to <Checkbox>:
       *
       *   - Form mode (bridge.register present): controlled — `value`
       *     comes from the reactive bridge snapshot, `handleValueChange`
       *     writes back through bridge.setValue.
       *   - Standalone controlled (consumer passes `value`): controlled —
       *     consumer owns state, `handleValueChange` forwards via
       *     `onValueChange`.
       *   - Standalone uncontrolled (only `defaultValue`): UNCONTROLLED —
       *     Radix owns the state. Previously this code passed
       *     `value={resolvedValue}` in this branch too, putting Radix
       *     in controlled mode with a stale snapshot that never updated,
       *     so user clicks fired Radix's onValueChange but the controlled
       *     prop never changed and the selection snapped right back.
       *
       * Picking exactly one of `{ value, ... }` or `{ defaultValue, ... }`
       * lets Radix track its own state correctly when nobody else can.
       */}
      <RadixRadioGroup.Root
        name={name}
        {...(isFormMode || explicitValue !== undefined
          ? { value: resolvedValue }
          : { defaultValue: defaultValue ?? undefined })}
        onValueChange={handleValueChange}
        onBlur={handleBlur}
        disabled={groupEffectiveDisabled}
        required={required}
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={resolvedError || undefined}
        className={cn(v.optionList(), slotProps?.optionList?.className)}
      >
        {processedOptions.map((option) => {
          const optionLabelId = `${labelId}-opt-${option.value}`;
          return (
            <div
              key={option.value}
              className={cn(v.option(), slotProps?.option?.className)}
            >
              <RadixRadioGroup.Item
                value={option.value}
                id={optionLabelId}
                disabled={option.effectiveDisabled}
                className={cn(v.control(), slotProps?.control?.className)}
              >
                <RadixRadioGroup.Indicator
                  className={cn(v.indicator(), slotProps?.indicator?.className)}
                />
              </RadixRadioGroup.Item>
              <label
                htmlFor={optionLabelId}
                className={cn(
                  v.optionLabel(),
                  option.effectiveDisabled && 'cursor-not-allowed opacity-60',
                  slotProps?.optionLabel?.className
                )}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </RadixRadioGroup.Root>

      {resolvedHelperText && (
        <p
          id={helperId}
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
  );
}
