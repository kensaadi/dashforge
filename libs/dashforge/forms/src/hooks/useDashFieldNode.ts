import { useEngineNode } from '@dashforge/ui-core';
import type { Node } from '@dashforge/ui-core';
import { useDashFormContext } from '../core/useDashFormContext';

/**
 * Hook to access an Engine node within a DashForm.
 *
 * This is a convenience wrapper around `useEngineNode` from `@dashforge/ui-core`
 * that also has access to the form's debug mode for enhanced logging.
 *
 * **Phase 0 Implementation:**
 * - Simply wraps useEngineNode from ui-core
 * - Logs warning if node not found when debug=true
 * - No automatic sync or registration (that's useDashRegister's job)
 *
 * **Future Phases:**
 * - Phase 1+: May add automatic field registration
 * - Phase 2+: May add reaction system integration
 *
 * @template TValue - The type of the node's value
 * @param nodeId - The ID of the Engine node to subscribe to
 * @returns The node snapshot (immutable) or undefined if not found
 *
 * @example
 * ```tsx
 * function ConditionalField() {
 *   const showField = useDashFieldNode<boolean>('showEmail');
 *
 *   if (!showField?.value) {
 *     return null;
 *   }
 *
 *   return <input name="email" type="email" />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function FieldStatus() {
 *   const emailNode = useDashFieldNode('email');
 *
 *   if (!emailNode) {
 *     return <p>Field not initialized</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Value: {emailNode.value}</p>
 *       <p>Visible: {emailNode.visible ? 'Yes' : 'No'}</p>
 *       <p>Disabled: {emailNode.disabled ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashFieldNode<TValue = unknown>(
  nodeId: string
): Node<TValue> | undefined {
  const { debug } = useDashFormContext();

  // Use the existing useEngineNode hook from ui-core
  // This automatically subscribes to the node and triggers re-renders on changes
  const node = useEngineNode<TValue>(nodeId);

  // Log warning in debug mode if node doesn't exist
  // This helps developers catch missing node registrations
  if (debug && node === undefined) {
    console.warn(
      `[useDashFieldNode] Node "${nodeId}" not found in Engine. ` +
        `Make sure the node is registered before using this hook.`
    );
  }

  return node;
}
