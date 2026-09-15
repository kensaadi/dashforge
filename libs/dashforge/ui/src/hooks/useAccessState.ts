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

/**
 * Resolve RBAC access state for an array of requirements in ONE hook.
 *
 * `useAccessState` is scalar and, called in `arr.map(useAccessState)`, ties
 * React's hook count to `arr.length`. That is unsound: an async options load
 * that changes `arr.length` breaks the rules of hooks the same way a
 * conditional call would, and the workaround upstream was an
 * `eslint-disable-next-line` on the offending map. Use this hook instead when
 * you have to resolve access for a variable-length collection (e.g. option
 * lists): a single hook call, stable across renders regardless of length.
 *
 * See `libs/dashforge/README-BUG.md` § BUG 16.
 *
 * @param accesses - Array of optional access requirements (one per item)
 * @returns Array of AccessState in the same order as the input
 */
export function useAccessStates(
  accesses: readonly (AccessRequirement | undefined)[]
): AccessState[] {
  const rbac = useRbacOptional();

  return useMemo(() => {
    return accesses.map((access) => {
      if (!access) {
        return DEFAULT_ACCESS_STATE;
      }

      if (!rbac) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[useAccessStates] No RbacProvider found but an access requirement was provided. ' +
              'Defaulting to full access. Wrap your component tree with <RbacProvider> to enable RBAC. ' +
              `Resource: ${access.resource}, Action: ${access.action}`
          );
        }
        return DEFAULT_ACCESS_STATE;
      }

      return resolveAccessState(access, (request) =>
        rbac.engine.can(rbac.subject, request)
      );
    });
  }, [accesses, rbac]);
}
