/**
 * Dashforge Integration Layer for RBAC V1
 *
 * Public API exports for Dashforge-specific RBAC utilities.
 *
 * This layer connects the framework-agnostic RBAC core/react layers
 * to Dashforge-specific frontend concerns (routing, navigation, actions, component access).
 */

// Types
export type {
  UnauthorizedBehavior,
  AccessRequirement,
  AccessState,
  NavigationItem,
  ActionItem,
  AccessGuardConfig,
  AccessGuardProps,
} from './types';

// Utilities
export { resolveAccessState } from './resolve-access-state';
export { filterNavigationItems } from './filter-navigation-items';
export { filterActions } from './filter-actions';
export { createAccessGuard } from './create-access-guard';
