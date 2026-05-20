import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  formatLongDate,
  resolveCalendarKey,
  useCalendar,
} from '@dashforge/calendar-core';
import type { ISODate } from '@dashforge/calendar-core';
import { useDashTheme } from '@dashforge/theme-core';
import type { CalendarProps } from './calendar.types';

// Inline Material-style 24×24 glyphs — no @mui/icons-material dependency.
const CHEVRON_LEFT_PATH = 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z';
const CHEVRON_RIGHT_PATH = 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z';

const DAY_CELL_SIZE = 36;

/**
 * `Calendar` — a standalone, inline month-grid date picker.
 *
 * The presentation layer (MUI primitives + Dashforge theme) over the
 * headless `useCalendar` engine from `@dashforge/calendar-core`. Implements
 * the WCAG grid pattern with roving tab-index focus.
 *
 * It is a primitive: no form-bridge or RBAC integration. Use `DatePicker`
 * for a form-bound date field.
 */
export function Calendar(props: CalendarProps) {
  const {
    value,
    defaultValue,
    onChange,
    month,
    year,
    defaultMonth,
    defaultYear,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    today,
    disabled = false,
    autoFocus = false,
    testId,
    'aria-label': ariaLabel = 'Calendar',
  } = props;

  const theme = useDashTheme();

  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ISODate | null>(
    defaultValue ?? null,
  );
  const selectedValue: ISODate | null = isValueControlled ? value : internalValue;

  const handleSelect = useCallback(
    (iso: ISODate) => {
      if (!isValueControlled) {
        setInternalValue(iso);
      }
      onChange?.(iso);
    },
    [isValueControlled, onChange],
  );

  const calendar = useCalendar({
    selected: selectedValue,
    month,
    year,
    defaultMonth,
    defaultYear,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    isDateDisabled,
    weekStartDay,
    locale,
    today,
    onSelect: handleSelect,
  });

  // Roving focus: the active day cell holds DOM focus; it is moved only
  // after a keyboard interaction (or on mount when `autoFocus`), never on
  // an incidental re-render.
  const focusedCellRef = useRef<HTMLButtonElement | null>(null);
  const shouldFocusRef = useRef(autoFocus);

  useEffect(() => {
    if (shouldFocusRef.current && focusedCellRef.current) {
      // `preventScroll`: the calendar is often rendered inside a popup that
      // the positioning layer (e.g. MUI Popper) has not placed yet when this
      // child effect runs. A plain `.focus()` would scroll the page to the
      // not-yet-positioned cell. The grid is compact and fully visible, so
      // suppressing the scroll is always correct here.
      focusedCellRef.current.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
  }, [calendar.focusedDate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      const action = resolveCalendarKey(event.key);
      if (action === null) {
        return;
      }
      event.preventDefault();
      shouldFocusRef.current = true;
      switch (action) {
        case 'select':
          calendar.selectDate(calendar.focusedDate);
          break;
        case 'monthForward':
          calendar.goToNextMonth();
          break;
        case 'monthBackward':
          calendar.goToPreviousMonth();
          break;
        default:
          calendar.navigate(action);
      }
    },
    [disabled, calendar],
  );

  const resolvedLocale = locale ?? 'en-US';
  const gridColumns = `repeat(7, ${String(DAY_CELL_SIZE)}px)`;

  return (
    <Box
      data-testid={testId}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: `${String(theme.spacing.unit)}px`,
        padding: `${String(theme.spacing.unit * 1.5)}px`,
        backgroundColor: theme.color.surface.canvas,
        border: `1px solid ${theme.color.border.subtle}`,
        borderRadius: `${String(theme.radius.lg)}px`,
        fontFamily: theme.typography.fontFamily,
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Header: month navigation + label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${String(theme.spacing.unit)}px`,
        }}
      >
        <IconButton
          size="small"
          disabled={disabled}
          aria-label="Previous month"
          onClick={() => {
            calendar.goToPreviousMonth();
          }}
          sx={{ color: theme.color.text.secondary }}
        >
          <SvgIcon fontSize="small">
            <path d={CHEVRON_LEFT_PATH} />
          </SvgIcon>
        </IconButton>
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
          {calendar.monthLabel}
        </Box>
        <IconButton
          size="small"
          disabled={disabled}
          aria-label="Next month"
          onClick={() => {
            calendar.goToNextMonth();
          }}
          sx={{ color: theme.color.text.secondary }}
        >
          <SvgIcon fontSize="small">
            <path d={CHEVRON_RIGHT_PATH} />
          </SvgIcon>
        </IconButton>
      </Box>

      {/* Grid */}
      <Box
        role="grid"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
      >
        <Box
          role="row"
          sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '2px' }}
        >
          {calendar.weekdayNames.map((dayName, index) => (
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

        {calendar.weeks.map((week) => (
          <Box
            key={week.key}
            role="row"
            sx={{
              display: 'grid',
              gridTemplateColumns: gridColumns,
              gap: '2px',
            }}
          >
            {week.days.map((day) => {
              const isActiveCell = day.iso === calendar.focusedDate;
              return (
                <Box key={day.iso} role="gridcell" sx={{ display: 'flex' }}>
                  <ButtonBase
                    disableRipple
                    ref={isActiveCell ? focusedCellRef : null}
                    tabIndex={isActiveCell ? 0 : -1}
                    disabled={disabled}
                    aria-label={formatLongDate(
                      { year: day.year, month: day.month, day: day.day },
                      resolvedLocale,
                    )}
                    aria-current={day.isToday ? 'date' : undefined}
                    aria-pressed={day.isSelected}
                    aria-disabled={day.isDisabled}
                    onClick={() => {
                      calendar.selectDate(day.iso);
                    }}
                    sx={{
                      width: DAY_CELL_SIZE,
                      height: DAY_CELL_SIZE,
                      borderRadius: `${String(theme.radius.md)}px`,
                      fontFamily: 'inherit',
                      fontSize: theme.typography.scale.sm,
                      fontWeight: day.isToday ? 700 : 400,
                      cursor: day.isDisabled ? 'default' : 'pointer',
                      color: day.isSelected
                        ? theme.color.text.inverse
                        : day.isDisabled || day.isSiblingMonth
                          ? theme.color.text.muted
                          : theme.color.text.primary,
                      backgroundColor: day.isSelected
                        ? theme.color.intent.primary
                        : 'transparent',
                      opacity: day.isDisabled ? 0.45 : 1,
                      outline:
                        day.isToday && !day.isSelected
                          ? `1px solid ${theme.color.border.focus}`
                          : 'none',
                      outlineOffset: '-1px',
                      transition: 'background-color 120ms ease',
                      '&:hover': {
                        backgroundColor:
                          day.isDisabled || day.isSelected
                            ? undefined
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
  );
}
