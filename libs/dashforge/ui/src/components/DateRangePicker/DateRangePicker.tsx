import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import SvgIcon from '@mui/material/SvgIcon';
import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { alpha } from '@mui/material/styles';
import { useContext, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import {
  formatLongDate,
  parseISODate,
  resolveCalendarKey,
  useDateRange,
} from '@dashforge/calendar-core';
import type { DateRange, ISODate, WeekDay } from '@dashforge/calendar-core';
import { useAccessState } from '../../hooks/useAccessState';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import { resolveValidationState } from '../TextField/textField.validation';
import type { DateRangePickerProps } from './dateRangePicker.types';

// Inline Material-style 24×24 glyphs — no @mui/icons-material dependency.
const CALENDAR_ICON_PATH =
  'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 ' +
  '2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z';
const CHEVRON_LEFT_PATH = 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z';
const CHEVRON_RIGHT_PATH = 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z';

// MUI's modal/popover z-index band.
const POPPER_Z_INDEX = 1300;
const DAY_CELL_SIZE = 36;

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * Formats a stored ISO date for the read-only input display, localized to a
 * medium date style (e.g. `"May 20, 2026"`). Formatting is done in UTC so the
 * displayed day always matches the stored `YYYY-MM-DD`.
 */
function formatEndpoint(iso: ISODate | null, locale: string): string {
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

function formatRange(range: DateRange, locale: string): string {
  const start = formatEndpoint(range.start, locale);
  const end = formatEndpoint(range.end, locale);
  if (start === '') {
    return '';
  }
  return end === '' ? start : `${start} – ${end}`;
}

interface RangeCalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: ISODate;
  maxDate?: ISODate;
  disabledDates?: readonly ISODate[];
  isDateDisabled?: (date: ISODate) => boolean;
  weekStartDay?: WeekDay;
  locale?: string;
  autoFocus?: boolean;
}

/**
 * The dual-month range grid rendered inside the `DateRangePicker` popup.
 * Presentation layer over the headless `useDateRange` engine.
 */
function RangeCalendar(props: RangeCalendarProps) {
  const {
    value,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    autoFocus = false,
  } = props;
  const theme = useDashTheme();

  const range = useDateRange({
    value,
    onChange,
    monthCount: 2,
    ...(minDate !== undefined && { minDate }),
    ...(maxDate !== undefined && { maxDate }),
    ...(disabledDates !== undefined && { disabledDates }),
    ...(isDateDisabled !== undefined && { isDateDisabled }),
    ...(weekStartDay !== undefined && { weekStartDay }),
    ...(locale !== undefined && { locale }),
  });

  // Roving focus: the active day cell holds DOM focus; moved only after a
  // keyboard interaction (or on mount when `autoFocus`).
  const focusedCellRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusRef = useRef(autoFocus);
  useEffect(() => {
    if (shouldFocusRef.current && focusedCellRef.current) {
      focusedCellRef.current.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
  }, [range.focusedDate]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = resolveCalendarKey(event.key);
    if (action === null) {
      return;
    }
    event.preventDefault();
    shouldFocusRef.current = true;
    switch (action) {
      case 'select':
        range.selectDate(range.focusedDate);
        break;
      case 'monthForward':
        range.goToNextMonth();
        break;
      case 'monthBackward':
        range.goToPreviousMonth();
        break;
      default:
        range.navigate(action);
    }
  };

  const resolvedLocale = locale ?? 'en-US';
  const gridColumns = `repeat(7, ${String(DAY_CELL_SIZE)}px)`;
  const bandColor = alpha(theme.color.intent.primary, 0.14);
  const lastIndex = range.months.length - 1;

  return (
    <Box
      onKeyDown={handleKeyDown}
      onMouseLeave={() => {
        range.hoverDate(null);
      }}
      sx={{
        display: 'flex',
        gap: `${String(theme.spacing.unit * 2)}px`,
        padding: `${String(theme.spacing.unit * 1.5)}px`,
        backgroundColor: theme.color.surface.canvas,
        fontFamily: theme.typography.fontFamily,
        userSelect: 'none',
      }}
    >
      {range.months.map((monthView, monthIndex) => (
        <Box
          key={`${String(monthView.year)}-${String(monthView.month)}`}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${String(theme.spacing.unit)}px`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${String(theme.spacing.unit)}px`,
            }}
          >
            {monthIndex === 0 ? (
              <IconButton
                size="small"
                aria-label="Previous month"
                onClick={() => {
                  range.goToPreviousMonth();
                }}
                sx={{ color: theme.color.text.secondary }}
              >
                <SvgIcon fontSize="small">
                  <path d={CHEVRON_LEFT_PATH} />
                </SvgIcon>
              </IconButton>
            ) : (
              <Box sx={{ width: 30 }} />
            )}
            <Box
              aria-live="polite"
              sx={{
                flex: 1,
                textAlign: 'center',
                fontSize: theme.typography.scale.sm,
                fontWeight: 600,
                color: theme.color.text.primary,
              }}
            >
              {monthView.monthLabel}
            </Box>
            {monthIndex === lastIndex ? (
              <IconButton
                size="small"
                aria-label="Next month"
                onClick={() => {
                  range.goToNextMonth();
                }}
                sx={{ color: theme.color.text.secondary }}
              >
                <SvgIcon fontSize="small">
                  <path d={CHEVRON_RIGHT_PATH} />
                </SvgIcon>
              </IconButton>
            ) : (
              <Box sx={{ width: 30 }} />
            )}
          </Box>

          <Box
            role="grid"
            aria-label="Choose date range"
            sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <Box
              role="row"
              sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '2px' }}
            >
              {range.weekdayNames.map((dayName, index) => (
                <Box
                  key={`weekday-${String(index)}`}
                  role="columnheader"
                  sx={{
                    textAlign: 'center',
                    fontSize: theme.typography.scale.xs,
                    fontWeight: 600,
                    color: theme.color.text.muted,
                    paddingY: '4px',
                  }}
                >
                  {dayName}
                </Box>
              ))}
            </Box>

            {monthView.weeks.map((week) => (
              <Box
                key={week.key}
                role="row"
                sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '2px' }}
              >
                {week.days.map((day) => {
                  const isActiveCell = day.iso === range.focusedDate;
                  const isEndpoint = day.isRangeStart || day.isRangeEnd;
                  const inBand = day.isInRange || day.isRangePreview;
                  return (
                    <Box key={day.iso} role="gridcell" sx={{ display: 'flex' }}>
                      <ButtonBase
                        disableRipple
                        ref={isActiveCell ? focusedCellRef : null}
                        tabIndex={isActiveCell ? 0 : -1}
                        aria-label={formatLongDate(
                          { year: day.year, month: day.month, day: day.day },
                          resolvedLocale,
                        )}
                        aria-current={day.isToday ? 'date' : undefined}
                        aria-pressed={isEndpoint}
                        aria-disabled={day.isDisabled}
                        onClick={() => {
                          range.selectDate(day.iso);
                        }}
                        onMouseEnter={() => {
                          range.hoverDate(day.iso);
                        }}
                        sx={{
                          width: DAY_CELL_SIZE,
                          height: DAY_CELL_SIZE,
                          borderRadius: `${String(theme.radius.md)}px`,
                          fontFamily: 'inherit',
                          fontSize: theme.typography.scale.sm,
                          fontWeight: day.isToday ? 700 : 400,
                          cursor: day.isDisabled ? 'default' : 'pointer',
                          color: isEndpoint
                            ? theme.color.text.inverse
                            : day.isDisabled || day.isSiblingMonth
                              ? theme.color.text.muted
                              : theme.color.text.primary,
                          backgroundColor: isEndpoint
                            ? theme.color.intent.primary
                            : inBand
                              ? bandColor
                              : 'transparent',
                          opacity: day.isDisabled ? 0.45 : 1,
                          outline:
                            day.isToday && !isEndpoint
                              ? `1px solid ${theme.color.border.focus}`
                              : 'none',
                          outlineOffset: '-1px',
                          transition: 'background-color 120ms ease',
                          '&:hover': {
                            backgroundColor:
                              day.isDisabled || isEndpoint
                                ? undefined
                                : inBand
                                  ? bandColor
                                  : theme.color.surface.elevated,
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.color.border.focus}`,
                            outlineOffset: '-2px',
                          },
                        }}
                      >
                        {day.day}
                      </ButtonBase>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * `DateRangePicker` — a form-bound start/end date field.
 *
 * A read-only text input paired with a dual-month range calendar popup,
 * built on the headless `useDateRange` engine. Integrates with the Dashforge
 * form bridge, RBAC, and `FieldLayoutShell`.
 *
 * Storage contract: a `{ start, end }` pair of ISO `YYYY-MM-DD` dates.
 */
export function DateRangePicker(props: DateRangePickerProps) {
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

  const effectiveLayout: 'stacked' | 'inline' =
    layout === 'floating' ? 'stacked' : layout;
  if (
    process.env.NODE_ENV !== 'production' &&
    layout === 'floating' &&
    typeof console !== 'undefined'
  ) {
    console.warn(
      '[Dashforge DateRangePicker] layout="floating" is not supported; using "stacked".',
    );
  }

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;
  const dashTheme = useDashTheme();
  useDashFieldMeta(name);
  const isVisible = useEngineVisibility(engine, visibleWhen);
  const accessState = useAccessState(access);

  const [internalValue, setInternalValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
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

  let resolvedValue: DateRange;
  let resolvedError: boolean;
  let resolvedHelperText: ReactNode;
  let registrationRef: ((instance: unknown) => void) | undefined;
  let commitValue: (next: DateRange) => void;
  let markTouched: () => void;

  if (bridge !== null && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);
    registrationRef = registration.ref;
    const bridgeValue =
      (bridge.getValue(name) as DateRange | null | undefined) ?? null;
    resolvedValue = value ?? bridgeValue ?? EMPTY_RANGE;
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
    commitValue = (next: DateRange) => {
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
          (bridge.getValue(name) as DateRange | null | undefined) ?? null;
        void registration.onBlur({
          target: { name, value: committed },
          type: 'blur',
        });
      }
    };
  } else {
    resolvedValue = value ?? internalValue;
    resolvedError = Boolean(error);
    resolvedHelperText = helperText;
    registrationRef = undefined;
    commitValue = (next: DateRange) => {
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
  const handleRangeChange = (next: DateRange) => {
    commitValue(next);
    if (next.start !== null && next.end !== null) {
      closePopup(true);
    }
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

  const displayValue = formatRange(resolvedValue, resolvedLocale);

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
            aria-label="Choose date range"
            onKeyDown={handlePopperKeyDown}
            sx={{ borderRadius: `${String(dashTheme.radius.lg)}px` }}
          >
            <RangeCalendar
              value={resolvedValue}
              onChange={handleRangeChange}
              {...(minDate !== undefined && { minDate })}
              {...(maxDate !== undefined && { maxDate })}
              {...(disabledDates !== undefined && { disabledDates })}
              {...(isDateDisabled !== undefined && { isDateDisabled })}
              {...(weekStartDay !== undefined && { weekStartDay })}
              {...(locale !== undefined && { locale })}
              autoFocus
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
