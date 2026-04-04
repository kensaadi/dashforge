/**
 * Tests for filterActions()
 *
 * Action filtering utility for hide-only filtering in V1.
 */

import { describe, it, expect } from 'vitest';
import { filterActions } from '../filter-actions';
import type { ActionItem } from '../types';
import type { AccessRequest } from '../../core/types';

describe('filterActions', () => {
  // Helper: Simple canCheck that grants access
  const grantAccess = (): boolean => true;

  // Helper: Simple canCheck that denies access
  const denyAccess = (): boolean => false;

  describe('basic filtering', () => {
    it('should return empty array for empty input', () => {
      const result = filterActions([], grantAccess);

      expect(result).toEqual([]);
    });

    it('should keep actions with no access requirement', () => {
      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          onClick: () => {},
        },
        {
          id: 'action2',
          label: 'Action 2',
          onClick: () => {},
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('action1');
      expect(result[1].id).toBe('action2');
    });

    it('should keep actions when access is granted', () => {
      const actions: ActionItem[] = [
        {
          id: 'read',
          label: 'View',
          onClick: () => {},
          access: { action: 'read', resource: 'booking' },
        },
        {
          id: 'update',
          label: 'Edit',
          onClick: () => {},
          access: { action: 'update', resource: 'booking' },
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('read');
      expect(result[1].id).toBe('update');
    });

    it('should filter out actions when access is denied with hide', () => {
      const actions: ActionItem[] = [
        {
          id: 'read',
          label: 'View',
          onClick: () => {},
          access: { action: 'read', resource: 'booking' },
        },
        {
          id: 'delete',
          label: 'Delete',
          onClick: () => {},
          access: { action: 'delete', resource: 'booking' },
        },
      ];

      const result = filterActions(actions, denyAccess);

      expect(result).toEqual([]);
    });

    it('should preserve order of visible actions', () => {
      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'First',
          onClick: () => {},
        },
        {
          id: 'action2',
          label: 'Second',
          onClick: () => {},
        },
        {
          id: 'action3',
          label: 'Third',
          onClick: () => {},
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result[0].id).toBe('action1');
      expect(result[1].id).toBe('action2');
      expect(result[2].id).toBe('action3');
    });
  });

  describe('access behaviors', () => {
    it('should filter out actions with hide behavior', () => {
      const actions: ActionItem[] = [
        {
          id: 'delete',
          label: 'Delete',
          onClick: () => {},
          access: {
            action: 'delete',
            resource: 'booking',
            onUnauthorized: 'hide',
          },
        },
      ];

      const result = filterActions(actions, denyAccess);

      expect(result).toEqual([]);
    });

    it('should keep actions with disable behavior visible (but ignore disabled state)', () => {
      const actions: ActionItem[] = [
        {
          id: 'update',
          label: 'Edit',
          onClick: () => {},
          access: {
            action: 'update',
            resource: 'booking',
            onUnauthorized: 'disable',
          },
        },
      ];

      const result = filterActions(actions, denyAccess);

      // Action should be in result because disable mode sets visible: true
      // But filterActions doesn't propagate the disabled state
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('update');
    });

    it('should keep actions with readonly behavior visible (but ignore readonly state)', () => {
      const actions: ActionItem[] = [
        {
          id: 'update',
          label: 'Edit',
          onClick: () => {},
          access: {
            action: 'update',
            resource: 'booking',
            onUnauthorized: 'readonly',
          },
        },
      ];

      const result = filterActions(actions, denyAccess);

      // Action should be in result because readonly mode sets visible: true
      // But filterActions doesn't propagate the readonly state
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('update');
    });

    it('should only filter by visibility (V1 limitation)', () => {
      // This test confirms filterActions is visibility-only
      const actions: ActionItem[] = [
        {
          id: 'hide',
          label: 'Hidden',
          onClick: () => {},
          access: { action: 'a', resource: 'r', onUnauthorized: 'hide' },
        },
        {
          id: 'disable',
          label: 'Disabled',
          onClick: () => {},
          access: { action: 'b', resource: 'r', onUnauthorized: 'disable' },
        },
        {
          id: 'readonly',
          label: 'Readonly',
          onClick: () => {},
          access: { action: 'c', resource: 'r', onUnauthorized: 'readonly' },
        },
      ];

      const result = filterActions(actions, denyAccess);

      // Only 'hide' should be filtered out
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('disable');
      expect(result[1].id).toBe('readonly');
    });
  });

  describe('edge cases', () => {
    it('should return empty array when all actions are hidden', () => {
      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          onClick: () => {},
          access: { action: 'a', resource: 'r' },
        },
        {
          id: 'action2',
          label: 'Action 2',
          onClick: () => {},
          access: { action: 'b', resource: 'r' },
        },
      ];

      const result = filterActions(actions, denyAccess);

      expect(result).toEqual([]);
    });

    it('should handle mixed access and no-access actions', () => {
      const actions: ActionItem[] = [
        {
          id: 'public',
          label: 'Public Action',
          onClick: () => {},
          // No access requirement
        },
        {
          id: 'protected',
          label: 'Protected Action',
          onClick: () => {},
          access: { action: 'delete', resource: 'booking' },
        },
      ];

      const result = filterActions(actions, denyAccess);

      // Public action should remain
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('public');
    });

    it('should handle actions with complex access requirements', () => {
      const canCheck = (request: AccessRequest): boolean => {
        // Grant access to 'read', deny others
        return request.action === 'read';
      };

      const actions: ActionItem[] = [
        {
          id: 'read',
          label: 'View',
          onClick: () => {},
          access: {
            action: 'read',
            resource: 'booking',
            resourceData: { id: '123' },
          },
        },
        {
          id: 'update',
          label: 'Edit',
          onClick: () => {},
          access: {
            action: 'update',
            resource: 'booking',
            resourceData: { id: '123' },
          },
        },
      ];

      const result = filterActions(actions, canCheck);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('read');
    });
  });

  describe('action properties preservation', () => {
    it('should preserve onClick handlers', () => {
      const handler1 = (): void => {};
      const handler2 = (): void => {};

      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          onClick: handler1,
        },
        {
          id: 'action2',
          label: 'Action 2',
          onClick: handler2,
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result[0].onClick).toBe(handler1);
      expect(result[1].onClick).toBe(handler2);
    });

    it('should preserve icons', () => {
      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          icon: 'icon-delete',
          onClick: () => {},
        },
        {
          id: 'action2',
          label: 'Action 2',
          icon: 'icon-edit',
          onClick: () => {},
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result[0].icon).toBe('icon-delete');
      expect(result[1].icon).toBe('icon-edit');
    });

    it('should preserve metadata', () => {
      const actions: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          onClick: () => {},
          metadata: { color: 'red', variant: 'outlined' },
        },
        {
          id: 'action2',
          label: 'Action 2',
          onClick: () => {},
          metadata: { color: 'blue', variant: 'contained' },
        },
      ];

      const result = filterActions(actions, grantAccess);

      expect(result[0].metadata).toEqual({ color: 'red', variant: 'outlined' });
      expect(result[1].metadata).toEqual({
        color: 'blue',
        variant: 'contained',
      });
    });

    it('should preserve action identity (all properties)', () => {
      const originalAction: ActionItem = {
        id: 'complex-action',
        label: 'Complex Action',
        icon: 'icon-complex',
        onClick: () => {},
        metadata: { foo: 'bar', count: 42 },
      };

      const actions: ActionItem[] = [originalAction];

      const result = filterActions(actions, grantAccess);

      expect(result[0]).toEqual(originalAction);
    });
  });
});
