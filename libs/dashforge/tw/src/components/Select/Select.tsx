import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { useStandaloneFieldWarning } from '../../hooks/useStandaloneFieldWarning.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { selectVariants } from './select.variants.js';
import type {
  SelectChangeHandler,
  SelectMultiChangeHandler,
  SelectOption,
  SelectProps,
  SelectValue,
} from './select.types.js';

/** Chevron glyph on the trigger. Inline SVG — no icon-library dep. */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Checkmark on the selected option row. */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `×` glyph on a chip. */
function ChipRemoveIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Convert any label ReactNode to a plain string for typeahead matching. */
function labelToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  // For ReactElements (including <Trans>) we can't resolve statically — fall
  // back to the empty string. Typeahead won't match into i18n components,
  // which is an acceptable limitation for the common enum case (labels are
  // usually plain strings there).
  return '';
}

/**
 * Find the next enabled option index in `direction`, wrapping at the
 * boundaries. Returns `-1` if there is no enabled option at all.
 */
function nextEnabledIndex<V extends SelectValue>(
  options: readonly SelectOption<V>[],
  from: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) return -1;
  const N = options.length;
  for (let step = 0; step < N; step++) {
    const idx = (from + direction * (step + 1) + N * 10) % N;
    if (!options[idx]?.disabled) return idx;
  }
  return -1;
}

/**
 * `<Select>` — token-driven enum picker.
 *
 * Deliberately narrower than `<Autocomplete>` — no search input, no
 * async loading, no freeSolo. Optimised for the 3–10 static option
 * case (Blueprint Inspector, admin form enums, config panels). Reuses
 * `@radix-ui/react-popover` for positioning and outside-click / Escape
 * dismissal, but overrides the ARIA roles for the combobox pattern.
 *
 * Bridge behaviour mirrors `<TextField>` / `<Autocomplete>`:
 *   - Inside a `<DashFormProvider>` — registers with RHF, reads value
 *     from `useDashFieldMeta`, writes via `bridge.setValue`.
 *   - Outside — behaves as a controlled OR uncontrolled input via
 *     `value` / `defaultValue` / `onChange`.
 *
 * `V` inference — TypeScript narrows the union from the `options`
 * array so `onChange` gets the precise literal type.
 */
