import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ISODate, WeekDay } from '@dashforge/calendar-core';

/** Per-slot `className` overrides for `<DatePicker>`. */
export interface DatePickerSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  trigger?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the `<DatePicker>` form field (Tailwind skin).
 *
 * A read-only trigger button paired with a `<Calendar>` popover, integrated
 * with the Dashforge form bridge + RBAC. The stored value is a plain ISO
 * calendar date — `YYYY-MM-DD` — or `null`. (A pure date carries no time or
 * timezone, which removes the whole class of DST round-trip hazards.)
 *
 * The prop surface mirrors the MUI `@dashforge/ui` `DatePicker` so the API
 * is consistent across both ecosystems; only the styling escape hatches
 * (`sx` / `slotProps`) follow the Tailwind conventions.
 */
export interface DatePickerProps {
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
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** Label/control layout. */
  layout?: 'stacked' | 'inline';
  /** Reactive visibility predicate evaluated against the form engine. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Controlled value — ISO `YYYY-MM-DD` or `null`. */
  value?: ISODate | null;
  /** Uncontrolled initial value. */
  defaultValue?: ISODate | null;
  /** Fired with the new ISO date (or `null` when cleared). */
  onChange?: (value: ISODate | null) => void;
  /** Earliest selectable date (inclusive). */
  minDate?: ISODate;
  /** Latest selectable date (inclusive). */
  maxDate?: ISODate;
  /** Explicit list of disabled dates. */
  disabledDates?: readonly ISODate[];
  /** Predicate marking arbitrary dates disabled. */
  isDateDisabled?: (date: ISODate) => boolean;
  /** Weekday of the calendar's first column (`0` = Sunday). */
  weekStartDay?: WeekDay;
  /** BCP-47 locale for the calendar and the display format. */
  locale?: string;
  /** Stretches the field to its container width. */
  fullWidth?: boolean;
  /** Root-level Tailwind class override. */
  sx?: string;
  /** Per-slot `className` overrides. */
  slotProps?: DatePickerSlotProps;
  /** Test id applied to the field root. */
  testId?: string;
}
