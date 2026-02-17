/**
 * React hook for subscribing to a specific engine node.
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * - MUST use node-level subscription: useSnapshot(engine._store.nodes[id])
 * - MUST NOT use global subscription: useSnapshot(engine._store)
 * - Node-level subscriptions prevent unnecessary re-renders
 */

import { useSnapshot } from 'valtio';
import type { Node } from '../types/node.types';
import { useEngineContext } from './EngineProvider';

/**
 * Hook to subscribe to a specific node in the engine.
 *
 * CRITICAL: This hook uses node-level subscription for optimal performance.
 * Only re-renders when the specific node changes, not when any part of the store changes.
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

  // ✅ CORRECT: Node-level subscription
  // This only triggers re-render when THIS specific node changes
  const nodesSnapshot = useSnapshot(engine._store.nodes);

  return nodesSnapshot[nodeId] as Node<TValue> | undefined;
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
