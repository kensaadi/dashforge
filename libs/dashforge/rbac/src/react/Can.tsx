/**
 * Can Component
 *
 * Declarative component for conditional rendering based on permissions.
 */

import React from 'react';
import { useCan } from './useCan';

export interface CanProps {
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Can component conditionally renders children based on permission check.
 *
 * The component constructs an AccessRequest from props during render and
 * evaluates the permission. If granted, children are rendered. If denied,
 * fallback (or null) is rendered.
 *
 * Request construction happens on every render without internal memoization.
 * This is acceptable for V1 as permission checks are fast.
 *
 * @example
 * ```tsx
 * <Can action="delete" resource="booking">
 *   <DeleteButton />
 * </Can>
 *
 * <Can
 *   action="edit"
 *   resource="booking"
 *   resourceData={{ ownerId: booking.ownerId }}
 *   fallback={<DisabledButton />}
 * >
 *   <EditButton />
 * </Can>
 * ```
 */
export function Can({
  action,
  resource,
  resourceData,
  environment,
  fallback,
  children,
}: CanProps): React.ReactElement | null {
  // Construct request from props during render (no memoization in V1)
  const request = {
    action,
    resource,
    ...(resourceData !== undefined && { resourceData }),
    ...(environment !== undefined && { environment }),
  };

  const granted = useCan(request);

  if (granted) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}
