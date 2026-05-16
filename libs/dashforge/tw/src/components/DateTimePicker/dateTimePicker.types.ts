import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { DateTimePickerVariants } from './dateTimePicker.variants.js';

/**
 * Operating mode of the picker.
 *
 *  - `'date'`     — `YYYY-MM-DD` (native `<input type="date">`)
 *  - `'time'`     — `HH:mm` or `HH:mm:ss` (native `<input type="time">`)
 *  - `'datetime'` — `YYYY-MM-DDTHH:mm` (native `<input type="datetime-local">`)
 *
 * Note: `datetime-local` does NOT include timezone info. Values are
 * naive local-time strings. If you need TZ-aware persistence, convert
 * upstream (e.g., interpret as UTC, or attach the user's TZ from a
 * separate field).
 */
export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  inputWrapper?: { className?: string };
  input?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for `<DateTimePicker>`.
 *
 * Bridge-integrated date / time / datetime input built on the native
 * HTML5 input types (`type="date|time|datetime-local"`). Chosen over a
 * custom React Aria `<DatePicker>` for F5-B because:
 *
 *  1. **Zero new deps** — no `@internationalized/date`.
 *  2. **A11y by default** — screen readers know how to announce these
 *     inputs, including the OS-provided calendar/clock popup.
 *  3. **Bundle size** — saves ~30KB minified over the Aria stack.
 *  4. **API parity** with the MUI side (`@dashforge/ui/DateTimePicker`).
 *  5. **Predictability** — no internal state machine to fight (see the
 *     ComboBox lesson learned in `<Autocomplete>` F5-A).
 *
 * A richer "always-visible calendar grid" upgrade can come as F5-B-bis.
 *
 * Value contract: ISO 8601-ish naive strings, always.
 */
export interface DateTimePickerProps extends DateTimePickerVariants {
  name: string;
  rules?: unknown;
  /** Which native input to render. @default 'date' */
  mode?: DateTimePickerMode;
  label?: ReactNode;
  helperText?: ReactNode;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Minimum value (ISO string compatible with the mode). */
  min?: string;
  /** Maximum value (ISO string compatible with the mode). */
  max?: string;
  /**
   * Step in seconds (time / datetime). Default 60 ⇒ minute precision.
   * Set to 1 to allow seconds.
   */
  step?: number;
  /** Engine predicate — field not rendered when it returns `false`. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: DateTimePickerSlotProps;
  /** Controlled value (form mode reads from the bridge if omitted). */
  value?: string | null;
  /** Default value for uncontrolled mode (no-op in form mode). */
  defaultValue?: string | null;
  /** Fires when the user picks a date/time (after bridge update in form mode). */
  onValueChange?: (value: string | null) => void;
}
