import { createContext } from 'react';
import type { Engine } from '../types';

/**
 * Generic field registration result.
 * Intentionally loosely-typed to avoid coupling ui-core to react-hook-form.
 * Consumers (like useDashRegister) can cast to their specific types.
 *
 * Explicitly lists all properties to avoid permissive index signatures.
 * Based on react-hook-form UseFormRegisterReturn shape.
 */
export interface FieldRegistration {
  name: string;
  onChange?: (event: unknown) => void | Promise<unknown>;
  onBlur?: (event: unknown) => void;
  ref?: (instance: unknown) => void;
  // Additional properties that may be present from RHF or other form libraries
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
}

/**
 * Minimal field error representation.
 * Intentionally loosely-typed to avoid coupling ui-core to react-hook-form.
 */
export interface BridgeFieldError {
  message?: string;
}

/**
 * Minimal bridge interface for form integration.
 * This allows ui components to detect and integrate with DashForm
 * without depending on the full @dashforge/forms package.
 *
 * Implementation provided by @dashforge/forms DashFormProvider.
 */
export interface DashFormBridge {
  /**
   * The reactive Engine instance managing form state.
   */
  engine: Engine;

  /**
   * Register a field with the form system.
   * Returns an object with onChange, onBlur, ref, etc.
   *
   * @param name - Field name
   * @param rules - Validation rules (opaque to ui-core)
   */
  register?: (name: string, rules?: unknown) => FieldRegistration;

  /**
   * Get validation error for a field.
   * Returns null if no error exists.
   *
   * @param name - Field name (supports dot paths)
   */
  getError?: (name: string) => BridgeFieldError | null;

  /**
   * Set a field value programmatically.
   *
   * @param name - Field name
   * @param value - New value
   */
  setValue?: (name: string, value: unknown) => void;

  /**
   * Get current field value.
   *
   * @param name - Field name
   */
  getValue?: (name: string) => unknown;

  /**
   * Error version string derived from RHF formState.errors.
   * Changes when errors change and is used to trigger consumer re-renders.
   * Phase 1.1 pragmatic approach (can be optimized later).
   */
  errorVersion?: string;

  /**
   * Check if a field has been touched (user interacted with it).
   * Returns true after field blur event.
   *
   * @param name - Field name (supports dot paths)
   */
  isTouched?: (name: string) => boolean;

  /**
   * Check if a field value has changed from its default value.
   *
   * @param name - Field name (supports dot paths)
   */
  isDirty?: (name: string) => boolean;

  /**
   * Touched version string derived from RHF formState.touchedFields.
   * Changes when touched state changes and is used to trigger consumer re-renders.
   */
  touchedVersion?: string;

  /**
   * Dirty version string derived from RHF formState.dirtyFields.
   * Changes when dirty state changes and is used to trigger consumer re-renders.
   */
  dirtyVersion?: string;

  /**
   * Values version string derived from RHF form values.
   * Changes when any form value changes and is used to trigger consumer re-renders.
   * Phase 1.1 pragmatic approach (can be optimized later for per-field granularity).
   */
  valuesVersion?: string;

  /**
   * Number of times form has been submitted (including failed submissions).
   * Increments on each submit attempt.
   * Used to gate error display: show errors after first submit attempt.
   */
  submitCount?: number;

  /**
   * Debug mode flag.
   */
  debug?: boolean;
}

/**
 * React context for sharing DashForm bridge across the component tree.
 *
 * **Architecture:**
 * - Defined in ui-core (foundation layer)
 * - Implemented by @dashforge/forms DashFormProvider
 * - Consumed by @dashforge/ui intelligent components
 *
 * This creates a clean dependency flow:
 * - ui-core (defines contract)
 * - forms (implements contract)
 * - ui (uses contract)
 *
 * No circular dependencies!
 */
export const DashFormContext = createContext<DashFormBridge | null>(null);

if (process.env.NODE_ENV !== 'production') {
  DashFormContext.displayName = 'DashFormContext';
}
