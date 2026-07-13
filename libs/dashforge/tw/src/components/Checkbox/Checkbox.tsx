import { useContext, useEffect, useId, useRef } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { useStandaloneFieldWarning } from '../../hooks/useStandaloneFieldWarning.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { checkboxVariants } from './checkbox.variants.js';
import type { CheckboxProps } from './checkbox.types.js';

/**
 * Inline checkmark SVG used by `Radix.Indicator` when fully checked.
 * Stroke uses `currentColor` so the parent's `text-white` propagates.
 *
 * @internal
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Inline dash SVG used by `Radix.Indicator` when the checkbox is in
 * the `indeterminate` tri-state ("some, but not all, children
 * selected" — the canonical "select all" partial state).
 *
 * Pre-0.2.2-beta the indicator rendered the CheckIcon for BOTH
 * checked and indeterminate (Radix mounts the Indicator for either
 * state). We now discriminate via the `data-state` attribute Radix
 * sets on the Indicator element itself — see the parent `Indicator`
 * rendering below for the CSS toggle.
 *
 * @internal
 */
function DashIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Dashforge TW Checkbox — bridge-integrated form control.
 *
 * Renders through Radix `Checkbox.Root` + `Checkbox.Indicator`, styled
 * with the `checkboxVariants` TV recipe. Behaviour at the bridge level
 * is a direct port of `@dashforge/ui/Checkbox` (MUI):
 *
 *  - When mounted inside `DashFormProvider`, registers with the bridge
 *    (`bridge.register`), reads `bridge.getValue` for the checked
 *    state, writes `bridge.setValue` on change, fires
 *    `registration.onChange` / `onBlur` for RHF.
 *  - When mounted outside, behaves as a plain uncontrolled checkbox.
 *  - `visibleWhen` predicates the engine state; `false` → returns null.
 *  - `useAccessState(access)` resolves RBAC; `visible: false` → null.
 *  - `unregister`-on-unmount is StrictMode-safe (queueMicrotask +
 *    `isMountedRef`, mirrors the MUI-side pattern).
 *  - Error gating: bridge error shows only after `touched` or after
 *    the form has been submitted (`submitCount > 0`).
 *
 * Renderer differences vs MUI:
 *
 *  - No `FormControlLabel` wrapper — uses a native `<label htmlFor>`
 *    bound via `useId()`. The label click toggles via HTML semantics.
 *  - The Radix root is a `<button>`, so it's keyboard-accessible by
 *    default (Space toggles).
 *  - Slot overrides are class-based (`slotProps={{ control: { className } }}`)
 *    rather than MUI slot components.
 */
export function Checkbox(props: CheckboxProps) {
  const themeDefaults = useComponentDefaults('Checkbox');
  const merged: CheckboxProps = { ...themeDefaults?.defaults, ...props };
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
  } = merged;

  // ───── Hooks (always called, unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Per-field granular subscription. We READ from `fieldMeta.value`
  // (reactive snapshot) rather than `bridge.getValue(name)` (eager
  // read with no subscription).
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const controlId = useId();

  // StrictMode-safe unregister-on-unmount — mirrors MUI Checkbox.tsx
  // (the bridge identity changes on every keystroke, so we MUST NOT
  // re-run cleanup on deps changes — empty deps + ref pattern).
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

  // Dev-only guard against a standalone widget without controlled props —
  // must run before the visibility early-returns so hook ordering is
  // consistent across renders. See #113 / useStandaloneFieldWarning.
  useStandaloneFieldWarning(
    'Checkbox',
    name,
    Boolean(bridge?.register),
    checked,
    onCheckedChange,
  );

  // ───── Early returns ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  // ───── Effective disabled (OR logic: explicit OR RBAC) ─────
  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly;

  // ───── Form mode vs Standalone ─────
  const isFormMode = Boolean(bridge?.register);

  let resolvedChecked: boolean | 'indeterminate' = checked ?? defaultChecked ?? false;
  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    // Reactive snapshot from useDashFieldMeta — re-renders on per-field
    // state change, unlike bridge.getValue (eager read, no subscription).
    resolvedChecked =
      checked !== undefined ? checked : Boolean(fieldMeta.value);
  }

  // ───── Handlers ─────
  const handleCheckedChange = (next: boolean | 'indeterminate') => {
    const nextBool = next === true; // indeterminate treated as unchecked at the bridge level

    if (isFormMode && bridge) {
      // Update bridge value FIRST so subsequent reads see the new state.
      bridge.setValue?.(name, nextBool);

      // Synthesise a minimal RHF-compatible event for registration.onChange.
      const syntheticEvent = {
        target: { name, checked: nextBool, value: nextBool },
        type: 'change',
      };
      void registration?.onChange?.(syntheticEvent);
    }

    onCheckedChange?.(nextBool);
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

  // ───── Render ─────
  const v = checkboxVariants({ size, error: resolvedError });

  // Radix Checkbox: pass `checked` (controlled) OR `defaultChecked`
  // (uncontrolled), never both. In bridge mode the truth lives in the
  // bridge — always controlled. Standalone: respect whichever prop the
  // consumer supplied.
  const radixStateProps: {
    checked?: boolean | 'indeterminate';
    defaultChecked?: boolean;
  } = isFormMode
    ? { checked: resolvedChecked }
    : checked !== undefined
      ? { checked }
      : { defaultChecked: defaultChecked ?? false };

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      <RadixCheckbox.Root
        id={controlId}
        name={name}
        {...radixStateProps}
        disabled={effectiveDisabled}
        onCheckedChange={handleCheckedChange}
        onBlur={handleBlur}
        ref={registration?.ref as React.Ref<HTMLButtonElement> | undefined}
        className={cn(v.control(), slotProps?.control?.className)}
      >
        {/*
         * Radix.Indicator natively mounts only when `data-state` is
         * `checked` or `indeterminate` — i.e. it tracks Radix's
         * internal state directly, no React state dependency.
         *
         * The previous implementation used `forceMount` + a React
         * conditional `{resolvedChecked === true ? <CheckIcon /> : null}`,
         * which broke standalone uncontrolled mode: Radix would flip
         * its internal `data-state` on click (turning the control blue
         * via `data-[state=checked]:bg-primary-500`) but the React
         * snapshot for `resolvedChecked` stayed stale, so the
         * `<CheckIcon />` never mounted. Result: blue box with no
         * tick after user interaction.
         *
         * Dropping forceMount + the conditional defers the mount
         * decision to Radix (the single source of truth in all three
         * modes — controlled, uncontrolled, bridge). Indicator mounts
         * exactly when the checkbox is checked OR indeterminate.
         *
         * Per-state glyph (Sprint 2 P4): when Indicator is mounted we
         * render BOTH glyphs and toggle visibility via the Indicator's
         * own `data-state` attribute. The `group` class on Indicator
         * lets the SVG children target the parent's state with
         * `group-data-[state=checked]:hidden` / `…:indeterminate:hidden`.
         * No React state required — Radix's data-state attribute is
         * the single source of truth.
         */}
        <RadixCheckbox.Indicator
          className={cn(v.indicator(), 'group', slotProps?.indicator?.className)}
        >
          <CheckIcon className="h-full w-full group-data-[state=indeterminate]:hidden" />
          <DashIcon className="h-full w-full group-data-[state=checked]:hidden" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

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
