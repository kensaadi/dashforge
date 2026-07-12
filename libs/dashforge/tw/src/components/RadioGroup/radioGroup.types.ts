import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { RadioGroupVariants } from './radioGroup.variants.js';

/**
 * Subset of `<RadioGroup>` props theme-configurable via
 * `theme.components.RadioGroup.defaults` (Option C).
 */
export type RadioGroupVariantProps = Pick<RadioGroupVariants, 'size' | 'layout'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    RadioGroup?: {
      defaults?: Partial<RadioGroupVariantProps>;
    };
  }
}

/**
 * A single selectable option in a `<RadioGroup>`.
 */
export interface RadioGroupOption {
  /** The string value persisted on the form for this option. */
  value: string;
  /** Display label (string or any React node — e.g. with an icon). */
  label: ReactNode;
  /** Per-option explicit disable. ORed with group-level disable + RBAC. */
  disabled?: boolean;
  /**
   * RBAC access requirement for this specific option:
   *  - `onUnauthorized: 'hide'`     → option not rendered (unless it's the currently selected value, kept disabled to expose the choice)
   *  - `onUnauthorized: 'disable'`  → option visible but not selectable
   *  - `onUnauthorized: 'readonly'` → falls back to disabled (radios have no true readonly semantics)
   *
   * Group-level access has **precedence** over option-level access — if the
   * whole group is hidden/disabled, that wins for all options regardless of
   * their own access.
   */
  access?: AccessRequirement;
}

/**
 * Optional className override for each slot. Use to extend specific parts
 * of the recipe without losing the default classes. Override semantics
 * follow the `tailwind-merge` last-wins rule.
 */
export interface RadioGroupSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  optionList?: { className?: string };
  option?: { className?: string };
  control?: { className?: string };
  indicator?: { className?: string };
  optionLabel?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for `<RadioGroup>`.
 *
 * Mirrors the MUI-side `@dashforge/ui/RadioGroup` at the bridge level —
 * same `name` / `rules` / `visibleWhen` / `access` semantics, same
 * Form Closure v1 error gating, same option-level RBAC.
 */
export interface RadioGroupProps {
  /**
   * Density tier — drives radio dot size + label font-size.
   * @default 'md'
   */
  size?: RadioGroupVariants['size'];

  /**
   * Option list direction. `'stacked'` (default) is vertical;
   * `'row'` is horizontal.
   * @default 'stacked'
   */
  layout?: RadioGroupVariants['layout'];

  /** Field name registered with the bridge. */
  name: string;
  /** Array of selectable options. Order is render order. */
  options: RadioGroupOption[];
  /** Group-level label (rendered above the option list). */
  label?: ReactNode;
  /** React Hook Form validation rules — forwarded to `bridge.register`. */
  rules?: unknown;
  /** Helper text shown below the option list when not in error state. */
  helperText?: ReactNode;
  /** Marks the group as required (renders red `*` after the label). */
  required?: boolean;
  /** Explicit error override (otherwise resolved from bridge). */
  error?: boolean;
  /** Explicit disable override (ORed with RBAC). */
  disabled?: boolean;
  /** Engine predicate — group not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** Group-level RBAC requirement (precedes option-level access). */
  access?: AccessRequirement;
  /** Root className shortcut (`cn`'d with the variant root class). */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: RadioGroupSlotProps;
  /** Controlled value (for standalone mode without a form bridge). */
  value?: string;
  /** Default value for uncontrolled mode (no-op in form mode — bridge wins). */
  defaultValue?: string;
  /** Change handler (called *after* bridge update in form mode). */
  onValueChange?: (value: string) => void;
}
