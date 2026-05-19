import { useState, type ReactNode } from 'react';
import { Popover } from '../../Popover/Popover.js';
import { cn } from '../../../utils/cn.js';
import type {
  TableFilterItem,
  TableFilterModel,
  TableFilterType,
} from '../../Table/table.types.js';

/**
 * Per-column filter UI for DataGrid.
 *
 * `<ColumnFilterTrigger>` renders the filter icon button in the
 * column header — when clicked, opens a Popover with the
 * appropriate filter UI for the column type:
 *
 *  - `text` → `<TextFilter>` with single input (op: `contains`)
 *  - `number` → `<NumberRangeFilter>` with min/max inputs (op: `between`)
 *  - `boolean` → `<BooleanFilter>` with true/false/all radio (op: `equals`)
 *  - `date` → `<DateRangeFilter>` with min/max date inputs (op: `between`)
 *
 * Each filter UI has Apply + Clear actions; Apply commits the
 * filter to the model, Clear removes any existing filter for that
 * column.
 */

// ───── Helper: read/write filter model for a single column ─────

function findFilter(model: TableFilterModel, field: string): TableFilterItem | undefined {
  return model.find((f) => f.field === field);
}

function setFilter(
  model: TableFilterModel,
  field: string,
  next: TableFilterItem | null,
): TableFilterModel {
  const rest = model.filter((f) => f.field !== field);
  if (next == null) return rest;
  return [...rest, next];
}

// ───── Filter labels (i18n) ─────

export interface ColumnFilterLabels {
  filterColumn?: string;
  filterApply?: string;
  filterClear?: string;
  filterMin?: string;
  filterMax?: string;
  filterFrom?: string;
  filterTo?: string;
  filterAll?: string;
  filterTrue?: string;
  filterFalse?: string;
}

const DEFAULT_FILTER_LABELS: Required<ColumnFilterLabels> = {
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
};

// ───── Trigger (icon button in column header) ─────

export interface ColumnFilterTriggerProps {
  field: string;
  filterType: TableFilterType;
  filterModel: TableFilterModel;
  onFilterChange: (model: TableFilterModel) => void;
  disabled?: boolean;
  labels?: ColumnFilterLabels;
}

export function ColumnFilterTrigger(props: ColumnFilterTriggerProps) {
  const {
    field,
    filterType,
    filterModel,
    onFilterChange,
    disabled,
    labels: labelsProp,
  } = props;
  const labels = { ...DEFAULT_FILTER_LABELS, ...labelsProp };
  const [open, setOpen] = useState(false);
  const active = findFilter(filterModel, field) != null;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      content={
        <FilterPanel
          field={field}
          filterType={filterType}
          filterModel={filterModel}
          onFilterChange={(next) => {
            onFilterChange(next);
            setOpen(false);
          }}
          labels={labels}
        />
      }
    >
      <button
        type="button"
        aria-label={labels.filterColumn}
        aria-pressed={active}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center h-6 w-6 rounded',
          'text-neutral-500 hover:text-neutral-900',
          active && 'text-primary-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'transition-colors motion-reduce:transition-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <FilterIcon />
      </button>
    </Popover>
  );
}

// ───── Panel — dispatches to the right filter UI ─────

function FilterPanel(props: {
  field: string;
  filterType: TableFilterType;
  filterModel: TableFilterModel;
  onFilterChange: (model: TableFilterModel) => void;
  labels: Required<ColumnFilterLabels>;
}) {
  const { field, filterType, filterModel, onFilterChange, labels } = props;
  const current = findFilter(filterModel, field);

  const commit = (next: TableFilterItem | null) => {
    onFilterChange(setFilter(filterModel, field, next));
  };

  switch (filterType) {
    case 'number':
      return <NumberRangeFilter field={field} current={current} onCommit={commit} labels={labels} />;
    case 'boolean':
      return <BooleanFilter field={field} current={current} onCommit={commit} labels={labels} />;
    case 'date':
      return <DateRangeFilter field={field} current={current} onCommit={commit} labels={labels} />;
    case 'text':
    default:
      return <TextFilter field={field} current={current} onCommit={commit} labels={labels} />;
  }
}

// ───── Text filter ─────

function TextFilter(props: {
  field: string;
  current: TableFilterItem | undefined;
  onCommit: (next: TableFilterItem | null) => void;
  labels: Required<ColumnFilterLabels>;
}) {
  const { field, current, onCommit, labels } = props;
  const [value, setValue] = useState<string>(
    typeof current?.value === 'string' ? current.value : '',
  );

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="…"
        autoFocus
        className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      />
      <FilterActions
        onApply={() => onCommit(value.trim() ? { field, op: 'contains', value } : null)}
        onClear={() => {
          setValue('');
          onCommit(null);
        }}
        labels={labels}
      />
    </div>
  );
}

