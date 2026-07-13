import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { SelectVariants } from './select.variants.js';

/**
 * The primitive types `<Select>` accepts as an option value.
 *
 * `string` for enum tokens (`'solid' | 'outline'`), `number` for numeric
 * IDs (typical when the backend stores integer foreign keys). Union-of-
 * strings is inferred from the options array so `V` narrows precisely at
 * the consumer site — `<Select options={[{value:'a',...},{value:'b',...}]} />`
 * gives `onChange: (value: 'a' | 'b', ...) => void`.
 */
export type SelectValue = string | number;

/**
 * A single option in the picker's list.
 *
 * Mirrors `AutocompleteOption` on purpose — Blueprint's `TwSelect`
 * binding (and any consumer alternating between Autocomplete and Select)
 * pastes the same array between the two.
 *
 * @typeParam V — the primitive that gets committed to the form when the
 *              option is selected. Defaults to `string`; pass `number`
 *              for enums whose identity is a numeric ID.
 *
 * `label` is `ReactNode` (not `string`) on purpose: it lets consumers
 * pass a `<Trans i18nKey="…" />` / `<FormattedMessage …/>` for reactive
 * i18n without wrapping the whole options array in a `useMemo`. If the
 * app's i18n exposes a `t()` function that returns a string, the same
 * `useMemo` pattern applies — see the "Static enum options with i18n"
 * section of the docs.
 */
export interface SelectOption<V extends SelectValue = string> {
  /** The primitive persisted on the form and matched against `value`. */
  value: V;
  /** Display label — accepts any React node for icons / rich content / i18n. */
  label: ReactNode;
  /** Per-option explicit disable — grays the row and blocks selection. */
  disabled?: boolean;
}

/**
 * Subset of `<Select>` props theme-configurable via
 * `theme.components.Select.defaults` (Option C).
 *
 * These are the axes a design system typically pins application-wide
 * (density, layout convention, fullWidth default in a compact panel).
 */
export type SelectVariantProps = Pick<
  SelectVariants,
  'size' | 'layout' | 'fullWidth'
>;

/**
 * Per-slot override map. Each entry accepts `{ className?: string }`.
 * See {@link selectVariants} for the full slot roster.
 */
export interface SelectSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  trigger?: { className?: string };
  triggerText?: { className?: string };
  triggerPlaceholder?: { className?: string };
  chevron?: { className?: string };
  popover?: { className?: string };
  listBox?: { className?: string };
  listItem?: { className?: string };
  listItemIndicator?: { className?: string };
  emptyState?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
  chipsList?: { className?: string };
  chip?: { className?: string };
  chipRemove?: { className?: string };
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Select?: {
      defaults?: Partial<SelectVariantProps>;
      slotProps?: SelectSlotProps;
    };
  }
}

/**
 * Change handler signature.
 *
 * Fires with the primitive value AND the full `SelectOption` object so
 * the consumer can:
 *   - Simple case: `onChange={setVariant}` — TS narrows `value` to the
 *     literal union inferred from options.
 *   - Rich case: destructure `(value, option) => …` to access custom
 *     fields the consumer put on the option (icon, region metadata,
 *     server-side row identifier, etc.).
 *
 * For `multiple: true`, the signature carries the full array of selected
 * values and the full array of matching options — same ergonomic in
 * both directions.
 */
export type SelectChangeHandler<V extends SelectValue = string> = (
  value: V,
  option: SelectOption<V>,
) => void;

export type SelectMultiChangeHandler<V extends SelectValue = string> = (
  values: V[],
  options: SelectOption<V>[],
) => void;

/**
 * Props for `<Select>`. The primitive shipped in Sprint 6 as the
 * dedicated enum picker — chosen over extending `<Autocomplete>` with
 * a `disableSearch` flag so the two components have clean boundaries
 * (Autocomplete = search / async / typeahead; Select = static enum /
 * 3–10 options / no search).
 *
 * Behaviour parity with the rest of the tw form catalog:
 *   - Bridge integration inside `<DashFormProvider>` (registers via
 *     `bridge.register(name, rules)`, subscribes reactively via
 *     `useDashFieldMeta(name)`, commits via `bridge.setValue`).
 *   - Standalone controlled outside a form (pass `value` + `onChange`).
 *   - RBAC (`access`) + visibility (`visibleWhen`) forwarded to the
 *     `useAccessState` / `useEngineVisibility` hooks used everywhere
 *     else in the catalog.
 *
 * @typeParam V — the primitive type of the option values. Inferred from
 *              the options array — `<Select options={[{value:'a'},...]}/>`
 *              narrows `value` and `onChange` to the union of the passed
 *              literals.
 */
