import { useCallback, useContext, useEffect, useId, useRef } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { textFieldVariants } from './textField.variants.js';
import type { TextFieldProps } from './textField.types.js';

/**
 * Dashforge TW TextField — bridge-integrated text input.
 *
 * Implementation mirrors `@dashforge/ui/TextField` (MUI) at the bridge
 * level — same `name` / `rules` / `visibleWhen` / `access` semantics,
 * same validation gating, same StrictMode-safe unregister pattern.
 * Renderer differences:
 *
 *  - Native `<input>` element wrapped in a TV-styled
 *    `<div role-less wrapper>` so the focus ring extends to the entire
 *    field (consistent with shadcn-style inputs).
 *  - Layout modes: `stacked` (default — label above) and `inline`
 *    (label left of input). MUI's `floating` mode is deferred to a
 *    follow-up sprint; consumers needing the visual can layer it via
 *    `slotProps`.
 *  - No Select-integration hook (Select lands in F4 as its own component).
 *
 * **A11y**:
 *   - `aria-invalid` is set from the resolved validation state.
 *   - `aria-describedby` links the input to the helper/error text node.
 *   - Required fields get the native `required` attribute + a visual `*`.
 */
export function TextField(props: TextFieldProps) {
  const {
    name,
    rules,
    visibleWhen,
    layout = 'stacked',
    size,
    label,
    helperText,
    required,
    error,
    disabled,
    fullWidth,
    access,
    sx,
    slotProps,
    placeholder,
    type,
    onChange: userOnChange,
    onBlur: userOnBlur,
    value: userValue,
    defaultValue,
    ...rest
  } = props;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  // Granular per-field subscription. We READ from `fieldMeta.value`
  // (reactive snapshot) rather than `bridge.getValue(name)` (eager
  // read with no subscription) so React re-renders this field on its
  // own state mutations — the canonical pattern, mirrors the MUI side.
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const inputId = useId();
  const helperId = `${inputId}-help`;

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

  // ───── Derived (every hook MUST be called above the early returns) ─────
  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: string | number | readonly string[] | undefined = userValue as
    | string
    | number
    | readonly string[]
    | undefined;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (userValue === undefined) {
      // Read the reactive snapshot from `useDashFieldMeta` — NOT
      // `bridge.getValue` — so the component re-renders on every
      // per-field state change without the unsubscribe trick the
      // legacy bridge used.
      const bv = fieldMeta.value;
      resolvedValue =
        bv == null ? '' : (bv as string | number);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, e.target.value);
      void registration?.onChange?.(e);
    }
    userOnChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isFormMode && bridge) {
      registration?.onBlur?.(e);
    }
    userOnBlur?.(e);
  };

  // In form mode, RHF supplies its own callback ref via registration.
  // Wrap it in a stable callback so React 19 unambiguously treats it as
  // a callback ref (and to give us a single place to extend the ref
  // chain in the future — e.g. for a user-supplied `ref` prop via
  // `forwardRef`).
  const registrationRefFn = registration?.ref;
  const inputRef = useCallback(
    (instance: HTMLInputElement | null) => {
      if (typeof registrationRefFn === 'function') {
        registrationRefFn(instance);
      }
    },
    [registrationRefFn]
  );

  // ───── Render-time guards (after all hooks) ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = textFieldVariants({
    size,
    layout,
    error: resolvedError,
    fullWidth,
    disabled: effectiveDisabled,
  });

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      {label && (
        <label
          htmlFor={inputId}
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
        </label>
      )}

      <div className={cn(v.inputWrapper(), slotProps?.inputWrapper?.className)}>
        {/*
         * Prefix slot (Sprint 2 P4.1) — inline adornment rendered
         * BEFORE the input. Mounts only when `slotProps.prefix.children`
         * is provided so empty configs don't add layout cost. Common
         * use: currency symbols (`$`, `€`), units (`@`, `#`), status
         * icons. The slot wrapper carries `pointer-events-none` to
         * avoid stealing focus from the input on click.
         */}
        {slotProps?.prefix?.children !== undefined && (
          <span
            aria-hidden="true"
            className={cn(v.prefix(), slotProps.prefix.className)}
          >
            {slotProps.prefix.children}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          name={name}
          type={type ?? 'text'}
          placeholder={placeholder}
          value={isFormMode ? (resolvedValue as string | number | readonly string[]) ?? '' : userValue}
          defaultValue={!isFormMode && userValue === undefined ? defaultValue : undefined}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          required={required}
          aria-invalid={resolvedError || undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={inputRef}
          className={cn(v.input(), slotProps?.input?.className)}
        />
        {/*
         * Suffix slot (Sprint 2 P4.1) — same pattern as prefix,
         * rendered AFTER the input. Typical use: unit labels (`USD`,
         * `kg`, `%`), trailing icons, length counters.
         */}
        {slotProps?.suffix?.children !== undefined && (
          <span
            aria-hidden="true"
            className={cn(v.suffix(), slotProps.suffix.className)}
          >
            {slotProps.suffix.children}
          </span>
        )}
      </div>

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
