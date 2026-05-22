import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

/**
 * Props for the {@link TimePicker} form field.
 *
 * `TimePicker` is a bridge-integrated form field: a text input paired with a
 * dropdown of time options. The stored value is a canonical 24-hour
 * `"HH:mm"` string, or `null`. 12-hour notation is a display concern only
 * (`hour12`) — never the storage format. The field carries no date and no
 * timezone.
 */
export interface TimePickerProps {
  /** Field name — the bridge registration key. Required. */
  name: string;
  /** Validation rules forwarded to the form bridge. */
  rules?: unknown;
  /** Field label. */
  label?: ReactNode;
  /** Helper text below the control (overrides a bridge error message). */
  helperText?: ReactNode;
  /** Explicit error state (overrides the bridge's auto error). */
  error?: boolean;
  /** Marks the field required (adds the label asterisk). */
  required?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** Placeholder shown when no time is selected. */
  placeholder?: string;
  /** Label/control layout. `floating` is downgraded to `stacked`. */
  layout?: FieldLayout;
  /** Reactive visibility predicate evaluated against the form engine. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Controlled value — `"HH:mm"` (24-hour) or `null`. */
  value?: string | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | null;
  /** Fired with the new time (or `null` when cleared). */
  onChange?: (value: string | null) => void;
  /** Earliest selectable time, `"HH:mm"`. Default `"00:00"`. */
  minTime?: string;
  /** Latest selectable time, `"HH:mm"`. Default `"23:59"`. */
  maxTime?: string;
  /** Step between dropdown options, in minutes. Default `30`. */
  stepMinutes?: number;
  /** Render the input + dropdown in 12-hour notation. Default `false`. */
  hour12?: boolean;
  /** Stretches the field to its container width. */
  fullWidth?: boolean;
  /** Test id applied to the field root. */
  testId?: string;
}
