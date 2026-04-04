/**
 * RBAC Context
 *
 * React context for RBAC engine and subject.
 * Context value contains only engine and subject (not policy).
 */

import { createContext } from 'react';
import type { RbacEngine } from '../core/rbac-engine';
import type { Subject } from '../core/types';

/**
 * RbacContextValue stores the engine and current subject.
 * Policy is NOT included - it's managed internally by the provider.
 */
export interface RbacContextValue {
  engine: RbacEngine;
  subject: Subject;
}

/**
 * RbacContext provides engine and subject to descendant components.
 * Value is null when outside provider.
 */
export const RbacContext = createContext<RbacContextValue | null>(null);
