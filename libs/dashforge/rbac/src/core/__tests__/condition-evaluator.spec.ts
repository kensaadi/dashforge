/**
 * Condition Evaluator Tests
 *
 * Tests for condition execution with fail-safe error handling.
 */

import { describe, it, expect } from 'vitest';
import { evaluateConditions } from '../condition-evaluator';
import type { Permission, Subject, AccessRequest } from '../types';

describe('evaluateConditions', () => {
  const subject: Subject = {
    id: 'user-1',
    roles: ['user'],
    attributes: { department: 'engineering' },
  };

  const request: AccessRequest = {
    action: 'read',
    resource: 'booking',
    resourceData: { ownerId: 'user-1' },
    environment: { time: '09:00' },
  };

  describe('no condition', () => {
    it('should keep permission when no condition exists', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(permissions[0]);
    });

    it('should keep all permissions without conditions', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
        { action: 'write', resource: 'booking' },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(2);
    });
  });

  describe('condition returns true', () => {
    it('should keep permission when condition returns true', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: () => true,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(1);
    });

    it('should receive correct context', () => {
      let receivedContext;
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => {
            receivedContext = ctx;
            return true;
          },
        },
      ];

      evaluateConditions(permissions, subject, request);

      expect(receivedContext).toEqual({
        subject,
        resourceData: request.resourceData,
        environment: request.environment,
      });
    });

    it('should evaluate based on subject attributes', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) =>
            ctx.subject.attributes?.department === 'engineering',
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(1);
    });

    it('should evaluate based on resourceData', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => {
            const data = ctx.resourceData as { ownerId: string } | undefined;
            return data?.ownerId === ctx.subject.id;
          },
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(1);
    });
  });

  describe('condition returns false', () => {
    it('should discard permission when condition returns false', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: () => false,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });

    it('should evaluate ownership correctly', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => {
            const data = ctx.resourceData as { ownerId: string } | undefined;
            return data?.ownerId === 'other-user';
          },
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('condition throws error (fail-safe)', () => {
    it('should discard permission when condition throws', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: () => {
            throw new Error('Condition error');
          },
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });

    it('should not propagate error to caller', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: () => {
            throw new Error('Critical error');
          },
        },
      ];

      expect(() => {
        evaluateConditions(permissions, subject, request);
      }).not.toThrow();
    });

    it('should handle runtime errors gracefully', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => {
            const data = ctx.resourceData as { nested: { value: string } };
            return data.nested.value === 'test';
          },
        },
      ];

      const requestWithoutNested: AccessRequest = {
        action: 'read',
        resource: 'booking',
        resourceData: {},
      };

      const result = evaluateConditions(
        permissions,
        subject,
        requestWithoutNested
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('condition returns non-boolean (fail-safe)', () => {
    it('should discard permission when condition returns non-boolean', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (() => 'true') as unknown as () => boolean,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });

    it('should discard when condition returns number', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (() => 1) as unknown as () => boolean,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });

    it('should discard when condition returns object', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (() => ({})) as unknown as () => boolean,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });

    it('should discard when condition returns undefined', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (() => undefined) as unknown as () => boolean,
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('mixed permissions', () => {
    it('should keep only permissions that pass conditions', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
        {
          action: 'write',
          resource: 'booking',
          condition: () => true,
        },
        {
          action: 'delete',
          resource: 'booking',
          condition: () => false,
        },
        {
          action: 'update',
          resource: 'booking',
          condition: () => {
            throw new Error('Error');
          },
        },
      ];

      const result = evaluateConditions(permissions, subject, request);
      expect(result).toHaveLength(2);
      expect(result[0]?.action).toBe('read');
      expect(result[1]?.action).toBe('write');
    });
  });

  describe('context without optional fields', () => {
    it('should handle missing resourceData', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => ctx.resourceData === undefined,
        },
      ];

      const minimalRequest: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = evaluateConditions(permissions, subject, minimalRequest);
      expect(result).toHaveLength(1);
    });

    it('should handle missing environment', () => {
      const permissions: Permission[] = [
        {
          action: 'read',
          resource: 'booking',
          condition: (ctx) => ctx.environment === undefined,
        },
      ];

      const minimalRequest: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = evaluateConditions(permissions, subject, minimalRequest);
      expect(result).toHaveLength(1);
    });
  });
});
