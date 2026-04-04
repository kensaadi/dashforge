/**
 * @dashforge/rbac - Core RBAC V1
 *
 * Production-grade Role-Based Access Control for Dashforge.
 *
 * @packageDocumentation
 */

// Core exports
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

// React layer exports (re-export from react/index)
export { RbacProvider } from './react/RbacProvider';
export { useRbac } from './react/useRbac';
export { useCan } from './react/useCan';
export { Can } from './react/Can';

// Dashforge integration layer exports (re-export from dashforge/index)
export type {
  UnauthorizedBehavior,
  AccessRequirement,
  AccessState,
  NavigationItem,
  ActionItem,
  AccessGuardConfig,
  AccessGuardProps,
} from './dashforge/types';

export {
  resolveAccessState,
  filterNavigationItems,
  filterActions,
  createAccessGuard,
} from './dashforge/index';
