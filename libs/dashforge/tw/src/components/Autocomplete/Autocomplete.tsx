import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { autocompleteVariants } from './autocomplete.variants.js';
import type {
  AutocompleteOption,
  AutocompleteProps,
  AutocompleteValue,
} from './autocomplete.types.js';

/**
 * Inline SVG icons used by the Autocomplete chrome (chip remove, clear,
 * dropdown caret). Stroke uses `currentColor` so the parent's `text-*`
 * propagates — same pattern as Checkbox's CheckIcon.
 *
 * Why inline SVG (not lucide / heroicons / unicode glyphs):
 *  - Zero icon-library dependency: keeps `@dashforge/tw` self-contained.
 *  - Crisp at every size (the unicode `×` / `▾` glyphs we shipped pre-
 *    0.2.2 rendered as chunky font characters that looked unpolished
 *    next to the rest of the design system).
 *  - SVG scales with parent font-size cleanly via `width="1em" height="1em"`.
 *
 * @internal
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      className={className}
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      className={className}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Coerce a raw value (from bridge / props) into a canonical shape:
 *
 *  - Multi-select: returns `string[]` (empty for null/undefined)
 *  - Single-select: returns `string | null`
 */
function coerceValue(raw: unknown, isMulti: boolean): AutocompleteValue {
  if (isMulti) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw.map(String);
    return [String(raw)];
  }
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw[0] != null ? String(raw[0]) : null;
  return String(raw);
}

/** Derive a Set of selected keys from a canonical value. */
function getSelectedKeys(value: AutocompleteValue): Set<string> {
  if (value == null) return new Set();
  if (Array.isArray(value)) return new Set(value);
  return new Set([value]);
}

// Default accessor implementations. Assume `AutocompleteOption` shape —
// safe because the generic defaults to that shape, and consumers using
// a custom `TOption` must pass their own `getOptionValue` / `Label`.
// We type the input as `unknown` here to keep the defaults assignable
// to `(o: TOption) => …` for arbitrary `TOption` without forcing a cast
// at every call site.
const defaultGetOptionValue = (option: unknown): string =>
  (option as AutocompleteOption).value;
const defaultGetOptionLabel = (option: unknown) =>
  (option as AutocompleteOption).label;
const defaultGetOptionDisabled = (option: unknown): boolean =>
  Boolean((option as AutocompleteOption).disabled);

/**
 * Dashforge TW Autocomplete — bridge-integrated single-select combobox.
 *
 * **Implementation note (F5-A, rev. 2)**
 *
 * The first revision wrapped `react-aria-components`' `<ComboBox>` to get
 * AAA-grade a11y for free. In practice React Aria's internal state
 * machine fought every controlled-state pattern we tried (the input text
 * would not clear when `selectedKey` went to `null`, even with a forced
 * remount via `key` bumping). To get deterministic behaviour we own all
 * of the state ourselves:
 *
 *   - `inputValue`       — the visible text in the `<input>`
 *   - `isOpen`           — popover visibility
 *   - `highlightedIndex` — keyboard navigation cursor
 *
 * A11y is still solid:
 *   - `role="combobox"` + `aria-autocomplete="list"` on the input
 *   - `aria-expanded`, `aria-controls`, `aria-activedescendant`
 *   - `role="listbox"` / `role="option"` with `aria-selected`
 *   - Full keyboard nav (↑/↓ navigate, Enter selects, Escape closes,
 *     Home/End jump, Tab closes, click-outside closes)
 *   - Required field gets `aria-required="true"`
 *
 * F5-A scope: single-select, static options, contains-substring filter
 * (case-insensitive). Multi-select, free-solo text, generic option
 * shapes, and async runtime options (`optionsFromFieldData`) are
 * deferred to F5-A-bis.
 */
