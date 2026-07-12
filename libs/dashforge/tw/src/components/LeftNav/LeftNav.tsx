import { useCallback, useState } from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { leftNavVariants } from './leftNav.variants.js';
import type {
  LeftNavGroup,
  LeftNavItem,
  LeftNavNode,
  LeftNavProps,
} from './leftNav.types.js';

/** Type-narrowing guard for `LeftNavGroup`. */
function isGroup(node: LeftNavNode): node is LeftNavGroup {
  return node.kind === 'group';
}

/**
 * Internal `<NavItemRow>` — renders one clickable row.
 *
 * Extracted as a separate component so each row can call `useAccessState`
 * unconditionally (RBAC is per-row). Without this extraction we'd have
 * a rules-of-hooks violation iterating `items.map(useAccessState)`.
 */
function NavItemRow({
  item,
  isActive,
  collapsed,
  linkComponent,
  v,
  slotProps,
}: {
  item: LeftNavItem;
  isActive: boolean;
  collapsed: boolean;
  linkComponent: NonNullable<LeftNavProps['linkComponent']>;
  v: ReturnType<typeof leftNavVariants>;
  slotProps: LeftNavProps['slotProps'];
}) {
  const accessState = useAccessState(item.access);
  if (!accessState.visible) return null;

  const isDisabled = Boolean(item.disabled) || accessState.disabled;
  const Link = linkComponent;

  const linkClasses = cn(
    v.itemLink(),
    isActive && v.itemActive(),
    slotProps?.itemLink?.className,
    isActive && slotProps?.itemActive?.className
  );

  // Visual content — same in `<a>` / `<button>` branches below.
  const content = (
    <>
      {item.icon && (
        <span
          aria-hidden="true"
          className={cn(v.itemIcon(), slotProps?.itemIcon?.className)}
        >
          {item.icon}
        </span>
      )}
      <span className={cn(v.itemLabel(), slotProps?.itemLabel?.className)}>
        {item.label}
      </span>
      {!collapsed && item.badge != null && (
        <span className={cn(v.itemBadge(), slotProps?.itemBadge?.className)}>
          {item.badge}
        </span>
      )}
    </>
  );

  return (
    <li className={cn(v.item(), slotProps?.item?.className)}>
      {item.href !== undefined ? (
        <Link
          href={item.href}
          onClick={(event) => {
            if (isDisabled) {
              event.preventDefault();
              return;
            }
            item.onSelect?.();
          }}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled || undefined}
          title={collapsed && typeof item.label === 'string' ? item.label : undefined}
          className={linkClasses}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (isDisabled) return;
            item.onSelect?.();
          }}
          aria-current={isActive ? 'page' : undefined}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          title={collapsed && typeof item.label === 'string' ? item.label : undefined}
          className={linkClasses}
        >
          {content}
        </button>
      )}
    </li>
  );
}

/**
 * Internal `<NavGroupRow>` — renders a collapsible group of items.
 *
 * State strategy: each group owns its own `expanded` state (uncontrolled
 * by default, seeded from `defaultExpanded`). A controlled mode kicks
 * in when `group.expanded` is provided — then the parent owns the state
 * and we never call `setLocalExpanded`.
 */
