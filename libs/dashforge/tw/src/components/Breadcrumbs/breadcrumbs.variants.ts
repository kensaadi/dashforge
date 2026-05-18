import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Breadcrumbs>`.
 *
 * Slots:
 *   - `root`       — `<nav>` landmark
 *   - `list`       — flex `<ol>`
 *   - `item`       — `<li>` wrapper
 *   - `link`       — non-current crumb (clickable / focusable)
 *   - `current`    — last crumb (no link, aria-current="page")
 *   - `separator`  — between-crumbs marker
 *   - `ellipsis`   — collapsed-middle placeholder (`…`)
 */
export const breadcrumbsVariants = tv({
  slots: {
    root: 'text-sm text-neutral-600',
    list: 'flex items-center flex-wrap gap-1',
    item: 'inline-flex items-center gap-1 min-w-0',
    link: [
      'inline-flex items-center gap-1 truncate',
      'text-neutral-600 hover:text-primary-700',
      'rounded-sm outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary-500/50',
      'transition-colors',
      // Defensive `no-underline` — see the matching comment in
      // LeftNav itemLink slot. The Breadcrumbs root cause covers
      // TopBar too because Breadcrumbs is typically rendered in
      // TopBar's center slot.
      'no-underline hover:no-underline',
    ],
    current: [
      'inline-flex items-center gap-1 truncate',
      'text-neutral-900 font-medium',
    ],
    separator: 'text-neutral-400 select-none mx-0.5',
    ellipsis: [
      'inline-flex items-center justify-center px-1',
      'text-neutral-500 cursor-default select-none',
    ],
  },
  variants: {
    size: {
      sm: { root: 'text-xs', list: 'gap-0.5', separator: 'mx-0' },
      md: { root: 'text-sm' },
      lg: { root: 'text-base', list: 'gap-1.5' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type BreadcrumbsVariants = VariantProps<typeof breadcrumbsVariants>;
