import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { AutocompleteVariants } from './autocomplete.variants.js';

/**
 * Subset of `<Autocomplete>` props theme-configurable via
 * `theme.components.Autocomplete.defaults` (Option C).
 */
export type AutocompleteVariantProps = Pick<
  AutocompleteVariants,
  'size' | 'layout' | 'fullWidth'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Autocomplete?: {
      defaults?: Partial<AutocompleteVariantProps>;
    };
  }
}

/**
 * Default `{ value, label, disabled? }` option shape.
 *
 * The simplest shape and the one used by the component when no
 * `getOptionValue` / `getOptionLabel` props are provided. For richer
 * option shapes (e.g., `{ id, name, country, ... }`) make the component
 * generic by passing `<TOption>` and providing the accessors:
 *
 * ```tsx
 * type User = { id: string; name: string; admin?: boolean };
 *
 * <Autocomplete<User>
 *   name="owner"
 *   options={users}
 *   getOptionValue={(u) => u.id}
 *   getOptionLabel={(u) => u.name}
 *   getOptionDisabled={(u) => !u.admin}
 * />
 * ```
 */
export interface AutocompleteOption {
  /** Value persisted on the form. */
  value: string;
  /** Display label (string or any React node). */
  label: ReactNode;
  /** Per-option explicit disable. */
  disabled?: boolean;
}

export interface AutocompleteSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  trigger?: { className?: string };
  clearButton?: { className?: string };
  popover?: { className?: string };
  listBox?: { className?: string };
  listItem?: { className?: string };
  emptyState?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
  /** Wrapper around the chip list (multi-select only). */
  chipsList?: { className?: string };
  /** Individual chip displayed in multi-select. */
  chip?: { className?: string };
  /** `×` button on a chip. */
  chipRemove?: { className?: string };
}

/**
 * Union of the value shapes `<Autocomplete>` accepts.
 *
 * - **Single-select (default)**: `string | null`
 * - **Multi-select** (`multiple` prop): `string[] | null`
 *
 * `null` means "no selection" in both modes — a multi-select with no
 * picks emits an empty array on first commit, then keeps emitting arrays.
 */
export type AutocompleteValue = string | string[] | null;

/**
 * Props for `<Autocomplete>`.
 *
 * Bridge-integrated single-select combobox with full ARIA combobox
 * a11y, keyboard navigation, and Form Closure v1 error gating.
 *
 * Mirrors the MUI-side `@dashforge/ui/Autocomplete` at the bridge
 * level — same `name` / `rules` / `visibleWhen` / `access` semantics,
 * same StrictMode-safe unregister-on-unmount.
 *
 * @typeParam TOption  Shape of an option. Defaults to
 *                     `AutocompleteOption` (`{ value, label, disabled? }`).
 *                     Pass `<TOption>` + `getOptionValue` / `getOptionLabel`
 *                     for arbitrary domain types.
 */
export interface AutocompleteProps<TOption = AutocompleteOption> {
  /**
   * Density tier — drives wrapper padding + input font-size.
   * @default 'md'
   */
  size?: AutocompleteVariants['size'];

  /**
   * Label placement — `'stacked'` (above the combobox) or `'inline'`
   * (left of the combobox).
   * @default 'stacked'
   */
  layout?: AutocompleteVariants['layout'];

  /**
   * Stretch root wrapper + input to the container's width.
   * @default false
   */
  fullWidth?: AutocompleteVariants['fullWidth'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** RHF validation rules — opaque, forwarded to the bridge. */
  rules?: unknown;

  /** Selectable options — an array of `TOption` (defaults to `AutocompleteOption`). */
  options: TOption[];

  /** Visible label above (or left of, per `layout`) the combobox. */
  label?: ReactNode;

  /** Helper line below the combobox. Auto-replaced by bridge error when invalid. */
  helperText?: ReactNode;

  /**
   * Renders the required `*` marker + sets the native `required` attribute.
   * @default false
   */
  required?: boolean;

  /**
   * Explicit error semaphore. Overrides the bridge's auto-detected error.
   * @default false
   */
  error?: boolean;

  /**
   * Disables input + list — ORed with RBAC `denied:disable`.
   * @default false
   */
  disabled?: boolean;

  /** Placeholder shown when the input is empty. */
  placeholder?: string;
  /** Engine predicate — field not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: AutocompleteSlotProps;
  /** Controlled value (form mode reads from the bridge if omitted). */
  value?: AutocompleteValue;
  /** Default value for uncontrolled mode (no-op in form mode). */
  defaultValue?: AutocompleteValue;
  /** Fires when the user picks an option (after bridge update in form mode). */
  onValueChange?: (value: AutocompleteValue) => void;
  /** Fallback text when no option matches the typed filter. */
  emptyMessage?: string;

  // ───── F5-A-bis: multi-select ─────

  /**
   * Multi-select mode. When `true`:
   *
   * - `value` / `defaultValue` accept `string[]` (or `null`).
   * - Picks are toggled rather than replaced; the popover stays open.
   * - Selected items render as chips inside the input wrapper.
   * - Backspace at the start of an empty input removes the last chip.
   * - The clear button (`×`) clears the entire selection.
   */
  multiple?: boolean;

  // ───── F5-A-bis: free-solo ─────

  /**
   * Allow committing arbitrary strings (not just option values).
   *
   * When `true`:
   *   - **Enter** commits the typed text as the value when no option
   *     row is highlighted (or no rows match the filter).
   *   - **Blur** commits the typed text the same way, unless the text
   *     exactly matches an existing option's label (in which case the
   *     option's value snaps in).
   *   - In multi mode, each free-solo commit adds a new chip whose key
   *     and label are the typed string.
   *
   * Free-solo is independent of `multiple` — works in both modes.
   */
  freeSolo?: boolean;

  // ───── F5-A-bis: async runtime options ─────

  /**
   * Async option loader. Called (debounced by `loadDebounceMs`) every
   * time the user types in the input. Results replace the static
   * `options` prop while the user is actively filtering.
   *
   * Return a promise that resolves with the new option list. Reject /
   * throw to surface a generic empty state.
   *
   * @example
   * ```tsx
   * <Autocomplete
   *   name="user"
   *   options={[]}
   *   loadOptions={async (q) => {
   *     const res = await fetch(`/api/users?q=${q}`);
   *     return res.ok ? res.json() : [];
   *   }}
   * />
   * ```
   */
  loadOptions?: (query: string) => Promise<TOption[]>;
  /**
   * Debounce window (ms) for `loadOptions`. The loader fires after the
   * user stops typing for this long.
   * @default 250
   */
  loadDebounceMs?: number;
  /** Text displayed in the popover while a fetch is in flight. */
  loadingMessage?: ReactNode;

  // ───── Generic option accessors (F5-A-bis) ─────

  /**
   * Extract the persistable value (string) from an option.
   * @default `(o) => (o as AutocompleteOption).value`
   */
  getOptionValue?: (option: TOption) => string;
  /**
   * Extract the display label from an option.
   * @default `(o) => (o as AutocompleteOption).label`
   */
  getOptionLabel?: (option: TOption) => ReactNode;
  /**
   * Per-option disabled flag.
   * @default `(o) => Boolean((o as AutocompleteOption).disabled)`
   */
  getOptionDisabled?: (option: TOption) => boolean;
  /**
   * Unique React key for an option. Defaults to `getOptionValue`.
   * Override if your `value` strings can collide across distinct
   * option records (rare).
   */
  getOptionKey?: (option: TOption) => string;
}
