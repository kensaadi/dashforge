// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTableSort, cycleSortFor } from './useTableSort.js';
import type { TableColumn, TableSortModel } from '../table.types.js';

interface Row {
  id: string;
  name: string;
  age: number | null;
  joinedAt: Date | null;
}

const cols: TableColumn<Row>[] = [
  { field: 'name',     header: 'Name',     sortable: true },
  { field: 'age',      header: 'Age',      sortable: true },
  { field: 'joinedAt' as never, header: 'Joined', sortable: true },
];

const rows: Row[] = [
  { id: '1', name: 'Charlie', age: 30,   joinedAt: new Date('2024-01-15') },
  { id: '2', name: 'Alice',   age: 25,   joinedAt: new Date('2024-03-01') },
  { id: '3', name: 'Bob',     age: null, joinedAt: null },
  { id: '4', name: 'alice',   age: 40,   joinedAt: new Date('2024-02-10') },
];

describe('useTableSort', () => {
  it('returns rows untouched when sortModel is empty', () => {
    const { result } = renderHook(() => useTableSort(rows, cols, []));
    expect(result.current.map((r) => r.id)).toEqual(['1', '2', '3', '4']);
  });

  it('sorts strings asc (case-insensitive)', () => {
    const sortModel: TableSortModel = [{ field: 'name', direction: 'asc' }];
    const { result } = renderHook(() => useTableSort(rows, cols, sortModel));
    // alice < Alice < Bob < Charlie (case-insensitive)
    expect(result.current.map((r) => r.name.toLowerCase())).toEqual([
      'alice', 'alice', 'bob', 'charlie',
    ]);
  });

  it('sorts numbers desc', () => {
    const sortModel: TableSortModel = [{ field: 'age', direction: 'desc' }];
    const { result } = renderHook(() => useTableSort(rows, cols, sortModel));
    // 40, 30, 25, null-last
    expect(result.current.map((r) => r.age)).toEqual([40, 30, 25, null]);
  });

  it('places null values LAST regardless of direction (asc)', () => {
    const sortModel: TableSortModel = [{ field: 'age', direction: 'asc' }];
    const { result } = renderHook(() => useTableSort(rows, cols, sortModel));
    // 25, 30, 40, null-last
    expect(result.current.map((r) => r.age)).toEqual([25, 30, 40, null]);
  });

  it('sorts Date asc (epoch ms order)', () => {
    const sortModel: TableSortModel = [{ field: 'joinedAt', direction: 'asc' }];
    const { result } = renderHook(() => useTableSort(rows, cols, sortModel));
    // 2024-01-15 → 2024-02-10 → 2024-03-01 → null-last
    expect(result.current.map((r) => r.id)).toEqual(['1', '4', '2', '3']);
  });

  it('supports custom comparator', () => {
    const colsCustom: TableColumn<Row>[] = [
      // Sort by length of name ascending
      { field: 'name', header: 'Name', sortable: (a, b) => a.name.length - b.name.length },
    ];
    const sortModel: TableSortModel = [{ field: 'name', direction: 'asc' }];
    const { result } = renderHook(() => useTableSort(rows, colsCustom, sortModel));
    expect(result.current.map((r) => r.name)).toEqual(['Bob', 'Alice', 'alice', 'Charlie']);
  });

  it('falls back to next sort item on tie (multi-column sort)', () => {
    const sortModel: TableSortModel = [
      { field: 'name', direction: 'asc' },  // 'alice', 'Alice' tie
      { field: 'age',  direction: 'asc' },  // then 25 before 40
    ];
    const { result } = renderHook(() => useTableSort(rows, cols, sortModel));
    // 'alice' and 'Alice' tie on name → 25 before 40 → so id=2 before id=4
    expect(result.current.slice(0, 2).map((r) => r.id)).toEqual(['2', '4']);
  });

  it('ignores sort items for non-sortable columns', () => {
    const colsNotSortable: TableColumn<Row>[] = cols.map((c) => ({ ...c, sortable: false }));
    const sortModel: TableSortModel = [{ field: 'name', direction: 'asc' }];
    const { result } = renderHook(() => useTableSort(rows, colsNotSortable, sortModel));
    // Original order preserved
    expect(result.current.map((r) => r.id)).toEqual(['1', '2', '3', '4']);
  });
});

describe('cycleSortFor', () => {
  it('none → asc on first click', () => {
    expect(cycleSortFor([], 'name', false)).toEqual([{ field: 'name', direction: 'asc' }]);
  });

  it('asc → desc on second click', () => {
    expect(cycleSortFor([{ field: 'name', direction: 'asc' }], 'name', false)).toEqual([
      { field: 'name', direction: 'desc' },
    ]);
  });

  it('desc → none (empty) on third click', () => {
    expect(cycleSortFor([{ field: 'name', direction: 'desc' }], 'name', false)).toEqual([]);
  });

  it('single-click on different column REPLACES sort', () => {
    expect(
      cycleSortFor([{ field: 'name', direction: 'asc' }], 'age', false),
    ).toEqual([{ field: 'age', direction: 'asc' }]);
  });

  it('shift-click on different column APPENDS (multi-sort)', () => {
    expect(
      cycleSortFor([{ field: 'name', direction: 'asc' }], 'age', true),
    ).toEqual([
      { field: 'name', direction: 'asc' },
      { field: 'age', direction: 'asc' },
    ]);
  });

  it('shift-click on existing column cycles its direction', () => {
    expect(
      cycleSortFor(
        [
          { field: 'name', direction: 'asc' },
          { field: 'age', direction: 'asc' },
        ],
        'age',
        true,
      ),
    ).toEqual([
      { field: 'name', direction: 'asc' },
      { field: 'age', direction: 'desc' },
    ]);
  });

  it('shift-click on desc column REMOVES it (preserving rest)', () => {
    expect(
      cycleSortFor(
        [
          { field: 'name', direction: 'asc' },
          { field: 'age', direction: 'desc' },
        ],
        'age',
        true,
      ),
    ).toEqual([{ field: 'name', direction: 'asc' }]);
  });
});
