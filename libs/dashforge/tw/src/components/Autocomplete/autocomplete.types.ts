import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { AutocompleteVariants } from './autocomplete.variants.js';

/**
 * A single selectable option in `<Autocomplete>`.
 *
 * F5-A scope is the simplest shape: `{ value, label }` strings.
 * Generic value/label separation (getOptionValue/Label) and async
 * runtime options (optionsFromFieldData) are deferred to a follow-up
 * sub-sprint to keep this delivery focused on the React Aria
 * ComboBox primitive integration + bridge wiring.
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
}

/**
 * Props for `<Autocomplete>`.
 *
 * Bridge-integrated single-select combobox built on React Aria
 * Components `<ComboBox>` for AAA-grade keyboard + screen-reader
 * support out of the box.
 *
 * Mirrors the MUI-side `@dashforge/ui/Autocomplete` at the bridge
 * level — same `name` / `rules` / `visibleWhen` / `access` semantics,
 * same Form Closure v1 error gating, same StrictMode-safe
 * unregister-on-unmount.
 *
 * F5-A scope: single-select, static options. Multi-select, free-solo,
 * generic option shape, and async runtime options are follow-ups.
 */
export interface AutocompleteProps extends AutocompleteVariants {
  name: string;
  rules?: unknown;
  options: AutocompleteOption[];
  label?: ReactNode;
  helperText?: ReactNode;
  required?: boolean;
  error?: boolean;
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
  value?: string | null;
  /** Default value for uncontrolled mode (no-op in form mode). */
  defaultValue?: string | null;
  /** Fires when the user picks an option (after bridge update in form mode). */
  onValueChange?: (value: string | null) => void;
  /** Fallback text when no option matches the typed filter. */
  emptyMessage?: string;
}
