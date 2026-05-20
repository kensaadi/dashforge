// @vitest-environment jsdom
/**
 * Performance guardrails for `<Table>` (non-virtualized).
 *
 * Table renders EVERY row in the DOM — its design ceiling is ~500
 * rows (past that, the consumer should switch to `<DataGrid>`). These
 * tests pin the mount cost at that ceiling so a regression in the
 * render path (e.g. an accidental O(n²) in the sort / search pipeline)
 * surfaces in CI.
 *
 * Budgets are deliberately generous — they catch order-of-magnitude
 * regressions under a cold workspace-wide test run, not micro-jitter.
 */
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Table } from './Table.js';
import type { TableColumn } from './table.types.js';

void React;
afterEach(() => cleanup());

interface Row {
  id: string;
  name: string;
  email: string;
  age: number;
  city: string;
}

const COLS: TableColumn<Row>[] = [
  { field: 'name', header: 'Name', sortable: true, searchable: true },
  { field: 'email', header: 'Email', searchable: true },
  { field: 'age', header: 'Age', sortable: true },
  { field: 'city', header: 'City' },
];

function makeRows(n: number): Row[] {
  const cities = ['Roma', 'Milano', 'Berlin'];
  return Array.from({ length: n }).map((_, i) => ({
    id: `r${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
    city: cities[i % 3] as string,
  }));
}

describe('<Table> performance', () => {
  it("mounts 500 rows (Table's row-count ceiling) under 800ms", () => {
    const rows = makeRows(500);
    const t0 = performance.now();
    render(<Table rows={rows} cols={COLS} getRowId={(r) => r.id} />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(800);
  });

  it('renders every row in the DOM (non-virtualized contract)', () => {
    const rows = makeRows(500);
    const { container } = render(
      <Table rows={rows} cols={COLS} getRowId={(r) => r.id} />,
    );
    // Non-virtualized: all 500 data rows are mounted.
    expect(container.querySelectorAll('tbody tr').length).toBe(500);
  });

  it('applies a default sort over 500 rows within the mount budget', () => {
    const rows = makeRows(500);
    const t0 = performance.now();
    render(
      <Table
        rows={rows}
        cols={COLS}
        getRowId={(r) => r.id}
        defaultSortModel={[{ field: 'name', direction: 'asc' }]}
      />,
    );
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(800);
  });
});
