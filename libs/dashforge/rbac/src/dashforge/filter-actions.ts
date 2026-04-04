/**
 * Action Filtering
 *
 * This module provides utilities for filtering action items based on RBAC permissions.
 *
 * V1 LIMITATION: This is a hide-only filter. It filters by visibility only.
 * The disabled and readonly states are NOT propagated by this utility.
 */

import type { AccessRequest } from '../core/types';
import type { ActionItem } from './types';
import { resolveAccessState } from './resolve-access-state';

/**
 * Filters actions based on access permissions.
 *
 * V1: Hide-only filtering.
 *
 * IMPORTANT: This utility ONLY decides visibility.
 * If an action has onUnauthorized='disable' or 'readonly',
 * those modes are IGNORED by filterActions().
 *
 * For disable/readonly support, use resolveAccessState() directly.
 *
 * @param actions - The actions to filter
 * @param canCheck - The RBAC permission checker function
 * @returns Filtered array of visible actions
 *
 * @example
 * ```typescript
 * const { can } = useRbac();
 * const visibleActions = filterActions(allActions, can);
 * return <ActionMenu actions={visibleActions} />;
 * ```
 *
 * @example
 * // For disable/readonly support, use resolveAccessState directly:
 * ```typescript
 * const actionsWithState = allActions.map(action => ({
 *   ...action,
 *   accessState: action.access ? resolveAccessState(action.access, can) : defaultState
 * })).filter(a => a.accessState.visible);
 * ```
 */
export function filterActions(
  actions: ActionItem[],
  canCheck: (request: AccessRequest) => boolean
): ActionItem[] {
  const result: ActionItem[] = [];

  for (const action of actions) {
    // If action has no access requirement, always include it
    if (!action.access) {
      result.push(action);
      continue;
    }

    // Resolve access state
    const state = resolveAccessState(action.access, canCheck);

    // V1: Only respect visibility
    // Ignore disabled/readonly states (not supported in filterActions)
    if (state.visible) {
      result.push(action);
    }
  }

  return result;
}
