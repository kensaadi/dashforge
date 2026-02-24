import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { DashFormContext, EngineProvider } from '@dashforge/ui-core';
import type { DashFormBridge, Engine } from '@dashforge/ui-core';
import { createMockBridge } from './mockBridge';
import type { MockBridgeOptions } from './mockBridge';
import { useState, useEffect } from 'react';

/**
 * Options for renderWithBridge helper.
 */
export interface RenderWithBridgeOptions
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
   * Engine instance for EngineProvider (defaults to bridge.engine).
   */
  engine?: Engine;
}

/**
 * Result type for renderWithBridge.
 */
export interface RenderWithBridgeResult extends ReturnType<typeof render> {
  bridge: DashFormBridge;
  state: ReturnType<typeof createMockBridge>['state'] | null;
}

/**
 * Renders a component wrapped with DashFormContext and EngineProvider.
 * Simplifies testing of form-bound components.
 *
 * Usage:
 * ```tsx
 * const { getByLabelText, bridge, state } = renderWithBridge(
 *   <TextField name="email" label="Email" />,
 *   {
 *     mockBridgeOptions: {
 *       defaultValues: { email: 'test@example.com' }
 *     }
 *   }
 * );
 *
 * // Component is bound to bridge
 * expect(state.values.email).toBe('test@example.com');
 * ```
 */
export function renderWithBridge(
  ui: React.ReactElement,
  options: RenderWithBridgeOptions = {}
): RenderWithBridgeResult {
  const {
    bridge: providedBridge,
    mockBridgeOptions,
    engine: providedEngine,
    ...renderOptions
  } = options;

  // Create or use provided bridge
  const mockResult = providedBridge
    ? { bridge: providedBridge, state: null }
    : createMockBridge(mockBridgeOptions);

  const bridge = mockResult.bridge;
  const state = mockResult.state;
  const engine = providedEngine ?? bridge.engine;

  // Wrapper component that provides reactive bridge updates
  // This simulates how the real DashFormProvider re-renders consumers when state changes
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // Use a counter to force re-renders when bridge state changes
    // Each state change increments the counter, causing the entire tree to re-render
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

    // Create a new bridge wrapper object on each render that includes updateCount
    // This ensures Context consumers re-render when state changes
    // The bridge object itself is stable, but wrapping it forces React to see it as changed
    const bridgeWithVersion = { ...bridge, _updateCount: updateCount };

    return (
      <EngineProvider engine={engine}>
        <DashFormContext.Provider value={bridgeWithVersion}>
          {children}
        </DashFormContext.Provider>
      </EngineProvider>
    );
  };

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...renderResult,
    bridge,
    state,
  };
}
