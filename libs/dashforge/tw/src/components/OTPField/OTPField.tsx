import { useContext, useEffect, useId, useRef, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { otpFieldVariants } from './otpField.variants.js';
import type { OTPFieldMode, OTPFieldProps } from './otpField.types.js';

/**
 * Whitelist allowed characters per mode. Anything else is dropped.
 *
 * @internal
 */
function sanitize(input: string, mode: OTPFieldMode, max: number): string {
  const re = mode === 'numeric' ? /[0-9]/ : /[A-Za-z0-9]/;
  let out = '';
  for (const ch of input) {
    if (re.test(ch) && out.length < max) out += ch;
  }
  return out;
}

/**
 * Dashforge TW OTPField — segmented input for one-time codes.
 *
 * Renders N visible "slot" cells over a hidden text input that absorbs
 * all keystrokes. The visible cells are read-only display surfaces; only
 * the hidden input takes focus. This pattern works correctly with
 * password managers + autofill (the hidden input has
 * `autoComplete="one-time-code"`).
 *
 * Bridge contract: the joined string (length ≤ `length`) is what gets
 * written to the bridge. Use `<DashForm rules={{ minLength: length }} />`
 * to require a complete code.
 *
 * Out of scope for F4-B (deferred to a follow-up sprint):
 *  - Per-slot click to jump caret
 *  - Arrow-key navigation between slots
 *  - Right-to-left input direction
 *
 * **A11y**: the hidden `<input>` exposes
 * `inputMode="numeric" | "text"` per mode + `autoComplete="one-time-code"`
 * so iOS Safari + Android Chrome trigger SMS autofill correctly.
 */
export function OTPField(props: OTPFieldProps) {
  const themeDefaults = useComponentDefaults('OTPField');
  const merged: OTPFieldProps = { ...themeDefaults?.defaults, ...props };
  const themeSlotProps = themeDefaults?.slotProps;
  const {
    name,
    rules,
    visibleWhen,
    size,
    label,
    helperText,
    required,
    error,
    disabled,
    access,
    sx,
    slotProps,
    length = 6,
    mode = 'numeric',
    value: userValue,
    defaultValue,
    onChange: userOnChange,
    onComplete,
  } = merged;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const inputId = useId();
  const helperId = `${inputId}-help`;
  const labelId = `${inputId}-label`;

  const [isFocused, setIsFocused] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    sanitize(defaultValue ?? '', mode, length)
  );

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

  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: string;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (userValue !== undefined) {
      resolvedValue = sanitize(userValue, mode, length);
    } else {
      const bv = bridge.getValue(name);
      resolvedValue = sanitize(bv == null ? '' : String(bv), mode, length);
    }
  } else if (userValue !== undefined) {
    resolvedValue = sanitize(userValue, mode, length);
  } else {
    resolvedValue = uncontrolledValue;
  }

  const v = otpFieldVariants({ size, error: resolvedError });

  const commitValue = (next: string) => {
    const sanitised = sanitize(next, mode, length);

    if (isFormMode && bridge) {
      bridge.setValue?.(name, sanitised);
      void registration?.onChange?.({
        target: { name, value: sanitised },
        type: 'change',
      });
    } else if (userValue === undefined) {
      setUncontrolledValue(sanitised);
    }

    userOnChange?.(sanitised);

    if (sanitised.length === length && onComplete) {
      onComplete(sanitised);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commitValue(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    commitValue(pasted);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (isFormMode && registration?.onBlur) {
      registration.onBlur(e);
    }
  };

  // Compute the active slot index (cursor position) for the visual
  // highlight: it's the next empty slot, or the last slot if full.
  const activeSlotIndex = Math.min(resolvedValue.length, length - 1);
  const inputMode = mode === 'numeric' ? 'numeric' : 'text';

  return (
    <div className={cn(v.root(), sx, themeSlotProps?.root?.className, slotProps?.root?.className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className={cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(v.requiredMark(), themeSlotProps?.requiredMark?.className, slotProps?.requiredMark?.className)}
            >
              *
            </span>
          )}
        </label>
      )}

      <div className={cn(v.slotsRow(), themeSlotProps?.slotsRow?.className, slotProps?.slotsRow?.className)}>
        {Array.from({ length }, (_, i) => {
          const char = resolvedValue[i] ?? '';
          const isActive = isFocused && !effectiveDisabled && i === activeSlotIndex;
          return (
            <div
              key={i}
              data-active={isActive || undefined}
              data-disabled={effectiveDisabled || undefined}
              className={cn(v.slot(), themeSlotProps?.slot?.className, slotProps?.slot?.className)}
              aria-hidden="true"
            >
              <span className={cn(v.slotChar(), themeSlotProps?.slotChar?.className, slotProps?.slotChar?.className)}>
                {char}
              </span>
            </div>
          );
        })}
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode={inputMode}
          autoComplete="one-time-code"
          maxLength={length}
          value={resolvedValue}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          required={required}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={resolvedError || undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          ref={registration?.ref as React.Ref<HTMLInputElement> | undefined}
          className={cn(v.hiddenInput(), themeSlotProps?.hiddenInput?.className, slotProps?.hiddenInput?.className)}
        />
      </div>

      {resolvedHelperText && (
        <p
          id={helperId}
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
  );
}
