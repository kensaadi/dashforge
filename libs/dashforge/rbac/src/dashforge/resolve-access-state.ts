/**
 * Access State Resolution
 *
 * This module provides the central function for mapping RBAC decisions
 * to UI access states.
 *
 * IMPORTANT: This is the single source of truth for access state resolution.
 * No other code should duplicate this logic.
 */

import type { AccessRequest } from '../core/types';
import type { AccessRequirement, AccessState } from './types';

/**
 * Resolves RBAC permission decision to UI access state.
 *
 * This is the single source of truth for mapping RBAC decisions
 * to Dashforge UI states.
 *
 * @param requirement - The access requirement (what permission is needed)
 * @param canCheck - The RBAC permission checker function
 * @returns The resolved access state for the UI component
 *
 * @example
 * ```typescript
 * const { can } = useRbac();
 * const accessState = resolveAccessState(
 *   { action: 'delete', resource: 'booking', onUnauthorized: 'disable' },
 *   can
 * );
 *
 * if (!accessState.visible) return null;
 * return <Button disabled={accessState.disabled} />;
 * ```
 */
export function resolveAccessState(
  requirement: AccessRequirement,
  canCheck: (request: AccessRequest) => boolean
): AccessState {
  // Step 1: Build access request (only include defined properties)
  const request: AccessRequest = {
    action: requirement.action,
    resource: requirement.resource,
  };

  if (requirement.resourceData !== undefined) {
    request.resourceData = requirement.resourceData;
  }

  if (requirement.environment !== undefined) {
    request.environment = requirement.environment;
  }

  // Step 2: Check RBAC permission
  const granted = canCheck(request);

  // Step 3: If access is granted, return fully accessible state
  if (granted) {
    return {
      visible: true,
      disabled: false,
      readonly: false,
      granted: true,
    };
  }

  // Step 4: Access is denied - determine behavior
  const behavior = requirement.onUnauthorized ?? 'hide';

  // Step 5: Resolve states based on behavior
  switch (behavior) {
    case 'hide':
      return {
        visible: false,
        disabled: false,
        readonly: false,
        granted: false,
      };

    case 'disable':
      return {
        visible: true,
        disabled: true,
        readonly: false,
        granted: false,
      };

    case 'readonly':
      return {
        visible: true,
        disabled: false,
        readonly: true,
        granted: false,
      };

    default:
      // This should never happen with correct TypeScript types
      // But we handle it defensively
      return {
        visible: false,
        disabled: false,
        readonly: false,
        granted: false,
      };
  }
}
