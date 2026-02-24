import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { DashFormContext, EngineProvider } from '@dashforge/ui-core';
import type { DashFormBridge, Engine } from '@dashforge/ui-core';
import { createMockBridge } from './mockBridge';
import type { MockBridgeOptions } from './mockBridge';

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

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <EngineProvider engine={engine}>
      <DashFormContext.Provider value={bridge}>
        {children}
      </DashFormContext.Provider>
    </EngineProvider>
  );

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...renderResult,
    bridge,
    state,
  };
}
