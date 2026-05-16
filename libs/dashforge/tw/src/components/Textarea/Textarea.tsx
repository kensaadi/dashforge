import { useCallback, useContext, useEffect, useId, useRef } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { textareaVariants } from './textarea.variants.js';
import type { TextareaProps } from './textarea.types.js';

/**
 * Dashforge TW Textarea — bridge-integrated multi-line input.
 *
 * Sibling of `<TextField>` (same slot taxonomy, same bridge wiring) but
 * renders a `<textarea>` element instead of a single-line `<input>`.
 *
 * Defaults to `rows={3}` and `resize="vertical"` — both overridable via
 * variant prop or per-instance `rows` attribute.
 *
 * **A11y**: `aria-invalid` from the resolved validation state,
 * `aria-describedby` links to the helper/error text node, required
 * fields get the native `required` attribute + a visual `*`.
 */
export function Textarea(props: TextareaProps) {
  const {
    name,
    rules,
    visibleWhen,
    layout = 'stacked',
    size,
    resize,
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
    rows = 3,
    onChange: userOnChange,
    onBlur: userOnBlur,
    value: userValue,
    defaultValue,
    ...rest
  } = props;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
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
  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: string | undefined = userValue;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (userValue === undefined) {
      const bv = fieldMeta.value;
      resolvedValue = bv == null ? '' : String(bv);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFormMode && bridge) {
      bridge.setValue?.(name, e.target.value);
      void registration?.onChange?.(e);
    }
    userOnChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (isFormMode && bridge) {
      registration?.onBlur?.(e);
    }
    userOnBlur?.(e);
  };

  const registrationRefFn = registration?.ref;
  const inputRef = useCallback(
    (instance: HTMLTextAreaElement | null) => {
      if (typeof registrationRefFn === 'function') {
        registrationRefFn(instance);
      }
    },
    [registrationRefFn]
  );

  // ───── Render-time guards (after all hooks) ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = textareaVariants({
    size,
    layout,
    resize,
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
        <textarea
          {...rest}
          id={inputId}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={isFormMode ? resolvedValue ?? '' : userValue}
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
