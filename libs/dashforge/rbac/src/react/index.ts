/**
 * @dashforge/rbac - React Layer
 *
 * React adapter for RBAC V1.
 * Provides context, hooks, and components for permission-based rendering.
 *
 * @packageDocumentation
 */

export { RbacProvider } from './RbacProvider';
export type { RbacProviderProps } from './RbacProvider';

export { useRbac } from './useRbac';
export type { UseRbacResult } from './useRbac';

export { useCan } from './useCan';

export { Can } from './Can';
export type { CanProps } from './Can';

export type { RbacContextValue } from './RbacContext';
