import type {
  ReactNode,
  ComponentType,
  AnchorHTMLAttributes,
  Ref,
} from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { LeftNavVariants } from './leftNav.variants.js';

/**
 * One row in the LeftNav. May be either a clickable item OR a group
 * (a header that owns nested children, optionally collapsible).
 */
export type LeftNavNode = LeftNavItem | LeftNavGroup;

export interface LeftNavItem {
  kind?: 'item';
  /** Stable id used for `activeId` matching + React keys. */
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /**
   * Destination for navigation. Omit for a pure-callback item (use
   * `onSelect`).
   */
  href?: string;
  /** Fired when the row is clicked (in addition to navigation). */
  onSelect?: () => void;
  /** Optional pill / counter rendered to the right of the label. */
  badge?: ReactNode;
  /** Per-item disabled flag. */
  disabled?: boolean;
  /** RBAC access requirement — hides / disables the row. */
  access?: AccessRequirement;
}

export interface LeftNavGroup {
  kind: 'group';
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  children: LeftNavItem[];
  /**
   * Initial expanded state when used in uncontrolled mode. Default
   * `true` (groups open by default — most app navs want immediate
   * visibility).
   */
  defaultExpanded?: boolean;
  /** Controlled expanded state. Provide `onExpandedChange` to update. */
  expanded?: boolean;
  /** RBAC access requirement — hides / disables the whole group. */
  access?: AccessRequirement;
}

/**
 * Polymorphic link component prop. Defaults to `<a>`. Pass a
 * router-aware component (react-router `Link`, Next `Link`) for SPA
 * navigation.
 */
export type LeftNavLinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref?: Ref<HTMLAnchorElement>;
  }
>;

export interface LeftNavSlotProps {
  root?: { className?: string };
  brand?: { className?: string };
  list?: { className?: string };
  item?: { className?: string };
  itemLink?: { className?: string };
  itemActive?: { className?: string };
  itemIcon?: { className?: string };
  itemLabel?: { className?: string };
  itemBadge?: { className?: string };
  group?: { className?: string };
  groupHeader?: { className?: string };
  groupChildren?: { className?: string };
  footer?: { className?: string };
  collapseToggle?: { className?: string };
}

/**
 * Props for `<LeftNav>`.
 *
 * Router-agnostic sidebar navigation. The consumer drives the active
 * item via `activeId` (typically derived from the current route).
 *
 * Rail / drawer responsive behaviour is handled by `<AppShell>`; this
 * component renders the actual nav content and exposes a `collapsed`
 * prop for the icon-only "rail" rendering.
 */
export interface LeftNavProps extends LeftNavVariants {
  items: LeftNavNode[];
  /** Currently-active item id (highlight + `aria-current="page"`). */
  activeId?: string;
  /**
   * Icon-only rail mode. When `true`, labels and group children are
   * visually hidden (kept for screen readers via `sr-only`).
   */
  collapsed?: boolean;
  /** Fired when the user clicks the collapse-toggle button. */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Fired when a group's expanded state changes (controlled or not). */
  onGroupExpandedChange?: (groupId: string, expanded: boolean) => void;
  /** Brand / logo node rendered at the top. */
  brand?: ReactNode;
  /** Footer node (e.g., user badge). */
  footer?: ReactNode;
  /** Override the link component. @default 'a' */
  linkComponent?: LeftNavLinkComponent;
  /** Visible label of the nav landmark. @default 'Main navigation' */
  ariaLabel?: string;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: LeftNavSlotProps;
  /** Show / hide the collapse toggle button. @default true */
  showCollapseToggle?: boolean;
}
