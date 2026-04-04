/**
 * Permission Evaluator Tests
 *
 * Tests for permission matching and precedence logic.
 * CRITICAL: Wildcards are ONLY supported on permission side, NOT request side.
 */

import { describe, it, expect } from 'vitest';
import { matchPermissions, applyPrecedence } from '../permission-evaluator';
import type { Permission, AccessRequest } from '../types';

describe('matchPermissions', () => {
  describe('exact match', () => {
    it('should match when action and resource are exact', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(permissions[0]);
    });

    it('should not match when action differs', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: 'write',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });

    it('should not match when resource differs', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: 'user',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('action wildcard on permission', () => {
    it('should match any action when permission.action is *', () => {
      const permissions: Permission[] = [{ action: '*', resource: 'booking' }];

      const readRequest: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };
      expect(matchPermissions(permissions, readRequest)).toHaveLength(1);

      const writeRequest: AccessRequest = {
        action: 'write',
        resource: 'booking',
      };
      expect(matchPermissions(permissions, writeRequest)).toHaveLength(1);
    });

    it('should not match when resource differs even with action wildcard', () => {
      const permissions: Permission[] = [{ action: '*', resource: 'booking' }];
      const request: AccessRequest = {
        action: 'read',
        resource: 'user',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('resource wildcard on permission', () => {
    it('should match any resource when permission.resource is *', () => {
      const permissions: Permission[] = [{ action: 'read', resource: '*' }];

      const bookingRequest: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };
      expect(matchPermissions(permissions, bookingRequest)).toHaveLength(1);

      const userRequest: AccessRequest = {
        action: 'read',
        resource: 'user',
      };
      expect(matchPermissions(permissions, userRequest)).toHaveLength(1);
    });

    it('should not match when action differs even with resource wildcard', () => {
      const permissions: Permission[] = [{ action: 'read', resource: '*' }];
      const request: AccessRequest = {
        action: 'write',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('both wildcards on permission', () => {
    it('should match any action and resource when both are *', () => {
      const permissions: Permission[] = [{ action: '*', resource: '*' }];

      const request: AccessRequest = {
        action: 'delete',
        resource: 'user',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(1);
    });
  });

  describe('multiple permissions', () => {
    it('should return all matching permissions', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
        { action: '*', resource: 'booking' },
        { action: 'read', resource: '*' },
        { action: 'write', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(3);
    });

    it('should return only matching permissions', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
        { action: 'write', resource: 'booking' },
        { action: 'delete', resource: 'user' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(1);
      expect(result[0]?.action).toBe('read');
    });
  });

  describe('no match', () => {
    it('should return empty array when no permissions match', () => {
      const permissions: Permission[] = [
        { action: 'write', resource: 'booking' },
        { action: 'delete', resource: 'user' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });
  });

  describe('CRITICAL: request wildcards NOT supported', () => {
    it('should NOT treat request.action=* as wildcard', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: '*',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });

    it('should NOT treat request.resource=* as wildcard', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];
      const request: AccessRequest = {
        action: 'read',
        resource: '*',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(0);
    });

    it('should match only if permission explicitly defines *', () => {
      const permissions: Permission[] = [{ action: '*', resource: 'booking' }];
      const request: AccessRequest = {
        action: '*',
        resource: 'booking',
      };

      const result = matchPermissions(permissions, request);
      expect(result).toHaveLength(1);
    });
  });
});

describe('applyPrecedence', () => {
  describe('allow precedence', () => {
    it('should grant when permission has effect allow', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'allow' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(true);
    });

    it('should grant when permission has no effect (default allow)', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(true);
    });

    it('should grant when multiple allows exist', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'allow' },
        { action: '*', resource: 'booking', effect: 'allow' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(true);
    });
  });

  describe('deny precedence', () => {
    it('should deny when permission has effect deny', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'deny' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(false);
    });

    it('should deny when any permission is deny (deny overrides allow)', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'allow' },
        { action: '*', resource: 'booking', effect: 'deny' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(false);
    });

    it('should deny when multiple denies exist', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'deny' },
        { action: '*', resource: '*', effect: 'deny' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(false);
    });
  });

  describe('default deny', () => {
    it('should deny when no permissions provided', () => {
      const result = applyPrecedence([]);
      expect(result).toBe(false);
    });
  });

  describe('mixed effects', () => {
    it('should deny when both allow and deny exist', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'allow' },
        { action: 'read', resource: 'booking', effect: 'deny' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(false);
    });

    it('should deny even if allow comes last', () => {
      const permissions: Permission[] = [
        { action: 'read', resource: 'booking', effect: 'deny' },
        { action: 'read', resource: 'booking', effect: 'allow' },
      ];

      const result = applyPrecedence(permissions);
      expect(result).toBe(false);
    });
  });
});
