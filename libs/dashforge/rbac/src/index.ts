/**
 * @dashforge/rbac - Core RBAC V1
 *
 * Production-grade Role-Based Access Control for Dashforge.
 *
 * @packageDocumentation
 */

export { RbacEngine, createRbacEngine } from './core/rbac-engine';

export {
  RbacError,
  CircularRoleError,
  InvalidPermissionError,
  ConditionEvaluationError,
} from './core/errors';

export type {
  Subject,
  Permission,
  PermissionEffect,
  Role,
  RbacPolicy,
  AccessRequest,
  AccessDecision,
  ConditionContext,
  ConditionFunction,
} from './core/types';
