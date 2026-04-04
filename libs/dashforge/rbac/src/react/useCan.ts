/**
 * useCan Hook
 *
 * Convenience hook for permission checks.
 * Returns boolean result for conditional rendering.
 */

import { useRbac } from './useRbac';
import type { AccessRequest } from '../core/types';

/**
 * useCan checks if the current subject can perform the requested action.
 *
 * This hook does NOT memoize the request object. If the request is constructed
 * inline and contains dynamic data, consider memoizing it with useMemo for
 * performance-critical cases.
 *
 * @param request - The access request to evaluate
 * @returns true if permission granted, false otherwise
 * @throws Error if used outside RbacProvider
 *
 * @example
 * ```tsx
 * function BookingActions() {
 *   const canDelete = useCan({ action: 'delete', resource: 'booking' });
 *   return canDelete ? <DeleteButton /> : null;
 * }
 * ```
 */
export function useCan(request: AccessRequest): boolean {
  const { can } = useRbac();
  return can(request);
}
