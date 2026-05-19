// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
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

describe('DataGrid — per-column filter UI', () => {
  it('renders a filter trigger button only for filterable columns', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', filterable: true },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // 2 filterable cols → 2 filter buttons
    const triggers = screen.getAllByRole('button', { name: 'Filter' });
    expect(triggers).toHaveLength(2);
  });

  it('shows active state (aria-pressed=true) when a filter is applied', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        filterModel={[{ field: 'name', op: 'contains', value: 'User 1' }]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Filter' });
    expect(trigger.getAttribute('aria-pressed')).toBe('true');
  });

  it('opens a text input when filterable string column is clicked', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    // Apply button means the Popover opened
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeNull();
  });

  it('opens Min/Max inputs for filterable number column', () => {
    const cols: TableColumn<User>[] = [
      { field: 'age', header: 'Age', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(screen.queryByText('Min')).not.toBeNull();
    expect(screen.queryByText('Max')).not.toBeNull();
  });

  it('explicit col.filterType="text" overrides number autodetect', () => {
    const cols: TableColumn<User>[] = [
      { field: 'age', header: 'Age', filterable: true, filterType: 'text' },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    // Text filter has Apply but no Min/Max
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeNull();
    expect(screen.queryByText('Min')).toBeNull();
  });

  it('emits onFilterChange when Apply is clicked', () => {
    const onFilterChange = vi.fn();
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const input = screen.getByPlaceholderText('…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'User 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'name', op: 'contains', value: 'User 2' },
    ]);
  });

  it('translates filter labels via the labels prop', () => {
    const cols: TableColumn<User>[] = [
      { field: 'age', header: 'Età', filterable: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        labels={{
          filterColumn: 'Filtra',
          filterApply: 'Applica',
          filterClear: 'Pulisci',
          filterMin: 'Min',
          filterMax: 'Max',
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filtra' }));
    expect(screen.queryByRole('button', { name: 'Applica' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Pulisci' })).not.toBeNull();
  });
});

describe('DataGrid — column visibility', () => {
  it('renders the Columns toolbar button by default', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeNull();
  });

  it('does NOT render the Columns button when enableColumnVisibility=false', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableColumnVisibility={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Columns' })).toBeNull();
  });

  it('opens a popover menu with one checkbox per hideable column', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      // hideable: false → not shown in the menu (structurally required)
      { field: 'age', header: 'Age', hideable: false },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    // Radix Popover content has role="dialog" too.
    expect(screen.queryByRole('dialog')).not.toBeNull();
    // The menu should expose checkboxes for Name + Email (not Age).
    const menu = screen.getByRole('dialog');
    expect(menu.textContent).toContain('Name');
    expect(menu.textContent).toContain('Email');
    expect(menu.textContent).not.toContain('Age');
  });

  it('respects col.defaultHidden on first render', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email', defaultHidden: true },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // Email column header should NOT be rendered initially.
    expect(screen.queryByText('Email')).toBeNull();
    // Name column header SHOULD be rendered.
    expect(screen.queryByText('Name')).not.toBeNull();
  });

  it('toggling a column auto-commits via onHiddenColumnsChange (no Done button)', () => {
    const onHiddenColumnsChange = vi.fn();
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        onHiddenColumnsChange={onHiddenColumnsChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    // Uncheck "Email" inside the popover menu
    const menu = screen.getByRole('dialog');
    const emailCheckbox = Array.from(
      menu.querySelectorAll('input[type="checkbox"]'),
    ).find((el) => {
      const li = el.closest('label');
      return li?.textContent?.includes('Email');
    }) as HTMLInputElement | undefined;
    expect(emailCheckbox).toBeDefined();
    fireEvent.click(emailCheckbox!);
    // Auto-commit on toggle — no Done button anymore
    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['email']);
  });

  it('controlled hiddenColumns hides the matching columns', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        hiddenColumns={['email']}
      />,
    );
    expect(screen.queryByText('Email')).toBeNull();
    expect(screen.queryByText('Name')).not.toBeNull();
  });
});

describe('DataGrid — column resize', () => {
  it('renders a resize handle (separator) for each column by default', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // One separator per column (4 columns).
    const handles = screen.getAllByRole('separator');
    expect(handles.length).toBe(baseCols.length);
  });

  it('omits resize handles when enableColumnResize=false', () => {
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableColumnResize={false}
      />,
    );
    expect(screen.queryAllByRole('separator')).toHaveLength(0);
  });

  it('omits resize handle for col.resizable=false', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email', resizable: false },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // Only 1 separator (Name); Email opted out via resizable=false.
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('applies columnWidths to <th> style.width', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', width: 100 },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        columnWidths={{ name: 250 }}
      />,
    );
    const th = screen.getByText('Name').closest('th');
    expect(th?.style.width).toBe('250px');
  });

  it('falls back to col.width when no resize state for the column', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', width: 100 },
    ];
    render(
      <DataGrid
        rows={generateUsers(5)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const th = screen.getByText('Name').closest('th');
    expect(th?.style.width).toBe('100px');
  });
});

describe('DataGrid — column reorder', () => {
  it('applies the columnOrder prop to header order', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(3)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        columnOrder={['age', 'name', 'email', 'meta.city']}
      />,
    );
    const headerTexts = Array.from(
      container.querySelectorAll('thead th'),
    ).map((th) => th.textContent?.trim() ?? '');
    // First three column headers should match the order
    expect(headerTexts[0]).toContain('Age');
    expect(headerTexts[1]).toContain('Name');
    expect(headerTexts[2]).toContain('Email');
  });

  it('headers are draggable by default', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(3)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    const draggableThs = container.querySelectorAll('thead th[draggable="true"]');
    expect(draggableThs.length).toBe(baseCols.length);
  });

  it('does NOT make headers draggable when enableColumnReorder=false', () => {
    const { container } = render(
      <DataGrid
        rows={generateUsers(3)}
        cols={baseCols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
        enableColumnReorder={false}
      />,
    );
    expect(
      container.querySelectorAll('thead th[draggable="true"]'),
    ).toHaveLength(0);
  });

  it('respects col.reorderable=false per-column', () => {
    const cols: TableColumn<User>[] = [
      { field: 'name', header: 'Name', reorderable: false },
      { field: 'email', header: 'Email' },
    ];
    const { container } = render(
      <DataGrid
        rows={generateUsers(3)}
        cols={cols}
        getRowId={getRowId}
        rowHeight={48}
        height="400px"
      />,
    );
    // Only the Email th should be draggable.
    const draggableThs = container.querySelectorAll('thead th[draggable="true"]');
    expect(draggableThs.length).toBe(1);
    expect(draggableThs[0]?.textContent).toContain('Email');
  });
});
