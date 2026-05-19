import { useMemo } from 'react';
import { getNestedValue } from './getNestedValue.js';
import type { TableColumn } from '../../Table/table.types.js';

/**
 * Stringify any value into a search-comparable form. Handles all
 * the edge cases that bit the MUI-side Table:
 *
 *   - `null` / `undefined`      → `''`
 *   - `string`                  → as-is
 *   - `number` / `bigint`       → `String(value)`
 *   - `boolean`                 → `'true'` / `'false'`
 *   - `Date`                    → ISO 8601
 *   - `Array` / object          → `JSON.stringify` (best effort)
 */
export function stringifyForSearch(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    try {
      return value.map(stringifyForSearch).join(' ');
    } catch {
      return '';
    }
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

/**
 * Filters `rows` by `query` against the columns flagged
 * `searchable: true`. Empty / whitespace-only query is a no-op
 * (returns the original rows).
 *
 * Case-insensitive substring match. The caller is responsible for
 * debouncing the input (use `useDebouncedValue`).
 */
export function useTableSearch<T extends object>(
  rows: T[],
  cols: TableColumn<T>[],
  query: string,
): T[] {
  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return rows;
    const needle = trimmed.toLowerCase();
    const searchableCols = cols.filter((c) => c.searchable);
    if (searchableCols.length === 0) return rows;
    return rows.filter((row) =>
      searchableCols.some((col) =>
        stringifyForSearch(getNestedValue(row, col.field as string))
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [rows, cols, query]);
}
