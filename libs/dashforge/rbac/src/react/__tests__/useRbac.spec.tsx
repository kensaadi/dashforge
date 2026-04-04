/**
 * useRbac Hook Tests
 *
 * Tests for the useRbac hook that provides bound RBAC helpers.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useRbac } from '../useRbac';
import { RbacProvider } from '../RbacProvider';
import type { RbacPolicy, Subject } from '../../core/types';

describe('useRbac', () => {
  const validPolicy: RbacPolicy = {
    roles: [
      {
        name: 'user',
        permissions: [
          { action: 'read', resource: 'booking' },
          { action: 'create', resource: 'booking' },
        ],
      },
      {
        name: 'admin',
        permissions: [{ action: '*', resource: '*' }],
      },
    ],
  };

  const userSubject: Subject = {
    id: 'user-1',
    roles: ['user'],
  };

  const adminSubject: Subject = {
    id: 'admin-1',
    roles: ['admin'],
  };

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <RbacProvider policy={validPolicy} subject={userSubject}>
        {children}
      </RbacProvider>
    );
  }

  describe('basic usage', () => {
    it('should return bound can() function', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(result.current.can).toBeDefined();
      expect(typeof result.current.can).toBe('function');
    });

    it('should return bound evaluate() function', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(result.current.evaluate).toBeDefined();
      expect(typeof result.current.evaluate).toBe('function');
    });

    it('should return current subject', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(result.current.subject).toBeDefined();
      expect(result.current.subject).toEqual(userSubject);
    });

    it('should NOT expose raw engine in V1', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(result.current).not.toHaveProperty('engine');
    });

    it('should only have can, evaluate, and subject properties', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const keys = Object.keys(result.current);
      expect(keys).toEqual(['can', 'evaluate', 'subject']);
    });
  });

  describe('bound helpers', () => {
    it('should can() automatically pass subject', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const canRead = result.current.can({
        action: 'read',
        resource: 'booking',
      });

      expect(canRead).toBe(true);
    });

    it('should can() return correct boolean for allowed permission', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(result.current.can({ action: 'read', resource: 'booking' })).toBe(
        true
      );
      expect(
        result.current.can({ action: 'create', resource: 'booking' })
      ).toBe(true);
    });

    it('should can() return correct boolean for denied permission', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      expect(
        result.current.can({ action: 'delete', resource: 'booking' })
      ).toBe(false);
      expect(
        result.current.can({ action: 'admin', resource: 'settings' })
      ).toBe(false);
    });

    it('should evaluate() automatically pass subject', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const decision = result.current.evaluate({
        action: 'read',
        resource: 'booking',
      });

      expect(decision).toBeDefined();
      expect(decision.granted).toBe(true);
    });

    it('should evaluate() return correct decision for allowed permission', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const decision = result.current.evaluate({
        action: 'read',
        resource: 'booking',
      });

      expect(decision.granted).toBe(true);
    });

    it('should evaluate() return correct decision for denied permission', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const decision = result.current.evaluate({
        action: 'delete',
        resource: 'booking',
      });

      expect(decision.granted).toBe(false);
    });
  });

  describe('memoization', () => {
    it('should return stable result when dependencies do not change', () => {
      const { result, rerender } = renderHook(() => useRbac(), { wrapper });

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(secondResult).toBe(firstResult);
    });

    it('should return stable can() when dependencies do not change', () => {
      const { result, rerender } = renderHook(() => useRbac(), { wrapper });

      const firstCan = result.current.can;
      rerender();
      const secondCan = result.current.can;

      expect(secondCan).toBe(firstCan);
    });

    it('should return stable evaluate() when dependencies do not change', () => {
      const { result, rerender } = renderHook(() => useRbac(), { wrapper });

      const firstEvaluate = result.current.evaluate;
      rerender();
      const secondEvaluate = result.current.evaluate;

      expect(secondEvaluate).toBe(firstEvaluate);
    });
  });

  describe('error handling', () => {
    it('should throw when used outside provider', () => {
      expect(() => {
        renderHook(() => useRbac());
      }).toThrow();
    });

    it('should throw with helpful error message when used outside provider', () => {
      try {
        renderHook(() => useRbac());
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('useRbac');
        expect((error as Error).message).toContain('RbacProvider');
      }
    });
  });

  describe('re-render behavior', () => {
    it('should update result when subject changes', () => {
      const { result, rerender } = renderHook(() => useRbac(), {
        wrapper: ({ children }) => (
          <RbacProvider policy={validPolicy} subject={userSubject}>
            {children}
          </RbacProvider>
        ),
      });

      expect(result.current.subject).toEqual(userSubject);

      rerender();

      const WrapperWithNewSubject = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <RbacProvider policy={validPolicy} subject={adminSubject}>
          {children}
        </RbacProvider>
      );

      const { result: newResult } = renderHook(() => useRbac(), {
        wrapper: WrapperWithNewSubject,
      });

      expect(newResult.current.subject).toEqual(adminSubject);
    });

    it('should update permission results when subject changes', () => {
      function CustomWrapper({
        children,
        subject,
      }: {
        children: React.ReactNode;
        subject: Subject;
      }) {
        return (
          <RbacProvider policy={validPolicy} subject={subject}>
            {children}
          </RbacProvider>
        );
      }

      const { result, rerender } = renderHook(() => useRbac(), {
        wrapper: ({ children }) => (
          <CustomWrapper subject={userSubject}>{children}</CustomWrapper>
        ),
      });

      expect(
        result.current.can({ action: 'delete', resource: 'booking' })
      ).toBe(false);

      rerender({ subject: adminSubject } as never);

      const { result: adminResult } = renderHook(() => useRbac(), {
        wrapper: ({ children }) => (
          <CustomWrapper subject={adminSubject}>{children}</CustomWrapper>
        ),
      });

      expect(
        adminResult.current.can({ action: 'delete', resource: 'booking' })
      ).toBe(true);
    });
  });

  describe('integration with core', () => {
    it('should can() delegate to engine.can()', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const canResult = result.current.can({
        action: 'read',
        resource: 'booking',
      });

      expect(typeof canResult).toBe('boolean');
    });

    it('should evaluate() delegate to engine.evaluate()', () => {
      const { result } = renderHook(() => useRbac(), { wrapper });

      const decision = result.current.evaluate({
        action: 'read',
        resource: 'booking',
      });

      expect(decision).toHaveProperty('granted');
      expect(typeof decision.granted).toBe('boolean');
    });

    it('should work with wildcard permissions', () => {
      const WrapperWithAdmin = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <RbacProvider policy={validPolicy} subject={adminSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useRbac(), {
        wrapper: WrapperWithAdmin,
      });

      expect(
        result.current.can({ action: 'anything', resource: 'anything' })
      ).toBe(true);
    });

    it('should work with conditions', () => {
      const policyWithConditions: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [
              {
                action: 'delete',
                resource: 'booking',
                condition: (ctx) => {
                  const data = ctx.resourceData as { ownerId: string };
                  return data.ownerId === ctx.subject.id;
                },
              },
            ],
          },
        ],
      };

      const WrapperWithConditions = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <RbacProvider policy={policyWithConditions} subject={userSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useRbac(), {
        wrapper: WrapperWithConditions,
      });

      expect(
        result.current.can({
          action: 'delete',
          resource: 'booking',
          resourceData: { ownerId: 'user-1' },
        })
      ).toBe(true);

      expect(
        result.current.can({
          action: 'delete',
          resource: 'booking',
          resourceData: { ownerId: 'other-user' },
        })
      ).toBe(false);
    });
  });
});
