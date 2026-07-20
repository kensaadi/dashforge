import type { ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { CheckboxVariants } from './checkbox.variants.js';

/**
 * Subset of `<Checkbox>` props theme-configurable via
 * `theme.components.Checkbox.defaults` (Option C).
 */
export type CheckboxVariantProps = Pick<CheckboxVariants, 'size'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Checkbox?: {
      defaults?: Partial<CheckboxVariantProps>;
      slotProps?: CheckboxSlotProps;
    };
  }
}

/**
 * Per-slot className overrides for `<Checkbox>`. Shape mirrors the
 * MUI-side `slotProps` convention: object-per-slot with a `className`
 * key, so future extensions (style, aria-*, data-*) are additive.
 */
export interface CheckboxSlotProps {
  root?: { className?: string };
  control?: { className?: string };
  indicator?: { className?: string };
  label?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the Dashforge TW `<Checkbox>` component.
 *
 * Behaves identically to `@dashforge/ui/Checkbox` (MUI) at the bridge
 * level — same `name` / `rules` / `visibleWhen` / `access` semantics,
 * same validation gating (touched OR submitCount > 0). The visual
 * surface is rendered via Radix Checkbox + Tailwind classes.
 *
 * Note: the `error` prop here is the **public** form-validation
 * semaphore (boolean override); it threads into the variant via
 * `checkboxVariants({ error })` internally. The variant axis name and
 * the prop name happen to coincide — same meaning.
 */
export interface CheckboxProps {
  /**
   * Density tier — drives control box + label font-size.
   * @default 'md'
   */
  size?: CheckboxVariants['size'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** Visible label rendered next to the control. Click also toggles the box. */
  label?: ReactNode;

  /** Forwarded to the bridge as RHF rules — opaque to this component. */
  rules?: unknown;

  /**
   * Engine predicate. When provided, the component renders only when
   * the predicate returns truthy against the current engine state.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Initial / controlled checked state. */
  checked?: boolean;

  /** Default checked when used uncontrolled. */
  defaultChecked?: boolean;

  /** Disabled — combined with RBAC disabled via OR. */
  disabled?: boolean;

  /**
   * Forces helper text below the control. When the bridge surfaces an
   * error and `helperText` is undefined, the bridge's error message
   * shows up here (gated by `touched || submitCount > 0`).
   */
  helperText?: ReactNode;

  /**
   * Explicit error flag. When `true`, the control renders with the
   * danger ring + the error-text slot is used for `helperText`.
   * Overrides the bridge's auto-detected error.
   */
  error?: boolean;

  /** RBAC requirement. */
  access?: AccessRequirement;

  /** Root-level Tailwind override. Wins over variant classes via `cn()`. */
  sx?: string;

  /** Per-slot overrides — see `CheckboxSlotProps`. */
  slotProps?: CheckboxSlotProps;

  /**
   * Called when the user toggles the control. When inside a
   * `DashFormProvider`, the bridge update happens first, then this
   * callback fires with the new checked state.
   */
  onCheckedChange?: (checked: boolean) => void;
}
