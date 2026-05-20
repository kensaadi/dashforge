import { useMemo, useEffect, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { tableVariants } from './table.variants.js';
import { useControllableState } from '../_shared/data/useControllableState.js';
import { useDebouncedValue } from '../_shared/data/useDebouncedValue.js';
import { useTableSearch } from '../_shared/data/useTableSearch.js';
import { useTableFilter } from '../_shared/data/useTableFilter.js';
import { useTableSort, cycleSortFor } from '../_shared/data/useTableSort.js';
import { useTableSelection } from '../_shared/data/useTableSelection.js';
import { getNestedValue } from '../_shared/data/getNestedValue.js';
import {
  useColumnAutoDetect,
  resolveAlign,
  resolveMonospace,
  resolveTabularNums,
} from '../_shared/data/useColumnAutoDetect.js';
import type {
  TableProps,
  TableColumn,
  TableSortModel,
  TableFilterModel,
  TableLabels,
} from './table.types.js';

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
  columnsShowAll: 'Show all',
  columnsHideAll: 'Hide all',
};

const DEFAULT_GET_ROW_ID = <T extends object>(_row: T, index: number) => String(index);

/**
 * Dashforge TW `<Table>` — declarative-first, market-grounded table.
 *
 * Design references:
 *  - Visual: Stripe (clean line dividers, hover row actions, sticky header)
 *  - Density: Pencil & Paper UX research (compact / comfortable / spacious)
 *  - A11Y: W3C WAI Table tutorial (semantic `<table>`, scope, aria-sort)
 *  - Column model: extended from Dashforge MUI Table existing API
 *
 * Smart defaults: column types auto-detected → numbers right-aligned
 * + tabular-nums, dates monospace, booleans center-aligned. Override
 * via explicit `align` / `monospace` per column.
 *
 * State (sort / search / filter / selection / expansion) is internal
 * by default; pass the controlled prop + matching change handler to
 * lift state up — same pattern as `<TextField>` value.
 *
 * i18n: pass `header: t('users.name')` for column headers; pass
 * `labels={{ searchPlaceholder: t('...'), ... }}` for internal default
 * strings.
 */
