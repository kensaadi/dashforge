/**
 * useCan Hook Tests
 *
 * Tests for the useCan convenience hook.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useCan } from '../useCan';
import { RbacProvider } from '../RbacProvider';
import type { RbacPolicy, Subject } from '../../core/types';

describe('useCan', () => {
  const validPolicy: RbacPolicy = {
    roles: [
      {
        name: 'user',
        permissions: [
          { action: 'read', resource: 'booking' },
          { action: 'create', resource: 'booking' },
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

  function createWrapper(subject: Subject) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <RbacProvider policy={validPolicy} subject={subject}>
          {children}
        </RbacProvider>
      );
    };
  }

  describe('basic usage', () => {
    it('should return true when permission granted', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should return false when permission denied', () => {
      const { result } = renderHook(
        () => useCan({ action: 'delete', resource: 'settings' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(false);
    });

    it('should accept full AccessRequest object', () => {
      const { result } = renderHook(
        () =>
          useCan({
            action: 'read',
            resource: 'booking',
            resourceData: { id: '123' },
            environment: { ip: '127.0.0.1' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('request variations', () => {
    it('should work with action and resource only', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should work with resourceData', () => {
      const { result } = renderHook(
        () =>
          useCan({
            action: 'delete',
            resource: 'booking',
            resourceData: { ownerId: 'user-1' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should work with environment', () => {
      const { result } = renderHook(
        () =>
          useCan({
            action: 'read',
            resource: 'booking',
            environment: { time: 'day' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should work with all fields', () => {
      const { result } = renderHook(
        () =>
          useCan({
            action: 'delete',
            resource: 'booking',
            resourceData: { ownerId: 'user-1' },
            environment: { ip: '127.0.0.1' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });
  });

  describe('request object handling', () => {
    it('should NOT require caller to memoize simple requests', () => {
      const { result, rerender } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should work with inline request object construction', () => {
      function TestComponent() {
        const canDelete = useCan({ action: 'delete', resource: 'booking' });
        return <div>{canDelete ? 'Can delete' : 'Cannot delete'}</div>;
      }

      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should throw when used outside provider', () => {
      expect(() => {
        renderHook(() => useCan({ action: 'read', resource: 'booking' }));
      }).toThrow();
    });

    it('should throw with helpful error message when used outside provider', () => {
      try {
        renderHook(() => useCan({ action: 'read', resource: 'booking' }));
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('useRbac');
        expect((error as Error).message).toContain('RbacProvider');
      }
    });
  });

  describe('subject binding', () => {
    it('should automatically use subject from context', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should update result when subject changes', () => {
      const { result: userResult } = renderHook(
        () => useCan({ action: 'delete', resource: 'settings' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(userResult.current).toBe(false);

      const { result: adminResult } = renderHook(
        () => useCan({ action: 'delete', resource: 'settings' }),
        { wrapper: createWrapper(adminSubject) }
      );

      expect(adminResult.current).toBe(true);
    });
  });

  describe('integration', () => {
    it('should work with complex policies', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(result.current).toBe(true);
    });

    it('should work with conditions', () => {
      const { result: ownBooking } = renderHook(
        () =>
          useCan({
            action: 'delete',
            resource: 'booking',
            resourceData: { ownerId: 'user-1' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(ownBooking.current).toBe(true);

      const { result: otherBooking } = renderHook(
        () =>
          useCan({
            action: 'delete',
            resource: 'booking',
            resourceData: { ownerId: 'other-user' },
          }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(otherBooking.current).toBe(false);
    });

    it('should work with role inheritance', () => {
      const policyWithInheritance: RbacPolicy = {
        roles: [
          {
            name: 'base',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
          {
            name: 'extended',
            permissions: [{ action: 'create', resource: 'booking' }],
            inherits: ['base'],
          },
        ],
      };

      const extendedSubject: Subject = {
        id: 'extended-1',
        roles: ['extended'],
      };

      function WrapperWithInheritance({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <RbacProvider
            policy={policyWithInheritance}
            subject={extendedSubject}
          >
            {children}
          </RbacProvider>
        );
      }

      const { result: canRead } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: WrapperWithInheritance }
      );

      expect(canRead.current).toBe(true);

      const { result: canCreate } = renderHook(
        () => useCan({ action: 'create', resource: 'booking' }),
        { wrapper: WrapperWithInheritance }
      );

      expect(canCreate.current).toBe(true);
    });

    it('should work with wildcard permissions', () => {
      const { result } = renderHook(
        () => useCan({ action: 'anything', resource: 'anything' }),
        { wrapper: createWrapper(adminSubject) }
      );

      expect(result.current).toBe(true);
    });
  });

  describe('return value', () => {
    it('should return primitive boolean', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(typeof result.current).toBe('boolean');
    });

    it('should not return object', () => {
      const { result } = renderHook(
        () => useCan({ action: 'read', resource: 'booking' }),
        { wrapper: createWrapper(userSubject) }
      );

      expect(typeof result.current).not.toBe('object');
    });
  });
});
