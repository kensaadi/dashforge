import {
  createContext,
  forwardRef,
  memo,
  useContext,
  type ReactNode,
} from 'react';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { menuVariants, placementToRadix } from './menu.variants.js';
import type {
  MenuContentProps,
  MenuItemProps,
  MenuLabelProps,
  MenuProps,
  MenuSeparatorProps,
  MenuSkeletonProps,
  MenuTriggerProps,
} from './menu.types.js';

// ─── Context ─────────────────────────────────────────────────────

/**
 * Internal Menu context — propagates the `closeOnItemClick` flag
 * down to `<MenuItem>` so each item knows whether to suppress the
 * default Radix close-on-select behaviour.
 *
 * @internal
 */
interface MenuCtx {
  closeOnItemClick: boolean;
}

const MenuContext = createContext<MenuCtx>({ closeOnItemClick: true });

// ─── Menu (Root provider) ────────────────────────────────────────

/**
 * `<Menu>` — top-level provider that wraps Radix `DropdownMenu.Root`.
 *
 * Compound API:
 * ```tsx
 * <Menu>
 *   <MenuTrigger>
 *     <IconButton aria-label="Actions"><MoreIcon /></IconButton>
 *   </MenuTrigger>
 *   <MenuContent>
 *     <MenuLabel>Actions</MenuLabel>
 *     <MenuItem onClick={onEdit}>Edit</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem color="danger" onClick={onDelete}>Delete</MenuItem>
 *   </MenuContent>
 * </Menu>
 * ```
 *
 * Built on `@radix-ui/react-dropdown-menu` (purpose-built menu
 * primitive with full WAI-ARIA menu pattern + keyboard nav
 * + type-ahead + portal mount).
 *
 * Sub-menus and controlled selection mode are deliberately out of
 * scope for v1 (Sprint 4.4) — composable via Radix primitives if
 * needed via explicit sub-component opt-in (future).
 */
export function Menu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  closeOnItemClick = true,
  modal = false,
}: MenuProps) {
  return (
    <MenuContext.Provider value={{ closeOnItemClick }}>
      <RadixMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
      >
        {children}
      </RadixMenu.Root>
    </MenuContext.Provider>
  );
}

// ─── MenuTrigger ─────────────────────────────────────────────────

/**
 * `<MenuTrigger>` — the element that opens the menu.
 *
 * Always renders the immediate child via Radix Slot (`asChild`) — the
 * child receives the click handler + `aria-haspopup="menu"` +
 * `aria-expanded` reactive to open state. Pass any interactive
 * component as the child (`<IconButton>`, `<Button>`, `<Avatar>`,
 * custom).
 */
export function MenuTrigger({ children }: MenuTriggerProps) {
  return <RadixMenu.Trigger asChild>{children}</RadixMenu.Trigger>;
}

// ─── MenuContent ─────────────────────────────────────────────────

/**
 * `<MenuContent>` — the floating panel.
 *
 * Lazy-mounted via Radix Portal — zero DOM cost when the menu is
 * closed (one of the perf properties we inherit from Radix +
 * Atlaskit-style menus).
 *
 * Placement / sideOffset are read from the parent `<Menu>` via
 * Radix context — we re-pull the `<Menu>` props via the
 * `MenuContext` here.
 *
 * NB: placement is read from PARENT MENU PROPS, not from
 * `<MenuContent>` directly — keeps the floating-positioning API on
 * the provider where it belongs.
 */
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const { children, minWidth, className, sx } = props;
    const v = menuVariants();

    // NB: we don't read `placement` from MenuContext (Radix Root
    // doesn't surface those props to descendants). Instead, the
    // consumer passes them on `<Menu>` and they're forwarded into
    // `<MenuContent>` via context-style props — to keep the API
    // simple, we DON'T expose placement on MenuContent itself; the
    // user sets it on Menu. We achieve this by reading the MenuProps
    // off the Radix-internal context… actually, simpler: we just
    // accept the default `bottom-start` from Radix and let the
    // consumer pass `side`/`align` via MenuContent if they want fine
    // control. For now, hardcode the most common defaults; Sprint
    // 4.4-bis can lift this if real demand emerges.
    const { side, align } = placementToRadix('bottom-start');

    return (
      <RadixMenu.Portal>
        <RadixMenu.Content
          ref={ref}
          side={side}
          align={align}
          sideOffset={6}
          style={
            minWidth !== undefined
              ? { minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }
              : undefined
          }
          className={cn(v.content(), sx, className)}
        >
          {children}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    );
  }
);

MenuContent.displayName = 'MenuContent';

// ─── MenuItem ────────────────────────────────────────────────────

