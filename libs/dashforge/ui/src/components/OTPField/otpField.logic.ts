import type { OTPMode, PasteResult } from './otpField.types';

/**
 * Character validation regexes by mode
 */
const NUMERIC_REGEX = /^[0-9]$/;
const ALPHANUMERIC_REGEX = /^[0-9a-zA-Z]$/;
const ALPHA_REGEX = /^[a-zA-Z]$/;

/**
 * Check if a single character is valid for the given mode
 */
export function isValidChar(char: string, mode: OTPMode): boolean {
  switch (mode) {
    case 'numeric':
      return NUMERIC_REGEX.test(char);
    case 'alphanumeric':
      return ALPHANUMERIC_REGEX.test(char);
    case 'alpha':
      return ALPHA_REGEX.test(char);
    default:
      return false;
  }
}

/**
 * Sanitize input string by removing invalid characters for the given mode
 */
export function sanitizeByMode(input: string, mode: OTPMode): string {
  return input
    .split('')
    .filter((char) => isValidChar(char, mode))
    .join('');
}

/**
 * Parse pasted content: sanitize and truncate to max length
 */
export function parsePasteContent(
  clipboardData: string,
  mode: OTPMode,
  maxLength: number
): PasteResult {
  const sanitized = sanitizeByMode(clipboardData, mode).slice(0, maxLength);
  return {
    sanitized,
    valid: sanitized.length > 0,
  };
}

/**
 * Insert a character at a specific index, respecting max length
 */
export function insertCharAt(
  value: string,
  char: string,
  index: number,
  maxLength: number
): string {
  // Build new value: everything before index + new char + everything after index
  const before = value.slice(0, index);
  const after = value.slice(index);
  const newValue = before + char + after;

  // Truncate to max length
  return newValue.slice(0, maxLength);
}

/**
 * Delete character at a specific index
 */
export function deleteCharAt(value: string, index: number): string {
  if (index < 0 || index >= value.length) {
    return value;
  }
  return value.slice(0, index) + value.slice(index + 1);
}
