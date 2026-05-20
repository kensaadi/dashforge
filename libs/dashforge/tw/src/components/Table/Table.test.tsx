// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Table } from './Table.js';
import type { TableColumn } from './table.types.js';

void React;
afterEach(() => cleanup());

// jsdom doesn't implement ResizeObserver — Radix Popover (used by
// RowActionsMenu in some tests) requires it.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
  joinedAt: Date;
  meta: { city: string };
}

const baseCols: TableColumn<User>[] = [
  { field: 'name',  header: 'Name',  sortable: true, searchable: true },
  { field: 'email', header: 'Email', searchable: true },
  { field: 'age',   header: 'Age',   sortable: true },
  { field: 'meta.city' as never, header: 'City', searchable: true },
];

const baseRows: User[] = [
  {
    id: 'u1', name: 'Charlie', email: 'charlie@example.com', age: 30,
    active: true, joinedAt: new Date('2024-01-15'),
    meta: { city: 'Roma' },
  },
  {
    id: 'u2', name: 'Alice', email: 'alice@example.com', age: 25,
    active: true, joinedAt: new Date('2024-03-01'),
    meta: { city: 'Milano' },
  },
  {
    id: 'u3', name: 'Bob', email: 'bob@example.org', age: 45,
    active: false, joinedAt: new Date('2023-06-20'),
    meta: { city: 'Torino' },
  },
];

const getRowId = (row: User) => row.id;

// ───────────────────────────────────────────────────────────────
// Rendering
// ───────────────────────────────────────────────────────────────

describe('Table — rendering', () => {
  it('renders a <table> element', () => {
    const { container } = render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('renders all column headers', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(screen.getByText('Name')).not.toBeNull();
    expect(screen.getByText('Email')).not.toBeNull();
    expect(screen.getByText('Age')).not.toBeNull();
    expect(screen.getByText('City')).not.toBeNull();
  });

  it('renders all data rows', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(screen.getByText('Charlie')).not.toBeNull();
    expect(screen.getByText('Alice')).not.toBeNull();
    expect(screen.getByText('Bob')).not.toBeNull();
  });

  it('resolves nested keys via getNestedValue', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(screen.getByText('Roma')).not.toBeNull();
    expect(screen.getByText('Milano')).not.toBeNull();
  });

  it('renders empty state when rows is empty', () => {
    render(<Table rows={[]} cols={baseCols} getRowId={getRowId} />);
    expect(screen.queryByText('No data')).not.toBeNull();
  });

  it('renders custom emptyState ReactNode', () => {
    render(
      <Table
        rows={[]}
        cols={baseCols}
        getRowId={getRowId}
        emptyState={<span>Nothing here yet</span>}
      />,
    );
    expect(screen.queryByText('Nothing here yet')).not.toBeNull();
  });

  it('renders loading skeleton rows', () => {
    const { container } = render(
      <Table rows={[]} cols={baseCols} getRowId={getRowId} loading loadingRowCount={3} />,
    );
    const busyRows = container.querySelectorAll('tr[aria-busy="true"]');
    expect(busyRows.length).toBe(3);
  });

  it('renders caption (sr-only by default)', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} caption="My table" />,
    );
    const caption = container.querySelector('caption');
    expect(caption?.textContent).toBe('My table');
    expect(caption?.className).toContain('sr-only');
  });

  it('renders visible caption when showCaption=true', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} caption="My table" showCaption />,
    );
    const caption = container.querySelector('caption');
    expect(caption?.className).not.toContain('sr-only');
  });
});

// ───────────────────────────────────────────────────────────────
// Smart-default column types
// ───────────────────────────────────────────────────────────────

