import type { ReactNode } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import type { TableVariants } from './table.variants.js';

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
   * Enable per-column quick filter (text-based in v1).
   * @default false
   */
  filterable?: boolean;

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

  /** Reserved for v1-bis (column-visibility dialog). */
  hideable?: boolean;
  defaultHidden?: boolean;
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

export interface TableFilterItem {
  field: string;
  /** Text substring match. Future ops: `equals`, `in`, `gte`, `lte`, `between`. */
  op: 'contains';
  value: string;
}

export type TableFilterModel = TableFilterItem[];

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
  noData?: string;
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
  /** Density toggle. */
  density?: string;
  densityCompact?: string;
  densityComfortable?: string;
  densitySpacious?: string;
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
export interface TableProps<T extends object>
  extends Pick<TableVariants, 'variant' | 'size' | 'density'> {
  // ───── Data ─────
  rows: T[];
  cols: TableColumn<T>[];
  /** Stable row id resolver. Default: positional index. */
  getRowId?: (row: T, index: number) => string;

  // ───── Sort ─────
  sortModel?: TableSortModel;
  onSortChange?: (model: TableSortModel) => void;
  /** Default sort applied when uncontrolled. */
  defaultSortModel?: TableSortModel;

  // ───── Search ─────
  enableSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;

  // ───── Per-column filter ─────
  filterModel?: TableFilterModel;
  onFilterChange?: (model: TableFilterModel) => void;

  // ───── Selection ─────
  rowSelection?: TableRowSelectionMode;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Sticky bulk action footer (visible only when selection > 0). */
  bulkActions?: (selectedRows: T[]) => ReactNode;

  // ───── Expandable rows ─────
  expandable?: TableExpandableConfig<T>;

  // ───── Row actions (revealed on hover) ─────
  rowActions?: (row: T) => ReactNode;

  // ───── States ─────
  loading?: boolean;
  /** Number of skeleton rows shown while `loading=true`. @default 5 */
  loadingRowCount?: number;
  emptyState?: ReactNode;

  // ───── A11Y ─────
  /** Sticky header. @default true */
  stickyHeader?: boolean;
  /** Optional caption for screen readers. */
  caption?: ReactNode;
  /** Renders the caption visually too (otherwise sr-only). @default false */
  showCaption?: boolean;

  // ───── RBAC ─────
  /** Table-level RBAC. `hide` returns null; `disable` greys everything. */
  access?: AccessRequirement;

  // ───── i18n ─────
  labels?: TableLabels;

  // ───── Customization escape hatches ─────
  sx?: string;
  slotProps?: TableSlotProps;
}
