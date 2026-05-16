// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type {
  RbacPolicy,
  Subject,
  AccessRequirement,
} from '@dashforge/rbac';
import { useAccessState } from './useAccessState.js';

/**
 * TW-side copy of the MUI useAccessState unit test, kept independent
 * per the isolation contract. The hook contract is identical so the
 * MUI test cases double as the source of truth for behaviour parity.
 */

const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
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

const adminSubject: Subject = { id: 'admin-user', roles: ['admin'] };
const viewerSubject: Subject = { id: 'viewer-user', roles: ['viewer'] };

function wrapWithRbac(policy: RbacPolicy, subject: Subject) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <RbacProvider policy={policy} subject={subject}>
        {children}
      </RbacProvider>
    );
  };
}

describe('useAccessState (tw)', () => {
  describe('no access requirement', () => {
    it('returns default full-access state when access is undefined', () => {
      const { result } = renderHook(() => useAccessState(undefined));
      expect(result.current).toEqual({
        visible: true,
        disabled: false,
        readonly: false,
        granted: true,
      });
    });

    it('returns stable identity across re-renders', () => {
      const { result, rerender } = renderHook(() => useAccessState(undefined));
      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });

  describe('access requirement WITHOUT RbacProvider (fail-safe)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('returns DEFAULT_ACCESS_STATE (fails open) when no provider mounted', () => {
      const access: AccessRequirement = { resource: 'doc', action: 'read' };
      const { result } = renderHook(() => useAccessState(access));
      expect(result.current.visible).toBe(true);
      expect(result.current.granted).toBe(true);
    });

    it('logs a dev-mode warning naming the missing requirement', () => {
      const access: AccessRequirement = { resource: 'doc', action: 'update' };
      renderHook(() => useAccessState(access));
      expect(warnSpy).toHaveBeenCalled();
      const msg = String(warnSpy.mock.calls[0]?.[0] ?? '');
      expect(msg).toContain('No RbacProvider');
      expect(msg).toContain('doc');
      expect(msg).toContain('update');
    });
  });

  describe('access requirement WITH RbacProvider', () => {
    it('grants when policy allows', () => {
      const access: AccessRequirement = { resource: 'document', action: 'read' };
      const { result } = renderHook(() => useAccessState(access), {
        wrapper: wrapWithRbac(FULL_ACCESS_POLICY, adminSubject),
      });
      expect(result.current.granted).toBe(true);
      expect(result.current.visible).toBe(true);
    });

    it('denies (hide) when policy forbids and onUnauthorized=hide', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        onUnauthorized: 'hide',
      };
      const { result } = renderHook(() => useAccessState(access), {
        wrapper: wrapWithRbac(READ_ONLY_POLICY, viewerSubject),
      });
      expect(result.current.granted).toBe(false);
      expect(result.current.visible).toBe(false);
    });

    it('denies (disable) when policy forbids and onUnauthorized=disable', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        onUnauthorized: 'disable',
      };
      const { result } = renderHook(() => useAccessState(access), {
        wrapper: wrapWithRbac(READ_ONLY_POLICY, viewerSubject),
      });
      expect(result.current.granted).toBe(false);
      expect(result.current.visible).toBe(true);
      expect(result.current.disabled).toBe(true);
    });

    it('denies (readonly) when policy forbids and onUnauthorized=readonly', () => {
      const access: AccessRequirement = {
        resource: 'document',
        action: 'update',
        onUnauthorized: 'readonly',
      };
      const { result } = renderHook(() => useAccessState(access), {
        wrapper: wrapWithRbac(READ_ONLY_POLICY, viewerSubject),
      });
      expect(result.current.granted).toBe(false);
      expect(result.current.readonly).toBe(true);
    });
  });

  describe('memoization', () => {
    it('returns identical reference when access reference stays the same', () => {
      const access: AccessRequirement = { resource: 'doc', action: 'read' };
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { result, rerender } = renderHook(() => useAccessState(access));
      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
      warnSpy.mockRestore();
    });
  });
});
