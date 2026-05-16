import type { InputHTMLAttributes, ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { TextFieldVariants } from './textField.variants.js';

/**
 * Per-slot overrides for `<TextField>`.
 *
 * Each slot accepts `{ className: string }` so the override path is
 * extensible (style / aria-* / data-* can be added without a breaking
 * change). Mirrors the MUI-side `slotProps` shape.
 */
export interface TextFieldSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the Dashforge TW `<TextField>`.
 *
 * Extends the native `<input>` attributes (so `placeholder`, `type`,
 * `autoComplete`, `aria-*` etc. all flow through), narrowed in two
 * places:
 *
 *   - `size` is omitted because HTML's legacy `size` attribute (number)
 *     collides with our variant axis (`'sm' | 'md' | 'lg'`).
 *   - `className` is omitted — use `sx` instead (the canonical override
 *     path that wins over variant classes via `tailwind-merge`).
 *
 * Plus the variant axes and Dashforge form-bridge wiring (`name`,
 * `rules`, `visibleWhen`, `access`).
 */
export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>,
    Pick<TextFieldVariants, 'size' | 'layout' | 'fullWidth'> {
  /** Bridge field name (required when used inside `DashFormProvider`). */
  name: string;

  /** Visible label. */
  label?: ReactNode;

  /** Forwarded to the bridge as RHF rules — opaque to this component. */
  rules?: unknown;

  /** Engine predicate. Component returns null when false. */
  visibleWhen?: (engine: Engine) => boolean;

  /** Helper line below the input. */
  helperText?: ReactNode;

  /** Explicit error semaphore. Overrides bridge auto-error. */
  error?: boolean;

  /** Render the asterisk + set the native `required` attribute. */
  required?: boolean;

  /** RBAC requirement. */
  access?: AccessRequirement;

  /** Root-level Tailwind override — wins over variant classes via `cn()`. */
  sx?: string;

  /** Per-slot overrides — see `TextFieldSlotProps`. */
  slotProps?: TextFieldSlotProps;
}
