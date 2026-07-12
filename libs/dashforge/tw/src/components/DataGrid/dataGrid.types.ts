import type { ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { DataGridVariants } from './dataGrid.variants.js';
import type {
  TableColumn,
  TableSortModel,
  TableFilterModel,
  TableRowSelectionMode,
  TableLabels,
} from '../Table/table.types.js';

/**
 * Subset of `<DataGrid>` props theme-configurable via
 * `theme.components.DataGrid.defaults` (Option C).
 */
export type DataGridVariantProps = Pick<
  DataGridVariants,
  'variant' | 'size' | 'density'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    DataGrid?: {
      defaults?: Partial<DataGridVariantProps>;
    };
  }
}

// Re-export the column type unchanged — DataGrid uses the SAME shape
// as Table. Consumers writing `cols: TableColumn<T>[]` get autocomplete
// and don't need a parallel `DataGridColumn<T>` type.

// ───── Selection scope ─────

/**
 * Determines what the "select all" header checkbox covers when
 * `rowSelection="multiple"` is enabled.
 *
 *  - `'visible'` — only the rows currently in the viewport (after
 *    virtualization windowing) are toggled. Useful when the
 *    underlying data is paginated server-side and "all" semantically
 *    refers to the screen.
 *  - `'allLoaded'` (default) — all rows currently in the `rows` prop
 *    are toggled. The standard "select everything I can see in this
 *    dataset" pattern.
 *
 * For "select all in server-side dataset", the consumer wires it
 * themselves (e.g. fetch all ids + setSelectedRowIds).
 */
export type DataGridSelectAllScope = 'visible' | 'allLoaded';

// ───── Server-side mode flags ─────

/**
 * Independent opt-in flags that delegate the corresponding pipeline
 * step to the consumer. With each flag enabled, DataGrid emits the
 * `onXChange` callback but does NOT perform the operation locally
 * — the consumer is expected to provide the resulting `rows` array.
 */
export interface DataGridServerSideFlags {
  serverSideSort?: boolean;
  serverSideFilter?: boolean;
  serverSideSearch?: boolean;
  /**
   * When true, DataGrid does NOT slice `rows` for pagination. The
   * virtualization math uses `totalCount` (required) to size the
   * scroll container.
   */
  serverSidePagination?: boolean;
}

// ───── Pagination (DataGrid-internal, opt-in) ─────

