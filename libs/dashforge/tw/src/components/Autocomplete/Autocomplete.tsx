import { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ComboBox,
  Input,
  Button as AriaButton,
  Popover,
  ListBox,
  ListBoxItem,
  Label as AriaLabel,
} from 'react-aria-components';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { autocompleteVariants } from './autocomplete.variants.js';
import type {
  AutocompleteOption,
  AutocompleteProps,
} from './autocomplete.types.js';

/**
 * Dashforge TW Autocomplete — bridge-integrated single-select combobox.
 *
 * Built on React Aria Components `<ComboBox>` for AAA-grade keyboard +
 * screen-reader support (arrow nav, type-ahead, ARIA `combobox` /
 * `listbox` / `option` roles, focus management, etc.) without writing
 * any of that ourselves.
 *
 * Behaviour at the bridge level is a port of the MUI-side `Autocomplete`:
 *
 *  - Inside `DashFormProvider`: registers with the bridge, reads
 *    `bridge.getValue(name)` for the selected value, writes via
 *    `bridge.setValue` + `registration.onChange`.
 *  - Outside: behaves as a plain Aria ComboBox (controlled by `value` +
 *    `onValueChange`, or uncontrolled via `defaultValue`).
 *  - `visibleWhen` predicates the engine state.
 *  - `useAccessState(access)` resolves RBAC; `readonly` is mapped to
 *    `inputProps.readOnly` and disables both the popover trigger and
 *    the clear button.
 *  - Form Closure v1 error gating mirrors all other tw form fields.
 *  - StrictMode-safe unregister-on-unmount.
 *
 * F5-A scope: single-select, static options, basic filtering provided
 * by React Aria's default `contains` filter. Multi-select, free-solo
 * text, generic option shapes, async runtime options (`optionsFromFieldData`)
 * and custom item rendering are follow-up sub-sprints.
 *
 * **A11y**:
 *   - Native ARIA `combobox` role on the input
 *   - Roving `tabindex` + arrow-key nav handled by Aria primitive
 *   - Clear button is hidden when there's no value to clear
 *   - Required field gets `aria-required="true"` via `isRequired`
 */
export function Autocomplete(props: AutocompleteProps) {
  const {
    name,
    rules,
    options,
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
    value: explicitValue,
    defaultValue,
    onValueChange,
    emptyMessage = 'No matching options',
  } = props;

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const labelId = useId();
  const helperId = `${labelId}-help`;

  // StrictMode-safe unregister-on-unmount
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Controlled inputValue + manual filtering. React Aria's `ComboBox`
  // does NOT filter automatically when `items` is provided (the
  // `defaultFilter` prop documented in v1.x is undocumented or
  // unreliable in current versions), so we control both halves
  // ourselves — the canonical pattern from the react-aria-components
  // docs for filtered comboboxes.
  //
  //   inputValue   = state we own, fed back to ComboBox
  //   onInputChange = updates inputValue (fires for typing AND for
  //                   programmatic selection — Aria writes the picked
  //                   option's textValue back through this callback)
  //   filteredItems = items.filter(label contains inputValue)
  //
  // The filter is case-insensitive substring match on the option's
  // string label (or its `value` if label is a non-string node — rare).
  const [inputValue, setInputValue] = useState('');
  const filteredItems = useMemo<AutocompleteOption[]>(() => {
    if (!inputValue) return options;
    const query = inputValue.toLowerCase();
    return options.filter((opt) => {
      const text =
        typeof opt.label === 'string' ? opt.label : String(opt.value);
      return text.toLowerCase().includes(query);
    });
  }, [options, inputValue]);

  const handleInputChange = useCallback((next: string) => {
    setInputValue(next);
  }, []);

  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;

  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: string | null;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (explicitValue !== undefined) {
      resolvedValue = explicitValue;
    } else {
      const bv = bridge.getValue(name);
      resolvedValue = bv == null ? null : String(bv);
    }
  } else {
    resolvedValue =
      explicitValue !== undefined ? explicitValue : defaultValue ?? null;
  }

  const v = autocompleteVariants({
    size,
    layout,
    error: resolvedError,
    fullWidth,
    disabled: effectiveDisabled,
  });

  const handleSelectionChange = (key: React.Key | null) => {
    const next = key == null ? null : String(key);
    if (isFormMode && bridge) {
      bridge.setValue?.(name, next);
      void registration?.onChange?.({
        target: { name, value: next ?? '' },
        type: 'change',
      });
    }
    onValueChange?.(next);
  };

  const handleBlur = () => {
    if (!isFormMode || !bridge) return;
    const current = (bridge.getValue(name) as string | null | undefined) ?? '';
    registration?.onBlur?.({
      target: { name, value: current },
      type: 'blur',
    });
  };

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      {label && (
        <AriaLabel
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
        </AriaLabel>
      )}

      <ComboBox
        name={name}
        selectedKey={resolvedValue}
        onSelectionChange={handleSelectionChange}
        onBlur={handleBlur}
        isDisabled={effectiveDisabled}
        isReadOnly={effectiveReadOnly}
        isRequired={required}
        isInvalid={Boolean(resolvedError)}
        allowsCustomValue={false}
        menuTrigger="input"
        items={filteredItems}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={resolvedHelperText ? helperId : undefined}
      >
        <div className={cn(v.inputWrapper(), slotProps?.inputWrapper?.className)}>
          <Input
            placeholder={placeholder}
            className={cn(v.input(), slotProps?.input?.className)}
          />
          {resolvedValue && !effectiveDisabled && !effectiveReadOnly && (
            <AriaButton
              slot={null as never}
              onPress={() => handleSelectionChange(null)}
              aria-label="Clear selection"
              className={cn(v.clearButton(), slotProps?.clearButton?.className)}
            >
              ×
            </AriaButton>
          )}
          <AriaButton
            className={cn(v.trigger(), slotProps?.trigger?.className)}
            aria-label="Open"
          >
            ▾
          </AriaButton>
        </div>

        <Popover className={cn(v.popover(), slotProps?.popover?.className)}>
          <ListBox<AutocompleteOption>
            className={cn(v.listBox(), slotProps?.listBox?.className)}
            renderEmptyState={() => (
              <div
                className={cn(v.emptyState(), slotProps?.emptyState?.className)}
              >
                {emptyMessage}
              </div>
            )}
          >
            {(opt) => (
              <ListBoxItem
                id={opt.value}
                textValue={typeof opt.label === 'string' ? opt.label : opt.value}
                isDisabled={opt.disabled}
                className={cn(v.listItem(), slotProps?.listItem?.className)}
              >
                {opt.label}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>

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
