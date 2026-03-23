import type { FieldValues } from 'react-hook-form';
import type { FieldRuntimeState } from '../runtime/runtime.types';

/**
 * Context provided to when condition evaluation.
 * Read-only access to form values.
 */
export interface ReactionWhenContext {
  /**
   * Get current value of a field.
   * Reads from Engine first (if node exists), fallback to RHF (always available).
   *
   * VALUE SEMANTICS (value-driven, not mount-driven):
   * - Engine node may not exist if field hasn't mounted yet
   * - RHF defaultValues always available immediately
   * - This decouples reactions from component mount lifecycle
   *
   * @param name - Field name
   * @returns Current value (unknown type, consumer must cast)
   */
  getValue: <T = unknown>(name: string) => T;
}

/**
 * Context provided to run execution.
 * Read access to values/runtime, write access to runtime only.
 */
export interface ReactionRunContext<TFieldValues = FieldValues> {
  /**
   * Get current value of a field.
   * Same as when context - value-driven, not mount-driven.
   */
  getValue: <T = unknown>(name: string) => T;

  /**
   * Get runtime state for a field (read-only).
   * Returns default state if field not yet accessed.
   */
  getRuntime: <TData = unknown>(name: string) => FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (write).
   * ⚠️ INTERNAL ORCHESTRATION - reactions only
   */
  setRuntime: <TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ) => void;

  /**
   * Begin async operation and get request ID.
   * Used for staleness tracking.
   *
   * ASYNC CORRECTNESS:
   * - Each beginAsync() increments request ID
   * - Use isLatest() to check if response is still valid
   * - This is the ONLY mechanism for async coordination
   * - Do NOT rely on reaction execution order
   *
   * @param key - Unique key for async operation (e.g., 'fetch-cities')
   * @returns Request ID for staleness check
   */
  beginAsync: (key: string) => number;

  /**
   * Check if request is latest for given key.
   * Used to discard stale async responses.
   *
   * @param key - Async operation key
   * @param requestId - Request ID from beginAsync
   * @returns True if this is the latest request
   */
  isLatest: (key: string, requestId: number) => boolean;
}

/**
 * Reaction definition (mechanical, condition-driven).
 *
 * A reaction observes field changes and executes side effects
 * when conditions are met. Reactions are NOT semantic - they
 * do not encode business meaning or domain logic.
 *
 * EXECUTION SEMANTICS:
 * - Reactions execute asynchronously (fire-and-forget)
 * - NO ordering guarantees between reactions
 * - Each reaction MUST be independent
 * - Do NOT assume other reactions have completed
 * - Async correctness relies on beginAsync/isLatest only
 *
 * VALUE SEMANTICS:
 * - Reactions are value-driven, not mount-driven
 * - getValue() reads from form state (Engine/RHF), not UI state
 * - Decoupled from component mount lifecycle
 *
 * REGISTRATION:
 * - Each reaction must have a unique ID
 * - Reactions registered once per registry instance
 * - Duplicate IDs will throw error
 */
export interface ReactionDefinition<TFieldValues = FieldValues> {
  /**
   * Unique identifier for this reaction.
   * Must be unique within reaction registry.
   * Used for debugging and internal lookup.
   */
  id: string;

  /**
   * Field names to watch for changes.
   * When any watched field changes, this reaction is evaluated.
   *
   * @example ['country', 'region']
   */
  watch: string[];

  /**
   * Optional condition that must be true for run to execute.
   * If omitted, run always executes when watched field changes.
   *
   * @param ctx - Context with getValue
   * @returns True if run should execute
   *
   * @example
   * when: (ctx) => Boolean(ctx.getValue('country'))
   */
  when?: (ctx: ReactionWhenContext) => boolean;

  /**
   * Effect to execute when condition is met.
   * Can be sync or async. Async handlers should use
   * beginAsync/isLatest for staleness tracking.
   *
   * EXECUTION SEMANTICS:
   * - This may execute in parallel with other reactions
   * - Do NOT assume execution order
   * - Do NOT depend on other reactions completing first
   *
   * @param ctx - Context with getValue, getRuntime, setRuntime, async helpers
   *
   * @example
   * run: async (ctx) => {
   *   const country = ctx.getValue<string>('country');
   *   const requestId = ctx.beginAsync('fetch-cities');
   *
   *   ctx.setRuntime('city', { status: 'loading' });
   *
   *   const cities = await fetchCities(country);
   *
   *   if (ctx.isLatest('fetch-cities', requestId)) {
   *     ctx.setRuntime('city', {
   *       status: 'ready',
   *       data: { options: cities },
   *     });
   *   }
   * }
   */
  run: (ctx: ReactionRunContext<TFieldValues>) => void | Promise<void>;
}

/**
 * Configuration for reaction registry.
 */
export interface ReactionRegistryConfig {
  /**
   * Enable debug logging.
   */
  debug?: boolean;
}

/**
 * Internal mapping of field name → reaction IDs.
 * Used for efficient lookup of reactions affected by field change.
 */
export type WatchIndex = Map<string, Set<string>>;

/**
 * Async request tracking state.
 * Maps async operation key → latest request ID.
 */
export type AsyncRequestTracker = Map<string, number>;
