import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import SvgIcon from '@mui/material/SvgIcon';
import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useContext, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import {
  formatTime,
  generateTimeOptions,
  getTodayISODate,
  parseISODate,
} from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { useAccessState } from '../../hooks/useAccessState';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import { resolveValidationState } from '../TextField/textField.validation';
import { Calendar } from '../Calendar/Calendar';
import type { DateTimePickerProps } from './dateTimePicker.types';

// Inline Material-style 24×24 calendar glyph — no @mui/icons-material dependency.
const CALENDAR_ICON_PATH =
  'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 ' +
  '2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z';

// MUI's modal/popover z-index band.
const POPPER_Z_INDEX = 1300;
const TIME_LIST_MAX_HEIGHT = 320;

const DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/;

/** Splits a stored `YYYY-MM-DDTHH:mm` value into its date and time parts. */
function splitDateTime(value: string | null | undefined): {
  date: ISODate | null;
  time: string | null;
} {
  if (value === null || value === undefined || value === '') {
    return { date: null, time: null };
  }
  const match = DATETIME_PATTERN.exec(value);
  if (match !== null) {
    return {
      date: match[1] ?? null,
      time: `${match[2] ?? '00'}:${match[3] ?? '00'}`,
    };
  }
  return { date: parseISODate(value) !== null ? value : null, time: null };
}

/** Combines a date and a time into a `YYYY-MM-DDTHH:mm` value (or `null`). */
function joinDateTime(date: ISODate | null, time: string | null): string | null {
  if (date === null && time === null) {
    return null;
  }
  return `${date ?? getTodayISODate()}T${time ?? '00:00'}`;
}

/** Formats a stored datetime for the read-only input display. */
function formatDateTime(
  value: string | null,
  locale: string,
  hour12: boolean,
): string {
  const { date, time } = splitDateTime(value);
  const parts: string[] = [];
  if (date !== null) {
    const parsed = parseISODate(date);
    parts.push(
      parsed === null
        ? date
        : new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeZone: 'UTC',
          }).format(Date.UTC(parsed.year, parsed.month - 1, parsed.day)),
    );
  }
  if (time !== null) {
    parts.push(formatTime(time, { hour12 }));
  }
  return parts.join(', ');
}

