import type { ReactNode, ComponentType, AnchorHTMLAttributes } from 'react';
import type { BreadcrumbsVariants } from './breadcrumbs.variants.js';

/**
 * A single crumb in the trail.
 *
 * - `label` is the visible text (or any React node).
 * - `href` makes it a navigation link. Omit for a non-link crumb (e.g.,
 *   the current page).
 * - `onClick` is fired in addition to (or instead of) `href`; useful
 *   when the consumer wants to intercept SPA navigation.
 * - `current: true` flags the LAST crumb as the active page; gets
 *   `aria-current="page"` and is rendered as plain text (no link).
 */
export interface BreadcrumbItem {
  /** Stable key for React reconciliation + accessibility id. */
  id: string;
  label: ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  current?: boolean;
  /** Per-item disabled flag — renders as plain text, no interaction. */
  disabled?: boolean;
  /** Optional icon prepended to the label. */
  icon?: ReactNode;
}

export interface BreadcrumbsSlotProps {
  root?: { className?: string };
  list?: { className?: string };
  item?: { className?: string };
  link?: { className?: string };
  current?: { className?: string };
  separator?: { className?: string };
  ellipsis?: { className?: string };
}

/**
 * Polymorphic link component prop. Defaults to the native `<a>`.
 *
 * Pass a router-aware component (e.g., `react-router-dom`'s `Link`,
 * Next's `Link`) for SPA navigation. The component must accept
 * `href` (or its router-equivalent — bring your own adapter) plus
 * standard anchor props (className, onClick, children, ref).
 */
export type BreadcrumbLinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: React.Ref<HTMLAnchorElement> }
>;

/**
 * Props for `<Breadcrumbs>`.
 *
 * Renders a router-agnostic navigation trail. Bridge-free — pure
 * presentational, accepts a fully-resolved item list from the consumer
 * (typically derived from route metadata).
 *
 * **Truncation**: when `items.length > maxItems`, the middle crumbs
 * collapse into an ellipsis (`…`). Always preserved: first + last
 * crumb. Tunable via `itemsBeforeCollapse` / `itemsAfterCollapse` for
 * asymmetric trails (defaults: 1 + 1).
 */
export interface BreadcrumbsProps extends BreadcrumbsVariants {
  items: BreadcrumbItem[];
  /** Separator node between crumbs. @default '/' */
  separator?: ReactNode;
  /**
   * Max crumbs to show before collapsing the middle. `0` / negative ⇒
   * never collapse. @default 0
   */
  maxItems?: number;
  /**
   * Crumbs preserved at the START when collapsed. @default 1
   */
  itemsBeforeCollapse?: number;
  /**
   * Crumbs preserved at the END when collapsed. @default 1
   */
  itemsAfterCollapse?: number;
  /** Per-slot className overrides. */
  slotProps?: BreadcrumbsSlotProps;
  /** Root className shortcut. */
  sx?: string;
  /** Override the link component (router integration). @default 'a' */
  linkComponent?: BreadcrumbLinkComponent;
  /** Visible label of the nav landmark. @default 'Breadcrumb' */
  ariaLabel?: string;
}
