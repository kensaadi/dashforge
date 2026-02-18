/**
 * React hook for subscribing to a specific engine node.
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * - Subscribes to the nodes map to detect node registration and property changes
 * - Re-renders when a node is added or when its properties change
 * - Returns undefined if node doesn't exist (allows conditional rendering)
 */

import { useSnapshot } from 'valtio';
import type { Node } from '../types/node.types';
import { useEngineContext } from './EngineProvider';

/**
 * Hook to subscribe to a specific node in the engine.
 *
 * CRITICAL: This hook subscribes to the nodes map to detect when:
 * - A node is registered after initial render
 * - An existing node's properties change
 *
 * @param nodeId - The ID of the node to subscribe to
 * @returns The node snapshot (immutable) or undefined if not found
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const node = useEngineNode('field1');
 *
 *   if (!node) {
 *     return <div>Node not found</div>;
 *   }
 *
 *   return <div>{node.value}</div>;
 * }
 * ```
 */
export function useEngineNode<TValue = unknown>(
  nodeId: string
): Node<TValue> | undefined {
  const engine = useEngineContext();

  // Subscribe to the nodes map to detect node registration and property changes
  // Using getState().nodes ensures we get the correct proxy reference
  const nodes = useSnapshot(engine.getState().nodes);
  const node = nodes[nodeId];

  return node as Node<TValue> | undefined;
}

/**
 * Hook to subscribe to a specific node with a required guarantee.
 * Throws an error if the node doesn't exist.
 *
 * @param nodeId - The ID of the node to subscribe to
 * @returns The node snapshot (immutable)
 * @throws Error if the node doesn't exist
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // This will throw if 'field1' doesn't exist
 *   const node = useRequiredEngineNode('field1');
 *
 *   return <div>{node.value}</div>;
 * }
 * ```
 */
export function useRequiredEngineNode<TValue = unknown>(
  nodeId: string
): Node<TValue> {
  const node = useEngineNode<TValue>(nodeId);

  if (!node) {
    throw new Error(
      `Node with id "${nodeId}" does not exist in the engine. ` +
        `Make sure the node is registered before using this hook.`
    );
  }

  return node;
}
