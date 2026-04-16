import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import type { OTPInputProps } from './otpField.types';
import { isValidChar, parsePasteContent } from './otpField.logic';
import { getSlotStyles, getSlotsContainerStyles } from './otpField.styles';

/**
 * INTERNAL COMPONENT - NOT EXPORTED
 *
 * OTPInput primitive handles slot rendering, caret synchronization, and user input.
 *
 * CRITICAL: The native input's selectionStart/selectionEnd are the ONLY source of truth
 * for which visual slot is highlighted. NO independent focus state exists.
 */
export function OTPInput(props: OTPInputProps): React.ReactElement {
  const {
    value,
    onChange,
    onBlur,
    length,
    mode,
    disabled = false,
    autoFocus = false,
    onComplete,
    error = false,
    inputProps = {},
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * CRITICAL: Derive active slot index from input caret (READ from DOM)
   * NO useState or useRef caching - always read fresh from DOM
   */
  const getActiveSlotIndex = (): number => {
    const input = inputRef.current;
    if (!input) return 0;
    // selectionStart is the caret position (0-indexed)
    // Clamp to valid slot range
    return Math.min(input.selectionStart ?? 0, length - 1);
  };

  /**
   * CRITICAL: Sync input caret to desired slot index (WRITE to DOM)
   * Only way to change which slot is visually active
   */
  const setCaretToSlot = (slotIndex: number) => {
    const input = inputRef.current;
    if (!input) return;
    // Clamp only to valid slot bounds, NOT value.length
    // This allows clicking/moving to empty future slots
    const position = Math.max(0, Math.min(slotIndex, length - 1));
    input.setSelectionRange(position, position);
  };

  /**
   * Handle character input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Sanitize based on mode
    let sanitized = '';
    for (const char of newValue) {
      if (isValidChar(char, mode)) {
        sanitized += char;
      }
    }

    // Truncate to max length
    sanitized = sanitized.slice(0, length);

    // Update value
    onChange(sanitized);

    // Check for completion
    if (sanitized.length === length && onComplete) {
      onComplete(sanitized);
    }

    // Caret will be automatically positioned by browser after value update
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
        setCaretToSlot(Math.max(0, currentPos - 1));
        break;

      case 'ArrowRight':
        e.preventDefault();
        setCaretToSlot(Math.min(length - 1, currentPos + 1));
        break;

      case 'Home':
        e.preventDefault();
        setCaretToSlot(0);
        break;

      case 'End':
        e.preventDefault();
        // Place caret AFTER last entered character (at value.length)
        setCaretToSlot(value.length);
        break;

      case 'Backspace':
        if (currentPos > 0 && value.length > 0) {
          e.preventDefault();
          const newValue =
            value.slice(0, currentPos - 1) + value.slice(currentPos);
          onChange(newValue);
          // Position caret after deletion
          setTimeout(() => setCaretToSlot(currentPos - 1), 0);
        }
        break;

      case 'Delete':
        if (currentPos < value.length) {
          e.preventDefault();
          const newValue =
            value.slice(0, currentPos) + value.slice(currentPos + 1);
          onChange(newValue);
          // Keep caret at same position
          setTimeout(() => setCaretToSlot(currentPos), 0);
        }
        break;

      default:
        // Allow other keys to be handled by default input behavior
        break;
    }
  };

  /**
   * Handle paste events
   * CRITICAL: Insert pasted content at current caret position
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const input = inputRef.current;
    if (!input) return;

    // Get current caret position
    const currentPos = input.selectionStart ?? 0;

    // Get clipboard content and sanitize
    const clipboardData = e.clipboardData.getData('text');
    const pasteResult = parsePasteContent(clipboardData, mode, length);

    if (pasteResult.valid && pasteResult.sanitized.length > 0) {
      // Insert pasted content at current caret position
      const beforeCaret = value.slice(0, currentPos);
      const afterCaret = value.slice(currentPos);
      const combined = beforeCaret + pasteResult.sanitized + afterCaret;

      // Truncate to max length
      const newValue = combined.slice(0, length);

      onChange(newValue);

      // Position caret after pasted content
      const newCaretPos = Math.min(
        currentPos + pasteResult.sanitized.length,
        length - 1
      );
      setTimeout(() => {
        setCaretToSlot(newCaretPos);
      }, 0);

      // Check for completion
      if (newValue.length === length && onComplete) {
        onComplete(newValue);
      }
    }
  };

  /**
   * Handle click on visual slot
   * CRITICAL: Manipulate caret, not state
   */
  const handleSlotClick = (slotIndex: number) => {
    inputRef.current?.focus();
    setCaretToSlot(slotIndex);
  };

  /**
   * Handle blur
   */
  const handleBlur = () => {
    onBlur?.();
  };

  // CRITICAL: Derive active slot index from caret on EVERY render
  // NO useState or cached value - always read fresh from DOM
  const activeSlotIndex = getActiveSlotIndex();

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
        // CRITICAL: Input MUST remain accessible (no aria-hidden, no pointerEvents:none)
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
            sx={getSlotStyles(i === activeSlotIndex, error, disabled)}
          >
            {value[i] || ''}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
