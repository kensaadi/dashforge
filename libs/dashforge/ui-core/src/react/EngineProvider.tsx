/**
 * React Context provider for the Engine.
 *
 * This provider makes the engine instance available to all child components
 * via the useEngineContext hook.
 */

import {
  createContext,
  useContext,
  type ReactNode,
  type ReactElement,
} from 'react';
import type { Engine } from '../types/engine.types';

/**
 * Context for the Engine instance.
 */
const EngineContext = createContext<Engine | null>(null);

/**
 * Props for the EngineProvider component.
 */
export interface EngineProviderProps {
  /**
   * The engine instance to provide to child components.
   */
  engine: Engine;

  /**
   * Child components that will have access to the engine.
   */
  children: ReactNode;
}

/**
 * Provider component that makes an Engine instance available to all child components.
 *
 * @example
 * ```tsx
 * const engine = createEngine();
 *
 * function App() {
 *   return (
 *     <EngineProvider engine={engine}>
 *       <YourComponents />
 *     </EngineProvider>
 *   );
 * }
 * ```
 */
export function EngineProvider({
  engine,
  children,
}: EngineProviderProps): ReactElement {
  return (
    <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
  );
}

/**
 * Hook to access the Engine instance from context.
 *
 * @throws Error if used outside of an EngineProvider
 * @returns The engine instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const engine = useEngineContext();
 *   // Use engine methods...
 * }
 * ```
 */
export function useEngineContext(): Engine {
  const engine = useContext(EngineContext);

  if (!engine) {
    throw new Error(
      'useEngineContext must be used within an EngineProvider. ' +
        'Wrap your component tree with <EngineProvider engine={engine}>.'
    );
  }

  return engine;
}