function NavGroupRow({
  group,
  activeId,
  collapsed,
  linkComponent,
  onGroupExpandedChange,
  v,
  slotProps,
}: {
  group: LeftNavGroup;
  activeId: string | undefined;
  collapsed: boolean;
  linkComponent: NonNullable<LeftNavProps['linkComponent']>;
  onGroupExpandedChange?: (groupId: string, expanded: boolean) => void;
  v: ReturnType<typeof leftNavVariants>;
  slotProps: LeftNavProps['slotProps'];
}) {
  const accessState = useAccessState(group.access);
  const isControlled = group.expanded !== undefined;
  const [localExpanded, setLocalExpanded] = useState<boolean>(
    group.defaultExpanded ?? true
  );
  const expanded = isControlled ? Boolean(group.expanded) : localExpanded;

  if (!accessState.visible) return null;
  const isDisabled = accessState.disabled;

  const toggle = () => {
    if (isDisabled) return;
    const next = !expanded;
    if (!isControlled) setLocalExpanded(next);
    onGroupExpandedChange?.(group.id, next);
  };

  // Group header ids → wires aria-controls / aria-labelledby for the
  // expandable region the screen-reader announces.
  const headerId = `${group.id}-header`;
  const regionId = `${group.id}-region`;

  return (
    <li className={cn(v.group(), slotProps?.group?.className)}>
      <button
        id={headerId}
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={regionId}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        title={collapsed && typeof group.label === 'string' ? group.label : undefined}
        className={cn(v.groupHeader(), slotProps?.groupHeader?.className)}
      >
        {group.icon && (
          <span
            aria-hidden="true"
            className={cn(v.itemIcon(), slotProps?.itemIcon?.className)}
          >
            {group.icon}
          </span>
        )}
        <span className={cn(v.itemLabel(), slotProps?.itemLabel?.className)}>
          {group.label}
        </span>
        {!collapsed && (
          <span aria-hidden="true" className="shrink-0 text-neutral-500 text-xs">
            {expanded ? '▾' : '▸'}
          </span>
        )}
      </button>
      {expanded && (
        <ul
          id={regionId}
          role="region"
          aria-labelledby={headerId}
          className={cn(
            v.groupChildren(),
            slotProps?.groupChildren?.className
          )}
        >
          {group.children.map((child) => (
            <NavItemRow
              key={child.id}
              item={child}
              isActive={activeId === child.id}
              collapsed={collapsed}
              linkComponent={linkComponent}
              v={v}
              slotProps={slotProps}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Dashforge TW LeftNav — router-agnostic sidebar navigation.
 *
 * Pure presentational. The consumer wires `activeId` from the current
 * route. Each row renders as a real `<a>` (with `href`) or a `<button>`
 * (with `onSelect`); `linkComponent` swaps in a router-aware link
 * component for SPA navigation.
 *
 * Modes:
 *   - **Expanded** (`collapsed={false}`): full-width with labels +
 *     badges + group children visible.
 *   - **Rail** (`collapsed={true}`): 56px wide, icons only, labels
 *     hidden from sighted users (still announced to screen readers via
 *     `sr-only`). Group children are hidden — clicking the group
 *     header is a no-op visually in rail mode (consumer is expected
 *     to either expand the nav or surface a flyout in a follow-up).
 *
 * **A11y**:
 *   - `<nav aria-label="…">` landmark.
 *   - `aria-current="page"` on the active row.
 *   - Groups expose `aria-expanded` / `aria-controls` and the children
 *     wrapper is `role="region" aria-labelledby="…-header"`.
 *   - Rail-mode tooltips via the native `title` attribute (preserves
 *     hover discoverability when labels are visually hidden).
 *
 * **Re-render contract**:
 *   - Rows are extracted into stable sub-components so a single
 *     `activeId` change re-renders all rows but each does only its
 *     own `useAccessState` lookup; this is the price of per-row RBAC.
 *   - Group expand/collapse re-renders ONLY that group (local state).
 */
export function LeftNav(props: LeftNavProps) {
  const themeDefaults = useComponentDefaults('LeftNav');
  const merged: LeftNavProps = { ...themeDefaults?.defaults, ...props };
  const {
    items,
    activeId,
    collapsed = false,
    onCollapseChange,
    onGroupExpandedChange,
    brand,
    footer,
    width,
    linkComponent = 'a' as unknown as NonNullable<LeftNavProps['linkComponent']>,
    ariaLabel = 'Main navigation',
    sx,
    slotProps,
    showCollapseToggle = true,
  } = merged;

  const v = leftNavVariants({ width, collapsed });

  const handleCollapseToggle = useCallback(() => {
    onCollapseChange?.(!collapsed);
  }, [collapsed, onCollapseChange]);

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      {(brand || (showCollapseToggle && onCollapseChange)) && (
        <div className={cn(v.brand(), slotProps?.brand?.className)}>
          {brand && <div className="flex-1 min-w-0 truncate">{brand}</div>}
          {showCollapseToggle && onCollapseChange && (
            <button
              type="button"
              onClick={handleCollapseToggle}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-pressed={collapsed}
              className={cn(
                v.collapseToggle(),
                slotProps?.collapseToggle?.className
              )}
            >
              {collapsed ? '»' : '«'}
            </button>
          )}
        </div>
      )}

      <ul className={cn(v.list(), slotProps?.list?.className)}>
        {items.map((node) =>
          isGroup(node) ? (
            <NavGroupRow
              key={node.id}
              group={node}
              activeId={activeId}
              collapsed={collapsed}
              linkComponent={linkComponent}
              onGroupExpandedChange={onGroupExpandedChange}
              v={v}
              slotProps={slotProps}
            />
          ) : (
            <NavItemRow
              key={node.id}
              item={node}
              isActive={activeId === node.id}
              collapsed={collapsed}
              linkComponent={linkComponent}
              v={v}
              slotProps={slotProps}
            />
          )
        )}
      </ul>

      {footer && (
        <div className={cn(v.footer(), slotProps?.footer?.className)}>
          {footer}
        </div>
      )}
    </nav>
  );
}