export function Autocomplete<TOption = AutocompleteOption>(
  props: AutocompleteProps<TOption>
) {
  const themeDefaults = useComponentDefaults('Autocomplete');
  const merged: AutocompleteProps<TOption> = {
    ...themeDefaults?.defaults,
    ...props,
  };
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
    getOptionValue = defaultGetOptionValue as (option: TOption) => string,
    getOptionLabel = defaultGetOptionLabel as (option: TOption) => ReactNode,
    getOptionDisabled = defaultGetOptionDisabled as (option: TOption) => boolean,
    getOptionKey,
    multiple,
    freeSolo,
    loadOptions,
    loadDebounceMs = 250,
    loadingMessage = 'Loading…',
  } = merged;

  const isMulti = Boolean(multiple);

  // Default the React-key accessor to `getOptionValue` (typical case:
  // value is unique). Consumers override only when distinct option
  // records can share the same persisted value.
  const resolveOptionKey = getOptionKey ?? getOptionValue;

  /**
   * Resolve the string label of an option, if it is a string. Returns
   * `undefined` for non-string labels (e.g., `<span>`) so callers can
   * fall back to the persisted value for `textValue` / input text.
   */
  const labelAsString = (option: TOption): string | undefined => {
    const lbl = getOptionLabel(option);
    return typeof lbl === 'string' ? lbl : undefined;
  };

  // ───── Hooks (unconditional) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const baseId = useId();
  const labelId = `${baseId}-label`;
  const helperId = `${baseId}-help`;
  const listboxId = `${baseId}-listbox`;
  const optionIdPrefix = `${baseId}-opt-`;

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

  // ───── Local UI state (we own EVERYTHING) ─────

  /**
   * The visible text in the `<input>`. Seeded from the initial value
   * (single-select only — in multi mode the chips show the selection
   * separately and the input always starts empty).
   */
  const [inputValue, setInputValue] = useState<string>(() => {
    if (isMulti) return '';
    let initialKey: string | null = null;
    if (explicitValue !== undefined) {
      initialKey = typeof explicitValue === 'string' ? explicitValue : null;
    } else if (defaultValue !== undefined) {
      initialKey = typeof defaultValue === 'string' ? defaultValue : null;
    } else if (bridge?.register) {
      const bv = bridge.getValue(name);
      initialKey = bv == null ? null : String(bv);
    }
    if (initialKey == null) return '';
    const found = options.find((opt) => getOptionValue(opt) === initialKey);
    // Free-solo: if the initial key doesn't match any option, fall back
    // to the key string itself (it IS the user-visible text).
    return found
      ? labelAsString(found) ?? (freeSolo ? initialKey : '')
      : freeSolo
      ? initialKey
      : '';
  });

  /** Uncontrolled-mode internal selection (form mode uses the bridge). */
  const [uncontrolledValue, setUncontrolledValue] = useState<AutocompleteValue>(
    () => {
      if (explicitValue !== undefined) return coerceValue(explicitValue, isMulti);
      if (defaultValue !== undefined) return coerceValue(defaultValue, isMulti);
      return isMulti ? [] : null;
    }
  );

  /**
   * Whether the user has interacted with the field in uncontrolled mode.
   * Before first interaction, `defaultValue` wins (so a rerender with a
   * new `defaultValue` is reflected in `resolvedValue` / `inputValue`).
   * After first interaction, the user's choice (stored in
   * `uncontrolledValue` / `inputValue`) wins.
   */
  const [hasInteracted, setHasInteracted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Async-options state (only used when `loadOptions` is provided).
  //   - `asyncOptions` is `null` before the first fetch resolves; after,
  //     it holds whatever the loader returned. It always takes
  //     precedence over the static `options` prop once non-null.
  //   - `isLoading` true between a debounce-firing fetch and its
  //     resolution.
  const [asyncOptions, setAsyncOptions] = useState<TOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);
  /**
   * Monotonic counter for the in-flight `loadOptions` fetch so a
   * later-typed query can't get overtaken by a slower earlier fetch.
   * Each fire bumps the counter; only the response whose generation
   * matches the current counter is allowed to commit state.
   */
  const fetchGenRef = useRef(0);

  // ───── Derived (no hooks below this point can be skipped) ─────
  //
  // Everything in this block runs every render so the hooks below
  // (useMemo / useCallback / useEffect) stay above any early-return
  // guards — see rules of hooks.

  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const effectiveReadOnly = accessState.readonly;
  const isFormMode = Boolean(bridge?.register);

  let resolvedError = error;
  let resolvedHelperText: typeof helperText = helperText;
  let registration: FieldRegistration | null = null;
  let resolvedValue: AutocompleteValue;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    if (explicitValue !== undefined) {
      resolvedValue = coerceValue(explicitValue, isMulti);
    } else {
      resolvedValue = coerceValue(bridge.getValue(name), isMulti);
    }
  } else if (explicitValue !== undefined) {
    resolvedValue = coerceValue(explicitValue, isMulti);
  } else if (!hasInteracted && defaultValue !== undefined) {
    resolvedValue = coerceValue(defaultValue, isMulti);
  } else {
    resolvedValue = uncontrolledValue;
  }

  // Set of currently-selected keys. Always exists (empty Set when no
  // selection) — internal lookups can call `.has(key)` without null
  // checks.
  const selectedKeys = getSelectedKeys(resolvedValue);
  // Convenience: for the clear button visibility + the "should keep
  // popover open after pick" decision.
  const hasAnySelection = selectedKeys.size > 0;
  // Single-select compatibility: the one selected key (null in multi
  // or when nothing is picked).
  const singleSelectedKey =
    !isMulti && typeof resolvedValue === 'string' ? resolvedValue : null;

  // Visible input value:
  //   - Multi-select: always the locally-managed `inputValue` (selection
  //     is rendered as chips, not echoed in the input).
  //   - Single-select, before first interaction: derive from `resolvedValue`
  //     so a rerender with a new `defaultValue` is reflected immediately.
  //   - Single-select, after first interaction: trust `inputValue` (which
  //     `commitSelection` + `handleInputChange` keep in sync).
  let displayInputValue: string = inputValue;
  if (!isMulti && !hasInteracted) {
    if (singleSelectedKey == null) {
      displayInputValue = '';
    } else {
      const found = options.find(
        (opt) => getOptionValue(opt) === singleSelectedKey
      );
      const found_label = found ? labelAsString(found) : undefined;
      if (found_label !== undefined) {
        displayInputValue = found_label;
      } else if (freeSolo) {
        // No matching option ⇒ this is a free-solo value; the key
        // itself is the displayable text.
        displayInputValue = singleSelectedKey;
      }
    }
  }

  // ───── Effective options source ─────
  //
  // Precedence: live async results > static `options` prop.
  //
  // While `loadOptions` is configured, the SERVER is responsible for
  // filtering, so the client-side `contains` filter below is bypassed
  // (using it would double-filter and hide rows the server intentionally
  // returned).
  const effectiveOptions: TOption[] =
    loadOptions && asyncOptions !== null ? asyncOptions : options;
  const useServerFilter = Boolean(loadOptions);

  // ───── Filtering ─────
  const filteredOptions = useMemo<TOption[]>(() => {
    // Async mode: trust the server's filter; never apply a client-side
    // one on top.
    if (useServerFilter) return effectiveOptions;

    // Single-select: when the field is closed and the input shows the
    // exact selected label, show the FULL list on the next open (rather
    // than the single-match filter the label would produce).
    //
    // Multi-select: the input value is purely the filter query (the
    // selection lives in the chips), so this short-circuit doesn't apply.
    if (!isMulti) {
      const selectedOpt = effectiveOptions.find(
        (o) => getOptionValue(o) === singleSelectedKey
      );
      const selectedLabel = selectedOpt ? labelAsString(selectedOpt) : undefined;
      const isShowingSelected =
        selectedLabel !== undefined && selectedLabel === displayInputValue;
      if (!displayInputValue || isShowingSelected) return effectiveOptions;
    } else if (!displayInputValue) {
      return effectiveOptions;
    }
    const query = displayInputValue.toLowerCase();
    return effectiveOptions.filter((opt) => {
      const text = labelAsString(opt) ?? getOptionValue(opt);
      return text.toLowerCase().includes(query);
    });
    // Accessors omitted by design — see commitSelection useCallback comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveOptions,
    displayInputValue,
    singleSelectedKey,
    isMulti,
    useServerFilter,
  ]);

  // ───── Helpers ─────

  /**
   * Commit a value change to the bridge / state.
   *
   * **Single-select**: `next` is the new selected key, or `null` to
   *   clear. Replaces the previous selection.
   *
   * **Multi-select**:
   *   - `next === null` → clear all (emit `[]`).
   *   - `next === <key>` → toggle that key in the selection set.
   *
   * Sync to `inputValue`:
   *   - Single + non-null key → write the option's label into the input.
   *   - Single + null → empty the input.
   *   - Multi → always clear the input (the filter query is irrelevant
   *     once a chip has been added).
   */
  const commitSelection = useCallback(
    (next: string | null) => {
      // 1) Mark dirty so `defaultValue` no longer takes precedence.
      setHasInteracted(true);

      // 2) Compute the new persisted value.
      let nextValue: AutocompleteValue;
      if (isMulti) {
        if (next == null) {
          nextValue = [];
        } else {
          const set = new Set(selectedKeys);
          if (set.has(next)) set.delete(next);
          else set.add(next);
          nextValue = Array.from(set);
        }
        // Multi mode: clear the filter input after every toggle.
        setInputValue('');
      } else {
        nextValue = next;
        // Single mode: sync the input label.
        if (next == null) {
          setInputValue('');
        } else {
          // Look up the label in the EFFECTIVE option pool (static
          // `options` + async `asyncOptions` when `loadOptions` is
          // configured). Looking only at the static `options` here
          // means async-loaded picks never update the input — the
          // user sees their search query stick instead of the
          // selected label after click. Same lookup logic mirrored in
          // `displayInputValue` so the two paths can't drift.
          const pool = loadOptions && asyncOptions !== null
            ? asyncOptions
            : options;
          const found = pool.find((opt) => getOptionValue(opt) === next);
          const found_label = found ? labelAsString(found) : undefined;
          if (found_label !== undefined) {
            setInputValue(found_label);
          }
        }
      }

      // 3) Persist.
      if (isFormMode && bridge) {
        bridge.setValue?.(name, nextValue);
        void registration?.onChange?.({
          target: {
            name,
            // RHF + native form: array values are passed through as-is
            // (RHF accepts any shape); the empty string fallback for
            // null preserves the single-select contract.
            value: nextValue == null ? '' : (nextValue as unknown as string),
          },
          type: 'change',
        });
      } else if (explicitValue === undefined) {
        setUncontrolledValue(nextValue);
      }

      // 4) Notify consumer.
      onValueChange?.(nextValue);
    },
    // Accessors omitted by design — see filteredOptions useMemo comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options,
      asyncOptions,
      loadOptions,
      isFormMode,
      bridge,
      name,
      registration,
      explicitValue,
      onValueChange,
      isMulti,
      selectedKeys,
    ]
  );

  const openPopover = useCallback(() => {
    if (effectiveDisabled || effectiveReadOnly) return;
    setIsOpen(true);
    // Highlight the (single-)selected item on open, falling back to the
    // first item. In multi mode, always start at the first visible item.
    const selectedIdx =
      !isMulti && singleSelectedKey
        ? filteredOptions.findIndex(
            (o) => getOptionValue(o) === singleSelectedKey
          )
        : -1;
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    // Accessors omitted by design — see filteredOptions useMemo comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveDisabled,
    effectiveReadOnly,
    filteredOptions,
    singleSelectedKey,
    isMulti,
  ]);

  const closePopover = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // ───── Click-outside ─────
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      closePopover();
      // Multi mode: just clear the filter query (chips remain).
      // Single + free-solo: commit the typed text as the value (the
      //   user's text IS the truth) — leave input alone afterwards.
      // Single (no free-solo): revert input to the selected option's
      //   label or empty.
      if (isMulti) {
        setInputValue('');
      } else if (freeSolo && inputValue.trim() !== '') {
        const typed = inputValue.trim();
        const matched = options.find((o) => labelAsString(o) === typed);
        const nextKey = matched ? getOptionValue(matched) : typed;
        if (singleSelectedKey !== nextKey) {
          commitSelection(nextKey);
        }
      } else if (singleSelectedKey) {
        const selected = options.find(
          (o) => getOptionValue(o) === singleSelectedKey
        );
        const selected_label = selected ? labelAsString(selected) : undefined;
        if (selected_label !== undefined) {
          setInputValue(selected_label);
        }
      } else {
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
    // Accessors omitted by design — see filteredOptions useMemo comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    closePopover,
    options,
    singleSelectedKey,
    isMulti,
    freeSolo,
    inputValue,
    commitSelection,
  ]);

  // ───── Async option loading (debounced) ─────
  useEffect(() => {
    if (!loadOptions) return;
    const myGen = ++fetchGenRef.current;
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Bail if the user re-typed during the debounce window — a newer
      // generation has already been kicked off.
      if (myGen !== fetchGenRef.current) return;
      Promise.resolve(loadOptions(inputValue))
        .then((next) => {
          if (myGen === fetchGenRef.current) {
            setAsyncOptions(next);
            setIsLoading(false);
          }
        })
        .catch(() => {
          // Surface failures as an empty list; consumer's preferred
          // error UI can be threaded via `emptyMessage` once they
          // detect their own loader fault upstream.
          if (myGen === fetchGenRef.current) {
            setAsyncOptions([]);
            setIsLoading(false);
          }
        });
    }, loadDebounceMs);
    return () => clearTimeout(timer);
    // `loadOptions` is intentionally not in the deps — consumers
    // typically pass an inline arrow which would otherwise trigger a
    // refetch on every render. Treat it as stable (mirror of MUI's
    // `loadOptions` contract).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, loadDebounceMs]);

  // ───── Handlers ─────

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setHasInteracted(true);
    setInputValue(next);
    if (!isOpen) setIsOpen(true);
    // Reset highlight to first visible option on every keystroke; the
    // filtered list will recompute on next render.
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (effectiveDisabled || effectiveReadOnly) return;

    // Multi-select: Backspace at the start of an empty input removes
    // the last selected chip. (Matches the de-facto pattern used by
    // chip-input UIs across the React ecosystem.)
    if (
      isMulti &&
      event.key === 'Backspace' &&
      inputValue === '' &&
      selectedKeys.size > 0
    ) {
      event.preventDefault();
      // Set guarantees ≥ 1 entry here (size > 0 above), but TS can't
      // prove it — fall back to the loop variant to avoid the non-null
      // assertion lint rule.
      const arr = Array.from(selectedKeys);
      const last = arr[arr.length - 1];
      if (last !== undefined) {
        commitSelection(last); // toggle removes
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openPopover();
        return;
      }
      setHighlightedIndex((idx) => {
        const max = filteredOptions.length - 1;
        if (max < 0) return -1;
        return idx >= max ? 0 : idx + 1;
      });
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openPopover();
        return;
      }
      setHighlightedIndex((idx) => {
        const max = filteredOptions.length - 1;
        if (max < 0) return -1;
        return idx <= 0 ? max : idx - 1;
      });
      return;
    }
    if (event.key === 'Home' && isOpen) {
      event.preventDefault();
      setHighlightedIndex(filteredOptions.length ? 0 : -1);
      return;
    }
    if (event.key === 'End' && isOpen) {
      event.preventDefault();
      setHighlightedIndex(filteredOptions.length ? filteredOptions.length - 1 : -1);
      return;
    }
    if (event.key === 'Enter') {
      // Preferred path: highlighted option is committed.
      if (
        isOpen &&
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        event.preventDefault();
        const opt = filteredOptions[highlightedIndex];
        if (!getOptionDisabled(opt)) {
          commitSelection(getOptionValue(opt));
          if (!isMulti) {
            closePopover();
          } else {
            setHighlightedIndex(0);
          }
        }
        return;
      }
      // Free-solo path: commit the typed text as the value.
      if (freeSolo && inputValue.trim() !== '') {
        event.preventDefault();
        const typed = inputValue.trim();
        // Snap to an exact-label match if one exists, even when the
        // dropdown was filtered to zero rows — protects the contract
        // that "the value is always a known option when one matches."
        const matched = options.find(
          (o) => labelAsString(o) === typed
        );
        commitSelection(matched ? getOptionValue(matched) : typed);
        if (!isMulti) closePopover();
        else setHighlightedIndex(0);
      }
      return;
    }
    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        closePopover();
        // Multi: clear filter; selection stays in chips.
        // Single: revert input to the displayable form of the committed
        //   value — either the matched option's label, or (in free-solo)
        //   the raw string that was committed.
        if (isMulti) {
          setInputValue('');
        } else if (singleSelectedKey) {
          const selected = options.find(
            (o) => getOptionValue(o) === singleSelectedKey
          );
          const selected_label = selected ? labelAsString(selected) : undefined;
          setInputValue(selected_label ?? (freeSolo ? singleSelectedKey : ''));
        } else {
          setInputValue('');
        }
      }
      return;
    }
    if (event.key === 'Tab') {
      // Let focus leave naturally; just close.
      if (isOpen) closePopover();
      return;
    }
  };

  const handleBlur = () => {
    // Free-solo (single mode): commit the typed text on blur so the
    // user doesn't have to remember to press Enter. Multi + free-solo
    // is Enter-only (blur would commit accidental whitespace from
    // tab-out).
    if (freeSolo && !isMulti && inputValue.trim() !== '') {
      const typed = inputValue.trim();
      const matched = options.find((o) => labelAsString(o) === typed);
      const nextKey = matched ? getOptionValue(matched) : typed;
      // Only commit if this would actually change the value.
      if (singleSelectedKey !== nextKey) {
        commitSelection(nextKey);
      }
    }
    if (!isFormMode || !bridge) return;
    const raw = bridge.getValue(name);
    // Multi mode: bridge value is an array — passthrough.
    const current = raw == null ? '' : (raw as unknown as string);
    registration?.onBlur?.({
      target: { name, value: current },
      type: 'blur',
    });
  };

  const handleOptionClick = (opt: TOption) => {
    if (getOptionDisabled(opt)) return;
    commitSelection(getOptionValue(opt));
    // Multi-select: keep the popover open for chained picks.
    if (!isMulti) {
      closePopover();
    } else {
      setHighlightedIndex(0);
    }
    inputRef.current?.focus();
  };

  // Pattern: `onMouseDown` preventDefault keeps focus on the `<input>`
  // (without this, clicking the chevron blurs the input and we lose the
  // popover-on-focus open state). `onClick` does the actual work so
  // testing-library's `fireEvent.click(...)` also triggers it.
  const preventBlur = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleTriggerClick = () => {
    if (effectiveDisabled || effectiveReadOnly) return;
    if (isOpen) {
      closePopover();
    } else {
      openPopover();
    }
    inputRef.current?.focus();
  };

  const handleClearClick = () => {
    if (effectiveDisabled || effectiveReadOnly) return;
    commitSelection(null);
    inputRef.current?.focus();
  };

  // ───── Render-time guards (after all hooks) ─────

  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = autocompleteVariants({
    size,
    layout,
    error: resolvedError,
    fullWidth,
    disabled: effectiveDisabled,
  });

  const activeOptionId =
    isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
      ? `${optionIdPrefix}${getOptionValue(filteredOptions[highlightedIndex])}`
      : undefined;

  return (
    <div
      ref={rootRef}
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={`${baseId}-input`}
          className={cn(v.label(), slotProps?.label?.className)}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={cn(
                v.requiredMark(),
                slotProps?.requiredMark?.className
              )}
            >
              *
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          v.inputWrapper(),
          // Multi mode: let chips wrap and replace the fixed `h-*`
          // with `min-h-*` so the wrapper grows with selections.
          isMulti && 'flex-wrap min-h-[var(--ac-min-h,2.5rem)] !h-auto py-1',
          slotProps?.inputWrapper?.className
        )}
      >
        {isMulti && selectedKeys.size > 0 && (
          <div
            className={cn(
              v.chipsList(),
              slotProps?.chipsList?.className
            )}
          >
            {Array.from(selectedKeys).map((key) => {
              const opt = options.find((o) => getOptionValue(o) === key);
              const labelNode = opt ? getOptionLabel(opt) : key;
              const labelText = opt ? labelAsString(opt) ?? key : key;
              return (
                <span
                  key={key}
                  className={cn(v.chip(), slotProps?.chip?.className)}
                  data-chip-key={key}
                >
                  {labelNode}
                  {!effectiveDisabled && !effectiveReadOnly && (
                    <button
                      type="button"
                      onMouseDown={preventBlur}
                      onClick={() => {
                        commitSelection(key); // toggle removes
                        inputRef.current?.focus();
                      }}
                      aria-label={`Remove ${labelText}`}
                      tabIndex={-1}
                      className={cn(
                        v.chipRemove(),
                        slotProps?.chipRemove?.className
                      )}
                    >
                      <CloseIcon />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        <input
          ref={inputRef}
          id={`${baseId}-input`}
          name={name}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={resolvedHelperText ? helperId : undefined}
          aria-invalid={resolvedError ? true : undefined}
          aria-required={required ? true : undefined}
          placeholder={
            // In multi mode hide the placeholder once the user has at
            // least one chip — the chips already convey "something is
            // selected" and the placeholder would clutter the UI.
            isMulti && selectedKeys.size > 0 ? undefined : placeholder
          }
          value={displayInputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={openPopover}
          onBlur={handleBlur}
          disabled={effectiveDisabled}
          readOnly={effectiveReadOnly}
          autoComplete="off"
          // Multi mode: give the input some min-width so it stays
          // clickable even with many chips, and let it shrink/grow with
          // the available row space.
          className={cn(
            v.input(),
            isMulti && 'min-w-[6rem] flex-1 basis-24',
            slotProps?.input?.className
          )}
        />

        {hasAnySelection && !effectiveDisabled && !effectiveReadOnly && (
          <button
            type="button"
            onMouseDown={preventBlur}
            onClick={handleClearClick}
            aria-label="Clear selection"
            tabIndex={-1}
            className={cn(v.clearButton(), slotProps?.clearButton?.className)}
          >
            <CloseIcon />
          </button>
        )}

        <button
          type="button"
          onMouseDown={preventBlur}
          onClick={handleTriggerClick}
          aria-label="Open"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          tabIndex={-1}
          disabled={effectiveDisabled}
          className={cn(v.trigger(), slotProps?.trigger?.className)}
        >
          {/*
           * Chevron flips up when popover is open (CSS-only, driven by
           * the `aria-expanded` attribute selector on the parent
           * `<button>`). See autocomplete.variants.ts → `trigger` slot
           * for the `aria-expanded:rotate-180` rule.
           */}
          <ChevronDownIcon />
        </button>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            className={cn(
              v.popover(),
              'absolute left-0 right-0 top-full',
              v.listBox(),
              slotProps?.popover?.className,
              slotProps?.listBox?.className
            )}
          >
            {isLoading ? (
              <li
                className={cn(
                  v.emptyState(),
                  slotProps?.emptyState?.className
                )}
                aria-live="polite"
                aria-busy="true"
              >
                {loadingMessage}
              </li>
            ) : filteredOptions.length === 0 ? (
              <li
                className={cn(
                  v.emptyState(),
                  slotProps?.emptyState?.className
                )}
              >
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optValue = getOptionValue(opt);
                const optDisabled = getOptionDisabled(opt);
                const isHighlighted = idx === highlightedIndex;
                const isSelected = selectedKeys.has(optValue);
                return (
                  <li
                    key={resolveOptionKey(opt)}
                    id={`${optionIdPrefix}${optValue}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={optDisabled || undefined}
                    data-focused={isHighlighted || undefined}
                    data-selected={isSelected || undefined}
                    data-disabled={optDisabled || undefined}
                    onMouseDown={preventBlur}
                    onClick={() => handleOptionClick(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      v.listItem(),
                      slotProps?.listItem?.className
                    )}
                  >
                    {getOptionLabel(opt)}
                  </li>
                );
              })
            )}
          </ul>
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
