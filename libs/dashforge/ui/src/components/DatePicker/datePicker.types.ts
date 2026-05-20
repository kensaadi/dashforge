import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ISODate, WeekDay } from '@dashforge/calendar-core';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

/**
 * Props for the {@link DatePicker} form field.
 *
 * `DatePicker` is a bridge-integrated form field: a read-only text input
 * paired with a `Calendar` popup. The stored value is a plain ISO calendar
 * date — `YYYY-MM-DD` — or `null`. (Unlike the legacy `DateTimePicker`, a
 * pure date carries no time or timezone, which removes the whole class of
 * DST round-trip hazards.)
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
  /** Label/control layout. `floating` is downgraded to `stacked`. */
  layout?: FieldLayout;
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
  /** Test id applied to the field root. */
  testId?: string;
}
