import type { ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { SwitchVariants } from './switch.variants.js';

/**
 * Subset of `<Switch>` props theme-configurable via
 * `theme.components.Switch.defaults` (Option C).
 */
export type SwitchVariantProps = Pick<SwitchVariants, 'size'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Switch?: {
      defaults?: Partial<SwitchVariantProps>;
      slotProps?: SwitchSlotProps;
    };
  }
}

export interface SwitchSlotProps {
  root?: { className?: string };
  control?: { className?: string };
  thumb?: { className?: string };
  label?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the Dashforge TW `<Switch>` component.
 *
 * Mirrors the bridge contract of `@dashforge/ui/Switch` (MUI). Same
 * `name` / `rules` / `visibleWhen` / `access` semantics, same
 * validation gating. Renders through Radix `Switch.Root` + `Switch.Thumb`.
 */
export interface SwitchProps {
  /**
   * Density tier — drives track width + thumb size + label font-size.
   * @default 'md'
   */
  size?: SwitchVariants['size'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** Inline label rendered next to the switch. Clicking the label toggles the state. */
  label?: ReactNode;

  /** RHF validation rules — opaque to this component, forwarded to the bridge. */
  rules?: unknown;

  /**
   * Engine-reactive visibility predicate. When the predicate returns
   * `false`, the component renders `null`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Controlled checked state. */
  checked?: boolean;

  /**
   * Uncontrolled initial checked state.
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Disable the switch — ORed with RBAC `denied:disable`.
   * @default false
   */
  disabled?: boolean;

  /** Helper line below the control. Auto-replaced by bridge error when invalid. */
  helperText?: ReactNode;

  /**
   * Explicit error semaphore. Overrides the bridge's auto-detected error.
   * @default false
   */
  error?: boolean;

  /** RBAC access requirement. See [Access Control](/tw/docs/access-control/overview). */
  access?: AccessRequirement;

  /** Root-level Tailwind class override — wins over variant classes via `cn()`. */
  sx?: string;

  /** Per-slot overrides — see `SwitchSlotProps`. */
  slotProps?: SwitchSlotProps;

  /** Fires after bridge update (form mode) or after uncontrolled state change. */
  onCheckedChange?: (checked: boolean) => void;
}
