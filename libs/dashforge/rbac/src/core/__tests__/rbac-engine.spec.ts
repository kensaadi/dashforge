/**
 * RBAC Engine Tests
 *
 * Integration tests for the complete RBAC evaluation flow.
 */

import { describe, it, expect } from 'vitest';
import { RbacEngine, createRbacEngine } from '../rbac-engine';
import { RbacError, CircularRoleError } from '../errors';
import type { RbacPolicy, Subject, AccessRequest } from '../types';

describe('RbacEngine', () => {
  describe('createRbacEngine', () => {
    it('should create engine with valid policy', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      expect(engine).toBeInstanceOf(RbacEngine);
    });

    it('should validate policy on creation', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['admin'],
          },
        ],
      };

      expect(() => createRbacEngine(policy)).toThrow(CircularRoleError);
    });

    it('should throw for malformed permissions on creation', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: '', resource: 'booking' }],
          },
        ],
      };

      expect(() => createRbacEngine(policy)).toThrow();
    });
  });

  describe('can()', () => {
    describe('allow decisions', () => {
      it('should allow when permission matches', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [{ action: 'read', resource: 'booking' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should allow with wildcard action', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'admin',
              permissions: [{ action: '*', resource: 'booking' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['admin'] };
        const request: AccessRequest = {
          action: 'delete',
          resource: 'booking',
        };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should allow with wildcard resource', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'admin',
              permissions: [{ action: 'read', resource: '*' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['admin'] };
        const request: AccessRequest = { action: 'read', resource: 'user' };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should allow with both wildcards', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'superadmin',
              permissions: [{ action: '*', resource: '*' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['superadmin'] };
        const request: AccessRequest = {
          action: 'delete',
          resource: 'anything',
        };

        expect(engine.can(subject, request)).toBe(true);
      });
    });

    describe('deny decisions', () => {
      it('should deny when no permission matches', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [{ action: 'read', resource: 'booking' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['user'] };
        const request: AccessRequest = { action: 'write', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should deny when explicit deny effect', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                { action: 'delete', resource: 'booking', effect: 'deny' },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['user'] };
        const request: AccessRequest = {
          action: 'delete',
          resource: 'booking',
        };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should deny for empty subject roles', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'admin',
              permissions: [{ action: '*', resource: '*' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: [] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should deny for empty policy', () => {
        const policy: RbacPolicy = { roles: [] };
        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['admin'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });
    });

    describe('deny overrides allow', () => {
      it('should deny when both allow and deny match', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                { action: 'read', resource: 'booking', effect: 'allow' },
                { action: 'read', resource: 'booking', effect: 'deny' },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should deny when wildcard deny overrides specific allow', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                { action: 'read', resource: 'booking', effect: 'allow' },
                { action: '*', resource: '*', effect: 'deny' },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });
    });

    describe('subject with unknown roles', () => {
      it('should skip unknown roles and use known ones', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [{ action: 'read', resource: 'booking' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['unknown', 'user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should deny when all roles are unknown', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [{ action: 'read', resource: 'booking' }],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['unknown1', 'unknown2'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });
    });

    describe('role inheritance', () => {
      it('should allow based on inherited permissions', () => {
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

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['admin'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should combine permissions from multiple inheritance levels', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'superadmin',
              permissions: [{ action: 'delete', resource: 'booking' }],
              inherits: ['admin'],
            },
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

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: ['superadmin'] };

        expect(
          engine.can(subject, { action: 'read', resource: 'booking' })
        ).toBe(true);
        expect(
          engine.can(subject, { action: 'write', resource: 'booking' })
        ).toBe(true);
        expect(
          engine.can(subject, { action: 'delete', resource: 'booking' })
        ).toBe(true);
      });
    });

    describe('conditions', () => {
      it('should allow when condition returns true', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                {
                  action: 'read',
                  resource: 'booking',
                  condition: (ctx) => ctx.subject.id === 'user-1',
                },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: 'user-1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(true);
      });

      it('should deny when condition returns false', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                {
                  action: 'read',
                  resource: 'booking',
                  condition: (ctx) => ctx.subject.id === 'user-2',
                },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: 'user-1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should deny when condition throws', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                {
                  action: 'read',
                  resource: 'booking',
                  condition: () => {
                    throw new Error('Condition error');
                  },
                },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: 'user-1', roles: ['user'] };
        const request: AccessRequest = { action: 'read', resource: 'booking' };

        expect(engine.can(subject, request)).toBe(false);
      });

      it('should evaluate ownership condition', () => {
        const policy: RbacPolicy = {
          roles: [
            {
              name: 'user',
              permissions: [
                {
                  action: 'write',
                  resource: 'booking',
                  condition: (ctx) => {
                    const data = ctx.resourceData as
                      | { ownerId: string }
                      | undefined;
                    return data?.ownerId === ctx.subject.id;
                  },
                },
              ],
            },
          ],
        };

        const engine = createRbacEngine(policy);
        const subject: Subject = { id: 'user-1', roles: ['user'] };

        const ownRequest: AccessRequest = {
          action: 'write',
          resource: 'booking',
          resourceData: { ownerId: 'user-1' },
        };
        expect(engine.can(subject, ownRequest)).toBe(true);

        const otherRequest: AccessRequest = {
          action: 'write',
          resource: 'booking',
          resourceData: { ownerId: 'user-2' },
        };
        expect(engine.can(subject, otherRequest)).toBe(false);
      });
    });

    describe('input validation', () => {
      it('should throw for null subject', () => {
        const policy: RbacPolicy = { roles: [] };
        const engine = createRbacEngine(policy);

        expect(() =>
          engine.can(null as unknown as Subject, {
            action: 'read',
            resource: 'booking',
          })
        ).toThrow(RbacError);
      });

      it('should throw for null request', () => {
        const policy: RbacPolicy = { roles: [] };
        const engine = createRbacEngine(policy);
        const subject: Subject = { id: '1', roles: [] };

        expect(() =>
          engine.can(subject, null as unknown as AccessRequest)
        ).toThrow(RbacError);
      });
    });
  });

  describe('evaluate()', () => {
    it('should return decision with granted true when allowed', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: ['user'] };
      const request: AccessRequest = { action: 'read', resource: 'booking' };

      const decision = engine.evaluate(subject, request);
      expect(decision.granted).toBe(true);
    });

    it('should return decision with granted false when denied', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: ['user'] };
      const request: AccessRequest = { action: 'write', resource: 'booking' };

      const decision = engine.evaluate(subject, request);
      expect(decision.granted).toBe(false);
    });

    it('should include reason in decision', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: ['user'] };
      const request: AccessRequest = { action: 'read', resource: 'booking' };

      const decision = engine.evaluate(subject, request);
      expect(decision.reason).toBeDefined();
    });
  });

  describe('getEffectivePermissions()', () => {
    it('should return permissions for subject roles', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [
              { action: 'read', resource: 'booking' },
              { action: 'write', resource: 'booking' },
            ],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: ['user'] };

      const permissions = engine.getEffectivePermissions(subject);
      expect(permissions).toHaveLength(2);
    });

    it('should include inherited permissions', () => {
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

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: ['admin'] };

      const permissions = engine.getEffectivePermissions(subject);
      expect(permissions).toHaveLength(2);
    });

    it('should return empty array for empty roles', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'user',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      const subject: Subject = { id: '1', roles: [] };

      const permissions = engine.getEffectivePermissions(subject);
      expect(permissions).toHaveLength(0);
    });
  });

  describe('validatePolicy()', () => {
    it('should not throw for valid policy', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [{ action: 'read', resource: 'booking' }],
          },
        ],
      };

      const engine = createRbacEngine(policy);
      expect(() => engine.validatePolicy()).not.toThrow();
    });

    it('should throw for circular roles', () => {
      const policy: RbacPolicy = {
        roles: [
          {
            name: 'admin',
            permissions: [],
            inherits: ['admin'],
          },
        ],
      };

      expect(() => {
        const engine = createRbacEngine(policy);
        engine.validatePolicy();
      }).toThrow(CircularRoleError);
    });
  });
});
