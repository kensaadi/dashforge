import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { DashFormContext, EngineProvider } from '@dashforge/ui-core';
import type { DashFormBridge, Engine } from '@dashforge/ui-core';
import type { FieldRuntimeState } from '@dashforge/forms';
import { createMockBridge } from './mockBridge';
import type { MockBridgeOptions } from './mockBridge';
import { useState, useEffect } from 'react';

/**
 * Mock runtime state for testing.
 */
export interface MockRuntimeState {
  [fieldName: string]: FieldRuntimeState;
}

/**
 * Options for renderWithRuntime helper.
 */
export interface RenderWithRuntimeOptions
  extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Bridge instance to provide (if not provided, a mock bridge is created).
   */
  bridge?: DashFormBridge;

  /**
   * Options for creating a mock bridge (only used if bridge is not provided).
   */
  mockBridgeOptions?: MockBridgeOptions;

  /**
   * Initial runtime state for fields.
   */
  initialRuntime?: MockRuntimeState;

  /**
   * Engine instance for EngineProvider (defaults to bridge.engine).
   */
  engine?: Engine;
}

/**
 * Result type for renderWithRuntime.
 */
export interface RenderWithRuntimeResult extends ReturnType<typeof render> {
  bridge: DashFormBridge;
  state: ReturnType<typeof createMockBridge>['state'] | null;
  updateRuntime: (fieldName: string, runtime: FieldRuntimeState) => void;
  getFormValue: (fieldName: string) => unknown;
}

/**
 * Renders a component with DashFormContext, EngineProvider, and runtime state support.
 * Extends renderWithBridge with runtime state management.
 *
 * Usage:
 * ```tsx
 * const { getByLabelText, updateRuntime, getFormValue } = renderWithRuntime(
 *   <Select name="city" optionsFromFieldData />,
 *   {
 *     initialRuntime: {
 *       city: {
 *         status: 'success',
 *         error: null,
 *         data: { options: [{ value: 'nyc', label: 'New York' }] }
 *       }
 *     }
 *   }
 * );
 *
 * // Update runtime state
 * updateRuntime('city', {
 *   status: 'loading',
 *   error: null,
 *   data: null
 * });
 * ```
 */
export function renderWithRuntime(
  ui: React.ReactElement,
  options: RenderWithRuntimeOptions = {}
): RenderWithRuntimeResult {
  const {
    bridge: providedBridge,
    mockBridgeOptions,
    initialRuntime = {},
    engine: providedEngine,
    ...renderOptions
  } = options;

  // Create or use provided bridge
  const mockResult = providedBridge
    ? { bridge: providedBridge, state: null }
    : createMockBridge(mockBridgeOptions);

  const baseBridge = mockResult.bridge;
  const state = mockResult.state;
  const engine = providedEngine ?? baseBridge.engine;

  // Runtime state (mutable for updates)
  const runtimeState: MockRuntimeState = { ...initialRuntime };
  const runtimeSubscribers = new Map<string, Set<() => void>>();

  // Helper to notify runtime subscribers for a specific field
  const notifyRuntimeSubscribers = (fieldName: string) => {
    const subscribers = runtimeSubscribers.get(fieldName);
    if (subscribers) {
      subscribers.forEach((callback) => callback());
    }
  };

  // Update runtime state (exposed via result)
  const updateRuntime = (fieldName: string, runtime: FieldRuntimeState) => {
    runtimeState[fieldName] = runtime;
    notifyRuntimeSubscribers(fieldName);
  };

  // Get form value (convenience helper)
  const getFormValue = (fieldName: string): unknown => {
    return state?.values[fieldName] ?? '';
  };

  // Extend bridge with runtime methods
  const bridgeWithRuntime: DashFormBridge = {
    ...baseBridge,

    getFieldRuntime: <TData = unknown>(name: string): FieldRuntimeState<TData> => {
      return (runtimeState[name] ?? {
        status: 'idle',
        error: null,
        data: null,
      }) as FieldRuntimeState<TData>;
    },

    subscribeFieldRuntime: (name: string, listener: () => void): (() => void) => {
      if (!runtimeSubscribers.has(name)) {
        runtimeSubscribers.set(name, new Set());
      }
      const subscribers = runtimeSubscribers.get(name)!;
      subscribers.add(listener);

      return () => {
        subscribers.delete(listener);
      };
    },
  };

  // Wrapper component that provides reactive bridge updates
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // Use a counter to force re-renders when bridge state changes
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(() => {
      if (!state) return; // Only subscribe if we have a state object (mockBridge)

      // Register a subscriber that forces re-render when bridge state changes
      const subscriber = () => {
        setUpdateCount((prev) => prev + 1);
      };

      state._subscribers.add(subscriber);

      return () => {
        state._subscribers.delete(subscriber);
      };
    }, [state]);

    // CRITICAL: Bridge reference must remain stable for useFieldRuntime
    // The bridgeWithRuntime object is created once outside this component
    // Version getters (valuesVersion, etc.) handle reactivity
    // updateCount is only used to force re-renders, not passed to bridge
    void updateCount; // Satisfy linter - used for re-render trigger only

    return (
      <EngineProvider engine={engine}>
        <DashFormContext.Provider value={bridgeWithRuntime}>
          {children}
        </DashFormContext.Provider>
      </EngineProvider>
    );
  };

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...renderResult,
    bridge: bridgeWithRuntime,
    state,
    updateRuntime,
    getFormValue,
  };
}
