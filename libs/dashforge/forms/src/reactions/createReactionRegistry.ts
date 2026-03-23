import type { FieldValues } from 'react-hook-form';
import type { FieldRuntimeState } from '../runtime/runtime.types';
import type {
  ReactionDefinition,
  ReactionRegistryConfig,
  ReactionWhenContext,
  ReactionRunContext,
  WatchIndex,
  AsyncRequestTracker,
} from './reaction.types';

/**
 * Reaction registry interface.
 * Manages reaction definitions and orchestrates execution.
 */
export interface ReactionRegistry<TFieldValues = FieldValues> {
  /**
   * Register reactions (one-shot per registry instance).
   *
   * REGISTRATION SEMANTICS:
   * - Can only be called once per registry instance
   * - Subsequent calls are no-ops (logs warning in debug mode)
   * - Duplicate reaction IDs throw error
   * - Builds internal lookup structures (reactionById, watchIndex)
   *
   * @param reactions - Array of reaction definitions
   * @throws Error if duplicate reaction IDs detected
   */
  registerReactions(reactions: ReactionDefinition<TFieldValues>[]): void;

  /**
   * Evaluate all reactions (initial evaluation).
   *
   * STRICT MODE PROTECTION:
   * - Executes only once per registry instance
   * - Subsequent calls are no-ops (returns immediately)
   * - Protected against React Strict Mode double execution
   *
   * EXECUTION SEMANTICS:
   * - Reactions execute asynchronously (fire-and-forget)
   * - NO ordering guarantees between reactions
   * - Each reaction is independent
   *
   * VALUE SEMANTICS:
   * - Reactions read from Engine (if node exists) or RHF (fallback)
   * - Value-driven, not mount-driven
   *
   * Should be called once after form initialization.
   */
  evaluateAll(): void;

  /**
   * Evaluate reactions affected by specific field change.
   *
   * EXECUTION SEMANTICS:
   * - Affected reactions execute asynchronously (fire-and-forget)
   * - NO ordering guarantees between reactions
   *
   * LOOKUP EFFICIENCY:
   * - O(1) watch index lookup
   * - O(1) per reaction via reactionById map
   * - Total: O(k) where k = affected reactions
   *
   * @param fieldName - Name of field that changed
   */
  evaluateForField(fieldName: string): void;

  /**
   * Check if initial evaluation has completed.
   * Used for Strict Mode re-entry protection.
   *
   * @returns True if evaluateAll() has been called
   */
  hasInitialEvaluationCompleted(): boolean;

  /**
   * Get all registered reactions (for debugging/testing).
   */
  getReactions(): ReactionDefinition<TFieldValues>[];

  /**
   * Reset registry (clear all reactions and state).
   * Resets all flags (initialEvaluationCompleted, registrationCompleted).
   * Used for testing and cleanup.
   */
  reset(): void;
}

/**
 * Create a reaction registry.
 *
 * The registry manages reaction definitions and orchestrates their execution
 * in response to field changes. It maintains efficient lookup structures for
 * O(1) access to reactions by ID and field name.
 *
 * @param config - Registry configuration and injected dependencies
 * @returns Reaction registry instance
 */