// ───── Number range filter ─────

function NumberRangeFilter(props: {
  field: string;
  current: TableFilterItem | undefined;
  onCommit: (next: TableFilterItem | null) => void;
  labels: Required<ColumnFilterLabels>;
}) {
  const { field, current, onCommit, labels } = props;
  const currentValue = current?.value;
  const currentTuple: [unknown, unknown] = Array.isArray(currentValue)
    ? (currentValue as [unknown, unknown])
    : [null, null];
  const [min, setMin] = useState<string>(
    currentTuple[0] != null ? String(currentTuple[0]) : '',
  );
  const [max, setMax] = useState<string>(
    currentTuple[1] != null ? String(currentTuple[1]) : '',
  );

  const apply = () => {
    const minN = min.trim() ? Number(min) : null;
    const maxN = max.trim() ? Number(max) : null;
    if ((minN == null || Number.isFinite(minN)) && (maxN == null || Number.isFinite(maxN))) {
      if (minN == null && maxN == null) {
        onCommit(null);
      } else {
        onCommit({ field, op: 'between', value: [minN, maxN] });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-700">
          <span>{labels.filterMin}</span>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            autoFocus
            className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-700">
          <span>{labels.filterMax}</span>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
      </div>
      <FilterActions
        onApply={apply}
        onClear={() => {
          setMin('');
          setMax('');
          onCommit(null);
        }}
        labels={labels}
      />
    </div>
  );
}

// ───── Boolean filter ─────

function BooleanFilter(props: {
  field: string;
  current: TableFilterItem | undefined;
  onCommit: (next: TableFilterItem | null) => void;
  labels: Required<ColumnFilterLabels>;
}) {
  const { field, current, onCommit, labels } = props;
  const initial: 'all' | 'true' | 'false' =
    current?.value === true ? 'true' : current?.value === false ? 'false' : 'all';
  const [value, setValue] = useState(initial);

  const apply = () => {
    if (value === 'all') onCommit(null);
    else onCommit({ field, op: 'equals', value: value === 'true' });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <fieldset className="flex flex-col gap-1">
        {(['all', 'true', 'false'] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={`filter-${field}`}
              value={opt}
              checked={value === opt}
              onChange={() => setValue(opt)}
              className="cursor-pointer"
            />
            <span>
              {opt === 'all'
                ? labels.filterAll
                : opt === 'true'
                  ? labels.filterTrue
                  : labels.filterFalse}
            </span>
          </label>
        ))}
      </fieldset>
      <FilterActions
        onApply={apply}
        onClear={() => {
          setValue('all');
          onCommit(null);
        }}
        labels={labels}
      />
    </div>
  );
}

// ───── Date range filter ─────

function DateRangeFilter(props: {
  field: string;
  current: TableFilterItem | undefined;
  onCommit: (next: TableFilterItem | null) => void;
  labels: Required<ColumnFilterLabels>;
}) {
  const { field, current, onCommit, labels } = props;
  const currentValue = current?.value;
  const currentTuple: [unknown, unknown] = Array.isArray(currentValue)
    ? (currentValue as [unknown, unknown])
    : [null, null];
  const [from, setFrom] = useState<string>(
    typeof currentTuple[0] === 'string' ? currentTuple[0] : '',
  );
  const [to, setTo] = useState<string>(
    typeof currentTuple[1] === 'string' ? currentTuple[1] : '',
  );

  const apply = () => {
    if (!from && !to) {
      onCommit(null);
    } else {
      onCommit({
        field,
        op: 'between',
        value: [from || null, to || null],
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-700">
          <span>{labels.filterFrom}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            autoFocus
            className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-700">
          <span>{labels.filterTo}</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
      </div>
      <FilterActions
        onApply={apply}
        onClear={() => {
          setFrom('');
          setTo('');
          onCommit(null);
        }}
        labels={labels}
      />
    </div>
  );
}

// ───── Apply + Clear actions ─────

function FilterActions(props: {
  onApply: () => void;
  onClear: () => void;
  labels: Required<ColumnFilterLabels>;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1 border-t border-neutral-200">
      <button
        type="button"
        onClick={props.onClear}
        className="text-xs text-neutral-600 hover:text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline px-2 py-1"
      >
        {props.labels.filterClear}
      </button>
      <button
        type="button"
        onClick={props.onApply}
        className="text-xs bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 px-3 py-1"
      >
        {props.labels.filterApply}
      </button>
    </div>
  );
}

// ───── Icon ─────

function FilterIcon(): ReactNode {
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
      <path d="M2 3h12M4 8h8M6 13h4" />
    </svg>
  );
}
