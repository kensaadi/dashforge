/**
 * Permission Evaluator
 *
 * Handles permission matching and precedence logic.
 * CRITICAL: Wildcards are ONLY supported on permission side, NOT request side.
 */

import type { Permission, AccessRequest } from './types';

/**
 * Matches permissions against a request.
 * Only permissions with wildcards are treated as wildcards.
 * Request wildcards are NOT supported.
 *
 * @param permissions - Permissions to check
 * @param request - Access request
 * @returns Permissions that match the request
 */
export function matchPermissions(
  permissions: Permission[],
  request: AccessRequest
): Permission[] {
  const matched: Permission[] = [];

  for (const permission of permissions) {
    const actionMatch =
      permission.action === request.action || permission.action === '*';

    const resourceMatch =
      permission.resource === request.resource || permission.resource === '*';

    if (actionMatch && resourceMatch) {
      matched.push(permission);
    }
  }

  return matched;
}

/**
 * Applies precedence rules to permissions.
 * Deny always overrides allow.
 * Default is deny if no permissions.
 *
 * @param permissions - Permissions to evaluate
 * @returns True if access granted, false otherwise
 */
export function applyPrecedence(permissions: Permission[]): boolean {
  const hasDeny = permissions.some((p) => p.effect === 'deny');
  if (hasDeny) {
    return false;
  }

  const hasAllow = permissions.some((p) => !p.effect || p.effect === 'allow');
  if (hasAllow) {
    return true;
  }

  return false;
}
