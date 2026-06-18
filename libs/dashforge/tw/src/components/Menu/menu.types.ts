import type { ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';

/**
 * Placement of the menu content relative to the trigger. Maps 1:1 to
 * Radix DropdownMenu's `side` + `align` pair via the internal
 * helpers in Menu.tsx.
 */
export type MenuPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Props for the top-level `<Menu>` provider.
 *
 * Wraps Radix `DropdownMenu.Root`. Provides open-state coordination
 * + closeOnItemClick context for descendant `<MenuItem>`s.
 */
export interface MenuProps {
  /** Compound children: `<MenuTrigger>` + `<MenuContent>`. */
  children: ReactNode;

  /** Controlled open state. */
  open?: boolean;

  /** Default open state for uncontrolled mode. @default false */
  defaultOpen?: boolean;

  /** Open/close callback (controlled). */
  onOpenChange?: (open: boolean) => void;

  /**
   * Close the menu when an item is clicked. Set to `false` for
   * filter-style menus where item clicks should NOT dismiss (e.g.,
   * multi-select checkbox menus, sticky filter pills).
   * @default true
   */
  closeOnItemClick?: boolean;

  /**
   * Placement of the content relative to the trigger.
   * @default 'bottom-start'
   */
  placement?: MenuPlacement;

  /**
   * Pixel offset between trigger and content along the perpendicular
   * axis (e.g., for `placement='bottom-*'`, the vertical gap).
   * @default 6
   */
  sideOffset?: number;

  /**
   * Modal mode (Radix). When `true`, the menu blocks interaction with
   * the rest of the page (focus trap + outside scroll lock). When
   * `false`, dismissal is automatic on outside-click but the page
   * remains interactive. Default false matches the "lightweight
   * action menu" pattern.
   * @default false
   */
  modal?: boolean;
}

/**
 * Props for `<MenuTrigger>` — the element that opens the menu.
 *
 * Always renders via Radix Slot — the immediate child element
 * (typically `<IconButton>`, `<Button>`, or a custom interactive
 * component) receives the click handler, `aria-haspopup="menu"`,
 * and `aria-expanded` reactive to open state.
 */
export interface MenuTriggerProps {
  /** The trigger element. */
  children: ReactNode;
}

/**
 * Props for `<MenuContent>` — the floating panel.
 *
 * Rendered through Radix `DropdownMenu.Portal`, lazily mounted only
 * when the menu is open (cost zero in DOM when closed).
 */
export interface MenuContentProps {
  /** Items + labels + separators + skeletons. */
  children: ReactNode;

  /** CSS min-width for the menu panel. */
  minWidth?: number | string;

  /** Standard className — appended to the root via `cn()`. */
  className?: string;

  /** Root-element class shortcut. */
  sx?: ClassValue;
}

/**
 * Visual / semantic color of a `<MenuItem>`. `'danger'` highlights
 * destructive actions with a red hover state.
 */
export type MenuItemColor = 'default' | 'danger';

/**
 * Props for `<MenuItem>` — a clickable row inside the menu.
 *
 * Memoized (`React.memo`) for perf — re-renders only on prop change.
 * Pattern inspired by Atlaskit's ButtonItem optimization.
 */
export interface MenuItemProps {
  /** Item label / content. */
  children: ReactNode;

  /**
   * Click handler. After firing, the menu closes (unless the parent
   * `<Menu closeOnItemClick={false}>` opts out).
   */
  onClick?: () => void;

  /** Leading icon slot. */
  icon?: ReactNode;

  /**
   * Trailing slot — typically a keyboard shortcut (`"⌘K"`), a
   * status hint, or a sub-menu chevron (when sub-menus arrive).
   */
  endIcon?: ReactNode;

  /** Disabled state — suppresses click + dims the item. */
  disabled?: boolean;

  /**
   * Visual hint of "active option" — for menus that show current
   * selection (e.g., theme picker). No controlled selection state
   * by design (v1) — purely visual.
   */
  selected?: boolean;

  /**
   * Color intent. `'danger'` highlights destructive actions
   * (Delete, Remove, Sign out) with a red hover tint.
   * @default 'default'
   */
  color?: MenuItemColor;

  /**
   * RBAC requirement. When the current subject doesn't satisfy it,
   * the item is hidden (or disabled per `onUnauthorized`).
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate. When `false`, the item renders
   * `null`. Use for state-driven menu items (e.g., "Restore" only
   * when an item was just deleted).
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Standard className. */
  className?: string;

  /** Root-element class shortcut. */
  sx?: ClassValue;
}

/**
 * Props for `<MenuLabel>` — non-interactive group heading.
 *
 * Rendered as `role="presentation"` so screen readers don't
 * announce it as a menuitem. Typical use: section dividers inside
 * a menu ("Workspace", "Account", "Help").
 */
export interface MenuLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Props for `<MenuSeparator>` — horizontal divider between items.
 */
export interface MenuSeparatorProps {
  className?: string;
}

/**
 * Props for `<MenuSkeleton>` — Atlaskit-style loading state.
 *
 * Renders N placeholder rows that mimic the menu's item geometry,
 * giving the user immediate visual feedback while the real items
 * are being fetched (e.g., "Recent files" pulled from an API).
 * Strictly perceived-performance UX: no animation overhead beyond
 * Tailwind's `animate-pulse`.
 */
export interface MenuSkeletonProps {
  /**
   * Number of skeleton item rows to render.
   * @default 3
   */
  count?: number;

  /**
   * Show a skeleton heading at the top of the list (matches the
   * height + indent of a real `<MenuLabel>`).
   * @default false
   */
  withHeading?: boolean;

  /** Standard className. */
  className?: string;
}