/**
 * `DateTimePicker` — a form-bound date + time field.
 *
 * A read-only text input paired with a popup combining a `Calendar` and a
 * time list. Integrates with the Dashforge form bridge, RBAC, and
 * `FieldLayoutShell`.
 *
 * Storage contract: a naive ISO datetime `"YYYY-MM-DDTHH:mm"` — no seconds,
 * no timezone. For a date-only field use `DatePicker`; for time-only use
 * `TimePicker`.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    name,
    rules,
    label,
    helperText,
    error,
    required,
    disabled,
    placeholder,
    layout = 'stacked',
    tooltip,
    visibleWhen,
    access,
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    stepMinutes,
    hour12 = false,
    fullWidth,
    testId,
  } = props;

  const effectiveLayout: 'stacked' | 'inline' =
    layout === 'floating' ? 'stacked' : layout;
  if (
    process.env.NODE_ENV !== 'production' &&
    layout === 'floating' &&
    typeof console !== 'undefined'
  ) {
    console.warn(
      '[Dashforge DateTimePicker] layout="floating" is not supported; using "stacked".',
    );
  }

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();
  useDashFieldMeta(name);
  const isVisible = useEngineVisibility(engine, visibleWhen);
  const accessState = useAccessState(access);

  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: capturedBridge, name: capturedName } =
        unregisterRef.current;
      // BUG 22: only release bridge state on unmount if the form
      // is configured to forget unmounted fields. Default `false`
      // keeps values in RHF so <Stepper> / tab-swap patterns can
      // read earlier answers back on later steps. See README-BUG.md § BUG 22.
      if (!capturedBridge?.shouldUnregister) return;
      queueMicrotask(() => {
        if (!isMountedRef.current) {
          capturedBridge?.unregister?.(capturedName);
        }
      });
    };
  }, []);

  if (!isVisible) {
    return null;
  }
  if (!accessState.visible) {
    return null;
  }

  const effectiveDisabled = Boolean(disabled) || accessState.disabled;
  const isInteractive = !effectiveDisabled && !accessState.readonly;
  const resolvedLocale = locale ?? 'en-US';
  const fieldId = `dashforge-field-${name}`;

  let resolvedValue: string | null;
  let resolvedError: boolean;
  let resolvedHelperText: ReactNode;
  let registrationRef: ((instance: unknown) => void) | undefined;
  let commitValue: (next: string | null) => void;
  let markTouched: () => void;

  if (bridge !== null && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);
    registrationRef = registration.ref;
    const bridgeValue =
      (bridge.getValue(name) as string | null | undefined) ?? null;
    resolvedValue = value !== undefined ? value : bridgeValue;
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    commitValue = (next: string | null) => {
      const syntheticEvent = { target: { name, value: next }, type: 'change' };
      if (registration.onChange) {
        void registration.onChange(syntheticEvent);
      }
      if (bridge.setValue) {
        bridge.setValue(name, next);
      }
      if (onChange) {
        onChange(next);
      }
    };
    markTouched = () => {
      if (registration.onBlur) {
        const committed =
          (bridge.getValue(name) as string | null | undefined) ?? null;
        void registration.onBlur({
          target: { name, value: committed },
          type: 'blur',
        });
      }
    };
  } else {
    resolvedValue = value !== undefined ? value : internalValue;
    resolvedError = Boolean(error);
    resolvedHelperText = helperText;
    registrationRef = undefined;
    commitValue = (next: string | null) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      if (onChange) {
        onChange(next);
      }
    };
    markTouched = () => undefined;
  }

  const { date, time } = splitDateTime(resolvedValue);
  const options = generateTimeOptions({
    ...(stepMinutes !== undefined && { stepMinutes }),
  });

  const closePopup = (returnFocus: boolean) => {
    setIsOpen(false);
    markTouched();
    if (returnFocus && triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
    }
  };
  const openPopup = () => {
    if (isInteractive) {
      setIsOpen(true);
    }
  };
  const togglePopup = () => {
    if (!isInteractive) {
      return;
    }
    if (isOpen) {
      closePopup(false);
    } else {
      setIsOpen(true);
    }
  };
  // Picking a date keeps the popup open — the user still needs a time.
  const handleDateSelect = (nextDate: ISODate) => {
    commitValue(joinDateTime(nextDate, time));
  };
  // Picking a time completes the value and closes the popup.
  const handleTimeSelect = (nextTime: string) => {
    commitValue(joinDateTime(date, nextTime));
    closePopup(true);
  };
  const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      setIsOpen(true);
    }
  };
  const handlePopperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePopup(true);
    }
  };

  const displayValue = formatDateTime(resolvedValue, resolvedLocale, hour12);

  const slotProps = {
    input: {
      readOnly: true,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            ref={triggerRef}
            size="small"
            edge="end"
            disabled={effectiveDisabled}
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={(event) => {
              event.stopPropagation();
              togglePopup();
            }}
          >
            <SvgIcon fontSize="small">
              <path d={CALENDAR_ICON_PATH} />
            </SvgIcon>
          </IconButton>
        </InputAdornment>
      ),
    },
    htmlInput: {
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      ...(registrationRef ? { ref: registrationRef } : {}),
      style: { cursor: isInteractive ? 'pointer' : 'default' },
    },
  } as MuiTextFieldProps['slotProps'];

  const control = (
    <Box
      ref={anchorRef}
      data-testid={testId}
      sx={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <MuiTextField
        name={name}
        id={fieldId}
        value={displayValue}
        placeholder={placeholder}
        error={resolvedError}
        disabled={effectiveDisabled}
        fullWidth={fullWidth}
        label={undefined}
        helperText={undefined}
        onClick={openPopup}
        onKeyDown={handleInputKeyDown}
        slotProps={slotProps}
      />
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: POPPER_Z_INDEX }}
        modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            const target = event.target;
            if (
              anchorRef.current &&
              target instanceof Node &&
              anchorRef.current.contains(target)
            ) {
              return;
            }
            closePopup(false);
          }}
        >
          <Paper
            elevation={8}
            role="dialog"
            aria-label="Choose date and time"
            onKeyDown={handlePopperKeyDown}
            sx={{
              display: 'flex',
              borderRadius: `${String(dashTheme.radius.lg)}px`,
            }}
          >
            <Calendar
              value={date}
              onChange={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              isDateDisabled={isDateDisabled}
              weekStartDay={weekStartDay}
              locale={locale}
              autoFocus
              aria-label="Choose date"
            />
            <Box
              role="listbox"
              aria-label="Time options"
              sx={{
                maxHeight: TIME_LIST_MAX_HEIGHT,
                minWidth: 100,
                overflowY: 'auto',
                borderLeft: `1px solid ${dashTheme.color.border.subtle}`,
              }}
            >
              <MenuList disablePadding>
                {options.map((option) => (
                  <MenuItem
                    key={option}
                    role="option"
                    aria-selected={option === time}
                    selected={option === time}
                    onClick={() => {
                      handleTimeSelect(option);
                    }}
                  >
                    {formatTime(option, { hour12 })}
                  </MenuItem>
                ))}
              </MenuList>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );

  return (
    <FieldLayoutShell
      layout={effectiveLayout}
      label={label}
      tooltip={tooltip}
      required={required}
      helperText={resolvedHelperText}
      error={resolvedError}
      disabled={effectiveDisabled}
      htmlFor={fieldId}
      fullWidth={fullWidth}
      theme={dashTheme}
    >
      {control}
    </FieldLayoutShell>
  );
}
