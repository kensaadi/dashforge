import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { DateRange, ISODate, WeekDay } from '@dashforge/calendar-core';
import type { FieldLayout } from '../_internal/FieldLayoutShell';

/**
 * Props for the {@link DateRangePicker} form field.
 *
 * `DateRangePicker` is a bridge-integrated form field: a read-only text input
 * paired with a dual-month range calendar popup. The stored value is a
 * `{ start, end }` pair of plain ISO calendar dates (`YYYY-MM-DD`); either
 * side may be `null`. No time, no timezone.
 */
export interface DateRangePickerProps {
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
  /** Placeholder shown when no range is selected. */
  placeholder?: string;
  /** Label/control layout. `floating` is downgraded to `stacked`. */
  layout?: FieldLayout;
  /** Reactive visibility predicate evaluated against the form engine. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Controlled value — a `{ start, end }` pair. */
  value?: DateRange;
  /** Uncontrolled initial value. */
  defaultValue?: DateRange;
  /** Fired with the new range (partial on the first click, complete on the second). */
  onChange?: (value: DateRange) => void;
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