describe('Table — smart defaults', () => {
  it('right-aligns number columns (Age)', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const ageHeader = screen.getByText('Age').closest('th');
    expect(ageHeader?.className).toContain('text-right');
  });

  it('left-aligns string columns (Name)', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.className).toContain('text-left');
  });

  it('auto-applies tabular-nums to number cells (digit alignment)', () => {
    const { container } = render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const ageCell = container.querySelector('tbody tr td:nth-child(3)');
    expect(ageCell?.className).toContain('tabular-nums');
  });

  it('does NOT auto-apply font-mono to number cells (font family is consumer choice)', () => {
    const { container } = render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const ageCell = container.querySelector('tbody tr td:nth-child(3)');
    expect(ageCell?.className).not.toContain('font-mono');
  });

  it('does NOT auto-apply font-mono to date cells either', () => {
    const colsWithDate: TableColumn<User>[] = [
      ...baseCols.slice(0, 3),
      { field: 'joinedAt' as never, header: 'Joined' },
    ];
    const { container } = render(<Table rows={baseRows} cols={colsWithDate} getRowId={getRowId} />);
    const dateCell = container.querySelector('tbody tr td:nth-child(4)');
    expect(dateCell?.className).not.toContain('font-mono');
    // Date columns DO get tabular-nums (ISO digits align).
    expect(dateCell?.className).toContain('tabular-nums');
  });

  it('explicit align overrides auto-detected', () => {
    const colsOverride: TableColumn<User>[] = [
      { ...baseCols[0]!, align: 'right' },
    ];
    render(<Table rows={baseRows} cols={colsOverride} getRowId={getRowId} />);
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.className).toContain('text-right');
  });

  it('explicit tabularNums=false overrides auto for number column', () => {
    const colsOverride: TableColumn<User>[] = [
      ...baseCols.slice(0, 2),
      { field: 'age', header: 'Age', tabularNums: false },
      ...baseCols.slice(3),
    ];
    const { container } = render(<Table rows={baseRows} cols={colsOverride} getRowId={getRowId} />);
    const ageCell = container.querySelector('tbody tr td:nth-child(3)');
    expect(ageCell?.className).not.toContain('tabular-nums');
  });

  it('explicit monospace=true opts into font-mono (consumer-controlled)', () => {
    const colsOverride: TableColumn<User>[] = [
      { ...baseCols[0]!, monospace: true },
      ...baseCols.slice(1),
    ];
    const { container } = render(<Table rows={baseRows} cols={colsOverride} getRowId={getRowId} />);
    const nameCell = container.querySelector('tbody tr td:nth-child(1)');
    expect(nameCell?.className).toContain('font-mono');
  });
});

// ───────────────────────────────────────────────────────────────
// Sort
// ───────────────────────────────────────────────────────────────

describe('Table — sort', () => {
  it('sortable header renders as a button with aria-sort=none initially', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.getAttribute('aria-sort')).toBe('none');
  });

  it('click sortable header → asc, aria-sort updates', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const nameButton = screen.getByText('Name').closest('button')!;
    fireEvent.click(nameButton);
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('click twice → desc', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const nameButton = screen.getByText('Name').closest('button')!;
    fireEvent.click(nameButton);
    fireEvent.click(nameButton);
    expect(screen.getByText('Name').closest('th')?.getAttribute('aria-sort')).toBe('descending');
  });

  it('click thrice → clears (aria-sort=none)', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const nameButton = screen.getByText('Name').closest('button')!;
    fireEvent.click(nameButton);
    fireEvent.click(nameButton);
    fireEvent.click(nameButton);
    expect(screen.getByText('Name').closest('th')?.getAttribute('aria-sort')).toBe('none');
  });

  it('non-sortable header does NOT render a button', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    const emailHeader = screen.getByText('Email').closest('th');
    expect(emailHeader?.querySelector('button')).toBeNull();
  });

  it('asc sort actually rearranges rows (numeric)', () => {
    const { container } = render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    fireEvent.click(screen.getByText('Age').closest('button')!);
    const firstRowAge = container.querySelector('tbody tr:first-child td:nth-child(3)')?.textContent;
    expect(firstRowAge).toBe('25');  // Alice
  });

  it('emits onSortChange when controlled', () => {
    let lastModel: unknown = null;
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        sortModel={[]}
        onSortChange={(m) => (lastModel = m)}
      />,
    );
    fireEvent.click(screen.getByText('Name').closest('button')!);
    expect(lastModel).toEqual([{ field: 'name', direction: 'asc' }]);
  });
});

// ───────────────────────────────────────────────────────────────
// Search
// ───────────────────────────────────────────────────────────────

describe('Table — search', () => {
  it('does NOT render search input when enableSearch=false', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(screen.queryByPlaceholderText('Search...')).toBeNull();
  });

  it('renders search input when enableSearch=true', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} enableSearch />);
    expect(screen.getByPlaceholderText('Search...')).not.toBeNull();
  });

  it('filters rows by global search (debounce=0 for test speed)', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        enableSearch
        searchDebounceMs={0}
      />,
    );
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alice' } });
    expect(screen.queryByText('Alice')).not.toBeNull();
    expect(screen.queryByText('Charlie')).toBeNull();
  });

  it('honors custom searchPlaceholder via prop', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        enableSearch
        searchPlaceholder="Cerca utenti..."
      />,
    );
    expect(screen.getByPlaceholderText('Cerca utenti...')).not.toBeNull();
  });

  it('honors custom labels via labels prop', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        enableSearch
        labels={{ searchPlaceholder: 'IT: cerca' }}
      />,
    );
    expect(screen.getByPlaceholderText('IT: cerca')).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// Selection
