import { useMemo } from 'react';
import { useRbac, resolveAccessState } from '@dashforge/rbac';
import type { AccessRequirement, AccessState } from '@dashforge/rbac';

// Default full access state (used when no access requirement or no RbacProvider)
const DEFAULT_ACCESS_STATE: AccessState = {
  visible: true,
  disabled: false,
  readonly: false,
  granted: true,
};

/**
 * Hook to resolve RBAC access state for a UI component.
 *
 * This hook evaluates the provided AccessRequirement against the current
 * RBAC context and returns the resolved access state (visible/disabled/readonly).
 *
 * **Safe Fallback Behavior**:
 * - If `access` is undefined: Returns default full access state
 * - If `access` is defined but no RbacProvider exists: Returns default full access state
 *   with a development warning (fails safe to allow graceful degradation)
 *
 * **Memoization**:
 * - Returns stable object reference when access decision doesn't change
 * - Prevents unnecessary re-renders in consuming components
 *
 * @param access - Optional access requirement specification
 * @returns AccessState with visible, disabled, readonly, and granted flags
 *
 * @example
 * ```tsx
 * function MyComponent({ access }: { access?: AccessRequirement }) {
 *   const accessState = useAccessState(access);
 *
 *   if (!accessState.visible) return null;
 *
 *   return (
 *     <input
 *       disabled={accessState.disabled}
 *       readOnly={accessState.readonly}
 *     />
 *   );
 * }
 * ```
 */
export function useAccessState(
  access: AccessRequirement | undefined
): AccessState {
  // If no access requirement, return default full access (no RBAC evaluation needed)
  if (!access) {
    return DEFAULT_ACCESS_STATE;
  }

  // Attempt to use RBAC context
  let rbac;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    rbac = useRbac();
  } catch (error) {
    // No RbacProvider found - fail safe to full access
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[useAccessState] No RbacProvider found but access requirement was provided. ' +
          'Defaulting to full access. Wrap your component tree with <RbacProvider> to enable RBAC. ' +
          `Resource: ${access.resource}, Action: ${access.action}`
      );
    }
    return DEFAULT_ACCESS_STATE;
  }

  // Resolve to UI access state using memoization
  // This prevents creating new objects when access requirement doesn't change
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => resolveAccessState(access, rbac.can), [access, rbac]);
}
