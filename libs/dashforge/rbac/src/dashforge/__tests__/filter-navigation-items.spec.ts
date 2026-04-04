/**
 * Tests for filterNavigationItems()
 *
 * Navigation filtering utility with recursive support.
 *
 * V1 BEHAVIOR: If parent is denied, entire subtree is removed (no child promotion).
 */

import { describe, it, expect } from 'vitest';
import { filterNavigationItems } from '../filter-navigation-items';
import type { NavigationItem } from '../types';
import type { AccessRequest } from '../../core/types';

describe('filterNavigationItems', () => {
  // Helper: Simple canCheck that grants access
  const grantAccess = (): boolean => true;

  // Helper: Simple canCheck that denies access
  const denyAccess = (): boolean => false;

  describe('basic filtering', () => {
    it('should return empty array for empty input', () => {
      const result = filterNavigationItems([], grantAccess);

      expect(result).toEqual([]);
    });

    it('should keep items with no access requirement', () => {
      const items: NavigationItem[] = [
        {
          id: 'home',
          label: 'Home',
          path: '/home',
        },
        {
          id: 'about',
          label: 'About',
          path: '/about',
        },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('home');
      expect(result[1].id).toBe('about');
    });

    it('should keep items when access is granted', () => {
      const items: NavigationItem[] = [
        {
          id: 'bookings',
          label: 'Bookings',
          path: '/bookings',
          access: { action: 'read', resource: 'booking' },
        },
        {
          id: 'users',
          label: 'Users',
          path: '/users',
          access: { action: 'read', resource: 'user' },
        },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('bookings');
      expect(result[1].id).toBe('users');
    });

    it('should filter out items when access is denied', () => {
      const items: NavigationItem[] = [
        {
          id: 'admin',
          label: 'Admin',
          path: '/admin',
          access: { action: 'manage', resource: 'settings' },
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      expect(result).toEqual([]);
    });

    it('should preserve order of visible items', () => {
      const items: NavigationItem[] = [
        { id: 'first', label: 'First', path: '/first' },
        { id: 'second', label: 'Second', path: '/second' },
        { id: 'third', label: 'Third', path: '/third' },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result[0].id).toBe('first');
      expect(result[1].id).toBe('second');
      expect(result[2].id).toBe('third');
    });
  });

  describe('nested items', () => {
    it('should filter nested children recursively', () => {
      const items: NavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          path: '/parent',
          children: [
            {
              id: 'child1',
              label: 'Child 1',
              path: '/parent/child1',
              access: { action: 'read', resource: 'booking' },
            },
            {
              id: 'child2',
              label: 'Child 2',
              path: '/parent/child2',
              access: { action: 'delete', resource: 'booking' },
            },
          ],
        },
      ];

      const canCheck = (request: AccessRequest): boolean => {
        // Grant read, deny delete
        return request.action === 'read';
      };

      const result = filterNavigationItems(items, canCheck);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('parent');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].id).toBe('child1');
    });

    it('should keep parent and all children when all visible', () => {
      const items: NavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'child1', label: 'Child 1' },
            { id: 'child2', label: 'Child 2' },
          ],
        },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(2);
    });

    it('should keep parent with some children when some children are hidden', () => {
      const items: NavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            {
              id: 'public',
              label: 'Public',
              // No access requirement
            },
            {
              id: 'admin',
              label: 'Admin',
              access: { action: 'manage', resource: 'settings' },
            },
          ],
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('parent');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].id).toBe('public');
    });

    it('should remove entire subtree when parent is denied (no child promotion)', () => {
      const items: NavigationItem[] = [
        {
          id: 'admin',
          label: 'Admin',
          access: { action: 'manage', resource: 'settings' },
          children: [
            {
              id: 'users',
              label: 'Users',
              // No access requirement on child - would be visible if not for parent
            },
            {
              id: 'roles',
              label: 'Roles',
              access: { action: 'read', resource: 'role' },
            },
          ],
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      // Entire subtree removed - no child promotion in V1
      expect(result).toEqual([]);
    });

    it('should handle deep nesting (3+ levels)', () => {
      const items: NavigationItem[] = [
        {
          id: 'level1',
          label: 'Level 1',
          children: [
            {
              id: 'level2a',
              label: 'Level 2a',
              children: [
                {
                  id: 'level3a',
                  label: 'Level 3a',
                  access: { action: 'read', resource: 'booking' },
                },
                {
                  id: 'level3b',
                  label: 'Level 3b',
                  access: { action: 'delete', resource: 'booking' },
                },
              ],
            },
            {
              id: 'level2b',
              label: 'Level 2b',
            },
          ],
        },
      ];

      const canCheck = (request: AccessRequest): boolean => {
        return request.action === 'read';
      };

      const result = filterNavigationItems(items, canCheck);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('level1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].children).toHaveLength(1);
      expect(result[0].children![0].children![0].id).toBe('level3a');
    });
  });

  describe('edge cases', () => {
    it('should return empty array when all items are hidden', () => {
      const items: NavigationItem[] = [
        {
          id: 'admin',
          label: 'Admin',
          access: { action: 'manage', resource: 'settings' },
        },
        {
          id: 'reports',
          label: 'Reports',
          access: { action: 'read', resource: 'report' },
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      expect(result).toEqual([]);
    });

    it('should handle mixed access and no-access items', () => {
      const items: NavigationItem[] = [
        {
          id: 'public',
          label: 'Public',
          path: '/public',
          // No access requirement
        },
        {
          id: 'protected',
          label: 'Protected',
          path: '/protected',
          access: { action: 'read', resource: 'booking' },
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('public');
    });

    it('should handle items with complex access requirements', () => {
      const canCheck = (request: AccessRequest): boolean => {
        if (request.resourceData) {
          const data = request.resourceData as { allowed: boolean };
          return data.allowed;
        }
        return false;
      };

      const items: NavigationItem[] = [
        {
          id: 'allowed',
          label: 'Allowed',
          access: {
            action: 'read',
            resource: 'booking',
            resourceData: { allowed: true },
          },
        },
        {
          id: 'denied',
          label: 'Denied',
          access: {
            action: 'read',
            resource: 'booking',
            resourceData: { allowed: false },
          },
        },
      ];

      const result = filterNavigationItems(items, canCheck);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('allowed');
    });

    it('should preserve metadata after filtering', () => {
      const items: NavigationItem[] = [
        {
          id: 'item1',
          label: 'Item 1',
          metadata: { badge: 5, color: 'red' },
        },
        {
          id: 'item2',
          label: 'Item 2',
          metadata: { tooltip: 'Info' },
        },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result[0].metadata).toEqual({ badge: 5, color: 'red' });
      expect(result[1].metadata).toEqual({ tooltip: 'Info' });
    });

    it('should handle undefined children gracefully', () => {
      const items: NavigationItem[] = [
        {
          id: 'item',
          label: 'Item',
          children: undefined,
        },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result).toHaveLength(1);
      expect(result[0].children).toBeUndefined();
    });
  });

  describe('structural invariants', () => {
    it('should return valid NavigationItem array', () => {
      const items: NavigationItem[] = [
        { id: 'item1', label: 'Item 1' },
        { id: 'item2', label: 'Item 2' },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
      });
    });

    it('should never create orphaned children', () => {
      const items: NavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          access: { action: 'manage', resource: 'settings' },
          children: [{ id: 'child', label: 'Child' }],
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      // Parent denied - children should not appear at root level
      expect(result).toEqual([]);
    });

    it('should preserve original order within each level', () => {
      const items: NavigationItem[] = [
        { id: '1', label: '1' },
        { id: '2', label: '2' },
        { id: '3', label: '3' },
        { id: '4', label: '4' },
        { id: '5', label: '5' },
      ];

      const result = filterNavigationItems(items, grantAccess);

      expect(result.map((i) => i.id)).toEqual(['1', '2', '3', '4', '5']);
    });

    it('should verify parent denied removes entire subtree (V1 predictability rule)', () => {
      const items: NavigationItem[] = [
        {
          id: 'denied-parent',
          label: 'Denied Parent',
          access: { action: 'manage', resource: 'admin' },
          children: [
            {
              id: 'visible-child',
              label: 'Visible Child',
              // No access requirement - would be visible independently
              children: [
                {
                  id: 'nested-visible',
                  label: 'Nested Visible',
                  // Also no requirement
                },
              ],
            },
          ],
        },
        {
          id: 'visible-sibling',
          label: 'Visible Sibling',
          // No access requirement
        },
      ];

      const result = filterNavigationItems(items, denyAccess);

      // Only visible-sibling should remain
      // visible-child and nested-visible are removed with denied-parent
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('visible-sibling');
    });
  });
});
