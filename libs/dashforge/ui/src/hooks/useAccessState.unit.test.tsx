import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { useAccessState } from './useAccessState';
import type { AccessRequirement } from '@dashforge/rbac';

/**
 * Unit tests for useAccessState hook.
 *
 * This hook resolves RBAC access requirements to UI access state.
 * It must be safe when no RbacProvider is present and return memoized results.
 */

// Test policies
const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};

const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'guest',
      permissions: [], // No permissions
    },
  ],
};

const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: 'document', action: 'read', effect: 'allow' },
        { resource: 'document', action: 'update', effect: 'deny' },
      ],
    },
  ],
};

// Test subjects
const adminSubject: Subject = {
  id: 'admin-user',
  roles: ['admin'],
};

const guestSubject: Subject = {
  id: 'guest-user',
  roles: ['guest'],
};

const viewerSubject: Subject = {
  id: 'viewer-user',
  roles: ['viewer'],
};

describe('useAccessState', () => {
  describe('Intent A: No access requirement provided', () => {
    it('returns default full access state when access is undefined', () => {
      const { result } = renderHook(() => useAccessState(undefined));

      expect(result.current).toEqual({
        visible: true,
        disabled: false,
        readonly: false,
        granted: true,
      });
    });

    it('returns stable object identity across re-renders when access is undefined', () => {
      const { result, rerender } = renderHook(() => useAccessState(undefined));

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult); // Same reference
    });
  });

  describe('Intent B: Access requirement provided with RbacProvider', () => {
    it('returns granted access state when user has permission', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'read',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={FULL_ACCESS_POLICY} subject={adminSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useAccessState(access), { wrapper });

      expect(result.current).toEqual({
        visible: true,
        disabled: false,
        readonly: false,
        granted: true,
      });
    });

    it('returns denied access state with hide when user lacks permission', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'delete',
        onUnauthorized: 'hide',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useAccessState(access), { wrapper });

      expect(result.current).toEqual({
        visible: false,
        disabled: false,
        readonly: false,
        granted: false,
      });
    });

    it('returns denied access state with disable when user lacks permission', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        onUnauthorized: 'disable',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewerSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useAccessState(access), { wrapper });

      expect(result.current).toEqual({
        visible: true,
        disabled: true,
        readonly: false,
        granted: false,
      });
    });

    it('returns denied access state with readonly when user lacks permission', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        onUnauthorized: 'readonly',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewerSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useAccessState(access), { wrapper });

      expect(result.current).toEqual({
        visible: true,
        disabled: false,
        readonly: true,
        granted: false,
      });
    });

    it('passes resourceData to access check', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        resourceData: { ownerId: 'admin-user' },
      };

      const policyWithCondition: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [
              {
                resource: 'document',
                action: 'update',
                effect: 'allow',
                condition: ({ subject, resourceData }) => {
                  const data = resourceData as { ownerId?: string } | undefined;
                  return data?.ownerId === subject.id;
                },
              },
            ],
          },
        ],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={policyWithCondition} subject={adminSubject}>
          {children}
        </RbacProvider>
      );

      const { result } = renderHook(() => useAccessState(access), { wrapper });

      expect(result.current.granted).toBe(true);
    });
  });

  describe('Intent C: Safe behavior without RbacProvider', () => {
    it('returns default full access when access is defined but no RbacProvider exists', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'read',
      };

      // Suppress expected warning
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // No wrapper - no RbacProvider
      const { result } = renderHook(() => useAccessState(access));

      expect(result.current).toEqual({
        visible: true,
        disabled: false,
        readonly: false,
        granted: true,
      });

      consoleWarnSpy.mockRestore();
    });

    it('logs development warning when no RbacProvider but access is defined', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'read',
      };

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderHook(() => useAccessState(access));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('useAccessState')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No RbacProvider found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('does not log warning in production when no RbacProvider', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const access: AccessRequirement = {
        resource: 'document',
        action: 'read',
      };

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderHook(() => useAccessState(access));

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Intent D: Memoization behavior', () => {
    it('returns stable object identity when access decision does not change', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'read',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RbacProvider policy={FULL_ACCESS_POLICY} subject={adminSubject}>
          {children}
        </RbacProvider>
      );

      const { result, rerender } = renderHook(() => useAccessState(access), {
        wrapper,
      });

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // Same object reference (memoized)
      expect(firstResult).toBe(secondResult);
    });
  });
});
