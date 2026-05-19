import { useState, useEffect, type ReactNode } from 'react';
import { Dialog } from '../../Dialog/Dialog.js';
import { cn } from '../../../utils/cn.js';
import type { TableColumn } from '../../Table/table.types.js';

/**
 * Column visibility dialog for DataGrid.
 *
 * Renders a toolbar button (the trigger) that opens a `<Dialog>` with
 * one checkbox per `hideable` column. The consumer can:
 *  - Show/hide individual columns
 *  - "Show all" / "Hide all" shortcuts
 *  - Persist visibility via the controllable `hiddenColumns` model
 *
 * Columns with `hideable: false` are NEVER shown in the dialog —
 * those are considered structurally required (e.g. an ID column).
 *
 * RBAC-hidden columns (`access.onUnauthorized === 'hide'`) are also
 * excluded — they're already removed from `visibleCols` upstream.
 */

export interface ColumnVisibilityLabels {
  columnsButton?: string;
  columnsTitle?: string;
  columnsDescription?: string;
  columnsShowAll?: string;
  columnsHideAll?: string;
  columnsDone?: string;
}

const DEFAULT_VISIBILITY_LABELS: Required<ColumnVisibilityLabels> = {
  columnsButton: 'Columns',
  columnsTitle: 'Manage columns',
  columnsDescription: 'Show or hide columns. Required columns cannot be toggled.',
  columnsShowAll: 'Show all',
  columnsHideAll: 'Hide all',
  columnsDone: 'Done',
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={labels.columnsTitle}
        description={labels.columnsDescription}
        size="sm"
      >
        <ColumnVisibilityBody
          cols={hideableCols}
          hiddenColumns={hiddenColumns}
          onChange={onChange}
          onDone={() => setOpen(false)}
          labels={labels}
        />
      </Dialog>
    </>
  );
}

// ───── Dialog body ─────

function ColumnVisibilityBody<T extends object>(props: {
  cols: TableColumn<T>[];
  hiddenColumns: string[];
  onChange: (next: string[]) => void;
  onDone: () => void;
  labels: Required<ColumnVisibilityLabels>;
}) {
  const { cols, hiddenColumns, onChange, onDone, labels } = props;
  // Local draft so the user can stage changes; commit on Done.
  const [draft, setDraft] = useState<string[]>(hiddenColumns);

  // Re-sync when the dialog re-opens with a different external state.
  useEffect(() => {
    setDraft(hiddenColumns);
  }, [hiddenColumns]);

  const toggle = (field: string) => {
    setDraft((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const showAll = () => setDraft([]);
  const hideAll = () => setDraft(cols.map((c) => c.field as string));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={showAll}
          className="text-xs text-neutral-600 hover:text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
        >
          {labels.columnsShowAll}
        </button>
        <span className="text-neutral-300">·</span>
        <button
          type="button"
          onClick={hideAll}
          className="text-xs text-neutral-600 hover:text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
        >
          {labels.columnsHideAll}
        </button>
      </div>
      <ul className="flex flex-col gap-1.5 max-h-72 overflow-auto">
        {cols.map((col) => {
          const field = col.field as string;
          const hidden = draft.includes(field);
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
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => {
            onChange(draft);
            onDone();
          }}
          className="text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 px-3 py-1.5"
        >
          {labels.columnsDone}
        </button>
      </div>
    </div>
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
