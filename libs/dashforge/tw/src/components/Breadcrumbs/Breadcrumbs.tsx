import { Fragment, useMemo } from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { breadcrumbsVariants } from './breadcrumbs.variants.js';
import type {
  BreadcrumbItem,
  BreadcrumbsProps,
} from './breadcrumbs.types.js';

/**
 * Dashforge TW Breadcrumbs — router-agnostic navigation trail.
 *
 * Pure presentational. The consumer derives `items` from their routing
 * layer (no automatic location read) — that keeps the component usable
 * with React Router, Next.js App Router, TanStack Router, Wouter, etc.
 *
 * Truncation policy: when `items.length > maxItems > 0`, the middle is
 * collapsed into a non-interactive `…` placeholder. `itemsBeforeCollapse`
 * (default 1) and `itemsAfterCollapse` (default 1) control how many
 * crumbs survive at each end — set both to 0 to keep only first+last,
 * or higher to preserve more context.
 *
 * **A11y**:
 *   - `<nav aria-label="Breadcrumb">` landmark
 *   - `<ol>` semantic list (screen readers announce position-in-list)
 *   - `aria-current="page"` on the last (or `current: true`) crumb
 *   - Separator nodes carry `aria-hidden="true"` (decorative)
 *   - The truncation ellipsis is a `<span aria-label="More breadcrumbs">`
 */
export function Breadcrumbs(props: BreadcrumbsProps) {
  const themeDefaults = useComponentDefaults('Breadcrumbs');
  const merged: BreadcrumbsProps = { ...themeDefaults?.defaults, ...props };
  const themeSlotProps = themeDefaults?.slotProps;
  const {
    items,
    separator = '/',
    maxItems = 0,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    size,
    slotProps,
    sx,
    linkComponent: Link = 'a' as unknown as React.ComponentType<
      React.AnchorHTMLAttributes<HTMLAnchorElement>
    >,
    ariaLabel = 'Breadcrumb',
  } = merged;

  const v = breadcrumbsVariants({ size });

  /**
   * Decide which items survive after truncation. Returns the rendered
   * list interleaved with a sentinel for the collapsed gap (when
   * truncation kicks in).
   *
   * Sentinel marker: `'__ELLIPSIS__'` — chosen instead of `null` so the
   * map/render loop can distinguish a "gap" from a regular crumb
   * without an instance-of dance.
   */
  type RenderEntry =
    | { kind: 'item'; item: BreadcrumbItem; idx: number; isLast: boolean }
    | { kind: 'ellipsis' };

  const entries = useMemo<RenderEntry[]>(() => {
    const lastIdx = items.length - 1;
    const shouldCollapse = maxItems > 0 && items.length > maxItems;

    const toEntry = (item: BreadcrumbItem, idx: number): RenderEntry => ({
      kind: 'item',
      item,
      idx,
      isLast: idx === lastIdx,
    });

    if (!shouldCollapse) {
      return items.map(toEntry);
    }

    const before = Math.max(0, itemsBeforeCollapse);
    const after = Math.max(0, itemsAfterCollapse);
    // Edge case: if before+after >= items.length, no point collapsing.
    if (before + after >= items.length) {
      return items.map(toEntry);
    }
    const head = items.slice(0, before).map(toEntry);
    const tail = items
      .slice(items.length - after)
      .map((item, j) => toEntry(item, items.length - after + j));
    return [...head, { kind: 'ellipsis' as const }, ...tail];
  }, [items, maxItems, itemsBeforeCollapse, itemsAfterCollapse]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(v.root(), sx, themeSlotProps?.root?.className, slotProps?.root?.className)}
    >
      <ol className={cn(v.list(), themeSlotProps?.list?.className, slotProps?.list?.className)}>
        {entries.map((entry, i) => {
          // Trailing-separator policy: every entry EXCEPT the last one
          // is followed by a separator. We render both inside the same
          // <li> for visual cohesion; aria-hidden on the separator keeps
          // the SR announcement clean.
          const isLastEntry = i === entries.length - 1;

          if (entry.kind === 'ellipsis') {
            return (
              <li
                key="__ellipsis__"
                className={cn(v.item(), themeSlotProps?.item?.className, slotProps?.item?.className)}
              >
                <span
                  aria-label="More breadcrumbs"
                  className={cn(
                    v.ellipsis(),
                    themeSlotProps?.ellipsis?.className, slotProps?.ellipsis?.className
                  )}
                >
                  …
                </span>
                {!isLastEntry && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      v.separator(),
                      themeSlotProps?.separator?.className, slotProps?.separator?.className
                    )}
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          }

          const { item, isLast } = entry;
          // A crumb is "current" if explicitly flagged OR it's the last
          // crumb (sensible default — matches the WAI-ARIA pattern).
          const isCurrent = Boolean(item.current) || isLast;
          // Interactive only when there's a way to navigate AND the
          // crumb is not the current page AND not disabled.
          const isInteractive =
            !isCurrent &&
            !item.disabled &&
            (item.href !== undefined || item.onClick !== undefined);

          return (
            <li
              key={item.id}
              className={cn(v.item(), themeSlotProps?.item?.className, slotProps?.item?.className)}
            >
              {isInteractive ? (
                <Link
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(v.link(), themeSlotProps?.link?.className, slotProps?.link?.className)}
                >
                  {item.icon ? (
                    <Fragment>
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Fragment>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-disabled={item.disabled || undefined}
                  className={cn(
                    isCurrent ? v.current() : v.link(),
                    isCurrent
                      ? [themeSlotProps?.current?.className, slotProps?.current?.className]
                      : [themeSlotProps?.link?.className, slotProps?.link?.className]
                  )}
                >
                  {item.icon ? (
                    <Fragment>
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Fragment>
                  ) : (
                    item.label
                  )}
                </span>
              )}

              {!isLastEntry && (
                <span
                  aria-hidden="true"
                  className={cn(
                    v.separator(),
                    themeSlotProps?.separator?.className, slotProps?.separator?.className
                  )}
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