function SelectInner<V extends SelectValue = string>(
  props: SelectProps<V>,
  ref: React.Ref<HTMLButtonElement>,
): ReactElement | null {
  const themeDefaults = useComponentDefaults('Select');
  const merged: SelectProps<V> = { ...themeDefaults?.defaults, ...props } as SelectProps<V>;
  const themeSlotProps = themeDefaults?.slotProps;

  const {
    name,
    rules,
    label,
    helperText,
    error,
    required,
    disabled,
    fullWidth,
    layout,
    size,
    visibleWhen,
    access,
    options,
    placeholder = 'Select…',
    emptyState = 'No options',
    value: userValue,
    defaultValue,
    onChange,
    onBlur,
    multiple = false,
    sx,
    slotProps,
    testId,
  } = merged;

  // ───── Hooks (unconditional, above the early returns) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const controlId = useId();
  const listboxId = `${controlId}-listbox`;
  const helperId = `${controlId}-help`;
  const isFormMode = Boolean(bridge?.register);

  useStandaloneFieldWarning('Select', name, isFormMode, userValue, onChange);

  // StrictMode-safe unregister
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

  // ───── Uncontrolled state (only used outside bridge + when no `value`) ─────
  const [internalValue, setInternalValue] = useState<V | V[] | null>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return multiple ? ([] as V[]) : null;
  });

  // ───── Popover open state + focus tracking ─────
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const typeAheadBufferRef = useRef<string>('');
  const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    return () => {
      if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
    };
  }, []);

  // ───── Derived (visibility / RBAC early returns come AFTER hooks) ─────
  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly;

  // Value resolution — bridge wins when in form mode, then user prop,
  // then internal state.
  let resolvedValue: V | V[] | null;
  let registration: FieldRegistration | null = null;
  let resolvedError = error;
  let resolvedHelperText: ReactNode = helperText;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const bridgeValue = (bridge.getValue(name) ?? fieldMeta?.value) as
      | V
      | V[]
      | null
      | undefined;
    resolvedValue =
      userValue !== undefined
        ? userValue
        : bridgeValue !== undefined && bridgeValue !== null
          ? bridgeValue
          : multiple
            ? ([] as V[])
            : null;
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
  } else {
    resolvedValue = userValue !== undefined ? userValue : internalValue;
  }

  // Selection helpers
  const isSelected = useCallback(
    (opt: SelectOption<V>): boolean => {
      if (multiple) {
        const arr = Array.isArray(resolvedValue) ? resolvedValue : [];
        return arr.includes(opt.value);
      }
      return resolvedValue === opt.value;
    },
    [multiple, resolvedValue],
  );

  const selectedOptions: SelectOption<V>[] = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(resolvedValue) ? resolvedValue : [];
      return options.filter((o) => arr.includes(o.value));
    }
    const single = options.find((o) => o.value === resolvedValue);
    return single != null ? [single] : [];
  }, [multiple, options, resolvedValue]);

  // Commit path — bridge write + user onChange + internal state fallback.
  const commitValue = useCallback(
    (next: V | V[] | null, changedOption: SelectOption<V>) => {
      if (isFormMode && bridge) {
        bridge.setValue?.(name, next);
        if (registration?.onChange) {
          void registration.onChange({
            target: { name, value: next },
            type: 'change',
          });
        }
      } else if (userValue === undefined) {
        setInternalValue(next);
      }
      if (onChange) {
        if (multiple) {
          const arr = Array.isArray(next) ? next : [];
          const opts = options.filter((o) => arr.includes(o.value));
          (onChange as SelectMultiChangeHandler<V>)(arr, opts);
        } else {
          (onChange as SelectChangeHandler<V>)(next as V, changedOption);
        }
      }
    },
    [bridge, isFormMode, multiple, name, onChange, options, registration, userValue],
  );

  const handleSelect = useCallback(
    (opt: SelectOption<V>) => {
      if (opt.disabled) return;
      if (multiple) {
        const arr = Array.isArray(resolvedValue) ? resolvedValue.slice() : [];
        const at = arr.indexOf(opt.value);
        if (at >= 0) arr.splice(at, 1);
        else arr.push(opt.value);
        commitValue(arr as V[], opt);
        // Multi keeps the popover open for rapid selection.
      } else {
        commitValue(opt.value, opt);
        setIsOpen(false);
        // Return focus to trigger after selection.
        queueMicrotask(() => triggerRef.current?.focus({ preventScroll: true }));
      }
    },
    [commitValue, multiple, resolvedValue],
  );

  const handleRemoveChip = useCallback(
    (opt: SelectOption<V>, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!multiple) return;
      const arr = Array.isArray(resolvedValue) ? resolvedValue.slice() : [];
      const at = arr.indexOf(opt.value);
      if (at >= 0) arr.splice(at, 1);
      commitValue(arr as V[], opt);
    },
    [commitValue, multiple, resolvedValue],
  );

  // Keyboard nav — ArrowUp/Down, Home/End, Enter/Space, Escape, first-
  // letter type-ahead. `Tab` is intentionally not intercepted so the
  // trigger keeps its native focus flow.
  const handleTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (effectiveDisabled) return;
      const openIfClosed = () => {
        if (!isOpen) setIsOpen(true);
      };

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          openIfClosed();
          setFocusedIndex((prev) => nextEnabledIndex(options, prev, 1));
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          openIfClosed();
          setFocusedIndex((prev) => nextEnabledIndex(options, prev === -1 ? 0 : prev, -1));
          return;
        }
        case 'Home': {
          event.preventDefault();
          openIfClosed();
          setFocusedIndex(nextEnabledIndex(options, -1, 1));
          return;
        }
        case 'End': {
          event.preventDefault();
          openIfClosed();
          setFocusedIndex(nextEnabledIndex(options, options.length, -1));
          return;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            return;
          }
          const opt = options[focusedIndex];
          if (opt) handleSelect(opt);
          return;
        }
        case 'Escape': {
          if (isOpen) {
            event.preventDefault();
            setIsOpen(false);
          }
          return;
        }
        default: {
          // Type-ahead first-letter jump. Only strings; ignores modifier
          // combos (Ctrl/Meta) so browser shortcuts aren't hijacked.
          if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
          const ch = event.key.toLowerCase();
          typeAheadBufferRef.current += ch;
          if (typeAheadTimerRef.current) clearTimeout(typeAheadTimerRef.current);
          typeAheadTimerRef.current = setTimeout(() => {
            typeAheadBufferRef.current = '';
          }, 500);

          const buffer = typeAheadBufferRef.current;
          const startFrom = focusedIndex === -1 ? 0 : focusedIndex;
          const N = options.length;
          for (let step = 0; step < N; step++) {
            const idx = (startFrom + step) % N;
            const opt = options[idx];
            if (!opt || opt.disabled) continue;
            const text = labelToText(opt.label).toLowerCase();
            if (text.startsWith(buffer)) {
              openIfClosed();
              setFocusedIndex(idx);
              return;
            }
          }
        }
      }
    },
    [effectiveDisabled, focusedIndex, handleSelect, isOpen, options],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (effectiveDisabled) return;
      setIsOpen(next);
      if (next) {
        // Seed focus to the first selected item (or the first enabled).
        const firstSelected = options.findIndex((o) => isSelected(o));
        setFocusedIndex(
          firstSelected >= 0 ? firstSelected : nextEnabledIndex(options, -1, 1),
        );
      } else {
        // Blur bookkeeping on close.
        if (onBlur) onBlur();
        if (isFormMode && registration?.onBlur) {
          void registration.onBlur({
            target: { name, value: resolvedValue },
            type: 'blur',
          });
        }
      }
    },
    [effectiveDisabled, isFormMode, isSelected, name, onBlur, options, registration, resolvedValue],
  );

  // ───── Early returns after all hooks are declared ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  // ───── Class computation ─────
  const v = selectVariants({
    size,
    layout,
    fullWidth,
    error: Boolean(resolvedError),
    disabled: effectiveDisabled,
  });

  const rootClasses = cn(v.root(), themeSlotProps?.root?.className, slotProps?.root?.className);
  const labelClasses = cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className);
  const requiredMarkClasses = cn(v.requiredMark(), themeSlotProps?.requiredMark?.className, slotProps?.requiredMark?.className);
  const triggerClasses = cn(v.trigger(), themeSlotProps?.trigger?.className, slotProps?.trigger?.className, sx);
  const triggerTextClasses = cn(v.triggerText(), themeSlotProps?.triggerText?.className, slotProps?.triggerText?.className);
  const triggerPlaceholderClasses = cn(v.triggerPlaceholder(), themeSlotProps?.triggerPlaceholder?.className, slotProps?.triggerPlaceholder?.className);
  const chevronClasses = cn(v.chevron(), themeSlotProps?.chevron?.className, slotProps?.chevron?.className);
  const popoverClasses = cn(v.popover(), themeSlotProps?.popover?.className, slotProps?.popover?.className);
  const listBoxClasses = cn(v.listBox(), themeSlotProps?.listBox?.className, slotProps?.listBox?.className);
  const emptyStateClasses = cn(v.emptyState(), themeSlotProps?.emptyState?.className, slotProps?.emptyState?.className);
  const helperTextClasses = cn(v.helperText(), themeSlotProps?.helperText?.className, slotProps?.helperText?.className);
  const errorTextClasses = cn(v.errorText(), themeSlotProps?.errorText?.className, slotProps?.errorText?.className);
  const chipsListClasses = cn(v.chipsList(), themeSlotProps?.chipsList?.className, slotProps?.chipsList?.className);
  const chipClasses = cn(v.chip(), themeSlotProps?.chip?.className, slotProps?.chip?.className);
  const chipRemoveClasses = cn(v.chipRemove(), themeSlotProps?.chipRemove?.className, slotProps?.chipRemove?.className);

  // Trigger content — chips (multi) OR selected label OR placeholder
  let triggerContent: ReactNode;
  if (multiple) {
    if (selectedOptions.length === 0) {
      triggerContent = <span className={triggerPlaceholderClasses}>{placeholder}</span>;
    } else {
      triggerContent = (
        <span className={chipsListClasses}>
          {selectedOptions.map((opt) => (
            <span key={String(opt.value)} className={chipClasses}>
              <span className="truncate">{opt.label}</span>
              {!effectiveDisabled && (
                <button
                  type="button"
                  aria-label={`Remove ${labelToText(opt.label) || String(opt.value)}`}
                  className={chipRemoveClasses}
                  onClick={(e) => handleRemoveChip(opt, e)}
                >
                  <ChipRemoveIcon />
                </button>
              )}
            </span>
          ))}
        </span>
      );
    }
  } else {
    const single = selectedOptions[0];
    triggerContent = single ? (
      <span className={triggerTextClasses}>{single.label}</span>
    ) : (
      <span className={triggerPlaceholderClasses}>{placeholder}</span>
    );
  }

  const hasError = Boolean(resolvedError);

  return (
    <div className={rootClasses} data-testid={testId}>
      {label != null && (
        <label htmlFor={controlId} className={labelClasses}>
          {label}
          {required && <span className={requiredMarkClasses}>*</span>}
        </label>
      )}

      <RadixPopover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <RadixPopover.Trigger asChild>
          <button
            ref={(node) => {
              triggerRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
            }}
            id={controlId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-required={required || undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={resolvedHelperText != null ? helperId : undefined}
            aria-disabled={effectiveDisabled || undefined}
            disabled={effectiveDisabled}
            name={name}
            className={triggerClasses}
            onKeyDown={handleTriggerKeyDown}
          >
            {triggerContent}
            <ChevronDownIcon
              className={cn(chevronClasses)}
              // data-open drives the rotate variant in the recipe.
            />
          </button>
        </RadixPopover.Trigger>

        <RadixPopover.Portal>
          <RadixPopover.Content
            className={popoverClasses}
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              // Keep DOM focus on the trigger; we drive the listbox with
              // roving activedescendant via `aria-activedescendant`.
              e.preventDefault();
            }}
            onCloseAutoFocus={(e) => {
              // Radix would restore focus to the trigger by default; we
              // already handle that manually in handleSelect and
              // handleOpenChange to avoid a flash of a second focus event.
              e.preventDefault();
            }}
            style={{
              // Expose the trigger width to the popover so it can
              // `min-w-[var(--trigger-width)]` in the recipe.
              // Set as a CSS custom prop on the content wrapper.
              // React sets style keys camelCase; custom props stay as-is.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--trigger-width' as any]: `${triggerRef.current?.offsetWidth ?? 0}px`,
            }}
          >
            {options.length === 0 ? (
              <div className={emptyStateClasses}>{emptyState}</div>
            ) : (
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                className={listBoxClasses}
              >
                {options.map((opt, idx) => {
                  const selected = isSelected(opt);
                  const focused = idx === focusedIndex;
                  const itemId = `${controlId}-opt-${idx}`;
                  return (
                    <li
                      key={String(opt.value)}
                      id={itemId}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={opt.disabled || undefined}
                      data-focused={focused ? 'true' : 'false'}
                      data-selected={selected ? 'true' : 'false'}
                      data-disabled={opt.disabled ? 'true' : 'false'}
                      className={cn(v.listItem(), themeSlotProps?.listItem?.className, slotProps?.listItem?.className)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect(opt);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          v.listItemIndicator(),
                          themeSlotProps?.listItemIndicator?.className, slotProps?.listItemIndicator?.className,
                        )}
                      />
                      <span className="truncate">{opt.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>

      {hasError && resolvedHelperText != null ? (
        <div id={helperId} className={errorTextClasses}>
          {resolvedHelperText}
        </div>
      ) : resolvedHelperText != null ? (
        <div id={helperId} className={helperTextClasses}>
          {resolvedHelperText}
        </div>
      ) : null}
    </div>
  );
}

/**
 * `<Select>` — generic-friendly forwardRef wrapper.
 *
 * The type dance below preserves the `V` type parameter through
 * `forwardRef`, which by default would strip it. Consumers can either
 * let TypeScript infer `V` from `options` or pass it explicitly:
 *   `<Select<'a' | 'b'> options={…} onChange={…} />`.
 */
export const Select = forwardRef(SelectInner) as <V extends SelectValue = string>(
  props: SelectProps<V> & { ref?: React.Ref<HTMLButtonElement> },
) => ReactElement | null;

// `forwardRef` erases the display name; re-attach it for React DevTools.
(Select as unknown as { displayName?: string }).displayName = 'Select';
