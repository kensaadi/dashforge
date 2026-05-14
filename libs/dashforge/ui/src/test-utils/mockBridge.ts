import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { createEngine } from '@dashforge/ui-core';
import type { Engine } from '@dashforge/ui-core';

/**
 * Options for creating a mock bridge.
 */
export interface MockBridgeOptions {
  /**
   * Initial form values.
   */
  defaultValues?: Record<string, unknown>;

  /**
   * Initial error state.
   */
  errors?: Record<string, { message: string }>;

  /**
   * Initial touched fields.
   */
  touched?: Record<string, boolean>;

  /**
   * Submit count (for error gating).
   */
  submitCount?: number;

  /**
   * Custom engine instance (optional).
   */
  engine?: Engine;

  /**
   * Debug mode.
   */
  debug?: boolean;
}

/**
 * Mock bridge state for testing.
 * Allows reading/writing values, errors, and touched state.
 */
export interface MockBridgeState {
  values: Record<string, unknown>;
  errors: Record<string, { message: string }>;
  touched: Record<string, boolean>;
  submitCount: number;
  /**
   * Subscribers that get notified when state changes.
   * Used by renderWithBridge to trigger re-renders.
   */
  _subscribers: Set<() => void>;
}

/**
 * Creates a minimal mock DashFormBridge for unit testing form-bound components.
 * Does NOT depend on react-hook-form.
 *
 * **Reactivity (0.2.0-beta+)**: every state mutation invokes the listeners
 * registered via `subscribeField(name, listener)` so consumers using the
 * per-field subscription path (`useDashFieldMeta` → `useSyncExternalStore`)
 * re-render correctly. The mock fires every listener on any state change —
 * it does not filter by field name (broadcasting is acceptable for tests
 * and matches the contract from the consumer's perspective).
 *
 * The legacy version-string subscribe path (`void bridge?.valuesVersion`)
 * was removed in 0.2.0-beta along with the deprecated bridge fields.
 *
 * Usage:
 * ```tsx
 * const { bridge, state } = createMockBridge({
 *   defaultValues: { email: 'test@example.com' }
 * });
 *
 * render(
 *   <DashFormContext.Provider value={bridge}>
 *     <TextField name="email" />
 *   </DashFormContext.Provider>
 * );
 *
 * // Assert on state.values.email
 * ```
 */
export function createMockBridge(options: MockBridgeOptions = {}): {
  bridge: DashFormBridge;
  state: MockBridgeState;
} {
  const state: MockBridgeState = {
    values: { ...options.defaultValues },
    errors: { ...options.errors },
    touched: { ...options.touched },
    submitCount: options.submitCount ?? 0,
    _subscribers: new Set(),
  };

  // Helper to notify subscribers when state changes
  const notifySubscribers = () => {
    state._subscribers.forEach((callback) => callback());
  };

  const engine =
    options.engine ?? createEngine({ debug: options.debug ?? false });

  // Create bridge with reactive getters for version strings
  // These must be getters so they compute fresh values on each access
  const bridge: DashFormBridge = {
    engine,

    register: (name: string, _rules?: unknown): FieldRegistration => {
      return {
        name,
        onChange: async (event: unknown) => {
          // Extract value from event
          let value: unknown;
          if (event && typeof event === 'object' && 'target' in event) {
            const target = (event as { target: unknown }).target;
            if (target && typeof target === 'object' && 'value' in target) {
              value = (target as { value: unknown }).value;
            }
          } else {
            value = event;
          }
          state.values[name] = value;
          notifySubscribers();
        },
        onBlur: (_event: unknown) => {
          state.touched[name] = true;
          notifySubscribers();
        },
        ref: () => {
          // No-op for mock
        },
      };
    },

    unregister: (name: string) => {
      delete state.values[name];
      delete state.errors[name];
      delete state.touched[name];
      notifySubscribers();
    },

    getError: (name: string) => {
      return state.errors[name] ?? null;
    },

    setValue: (name: string, value: unknown) => {
      state.values[name] = value;
      notifySubscribers();
    },

    getValue: (name: string) => {
      return state.values[name] ?? '';
    },

    isTouched: (name: string) => {
      return state.touched[name] ?? false;
    },

    isDirty: (name: string) => {
      // Simple dirty check: has value and value !== default
      const currentValue = state.values[name];
      const defaultValue = options.defaultValues?.[name];
      return currentValue !== defaultValue;
    },

    // Per-field subscription (0.2.0-beta required surface).
    // Broadcast-style: every listener fires on every state mutation. This is
    // intentionally simpler than the production implementation in
    // DashFormProvider (which diffs by field name) — for unit tests, an
    // over-broadcast is harmless since assertions read state directly.
    subscribeField: (_name: string, listener: () => void) => {
      state._subscribers.add(listener);
      return () => {
        state._subscribers.delete(listener);
      };
    },

    get submitCount() {
      return state.submitCount;
    },

    debug: options.debug ?? false,
  };

  return { bridge, state };
}
