import {
  useMemo,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
  type PointerEvent as RPointerEvent,
} from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
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
  TableColumnInferredType,
  TableFilterType,
  TableSortModel,
  TableFilterModel,
  TableLabels,
} from '../Table/table.types.js';
import type { DataGridProps } from './dataGrid.types.js';
import { ColumnFilterTrigger } from './filters/ColumnFilters.js';
import { ColumnVisibilityTrigger } from './visibility/ColumnVisibilityMenu.js';
import { useColumnResize } from './resize/useColumnResize.js';
import {
  useColumnReorder,
  type ColumnReorderHandlers,
} from './reorder/useColumnReorder.js';

const DEFAULT_LABELS: Required<TableLabels> = {
  searchPlaceholder: 'Search...',
  noData: 'No data',
  noResults: 'No matching results',
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
  filterMin: 'Min',
  filterMax: 'Max',
  filterFrom: 'From',
  filterTo: 'To',
  filterAll: 'All',
  filterTrue: 'True',
  filterFalse: 'False',
  density: 'Density',
  densityCompact: 'Compact',
  densityComfortable: 'Comfortable',
  densitySpacious: 'Spacious',
  columnsButton: 'Columns',
  columnsTitle: 'Toggle columns',
  columnsToggleAll: 'Toggle all columns',
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
export function DataGrid<T extends object>(_props: DataGridProps<T>) {
  const themeDefaults = useComponentDefaults('DataGrid');
  const props: DataGridProps<T> = { ...themeDefaults?.defaults, ..._props };
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

    hiddenColumns: hiddenColumnsProp,
    onHiddenColumnsChange,
    enableColumnVisibility = true,

    columnWidths: columnWidthsProp,
    onColumnWidthsChange,
    enableColumnResize = true,

    columnOrder: columnOrderProp,
    onColumnOrderChange,
    enableColumnReorder = true,

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
  // filterModel: in v1-bis the per-column header UI commits filter
  // items to this controllable state. Consumer can lift it via
  // filterModelProp + onFilterChange to drive server-side filtering.
  const [filterModel, setFilterModel] = useControllableState<TableFilterModel>({
    controlledValue: filterModelProp,
    defaultValue: [],
    onChange: onFilterChange,
  });
  const [selectedRowIds, setSelectedRowIds] = useControllableState<string[]>({
    controlledValue: selectedRowIdsProp,
    defaultValue: [],
    onChange: onSelectionChange,
  });

  // ───── Column visibility ─────
  // Seed default hidden set from `defaultHidden` flag on columns.
  // Memoized to avoid the seed shifting on every render — the
  // controllable state keeps internal state stable thereafter.
  const defaultHiddenColumns = useMemo(
    () =>
      cols
        .filter((c) => c.defaultHidden === true)
        .map((c) => c.field as string),
    [cols],
  );
  const [hiddenColumns, setHiddenColumns] = useControllableState<string[]>({
    controlledValue: hiddenColumnsProp,
    defaultValue: defaultHiddenColumns,
    onChange: onHiddenColumnsChange,
  });

  // ───── Column widths (resize state) ─────
  // Seed from any `col.width` declared statically. Internal state is
  // applied only when the user actually starts dragging; until then
  // we fall back to the static width from the column def.
  const defaultColumnWidths = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cols) {
      if (typeof c.width === 'number') {
        map[c.field as string] = c.width;
      }
    }
    return map;
  }, [cols]);
  const [columnWidths, setColumnWidths] = useControllableState<
    Record<string, number>
  >({
    controlledValue: columnWidthsProp,
    defaultValue: defaultColumnWidths,
    onChange: onColumnWidthsChange,
  });
  const { startResize, nudge: nudgeColumnWidth } = useColumnResize({
    widths: columnWidths,
    onChange: setColumnWidths,
  });

  // ───── Column order (reorder state) ─────
  const defaultColumnOrder = useMemo(
    () => cols.map((c) => c.field as string),
    [cols],
  );
  const [columnOrder, setColumnOrder] = useControllableState<string[]>({
    controlledValue: columnOrderProp,
    defaultValue: defaultColumnOrder,
    onChange: onColumnOrderChange,
  });
  const reorderHandlers = useColumnReorder({
    order: columnOrder,
    onChange: setColumnOrder,
  });

  // Column reorder rides on native HTML5 drag-and-drop, whose
  // `dragstart` / `drop` events DO NOT fire for touch input. On a
  // coarse-pointer device the drag would be a dead affordance — so
  // we detect the primary pointer and gate reorder off there. Mouse
  // / trackpad / pen (fine pointer) keep the feature. A pointer-event
  // based reorder that also covers touch is tracked as a follow-up
  // in REFINEMENT-NOTES.md.
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setCoarsePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarsePointer(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Apply the active order to the columns list. Cols not in the
  // order array (e.g. newly-added columns at runtime) are appended
  // in their original position from `cols`.
  const orderedCols = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) return cols;
    const byField = new Map(
      cols.map((c) => [c.field as string, c] as const),
    );
    const seen = new Set<string>();
    const result: typeof cols = [];
    for (const field of columnOrder) {
      const c = byField.get(field);
      if (c) {
        result.push(c);
        seen.add(field);
      }
    }
    for (const c of cols) {
      if (!seen.has(c.field as string)) result.push(c);
    }
    return result;
  }, [cols, columnOrder]);

  // ───── RBAC + visibility + reorder: derive final column list ─────
  //  - `access.onUnauthorized === 'hide'` removes a column entirely.
  //  - `hiddenColumns` is the user-toggled hidden set from the
  //    column-visibility dialog.
  //  - `orderedCols` is the user-reordered version of `cols`.
  // NOTE: filtering happens on `orderedCols` so the active order is
  // preserved through visibility changes.
  const visibleCols = useMemo(
    () =>
      orderedCols.filter((col) => {
        if (col.access && col.access.onUnauthorized === 'hide') return false;
        if (hiddenColumns.includes(col.field as string)) return false;
        return true;
      }),
    [orderedCols, hiddenColumns],
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
      {(enableSearch || enableColumnVisibility) && (
        <div className={cn(v.toolbar(), slotProps?.toolbar?.className)}>
          {enableSearch && (
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
          )}
          {enableColumnVisibility && (
            <ColumnVisibilityTrigger
              cols={cols.filter(
                (c) =>
                  // RBAC-hidden columns are never offered in the menu.
                  !c.access || c.access.onUnauthorized !== 'hide',
              )}
              hiddenColumns={hiddenColumns}
              onChange={setHiddenColumns}
              disabled={!isInteractive}
              labels={{
                columnsButton: labels.columnsButton,
                columnsTitle: labels.columnsTitle,
                columnsToggleAll: labels.columnsToggleAll,
              }}
            />
          )}
        </div>
      )}

      {/* ───── Scroll wrapper (bounded height — required for virt) ───── */}
      <div
        ref={scrollRef}
        className={cn(v.scroll(), slotProps?.scroll?.className)}
        style={height ? { height, maxHeight: height } : undefined}
      >
        {/*
          `aria-rowcount` announces the TRUE total to assistive tech —
          the virtualized DOM only holds the ~visible window, so without
          it a screen reader reports "row N of <window size>" instead of
          "row N of <dataset size>". `+ 1` accounts for the header row.
          Each `<tr>` carries a 1-based `aria-rowindex` (header = 1,
          data rows = absoluteIndex + 2). `-1` when the effective count
          is unknown/zero keeps it a valid (ignored) value.
        */}
        <table
          className={cn(v.table(), slotProps?.table?.className)}
          aria-rowcount={effectiveTotalCount > 0 ? effectiveTotalCount + 1 : -1}
        >
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
            <tr
              aria-rowindex={1}
              className={cn(v.headerRow(), slotProps?.headerRow?.className)}
            >
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
                  filterModel={filterModel}
                  onFilterChange={setFilterModel}
                  effectiveWidth={resolveColumnWidth(col, columnWidths)}
                  resizable={
                    enableColumnResize && col.resizable !== false
                  }
                  startResize={startResize}
                  nudgeColumnWidth={nudgeColumnWidth}
                  reorderable={
                    enableColumnReorder &&
                    col.reorderable !== false &&
                    !coarsePointer
                  }
                  reorderHandlers={reorderHandlers}
                  labels={labels}
                  className={cn(
                    v.headerCell(),
                    col.sticky === 'left' && v.stickyLeftHeaderCell(),
                    col.sticky === 'right' && v.stickyRightHeaderCell(),
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
                    // Distinguish a genuinely empty dataset from one
                    // emptied by an active search / filter (works for
                    // server-side mode too — a query that returns 0
                    // rows still reads as "no matching results").
                    fallback:
                      rows.length > 0 &&
                      (debouncedSearchQuery.trim().length > 0 ||
                        filterModel.length > 0)
                        ? labels.noResults
                        : labels.noData,
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
                    columnWidths,
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
                      stickyRightCell: v.stickyRightCell(),
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
  filterModel: TableFilterModel;
  onFilterChange: (model: TableFilterModel) => void;
  effectiveWidth: number | undefined;
  resizable: boolean;
  startResize: (
    field: string,
    startWidth: number,
    clampMin: number,
    clampMax: number,
  ) => (e: RPointerEvent<HTMLElement>) => void;
  nudgeColumnWidth: (
    field: string,
    currentWidth: number,
    delta: number,
    clampMin: number,
    clampMax: number,
  ) => void;
  reorderable: boolean;
  reorderHandlers: ColumnReorderHandlers;
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
    filterModel,
    onFilterChange,
    effectiveWidth,
    resizable,
    startResize,
    nudgeColumnWidth,
    reorderable,
    reorderHandlers,
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
    width: effectiveWidth != null ? `${effectiveWidth}px` : undefined,
    minWidth: col.minWidth != null ? `${col.minWidth}px` : undefined,
    flex: effectiveWidth != null ? undefined : col.flex,
    position: resizable || reorderable ? ('relative' as const) : undefined,
  };

  // Drop indicator for reorder: a 2px vertical bar at the LEFT or
  // RIGHT edge of this th when it's the active drop target.
  const dropTarget = reorderHandlers.dropTarget;
  const dropIndicatorClass =
    dropTarget != null && dropTarget.field === (col.field as string)
      ? dropTarget.side === 'left'
        ? 'before:absolute before:top-0 before:bottom-0 before:left-0 before:w-0.5 before:bg-primary-500'
        : 'after:absolute after:top-0 after:bottom-0 after:right-0 after:w-0.5 after:bg-primary-500'
      : '';

  const isDragging = reorderHandlers.draggingField === (col.field as string);

  // Drag attributes only attach when reorderable; we DO NOT make the
  // entire th `draggable` if it isn't — keeps the keyboard focus
  // behavior unchanged.
  const dragAttrs = reorderable
    ? {
        draggable: true,
        onDragStart: reorderHandlers.dragStart(col.field as string),
        onDragOver: reorderHandlers.dragOver(col.field as string),
        onDrop: reorderHandlers.drop(col.field as string),
        onDragEnd: reorderHandlers.dragEnd,
      }
    : {};

  // Resize bounds — shared by the pointer-drag and keyboard paths.
  const resizeMin = col.minWidth ?? 40;
  const resizeMax = col.maxWidth ?? 1200;
  // Keyboard nudge step: 16px, or 64px with Shift held (coarse).
  const measureWidth = (handle: HTMLElement): number =>
    effectiveWidth ??
    (handle.parentElement as HTMLElement | null)?.getBoundingClientRect()
      .width ??
    120;

  const resizeHandle = resizable ? (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${typeof col.header === 'string' ? col.header : col.field}`}
      // Width bounds announced to assistive tech on the separator.
      aria-valuemin={resizeMin}
      aria-valuemax={resizeMax}
      aria-valuenow={effectiveWidth ?? undefined}
      // Keyboard-operable: focusable + ArrowLeft/Right resize. WCAG 2.1
      // keyboard operability — the drag is no longer the only path.
      tabIndex={disabled ? -1 : 0}
      // D6 guard: the parent `<th>` is `draggable` when reorderable;
      // marking the handle non-draggable means grabbing the handle
      // starts a RESIZE, never a column-reorder drag.
      draggable={false}
      onPointerDown={(e) => {
        const startWidth = measureWidth(e.currentTarget);
        startResize(col.field as string, startWidth, resizeMin, resizeMax)(e);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const step = (e.shiftKey ? 64 : 16) * (e.key === 'ArrowLeft' ? -1 : 1);
        const current = measureWidth(e.currentTarget);
        nudgeColumnWidth(
          col.field as string,
          current,
          step,
          resizeMin,
          resizeMax,
        );
      }}
      className={cn(
        'absolute top-0 bottom-0 right-0 w-1.5',
        'cursor-col-resize select-none touch-none',
        'hover:bg-primary-300 active:bg-primary-400',
        'focus:outline-none focus-visible:bg-primary-400',
        'transition-colors motion-reduce:transition-none',
      )}
    />
  ) : null;

  const filterType = col.filterable
    ? resolveFilterType(col, inferredType as TableColumnInferredType | undefined)
    : null;

  const filterTrigger =
    col.filterable && filterType ? (
      <ColumnFilterTrigger
        field={col.field as string}
        filterType={filterType}
        filterModel={filterModel}
        onFilterChange={onFilterChange}
        disabled={disabled}
        labels={{
          filterColumn: labels.filterColumn,
          filterApply: labels.filterApply,
          filterClear: labels.filterClear,
          filterMin: labels.filterMin,
          filterMax: labels.filterMax,
          filterFrom: labels.filterFrom,
          filterTo: labels.filterTo,
          filterAll: labels.filterAll,
          filterTrue: labels.filterTrue,
          filterFalse: labels.filterFalse,
        }}
      />
    ) : null;

  // Layout strategy:
  //  - sortable only → sort button is the cell content
  //  - filterable only → header text + filter trigger in a flex row
  //  - both → sort button + filter trigger in a flex row
  //  - neither → plain header text
  const wrapperJustify =
    align === 'right'
      ? 'justify-end'
      : align === 'center'
        ? 'justify-center'
        : 'justify-start';

  if (col.sortable) {
    const sortButton = (
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
    );
    return (
      <th
        scope="col"
        aria-sort={ariaSort}
        className={cn(
          className,
          alignClass,
          dropIndicatorClass,
          isDragging && 'opacity-50',
        )}
        style={cellStyle}
        {...dragAttrs}
      >
        {filterTrigger ? (
          <div className={cn('flex items-center gap-1', wrapperJustify)}>
            {sortButton}
            {filterTrigger}
          </div>
        ) : (
          sortButton
        )}
        {resizeHandle}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className={cn(
        className,
        alignClass,
        dropIndicatorClass,
        isDragging && 'opacity-50',
      )}
      style={cellStyle}
      {...dragAttrs}
    >
      {filterTrigger ? (
        <div className={cn('flex items-center gap-1', wrapperJustify)}>
          <span>{headerContent}</span>
          {filterTrigger}
        </div>
      ) : (
        headerContent
      )}
      {resizeHandle}
    </th>
  );
}

/**
 * Resolve the effective width (px) for a column. User-driven resize
 * (`columnWidths[field]`) wins over the static `col.width`. Returns
 * `undefined` if neither source has a width set — the consumer falls
 * back to the column's `flex` value or browser auto-layout.
 */
function resolveColumnWidth<T extends object>(
  col: TableColumn<T>,
  columnWidths: Record<string, number>,
): number | undefined {
  const resized = columnWidths[col.field as string];
  if (resized != null) return resized;
  return col.width;
}

/**
 * Resolve the filter UI type for a column. Explicit `col.filterType`
 * wins; otherwise we map the auto-detected primitive type:
 *  - `number` → number range
 *  - `boolean` → true/false/all select
 *  - `date` → date range
 *  - anything else (string / unknown) → text contains
 */
function resolveFilterType<T extends object>(
  col: TableColumn<T>,
  inferred: TableColumnInferredType | undefined,
): TableFilterType {
  if (col.filterType) return col.filterType;
  switch (inferred) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
}

// ───── Virtualized body ─────

function renderVirtualizedBody<T extends object>(args: {
  vWindow: { startIndex: number; endIndex: number; paddingTop: number; paddingBottom: number };
  rowHeight: number;
  renderedRows: T[];
  visibleCols: TableColumn<T>[];
  columnTypes: Map<string, string>;
  columnWidths: Record<string, number>;
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
    stickyRightCell: string;
    rowActionsCell: string;
  };
}): ReactNode {
  const {
    vWindow,
    renderedRows,
    visibleCols,
    columnTypes,
    columnWidths,
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
            // 1-based row index in the FULL dataset (header row is 1,
            // so data rows start at 2). Lets a screen reader announce
            // the true position despite virtualization windowing.
            aria-rowindex={absoluteIdx + 2}
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
                effectiveWidth={resolveColumnWidth(col, columnWidths)}
                cellClass={classes.cell}
                stickyLeftClass={classes.stickyLeftCell}
                stickyRightClass={classes.stickyRightCell}
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
  effectiveWidth: number | undefined;
  cellClass: string;
  stickyLeftClass: string;
  stickyRightClass: string;
}) {
  const {
    col,
    row,
    rowIndex,
    isSelected,
    inferredType,
    effectiveWidth,
    cellClass,
    stickyLeftClass,
    stickyRightClass,
  } = props;
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
        col.sticky === 'right' && stickyRightClass,
      )}
      style={{
        width: effectiveWidth != null ? `${effectiveWidth}px` : undefined,
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