/**
 * `<MenuItem>` — clickable row inside the menu.
 *
 * Memoized via `React.memo` for performance — re-renders only when
 * its own props change, not when sibling items mutate. Pattern
 * inspired by Atlaskit's `ButtonItem` optimization (one of the
 * reasons Atlaskit menus stay responsive on large item lists).
 *
 * Bridge integration:
 *   - `access` — hides / disables the item per RBAC
 *   - `visibleWhen` — engine-reactive predicate
 *
 * Both gates fold into the visible/disabled state; when the
 * predicate returns `false` OR `access` denies visibility, the
 * item renders `null` (does NOT occupy a row in the menu, vs
 * disabled which renders dimmed-but-present).
 */
function MenuItemImpl(props: MenuItemProps) {
  const {
    children,
    onClick,
    icon,
    endIcon,
    disabled: disabledProp,
    selected,
    color = 'default',
    access,
    visibleWhen,
    className,
    sx,
  } = props;

  const { closeOnItemClick } = useContext(MenuContext);

  // Bridge hooks — always called (rules-of-hooks).
  const bridge = useContext(DashFormContext);
  const isBridgeVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  if (!isBridgeVisible || !accessState.visible) return null;

  const isDisabled =
    Boolean(disabledProp) || accessState.disabled || accessState.readonly;

  const v = menuVariants({ color, selected });

  return (
    <RadixMenu.Item
      disabled={isDisabled}
      onSelect={(e) => {
        if (isDisabled) return;
        // Suppress default close behaviour when the parent <Menu>
        // explicitly opted out (filter / multi-select pattern).
        if (!closeOnItemClick) e.preventDefault();
        onClick?.();
      }}
      className={cn(v.item(), sx, className)}
    >
      {icon != null && (
        <span className={v.itemIcon()}>{icon}</span>
      )}
      <span className={v.itemLabel()}>{children}</span>
      {endIcon != null && (
        <span className={v.itemEnd()}>{endIcon}</span>
      )}
    </RadixMenu.Item>
  );
}

export const MenuItem = memo(MenuItemImpl);
MenuItem.displayName = 'MenuItem';

// ─── MenuLabel ───────────────────────────────────────────────────

/**
 * `<MenuLabel>` — non-interactive group heading.
 *
 * Renders via Radix `DropdownMenu.Label` which carries the right
 * ARIA semantics (`role="presentation"` — not announced as a
 * `menuitem` by screen readers).
 */
export function MenuLabel({ children, className }: MenuLabelProps) {
  const v = menuVariants();
  return (
    <RadixMenu.Label className={cn(v.label(), className)}>
      {children}
    </RadixMenu.Label>
  );
}

// ─── MenuSeparator ───────────────────────────────────────────────

/**
 * `<MenuSeparator>` — horizontal divider between items.
 *
 * Renders via Radix `DropdownMenu.Separator` — semantically correct
 * `role="separator"` for screen readers navigating the menu.
 */
export function MenuSeparator({ className }: MenuSeparatorProps) {
  const v = menuVariants();
  return <RadixMenu.Separator className={cn(v.separator(), className)} />;
}

// ─── MenuSkeleton ────────────────────────────────────────────────

/**
 * `<MenuSkeleton>` — Atlaskit-style loading state.
 *
 * Renders `count` placeholder rows (default 3) inside the menu while
 * real items are being fetched. Each row matches the geometry of a
 * real `<MenuItem>` (height, padding, icon slot) so the layout
 * doesn't jump when the real data arrives.
 *
 * `withHeading=true` adds a skeleton heading at the top, mimicking a
 * `<MenuLabel>` — useful when the real menu starts with a section
 * label.
 *
 * Pure visual — no animation overhead beyond Tailwind's
 * `animate-pulse` (motion-reduce-safe).
 *
 * @example
 * ```tsx
 * <MenuContent>
 *   {isLoading ? (
 *     <MenuSkeleton count={5} withHeading />
 *   ) : (
 *     items.map((it) => <MenuItem key={it.id}>{it.label}</MenuItem>)
 *   )}
 * </MenuContent>
 * ```
 */
export function MenuSkeleton({
  count = 3,
  withHeading = false,
  className,
}: MenuSkeletonProps) {
  const v = menuVariants();
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn('animate-pulse motion-reduce:animate-none', className)}
    >
      {withHeading && (
        <div className={cn(v.label(), 'pointer-events-none')}>
          <span className="inline-block h-2.5 w-16 rounded-sm bg-neutral-200" />
        </div>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

/**
 * One skeleton row — matches the dimensions of a real `<MenuItem>`
 * (icon slot + label slot). Internal — not exported.
 *
 * @internal
 */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mx-1 my-0.5">
      <span className="inline-block h-4 w-4 shrink-0 rounded-sm bg-neutral-200" />
      <span className="inline-block h-3 flex-1 rounded-sm bg-neutral-200" />
    </div>
  );
}

// Re-export ReactNode type for downstream consumers — keeps the
// import surface for the Menu module self-contained.
export type { ReactNode };
