/**
 * Tests for resolveAccessState()
 *
 * Central function that maps RBAC decisions to UI access states.
 */

import { describe, it, expect } from 'vitest';
import { resolveAccessState } from '../resolve-access-state';
import type { AccessRequirement, AccessState } from '../types';
import type { AccessRequest } from '../../core/types';

describe('resolveAccessState', () => {
  // Helper: Simple canCheck that grants access
  const grantAccess = (): boolean => true;

  // Helper: Simple canCheck that denies access
  const denyAccess = (): boolean => false;

  describe('granted access', () => {
    it('should return fully accessible state when access is granted', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
      };

      const result = resolveAccessState(requirement, grantAccess);

      expect(result).toEqual({
        visible: true,
        disabled: false,
        readonly: false,
        granted: true,
      });
    });

    it('should ignore onUnauthorized when access is granted', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
        onUnauthorized: 'hide',
      };

      const result = resolveAccessState(requirement, grantAccess);

      expect(result.granted).toBe(true);
      expect(result.visible).toBe(true);
      expect(result.disabled).toBe(false);
      expect(result.readonly).toBe(false);
    });
  });

  describe('denied access with default behavior', () => {
    it('should hide element by default when access is denied', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
        // onUnauthorized not specified - should default to 'hide'
      };

      const result = resolveAccessState(requirement, denyAccess);

      expect(result).toEqual({
        visible: false,
        disabled: false,
        readonly: false,
        granted: false,
      });
    });
  });

  describe('denied access with explicit hide', () => {
    it('should hide element when onUnauthorized is hide', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
        onUnauthorized: 'hide',
      };

      const result = resolveAccessState(requirement, denyAccess);

      expect(result).toEqual({
        visible: false,
        disabled: false,
        readonly: false,
        granted: false,
      });
    });
  });

  describe('denied access with disable', () => {
    it('should show element as disabled when onUnauthorized is disable', () => {
      const requirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        onUnauthorized: 'disable',
      };

      const result = resolveAccessState(requirement, denyAccess);

      expect(result).toEqual({
        visible: true,
        disabled: true,
        readonly: false,
        granted: false,
      });
    });
  });

  describe('denied access with readonly', () => {
    it('should show element as readonly when onUnauthorized is readonly', () => {
      const requirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        onUnauthorized: 'readonly',
      };

      const result = resolveAccessState(requirement, denyAccess);

      expect(result).toEqual({
        visible: true,
        disabled: false,
        readonly: true,
        granted: false,
      });
    });
  });

  describe('RBAC integration', () => {
    it('should pass action and resource to canCheck', () => {
      let capturedRequest: AccessRequest | undefined;

      const canCheck = (request: AccessRequest): boolean => {
        capturedRequest = request;
        return true;
      };

      const requirement: AccessRequirement = {
        action: 'delete',
        resource: 'user',
      };

      resolveAccessState(requirement, canCheck);

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.action).toBe('delete');
      expect(capturedRequest?.resource).toBe('user');
    });

    it('should pass resourceData to canCheck when provided', () => {
      let capturedRequest: AccessRequest | undefined;

      const canCheck = (request: AccessRequest): boolean => {
        capturedRequest = request;
        return true;
      };

      const resourceData = { id: '123', ownerId: 'user-456' };
      const requirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        resourceData,
      };

      resolveAccessState(requirement, canCheck);

      expect(capturedRequest?.resourceData).toBe(resourceData);
    });

    it('should pass environment to canCheck when provided', () => {
      let capturedRequest: AccessRequest | undefined;

      const canCheck = (request: AccessRequest): boolean => {
        capturedRequest = request;
        return true;
      };

      const environment = { time: '14:00', location: 'office' };
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'document',
        environment,
      };

      resolveAccessState(requirement, canCheck);

      expect(capturedRequest?.environment).toBe(environment);
    });

    it('should work with wildcard permissions', () => {
      const canCheck = (request: AccessRequest): boolean => {
        // Simulate wildcard matching
        return request.action === '*' || request.resource === '*';
      };

      const requirement: AccessRequirement = {
        action: '*',
        resource: 'booking',
      };

      const result = resolveAccessState(requirement, canCheck);

      expect(result.granted).toBe(true);
      expect(result.visible).toBe(true);
    });

    it('should work with conditional permissions', () => {
      const canCheck = (request: AccessRequest): boolean => {
        // Simulate condition check
        if (request.resourceData) {
          const data = request.resourceData as { status: string };
          return data.status === 'draft';
        }
        return false;
      };

      const requirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        resourceData: { status: 'draft' },
      };

      const result = resolveAccessState(requirement, canCheck);

      expect(result.granted).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return consistent results for repeated calls', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
        onUnauthorized: 'disable',
      };

      const result1 = resolveAccessState(requirement, denyAccess);
      const result2 = resolveAccessState(requirement, denyAccess);

      expect(result1).toEqual(result2);
    });

    it('should handle minimal requirement (action and resource only)', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
      };

      const result = resolveAccessState(requirement, grantAccess);

      expect(result.granted).toBe(true);
      expect(result.visible).toBe(true);
    });

    it('should never set both disabled and readonly to true', () => {
      const disableRequirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        onUnauthorized: 'disable',
      };

      const disableResult = resolveAccessState(disableRequirement, denyAccess);

      expect(disableResult.disabled).toBe(true);
      expect(disableResult.readonly).toBe(false);

      const readonlyRequirement: AccessRequirement = {
        action: 'update',
        resource: 'booking',
        onUnauthorized: 'readonly',
      };

      const readonlyResult = resolveAccessState(
        readonlyRequirement,
        denyAccess
      );

      expect(readonlyResult.disabled).toBe(false);
      expect(readonlyResult.readonly).toBe(true);
    });

    it('should never set visible to false with disabled or readonly true', () => {
      // When hidden, disabled and readonly must be false
      const hideRequirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
        onUnauthorized: 'hide',
      };

      const hideResult = resolveAccessState(hideRequirement, denyAccess);

      expect(hideResult.visible).toBe(false);
      expect(hideResult.disabled).toBe(false);
      expect(hideResult.readonly).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should return AccessState with all required properties', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
      };

      const result: AccessState = resolveAccessState(requirement, grantAccess);

      expect(result).toHaveProperty('visible');
      expect(result).toHaveProperty('disabled');
      expect(result).toHaveProperty('readonly');
      expect(result).toHaveProperty('granted');
    });

    it('should have granted property matching canCheck result', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
      };

      const grantedResult = resolveAccessState(requirement, grantAccess);
      expect(grantedResult.granted).toBe(true);

      const deniedResult = resolveAccessState(requirement, denyAccess);
      expect(deniedResult.granted).toBe(false);
    });

    it('should have all boolean properties', () => {
      const requirement: AccessRequirement = {
        action: 'read',
        resource: 'booking',
      };

      const result = resolveAccessState(requirement, grantAccess);

      expect(typeof result.visible).toBe('boolean');
      expect(typeof result.disabled).toBe('boolean');
      expect(typeof result.readonly).toBe('boolean');
      expect(typeof result.granted).toBe('boolean');
    });
  });
});
