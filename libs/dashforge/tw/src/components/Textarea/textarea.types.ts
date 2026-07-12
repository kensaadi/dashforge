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
    >,
    TextareaVariants {
  name: string;
  rules?: unknown;
  label?: ReactNode;
  helperText?: ReactNode;
  required?: boolean;
  error?: boolean;
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
