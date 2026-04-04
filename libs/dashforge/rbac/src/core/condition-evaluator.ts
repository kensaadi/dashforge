/**
 * Condition Evaluator
 *
 * Evaluates permission conditions with fail-safe error handling.
 * Condition errors are caught and treated as false (deny).
 */

import type {
  Permission,
  Subject,
  AccessRequest,
  ConditionContext,
} from './types';

/**
 * Evaluates conditions for permissions.
 * Permissions without conditions are kept.
 * Permissions with conditions that return true are kept.
 * Permissions with conditions that return false, throw, or return non-boolean are discarded.
 *
 * @param permissions - Permissions to evaluate
 * @param subject - Subject requesting access
 * @param request - Access request
 * @returns Permissions that passed condition evaluation
 */
export function evaluateConditions(
  permissions: Permission[],
  subject: Subject,
  request: AccessRequest
): Permission[] {
  const passed: Permission[] = [];

  for (const permission of permissions) {
    if (!permission.condition) {
      passed.push(permission);
      continue;
    }

    try {
      const context: ConditionContext = {
        subject,
        ...(request.resourceData !== undefined && {
          resourceData: request.resourceData,
        }),
        ...(request.environment !== undefined && {
          environment: request.environment,
        }),
      };

      const result = permission.condition(context);

      if (result === true) {
        passed.push(permission);
      }
    } catch {
      // Fail-safe: condition error = deny
      // Do not propagate error to caller
      continue;
    }
  }

  return passed;
}
