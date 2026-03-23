/**
 * Field runtime fetch status.
 *
 * Lifecycle:
 * - 'idle': Initial state, no async work scheduled
 * - 'loading': Async operation in progress
 * - 'ready': Async operation completed successfully
 * - 'error': Async operation failed
 */
export type FieldFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Runtime state for a single field.
 * Separate from form values (managed by RHF).
 *
 * This is the CANONICAL definition in the forms layer.
 * A duplicate exists in ui-core/bridge for boundary contract (see Section 2.5).
 *
 * @template TData - Type of runtime data (e.g., SelectFieldRuntimeData)
 */
export interface FieldRuntimeState<TData = unknown> {
  /**
   * Current fetch status for this field's runtime data.
   */
  status: FieldFetchStatus;

  /**
   * Runtime error message (NOT validation error).
   * Only set when status is 'error'.
   */
  error: string | null;

  /**
   * Runtime data payload (e.g., fetched options for Select).
   * Type depends on field type.
   */
  data: TData | null;
}

/**
 * Runtime data shape for Select fields.
 *
 * @template TOption - Type of individual option object
 */
export interface SelectFieldRuntimeData<TOption = unknown> {
  /**
   * Array of options available for selection.
   */
  options: TOption[];
}

/**
 * Complete runtime store state.
 * Fields are created lazily on first access.
 */
export interface RuntimeStoreState {
  /**
   * Per-field runtime states (lazily created).
   * Key: field name (e.g., "country", "dependent.group0")
   * Value: FieldRuntimeState with optional generic data
   */
  fields: Record<string, FieldRuntimeState>;
}

/**
 * Configuration for runtime store creation.
 */
export interface RuntimeStoreConfig {
  /**
   * Enable debug logging.
   */
  debug?: boolean;
}
