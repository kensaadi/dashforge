// @vitest-environment jsdom
/**
 * Performance guardrails for `<DataGrid>` (virtualized).
 *
 * The whole point of DataGrid is O(window) rendering: mounting 10k or
 * 100k rows must cost roughly the same as mounting a few hundred,
 * because only the visible window (+ overscan + 2 spacer `<tr>`) is
 * ever in the DOM. These tests pin that invariant — a regression that
 * accidentally mounts the full dataset (e.g. a broken `renderedRows`
 * slice) blows the DOM-node-count assertion immediately.
 *
 * Budgets are deliberately generous — order-of-magnitude regressions,
 * not micro-jitter.
 */
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from './DataGrid.js';
import type { TableColumn } from '../Table/table.types.js';

void React;
afterEach(() => cleanup());

beforeAll(() => {
  // jsdom ships neither ResizeObserver nor IntersectionObserver — the
  // virtualizer + Radix popovers need them.
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
  }
});

interface Row {
  id: string;
  name: string;
  email: string;
  age: number;
}

const COLS: TableColumn<Row>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email' },
  { field: 'age', header: 'Age', sortable: true },
];

function makeRows(n: number): Row[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: `r${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
  }));
}

describe('<DataGrid> virtualization performance', () => {
  it('mounts 10 000 rows under 500ms (render cost is O(window))', () => {
    const rows = makeRows(10_000);
    const t0 = performance.now();
    render(
      <DataGrid
        rows={rows}
        cols={COLS}
        getRowId={(r) => r.id}
        rowHeight={40}
        height="400px"
      />,
    );
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(500);
  });

  it('mounts only the visible window in the DOM, NOT the full dataset', () => {
    const rows = makeRows(10_000);
    const { container } = render(
      <DataGrid
        rows={rows}
        cols={COLS}
        getRowId={(r) => r.id}
        rowHeight={40}
        height="400px"
      />,
    );
    // Virtualized: visible window + overscan + up to 2 spacer rows —
    // a few dozen `<tr>`, far below the 10 000 total.
    const trCount = container.querySelectorAll('tbody tr').length;
    expect(trCount).toBeGreaterThan(0);
    expect(trCount).toBeLessThan(100);
  });

  it('mounts 100 000 rows within the same generous budget (virtualized)', () => {
    const rows = makeRows(100_000);
    const t0 = performance.now();
    const { container } = render(
      <DataGrid
        rows={rows}
        cols={COLS}
        getRowId={(r) => r.id}
        rowHeight={40}
        height="400px"
      />,
    );
    const t1 = performance.now();
    // 10× the rows — the RENDER stays windowed, so the cost must not
    // scale with the dataset. Generous absolute bound (not a ratio,
    // to stay non-flaky under CI jitter).
    expect(t1 - t0).toBeLessThan(800);
    // And the DOM still holds only the window.
    expect(container.querySelectorAll('tbody tr').length).toBeLessThan(100);
  });
});
