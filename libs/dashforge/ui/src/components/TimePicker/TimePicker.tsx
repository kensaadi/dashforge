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
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useDashTheme } from '@dashforge/theme-core';
import {
  formatTime,
  generateTimeOptions,
  parseTimeString,
  timeStringToMinutes,
} from '@dashforge/calendar-core';
import { useAccessState } from '../../hooks/useAccessState';
import { FieldLayoutShell } from '../_internal/FieldLayoutShell';
import { resolveValidationState } from '../TextField/textField.validation';
import type { TimePickerProps } from './timePicker.types';

// Inline Material-style 24×24 clock glyph — no @mui/icons-material dependency.
const CLOCK_ICON_PATH =
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 ' +
  '11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l' +
  '5.25 3.15.75-1.23-4.5-2.67z';

// MUI's modal/popover z-index band.
const POPPER_Z_INDEX = 1300;
const LISTBOX_MAX_HEIGHT = 264;

/**
 * `TimePicker` — a form-bound time-of-day field.
 *
 * A text input paired with a dropdown of time options. Free-typed input is
 * normalized via `parseTimeString` on blur / Enter; the dropdown lists evenly
 * spaced slots from `generateTimeOptions`. Integrates with the Dashforge form
 * bridge, RBAC, and `FieldLayoutShell`.
 *
 * Storage contract: a canonical 24-hour `"HH:mm"` string, or `null`. 12-hour
 * notation (`hour12`) is display-only.
 */
export function TimePicker(props: TimePickerProps) {
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
    minTime,
    maxTime,
    stepMinutes,
    hour12 = false,
    fullWidth,
    testId,
  } = props;

  // The input is paired with a dropdown; a floating label would collide with
  // the end-adornment icon, so `floating` is downgraded to `stacked`.
  const effectiveLayout: 'stacked' | 'inline' =
    layout === 'floating' ? 'stacked' : layout;
  if (
    process.env.NODE_ENV !== 'production' &&
    layout === 'floating' &&
    typeof console !== 'undefined'
  ) {
    console.warn(
      '[Dashforge TimePicker] layout="floating" is not supported; using "stacked".',
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
  // `draft` is the in-progress editable text; `null` means "not editing" and
  // the input shows the formatted committed value.
  const [draft, setDraft] = useState<string | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Release bridge registration on REAL unmount only.
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

  const minMinutes = timeStringToMinutes(minTime ?? '00:00') ?? 0;
  const maxMinutes = timeStringToMinutes(maxTime ?? '23:59') ?? 1439;
  const isTimeDisabled = (time: string): boolean => {
    const minutes = timeStringToMinutes(time);
    return minutes === null || minutes < minMinutes || minutes > maxMinutes;
  };

  const options = generateTimeOptions({
    ...(minTime !== undefined && { start: minTime }),
    ...(maxTime !== undefined && { end: maxTime }),
    ...(stepMinutes !== undefined && { stepMinutes }),
  });

  const displayValue =
    draft !== null ? draft : formatTime(resolvedValue ?? '', { hour12 });

  const closePopup = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus && triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
    }
  };

  // Parse the editable draft: commit a valid time, clear to `null` on an
  // empty draft, otherwise discard (the input reverts to the committed value).
  const commitDraft = () => {
    if (draft === null) {
      return;
    }
    const parsed = parseTimeString(draft);
    if (parsed !== null && !isTimeDisabled(parsed)) {
      commitValue(parsed);
    } else if (draft.trim() === '') {
      commitValue(null);
    }
    setDraft(null);
  };

  const handleSelectOption = (time: string) => {
    setDraft(null);
    commitValue(time);
    closePopup(true);
    markTouched();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isInteractive) {
      setDraft(event.target.value);
    }
  };
  const handleInputFocus = () => {
    if (isInteractive) {
      setDraft(formatTime(resolvedValue ?? '', { hour12 }));
    }
  };
  const handleInputBlur = () => {
    commitDraft();
    markTouched();
  };
  const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePopup(false);
    }
  };
  const togglePopup = () => {
    if (isInteractive) {
      setIsOpen((open) => !open);
    }
  };

  const slotProps = {
    input: {
      readOnly: !isInteractive,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            ref={triggerRef}
            size="small"
            edge="end"
            disabled={effectiveDisabled}
            aria-label="Open time list"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={(event) => {
              event.stopPropagation();
              togglePopup();
            }}
          >
            <SvgIcon fontSize="small">
              <path d={CLOCK_ICON_PATH} />
            </SvgIcon>
          </IconButton>
        </InputAdornment>
      ),
    },
    htmlInput: {
      'aria-haspopup': 'listbox',
      'aria-expanded': isOpen,
      ...(registrationRef ? { ref: registrationRef } : {}),
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
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
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
            role="listbox"
            aria-label="Time options"
            sx={{
              maxHeight: LISTBOX_MAX_HEIGHT,
              overflowY: 'auto',
              minWidth: anchorRef.current?.offsetWidth,
              borderRadius: `${String(dashTheme.radius.lg)}px`,
            }}
          >
            <MenuList disablePadding>
              {options.map((time) => (
                <MenuItem
                  key={time}
                  role="option"
                  aria-selected={time === resolvedValue}
                  selected={time === resolvedValue}
                  disabled={isTimeDisabled(time)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    handleSelectOption(time);
                  }}
                >
                  {formatTime(time, { hour12 })}
                </MenuItem>
              ))}
            </MenuList>
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
