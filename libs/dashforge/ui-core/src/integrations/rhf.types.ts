/**
 * @module integrations/rhf.types
 * React Hook Form integration types for @dashforge/ui-core
 *
 * ⚠️ PATCH B APPLIED: All generics default to `unknown` (NOT `any`)
 * This ensures type safety and prevents accidental type erasure
 *
 * Note: react-hook-form is a peer dependency (optional)
 * Types use conditional imports to avoid requiring RHF if not used
 */

/**
 * Re-export minimal RHF types needed for integrations
 * These match react-hook-form's type signatures
 */
export type FieldValues = Record<string, unknown>;
export type Path<T extends FieldValues> = string;
export type PathValue<T extends FieldValues, P extends Path<T>> = unknown;

export interface FieldError {
  type: string;
  message?: string;
}

/**
 * React Hook Form field configuration
 * Maps RHF field state to engine node properties
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 */
export interface RHFFieldConfig<
  TFieldValues extends FieldValues = Record<string, unknown>,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> {
  /**
   * Field name in RHF form
   */
  name: TName;

  /**
   * Node ID in engine
   */
  nodeId: string;

  /**
   * Whether to sync field value to node.value
   * @default true
   */
  syncValue?: boolean;

  /**
   * Whether to sync field error to node.error
   * @default true
   */
  syncError?: boolean;

  /**
   * Whether to sync field disabled state to node.disabled
   * @default true
   */
  syncDisabled?: boolean;

  /**
   * Custom error message mapper
   * Transforms RHF FieldError to string for node.error
   */
  errorMapper?: (error: FieldError | undefined) => string | undefined;
}

/**
 * React Hook Form sync options
 * Controls bidirectional sync between RHF and engine
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 */
export interface RHFSyncOptions<
  TFieldValues extends FieldValues = Record<string, unknown>
> {
  /**
   * Field configurations to sync
   */
  fields: RHFFieldConfig<TFieldValues>[];

  /**
   * Sync direction
   * - 'rhf-to-engine': RHF form state → Engine nodes (one-way)
   * - 'engine-to-rhf': Engine nodes → RHF form state (one-way)
   * - 'bidirectional': Two-way sync (default)
   * @default 'bidirectional'
   */
  direction?: 'rhf-to-engine' | 'engine-to-rhf' | 'bidirectional';

  /**
   * Debounce delay in milliseconds for engine → RHF sync
   * Prevents excessive re-renders during rapid engine updates
   * @default 0
   */
  debounceMs?: number;
}

/**
 * Result of useEngineRHF hook
 * Provides sync controls and status
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 */
export interface UseEngineRHFResult<
  TFieldValues extends FieldValues = Record<string, unknown>
> {
  /**
   * Whether sync is currently active
   */
  isSyncing: boolean;

  /**
   * Start syncing (if stopped)
   */
  startSync: () => void;

  /**
   * Stop syncing temporarily
   */
  stopSync: () => void;

  /**
   * Manually trigger a one-time sync
   * @param direction - Direction to sync (defaults to options.direction)
   */
  triggerSync: (direction?: 'rhf-to-engine' | 'engine-to-rhf') => void;

  /**
   * Get current node value for a field
   */
  getNodeValue: <TName extends Path<TFieldValues>>(
    name: TName
  ) => PathValue<TFieldValues, TName> | undefined;

  /**
   * Set node value for a field
   */
  setNodeValue: <TName extends Path<TFieldValues>>(
    name: TName,
    value: PathValue<TFieldValues, TName>
  ) => void;
}

/**
 * Engine node properties that map to RHF field state
 * Used internally for type-safe sync operations
 *
 * ⚠️ PATCH B: TValue defaults to unknown
 */
export interface RHFMappedNode<TValue = unknown> {
  /**
   * Node ID
   */
  id: string;

  /**
   * Node value (syncs with RHF field value)
   */
  value?: TValue;

  /**
   * Error message (syncs with RHF field error)
   */
  error?: string;

  /**
   * Disabled state (syncs with RHF field disabled)
   */
  disabled?: boolean;

  /**
   * Visible state
   */
  visible?: boolean;
}

/**
 * Default error mapper
 * Converts RHF FieldError to simple string message
 */
export function defaultRHFErrorMapper(
  error: FieldError | undefined
): string | undefined {
  if (!error) {
    return undefined;
  }

  // Use custom message if provided, otherwise use type
  return error.message || `Validation error: ${error.type}`;
}
