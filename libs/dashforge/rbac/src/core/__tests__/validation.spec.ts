/**
 * Validation Tests
 *
 * Tests for policy validation (circular roles, malformed permissions).
 */

import { describe, it, expect } from 'vitest';
import { validatePolicy } from '../rbac-engine';
import { CircularRoleError, InvalidPermissionError } from '../errors';
import type { RbacPolicy } from '../types';

describe('validatePolicy', () => {
  describe('valid policies', () => {
    it('should pass for valid policy with no inheritance', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).not.toThrow();
    });

    it('should pass for valid policy with inheritance', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'write', resource: 'booking' }],
            inherits: ['user'],
          },
          {
            name: 'user',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).not.toThrow();
    });

    it('should pass for empty policy', () => {
      const policy: RbacPolicy = { roles: [] };
      expect(() => validatePolicy(policy)).not.toThrow();
    });

    it('should pass for policy with wildcard permissions', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [
              { action: '*', resource: '*' },
              { action: 'read', resource: '*' },
              { action: '*', resource: 'booking' },
            ],
          },
        ],
      };

      expect(() => validatePolicy(policy)).not.toThrow();
    });

    it('should pass for policy with conditions', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [
              {
                action: 'read',
                resource: 'booking',
                condition: (ctx) => ctx.subject.id === 'test',
              },
            ],
          },
        ],
      };

      expect(() => validatePolicy(policy)).not.toThrow();
    });
  });

  describe('circular role detection', () => {
    it('should throw for direct circular dependency', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['admin'],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(CircularRoleError);
    });

    it('should throw for two-role circular dependency', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['user'],
          },
          {
            name: 'user',
            permissions: [],
            inherits: ['admin'],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(CircularRoleError);
    });

    it('should throw for indirect circular dependency', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'superadmin',
            permissions: [],
            inherits: ['admin'],
          },
          {
            name: 'admin',
            permissions: [],
            inherits: ['moderator'],
          },
          {
            name: 'moderator',
            permissions: [],
            inherits: ['superadmin'],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(CircularRoleError);
    });

    it('should detect cycle even with valid roles mixed in', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['user'],
          },
          {
            name: 'user',
            permissions: [],
            inherits: ['guest'],
          },
          {
            name: 'guest',
            permissions: [],
            inherits: ['admin'],
          },
          {
            name: 'viewer',
            permissions: [],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(CircularRoleError);
    });
  });

  describe('malformed permission validation', () => {
    it('should throw for empty action', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: '', resource: 'booking' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });

    it('should throw for empty resource', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: '' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });

    it('should throw for whitespace-only action', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: '   ', resource: 'booking' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });

    it('should throw for whitespace-only resource', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: '   ' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });

    it('should identify which permission is invalid', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [
              { action: 'read', resource: 'booking' },
              { action: '', resource: 'user' },
            ],
          },
        ],
      };

      try {
        validatePolicy(policy);
        expect.fail('Should have thrown InvalidPermissionError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidPermissionError);
        if (error instanceof InvalidPermissionError) {
          expect(error.permission.action).toBe('');
          expect(error.permission.resource).toBe('user');
        }
      }
    });

    it('should validate all roles and permissions', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
          {
            name: 'user',
            permissions: [{ action: '', resource: 'booking' }],
          },
        ],
      };

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });
  });

  describe('invalid effect', () => {
    it('should throw for invalid effect value', () => {
      const policy = {
        roles: [
          {
            name: 'admin',
            permissions: [
              {
                action: 'read',
                resource: 'booking',
                effect: 'maybe' as unknown,
              },
            ],
          },
        ],
      } as RbacPolicy;

      expect(() => validatePolicy(policy)).toThrow(InvalidPermissionError);
    });
  });
});
