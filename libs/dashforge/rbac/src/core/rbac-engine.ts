/**
 * RBAC Engine
 *
 * Main orchestration layer for RBAC evaluation.
 */

import { RbacError, InvalidPermissionError } from './errors';
import { resolveRoles } from './role-resolver';
import { matchPermissions, applyPrecedence } from './permission-evaluator';
import { evaluateConditions } from './condition-evaluator';
import type {
  RbacPolicy,
  Subject,
  AccessRequest,
  AccessDecision,
  Permission,
} from './types';

/**
 * Validates an RBAC policy.
 * Throws if policy is invalid (circular roles, malformed permissions).
 *
 * @param policy - Policy to validate
 * @throws {CircularRoleError} If circular role inheritance detected
 * @throws {InvalidPermissionError} If permission is malformed
 */
export function validatePolicy(policy: RbacPolicy): void {
  for (const role of policy.roles) {
    resolveRoles([role.name], policy);

    for (const permission of role.permissions) {
      if (
        typeof permission.action !== 'string' ||
        permission.action.trim() === ''
      ) {
        throw new InvalidPermissionError(
          permission,
          'action must be a non-empty string'
        );
      }

      if (
        typeof permission.resource !== 'string' ||
        permission.resource.trim() === ''
      ) {
        throw new InvalidPermissionError(
          permission,
          'resource must be a non-empty string'
        );
      }

      if (
        permission.effect !== undefined &&
        permission.effect !== 'allow' &&
        permission.effect !== 'deny'
      ) {
        throw new InvalidPermissionError(
          permission,
          'effect must be "allow" or "deny"'
        );
      }
    }
  }
}

/**
 * RBAC Engine for evaluating permissions.
 */
export class RbacEngine {
  private readonly policy: RbacPolicy;

  constructor(policy: RbacPolicy) {
    this.policy = policy;
    validatePolicy(policy);
  }

  /**
   * Evaluates whether a subject can perform an action on a resource.
   *
   * @param subject - Subject requesting access
   * @param request - Access request
   * @returns True if access granted, false otherwise
   * @throws {RbacError} If subject or request is invalid
   */
  can(subject: Subject, request: AccessRequest): boolean {
    this.validateInputs(subject, request);

    const resolvedRoles = resolveRoles(subject.roles, this.policy);
    const allPermissions = this.collectPermissions(resolvedRoles);
    const matchedPermissions = matchPermissions(allPermissions, request);
    const validPermissions = evaluateConditions(
      matchedPermissions,
      subject,
      request
    );
    const granted = applyPrecedence(validPermissions);

    return granted;
  }

  /**
   * Evaluates access and returns detailed decision.
   *
   * @param subject - Subject requesting access
   * @param request - Access request
   * @returns Access decision with reason
   * @throws {RbacError} If subject or request is invalid
   */
  evaluate(subject: Subject, request: AccessRequest): AccessDecision {
    const granted = this.can(subject, request);

    const reason = granted
      ? `Access granted for ${request.action} on ${request.resource}`
      : `Access denied for ${request.action} on ${request.resource}`;

    return { granted, reason };
  }

  /**
   * Gets all effective permissions for a subject after resolving inheritance.
   *
   * @param subject - Subject to get permissions for
   * @returns Array of effective permissions
   */
  getEffectivePermissions(subject: Subject): Permission[] {
    const resolvedRoles = resolveRoles(subject.roles, this.policy);
    return this.collectPermissions(resolvedRoles);
  }

  /**
   * Validates the policy.
   *
   * @throws {CircularRoleError} If circular role inheritance detected
   * @throws {InvalidPermissionError} If permission is malformed
   */
  validatePolicy(): void {
    validatePolicy(this.policy);
  }

  private collectPermissions(roleNames: string[]): Permission[] {
    const permissions: Permission[] = [];

    for (const roleName of roleNames) {
      const role = this.policy.roles.find((r) => r.name === roleName);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    return permissions;
  }

  private validateInputs(subject: Subject, request: AccessRequest): void {
    if (!subject || typeof subject !== 'object') {
      throw new RbacError('Subject must be a valid object', 'INVALID_SUBJECT');
    }

    if (!request || typeof request !== 'object') {
      throw new RbacError('Request must be a valid object', 'INVALID_REQUEST');
    }

    if (!Array.isArray(subject.roles)) {
      throw new RbacError('Subject.roles must be an array', 'INVALID_SUBJECT');
    }

    if (typeof request.action !== 'string') {
      throw new RbacError('Request.action must be a string', 'INVALID_REQUEST');
    }

    if (typeof request.resource !== 'string') {
      throw new RbacError(
        'Request.resource must be a string',
        'INVALID_REQUEST'
      );
    }
  }
}

/**
 * Factory function to create an RBAC engine.
 *
 * @param policy - RBAC policy
 * @returns RBAC engine instance
 * @throws {CircularRoleError} If circular role inheritance detected
 * @throws {InvalidPermissionError} If permission is malformed
 */
export function createRbacEngine(policy: RbacPolicy): RbacEngine {
  return new RbacEngine(policy);
}