export function Table<T extends object>(props: TableProps<T>) {
  const {
    rows,
    cols,
    getRowId = DEFAULT_GET_ROW_ID,

    // State props (controllable)
    sortModel: sortModelProp,
    onSortChange,
    defaultSortModel,

    enableSearch = false,
    searchQuery: searchQueryProp,
    onSearchQueryChange,
    searchPlaceholder,
    searchDebounceMs = 200,

    filterModel: filterModelProp,
    onFilterChange,

    rowSelection = 'none',
    selectedRowIds: selectedRowIdsProp,
    onSelectionChange,
    bulkActions,

    expandable,

    rowActions,

    loading = false,
    loadingRowCount = 5,
    emptyState,

    stickyHeader = true,
    caption,
    showCaption = false,

    access: tableAccess,

    labels: labelsProp,

    variant,
    size,
    density,

    sx,
    slotProps,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const tableAccessState = useAccessState(tableAccess);

  // Dev-only guard: `getRowId` is optional (positional-index fallback)
  // but that fallback breaks row identity once rows reorder (sort) or
  // change presence (search / filter) — selection + expansion state
  // then jump to the wrong rows. Warn when it's omitted AND a feature
  // that relies on stable identity is active. Stripped in production.
  const getRowIdProvided = props.getRowId !== undefined;
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (getRowIdProvided) return;
    const identityMatters =
      rowSelection !== 'none' ||
      expandable != null ||
      enableSearch ||
      cols.some((c) => Boolean(c.sortable));
    if (identityMatters) {
      console.warn(
        '[Dashforge Table] `getRowId` is not set — falling back to the ' +
          'positional row index. With sort / search / selection / ' +
          'expandable rows active, the index-based key breaks row ' +
          'identity when rows reorder. Pass a stable resolver, e.g. ' +
          '`getRowId={(row) => row.id}`.',
      );
    }
  }, [getRowIdProvided, rowSelection, expandable, enableSearch, cols]);

  // ───── Controllable state machinery ─────

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
  // Filter UI (per-column quick filters) is scoped for v1-bis; for now
  // the model is read-only inside the component — the consumer wires it
  // up via `filterModelProp` + `onFilterChange` from their own state.
  // Until the in-table filter UI ships, only the controlled mode is
  // meaningful, so we don't need an internal setter.
  void onFilterChange;
  const filterModel: TableFilterModel = filterModelProp ?? [];
  const [selectedRowIds, setSelectedRowIds] = useControllableState<string[]>({
    controlledValue: selectedRowIdsProp,
    defaultValue: [],
    onChange: onSelectionChange,
  });
  const [expandedRowIds, setExpandedRowIds] = useControllableState<string[]>({
    controlledValue: expandable?.expandedRowIds,
    defaultValue: [],
    onChange: expandable?.onExpandChange,
  });

  // ───── RBAC: filter out hidden columns ─────

  const visibleCols = useMemo(
    () =>
      cols.filter(
        (col) => !col.access || col.access.onUnauthorized !== 'hide',
      ),
    [cols],
  );

  // ───── Smart-default column types ─────

  const columnTypes = useColumnAutoDetect(rows, visibleCols);

  // ───── Pipeline: search → filter → sort ─────

  const debouncedSearchQuery = useDebouncedValue(searchQuery, searchDebounceMs);
  const searchedRows = useTableSearch(rows, visibleCols, debouncedSearchQuery);
  const filteredRows = useTableFilter(searchedRows, filterModel);
  const sortedRows = useTableSort(filteredRows, visibleCols, sortModel);

  // ───── Selection helpers ─────

  const visibleRowIds = useMemo(
    () => sortedRows.map((row, idx) => getRowId(row, idx)),
    [sortedRows, getRowId],
  );

  const selection = useTableSelection(rowSelection, selectedRowIds, setSelectedRowIds);

  const selectedRows = useMemo(
    () => sortedRows.filter((row, idx) => selection.isSelected(getRowId(row, idx))),
    [sortedRows, selection, getRowId],
  );

  // ───── Variant recipe ─────

  const v = tableVariants({ variant, size, density, stickyHeader });

  // ───── Render ─────

  if (!tableAccessState.visible) return null;

  const isTableInteractive = !tableAccessState.disabled;
  const showSelectionColumn = rowSelection !== 'none';
  const showExpandColumn = expandable != null;
  const showRowActionsColumn = rowActions != null;

  const totalColumnCount =
    visibleCols.length +
    (showSelectionColumn ? 1 : 0) +
    (showExpandColumn ? 1 : 0) +
    (showRowActionsColumn ? 1 : 0);

  return (
    <div
      className={cn(v.root(), sx, slotProps?.root?.className)}
      data-disabled={!isTableInteractive ? 'true' : undefined}
    >
      {/* ───── Toolbar (search) ───── */}
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
              disabled={!isTableInteractive}
              className={cn(
                'flex-1 bg-transparent border-0 outline-none',
                'px-2 py-1.5',
                // placeholder color auto-inverts via the CSS-var preset;
                // no `dark:` variant needed on neutral palette.
                'placeholder:text-neutral-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            />
          </label>
        </div>
      )}

      {/* ───── Scroll wrapper ───── */}
      <div className={cn(v.scroll(), slotProps?.scroll?.className)}>
        <table className={cn(v.table(), slotProps?.table?.className)}>
          {caption != null && (
            <caption className={cn(!showCaption && 'sr-only', 'py-2 text-sm text-neutral-500')}>
              {caption}
            </caption>
          )}

          {/* ───── Header ───── */}
          <thead className={cn(v.thead(), slotProps?.thead?.className)}>
            <tr className={cn(v.headerRow(), slotProps?.headerRow?.className)}>
              {showSelectionColumn && (
                <th
                  scope="col"
                  className={cn(
                    v.headerCell(),
                    v.selectionCell(),
                    slotProps?.headerCell?.className,
                    slotProps?.selectionCell?.className,
                  )}
                >
                  {rowSelection === 'multiple' && (
                    <input
                      type="checkbox"
                      aria-label={labels.ariaSelectAllRows}
                      checked={selection.isAllSelected(visibleRowIds)}
                      ref={(el) => {
                        if (el) el.indeterminate = selection.isIndeterminate(visibleRowIds);
                      }}
                      onChange={() => selection.toggleAll(visibleRowIds)}
                      disabled={!isTableInteractive}
                      className="cursor-pointer"
                    />
                  )}
                </th>
              )}

              {showExpandColumn && (
                <th
                  scope="col"
                  aria-hidden="true"
                  className={cn(
                    v.headerCell(),
                    v.expandToggleCell(),
                    slotProps?.headerCell?.className,
                    slotProps?.expandToggleCell?.className,
                  )}
                />
              )}

              {visibleCols.map((col) => (
                <HeaderCell
                  key={col.field as string}
                  col={col}
                  sortModel={sortModel}
                  onSortClick={(e) => handleSortClick(col, e, sortModel, setSortModel)}
                  inferredType={columnTypes.get(col.field as string)}
                  labels={labels}
                  className={cn(v.headerCell(), slotProps?.headerCell?.className)}
                  buttonClassName={v.headerCellButton()}
                  disabled={!isTableInteractive}
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

          {/* ───── Body ───── */}
          <tbody className={cn(v.tbody(), slotProps?.tbody?.className)}>
            {loading
              ? renderLoadingRows({
                  count: loadingRowCount,
                  visibleCols,
                  showSelectionColumn,
                  showExpandColumn,
                  showRowActionsColumn,
                  rowClass: cn(v.row(), slotProps?.row?.className),
                  cellClass: cn(v.cell(), slotProps?.cell?.className),
                })
              : sortedRows.length === 0
                ? renderEmptyState({
                    totalColumnCount,
                    emptyState,
                    // Distinguish a genuinely empty dataset from one
                    // emptied by an active search / filter.
                    fallback:
                      rows.length > 0 &&
                      (debouncedSearchQuery.trim().length > 0 ||
                        filterModel.length > 0)
                        ? labels.noResults
                        : labels.noData,
                    cellClass: cn(v.cell(), v.emptyState(), slotProps?.emptyState?.className),
                  })
                : sortedRows.map((row, idx) => {
                    const rowId = getRowId(row, idx);
                    const isSelected = selection.isSelected(rowId);
                    const isExpanded = expandedRowIds.includes(rowId);
                    return (
                      <Row
                        key={rowId}
                        row={row}
                        rowId={rowId}
                        rowIndex={idx}
                        isSelected={isSelected}
                        isExpanded={isExpanded}
                        visibleCols={visibleCols}
                        columnTypes={columnTypes}
                        rowSelection={rowSelection}
                        showSelectionColumn={showSelectionColumn}
                        showExpandColumn={showExpandColumn}
                        showRowActionsColumn={showRowActionsColumn}
                        expandable={expandable}
                        rowActions={rowActions}
                        labels={labels}
                        toggleRow={selection.toggleRow}
                        toggleExpand={(id) =>
                          setExpandedRowIds((prev) =>
                            prev.includes(id)
                              ? prev.filter((p) => p !== id)
                              : [...prev, id],
                          )
                        }
                        isInteractive={isTableInteractive}
                        rowClass={cn(v.row(), slotProps?.row?.className)}
                        cellClass={cn(v.cell(), slotProps?.cell?.className)}
                        selectionCellClass={cn(
                          v.cell(),
                          v.selectionCell(),
                          slotProps?.cell?.className,
                          slotProps?.selectionCell?.className,
                        )}
                        expandToggleCellClass={cn(
                          v.cell(),
                          v.expandToggleCell(),
                          slotProps?.cell?.className,
                          slotProps?.expandToggleCell?.className,
                        )}
                        rowActionsCellClass={cn(
                          v.cell(),
                          v.rowActionsCell(),
                          slotProps?.cell?.className,
                          slotProps?.rowActionsCell?.className,
                        )}
                        expandedRowClass={cn(v.expandedRow(), slotProps?.expandedRow?.className)}
                        totalColumnCount={totalColumnCount}
                      />
                    );
                  })}
          </tbody>
        </table>
      </div>

      {/* ───── Bulk action footer (sticky) ───── */}
      {bulkActions && selectedRows.length > 0 && (
        <div
          className={cn(v.bulkActionFooter(), slotProps?.bulkActionFooter?.className)}
          role="region"
          aria-label={labels.selectedCount.replace('{count}', String(selectedRows.length))}
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
                // text-neutral-500 → text-neutral-900 on hover; both auto-invert.
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
    </div>
  );
}

// ───── Header cell (with sort button) ─────

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
  const { col, sortModel, onSortClick, inferredType, labels, className, buttonClassName, disabled } = props;

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
    <th
      scope="col"
      className={cn(className, alignClass)}
      style={cellStyle}
    >
      {headerContent}
    </th>
  );
}

// ───── Data row ─────

function Row<T extends object>(props: {
  row: T;
  rowId: string;
  rowIndex: number;
  isSelected: boolean;
  isExpanded: boolean;
  visibleCols: TableColumn<T>[];
  columnTypes: Map<string, string>;
  rowSelection: 'none' | 'single' | 'multiple';
  showSelectionColumn: boolean;
  showExpandColumn: boolean;
  showRowActionsColumn: boolean;
  expandable: TableProps<T>['expandable'];
  rowActions: TableProps<T>['rowActions'];
  labels: Required<TableLabels>;
  toggleRow: (rowId: string) => void;
  toggleExpand: (rowId: string) => void;
  isInteractive: boolean;
  rowClass: string;
  cellClass: string;
  selectionCellClass: string;
  expandToggleCellClass: string;
  rowActionsCellClass: string;
  expandedRowClass: string;
  totalColumnCount: number;
}) {
  const {
    row,
    rowId,
    rowIndex,
    isSelected,
    isExpanded,
    visibleCols,
    columnTypes,
    rowSelection,
    showSelectionColumn,
    showExpandColumn,
    showRowActionsColumn,
    expandable,
    rowActions,
    labels,
    toggleRow,
    toggleExpand,
    isInteractive,
    rowClass,
    cellClass,
    selectionCellClass,
    expandToggleCellClass,
    rowActionsCellClass,
    expandedRowClass,
    totalColumnCount,
  } = props;

  return (
    <>
      <tr
        data-selected={isSelected ? 'true' : 'false'}
        aria-selected={rowSelection !== 'none' ? isSelected : undefined}
        className={rowClass}
      >
        {showSelectionColumn && (
          <td className={selectionCellClass}>
            <input
              type="checkbox"
              aria-label={labels.ariaSelectRow}
              checked={isSelected}
              onChange={() => toggleRow(rowId)}
              disabled={!isInteractive}
              className="cursor-pointer"
            />
          </td>
        )}

        {showExpandColumn && (
          <td className={expandToggleCellClass}>
            <button
              type="button"
              onClick={() => toggleExpand(rowId)}
              aria-label={isExpanded ? labels.ariaCollapseRow : labels.ariaExpandRow}
              aria-expanded={isExpanded}
              disabled={!isInteractive}
              className={cn(
                'inline-flex items-center justify-center h-6 w-6 rounded',
                // text-neutral-500 + hover bump; both auto-invert via CSS-var preset.
                'text-neutral-500 hover:text-neutral-900',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                'transition-transform motion-reduce:transition-none',
                isExpanded && 'rotate-90',
              )}
            >
              <ChevronRightIcon />
            </button>
          </td>
        )}

        {visibleCols.map((col) => (
          <DataCell
            key={col.field as string}
            col={col}
            row={row}
            rowIndex={rowIndex}
            isSelected={isSelected}
            isExpanded={isExpanded}
            inferredType={columnTypes.get(col.field as string)}
            cellClass={cellClass}
          />
        ))}

        {showRowActionsColumn && rowActions && (
          <td className={rowActionsCellClass}>
            {rowActions(row)}
          </td>
        )}
      </tr>

      {isExpanded && expandable && (
        <tr className={expandedRowClass}>
          <td colSpan={totalColumnCount} className="p-3">
            {expandable.render(row)}
          </td>
        </tr>
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
  isExpanded: boolean;
  inferredType: string | undefined;
  cellClass: string;
}) {
  const { col, row, rowIndex, isSelected, isExpanded, inferredType, cellClass } = props;
  const value = getNestedValue(row, col.field as string);
  const align = resolveAlign(col, inferredType as never);
  // tabularNums = digit alignment via font-variant-numeric — does NOT
  // change the font family. Auto-true for number / date columns.
  const tabularNums = resolveTabularNums(col, inferredType as never);
  // monospace = font-family override (font-mono). Library never
  // auto-picks a font family — only explicit consumer opt-in. The
  // consumer's theme font-sans is preserved by default.
  const monospace = resolveMonospace(col);
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  // Per-column RBAC state for the cellRenderer context
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
        isExpanded,
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
  setSortModel: (next: TableSortModel | ((prev: TableSortModel) => TableSortModel)) => void,
) {
  if (!col.sortable) return;
  const multi = event.shiftKey;
  setSortModel((prev) => cycleSortFor(prev, col.field as string, multi));
}

function renderLoadingRows<T extends object>(args: {
  count: number;
  visibleCols: TableColumn<T>[];
  showSelectionColumn: boolean;
  showExpandColumn: boolean;
  showRowActionsColumn: boolean;
  rowClass: string;
  cellClass: string;
}): ReactNode {
  const { count, visibleCols, showSelectionColumn, showExpandColumn, showRowActionsColumn, rowClass, cellClass } = args;
  // No explicit row height here (unlike DataGrid's loading rows, which
  // pin `rowHeight` for the virtualization math): Table is auto-height
  // by design. Skeleton rows inherit the same density padding via
  // `cellClass`, so they line up with real rows without a fixed height.
  return Array.from({ length: count }).map((_, i) => (
    <tr key={`loading-${i}`} className={rowClass} aria-busy="true">
      {showSelectionColumn && <td className={cellClass}><Skeleton variant="rectangle" width="16px" height="16px" /></td>}
      {showExpandColumn && <td className={cellClass}><Skeleton variant="rectangle" width="16px" height="16px" /></td>}
      {visibleCols.map((col) => (
        <td key={col.field as string} className={cellClass}>
          <Skeleton variant="text" width="80%" />
        </td>
      ))}
      {showRowActionsColumn && <td className={cellClass}><Skeleton variant="rectangle" width="24px" height="24px" /></td>}
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

function ChevronRightIcon() {
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
    >
      <path d="M6 4l4 4-4 4" />
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
