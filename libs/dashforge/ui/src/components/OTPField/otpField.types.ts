import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';

/**
 * Character mode for OTP field
 */
export type OTPMode = 'numeric' | 'alphanumeric' | 'alpha';

/**
 * PUBLIC: OTPField component props
 *
 * Extends MUI TextField props but removes conflicting props and adds OTP-specific ones.
 */
export interface OTPFieldProps
  extends Omit<
    MuiTextFieldProps,
    'name' | 'value' | 'onChange' | 'type' | 'multiline'
  > {
  /**
   * Field name (required)
   */
  name: string;

  /**
   * Controlled value (single string, e.g., "123456")
   */
  value?: string;

  /**
   * Change handler
   * @param value - New complete value string
   */
  onChange?: (value: string) => void;

  /**
   * Number of OTP slots to render
   * @default 6
   */
  length?: number;

  /**
   * Character entry mode
   * - 'numeric': 0-9 only (default)
   * - 'alphanumeric': 0-9, a-z, A-Z
   * - 'alpha': a-z, A-Z only
   * @default 'numeric'
   */
  mode?: OTPMode;

  /**
   * Callback fired when all slots are filled
   * @param value - Complete OTP value
   */
  onComplete?: (value: string) => void;

  /**
   * Auto-focus first slot on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Validation rules (for form integration)
   */
  rules?: unknown;

  /**
   * Conditional visibility based on engine state
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * RBAC access control
   */
  access?: AccessRequirement;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Helper text or error message
   */
  helperText?: ReactNode;

  /**
   * Label for the field (rendered above slots)
   */
  label?: ReactNode;

  /**
   * Required indicator
   */
  required?: boolean;

  /**
   * Full width container
   */
  fullWidth?: boolean;
}

/**
 * INTERNAL: OTPInput primitive props (NOT exported publicly)
 */
export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  length: number;
  mode: OTPMode;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
  error?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * INTERNAL: Paste handling result
 */
export interface PasteResult {
  sanitized: string;
  valid: boolean;
}
