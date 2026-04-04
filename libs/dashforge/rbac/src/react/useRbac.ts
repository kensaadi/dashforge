/**
 * useRbac Hook
 *
 * Provides access to bound RBAC helpers with automatic subject binding.
 * Must be used within RbacProvider.
 */

import { useContext, useMemo, useCallback } from 'react';
import { RbacContext } from './RbacContext';
import type { AccessRequest, AccessDecision, Subject } from '../core/types';

export interface UseRbacResult {
  can: (request: AccessRequest) => boolean;
  evaluate: (request: AccessRequest) => AccessDecision;
  subject: Subject;
}

/**
 * useRbac returns bound permission helpers and current subject.
 *
 * The can() and evaluate() functions automatically bind the current subject,
 * so callers don't need to pass it on every call.
 *
 * @throws Error if used outside RbacProvider
 * @returns Object with can, evaluate, and subject
 */
export function useRbac(): UseRbacResult {
  const contextValue = useContext(RbacContext);

  if (!contextValue) {
    throw new Error(
      'useRbac must be used within RbacProvider. ' +
        'Wrap your component tree with <RbacProvider>.'
    );
  }

  const { engine, subject } = contextValue;

  // Bind can() with current subject using useCallback for stability
  const can = useCallback(
    (request: AccessRequest): boolean => {
      return engine.can(subject, request);
    },
    [engine, subject]
  );

  // Bind evaluate() with current subject using useCallback for stability
  const evaluate = useCallback(
    (request: AccessRequest): AccessDecision => {
      return engine.evaluate(subject, request);
    },
    [engine, subject]
  );

  // Memoize result object to avoid unnecessary re-renders
  return useMemo(
    () => ({
      can,
      evaluate,
      subject,
    }),
    [can, evaluate, subject]
  );
}
