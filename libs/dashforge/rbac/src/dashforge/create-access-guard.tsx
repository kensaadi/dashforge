/**
 * Access Guard Component Factory
 *
 * Creates access guard components for route/page protection.
 *
 * V1: ReactNode fallback only, no built-in redirect logic.
 * Redirect is the app/router's responsibility, not the library's.
 */

import React from 'react';
import { useRbac } from '../react/useRbac';
import type { AccessGuardConfig, AccessGuardProps } from './types';
import { resolveAccessState } from './resolve-access-state';

/**
 * Creates an access guard component for route/page protection.
 *
 * The guard wraps route content and enforces access.
 *
 * Router-agnostic: Does NOT handle redirects internally.
 * App code must handle redirect logic at router level.
 *
 * @param config - The guard configuration
 * @returns A guard component that can be used to wrap protected content
 *
 * @example
 * ```typescript
 * const BookingsGuard = createAccessGuard({
 *   access: { action: 'read', resource: 'booking' },
 *   fallback: <UnauthorizedPage />,
 * });
 *
 * // Usage in router
 * <Route
 *   path="/bookings"
 *   element={
 *     <BookingsGuard>
 *       <BookingsPage />
 *     </BookingsGuard>
 *   }
 * />
 *
 * // For redirect, handle at app/router level
 * <BookingsGuard fallback={<Navigate to="/unauthorized" replace />}>
 *   <BookingsPage />
 * </BookingsGuard>
 * ```
 */
export function createAccessGuard(
  config: AccessGuardConfig
): React.ComponentType<AccessGuardProps> {
  // Create and return the guard component
  function AccessGuard({
    children,
    access,
    fallback,
  }: AccessGuardProps): React.ReactElement | null {
    // Get RBAC checker from context
    const { can } = useRbac();

    // Determine which requirement to use (props override config)
    const requirement = access ?? config.access;

    // Resolve access state
    const state = resolveAccessState(requirement, can);

    // If access is granted, render children
    if (state.granted) {
      return <>{children}</>;
    }

    // Access denied - determine fallback
    const fallbackContent = fallback ?? config.fallback;

    // Render fallback or null
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    }

    return null;
  }

  // Set display name for debugging
  AccessGuard.displayName = 'AccessGuard';

  return AccessGuard;
}
