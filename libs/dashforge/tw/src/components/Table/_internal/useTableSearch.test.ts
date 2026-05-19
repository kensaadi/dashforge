// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTableSearch, stringifyForSearch } from './useTableSearch.js';
import type { TableColumn } from '../table.types.js';

interface User {
  name: string;
  email: string;
  age: number;
  active: boolean;
  joinedAt: Date;
  meta: { city: string };
}

const cols: TableColumn<User>[] = [
  { field: 'name',  header: 'Name',  searchable: true },
  { field: 'email', header: 'Email', searchable: true },
  { field: 'age',   header: 'Age',   searchable: true },
  { field: 'active', header: 'Active', searchable: true },
  { field: 'joinedAt' as never, header: 'Joined', searchable: true },
  { field: 'meta.city' as never, header: 'City', searchable: true },
];

const rows: User[] = [
  {
    name: 'Jane', email: 'jane@example.com', age: 30, active: true,
    joinedAt: new Date('2024-01-15'), meta: { city: 'Roma' },
  },
  {
    name: 'Bob',  email: 'bob@example.org',  age: 45, active: false,
    joinedAt: new Date('2023-06-20'), meta: { city: 'Milano' },
  },
];

describe('stringifyForSearch', () => {
  it('handles null/undefined', () => {
    expect(stringifyForSearch(null)).toBe('');
    expect(stringifyForSearch(undefined)).toBe('');
  });
  it('returns strings as-is', () => {
    expect(stringifyForSearch('hello')).toBe('hello');
  });
  it('stringifies numbers', () => {
    expect(stringifyForSearch(42)).toBe('42');
  });
  it('stringifies booleans', () => {
    expect(stringifyForSearch(true)).toBe('true');
    expect(stringifyForSearch(false)).toBe('false');
  });
  it('stringifies Date as ISO', () => {
    expect(stringifyForSearch(new Date('2024-01-15T00:00:00.000Z'))).toBe(
      '2024-01-15T00:00:00.000Z',
    );
  });
  it('stringifies objects via JSON.stringify', () => {
    expect(stringifyForSearch({ a: 1 })).toBe('{"a":1}');
  });
  it('stringifies arrays via join-space of stringified elements', () => {
    expect(stringifyForSearch(['a', 'b', 1])).toBe('a b 1');
  });
});

describe('useTableSearch', () => {
  it('returns all rows when query is empty', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, ''));
    expect(result.current).toHaveLength(2);
  });

  it('returns all rows when query is only whitespace', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, '   '));
    expect(result.current).toHaveLength(2);
  });

  it('filters by string match (case-insensitive)', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, 'jane'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.name).toBe('Jane');
  });

  it('filters by number coerced to string', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, '45'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.age).toBe(45);
  });

  it('filters by boolean', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, 'false'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.active).toBe(false);
  });

  it('filters by Date (ISO substring)', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, '2024-01'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.name).toBe('Jane');
  });

  it('filters by NESTED key', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, 'roma'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.name).toBe('Jane');
  });

  it('returns empty when nothing matches', () => {
    const { result } = renderHook(() => useTableSearch(rows, cols, 'xxxxxxx'));
    expect(result.current).toHaveLength(0);
  });

  it('returns all rows if no column is searchable', () => {
    const noneSearchable: TableColumn<User>[] = cols.map((c) => ({ ...c, searchable: false }));
    const { result } = renderHook(() => useTableSearch(rows, noneSearchable, 'jane'));
    expect(result.current).toHaveLength(2);
  });
});
