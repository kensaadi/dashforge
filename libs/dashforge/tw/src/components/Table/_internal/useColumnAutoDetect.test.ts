// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useColumnAutoDetect,
  resolveAlign,
  resolveMonospace,
  resolveTabularNums,
} from './useColumnAutoDetect.js';
import type { TableColumn } from '../table.types.js';

interface Row {
  name: string;
  age: number;
  active: boolean;
  joinedAt: Date;
  isoDate: string;
  meta: { count: number };
  unknownField?: never;
}

const cols: TableColumn<Row>[] = [
  { field: 'name',     header: 'Name' },
  { field: 'age',      header: 'Age' },
  { field: 'active',   header: 'Active' },
  { field: 'joinedAt' as never, header: 'JoinedAt' },
  { field: 'isoDate' as never,  header: 'ISO Date' },
  { field: 'meta.count' as never, header: 'Count' },
  { field: 'unknownField' as never, header: 'Unknown' },
];

const rows: Row[] = [
  {
    name: 'Jane', age: 30, active: true,
    joinedAt: new Date('2024-01-15'),
    isoDate: '2024-01-15T00:00:00Z',
    meta: { count: 5 },
  },
];

describe('useColumnAutoDetect', () => {
  it('infers number / boolean / string / date / nested-number', () => {
    const { result } = renderHook(() => useColumnAutoDetect(rows, cols));
    expect(result.current.get('name')).toBe('string');
    expect(result.current.get('age')).toBe('number');
    expect(result.current.get('active')).toBe('boolean');
    expect(result.current.get('joinedAt')).toBe('date');
    expect(result.current.get('isoDate')).toBe('date');
    expect(result.current.get('meta.count')).toBe('number');
    expect(result.current.get('unknownField')).toBe('unknown');
  });

  it('returns unknown for empty rows array', () => {
    const { result } = renderHook(() => useColumnAutoDetect([], cols));
    for (const col of cols) {
      expect(result.current.get(col.field as string)).toBe('unknown');
    }
  });

  it('skips null values to find the first non-null sample', () => {
    const colsAge: TableColumn<{ age: number | null }>[] = [{ field: 'age', header: 'Age' }];
    const sparseRows = [{ age: null }, { age: null }, { age: 42 }];
    const { result } = renderHook(() => useColumnAutoDetect(sparseRows, colsAge));
    expect(result.current.get('age')).toBe('number');
  });
});

describe('resolveAlign', () => {
  it('explicit align wins', () => {
    expect(resolveAlign({ align: 'center' }, 'number')).toBe('center');
  });
  it('number → right', () => {
    expect(resolveAlign({}, 'number')).toBe('right');
  });
  it('boolean → center', () => {
    expect(resolveAlign({}, 'boolean')).toBe('center');
  });
  it('string → left (default)', () => {
    expect(resolveAlign({}, 'string')).toBe('left');
  });
  it('date → left', () => {
    expect(resolveAlign({}, 'date')).toBe('left');
  });
  it('unknown → left', () => {
    expect(resolveAlign({}, 'unknown')).toBe('left');
  });
});

describe('resolveMonospace', () => {
  // Library MUST NOT auto-pick a font family — it would override
  // the consumer's theme font. Only explicit opt-in turns it on.
  it('explicit monospace=true wins', () => {
    expect(resolveMonospace({ monospace: true })).toBe(true);
  });
  it('explicit monospace=false → false', () => {
    expect(resolveMonospace({ monospace: false })).toBe(false);
  });
  it('omitted → false (never auto-applies)', () => {
    expect(resolveMonospace({})).toBe(false);
  });
});

describe('resolveTabularNums', () => {
  // tabular-nums is a font-feature-setting (digit alignment) — does
  // NOT change the font family. Safe to auto-apply for number/date.
  it('explicit tabularNums=true wins', () => {
    expect(resolveTabularNums({ tabularNums: true }, 'string')).toBe(true);
  });
  it('explicit tabularNums=false wins (opt-out)', () => {
    expect(resolveTabularNums({ tabularNums: false }, 'number')).toBe(false);
  });
  it('number → true (auto)', () => {
    expect(resolveTabularNums({}, 'number')).toBe(true);
  });
  it('date → true (auto, ISO digits align)', () => {
    expect(resolveTabularNums({}, 'date')).toBe(true);
  });
  it('string / boolean / unknown → false', () => {
    expect(resolveTabularNums({}, 'string')).toBe(false);
    expect(resolveTabularNums({}, 'boolean')).toBe(false);
    expect(resolveTabularNums({}, 'unknown')).toBe(false);
  });
});
