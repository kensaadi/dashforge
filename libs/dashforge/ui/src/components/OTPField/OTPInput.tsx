import { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { OTPInputProps } from './otpField.types';
import { isValidChar, parsePasteContent } from './otpField.logic';
import { getSlotStyles, getSlotsContainerStyles } from './otpField.styles';

/**
 * INTERNAL COMPONENT - NOT EXPORTED
 *
 * OTPInput primitive handles slot rendering, caret synchronization, and user input.
 *
 * Active slot strategy: `activeSlot` is a React state so that arrow key navigation
 * and any caret move that does NOT change `value` still triggers a re-render and
 * updates the visual highlight. `setCaretToSlot` keeps the hidden DOM input in sync.
 * `isFocused` gates the highlight — no slot appears active when the field is blurred.
 */
export function OTPInput(props: OTPInputProps): React.ReactElement {
  const {
    value,
    onChange,
    onBlur,
    length,
    mode,
    disabled = false,
    autoFocus = true,
    onComplete,
    error = false,
    inputProps = {},
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Sync DOM caret to the desired slot (WRITE only — does not trigger re-render)
   */
  const setCaretToSlot = (slotIndex: number) => {
    const input = inputRef.current;
    if (!input) return;
    const position = Math.max(0, Math.min(slotIndex, length - 1));
    input.setSelectionRange(position, position);
  };

  /**
   * Move both the visual highlight and the DOM caret to a slot.
   * Use this for any navigation that does NOT change `value`.
   */
  const moveTo = (slotIndex: number) => {
    const clamped = Math.max(0, Math.min(slotIndex, length - 1));
    setActiveSlot(clamped);
    setCaretToSlot(clamped);
  };

  /**
   * Handle character input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    let sanitized = '';
    for (const char of newValue) {
      if (isValidChar(char, mode)) {
        sanitized += char;
      }
    }
    sanitized = sanitized.slice(0, length);

    onChange(sanitized);
    // Advance highlight to next empty slot (or stay at last)
    setActiveSlot(Math.min(sanitized.length, length - 1));

    if (sanitized.length === length && onComplete) {
      onComplete(sanitized);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;

    const currentPos = input.selectionStart ?? 0;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveTo(Math.max(0, currentPos - 1));
        break;

      case 'ArrowRight':
        e.preventDefault();
        moveTo(Math.min(length - 1, currentPos + 1));
        break;

      case 'Home':
        e.preventDefault();
        moveTo(0);
        break;

      case 'End':
        e.preventDefault();
        moveTo(value.length); // moveTo clamps to length-1
        break;

      case 'Backspace': {
        const effectivePos = Math.min(currentPos, value.length);
        if (effectivePos > 0) {
          e.preventDefault();
          const newValue =
            value.slice(0, effectivePos - 1) + value.slice(effectivePos);
          onChange(newValue);
          setActiveSlot(effectivePos - 1);
          setTimeout(() => setCaretToSlot(effectivePos - 1), 0);
        }
        break;
      }

      case 'Delete':
        if (currentPos < value.length) {
          e.preventDefault();
          const newValue =
            value.slice(0, currentPos) + value.slice(currentPos + 1);
          onChange(newValue);
          // Slot stays at currentPos — the next char shifts into view
          setActiveSlot(Math.min(currentPos, length - 1));
          setTimeout(() => setCaretToSlot(currentPos), 0);
        }
        break;

      default:
        break;
    }
  };

  /**
   * Handle paste events
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const input = inputRef.current;
    if (!input) return;

    const currentPos = input.selectionStart ?? 0;
    const clipboardData = e.clipboardData.getData('text');
    const pasteResult = parsePasteContent(clipboardData, mode, length);

    if (pasteResult.valid && pasteResult.sanitized.length > 0) {
      const beforeCaret = value.slice(0, currentPos);
      const afterCaret = value.slice(currentPos);
      const combined = beforeCaret + pasteResult.sanitized + afterCaret;
      const newValue = combined.slice(0, length);

      onChange(newValue);

      const newCaretPos = Math.min(
        currentPos + pasteResult.sanitized.length,
        length - 1
      );
      setActiveSlot(newCaretPos);
      setTimeout(() => setCaretToSlot(newCaretPos), 0);

      if (newValue.length === length && onComplete) {
        onComplete(newValue);
      }
    }
  };

  /**
   * Handle click on visual slot
   */
  const handleSlotClick = (slotIndex: number) => {
    inputRef.current?.focus();
    // handleFocus fires synchronously inside focus() and snaps to value.length;
    // we override immediately after to the clicked slot.
    moveTo(slotIndex);
  };

  /**
   * Handle focus: snap to first empty slot
   */
  const handleFocus = () => {
    setIsFocused(true);
    const snapTo = Math.min(value.length, length - 1);
    setActiveSlot(snapTo);
    setCaretToSlot(snapTo);
  };

  /**
   * Handle blur
   */
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Visually hidden but accessible native input */}
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        inputMode={mode === 'numeric' ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={length}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />

      {/* Visual slot display (decorative) */}
      <Box
        role="presentation"
        aria-hidden="true"
        sx={getSlotsContainerStyles()}
      >
        {Array.from({ length }, (_, i) => (
          <Box
            key={i}
            onClick={() => !disabled && handleSlotClick(i)}
            sx={getSlotStyles(isFocused && i === activeSlot, error, disabled)}
          >
            {value[i] || ''}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
