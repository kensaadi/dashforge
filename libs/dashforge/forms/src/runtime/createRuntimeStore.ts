import { proxy, snapshot, subscribe } from 'valtio';
import type {
  FieldRuntimeState,
  RuntimeStoreConfig,
  RuntimeStoreState,
} from './runtime.types';

/**
 * Default runtime state for a newly accessed field.
 * Safe defaults prevent undefined checks in consuming code.
 */
export const DEFAULT_FIELD_RUNTIME: FieldRuntimeState = {
  status: 'idle',
  error: null,
  data: null,
};

/**
 * Runtime store interface (LAZY, NO REGISTRATION).
 * Fields are created on-demand during get/set operations.
 */
export interface RuntimeStore {
  /**
   * Get current runtime state for a field (READ operation).
   * LAZY: Creates field with default state if doesn't exist.
   *
   * USAGE: UI components via useFieldRuntime hook (primary),
   *        or reactions/engine for reading state (advanced).
   *
   * @param name - Field name
   * @returns Current runtime state (snapshot, immutable)
   */
  getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (WRITE operation).
   * LAZY: Creates field if doesn't exist before merging.
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
  setFieldRuntime<TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ): void;

  /**
   * Subscribe to runtime state changes for a specific field.
   * ISOLATED: Only fires when THIS specific field changes.
   *
   * USAGE: Wrapped by useFieldRuntime hook (primary).
   *        Direct usage only in advanced scenarios.
   *
   * @param name - Field name to watch
   * @param listener - Callback invoked on state change
   * @returns Unsubscribe function
   */
  subscribeFieldRuntime(name: string, listener: () => void): () => void;

  /**
   * Reset all runtime state to defaults.
   *
   * ⚠️ INTERNAL UTILITY - NOT COUPLED TO FORM LIFECYCLE
   *
   * This method:
   * - Clears all runtime fields
   * - Does NOT synchronize with RHF reset
   * - Does NOT introduce automatic lifecycle behavior
   * - MUST remain unused by default in this step
   *
   * Future usage (if needed):
   * - Explicit manual reset scenarios
   * - Testing/cleanup utilities
   *
   * NOT for automatic form reset integration.
   */
  reset(): void;

  /**
   * Get raw Valtio proxy (internal use only).
   * Exposed for testing and internal provider needs.
   * NOT exposed via bridge to UI.
   *
   * @internal
   */
  getState(): RuntimeStoreState;
}

/**
 * Create a new runtime store instance.
 *
 * The runtime store manages per-field metadata (status, error, data)
 * separately from form values (managed by React Hook Form).
 *
 * Key characteristics:
 * - LAZY: Fields created on first get/set access
 * - ISOLATED: Per-field subscriptions via subscribeKey
 * - NO REGISTRATION: No explicit field lifecycle management
 * - NO RECONCILIATION: Never modifies form values
 *
 * @param config - Configuration options
 * @returns Runtime store instance
 */
export function createRuntimeStore(
  config: RuntimeStoreConfig = {}
): RuntimeStore {
  const { debug = false } = config;

  // Create Valtio proxy for reactive state
  const state = proxy<RuntimeStoreState>({
    fields: {},
  });

  if (debug) {
    console.log('[RuntimeStore] Created', {
      timestamp: new Date().toISOString(),
    });
  }

  return {
    getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData> {
      // LAZY: Ensure field exists before reading
      if (!state.fields[name]) {
        state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
        if (debug) {
          console.log('[RuntimeStore] Lazy-created field on read', { name });
        }
      }

      // Return immutable snapshot
      return snapshot(state.fields[name]) as FieldRuntimeState<TData>;
    },

    setFieldRuntime<TData = unknown>(
      name: string,
      patch: Partial<FieldRuntimeState<TData>>
    ): void {
      // LAZY: Ensure field exists before writing
      if (!state.fields[name]) {
        state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
        if (debug) {
          console.log('[RuntimeStore] Lazy-created field on write', { name });
        }
      }

      // Merge patch into existing state
      // Must update proxy properties directly for reactivity
      const currentField = state.fields[name];
      if (patch.status !== undefined) currentField.status = patch.status;
      if (patch.error !== undefined) currentField.error = patch.error;
      if (patch.data !== undefined) currentField.data = patch.data;

      if (debug) {
        console.log('[RuntimeStore] setFieldRuntime', {
          name,
          patch,
          newState: snapshot(state.fields[name]),
        });
      }
    },

    subscribeFieldRuntime(name: string, listener: () => void): () => void {
      if (debug) {
        console.log('[RuntimeStore] subscribeFieldRuntime', { name });
      }

      // LAZY: Ensure field exists before subscribing
      if (!state.fields[name]) {
        state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
        if (debug) {
          console.log('[RuntimeStore] Lazy-created field on subscribe', {
            name,
          });
        }
      }

      // CRITICAL: Subscribe directly to the field proxy object
      // This ensures listener ONLY fires when this field's properties change
      // NOT when other fields change
      // Note: Valtio subscriptions are async/batched
      return subscribe(state.fields[name], () => {
        if (debug) {
          console.log('[RuntimeStore] Field changed, notifying listener', {
            name,
            newState: snapshot(state.fields[name]),
          });
        }
        listener();
      });
    },

    reset(): void {
      // Simple clear - no coupling to RHF, no automatic behavior
      state.fields = {};

      if (debug) {
        console.log('[RuntimeStore] reset (manual)');
      }
    },

    getState(): RuntimeStoreState {
      return state;
    },
  };
}
