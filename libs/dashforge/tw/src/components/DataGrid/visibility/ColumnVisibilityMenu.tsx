import { useState, type ReactNode } from 'react';
import { Popover } from '../../Popover/Popover.js';
import { cn } from '../../../utils/cn.js';
import type { TableColumn } from '../../Table/table.types.js';

/**
 * Column visibility menu for DataGrid.
 *
 * Renders a toolbar button (the trigger) that opens a `<Popover>`
 * with one checkbox per `hideable` column. Auto-commits on every
 * toggle — there's no draft / commit step. Outside-click and Esc
 * close the popover (Radix-managed).
 *
 * UX rationale for Popover-over-Dialog:
 *  - Lightweight, non-modal: the user can keep referring to the grid
 *    while picking columns. A modal Dialog would interrupt the flow.
 *  - Auto-commit reads as a "settings panel" rather than a
 *    "configuration form" — matches AG-Grid / MUI DataGrid v6 /
 *    TanStack examples.
 *  - No focus trap on the rest of the page; the user can scroll the
 *    grid or click the column resize handles without dismissing the
 *    panel first.
 *
 * Columns with `hideable: false` are NEVER shown in the menu —
 * those are considered structurally required (e.g. an ID column).
 *
 * RBAC-hidden columns (`access.onUnauthorized === 'hide'`) are also
 * excluded — they're already removed from `visibleCols` upstream.
 */

export interface ColumnVisibilityLabels {
  columnsButton?: string;
  columnsTitle?: string;
  columnsShowAll?: string;
  columnsHideAll?: string;
}

const DEFAULT_VISIBILITY_LABELS: Required<ColumnVisibilityLabels> = {
  columnsButton: 'Columns',
  columnsTitle: 'Toggle columns',
  columnsShowAll: 'Show all',
  columnsHideAll: 'Hide all',
};

export interface ColumnVisibilityTriggerProps<T extends object> {
  cols: TableColumn<T>[];
  hiddenColumns: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  labels?: ColumnVisibilityLabels;
}

export function ColumnVisibilityTrigger<T extends object>(
  props: ColumnVisibilityTriggerProps<T>,
) {
  const { cols, hiddenColumns, onChange, disabled, labels: labelsProp } = props;
  const labels = { ...DEFAULT_VISIBILITY_LABELS, ...labelsProp };
  const [open, setOpen] = useState(false);

  // Hideable cols are the only ones the user can toggle. `hideable`
  // defaults to `true` — a column is hideable unless explicitly opted
  // out with `hideable: false` (structurally required column).
  const hideableCols = cols.filter((c) => c.hideable !== false);

  const toggle = (field: string) => {
    onChange(
      hiddenColumns.includes(field)
        ? hiddenColumns.filter((f) => f !== field)
        : [...hiddenColumns, field],
    );
  };

  const showAll = () => onChange([]);
  const hideAll = () => onChange(hideableCols.map((c) => c.field as string));

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      content={
        <div className="flex flex-col gap-2 min-w-[220px]">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
              {labels.columnsTitle}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={showAll}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
              >
                {labels.columnsShowAll}
              </button>
              <span className="text-neutral-300" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={hideAll}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
              >
                {labels.columnsHideAll}
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-0.5 max-h-72 overflow-auto">
            {hideableCols.map((col) => {
              const field = col.field as string;
              const hidden = hiddenColumns.includes(field);
              const header =
                typeof col.header === 'function' ? col.header() : col.header;
              return (
                <li key={field}>
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded hover:bg-neutral-100">
                    <input
                      type="checkbox"
                      checked={!hidden}
                      onChange={() => toggle(field)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-neutral-900">{header}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      }
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
          'text-sm text-neutral-700 hover:text-neutral-900',
          'border border-neutral-300 bg-neutral-50 hover:bg-neutral-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'transition-colors motion-reduce:transition-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <ColumnsIcon />
        <span>{labels.columnsButton}</span>
      </button>
    </Popover>
  );
}

// ───── Icon ─────

function ColumnsIcon(): ReactNode {
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
      <rect x="2" y="3" width="3.5" height="10" rx="0.5" />
      <rect x="6.25" y="3" width="3.5" height="10" rx="0.5" />
      <rect x="10.5" y="3" width="3.5" height="10" rx="0.5" />
    </svg>
  );
}
