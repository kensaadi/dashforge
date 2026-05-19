import { useMemo } from 'react';
import { getNestedValue } from './getNestedValue.js';
import { stringifyForSearch } from './useTableSearch.js';
import type { TableFilterModel } from '../table.types.js';

/**
 * Filters `rows` by the per-column filter model. v1 only supports
 * the `contains` operator (text substring) — additional ops
 * (`equals`, `in`, `gte`, `lte`, `between`, `before`, `after`)
 * land in v1-bis once the filter UI surface for each shape is
 * fleshed out.
 *
 * AND semantics across columns: a row must match EVERY active
 * filter. Within a single filter, the op decides the predicate.
 */
export function useTableFilter<T extends object>(
  rows: T[],
  filterModel: TableFilterModel,
): T[] {
  return useMemo(() => {
    if (!filterModel || filterModel.length === 0) return rows;
    return rows.filter((row) =>
      filterModel.every((filter) => {
        const value = getNestedValue(row, filter.field);
        const stringValue = stringifyForSearch(value).toLowerCase();
        const needle = filter.value.trim().toLowerCase();
        if (!needle) return true; // empty filter == no-op
        switch (filter.op) {
          case 'contains':
            return stringValue.includes(needle);
          default:
            return true;
        }
      }),
    );
  }, [rows, filterModel]);
}
