import { useMemo } from 'react';
import { getNestedValue } from './getNestedValue.js';
import type { TableColumn, TableColumnInferredType } from '../table.types.js';

/**
 * Auto-detects the primitive type of each column by scanning the
 * first non-null value across the supplied rows. Drives smart
 * defaults for `align` and `monospace` on the cell render path.
 *
 * Scans only the first N rows (default 50) for performance — if the
 * dataset's first 50 rows are unrepresentative, the consumer can
 * override per-column via explicit `align` / `monospace` props.
 *
 * Returns `Map<columnField, inferredType>`.
 */
export function useColumnAutoDetect<T extends object>(
  rows: T[],
  cols: TableColumn<T>[],
  sampleSize = 50,
): Map<string, TableColumnInferredType> {
  return useMemo(() => {
    const result = new Map<string, TableColumnInferredType>();
    const sample = rows.slice(0, sampleSize);
    for (const col of cols) {
      const field = col.field as string;
      let inferred: TableColumnInferredType = 'unknown';
      for (const row of sample) {
        const value = getNestedValue(row, field);
        if (value == null) continue;
        inferred = inferType(value);
        break; // first non-null wins
      }
      result.set(field, inferred);
    }
    return result;
  }, [rows, cols, sampleSize]);
}

function inferType(value: unknown): TableColumnInferredType {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    // Heuristic: ISO date string (YYYY-MM-DD[T...]) → 'date'
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    return 'string';
  }
  return 'unknown';
}

/**
 * Resolves the effective `align` for a column, honoring explicit
 * `col.align` first and falling back to the inferred type.
 */
export function resolveAlign(
  col: { align?: 'left' | 'right' | 'center' },
  inferred: TableColumnInferredType | undefined,
): 'left' | 'right' | 'center' {
  if (col.align) return col.align;
  switch (inferred) {
    case 'number':
      return 'right';
    case 'boolean':
      return 'center';
    default:
      return 'left';
  }
}

/**
 * Resolves the effective `tabularNums` flag for a column.
 *
 * `tabular-nums` is a `font-variant-numeric` rule that makes every
 * digit occupy the same width — it does NOT change the font family.
 * Auto-applied for `number` and `date` columns so currency values
 * and ISO dates align cleanly. Explicit `col.tabularNums` wins.
 */
export function resolveTabularNums(
  col: { tabularNums?: boolean },
  inferred: TableColumnInferredType | undefined,
): boolean {
  if (col.tabularNums !== undefined) return col.tabularNums;
  return inferred === 'number' || inferred === 'date';
}

/**
 * Resolves the effective `monospace` flag for a column.
 *
 * `font-mono` changes the font FAMILY to a monospace stack, which
 * would override the consumer's theme `font-sans`. The library
 * never auto-applies it — only an explicit `col.monospace: true`
 * opts in. Consumers wanting a custom mono stack configure it
 * through Tailwind's `theme.extend.fontFamily.mono` in their own
 * preset (the dashforgePreset does not own the `fontFamily` axis).
 */
export function resolveMonospace(
  col: { monospace?: boolean },
): boolean {
  return col.monospace === true;
}