// ───────────────────────────────────────────────────────────────

describe('Table — selection', () => {
  it('does NOT render selection column when rowSelection=none', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} rowSelection="none" />,
    );
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('renders checkbox in each row when rowSelection=multiple', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} rowSelection="multiple" />,
    );
    // 1 header checkbox + 3 row checkboxes = 4
    expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(4);
  });

  it('clicking a row checkbox toggles selection', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} rowSelection="multiple" />,
    );
    const firstRowCheckbox = container.querySelector(
      'tbody tr:first-child input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(firstRowCheckbox);
    expect(firstRowCheckbox.checked).toBe(true);
    const row = firstRowCheckbox.closest('tr');
    expect(row?.getAttribute('aria-selected')).toBe('true');
  });

  it('select-all toggles all rows', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} rowSelection="multiple" />,
    );
    const headerCheckbox = container.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(headerCheckbox);
    const rowCheckboxes = container.querySelectorAll(
      'tbody input[type="checkbox"]',
    ) as NodeListOf<HTMLInputElement>;
    rowCheckboxes.forEach((cb) => expect(cb.checked).toBe(true));
  });

  it('renders bulk action footer ONLY when selection > 0', () => {
    const { rerender } = render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        rowSelection="multiple"
        bulkActions={(rows) => <span>Bulk for {rows.length}</span>}
      />,
    );
    expect(screen.queryByText(/Bulk for/)).toBeNull();

    rerender(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        rowSelection="multiple"
        selectedRowIds={['u1']}
        bulkActions={(rows) => <span>Bulk for {rows.length}</span>}
      />,
    );
    expect(screen.getByText('Bulk for 1')).not.toBeNull();
  });

  it('emits onSelectionChange when controlled', () => {
    let lastIds: string[] = [];
    const { container } = render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        rowSelection="multiple"
        selectedRowIds={[]}
        onSelectionChange={(ids) => (lastIds = ids)}
      />,
    );
    const firstCheckbox = container.querySelector(
      'tbody tr:first-child input[type="checkbox"]',
    ) as HTMLInputElement;
    fireEvent.click(firstCheckbox);
    expect(lastIds).toEqual(['u1']);
  });
});

// ───────────────────────────────────────────────────────────────
// Expandable rows
// ───────────────────────────────────────────────────────────────

describe('Table — expandable rows', () => {
  it('does NOT render expand column when expandable not provided', () => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(screen.queryByLabelText('Expand row')).toBeNull();
  });

  it('renders expand toggle when expandable provided', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        expandable={{ render: (r) => <div>Detail of {r.name}</div> }}
      />,
    );
    const toggles = screen.getAllByLabelText('Expand row');
    expect(toggles.length).toBe(3);
  });

  it('clicking toggle expands the row with detail content', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        expandable={{ render: (r) => <div>Detail of {r.name}</div> }}
      />,
    );
    const firstToggle = screen.getAllByLabelText('Expand row')[0]!;
    fireEvent.click(firstToggle);
    expect(screen.getByText('Detail of Charlie')).not.toBeNull();
  });

  it('aria-expanded reflects state', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        expandable={{ render: () => <div>x</div> }}
      />,
    );
    const firstToggle = screen.getAllByLabelText('Expand row')[0]!;
    expect(firstToggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(firstToggle);
    expect(firstToggle.getAttribute('aria-label')).toBe('Collapse row');
    expect(firstToggle.getAttribute('aria-expanded')).toBe('true');
  });
});

// ───────────────────────────────────────────────────────────────
// Row actions
// ───────────────────────────────────────────────────────────────

