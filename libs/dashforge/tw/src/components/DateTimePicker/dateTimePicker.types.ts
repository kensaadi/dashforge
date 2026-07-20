import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ISODate, WeekDay } from '@dashforge/calendar-core';

/** Per-slot `className` overrides for `<DateTimePicker>`. */
export interface DateTimePickerSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  trigger?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

/**
 * Props for the `<DateTimePicker>` form field (Tailwind skin).
 *
 * A read-only trigger paired with a popover combining a `<Calendar>` and a
 * time list. The stored value is a naive ISO datetime — `"YYYY-MM-DDTHH:mm"`
 * — or `null`. No seconds, no timezone.
 *
 * For a date-only field use `<DatePicker>`; for time-only use `<TimePicker>`.
 * The prop surface mirrors the MUI `@dashforge/ui` `DateTimePicker`.
 */
/**
 * Subset of `<DateTimePicker>` props theme-configurable via
 * `theme.components.DateTimePicker.defaults` (Option C).
 */
export interface DateTimePickerVariantProps {
  layout?: 'stacked' | 'inline';
  weekStartDay?: WeekDay;
  locale?: string;
  stepMinutes?: number;
  hour12?: boolean;
  fullWidth?: boolean;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    DateTimePicker?: {
      defaults?: Partial<DateTimePickerVariantProps>;
      slotProps?: DateTimePickerSlotProps;
    };
  }
}

export interface DateTimePickerProps {
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
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Label/control layout. */
  layout?: 'stacked' | 'inline';
  /** Reactive visibility predicate evaluated against the form engine. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC access requirement. */
  access?: AccessRequirement;
  /** Controlled value — `"YYYY-MM-DDTHH:mm"` or `null`. */
  value?: string | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | null;
  /** Fired with the new datetime (or `null` when cleared). */
  onChange?: (value: string | null) => void;
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
  /** Step between time-list options, in minutes. Default `30`. */
  stepMinutes?: number;
  /** Render the time list in 12-hour notation. Default `false`. */
  hour12?: boolean;
  /** Stretches the field to its container width. */
  fullWidth?: boolean;
  /** Root-level Tailwind class override. */
  sx?: string;
  /** Per-slot `className` overrides. */
  slotProps?: DateTimePickerSlotProps;
  /** Test id applied to the field root. */
  testId?: string;
}
