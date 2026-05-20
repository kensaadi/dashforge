// @vitest-environment jsdom
/**
 * Unit tests for the per-column filter UI (`ColumnFilterTrigger`).
 *
 * Sprint 6 P4 — the filter UI shipped in 0.8.0-beta with only
 * DataGrid-integration coverage. This file exercises each filter
 * type (text / number / boolean / date) directly, including the
 * apply / clear branches + edge cases.
 */
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ColumnFilterTrigger } from './ColumnFilters.js';
import type { TableFilterModel } from '../../Table/table.types.js';

void React;
afterEach(() => cleanup());

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
  }
});

const EMPTY: TableFilterModel = [];

describe('ColumnFilterTrigger — trigger button', () => {
  it('renders a filter button', () => {
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Filter' })).not.toBeNull();
  });

  it('shows aria-pressed=false when no filter is active', () => {
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('shows aria-pressed=true when a filter is active on the field', () => {
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={[{ field: 'name', op: 'contains', value: 'x' }]}
        onFilterChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('translates the trigger label via labels', () => {
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={() => {}}
        labels={{ filterColumn: 'Filtra' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Filtra' })).not.toBeNull();
  });

  it('is disabled when disabled is set', () => {
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={() => {}}
        disabled
      />,
    );
    expect(
      (screen.getByRole('button', { name: 'Filter' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});

describe('ColumnFilterTrigger — text filter', () => {
  it('Apply commits a contains filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.change(screen.getByPlaceholderText('…'), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'name', op: 'contains', value: 'abc' },
    ]);
  });

  it('Apply with an empty value commits a removal (null → no filter)', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={[{ field: 'name', op: 'contains', value: 'old' }]}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.change(screen.getByDisplayValue('old'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });

  it('Clear removes the filter for the field', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={[{ field: 'name', op: 'contains', value: 'x' }]}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });

  it('Enter in the text input applies the filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="name"
        filterType="text"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const input = screen.getByPlaceholderText('…');
    fireEvent.change(input, { target: { value: 'typed' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'name', op: 'contains', value: 'typed' },
    ]);
  });
});

describe('ColumnFilterTrigger — number range filter', () => {
  it('Apply with min + max commits a between filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="age"
        filterType="number"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0]!, { target: { value: '10' } });
    fireEvent.change(inputs[1]!, { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'age', op: 'between', value: [10, 50] },
    ]);
  });

  it('Apply with only a min commits an open-ended range', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="age"
        filterType="number"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0]!, { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'age', op: 'between', value: [18, null] },
    ]);
  });

  it('Apply with both ends empty removes the filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="age"
        filterType="number"
        filterModel={[{ field: 'age', op: 'between', value: [1, 2] }]}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    // The two inputs are seeded from the current value — clear them.
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0]!, { target: { value: '' } });
    fireEvent.change(inputs[1]!, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });
});

describe('ColumnFilterTrigger — boolean filter', () => {
  it('Apply with True selected commits an equals=true filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="active"
        filterType="boolean"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.click(screen.getByLabelText('True'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'active', op: 'equals', value: true },
    ]);
  });

  it('Apply with False selected commits an equals=false filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="active"
        filterType="boolean"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.click(screen.getByLabelText('False'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'active', op: 'equals', value: false },
    ]);
  });

  it('Apply with All selected removes the filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="active"
        filterType="boolean"
        filterModel={[{ field: 'active', op: 'equals', value: true }]}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    fireEvent.click(screen.getByLabelText('All'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });
});

describe('ColumnFilterTrigger — date range filter', () => {
  it('Apply with from + to commits a between filter (ISO strings)', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="joined"
        filterType="date"
        filterModel={EMPTY}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0]!, { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1]!, { target: { value: '2024-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([
      { field: 'joined', op: 'between', value: ['2024-01-01', '2024-12-31'] },
    ]);
  });

  it('Apply with both date ends empty removes the filter', () => {
    const onFilterChange = vi.fn();
    render(
      <ColumnFilterTrigger
        field="joined"
        filterType="date"
        filterModel={[
          { field: 'joined', op: 'between', value: ['2024-01-01', null] },
        ]}
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0]!, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });
});