export interface SelectProps<V extends SelectValue = string> {
  // ─── Bridge integration ───────────────────────────────────────────
  /**
   * Field name — required at the TypeScript level. Consistent with the
   * rest of the tw form catalog: enforcing `name` at compile time
   * prevents the "silent no-op" family of bugs (see #113).
   */
  name: string;

  /**
   * React Hook Form rule set. Forwarded to `bridge.register(name, rules)`
   * when inside a `<DashFormProvider>`. Ignored outside a form.
   * Untyped by design here — the rules shape belongs to whatever RHF
   * version the consumer app pins, so we pass through as-is (mirrors
   * Autocomplete's `rules?: unknown`).
   */
  rules?: unknown;

  // ─── Field layout / labelling ────────────────────────────────────
  /**
   * Text or node shown above (or to the left of, in `inline` layout)
   * the trigger.
   */
  label?: ReactNode;

  /**
   * Descriptive line under the trigger. Replaced by the bridge's
   * validation error when the field is invalid.
   */
  helperText?: ReactNode;

  /**
   * Force error state without consulting the bridge — useful for
   * server-side / async validation the bridge doesn't own.
   */
  error?: boolean;

  /**
   * Renders the red `*` required marker and forwards to the native
   * `required` attribute. Distinct from `rules.required` — this one
   * is purely visual + native; the bridge validation runs independently.
   */
  required?: boolean;

  /** Grays out the trigger + popover, blocks keyboard interaction. */
  disabled?: boolean;

  /** Stretches the root + trigger to `w-full`. */
  fullWidth?: boolean;

  /**
   * Layout — `stacked` (label above trigger) or `inline` (label on the
   * left, trigger on the right). Matches Autocomplete.
   * @default 'stacked'
   */
  layout?: SelectVariants['layout'];

  /**
   * Density knob — matches Autocomplete + TextField / NumberField.
   * @default 'md'
   */
  size?: SelectVariants['size'];

  // ─── Visibility + RBAC ────────────────────────────────────────────
  /** Reactive visibility predicate. Falsy → renders null. */
  visibleWhen?: (engine: Engine) => boolean;

  /** RBAC gate. See `useAccessState`. */
  access?: AccessRequirement;

  // ─── Data ─────────────────────────────────────────────────────────
  /**
   * The static options list. `[]` renders the empty state in the
   * popover. Consumers typically define this at module scope for
   * stability, or `useMemo` it if the list depends on props / i18n.
   */
  options: readonly SelectOption<V>[];

  /**
   * Placeholder text shown in the trigger when no value is selected.
   * @default 'Select…'
   */
  placeholder?: ReactNode;

  /**
   * Fallback rendered inside the popover when `options` is empty.
   * @default 'No options'
   */
  emptyState?: ReactNode;

  // ─── Controlled / uncontrolled value ─────────────────────────────
  /**
   * Controlled selection. For single-select, the primitive value of
   * the currently chosen option (or `null` for nothing selected). For
   * multi-select (`multiple: true`), the array of selected values.
   *
   * When omitted AND the field is not bridge-managed, the component
   * runs uncontrolled and manages selection internally.
   */
  value?: V | V[] | null;

  /**
   * Uncontrolled initial value. Same shape rules as `value`.
   */
  defaultValue?: V | V[] | null;

  /**
   * Called on selection change.
   *
   * Two arguments — the primitive value that will be committed to the
   * form, AND the full `SelectOption` object (for consumers who put
   * custom fields on the option and want them at hand in the callback
   * without an extra lookup).
   *
   * TypeScript picks the single- or multi-select signature based on
   * the runtime `multiple` prop via the discriminated union at the
   * type layer.
   */
  onChange?: SelectChangeHandler<V> | SelectMultiChangeHandler<V>;

  /** Fired on trigger blur (after the popover closes). */
  onBlur?: () => void;

  // ─── Multi-select ────────────────────────────────────────────────
  /**
   * When true, allows multiple selections. `value` / `defaultValue`
   * become arrays; `onChange` receives the array signature; the trigger
   * renders a chip list of selected items.
   *
   * Additive — single-select consumers ignore this and get the classic
   * enum picker behaviour.
   *
   * @default false
   */
  multiple?: boolean;

  // ─── Escape hatches ──────────────────────────────────────────────
  /**
   * Utility-class shortcut for `slotProps.trigger.className` — mirrors
   * the Dashforge idiom on other primitives (Button, Dialog, Link).
   */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: SelectSlotProps;

  // ─── Testing ─────────────────────────────────────────────────────
  /** `data-testid` forwarded to the root wrapper. */
  testId?: string;
}
