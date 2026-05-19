// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DataGrid } from './DataGrid.js';
import type { TableColumn } from '../Table/table.types.js';

void React;
afterEach(() => cleanup());

// jsdom doesn't implement ResizeObserver / IntersectionObserver —
// virtualizer + Radix Popover (used via shared cells lib) need them.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  // jsdom returns 0 for clientHeight by default; the virtualizer
  // uses initialViewportHeight=400 in the absence of a real measurement.
});

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'pending';
  meta: { city: string };
}

const baseCols: TableColumn<User>[] = [
  { field: 'name',  header: 'Name',  sortable: true, searchable: true },
  { field: 'email', header: 'Email', searchable: true },
  { field: 'age',   header: 'Age',   sortable: true },
  { field: 'meta.city' as never, header: 'City' },
];

function generateUsers(count: number): User[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `u${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
    status: i % 2 === 0 ? ('active' as const) : ('pending' as const),
    meta: { city: ['Roma', 'Milano', 'Berlin'][i % 3] as string },
  }));
}

const getRowId = (row: User) => row.id;

describe('DataGrid — rendering', () => {
  it('renders a <table> element', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(50)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('renders column headers', () => {
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(screen.queryByText('Name')).not.toBeNull();
    expect(screen.queryByText('Email')).not.toBeNull();
    expect(screen.queryByText('Age')).not.toBeNull();
  });

  it('renders only a window of rows (virtualized)', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(1000)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // Visible window with 400px height + 48px rows = ~9 rows + overscan
    // (5 top + 5 bottom). Initial viewport height fallback = 400px.
    // So at scrollTop=0 we render rows 0 to ~13 (no top overscan needed).
    const dataRows = container.querySelectorAll('tbody tr[data-selected]');
    expect(dataRows.length).toBeLessThan(50);  // certainly not all 1000
    expect(dataRows.length).toBeGreaterThan(5); // at least the visible window
  });

  it('renders spacer rows above and below the visible window', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(1000)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // Spacer rows are <tr aria-hidden="true"> with inline height style.
    const spacers = container.querySelectorAll('tbody tr[aria-hidden="true"]');
    expect(spacers.length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when rows is empty', () => {
    render(
      <DataGrid
        rows={[]}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(screen.queryByText('No data')).not.toBeNull();
  });

  it('renders loading skeleton rows', () => {
    const { container } = render(
      <DataGrid
        rows={[]}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        loading
        loadingRowCount={6}
      />,
    );
    const busyRows = container.querySelectorAll('tr[aria-busy="true"]');
    expect(busyRows.length).toBe(6);
  });
});

describe('DataGrid — sort', () => {
  it('sortable header has aria-sort=none initially', () => {
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const header = screen.getByText('Name').closest('th');
    expect(header?.getAttribute('aria-sort')).toBe('none');
  });

  it('click sortable header → asc', () => {
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    fireEvent.click(screen.getByText('Name').closest('button')!);
    expect(screen.getByText('Name').closest('th')?.getAttribute('aria-sort')).toBe(
      'ascending',
    );
  });

  it('serverSideSort prevents local sort, emits onSortChange', () => {
    let lastModel: unknown = null;
    const rows = generateUsers(20);
    const { container } = render(
      <DataGrid
        rows={rows}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        serverSideSort
        onSortChange={(m) => (lastModel = m)}
      />,
    );
    const firstNameBeforeSort = container.querySelector('tbody tr[data-selected] td')?.textContent;
    fireEvent.click(screen.getByText('Name').closest('button')!);
    expect(lastModel).toEqual([{ field: 'name', direction: 'asc' }]);
    // Row order didn't change since server-side: still original order.
    const firstNameAfterSort = container.querySelector('tbody tr[data-selected] td')?.textContent;
    expect(firstNameAfterSort).toBe(firstNameBeforeSort);
  });
});

describe('DataGrid — search', () => {
  it('renders search input when enableSearch', () => {
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableSearch
      />,
    );
    expect(screen.getByPlaceholderText('Search...')).not.toBeNull();
  });

  it('filters rows by search query (client-side)', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableSearch
        searchDebounceMs={0}
      />,
    );
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'User 5' } });
    // Only rows with 'User 5' in name/email survive (User 5, User 15, ...)
    const rows = container.querySelectorAll('tbody tr[data-selected]');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(20);
  });

  it('serverSideSearch prevents local filter, emits onSearchQueryChange', () => {
    let lastQuery = '';
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableSearch
        searchDebounceMs={0}
        serverSideSearch
        onSearchQueryChange={(q) => (lastQuery = q)}
      />,
    );
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alice' } });
    expect(lastQuery).toBe('alice');
  });
});

describe('DataGrid — selection', () => {
  it('renders checkbox for each visible row when rowSelection=multiple', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
      />,
    );
    // 1 header + N row checkboxes (N = visible window).
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(2);
  });

  it('toggleRow updates selectedRowIds (controlled)', () => {
    let lastIds: string[] = [];
    const { container } = render(
      <DataGrid
        rows={generateUsers(10)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        selectedRowIds={[]}
        onSelectionChange={(ids) => (lastIds = ids)}
      />,
    );
    const firstRowCheckbox = container.querySelector(
      'tbody tr[data-selected] input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(firstRowCheckbox);
    expect(lastIds.length).toBe(1);
  });

  it('selectAllScope=allLoaded toggles every row in the sorted set', () => {
    let lastIds: string[] = [];
    const { container } = render(
      <DataGrid
        rows={generateUsers(50)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        selectAllScope="allLoaded"
        selectedRowIds={[]}
        onSelectionChange={(ids) => (lastIds = ids)}
      />,
    );
    const headerCheckbox = container.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(headerCheckbox);
    expect(lastIds.length).toBe(50); // all 50 rows toggled
  });

  it('selectAllScope=visible toggles only rendered rows', () => {
    let lastIds: string[] = [];
    const { container } = render(
      <DataGrid
        rows={generateUsers(1000)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        selectAllScope="visible"
        selectedRowIds={[]}
        onSelectionChange={(ids) => (lastIds = ids)}
      />,
    );
    const headerCheckbox = container.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(headerCheckbox);
    // Only visible window — way less than 1000
    expect(lastIds.length).toBeLessThan(50);
    expect(lastIds.length).toBeGreaterThan(0);
  });

  it('renders bulk action footer when selection > 0', () => {
    const { rerender } = render(
      <DataGrid
        rows={generateUsers(10)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        bulkActions={(rows) => <span>Bulk × {rows.length}</span>}
      />,
    );
    expect(screen.queryByText(/Bulk ×/)).toBeNull();
    rerender(
      <DataGrid
        rows={generateUsers(10)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        selectedRowIds={['u0', 'u1']}
        bulkActions={(rows) => <span>Bulk × {rows.length}</span>}
      />,
    );
    expect(screen.getByText('Bulk × 2')).not.toBeNull();
  });
});

describe('DataGrid — RBAC', () => {
  it('per-column hide removes the column entirely', () => {
    const colsWithHide: TableColumn<User>[] = [
      baseCols[0]!,
      {
        ...baseCols[1]!,
        access: { resource: 'email', action: 'read', onUnauthorized: 'hide' },
      },
      baseCols[2]!,
    ];
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={colsWithHide}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(screen.queryByText('Email')).toBeNull();
  });
});

describe('DataGrid — sticky left column', () => {
  it('applies sticky CSS class to sticky="left" columns', () => {
    const colsSticky: TableColumn<User>[] = [
      { ...baseCols[0]!, sticky: 'left' },
      ...baseCols.slice(1),
    ];
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={colsSticky}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.className).toContain('sticky');
    expect(nameHeader?.className).toContain('left-0');
  });
});

describe('DataGrid — internal pagination', () => {
  it('renders Pagination footer when pagination prop is set', () => {
    render(
      <DataGrid
        rows={generateUsers(100)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        pagination={{
          page: 1,
          pageSize: 20,
          onPageChange: () => {},
        }}
      />,
    );
    // Pagination renders a <nav aria-label="Pagination">
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeNull();
  });
});

describe('DataGrid — smart defaults', () => {
  it('right-aligns number columns (Age)', () => {
    render(
      <DataGrid
        rows={generateUsers(20)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const ageHeader = screen.getByText('Age').closest('th');
    expect(ageHeader?.className).toContain('text-right');
  });

  it('auto-applies tabular-nums to number cells (no font-mono)', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const ageCell = container.querySelector('tbody tr[data-selected] td:nth-child(3)');
    expect(ageCell?.className).toContain('tabular-nums');
    expect(ageCell?.className).not.toContain('font-mono');
  });
});

describe('DataGrid — i18n', () => {
  it('column headers accept translated strings', () => {
    const colsTranslated: TableColumn<User>[] = [
      { field: 'name', header: /* t('users.name') */ 'Nome', sortable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={colsTranslated}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(screen.getByText('Nome')).not.toBeNull();
  });

  it('labels prop translates internal a11y strings', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        rowSelection="multiple"
        labels={{ ariaSelectRow: 'Seleziona riga', ariaSelectAllRows: 'Seleziona tutto' }}
      />,
    );
    expect(screen.queryByLabelText('Seleziona tutto')).not.toBeNull();
  });
});
