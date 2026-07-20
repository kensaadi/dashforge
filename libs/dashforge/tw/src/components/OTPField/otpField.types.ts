import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { OTPFieldVariants } from './otpField.variants.js';

/**
 * Subset of `<OTPField>` props theme-configurable via
 * `theme.components.OTPField.defaults` (Option C).
 */
export type OTPFieldVariantProps = Pick<OTPFieldVariants, 'size'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    OTPField?: {
      defaults?: Partial<OTPFieldVariantProps>;
      slotProps?: OTPFieldSlotProps;
    };
  }
}

export type OTPFieldMode = 'numeric' | 'alphanumeric';

export interface OTPFieldSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  slotsRow?: { className?: string };
  slot?: { className?: string };
  slotChar?: { className?: string };
  hiddenInput?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for `<OTPField>`.
 *
 * Storage contract: bridge value is a single string (e.g. `"123456"`).
 * The user types characters that the component sanitises per `mode`:
 *  - `'numeric'`      → `[0-9]`
 *  - `'alphanumeric'` → `[A-Za-z0-9]`
 * Anything else is dropped. Paste content is sanitised the same way and
 * fills slots sequentially.
 */
export interface OTPFieldProps {
  /**
   * Density tier — drives slot cell size + typed-character font.
   * @default 'md'
   */
  size?: OTPFieldVariants['size'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** RHF validation rules — opaque, forwarded to the bridge. */
  rules?: unknown;

  /** Visible label above the slot row. */
  label?: ReactNode;

  /** Helper line below the slot row. Auto-replaced by bridge error when invalid. */
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
   * Disables all slots + hidden input.
   * @default false
   */
  disabled?: boolean;

  /** Engine predicate — field not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement (combines with explicit `disabled`). */
  access?: AccessRequirement;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: OTPFieldSlotProps;
  /** Number of slots (default 6 — the SMS code convention). */
  length?: number;
  /** Character set allowed. Default `'numeric'`. */
  mode?: OTPFieldMode;
  /** Controlled value (form mode reads from the bridge if omitted). */
  value?: string;
  /** Default value (uncontrolled, standalone mode only). */
  defaultValue?: string;
  /** Fires every time the joined value changes (sanitised, ≤ length). */
  onChange?: (value: string) => void;
  /** Fires when the user has filled all slots. */
  onComplete?: (value: string) => void;
}
