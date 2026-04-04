/**
 * RbacProvider Component
 *
 * Provides RBAC context to descendant components.
 * Creates and manages engine lifecycle.
 */

import React, { useMemo } from 'react';
import { createRbacEngine } from '../core/rbac-engine';
import { RbacContext } from './RbacContext';
import type { RbacPolicy, Subject } from '../core/types';

export interface RbacProviderProps {
  policy: RbacPolicy;
  subject: Subject | null | undefined;
  children: React.ReactNode;
}

/**
 * RbacProvider creates engine and provides context to children.
 *
 * Engine is created on mount and recreated only when policy changes.
 * Subject can be null/undefined and will be normalized to empty subject.
 */
export function RbacProvider({
  policy,
  subject,
  children,
}: RbacProviderProps): React.ReactElement {
  // Create engine once, recreate only when policy changes
  const engine = useMemo(() => createRbacEngine(policy), [policy]);

  // Normalize null/undefined subject to empty subject with no roles
  const normalizedSubject: Subject = useMemo(
    () =>
      subject ?? {
        id: '',
        roles: [],
      },
    [subject]
  );

  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      engine,
      subject: normalizedSubject,
    }),
    [engine, normalizedSubject]
  );

  return (
    <RbacContext.Provider value={contextValue}>{children}</RbacContext.Provider>
  );
}
