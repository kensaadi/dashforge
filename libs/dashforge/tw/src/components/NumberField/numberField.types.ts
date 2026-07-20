import type {
  ChangeEventHandler,
  FocusEventHandler,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { NumberFieldVariants } from './numberField.variants.js';

/**
 * Subset of `<NumberField>` props theme-configurable via
 * `theme.components.NumberField.defaults` (Option C).
 */
export type NumberFieldVariantProps = Pick<
  NumberFieldVariants,
  'size' | 'layout' | 'fullWidth'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    NumberField?: {
      defaults?: Partial<NumberFieldVariantProps>;
      slotProps?: NumberFieldSlotProps;
    };
  }
}

export interface NumberFieldSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  stepper?: { className?: string };
  stepperButton?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for `<NumberField>`.
 *
 * Value contract (mirrors `@dashforge/ui/NumberField`):
 *  - Bridge storage type: `number | null` (NEVER `NaN`).
 *  - UI display: `number → String(number)`, `null/undefined → ""`.
 *  - On user input:
 *      - empty string → `setValue(name, null)`
 *      - parseable number → `setValue(name, parsed)`
 *      - non-numeric input → no bridge write (UI string is kept as-is for UX,
 *        but the bridge stays at the last valid value)
 *  - Parsing uses `Number(...)` + `Number.isFinite(...)`. No locale parsing.
 */
export interface NumberFieldProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'type' | 'size' | 'onChange' | 'onBlur' | 'value' | 'defaultValue'
    > {
  /**
   * Density tier — drives input height + padding + font-size.
   * @default 'md'
   */
  size?: NumberFieldVariants['size'];

  /**
   * Label placement — `'stacked'` (above the input) or `'inline'`
   * (left of the input).
   * @default 'stacked'
   */
  layout?: NumberFieldVariants['layout'];

  /**
   * Stretch root wrapper + input to the container's width.
   * @default false
   */
  fullWidth?: NumberFieldVariants['fullWidth'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** RHF validation rules — opaque, forwarded to the bridge. */
  rules?: unknown;

  /** Visible label above (or left of, per `layout`) the input. */
  label?: ReactNode;

  /** Helper line below the input. Auto-replaced by bridge error when invalid. */
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
   * Disables the input — ORed with RBAC `denied:disable`.
   * @default false
   */
  disabled?: boolean;

  /** Engine predicate — field not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement (combines with explicit `disabled`). */
  access?: AccessRequirement;
  /** Root className shortcut (`cn`'d with the variant root class). */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: NumberFieldSlotProps;
  /** Controlled value (form mode reads from the bridge if omitted). */
  value?: number | string | null;
  /** Default value (uncontrolled, standalone mode only). */
  defaultValue?: number | string | null;
  /** Min allowed value (passed to the input + clamps stepper). */
  min?: number;
  /** Max allowed value (passed to the input + clamps stepper). */
  max?: number;
  /** Stepper step size. Default 1. */
  step?: number;
  /** Show inline +/− stepper buttons inside the input wrapper. Default false. */
  showStepper?: boolean;
  /** Change handler — receives the native event; consume value via bridge. */
  onChange?: ChangeEventHandler<HTMLInputElement>;

  /** Blur handler — fires after bridge onBlur (form mode). */
  onBlur?: FocusEventHandler<HTMLInputElement>;
}
