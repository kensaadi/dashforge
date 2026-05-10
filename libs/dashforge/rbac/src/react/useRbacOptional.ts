/**
 * useRbacOptional Hook
 *
 * Non-throwing variant of useRbac. Returns the raw RbacContextValue (engine + subject)
 * if a RbacProvider is present in the tree, or null otherwise.
 *
 * Designed for consumers that need to degrade gracefully when no provider is mounted
 * (e.g. UI components that opt-in to RBAC via an `access` prop and must remain usable
 * outside of a RbacProvider). Allows callers to satisfy React's rules of hooks
 * without resorting to try/catch around useRbac().
 */

import { useContext } from 'react';
import { RbacContext } from './RbacContext';
import type { RbacContextValue } from './RbacContext';

export function useRbacOptional(): RbacContextValue | null {
  return useContext(RbacContext);
}
