import type { InputHTMLAttributes, ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Engine } from '@dashforge/ui-core';
import type { TextFieldVariants } from './textField.variants.js';

/**
 * Subset of `<TextField>` props theme-configurable via
 * `theme.components.TextField.defaults` (Option C).
 */
export type TextFieldVariantProps = Pick<
  TextFieldVariants,
  'size' | 'layout' | 'fullWidth'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    TextField?: {
      defaults?: Partial<TextFieldVariantProps>;
    };
  }
}

/**
 * Per-slot overrides for `<TextField>`.
 *
 * Each slot accepts `{ className: string }` (and, for `prefix` /
 * `suffix`, a `children` node) so the override path is extensible —
 * extra fields like `style`, `aria-*`, `data-*` can be added without
 * a breaking change. Mirrors the MUI-side `slotProps` shape.
 *
 * **`prefix` / `suffix`** are inline adornments rendered INSIDE the
 * `inputWrapper`, before / after the `<input>` element. Typical use:
 * currency symbols, units, status icons. Passing only `className`
 * (no `children`) is allowed but renders an empty slot — usually
 * you'll always pair the two.
 *
 *   ```tsx
 *   <TextField
 *     name="price"
 *     type="number"
 *     slotProps={{
 *       prefix: { children: '$' },
 *       suffix: { children: 'USD' },
 *     }}
 *   />
 *   ```
 */
export interface TextFieldSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
  prefix?: { children?: ReactNode; className?: string };
  suffix?: { children?: ReactNode; className?: string };
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
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> {
  /**
   * Density tier — drives input height + padding + font-size.
   * @default 'md'
   */
  size?: TextFieldVariants['size'];

  /**
   * Label placement — `'stacked'` (above the input) or `'inline'`
   * (left of the input, useful for horizontal forms).
   * @default 'stacked'
   */
  layout?: TextFieldVariants['layout'];

  /**
   * Stretch the root wrapper + input to the container's width.
   * @default false
   */
  fullWidth?: TextFieldVariants['fullWidth'];

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