export interface DataGridPaginationConfig {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// ───── Slot props ─────

export interface DataGridSlotProps {
  root?: { className?: string };
  toolbar?: { className?: string };
  search?: { className?: string };
  scroll?: { className?: string };
  table?: { className?: string };
  thead?: { className?: string };
  tbody?: { className?: string };
  headerRow?: { className?: string };
  headerCell?: { className?: string };
  row?: { className?: string };
  cell?: { className?: string };
  emptyState?: { className?: string };
  loadingOverlay?: { className?: string };
  selectionCell?: { className?: string };
  rowActionsCell?: { className?: string };
  bulkActionFooter?: { className?: string };
  /** Optional Pagination wrapper below the virtualized scroll. */
  pagination?: { className?: string };
}

// ───── Main props ─────

/**
 * Props for `<DataGrid>`.
 *
 * Companion to `<Table>` for large data sets. Where Table renders
 * every row in DOM, DataGrid uses **homemade virtualization**
 * (`IntersectionObserver` + scroll-event + `requestAnimationFrame`
 * — no external libs) to render only a window of visible rows.
 *
 * Required:
 *  - `rows`, `cols`, `getRowId` — same as Table
 *  - `rowHeight` (fixed in v1; variable-height deferred to v1-bis)
 *  - `height` — explicit container height in CSS units, OR
 *    consumer sets it via `sx` / parent layout (the scroll container
 *    needs a bounded height for virtualization to work)
 *
 * Optional:
 *  - `overscan` — extra rows above/below viewport (default 5)
 *  - Server-side mode flags (4 independent opt-ins)
 *  - Internal pagination (opt-in via `pagination` config)
 *  - `selectAllScope` — `'visible'` vs `'allLoaded'` for header
 *    select-all checkbox
 *  - Everything Table accepts: sort / filter / search / selection /
 *    row actions / RBAC / variants / i18n labels / sx / slotProps
 */
export interface DataGridProps<T extends object>
  extends DataGridServerSideFlags {
  /**
   * Overall visual treatment. Note: `card` variant from Table is
   * intentionally excluded — incompatible with virtualization.
   * @default 'lines'
   */
  variant?: DataGridVariants['variant'];

  /**
   * Text-size + padding density.
   * @default 'md'
   */
  size?: DataGridVariants['size'];

  /**
   * Row height — independent from `size`.
   * @default 'comfortable'
   */
  density?: DataGridVariants['density'];

  // ───── Data ─────
  rows: T[];
  cols: TableColumn<T>[];
  getRowId: (row: T, index: number) => string;

  /** Required: total dataset count. In client-side mode equals
   *  `rows.length`; in `serverSidePagination` mode the consumer
   *  provides the full count so the virtual scroll height matches. */
  totalCount?: number;

  // ───── Virtualization (REQUIRED) ─────
  /** Fixed row height in pixels. Required for windowing math. */
  rowHeight: number;
  /** Rows rendered above/below the viewport. @default 5 */
  overscan?: number;
  /** Container height in CSS units (e.g. `"600px"`, `"100vh"`).
   *  Required for the scroll container to bound the virtualization. */
  height?: string;

  // ───── Sort ─────
  sortModel?: TableSortModel;
  onSortChange?: (model: TableSortModel) => void;
  defaultSortModel?: TableSortModel;

  // ───── Search ─────
  enableSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;

  // ───── Filter (model + in-header per-column UI) ─────
  filterModel?: TableFilterModel;
  onFilterChange?: (model: TableFilterModel) => void;

  // ───── Column visibility (dialog UI in toolbar) ─────
  /**
   * List of column `field`s currently hidden. Drives the column
   * visibility dialog. When omitted, the dialog manages state
   * internally (seeded from each column's `defaultHidden`).
   */
  hiddenColumns?: string[];
  /** Called when the user commits a change in the visibility dialog. */
  onHiddenColumnsChange?: (next: string[]) => void;
  /**
   * Show the "Columns" button in the toolbar. Defaults to `true` so
   * the dialog is discoverable; set `false` for embedded / compact
   * grids where columns are externally controlled.
   * @default true
   */
  enableColumnVisibility?: boolean;

  // ───── Column resize (drag the right edge of a <th>) ─────
  /**
   * Map of `field → width (px)` for user-resized columns. When
   * omitted, DataGrid manages widths internally — seeded from each
   * column's `width` prop.
   */
  columnWidths?: Record<string, number>;
  /** Called when the user finishes (or actively drags) a resize. */
  onColumnWidthsChange?: (next: Record<string, number>) => void;
  /**
   * Allow user-driven column resize via drag on the right edge of
   * each `<th>`. Per-column opt-out via `col.resizable = false`.
   * @default true
   */
  enableColumnResize?: boolean;

  // ───── Column reorder (drag a header to reposition) ─────
  /**
   * Custom display order, as a list of `field`s. Columns not in the
   * list are appended in their original order at the end. When
   * omitted, DataGrid uses the order from the `cols` prop.
   */
  columnOrder?: string[];
  /** Called when the user finishes a reorder drag. */
  onColumnOrderChange?: (next: string[]) => void;
  /**
   * Allow user-driven column reorder via native HTML5 drag-and-drop
   * on each `<th>`. Per-column opt-out via `col.reorderable = false`.
   * @default true
   */
  enableColumnReorder?: boolean;

  // ───── Selection ─────
  rowSelection?: TableRowSelectionMode;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Bulk action sticky footer (visible only when selection > 0). */
  bulkActions?: (selectedRows: T[]) => ReactNode;
  /**
   * Scope of the "select all" header checkbox.
   * @default 'allLoaded'
   */
  selectAllScope?: DataGridSelectAllScope;

  // ───── Internal pagination (opt-in) ─────
  pagination?: DataGridPaginationConfig;

  // ───── Row actions ─────
  rowActions?: (row: T) => ReactNode;

  // ───── States ─────
  loading?: boolean;
  loadingRowCount?: number;
  emptyState?: ReactNode;

  // ───── A11Y ─────
  stickyHeader?: boolean;
  caption?: ReactNode;
  showCaption?: boolean;

  // ───── RBAC ─────
  access?: AccessRequirement;

  // ───── i18n ─────
  labels?: TableLabels;

  // ───── Customization ─────
  sx?: string;
  slotProps?: DataGridSlotProps;
}
