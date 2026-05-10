import { useMemo } from 'react';
import { useRbacOptional, resolveAccessState } from '@dashforge/rbac';
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
  // Hooks are called unconditionally to comply with the rules of hooks.
  // useRbacOptional() returns null when no RbacProvider is mounted (no throw).
  const rbac = useRbacOptional();

  return useMemo(() => {
    if (!access) {
      return DEFAULT_ACCESS_STATE;
    }

    if (!rbac) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[useAccessState] No RbacProvider found but access requirement was provided. ' +
            'Defaulting to full access. Wrap your component tree with <RbacProvider> to enable RBAC. ' +
            `Resource: ${access.resource}, Action: ${access.action}`
        );
      }
      return DEFAULT_ACCESS_STATE;
    }

    return resolveAccessState(access, (request) =>
      rbac.engine.can(rbac.subject, request)
    );
  }, [access, rbac]);
}
