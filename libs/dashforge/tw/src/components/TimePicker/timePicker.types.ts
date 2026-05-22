import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';

/** Per-slot `className` overrides for `<TimePicker>`. */
export interface TimePickerSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  trigger?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the `<TimePicker>` form field (Tailwind skin).
 *
 * A read-only trigger paired with a `<Calendar>`-style time-list popover.
 * The stored value is a canonical 24-hour `"HH:mm"` string, or `null`.
 * 12-hour notation (`hour12`) is display-only. No date, no timezone.
 *
 * The prop surface mirrors the MUI `@dashforge/ui` `TimePicker`.
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
  /** Label/control layout. */
  layout?: 'stacked' | 'inline';
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
  /** Latest selectable time, `"HH:mm"`. Default `"23:30"`. */
  maxTime?: string;
  /** Step between time-list options, in minutes. Default `30`. */
  stepMinutes?: number;
  /** Render the time list in 12-hour notation. Default `false`. */
  hour12?: boolean;
  /** Stretches the field to its container width. */
  fullWidth?: boolean;
  /** Root-level Tailwind class override. */
  sx?: string;
  /** Per-slot `className` overrides. */
  slotProps?: TimePickerSlotProps;
  /** Test id applied to the field root. */
  testId?: string;
}
