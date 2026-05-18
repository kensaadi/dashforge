import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<LeftNav>`.
 *
 * Slots:
 *   - `root`           — `<nav>` landmark
 *   - `brand`          — top brand/logo wrapper
 *   - `list`           — `<ul>` containing items & groups
 *   - `item`           — `<li>` wrapper
 *   - `itemLink`       — clickable row (`<a>` or `<button>`)
 *   - `itemActive`     — active state on the row
 *   - `itemIcon`       — icon slot inside a row
 *   - `itemLabel`      — text label slot
 *   - `itemBadge`      — right-aligned pill
 *   - `group`          — wrapper around a group header + children
 *   - `groupHeader`    — clickable header row (`<button>`)
 *   - `groupChildren`  — `<ul>` containing the group's items
 *   - `footer`         — bottom slot (user badge, etc.)
 *   - `collapseToggle` — rail-mode toggle button
 */
export const leftNavVariants = tv({
  slots: {
    root: [
      'flex flex-col h-full',
      'bg-neutral-50 border-r border-neutral-200',
      'transition-[width] duration-200',
    ],
    brand: [
      'flex items-center gap-2 px-3 h-14 shrink-0',
      'border-b border-neutral-200 text-neutral-900 font-semibold',
    ],
    list: 'flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto',
    item: 'list-none',
    itemLink: [
      'flex items-center gap-2 px-2 py-2 rounded-md',
      'text-sm text-neutral-700 hover:bg-neutral-100',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors w-full',
      'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
      'aria-disabled:hover:bg-transparent',
      // Defensive `no-underline` — Tailwind's preflight removes the
      // default browser anchor underline globally, but environments
      // that DISABLE preflight (e.g. our docs-lab, where the tw
      // section coexists with MUI's chrome) get raw browser defaults
      // back. Without this, `<a>` items in the nav render underlined
      // in those contexts. Explicit `no-underline` + `hover:no-underline`
      // keeps the appearance consistent regardless of preflight state.
      'no-underline hover:no-underline',
    ],
    itemActive: 'bg-primary-100 text-primary-900 font-medium',
    itemIcon: 'shrink-0 w-5 h-5 flex items-center justify-center',
    itemLabel: 'truncate flex-1 min-w-0 text-left',
    itemBadge: [
      'shrink-0 inline-flex items-center justify-center',
      'px-1.5 h-5 rounded-full text-[10px] font-medium',
      'bg-neutral-200 text-neutral-800',
    ],
    group: 'flex flex-col gap-0.5',
    groupHeader: [
      'flex items-center gap-2 px-2 py-2 rounded-md',
      'text-sm font-medium text-neutral-900 hover:bg-neutral-100',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors w-full',
    ],
    groupChildren: 'flex flex-col gap-0.5 pl-6',
    footer: [
      'border-t border-neutral-200 p-3 shrink-0',
      'flex items-center gap-2',
    ],
    collapseToggle: [
      'inline-flex items-center justify-center w-8 h-8 shrink-0',
      'rounded-md text-neutral-600 hover:bg-neutral-100',
      'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors',
    ],
  },
  variants: {
    width: {
      sm: { root: 'w-48' },
      md: { root: 'w-60' },
      lg: { root: 'w-72' },
    },
    collapsed: {
      true: {
        root: 'w-14',
        brand: 'justify-center px-0',
        list: 'p-1 items-center',
        itemLink: 'justify-center px-0 py-2.5',
        itemLabel: 'sr-only',
        itemBadge: 'hidden',
        groupHeader: 'justify-center px-0',
        groupChildren: 'hidden',
        footer: 'justify-center px-0',
      },
    },
  },
  defaultVariants: {
    width: 'md',
    collapsed: false,
  },
});

export type LeftNavVariants = VariantProps<typeof leftNavVariants>;
