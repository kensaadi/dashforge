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
export interface SwitchProps extends Pick<SwitchVariants, 'size'> {
  name: string;
  label?: ReactNode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  helperText?: ReactNode;
  error?: boolean;
  access?: AccessRequirement;
  sx?: string;
  slotProps?: SwitchSlotProps;
  onCheckedChange?: (checked: boolean) => void;
}
