/**
 * React hook for extracting just the value from an engine node.
 *
 * This is a convenience hook that combines useEngineNode with value extraction.
 */

import { useSnapshot } from 'valtio';
import type { Node } from '../types/node.types';
import { useEngineContext } from './EngineProvider';
import { useEngineNode } from './useEngineNode';

/**
 * Hook to get just the value of a specific node.
 *
 * This is a convenience hook that extracts the value property from the node.
 * It still uses node-level subscription for optimal performance.
 *
 * @param nodeId - The ID of the node to get the value from
 * @returns The node's value or undefined if the node doesn't exist
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const firstName = useEngineValue<string>('firstName');
 *   const age = useEngineValue<number>('age');
 *
 *   return <div>{firstName}, {age} years old</div>;
 * }
 * ```
 */
export function useEngineValue<TValue = unknown>(
  nodeId: string
): TValue | undefined {
  const node = useEngineNode<TValue>(nodeId);
  return node?.value;
}

/**
 * Hook to get the value of a node with a fallback default.
 *
 * @param nodeId - The ID of the node to get the value from
 * @param defaultValue - The fallback value if the node doesn't exist
 * @returns The node's value or the default value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const name = useEngineValueWithDefault('name', 'Anonymous');
 *   const count = useEngineValueWithDefault('count', 0);
 *
 *   return <div>{name}: {count}</div>;
 * }
 * ```
 */
export function useEngineValueWithDefault<TValue>(
  nodeId: string,
  defaultValue: TValue
): TValue {
  const value = useEngineValue<TValue>(nodeId);
  return value !== undefined ? value : defaultValue;
}

/**
 * Hook to get multiple node values at once.
 *
 * @param nodeIds - Array of node IDs to get values from
 * @returns Array of values in the same order as the input IDs
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [firstName, lastName, age] = useEngineValues([
 *     'firstName',
 *     'lastName',
 *     'age'
 *   ]);
 *
 *   return <div>{firstName} {lastName}, {age}</div>;
 * }
 * ```
 */
export function useEngineValues<TValue = unknown>(
  nodeIds: string[]
): (TValue | undefined)[] {
  // One subscription for the whole batch, deliberately not
  // `nodeIds.map((id) => useEngineValue(id))`: that called a hook per entry
  // and so made React's hook count follow `nodeIds.length`, corrupting the
  // hook order as soon as an id was added or removed while the component
  // stayed mounted. Same defect class as BUG 16 and BUG 33.
  //
  // Reading N ids off a single snapshot subscribes to exactly what N
  // `useEngineValue` calls subscribed to, because `useEngineNode` watches
  // the whole `nodes` map and indexes into it anyway. One difference worth
  // knowing: this now throws outside an `EngineProvider` even for an empty
  // `nodeIds`, where the per-entry version happened to call no hook at all
  // and quietly returned `[]`.
  const engine = useEngineContext();
  const nodes = useSnapshot(engine.getState().nodes);

  return nodeIds.map((id) => (nodes[id] as Node<TValue> | undefined)?.value);
}
