/**
 * Navigation Filtering
 *
 * This module provides utilities for filtering navigation items based on RBAC permissions.
 *
 * V1 BEHAVIOR: If parent is hidden, entire subtree is removed.
 * No automatic child promotion (too magical for V1).
 */

import type { AccessRequest } from '../core/types';
import type { NavigationItem } from './types';
import { resolveAccessState } from './resolve-access-state';

/**
 * Filters navigation items based on access permissions.
 *
 * V1 BEHAVIOR: If parent is hidden, entire subtree is removed.
 * No automatic child promotion (too magical for V1).
 *
 * @param items - The navigation items to filter
 * @param canCheck - The RBAC permission checker function
 * @returns Filtered array of visible navigation items with filtered children
 *
 * @example
 * ```typescript
 * const { can } = useRbac();
 * const allItems = [
 *   {
 *     id: 'bookings',
 *     label: 'Bookings',
 *     access: { action: 'read', resource: 'booking' }
 *   },
 *   {
 *     id: 'admin',
 *     label: 'Admin',
 *     access: { action: 'manage', resource: 'settings' },
 *     children: [...]
 *   }
 * ];
 *
 * const visibleItems = filterNavigationItems(allItems, can);
 * return <LeftNav items={visibleItems} />;
 * ```
 */
export function filterNavigationItems(
  items: NavigationItem[],
  canCheck: (request: AccessRequest) => boolean
): NavigationItem[] {
  const result: NavigationItem[] = [];

  for (const item of items) {
    // Step 1: Check item access
    let itemVisible = true;

    if (item.access) {
      const state = resolveAccessState(item.access, canCheck);
      itemVisible = state.visible;
    }

    // Step 2: Only process if item is visible
    if (!itemVisible) {
      // Item hidden → skip entire subtree (no child promotion)
      continue;
    }

    // Step 3: Recursively filter children
    let filteredChildren: NavigationItem[] | undefined;

    if (item.children) {
      filteredChildren = filterNavigationItems(item.children, canCheck);
    }

    // Step 4: Include item with filtered children (or undefined if no children)
    if (filteredChildren !== undefined) {
      result.push({
        ...item,
        children: filteredChildren,
      });
    } else {
      // No children - preserve item without children property if original had none
      result.push({ ...item });
    }
  }

  return result;
}
