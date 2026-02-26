import type { ReactNode } from 'react';
import type { Breakpoint } from '@mui/material/styles';

/**
 * Navigation item type.
 */
export type LeftNavItemType = 'group' | 'collapse' | 'item';

/**
 * Size variant for navigation items.
 */
export type LeftNavSize = 'sm' | 'md' | 'lg';

/**
 * Mobile drawer behavior.
 */
export type LeftNavMobileVariant = 'temporary' | 'disabled';

/**
 * Navigation item model.
 */
export interface LeftNavItem {
  /** Stable unique identifier */
  id: string;

  /** Item type determines rendering behavior */
  type: LeftNavItemType;

  /** Display label */
  label: string;

  /** Navigation key (typically a path segment or identifier) */
  key: string;

  /** Optional icon element */
  icon?: ReactNode;

  /** Whether the item is disabled */
  disabled?: boolean;

  /** Optional badge content */
  badge?: ReactNode;

  /** Nested items (for collapse and group types) */
  children?: LeftNavItem[];

  /** Show a divider before this item */
  dividerBefore?: boolean;

  /** App-defined metadata */
  meta?: unknown;
}

/**
 * Callback to render a navigation link.
 * Router-agnostic: integrator provides their own Link component.
 *
 * @param item - The navigation item
 * @param children - The content to render inside the link
 * @returns A ReactNode representing the link
 */
export type RenderLinkFn = (
  item: LeftNavItem,
  children: ReactNode
) => ReactNode;

/**
 * Callback to determine if an item is active.
 *
 * @param item - The navigation item
 * @returns true if the item should be marked as active
 */
export type IsActiveFn = (item: LeftNavItem) => boolean;

/**
 * Props for the LeftNav component.
 */
export interface LeftNavProps {
  /** Navigation items to render */
  items: LeftNavItem[];

  /**
   * Controlled drawer open state.
   * When provided, component operates in controlled mode.
   */
  open?: boolean;

  /**
   * Default drawer open state for uncontrolled mode.
   * @default true
   */
  defaultOpen?: boolean;

  /**
   * Callback when drawer open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Controlled expanded collapse IDs.
   * When provided, component operates in controlled mode for collapses.
   */
  expandedIds?: string[];

  /**
   * Default expanded collapse IDs for uncontrolled mode.
   * @default []
   */
  defaultExpandedIds?: string[];

  /**
   * Callback when expanded collapse IDs change.
   */
  onExpandedIdsChange?: (expandedIds: string[]) => void;

  /**
   * Router-agnostic link renderer.
   * If not provided, items are rendered as non-interactive text.
   */
  renderLink?: RenderLinkFn;

  /**
   * Callback to determine if an item is active.
   * Used to apply active styling.
   */
  isActive?: IsActiveFn;

  /**
   * Size variant for navigation items.
   * @default 'md'
   */
  size?: LeftNavSize;

  /**
   * Width in pixels when drawer is expanded.
   * @default 280
   */
  widthExpanded?: number;

  /**
   * Width in pixels when drawer is collapsed.
   * @default 64
   */
  widthCollapsed?: number;

  /**
   * Breakpoint below which mobile behavior is triggered.
   * @default 'md'
   */
  mobileBreakpoint?: Breakpoint;

  /**
   * Mobile drawer variant.
   * @default 'temporary'
   */
  mobileVariant?: LeftNavMobileVariant;

  /**
   * Whether to close the drawer on navigation (mobile only).
   * @default true
   */
  closeOnNavigateMobile?: boolean;

  /**
   * Optional header slot.
   */
  header?: ReactNode;

  /**
   * Optional footer slot.
   */
  footer?: ReactNode;

  /**
   * Additional CSS class name for the root element.
   */
  className?: string;

  /**
   * Optional test ID for the root element.
   */
  'data-testid'?: string;
}
