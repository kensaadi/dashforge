/**
 * RBAC Core Types
 *
 * Framework-agnostic type definitions for RBAC V1.
 * No runtime code in this file.
 */

/**
 * Subject represents the actor requesting access.
 */
export interface Subject {
  id: string;
  roles: string[];
  attributes?: Record<string, unknown>;
}

/**
 * Permission effect determines whether a permission grants or denies access.
 */
export type PermissionEffect = 'allow' | 'deny';

/**
 * Context passed to condition functions.
 */
export interface ConditionContext {
  subject: Subject;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
}

/**
 * Condition function evaluates whether a permission applies.
 * Must be synchronous and return boolean.
 * If throws or returns non-boolean, treated as false.
 */
export type ConditionFunction = (context: ConditionContext) => boolean;

/**
 * Permission defines a single access rule.
 */
export interface Permission {
  action: string;
  resource: string;
  effect?: PermissionEffect;
  condition?: ConditionFunction;
}

/**
 * Role defines a named collection of permissions with optional inheritance.
 */
export interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

/**
 * RbacPolicy is the complete RBAC configuration.
 */
export interface RbacPolicy {
  roles: Role[];
}

/**
 * AccessRequest represents a request to perform an action on a resource.
 */
export interface AccessRequest {
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
}

/**
 * AccessDecision contains the result of an access evaluation.
 * reason is for debugging and is not guaranteed to be present.
 */
export interface AccessDecision {
  granted: boolean;
  reason?: string;
}
