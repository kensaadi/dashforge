/**
 * React hook for extracting just the value from an engine node.
 *
 * This is a convenience hook that combines useEngineNode with value extraction.
 */

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
  return nodeIds.map((id) => useEngineValue<TValue>(id));
}
