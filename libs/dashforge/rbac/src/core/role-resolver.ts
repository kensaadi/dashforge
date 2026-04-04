/**
 * Role Resolver
 *
 * Resolves role inheritance with circular dependency detection.
 */

import { CircularRoleError } from './errors';
import type { RbacPolicy } from './types';

/**
 * Resolves role names with inheritance, detecting circular dependencies.
 *
 * @param roleNames - Initial role names to resolve
 * @param policy - RBAC policy containing role definitions
 * @returns Flattened array of unique role names after resolving inheritance
 * @throws {CircularRoleError} If circular inheritance is detected
 */
export function resolveRoles(
  roleNames: string[],
  policy: RbacPolicy
): string[] {
  const result: string[] = [];
  const visited = new Set<string>();

  function resolve(currentRoleName: string, stack: string[]): void {
    if (stack.includes(currentRoleName)) {
      throw new CircularRoleError([...stack, currentRoleName]);
    }

    const role = policy.roles.find((r) => r.name === currentRoleName);
    if (!role) {
      return;
    }

    if (visited.has(currentRoleName)) {
      return;
    }

    visited.add(currentRoleName);
    result.push(currentRoleName);

    if (role.inherits) {
      const newStack = [...stack, currentRoleName];
      for (const inheritedRoleName of role.inherits) {
        resolve(inheritedRoleName, newStack);
      }
    }
  }

  for (const roleName of roleNames) {
    resolve(roleName, []);
  }

  return result;
}