export function createReactionRegistry<TFieldValues = FieldValues>(
  config: ReactionRegistryConfig & {
    // Dependencies injected for testability
    getValue: (name: string) => unknown;
    getFieldRuntime: <TData>(name: string) => FieldRuntimeState<TData>;
    setFieldRuntime: <TData>(
      name: string,
      patch: Partial<FieldRuntimeState<TData>>
    ) => void;
  }
): ReactionRegistry<TFieldValues> {
  const { debug = false, getValue, getFieldRuntime, setFieldRuntime } = config;

  // Internal state (NOT React state)
  const reactions: ReactionDefinition<TFieldValues>[] = [];
  const reactionById = new Map<string, ReactionDefinition<TFieldValues>>(); // v4: O(1) lookup
  const watchIndex: WatchIndex = new Map();
  const asyncTracker: AsyncRequestTracker = new Map();

  // Lifecycle guards
  let initialEvaluationCompleted = false;
  let registrationCompleted = false; // v4: one-shot registration

  /**
   * Create when context for condition evaluation.
   */
  function createWhenContext(): ReactionWhenContext {
    return {
      getValue: <T = unknown>(name: string): T => getValue(name) as T,
    };
  }

  /**
   * Create run context for reaction execution.
   */
  function createRunContext(): ReactionRunContext<TFieldValues> {
    return {
      getValue: <T = unknown>(name: string): T => getValue(name) as T,
      getRuntime: (name) => getFieldRuntime(name),
      setRuntime: (name, patch) => setFieldRuntime(name, patch),
      beginAsync: (key: string) => {
        const requestId = (asyncTracker.get(key) ?? 0) + 1;
        asyncTracker.set(key, requestId);
        if (debug) {
          console.log('[ReactionRegistry] beginAsync', { key, requestId });
        }
        return requestId;
      },
      isLatest: (key: string, requestId: number) => {
        const latest = asyncTracker.get(key) ?? 0;
        const isLatest = requestId === latest;
        if (debug) {
          console.log('[ReactionRegistry] isLatest', {
            key,
            requestId,
            latest,
            isLatest,
          });
        }
        return isLatest;
      },
    };
  }

  /**
   * Execute single reaction.
   * Evaluates when condition (if present) and runs effect if condition passes.
   */
  async function executeReaction(
    reaction: ReactionDefinition<TFieldValues>
  ): Promise<void> {
    if (debug) {
      console.log('[ReactionRegistry] Evaluating reaction', { id: reaction.id });
    }

    // Check when condition (if present)
    if (reaction.when) {
      const whenCtx = createWhenContext();
      const conditionResult = reaction.when(whenCtx);

      if (debug) {
        console.log('[ReactionRegistry] When condition result', {
          id: reaction.id,
          result: conditionResult,
        });
      }

      if (!conditionResult) {
        if (debug) {
          console.log('[ReactionRegistry] Skipping reaction (condition false)', {
            id: reaction.id,
          });
        }
        return;
      }
    }

    // Execute run
    if (debug) {
      console.log('[ReactionRegistry] Executing run', { id: reaction.id });
    }

    const runCtx = createRunContext();

    try {
      const result = reaction.run(runCtx);

      // Handle async run
      if (result && typeof result.then === 'function') {
        await result;
      }

      if (debug) {
        console.log('[ReactionRegistry] Run completed', { id: reaction.id });
      }
    } catch (error) {
      console.error('[ReactionRegistry] Run failed', {
        id: reaction.id,
        error,
      });
      // Don't rethrow - reactions should not crash the app
    }
  }

  return {
    registerReactions(
      reactionList: ReactionDefinition<TFieldValues>[]
    ): void {
      // GUARD: Prevent repeated registration (v4 correction)
      if (registrationCompleted) {
        if (debug) {
          console.warn(
            '[ReactionRegistry] registerReactions called after initial registration, ignoring'
          );
        }
        return;
      }

      if (debug) {
        console.log('[ReactionRegistry] Registering reactions', {
          count: reactionList.length,
        });
      }

      // Validate no duplicate IDs (v4 correction - fail-fast)
      const ids = new Set<string>();
      for (const reaction of reactionList) {
        if (ids.has(reaction.id)) {
          throw new Error(
            `[ReactionRegistry] Duplicate reaction ID detected: "${reaction.id}". ` +
              `Each reaction must have a unique ID.`
          );
        }
        ids.add(reaction.id);
      }

      // Store in array (for evaluateAll iteration)
      reactions.push(...reactionList);

      // v4: Build direct lookup map (O(1) access)
      for (const reaction of reactionList) {
        reactionById.set(reaction.id, reaction);
      }

      // Build watch index (field → reaction IDs)
      for (const reaction of reactionList) {
        for (const fieldName of reaction.watch) {
          if (!watchIndex.has(fieldName)) {
            watchIndex.set(fieldName, new Set());
          }
          watchIndex.get(fieldName)!.add(reaction.id);
        }
      }

      // Mark registration complete (v4 correction)
      registrationCompleted = true;

      if (debug) {
        console.log('[ReactionRegistry] Registration complete', {
          reactionCount: reactions.length,
          reactionIds: Array.from(ids),
          watchedFields: Array.from(watchIndex.keys()),
        });
      }
    },

    evaluateAll(): void {
      // CRITICAL: Strict Mode protection (v3)
      if (initialEvaluationCompleted) {
        if (debug) {
          console.log(
            '[ReactionRegistry] Initial evaluation already completed, skipping (Strict Mode protection)'
          );
        }
        return;
      }

      if (debug) {
        console.log('[ReactionRegistry] Evaluating all reactions (initial)', {
          count: reactions.length,
          note: 'Setting completion flag before execution',
        });
      }

      // Mark as completed BEFORE execution to handle re-entry
      initialEvaluationCompleted = true;

      // Execute all reactions (no hierarchy, no ordering, async)
      for (const reaction of reactions) {
        // Fire and forget (don't await - allow parallel execution)
        void executeReaction(reaction);
      }

      if (debug) {
        console.log(
          '[ReactionRegistry] Initial evaluation triggered (async reactions may still be executing)'
        );
      }
    },

    evaluateForField(fieldName: string): void {
      if (debug) {
        console.log('[ReactionRegistry] Evaluating reactions for field', {
          fieldName,
        });
      }

      // Find reactions watching this field (O(1) map lookup)
      const reactionIds = watchIndex.get(fieldName);

      if (!reactionIds || reactionIds.size === 0) {
        if (debug) {
          console.log('[ReactionRegistry] No reactions watching field', {
            fieldName,
          });
        }
        return;
      }

      if (debug) {
        console.log('[ReactionRegistry] Found reactions for field', {
          fieldName,
          count: reactionIds.size,
          ids: Array.from(reactionIds),
        });
      }

      // Execute affected reactions (O(1) lookup per reaction via map - v4 correction)
      for (const reactionId of reactionIds) {
        const reaction = reactionById.get(reactionId); // O(1) direct map lookup
        if (reaction) {
          // Fire and forget
          void executeReaction(reaction);
        } else {
          // This should never happen (integrity issue)
          console.error(
            '[ReactionRegistry] Reaction ID in watch index but not in reactionById map',
            {
              reactionId,
              fieldName,
            }
          );
        }
      }
    },

    hasInitialEvaluationCompleted(): boolean {
      return initialEvaluationCompleted;
    },

    getReactions(): ReactionDefinition<TFieldValues>[] {
      return [...reactions];
    },

    reset(): void {
      reactions.length = 0;
      reactionById.clear(); // v4
      watchIndex.clear();
      asyncTracker.clear();
      initialEvaluationCompleted = false;
      registrationCompleted = false; // v4

      if (debug) {
        console.log(
          '[ReactionRegistry] Reset complete (including all flags and maps)'
        );
      }
    },
  };
}
