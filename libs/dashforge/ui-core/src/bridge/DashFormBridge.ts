import { createContext } from 'react';
import type { Engine } from '../types';

/**
 * Field runtime state shape (BOUNDARY CONTRACT).
 *
 * ⚠️ DELIBERATE DUPLICATION - NOT TEMPORARY
 *
 * This type is INTENTIONALLY duplicated from @dashforge/forms/runtime
 * as a deliberate boundary decision required by package separation:
 *
 * - CANONICAL DEFINITION: libs/dashforge/forms/src/runtime/runtime.types.ts
 * - BRIDGE CONTRACT: This file (ui-core boundary)
 *
 * Why duplicate:
 * - ui-core CANNOT import from forms (circular dependency)
 * - Package boundaries must remain clean
 * - This is a stable, intentional contract shape
 *
 * Maintenance requirement:
 * - Both definitions MUST stay aligned
 * - Any change to runtime shape MUST update BOTH sides in the same task
 * - Integration tests verify type compatibility
 *
 * This is NOT a temporary workaround. This is the correct architecture.
 */
export interface FieldRuntimeState<TData = unknown> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  data: TData | null;
}

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

  // NEW: Runtime APIs (CONTROLLED, NO RAW STORE)

  /**
   * Get runtime state for a field (READ operation).
   * Returns default state if field not yet accessed.
   *
   * USAGE: UI components via useFieldRuntime hook (primary).
   *
   * @param name - Field name
   * @returns Current runtime state
   */
  getFieldRuntime?<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (WRITE operation).
   * Lazily creates field if doesn't exist.
   *
   * ⚠️ INTERNAL ORCHESTRATION API
   *
   * This method is EXCLUSIVELY for:
   * - Reaction handlers (future step 02)
   * - Engine orchestration logic
   * - Controlled internal flows
   *
   * UI components MUST NOT call this directly.
   * UI components MUST use useFieldRuntime (read-only) only.
   *
   * @param name - Field name
   * @param patch - Partial state to merge
   */
  setFieldRuntime?<TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ): void;

  /**
   * Subscribe to runtime state changes for a field.
   * Subscription is isolated to this specific field only.
   *
   * USAGE: Wrapped by useFieldRuntime hook (primary).
   *
   * @param name - Field name
   * @param listener - Callback on change
   * @returns Unsubscribe function
   */
  subscribeFieldRuntime?(name: string, listener: () => void): () => void;

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
   * @deprecated Will be replaced by useFieldRuntime hook
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
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  touchedVersion?: string;

  /**
   * Dirty version string derived from RHF formState.dirtyFields.
   * Changes when dirty state changes and is used to trigger consumer re-renders.
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  dirtyVersion?: string;

  /**
   * Values version string derived from RHF form values.
   * Changes when any form value changes and is used to trigger consumer re-renders.
   * Phase 1.1 pragmatic approach (can be optimized later for per-field granularity).
   * @deprecated Will be replaced by useFieldRuntime hook
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
