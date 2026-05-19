import { useMemo, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { Pagination } from '../Pagination/Pagination.js';
import { dataGridVariants } from './dataGrid.variants.js';
import { useControllableState } from '../_shared/data/useControllableState.js';
import { useDebouncedValue } from '../_shared/data/useDebouncedValue.js';
import { useTableSearch } from '../_shared/data/useTableSearch.js';
import { useTableFilter } from '../_shared/data/useTableFilter.js';
import { useTableSort, cycleSortFor } from '../_shared/data/useTableSort.js';
import { useTableSelection } from '../_shared/data/useTableSelection.js';
import { getNestedValue } from '../_shared/data/getNestedValue.js';
import { useVirtualizer } from '../_shared/data/useVirtualizer.js';
import {
  useColumnAutoDetect,
  resolveAlign,
  resolveMonospace,
  resolveTabularNums,
} from '../_shared/data/useColumnAutoDetect.js';
import type {
  TableColumn,
  TableSortModel,
  TableFilterModel,
  TableLabels,
} from '../Table/table.types.js';
import type { DataGridProps } from './dataGrid.types.js';

const DEFAULT_LABELS: Required<TableLabels> = {
  searchPlaceholder: 'Search...',
  noData: 'No data',
  loading: 'Loading…',
  ariaSortNone: 'Not sorted. Click to sort ascending.',
  ariaSortAscending: 'Sorted ascending. Click to sort descending.',
  ariaSortDescending: 'Sorted descending. Click to clear sort.',
  ariaSelectRow: 'Select row',
  ariaSelectAllRows: 'Select all rows',
  ariaExpandRow: 'Expand row',
  ariaCollapseRow: 'Collapse row',
  selectedCount: '{count} selected',
  clearSelection: 'Clear selection',
  filterColumn: 'Filter',
  filterApply: 'Apply',
  filterClear: 'Clear',
  density: 'Density',
  densityCompact: 'Compact',
  densityComfortable: 'Comfortable',
  densitySpacious: 'Spacious',
};

/**
 * Dashforge TW `<DataGrid>` — virtualized data table.
 *
 * Companion to `<Table>` for large data sets (~500+ rows up to
 * millions via virtualization). Same column model, sort/search/
 * filter/selection logic (shared via `_shared/data/` helpers) —
 * differs in render path: only the visible window of rows is mounted
 * in DOM, with spacer `<tr>` above and below to preserve scrollbar
 * size.
 *
 * Virtualization: hand-rolled (`useVirtualizer`) using
 * `IntersectionObserver` + scroll-event + `requestAnimationFrame`
 * debounce + `ResizeObserver`. Zero new runtime deps.
 *
 * Server-side mode (4 independent opt-in flags):
 *  - `serverSideSort` — emits `onSortChange` but does NOT sort locally
 *  - `serverSideFilter` — emits `onFilterChange` but does NOT filter
 *  - `serverSideSearch` — emits `onSearchQueryChange` (debounced)
 *  - `serverSidePagination` — `totalCount` prop sizes the virtual
 *    scrollbar; `rows` is the page slice from the server
 *
 * Selection at scale: `selectAllScope`:
 *  - `'allLoaded'` (default) — header checkbox toggles all rows in
 *    `rows` prop
 *  - `'visible'` — toggles only the current viewport window
 */
export function DataGrid<T extends object>(props: DataGridProps<T>) {
  const {
    rows,
    cols,
    getRowId,
    totalCount: totalCountProp,

    rowHeight,
    overscan = 5,
    height,

    sortModel: sortModelProp,
    onSortChange,
    defaultSortModel,
    serverSideSort = false,

    enableSearch = false,
    searchQuery: searchQueryProp,
    onSearchQueryChange,
    searchPlaceholder,
    searchDebounceMs = 200,
    serverSideSearch = false,

    filterModel: filterModelProp,
    onFilterChange,
    serverSideFilter = false,

    rowSelection = 'none',
    selectedRowIds: selectedRowIdsProp,
    onSelectionChange,
    bulkActions,
    selectAllScope = 'allLoaded',

    pagination,
    serverSidePagination = false,

    rowActions,

    loading = false,
    loadingRowCount = 8,
    emptyState,

    stickyHeader = true,
    caption,
    showCaption = false,

    access: gridAccess,

    labels: labelsProp,

    variant,
    size,
    density,

    sx,
    slotProps,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const gridAccessState = useAccessState(gridAccess);

  // ───── Controllable state ─────

  const [sortModel, setSortModel] = useControllableState<TableSortModel>({
    controlledValue: sortModelProp,
    defaultValue: defaultSortModel ?? [],
    onChange: onSortChange,
  });
  const [searchQuery, setSearchQuery] = useControllableState<string>({
    controlledValue: searchQueryProp,
    defaultValue: '',
    onChange: onSearchQueryChange,
  });
  // filterModel: read-only in v1 (no in-table filter UI; deferred to
  // v1-bis). Consumer wires it via filterModelProp + onFilterChange.
  void onFilterChange;
  const filterModel: TableFilterModel = filterModelProp ?? [];
  const [selectedRowIds, setSelectedRowIds] = useControllableState<string[]>({
    controlledValue: selectedRowIdsProp,
    defaultValue: [],
    onChange: onSelectionChange,
  });

  // ───── RBAC: filter columns ─────
  const visibleCols = useMemo(
    () =>
      cols.filter(
        (col) => !col.access || col.access.onUnauthorized !== 'hide',
      ),
    [cols],
  );

  // ───── Smart-default column types ─────
  const columnTypes = useColumnAutoDetect(rows, visibleCols);

  // ───── Pipeline: search → filter → sort (skip when server-side) ─────
  //
  // Each pipeline hook is ALWAYS called (React hooks rules). The
  // server-side flags decide whether to use the local-computed result
  // or pass the upstream rows through unchanged. The hooks are
  // `useMemo`-based internally so they're cheap when their inputs
  // are unchanged.

  const debouncedSearchQuery = useDebouncedValue(searchQuery, searchDebounceMs);
  const localSearched = useTableSearch(rows, visibleCols, debouncedSearchQuery);
  const searchedRows = serverSideSearch ? rows : localSearched;

  const localFiltered = useTableFilter(searchedRows, filterModel);
  const filteredRows = serverSideFilter ? searchedRows : localFiltered;

  const localSorted = useTableSort(filteredRows, visibleCols, sortModel);
  const sortedRows = serverSideSort ? filteredRows : localSorted;

  // ───── Virtualization ─────

  // Effective row count for the virtual scrollbar:
  // - Client-side: actual sorted rows count
  // - Server-side pagination: caller-provided totalCount
  const effectiveTotalCount = serverSidePagination
    ? totalCountProp ?? sortedRows.length
    : sortedRows.length;

  const initialViewportHeight = height ? parseInt(height, 10) || 400 : 400;
  const { scrollRef, window: vWindow } = useVirtualizer({
    totalCount: effectiveTotalCount,
    rowHeight,
    overscan,
    initialViewportHeight,
  });

  // The rows actually mounted in DOM.
  const renderedRows = useMemo(() => {
    if (serverSidePagination) {
      // In server-side pagination, `rows` IS the page slice; we
      // render all of it (virtualization within the page is still
      // useful for very large page sizes).
      return rows.slice(vWindow.startIndex, vWindow.endIndex + 1);
    }
    return sortedRows.slice(vWindow.startIndex, vWindow.endIndex + 1);
  }, [serverSidePagination, rows, sortedRows, vWindow.startIndex, vWindow.endIndex]);

  // ───── Selection helpers ─────

  // For `selectAllScope='visible'`, the select-all scope is the
  // current window. For `'allLoaded'`, it's the whole sorted set.
  const selectAllPool = useMemo(() => {
    if (selectAllScope === 'visible') {
      return renderedRows.map((row, idx) =>
        getRowId(row, vWindow.startIndex + idx),
      );
    }
    return sortedRows.map((row, idx) => getRowId(row, idx));
  }, [selectAllScope, renderedRows, sortedRows, getRowId, vWindow.startIndex]);

  const selection = useTableSelection(rowSelection, selectedRowIds, setSelectedRowIds);

  const selectedRows = useMemo(
    () => sortedRows.filter((row, idx) => selection.isSelected(getRowId(row, idx))),
    [sortedRows, selection, getRowId],
  );

  // ───── Variant recipe ─────
  const v = dataGridVariants({ variant, size, density });

  // ───── Render ─────

  if (!gridAccessState.visible) return null;

  const isInteractive = !gridAccessState.disabled;
  const showSelectionColumn = rowSelection !== 'none';
  const showRowActionsColumn = rowActions != null;

  const totalColumnCount =
    visibleCols.length +
    (showSelectionColumn ? 1 : 0) +
    (showRowActionsColumn ? 1 : 0);

  return (
    <div
      className={cn(v.root(), sx, slotProps?.root?.className)}
      data-disabled={!isInteractive ? 'true' : undefined}
    >
      {/* ───── Toolbar ───── */}
      {enableSearch && (
        <div className={cn(v.toolbar(), slotProps?.toolbar?.className)}>
          <label className={cn(v.search(), slotProps?.search?.className)}>
            <span className="sr-only">{labels.searchPlaceholder}</span>
            <SearchIcon className="ml-2 shrink-0 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder ?? labels.searchPlaceholder}
              disabled={!isInteractive}
              className={cn(
                'flex-1 bg-transparent border-0 outline-none',
                'px-2 py-1.5',
                'placeholder:text-neutral-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            />
          </label>
        </div>
      )}

      {/* ───── Scroll wrapper (bounded height — required for virt) ───── */}
      <div
        ref={scrollRef}
        className={cn(v.scroll(), slotProps?.scroll?.className)}
        style={height ? { height, maxHeight: height } : undefined}
      >
        <table className={cn(v.table(), slotProps?.table?.className)}>
          {caption != null && (
            <caption className={cn(!showCaption && 'sr-only', 'py-2 text-sm text-neutral-500')}>
              {caption}
            </caption>
          )}

          <thead
            className={cn(
              stickyHeader ? v.thead() : 'bg-neutral-50',
              slotProps?.thead?.className,
            )}
          >
            <tr className={cn(v.headerRow(), slotProps?.headerRow?.className)}>
              {showSelectionColumn && (
                <th
                  scope="col"
                  className={cn(
                    v.headerCell(),
                    v.selectionCell(),
                    v.stickyLeftHeaderCell(),
                    slotProps?.headerCell?.className,
                    slotProps?.selectionCell?.className,
                  )}
                >
                  {rowSelection === 'multiple' && (
                    <input
                      type="checkbox"
                      aria-label={labels.ariaSelectAllRows}
                      checked={selection.isAllSelected(selectAllPool)}
                      ref={(el) => {
                        if (el)
                          el.indeterminate = selection.isIndeterminate(selectAllPool);
                      }}
                      onChange={() => selection.toggleAll(selectAllPool)}
                      disabled={!isInteractive}
                      className="cursor-pointer"
                    />
                  )}
                </th>
              )}

              {visibleCols.map((col) => (
                <HeaderCell
                  key={col.field as string}
                  col={col}
                  sortModel={sortModel}
                  onSortClick={(e) =>
                    handleSortClick(col, e, sortModel, setSortModel)
                  }
                  inferredType={columnTypes.get(col.field as string)}
                  labels={labels}
                  className={cn(
                    v.headerCell(),
                    col.sticky === 'left' && v.stickyLeftHeaderCell(),
                    slotProps?.headerCell?.className,
                  )}
                  buttonClassName={v.headerCellButton()}
                  disabled={!isInteractive}
                />
              ))}

              {showRowActionsColumn && (
                <th
                  scope="col"
                  aria-hidden="true"
                  className={cn(
                    v.headerCell(),
                    'w-12',
                    slotProps?.headerCell?.className,
                  )}
                />
              )}
            </tr>
          </thead>

          <tbody className={cn(v.tbody(), slotProps?.tbody?.className)}>
            {loading
              ? renderLoadingRows({
                  count: loadingRowCount,
                  visibleCols,
                  showSelectionColumn,
                  showRowActionsColumn,
                  rowHeight,
                  rowClass: cn(v.row(), slotProps?.row?.className),
                  cellClass: cn(v.cell(), slotProps?.cell?.className),
                })
              : sortedRows.length === 0
                ? renderEmptyState({
                    totalColumnCount,
                    emptyState,
                    fallback: labels.noData,
                    cellClass: cn(
                      v.cell(),
                      v.emptyState(),
                      slotProps?.emptyState?.className,
                    ),
                  })
                : renderVirtualizedBody({
                    vWindow,
                    rowHeight,
                    renderedRows,
                    visibleCols,
                    columnTypes,
                    selection,
                    rowSelection,
                    showSelectionColumn,
                    showRowActionsColumn,
                    rowActions,
                    getRowId,
                    isInteractive,
                    labels,
                    serverSidePagination,
                    classes: {
                      row: cn(v.row(), slotProps?.row?.className),
                      cell: cn(v.cell(), slotProps?.cell?.className),
                      selectionCell: cn(
                        v.cell(),
                        v.selectionCell(),
                        v.stickyLeftCell(),
                        slotProps?.cell?.className,
                        slotProps?.selectionCell?.className,
                      ),
                      stickyLeftCell: v.stickyLeftCell(),
                      rowActionsCell: cn(
                        v.cell(),
                        v.rowActionsCell(),
                        slotProps?.cell?.className,
                        slotProps?.rowActionsCell?.className,
                      ),
                    },
                  })}
          </tbody>
        </table>
      </div>

      {/* ───── Bulk action footer ───── */}
      {bulkActions && selectedRows.length > 0 && (
        <div
          className={cn(v.bulkActionFooter(), slotProps?.bulkActionFooter?.className)}
          role="region"
          aria-label={labels.selectedCount.replace(
            '{count}',
            String(selectedRows.length),
          )}
        >
          <span className="text-sm text-neutral-700">
            {labels.selectedCount.replace('{count}', String(selectedRows.length))}
          </span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedRows)}
            <button
              type="button"
              onClick={selection.clearSelection}
              className={cn(
                'text-sm text-neutral-500 hover:text-neutral-900',
                'underline-offset-2 hover:underline',
                'focus:outline-none focus-visible:underline',
              )}
            >
              {labels.clearSelection}
            </button>
          </div>
        </div>
      )}

      {/* ───── Optional pagination footer ───── */}
      {pagination && (
        <div className={cn(v.paginationFooter(), slotProps?.pagination?.className)}>
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={totalCountProp ?? sortedRows.length}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        </div>
      )}
    </div>
  );
}

// ───── Header cell ─────

function HeaderCell<T extends object>(props: {
  col: TableColumn<T>;
  sortModel: TableSortModel;
  onSortClick: (e: MouseEvent<HTMLButtonElement>) => void;
  inferredType: string | undefined;
  labels: Required<TableLabels>;
  className: string;
  buttonClassName: string;
  disabled: boolean;
}) {
  const {
    col,
    sortModel,
    onSortClick,
    inferredType,
    labels,
    className,
    buttonClassName,
    disabled,
  } = props;

  const align = resolveAlign(col, inferredType as never);
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  const sortEntry = sortModel.find((s) => s.field === col.field);
  const ariaSort: 'ascending' | 'descending' | 'none' =
    sortEntry?.direction === 'asc'
      ? 'ascending'
      : sortEntry?.direction === 'desc'
        ? 'descending'
        : 'none';

  const headerContent =
    typeof col.header === 'function' ? col.header() : col.header;

  const cellStyle = {
    width: col.width != null ? `${col.width}px` : undefined,
    minWidth: col.minWidth != null ? `${col.minWidth}px` : undefined,
    flex: col.flex,
  };

  if (col.sortable) {
    return (
      <th
        scope="col"
        aria-sort={ariaSort}
        className={cn(className, alignClass)}
        style={cellStyle}
      >
        <button
          type="button"
          onClick={onSortClick}
          disabled={disabled}
          aria-label={
            ariaSort === 'ascending'
              ? labels.ariaSortAscending
              : ariaSort === 'descending'
                ? labels.ariaSortDescending
                : labels.ariaSortNone
          }
          className={cn(
            buttonClassName,
            align === 'right' && 'flex-row-reverse',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span>{headerContent}</span>
          <SortIcon direction={sortEntry?.direction} />
        </button>
      </th>
    );
  }

  return (
    <th scope="col" className={cn(className, alignClass)} style={cellStyle}>
      {headerContent}
    </th>
  );
}

// ───── Virtualized body ─────

function renderVirtualizedBody<T extends object>(args: {
  vWindow: { startIndex: number; endIndex: number; paddingTop: number; paddingBottom: number };
  rowHeight: number;
  renderedRows: T[];
  visibleCols: TableColumn<T>[];
  columnTypes: Map<string, string>;
  selection: ReturnType<typeof useTableSelection>;
  rowSelection: 'none' | 'single' | 'multiple';
  showSelectionColumn: boolean;
  showRowActionsColumn: boolean;
  rowActions: ((row: T) => ReactNode) | undefined;
  getRowId: (row: T, index: number) => string;
  isInteractive: boolean;
  labels: Required<TableLabels>;
  serverSidePagination: boolean;
  classes: {
    row: string;
    cell: string;
    selectionCell: string;
    stickyLeftCell: string;
    rowActionsCell: string;
  };
}): ReactNode {
  const {
    vWindow,
    renderedRows,
    visibleCols,
    columnTypes,
    selection,
    rowSelection,
    showSelectionColumn,
    showRowActionsColumn,
    rowActions,
    getRowId,
    isInteractive,
    labels,
    classes,
  } = args;

  return (
    <>
      {vWindow.paddingTop > 0 && (
        <tr aria-hidden="true" style={{ height: vWindow.paddingTop }} />
      )}
      {renderedRows.map((row, localIdx) => {
        const absoluteIdx = vWindow.startIndex + localIdx;
        const rowId = getRowId(row, absoluteIdx);
        const isSelected = selection.isSelected(rowId);
        return (
          <tr
            key={rowId}
            data-selected={isSelected ? 'true' : 'false'}
            aria-selected={rowSelection !== 'none' ? isSelected : undefined}
            className={classes.row}
          >
            {showSelectionColumn && (
              <td className={classes.selectionCell}>
                <input
                  type="checkbox"
                  aria-label={labels.ariaSelectRow}
                  checked={isSelected}
                  onChange={() => selection.toggleRow(rowId)}
                  disabled={!isInteractive}
                  className="cursor-pointer"
                />
              </td>
            )}
            {visibleCols.map((col) => (
              <DataCell
                key={col.field as string}
                col={col}
                row={row}
                rowIndex={absoluteIdx}
                isSelected={isSelected}
                inferredType={columnTypes.get(col.field as string)}
                cellClass={classes.cell}
                stickyLeftClass={classes.stickyLeftCell}
              />
            ))}
            {showRowActionsColumn && rowActions && (
              <td className={classes.rowActionsCell}>{rowActions(row)}</td>
            )}
          </tr>
        );
      })}
      {vWindow.paddingBottom > 0 && (
        <tr aria-hidden="true" style={{ height: vWindow.paddingBottom }} />
      )}
    </>
  );
}

// ───── Data cell ─────

function DataCell<T extends object>(props: {
  col: TableColumn<T>;
  row: T;
  rowIndex: number;
  isSelected: boolean;
  inferredType: string | undefined;
  cellClass: string;
  stickyLeftClass: string;
}) {
  const { col, row, rowIndex, isSelected, inferredType, cellClass, stickyLeftClass } = props;
  const value = getNestedValue(row, col.field as string);
  const align = resolveAlign(col, inferredType as never);
  const tabularNums = resolveTabularNums(col, inferredType as never);
  const monospace = resolveMonospace(col);
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  const columnAccessState = col.access
    ? {
        hidden: col.access.onUnauthorized === 'hide',
        disabled: col.access.onUnauthorized === 'disable',
        readonly: col.access.onUnauthorized === 'readonly',
      }
    : null;

  const content = col.cellRenderer
    ? col.cellRenderer({
        row,
        value,
        rowIndex,
        isSelected,
        isExpanded: false, // DataGrid v1 doesn't support expansion (defer)
        access: columnAccessState,
      })
    : renderDefaultCell(value);

  return (
    <td
      className={cn(
        cellClass,
        alignClass,
        tabularNums && 'tabular-nums',
        monospace && 'font-mono',
        col.sticky === 'left' && stickyLeftClass,
      )}
      style={{
        width: col.width != null ? `${col.width}px` : undefined,
        minWidth: col.minWidth != null ? `${col.minWidth}px` : undefined,
      }}
    >
      {content}
    </td>
  );
}

// ───── Helpers ─────

function renderDefaultCell(value: unknown): ReactNode {
  if (value == null) return null;
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') return JSON.stringify(value);
  return value as ReactNode;
}

function handleSortClick<T extends object>(
  col: TableColumn<T>,
  event: MouseEvent<HTMLButtonElement>,
  current: TableSortModel,
  setSortModel: (
    next: TableSortModel | ((prev: TableSortModel) => TableSortModel),
  ) => void,
) {
  if (!col.sortable) return;
  const multi = event.shiftKey;
  setSortModel((prev) => cycleSortFor(prev, col.field as string, multi));
}

function renderLoadingRows<T extends object>(args: {
  count: number;
  visibleCols: TableColumn<T>[];
  showSelectionColumn: boolean;
  showRowActionsColumn: boolean;
  rowHeight: number;
  rowClass: string;
  cellClass: string;
}): ReactNode {
  const {
    count,
    visibleCols,
    showSelectionColumn,
    showRowActionsColumn,
    rowHeight,
    rowClass,
    cellClass,
  } = args;
  return Array.from({ length: count }).map((_, i) => (
    <tr
      key={`loading-${i}`}
      className={rowClass}
      aria-busy="true"
      style={{ height: rowHeight }}
    >
      {showSelectionColumn && (
        <td className={cellClass}>
          <Skeleton variant="rectangle" width="16px" height="16px" />
        </td>
      )}
      {visibleCols.map((col) => (
        <td key={col.field as string} className={cellClass}>
          <Skeleton variant="text" width="80%" />
        </td>
      ))}
      {showRowActionsColumn && (
        <td className={cellClass}>
          <Skeleton variant="rectangle" width="24px" height="24px" />
        </td>
      )}
    </tr>
  ));
}

function renderEmptyState(args: {
  totalColumnCount: number;
  emptyState: ReactNode;
  fallback: string;
  cellClass: string;
}): ReactNode {
  return (
    <tr>
      <td colSpan={args.totalColumnCount} className={args.cellClass}>
        {args.emptyState ?? args.fallback}
      </td>
    </tr>
  );
}

// ───── Icons ─────

function SortIcon(props: { direction?: 'asc' | 'desc' }) {
  return (
    <svg
      width="0.75em"
      height="0.75em"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 opacity-60 group-hover:opacity-100"
    >
      {props.direction === 'asc' ? (
        <path d="M8 4l4 6H4z" />
      ) : props.direction === 'desc' ? (
        <path d="M8 12L4 6h8z" />
      ) : (
        <>
          <path d="M8 3l3 4H5z" opacity="0.5" />
          <path d="M8 13l-3-4h6z" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function SearchIcon(props: { className?: string }) {
  return (
    <svg
      width="0.875em"
      height="0.875em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M11 11l3 3" />
    </svg>
  );
}
