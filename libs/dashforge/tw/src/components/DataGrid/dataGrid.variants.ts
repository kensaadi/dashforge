import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<DataGrid>` variant recipe.
 *
 * Sibling of `tableVariants` — shares the same visual axes (variant /
 * size / density) and the same identity-rule patterns:
 *  - No `dark:` variants on neutral palette (auto-invert via the
 *    dashforgePreset() CSS var swap).
 *  - Selected row uses LeftNav `itemActive` pattern
 *    (`bg-primary-100 text-primary-900`) — guaranteed contrast.
 *  - Hover uses one-tier elevation (`bg-neutral-100`).
 *
 * DataGrid-specific slot additions vs Table:
 *  - `stickyLeftCell` — column that uses `cols[i].sticky === 'left'`.
 *    Z-index ordering: `thead` (z-10) < `stickyLeftCell` (z-11) <
 *    `header × stickyLeft top-left corner cell` (z-20).
 *  - `paginationFooter` — wraps the optional `<Pagination>`.
 */
export const dataGridVariants = tv({
  slots: {
    root: 'w-full',
    toolbar: 'flex flex-wrap items-center gap-3 mb-3',
    search: [
      'inline-flex items-center gap-2',
      'w-full max-w-sm rounded-md',
      'border border-neutral-300',
      'bg-neutral-50',
      'focus-within:ring-2 focus-within:ring-primary-500',
      'transition-colors motion-reduce:transition-none',
    ],
    // The scroll container needs an explicit bounded height for
    // virtualization to compute the window. The consumer passes
    // `height` prop (inline style) or sets it via `sx` / parent
    // layout — DataGrid does NOT default a height (would be wrong
    // for most layouts).
    scroll: 'relative w-full overflow-auto rounded-md',
    table: 'w-full caption-bottom text-left',
    thead: 'bg-neutral-50 sticky top-0 z-10',
    tbody: '',
    headerRow: '',
    headerCell: [
      'text-neutral-700',
      'font-semibold whitespace-nowrap select-none',
      'border-b border-neutral-200',
      'bg-neutral-50',
    ],
    headerCellButton: [
      'group inline-flex items-center gap-1 select-none',
      'hover:text-neutral-900',
      'focus:outline-none focus-visible:underline',
      'transition-colors motion-reduce:transition-none',
    ],
    row: [
      'group/row transition-colors motion-reduce:transition-none',
      'hover:bg-neutral-100',
      'data-[selected=true]:bg-primary-100',
      'data-[selected=true]:text-primary-900',
      'data-[selected=true]:font-medium',
    ],
    cell: [
      'text-neutral-900',
      'border-b border-neutral-200',
      'align-middle',
    ],
    selectionCell: 'w-10 text-center',
    rowActionsCell: [
      'w-12 text-right',
      'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100',
      'transition-opacity motion-reduce:transition-none',
    ],
    emptyState: 'py-12 text-center text-neutral-500',
    loadingOverlay: 'pointer-events-none',
    bulkActionFooter: [
      'sticky bottom-0 z-20',
      'flex flex-wrap items-center justify-between gap-3',
      'px-3 py-2',
      'border-t border-neutral-200',
      'bg-neutral-50 shadow-md',
    ],
    // Sticky left column — uses `position: sticky; left: 0` + z-index
    // so the column stays pinned during horizontal scroll. The
    // `bg-neutral-50` ensures the column doesn't bleed when content
    // scrolls underneath.
    stickyLeftCell: 'sticky left-0 z-[1] bg-neutral-50',
    // Sticky left × header intersection (top-left corner): higher
    // z-index than both header (`z-10`) and sticky col (`z-[1]`).
    stickyLeftHeaderCell: 'sticky left-0 z-20 bg-neutral-50',
    paginationFooter: 'flex justify-end mt-3',
  },
  variants: {
    variant: {
      plain: {},
      lines: {},
      striped: {
        row: 'odd:bg-neutral-100/60',
      },
      bordered: {
        table: 'border border-neutral-200',
        cell: 'border-r last:border-r-0 border-neutral-200',
        headerCell:
          'border-r last:border-r-0 border-neutral-200',
      },
    },
    size: {
      sm: {
        headerCell: 'text-xs',
        cell: 'text-xs',
        search: 'text-xs',
      },
      md: {
        headerCell: 'text-sm',
        cell: 'text-sm',
        search: 'text-sm',
      },
      lg: {
        headerCell: 'text-base',
        cell: 'text-base',
        search: 'text-base',
      },
    },
    density: {
      compact: {
        headerCell: 'px-2 py-1',
        cell: 'px-2 py-1',
      },
      comfortable: {
        headerCell: 'px-3 py-2',
        cell: 'px-3 py-2',
      },
      spacious: {
        headerCell: 'px-4 py-3',
        cell: 'px-4 py-3',
      },
    },
  },
  defaultVariants: {
    variant: 'lines',
    size: 'md',
    density: 'comfortable',
  },
});

export type DataGridVariants = VariantProps<typeof dataGridVariants>;
