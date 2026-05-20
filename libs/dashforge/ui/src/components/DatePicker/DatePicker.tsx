import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import { parseISODate } from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { useAccessState } from '../../hooks/useAccessState';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import { resolveValidationState } from '../TextField/textField.validation';
import { Calendar } from '../Calendar/Calendar';
import type { DatePickerProps } from './datePicker.types';

// Inline Material-style 24×24 calendar glyph — no @mui/icons-material dependency.
const CALENDAR_ICON_PATH =
  'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 ' +
  '2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z';

// MUI's modal/popover z-index band.
const POPPER_Z_INDEX = 1300;

/**
 * Formats a stored ISO date for the read-only input display, localized to a
 * medium date style (e.g. `"May 20, 2026"`). Formatting is done in UTC so
 * the displayed day always matches the stored `YYYY-MM-DD`.
 */
function formatDisplayDate(iso: ISODate | null, locale: string): string {
  if (iso === null || iso === '') {
    return '';
  }
  const parts = parseISODate(iso);
  if (parts === null) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(Date.UTC(parts.year, parts.month - 1, parts.day));
}

/**
 * `DatePicker` — a form-bound single-date field.
 *
 * A read-only text input paired with a `Calendar` popup. Integrates with the
 * Dashforge form bridge, RBAC, and `FieldLayoutShell`, mirroring the other
 * `@dashforge/ui` form fields.
 *
 * Storage contract: an ISO `YYYY-MM-DD` string, or `null`.
 *
 * Behavior:
 * - Inside a `DashForm` → registers via the `DashFormBridge`.
 * - Outside → behaves as a controlled/uncontrolled component.
 * - Reactive visibility via `visibleWhen`; error gating (Form Closure v1).
 */
export function DatePicker(props: DatePickerProps) {
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
    fullWidth,
    testId,
  } = props;

  // The input is paired with a popup; a floating label would collide with
  // the end-adornment icon, so `floating` is downgraded to `stacked`.
  const effectiveLayout: 'stacked' | 'inline' =
    layout === 'floating' ? 'stacked' : layout;
  if (
    process.env.NODE_ENV !== 'production' &&
    layout === 'floating' &&
    typeof console !== 'undefined'
  ) {
    console.warn(
      '[Dashforge DatePicker] layout="floating" is not supported; using "stacked".',
    );
  }

  // All hooks unconditionally at the top, before any early return.
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();
  useDashFieldMeta(name);
  const isVisible = useEngineVisibility(engine, visibleWhen);
  const accessState = useAccessState(access);

  const [internalValue, setInternalValue] = useState<ISODate | null>(
    defaultValue ?? null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Release bridge registration on REAL unmount only — bridge identity
  // changes on every keystroke, so cleanup must not re-run on deps changes.
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: capturedBridge, name: capturedName } =
        unregisterRef.current;
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

  // Resolve the value source, validation, and write paths for either the
  // bridge-bound or the standalone mode.
  let resolvedValue: ISODate | null;
  let resolvedError: boolean;
  let resolvedHelperText: ReactNode;
  let registrationRef: ((instance: unknown) => void) | undefined;
  let commitValue: (next: ISODate | null) => void;
  let markTouched: () => void;

  if (bridge !== null && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);
    registrationRef = registration.ref;
    const bridgeValue =
      (bridge.getValue(name) as ISODate | null | undefined) ?? null;
    resolvedValue = value !== undefined ? value : bridgeValue;
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    commitValue = (next: ISODate | null) => {
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
        // Read the freshest committed value straight from the bridge — NOT
        // the `resolvedValue` captured in this render's closure, which is
        // stale immediately after a selection and would otherwise revert the
        // field back to its pre-selection value.
        const committed =
          (bridge.getValue(name) as ISODate | null | undefined) ?? null;
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
    commitValue = (next: ISODate | null) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      if (onChange) {
        onChange(next);
      }
    };
    markTouched = () => undefined;
  }

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
  const handleCalendarChange = (next: ISODate) => {
    commitValue(next);
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

  const displayValue = formatDisplayDate(resolvedValue, resolvedLocale);

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
            // A click on the field itself (text input or calendar icon) is
            // already handled by their own click handlers — do not also treat
            // it as a "click away", or the icon toggle would be double-acted.
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
            aria-label="Choose date"
            onKeyDown={handlePopperKeyDown}
            sx={{ borderRadius: `${String(dashTheme.radius.lg)}px` }}
          >
            <Calendar
              value={resolvedValue}
              onChange={handleCalendarChange}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              isDateDisabled={isDateDisabled}
              weekStartDay={weekStartDay}
              locale={locale}
              autoFocus
              aria-label="Choose date"
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );

  return (
    <FieldLayoutShell
      layout={effectiveLayout}
      label={label}
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
