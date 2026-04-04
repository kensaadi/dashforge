/**
 * Role Resolver Tests
 *
 * Tests for role inheritance resolution with circular dependency detection.
 */

import { describe, it, expect } from 'vitest';
import { resolveRoles } from '../role-resolver';
import { CircularRoleError } from '../errors';
import type { RbacPolicy } from '../types';

describe('resolveRoles', () => {
  describe('flat roles (no inheritance)', () => {
    it('should return roles when no inheritance exists', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin', 'user'], policy);
      expect(result).toEqual(['admin', 'user']);
    });

    it('should handle single role', () => {
      const policy: RbacPolicy = {
        roles: [{ name: 'admin', permissions: [] }],
      };

      const result = resolveRoles(['admin'], policy);
      expect(result).toEqual(['admin']);
    });
  });

  describe('single-level inheritance', () => {
    it('should resolve single parent role', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin'], policy);
      expect(result).toEqual(['admin', 'user']);
    });

    it('should resolve multiple parent roles', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['moderator', 'user'] },
          { name: 'moderator', permissions: [] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin'], policy);
      expect(result).toEqual(['admin', 'moderator', 'user']);
    });
  });

  describe('multi-level inheritance', () => {
    it('should resolve deep inheritance chain', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'superadmin', permissions: [], inherits: ['admin'] },
          { name: 'admin', permissions: [], inherits: ['moderator'] },
          { name: 'moderator', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['superadmin'], policy);
      expect(result).toEqual(['superadmin', 'admin', 'moderator', 'user']);
    });

    it('should handle multiple starting roles with inheritance', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['user'] },
          { name: 'moderator', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin', 'moderator'], policy);
      expect(result).toEqual(['admin', 'user', 'moderator']);
    });
  });

  describe('circular dependency detection', () => {
    it('should detect direct circular dependency', () => {
      const policy: RbacPolicy = {
        roles: [{ name: 'admin', permissions: [], inherits: ['admin'] }],
      };

      expect(() => resolveRoles(['admin'], policy)).toThrow(CircularRoleError);
    });

    it('should detect two-role circular dependency', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [], inherits: ['admin'] },
        ],
      };

      expect(() => resolveRoles(['admin'], policy)).toThrow(CircularRoleError);
    });

    it('should detect indirect circular dependency (3+ roles)', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'superadmin', permissions: [], inherits: ['admin'] },
          { name: 'admin', permissions: [], inherits: ['moderator'] },
          { name: 'moderator', permissions: [], inherits: ['superadmin'] },
        ],
      };

      expect(() => resolveRoles(['superadmin'], policy)).toThrow(
        CircularRoleError
      );
    });

    it('should include role path in circular error', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [], inherits: ['admin'] },
        ],
      };

      try {
        resolveRoles(['admin'], policy);
        expect.fail('Should have thrown CircularRoleError');
      } catch (error) {
        expect(error).toBeInstanceOf(CircularRoleError);
        if (error instanceof CircularRoleError) {
          expect(error.roles).toContain('admin');
          expect(error.roles).toContain('user');
        }
      }
    });
  });

  describe('unknown role handling', () => {
    it('should skip unknown roles silently', () => {
      const policy: RbacPolicy = {
        roles: [{ name: 'admin', permissions: [] }],
      };

      const result = resolveRoles(['admin', 'unknown'], policy);
      expect(result).toEqual(['admin']);
    });

    it('should handle all unknown roles', () => {
      const policy: RbacPolicy = {
        roles: [{ name: 'admin', permissions: [] }],
      };

      const result = resolveRoles(['unknown1', 'unknown2'], policy);
      expect(result).toEqual([]);
    });

    it('should skip unknown inherited roles', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['unknown', 'user'] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin'], policy);
      expect(result).toEqual(['admin', 'user']);
    });
  });

  describe('empty role list', () => {
    it('should return empty array for empty role list', () => {
      const policy: RbacPolicy = {
        roles: [{ name: 'admin', permissions: [] }],
      };

      const result = resolveRoles([], policy);
      expect(result).toEqual([]);
    });
  });

  describe('duplicate handling', () => {
    it('should remove duplicates when same role inherited multiple times', () => {
      const policy: RbacPolicy = {
        roles: [
          { name: 'admin', permissions: [], inherits: ['user'] },
          { name: 'moderator', permissions: [], inherits: ['user'] },
          { name: 'user', permissions: [] },
        ],
      };

      const result = resolveRoles(['admin', 'moderator'], policy);
      const userCount = result.filter((r) => r === 'user').length;
      expect(userCount).toBe(1);
    });
  });
});