describe('Table — row actions', () => {
  it('renders the row actions cell when rowActions provided', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        rowActions={(row) => <button type="button">Edit {row.name}</button>}
      />,
    );
    expect(screen.getByText('Edit Charlie')).not.toBeNull();
    expect(screen.getByText('Edit Alice')).not.toBeNull();
    expect(screen.getByText('Edit Bob')).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// RBAC
// ───────────────────────────────────────────────────────────────

describe('Table — RBAC', () => {
  it('per-column access=hide removes the column entirely', () => {
    const colsWithHide: TableColumn<User>[] = [
      baseCols[0]!,
      {
        ...baseCols[1]!,
        access: { resource: 'email', action: 'read', onUnauthorized: 'hide' },
      },
      baseCols[2]!,
    ];
    render(<Table rows={baseRows} cols={colsWithHide} getRowId={getRowId} />);
    expect(screen.queryByText('Email')).toBeNull();
    expect(screen.queryByText('charlie@example.com')).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// Variants + density
// ───────────────────────────────────────────────────────────────

describe('Table — variants + density', () => {
  it.each(['plain', 'lines', 'striped', 'bordered', 'card'] as const)(
    'renders variant=%s without crashing',
    (variant) => {
      render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} variant={variant} />);
      expect(screen.getByText('Charlie')).not.toBeNull();
    },
  );

  it.each(['compact', 'comfortable', 'spacious'] as const)(
    'renders density=%s without crashing',
    (density) => {
      render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} density={density} />);
      expect(screen.getByText('Charlie')).not.toBeNull();
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without crashing', (size) => {
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} size={size} />);
    expect(screen.getByText('Charlie')).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// sx + slotProps
// ───────────────────────────────────────────────────────────────

describe('Table — sx + slotProps', () => {
  it('applies sx to root', () => {
    const { container } = render(
      <Table rows={baseRows} cols={baseCols} getRowId={getRowId} sx="my-root-cls" />,
    );
    expect(container.firstChild as HTMLElement).toHaveProperty('className');
    expect((container.firstChild as HTMLElement).className).toContain('my-root-cls');
  });

  it('applies slotProps.headerCell to each header', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        slotProps={{ headerCell: { className: 'header-slot' } }}
      />,
    );
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader?.className).toContain('header-slot');
  });
});

// ───────────────────────────────────────────────────────────────
// i18n surface
// ───────────────────────────────────────────────────────────────

describe('Table — i18n', () => {
  it('column headers accept translated strings directly', () => {
    const colsTranslated: TableColumn<User>[] = [
      { field: 'name', header: /* t('users.name') */ 'Nome', sortable: true },
    ];
    render(<Table rows={baseRows} cols={colsTranslated} getRowId={getRowId} />);
    expect(screen.getByText('Nome')).not.toBeNull();
  });

  it('column headers accept render function for richer JSX', () => {
    const colsJsx: TableColumn<User>[] = [
      { field: 'name', header: () => <em>Name (em)</em>, sortable: true },
    ];
    render(<Table rows={baseRows} cols={colsJsx} getRowId={getRowId} />);
    expect(screen.getByText('Name (em)').tagName).toBe('EM');
  });

  it('labels prop translates internal a11y strings', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        rowSelection="multiple"
        labels={{ ariaSelectRow: 'Seleziona riga', ariaSelectAllRows: 'Seleziona tutte' }}
      />,
    );
    expect(screen.queryAllByLabelText('Seleziona riga').length).toBe(3);
    expect(screen.queryByLabelText('Seleziona tutte')).not.toBeNull();
  });
});

describe('Table — Sprint 6 P2 refinements', () => {
  // ───── D7: no-results vs no-data empty state ─────

  it('shows the noData message when the dataset is genuinely empty', () => {
    render(<Table rows={[]} cols={baseCols} getRowId={getRowId} />);
    expect(screen.queryByText('No data')).not.toBeNull();
  });

  it('shows the noResults message when a search excludes every row', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        enableSearch
        searchQuery="zzz-no-match"
        searchDebounceMs={0}
      />,
    );
    expect(screen.queryByText('No matching results')).not.toBeNull();
    expect(screen.queryByText('No data')).toBeNull();
  });

  it('shows the noResults message when a filter excludes every row', () => {
    render(
      <Table
        rows={baseRows}
        cols={baseCols}
        getRowId={getRowId}
        filterModel={[{ field: 'name', op: 'contains', value: 'zzz-no-match' }]}
      />,
    );
    expect(screen.queryByText('No matching results')).not.toBeNull();
  });

  // ───── T1: dev-warn when getRowId omitted + identity-sensitive feature ─────

  it('warns in dev when getRowId is omitted and a sortable column exists', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // baseCols has sortable columns; no getRowId passed.
    render(<Table rows={baseRows} cols={baseCols} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`getRowId` is not set'),
    );
    warn.mockRestore();
  });

  it('does NOT warn when getRowId is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Table rows={baseRows} cols={baseCols} getRowId={getRowId} />);
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('`getRowId` is not set'),
    );
    warn.mockRestore();
  });

  it('does NOT warn when getRowId is omitted but no identity-sensitive feature is active', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Plain columns: not sortable, not searchable, no selection/expansion.
    const plainCols: TableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
    ];
    render(<Table rows={baseRows} cols={plainCols} />);
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('`getRowId` is not set'),
    );
    warn.mockRestore();
  });
});
