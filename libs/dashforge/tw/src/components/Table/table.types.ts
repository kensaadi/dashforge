import type { ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { TableVariants } from './table.variants.js';

/**
 * Subset of `<Table>` props theme-configurable via
 * `theme.components.Table.defaults` (Option C).
 */
export type TableVariantProps = Pick<
  TableVariants,
  'variant' | 'size' | 'density' | 'stickyHeader'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Table?: {
      defaults?: Partial<TableVariantProps>;
      slotProps?: TableSlotProps;
    };
  }
}

// ───── Nested key util ─────

/**
 * Type-level dotted path through an object's nested structure.
 *
 * `NestedKeyOf<{ user: { name: string } }>` → `'user' | 'user.name'`.
 *
 * Used as the `field` of a column to give autocomplete on nested
 * paths. The runtime lookup happens via `getNestedValue` in
 * `_internal/getNestedValue.ts` (split on `.` and walk).
 */
export type NestedKeyOf<T extends object> = {
  [K in keyof T & (string | number)]: T[K] extends object | undefined
    ? T[K] extends ReadonlyArray<unknown>
      ? `${K}`
      : NonNullable<T[K]> extends object
        ? `${K}` | `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
        : `${K}`
    : `${K}`;
}[keyof T & (string | number)];

// ───── Column types ─────

/**
 * Auto-detected primitive type for a column. Drives smart defaults:
 *  - `number`  → align right + monospace (`tabular-nums`)
 *  - `date`    → align left + monospace (consistent ISO width)
 *  - `boolean` → align center
 *  - `string`  → align left (default)
 *  - `unknown` → fallback to left, no monospace
 */
export type TableColumnInferredType =
  | 'number'
  | 'date'
  | 'boolean'
  | 'string'
  | 'unknown';

/**
 * Context passed to a custom `cellRenderer`. Mirrors what the consumer
 * needs to render a cell: row, resolved value, position, selection
 * state, expand state, and the resolved RBAC access state for THIS
 * column.
 */
export interface TableCellContext<T> {
  row: T;
  value: unknown;
  rowIndex: number;
  isSelected: boolean;
  isExpanded: boolean;
  /** Resolved RBAC state for this column. `null` if no `access` set. */
  access: { hidden: boolean; disabled: boolean; readonly: boolean } | null;
}

/**
 * One column definition for `<Table>`.
 *
 * **i18n**: pass `t('users.name')` directly to `header` — `header`
 * accepts `string` for the common case. Use the function form
 * `header: () => <span>…</span>` only when you need richer JSX.
 *
 * **Smart defaults**: when `align` / `monospace` are omitted, the
 * Table auto-detects the column type from the first non-null value
 * across the visible rows and applies `right + tabular-nums` for
 * numbers, `center` for booleans, etc. Explicit props always win.
 */
export interface TableColumn<T extends object> {
  /**
   * Dotted path to the value in each row. Supports nested keys
   * (`'address.city.zipCode'`) thanks to `NestedKeyOf<T>` typing +
   * runtime `getNestedValue()`.
   */
  field: NestedKeyOf<T> | (string & {});

  /**
   * Visible header. Pass a translation string directly:
   * `header: t('users.name')`. Use the function form for richer
   * JSX (e.g. header with an icon).
   */
  header: string | (() => ReactNode);

  /** Pixel width (`px`). Mutually informative with `flex`. */
  width?: number;
  /** Flex grow factor (CSS `flex: <n> 1 0`). */
  flex?: number;
  /** Minimum pixel width (for resizable columns — deferred to v1-bis). */
  minWidth?: number;

  /**
   * Horizontal alignment. Default is auto-detected from value type
   * (number → right, boolean → center, otherwise left).
   */
  align?: 'left' | 'right' | 'center';

  /**
   * Opt-in to a monospace **font family** for this column. The
   * library never auto-applies `font-mono` — it would override the
   * consumer's theme `font-sans`. Set `true` explicitly only when
   * the design calls for a typewriter font (e.g. raw hex IDs).
   *
   * The dashforgePreset does NOT own the `fontFamily` axis; the
   * consumer configures the mono stack in their own
   * `tailwind.config.ts` (`theme.extend.fontFamily.mono`).
   */
  monospace?: boolean;

  /**
   * Apply `font-variant-numeric: tabular-nums` so every digit
   * occupies the same width — clean alignment for currency / metric
   * columns. Does NOT change the font family. Auto-applied for
   * `number` and `date` columns; pass `false` explicitly to opt out
   * or `true` to force on a string column.
   */
  tabularNums?: boolean;

  /**
   * Make the column sortable. Pass `true` for default comparator
   * (works for string/number/date/boolean) or a custom
   * `(a, b) => number`.
   */
  sortable?: boolean | ((a: T, b: T) => number);

  /**
   * Include this column in the global search filter.
   * @default false
   */
  searchable?: boolean;

  /**
   * Enable per-column quick filter UI in the column header.
   * @default false
   */
  filterable?: boolean;

  /**
   * Override the filter UI type. By default the type is auto-detected
   * from `useColumnAutoDetect` (number → range, date → range,
   * boolean → select, anything else → text contains). Force a
   * specific UI when the autodetect picks the wrong one — e.g. an
   * ID column stored as a number that should filter by text contains.
   */
  filterType?: TableFilterType;

  /**
   * Custom cell renderer. Receives the full row + the resolved
   * (potentially nested) value, the row index, selection state,
   * expansion state, and the RBAC access state.
   */
  cellRenderer?: (ctx: TableCellContext<T>) => ReactNode;

  /**
   * Per-column RBAC. `onUnauthorized: 'hide'` removes the column
   * entirely from header AND every row cell (a11y-correct).
   * `disable` / `readonly` are forwarded to `cellRenderer` via
   * `ctx.access` — the renderer is expected to honor them.
   */
  access?: AccessRequirement;

  /**
   * Pin this column during horizontal scroll. `'left'` (DataGrid v1)
   * uses CSS `position: sticky; left: 0`. `'right'` is reserved for
   * v1-bis (CSS edge cases around last-column borders). Table
   * (non-virtualized) ignores this prop today — only DataGrid honors
   * it (Sprint 4.2).
   */
  sticky?: 'left' | 'right';

  /**
   * Allow user to hide this column from the column-visibility dialog.
   * Pass `false` for structurally required columns (e.g. an ID column).
   * @default true
   */
  hideable?: boolean;
  /** Hidden on first render (the user can re-show via the dialog). */
  defaultHidden?: boolean;

  /**
   * Allow user to resize this column by dragging the right edge of
   * its header. Pass `false` to opt out per-column. The grid-level
   * `enableColumnResize` flag must also be on (default `true`).
   * @default true
   */
  resizable?: boolean;
  /** Maximum width (px) honored by the resize drag. */
  maxWidth?: number;

  /**
   * Allow user to reorder this column by dragging its header. Pass
   * `false` to pin its position. The grid-level `enableColumnReorder`
   * flag must also be on (default `true`).
   * @default true
   */
  reorderable?: boolean;
}

// ───── State models ─────

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortItem {
  field: string;
  direction: TableSortDirection;
}

/**
 * Sort model. Single-column sort = array of length 1. Multi-column
 * sort = array of N (typically up to 3). The order matters: first
 * item is the primary sort key, subsequent items break ties.
 */
export type TableSortModel = TableSortItem[];

/**
 * Filter operator. The value shape depends on the operator:
 *  - `contains` → `value: string` (text substring match)
 *  - `equals` → `value: unknown` (exact match, used for booleans)
 *  - `between` → `value: [min, max]` where each end can be `null`
 *    for an open range. Used for number ranges (`value: [10, 50]`)
 *    and date ranges (`value: ['2024-01-01', '2024-12-31']` as ISO).
 */
export type TableFilterOperator = 'contains' | 'equals' | 'between';

export interface TableFilterItem {
  field: string;
  op: TableFilterOperator;
  value: unknown;
}

export type TableFilterModel = TableFilterItem[];

/**
 * Column-level filter type hint. Determines which filter UI to
 * render in the column header Popover. Auto-detected from
 * `useColumnAutoDetect` when omitted:
 *
 *  - `number` → number range filter
 *  - `date` → date range filter
 *  - `boolean` → true/false/all select
 *  - `string` (or anything else) → text contains
 */
export type TableFilterType = 'text' | 'number' | 'boolean' | 'date';

export type TableRowSelectionMode = 'none' | 'single' | 'multiple';

// ───── i18n labels ─────

/**
 * Internal default strings used by the Table for accessibility
 * announcements, density toggle, search placeholder, etc. Pass the
 * subset you need to translate; the rest fall back to English.
 *
 * For column headers, empty state, bulk actions and row action
 * labels — pass the translated value directly via the matching
 * prop (`header`, `emptyState`, `bulkActions`, `rowActions`).
 */
export interface TableLabels {
  searchPlaceholder?: string;
  /** Shown when the dataset itself is empty (0 input rows). */
  noData?: string;
  /**
   * Shown when the dataset has rows but an active search / filter
   * excluded them all. Distinct from `noData` so the user can tell
   * "nothing here" from "nothing matches your query".
   */
  noResults?: string;
  loading?: string;
  ariaSortNone?: string;
  ariaSortAscending?: string;
  ariaSortDescending?: string;
  ariaSelectRow?: string;
  ariaSelectAllRows?: string;
  ariaExpandRow?: string;
  ariaCollapseRow?: string;
  /** "X selected" — `{count}` placeholder gets replaced. */
  selectedCount?: string;
  clearSelection?: string;
  /** Per-column filter Popover. */
  filterColumn?: string;
  filterApply?: string;
  filterClear?: string;
  /** Number / date range filter inputs. */
  filterMin?: string;
  filterMax?: string;
  filterFrom?: string;
  filterTo?: string;
  /** Boolean filter radio options. */
  filterAll?: string;
  filterTrue?: string;
  filterFalse?: string;
  /** Density toggle. */
  density?: string;
  densityCompact?: string;
  densityComfortable?: string;
  densitySpacious?: string;
  /** Column visibility menu (Popover-based, auto-commit). */
  columnsButton?: string;
  columnsTitle?: string;
  /** Aria-label for the tri-state show/hide-all master checkbox. */
  columnsToggleAll?: string;
}

// ───── Slot props ─────

export interface TableSlotProps {
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
  expandToggleCell?: { className?: string };
  expandedRow?: { className?: string };
  rowActionsCell?: { className?: string };
  bulkActionFooter?: { className?: string };
}

// ───── Expandable rows config ─────

export interface TableExpandableConfig<T> {
  render: (row: T) => ReactNode;
  expandedRowIds?: string[];
  onExpandChange?: (ids: string[]) => void;
}

// ───── Main props ─────

/**
 * Props for `<Table>`.
 *
 * Hybrid declarative-first architecture: by default every state piece
 * (sort, filter, search, selection, expansion) is internal. Pass the
 * matching controlled prop + change handler to lift state up.
 *
 * Smart defaults: column types are auto-detected on first render —
 * number columns get right-align + tabular-nums, dates get monospace,
 * booleans get center-align, etc. Override via explicit `align` /
 * `monospace` per column.
 *
 * Visual style: Stripe-inspired clean lines by default
 * (`variant="lines"`), row actions revealed on hover, sticky header,
 * `comfortable` density. Switch via variant / density / size props.
 *
 * i18n: column `header` accepts plain strings (use `t('...')`
 * directly). All internal label strings configurable via `labels`
 * prop with English defaults.
 */
export interface TableProps<T extends object> {
  /**
   * Overall visual treatment — `plain`, `lines` (default), `striped`,
   * `bordered`, or `card` (rounded surface with elevation).
   * @default 'lines'
   */
  variant?: TableVariants['variant'];

  /**
   * Text-size + padding density.
   * @default 'md'
   */
  size?: TableVariants['size'];

  /**
   * Row height — independent from `size` (density is a spacing axis,
   * size is a typography axis).
   * @default 'comfortable'
   */
  density?: TableVariants['density'];

  // ───── Data ─────
  /** Source rows to render. Order is display order (before sort). */
  rows: T[];

  /** Column definitions — see `TableColumn<T>` for the full shape. */
  cols: TableColumn<T>[];
  /**
   * Stable row-id resolver — the React key + the identity used by
   * selection and row-expansion state.
   *
   * **Strongly recommended whenever sort / search / selection /
   * expandable rows are used.** The default falls back to the
   * positional index (`String(index)`); once rows reorder (sort) or
   * change presence (search / filter), index `2` points at a
   * *different* row, so selection and expansion state silently jump
   * to the wrong rows. Pass a value derived from the data itself:
   *
   * ```tsx
   * <Table getRowId={(row) => row.id} … />
   * ```
   *
   * Dashforge emits a `console.warn` in development when `getRowId`
   * is omitted and one of those features is active. (`<DataGrid>`
   * makes this prop required for the same reason.)
   */
  getRowId?: (row: T, index: number) => string;

  // ───── Sort ─────
  /**
   * Controlled sort model — an ordered array of `{ field, direction }`
   * items (multi-sort). Pass with `onSortChange` to lift state up.
   * Omit for uncontrolled (Table owns the sort state internally).
   */
  sortModel?: TableSortModel;

  /** Called when the user cycles a column header (single-sort) or shift-clicks (multi-sort). */
  onSortChange?: (model: TableSortModel) => void;

  /**
   * Default sort applied when uncontrolled — mirrors
   * `defaultChecked` / `defaultValue` semantics.
   */
  defaultSortModel?: TableSortModel;

  // ───── Search ─────
  /**
   * Render the search input above the table. When `false`, the
   * toolbar row collapses to zero height.
   * @default false
   */
  enableSearch?: boolean;

  /** Controlled search query. Pass with `onSearchQueryChange`. */
  searchQuery?: string;

  /** Called on every keystroke in the search input (post-debounce). */
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

  // ───── Per-column filter ─────
  /**
   * Controlled per-column filter model — array of active filter
   * clauses (per-column UI shipped in 0.8.0-beta; set
   * `cols[i].filterable=true` to expose the header menu).
   */
  filterModel?: TableFilterModel;

  /** Called when the user adds / removes / edits a per-column filter clause. */
  onFilterChange?: (model: TableFilterModel) => void;

  // ───── Selection ─────
  /**
   * Row selection mode — `none` (default), `single`, `multiple`.
   * @default 'none'
   */
  rowSelection?: TableRowSelectionMode;

  /** Controlled selected-row ids. Pass with `onSelectionChange`. */
  selectedRowIds?: string[];

  /** Called when the selection changes (checkbox click, shift-range, select-all). */
  onSelectionChange?: (ids: string[]) => void;

  /** Sticky bulk-action footer (visible only when selection > 0). */
  bulkActions?: (selectedRows: T[]) => ReactNode;

  // ───── Expandable rows ─────
  /**
   * Enables the expandable-row column — `render(row)` returns the
   * detail JSX, and `expandedRowIds` + `onExpandChange` control state.
   */
  expandable?: TableExpandableConfig<T>;

  // ───── Row actions (revealed on hover) ─────
  /** Per-row action slot — receives the row, returns JSX rendered on hover. */
  rowActions?: (row: T) => ReactNode;

  // ───── States ─────
  /**
   * When `true`, render `loadingRowCount` skeleton rows instead of
   * the data.
   * @default false
   */
  loading?: boolean;

  /**
   * Number of skeleton rows shown while `loading=true`.
   * @default 5
   */
  loadingRowCount?: number;

  /** Rendered when `rows.length === 0`. Falls back to a labeled "No data" state. */
  emptyState?: ReactNode;

  // ───── A11Y ─────
  /**
   * Pin `<thead>` during vertical scroll (`position: sticky; top: 0`).
   * @default true
   */
  stickyHeader?: boolean;

  /** Optional caption — screen readers announce it as the table's name. */
  caption?: ReactNode;

  /**
   * Render the caption visually too. When `false`, the caption is
   * `sr-only`.
   * @default false
   */
  showCaption?: boolean;

  // ───── RBAC ─────
  /**
   * Table-level RBAC. `hide` returns `null`; `disable` greys the
   * whole table; `readonly` disables interaction but keeps content.
   */
  access?: AccessRequirement;

  // ───── i18n ─────
  /** i18n string overrides — see `TableLabels` for the full shape. */
  labels?: TableLabels;

  // ───── Customization escape hatches ─────
  /** Escape hatch for utility classes — appended to the root. Wins over variant classes via `tailwind-merge`. */
  sx?: string;

  /** Per-slot className overrides — see `TableSlotProps`. */
  slotProps?: TableSlotProps;
}
