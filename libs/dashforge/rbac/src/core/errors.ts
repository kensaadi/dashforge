/**
 * RBAC Error Classes
 */

import type { Permission } from './types';

/**
 * Base error class for all RBAC errors.
 */
export class RbacError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'RBAC_ERROR') {
    super(message);
    this.name = 'RbacError';
    this.code = code;
    Object.setPrototypeOf(this, RbacError.prototype);
  }
}

/**
 * Thrown when circular role inheritance is detected.
 */
export class CircularRoleError extends RbacError {
  public readonly roles: string[];

  constructor(roles: string[]) {
    super(
      `Circular role inheritance detected: ${roles.join(' -> ')}`,
      'CIRCULAR_ROLE'
    );
    this.name = 'CircularRoleError';
    this.roles = roles;
    Object.setPrototypeOf(this, CircularRoleError.prototype);
  }
}

/**
 * Thrown when a permission is malformed or invalid.
 */
export class InvalidPermissionError extends RbacError {
  public readonly permission: Permission;

  constructor(permission: Permission, reason: string) {
    super(`Invalid permission: ${reason}`, 'INVALID_PERMISSION');
    this.name = 'InvalidPermissionError';
    this.permission = permission;
    Object.setPrototypeOf(this, InvalidPermissionError.prototype);
  }
}

/**
 * Thrown when condition evaluation fails critically.
 * Note: In normal evaluation flow, condition errors are caught and treated as false.
 * This error is used for validation or critical failures only.
 */
export class ConditionEvaluationError extends RbacError {
  public readonly permission: Permission;
  public readonly originalError: Error;

  constructor(permission: Permission, originalError: Error) {
    super(
      `Condition evaluation failed: ${originalError.message}`,
      'CONDITION_EVALUATION'
    );
    this.name = 'ConditionEvaluationError';
    this.permission = permission;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ConditionEvaluationError.prototype);
  }
}
