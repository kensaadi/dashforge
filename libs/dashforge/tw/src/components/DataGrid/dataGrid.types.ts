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
      slotProps?: DataGridSlotProps;
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
  /**
   * When `true`, DataGrid skips local sort and only emits
   * `onSortChange`. The consumer refetches and passes fresh `rows`.
   * @default false
   */
  serverSideSort?: boolean;

  /**
   * When `true`, DataGrid skips local per-column filter and only
   * emits `onFilterChange`.
   * @default false
   */
  serverSideFilter?: boolean;

  /**
   * When `true`, DataGrid skips local search filter and only emits
   * `onSearchQueryChange`.
   * @default false
   */
  serverSideSearch?: boolean;

  /**
   * When `true`, DataGrid does NOT slice `rows` for pagination. The
   * virtualization math uses `totalCount` (required) to size the
   * scroll container.
   * @default false
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
  /** Source rows currently in the visible window. In `serverSidePagination` mode this is only the current page's slice. */
  rows: T[];

  /** Column definitions — same shape as `<Table>` (`TableColumn<T>`). */
  cols: TableColumn<T>[];

  /**
   * Stable row-id resolver — **required** on DataGrid because virt +
   * server pagination make the positional index unsafe. Pass a value
   * derived from the data (e.g. `row => row.id`).
   */
  getRowId: (row: T, index: number) => string;

  /**
   * Total dataset count. In client-side mode this equals `rows.length`;
   * in `serverSidePagination` mode the consumer provides the full count
   * so the virtual scroll height matches the total.
   */
  totalCount?: number;

  // ───── Virtualization (REQUIRED) ─────
  /** Fixed row height in pixels. Required for windowing math. */
  rowHeight: number;

  /**
   * Rows rendered above/below the visible viewport as a smoothing
   * buffer.
   * @default 5
   */
  overscan?: number;

  /**
   * Scroll-container height in CSS units (e.g. `'600px'`, `'100vh'`).
   * Required to bound the virtualization.
   */
  height?: string;

  // ───── Sort ─────
  /** Controlled sort model. Pass with `onSortChange` (or `serverSideSort=true`) to lift state up. */
  sortModel?: TableSortModel;

  /** Called when the user cycles a column header. */
  onSortChange?: (model: TableSortModel) => void;

  /** Default sort applied when uncontrolled. */
  defaultSortModel?: TableSortModel;

  // ───── Search ─────
  /**
   * Render the search input above the grid.
   * @default false
   */
  enableSearch?: boolean;

  /** Controlled search query. */
  searchQuery?: string;

  /** Called on every keystroke (post-debounce). */
  onSearchQueryChange?: (q: string) => void;

  /**
   * Placeholder text of the search input.
   * @default 'Search…' (from `labels`)
   */
  searchPlaceholder?: string;

  /**
   * Debounce window for `onSearchQueryChange`, in milliseconds.
   * @default 200
   */
  searchDebounceMs?: number;

  // ───── Filter (model + in-header per-column UI) ─────
  /** Controlled per-column filter model. Set `cols[i].filterable=true` to expose the header menu. */
  filterModel?: TableFilterModel;

  /** Called when the user adds / removes / edits a filter clause. */
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
  /**
   * Row selection mode.
   * @default 'none'
   */
  rowSelection?: TableRowSelectionMode;

  /** Controlled selected-row ids. Pass with `onSelectionChange`. */
  selectedRowIds?: string[];

  /** Called when the selection changes. */
  onSelectionChange?: (ids: string[]) => void;

  /** Sticky bulk-action footer (visible only when selection > 0). */
  bulkActions?: (selectedRows: T[]) => ReactNode;

  /**
   * Scope of the header "select all" checkbox — `'visible'` selects
   * only the current window, `'allLoaded'` selects every row currently
   * in memory.
   * @default 'allLoaded'
   */
  selectAllScope?: DataGridSelectAllScope;

  // ───── Internal pagination (opt-in) ─────
  /**
   * Enable the built-in `<Pagination>` component rendered below the
   * grid. Pass the config object; omit for scroll-only virtualization.
   */
  pagination?: DataGridPaginationConfig;

  // ───── Row actions ─────
  /** Per-row action slot — receives the row, returns JSX rendered on hover. */
  rowActions?: (row: T) => ReactNode;

  // ───── States ─────
  /**
   * Render skeleton rows in place of the data while `true`.
   * @default false
   */
  loading?: boolean;

  /**
   * Skeleton row count while `loading=true`.
   * @default 8
   */
  loadingRowCount?: number;

  /** Custom placeholder when `rows.length === 0`. */
  emptyState?: ReactNode;

  // ───── A11Y ─────
  /**
   * Pin `<thead>` during vertical scroll.
   * @default true
   */
  stickyHeader?: boolean;

  /** Optional caption — screen readers announce it as the grid's name. */
  caption?: ReactNode;

  /**
   * Render the caption visually too. When `false`, the caption is `sr-only`.
   * @default false
   */
  showCaption?: boolean;

  // ───── RBAC ─────
  /** Grid-level RBAC. `hide` returns `null`; `disable` greys the whole grid. */
  access?: AccessRequirement;

  // ───── i18n ─────
  /** i18n string overrides — shares `TableLabels` with `<Table>`. */
  labels?: TableLabels;

  // ───── Customization ─────
  /** Escape hatch for utility classes — appended to the root scroll container. */
  sx?: string;

  /** Per-slot className overrides — see `DataGridSlotProps` for the full slot list. */
  slotProps?: DataGridSlotProps;
}
