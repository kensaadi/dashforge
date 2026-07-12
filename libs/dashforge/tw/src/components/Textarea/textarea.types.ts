import type {
  ChangeEventHandler,
  FocusEventHandler,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { TextareaVariants } from './textarea.variants.js';

/**
 * Subset of `<Textarea>` props theme-configurable via
 * `theme.components.Textarea.defaults` (Option C).
 */
export type TextareaVariantProps = Pick<
  TextareaVariants,
  'size' | 'layout' | 'fullWidth' | 'resize'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Textarea?: {
      defaults?: Partial<TextareaVariantProps>;
    };
  }
}

export interface TextareaSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for `<Textarea>`.
 *
 * Mirrors `<TextField>` semantics (bridge integration, RBAC, gating)
 * but renders a multi-line `<textarea>` and exposes a `resize` variant
 * (default `'vertical'`). Inherits standard HTMLTextarea attributes
 * (`rows`, `cols`, `maxLength`, etc.) via `TextareaHTMLAttributes`.
 */
export interface TextareaProps
  extends Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'size' | 'onChange' | 'onBlur' | 'value' | 'defaultValue'
    > {
  /**
   * Density tier — drives wrapper padding + font-size.
   * @default 'md'
   */
  size?: TextareaVariants['size'];

  /**
   * Label placement — `'stacked'` (above the textarea) or `'inline'`
   * (left of the textarea).
   * @default 'stacked'
   */
  layout?: TextareaVariants['layout'];

  /**
   * Stretch the root wrapper + textarea to the container's width.
   * @default false
   */
  fullWidth?: TextareaVariants['fullWidth'];

  /**
   * User-drag resize behavior via the native `resize` CSS property.
   * @default 'vertical'
   */
  resize?: TextareaVariants['resize'];

  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** RHF validation rules — opaque, forwarded to the bridge. */
  rules?: unknown;

  /** Visible label above (or left of, per `layout`) the textarea. */
  label?: ReactNode;

  /** Helper line below the textarea. Auto-replaced by bridge error when invalid. */
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
   * Disables the textarea — ORed with RBAC `denied:disable`.
   * @default false
   */
  disabled?: boolean;

  /** Engine predicate — textarea not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement (combines with explicit `disabled`). */
  access?: AccessRequirement;
  /** Root className shortcut (`cn`'d with the variant root class). */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: TextareaSlotProps;
  /** Controlled value (form mode reads from the bridge if omitted). */
  value?: string;
  /** Default value (uncontrolled, standalone mode only). */
  defaultValue?: string;
  /** User-supplied change handler — fires *after* bridge update. */
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  /** User-supplied blur handler — fires *after* bridge `onBlur`. */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /** Minimum visible row count for the textarea. Default: 3. */
  rows?: number;
}
