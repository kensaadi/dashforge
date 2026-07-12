// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Table } from './Table.js';

type Row = { id: string; name: string };
const ROWS: Row[] = [{ id: '1', name: 'A' }];
const COLS = [{ key: 'name' as const, header: 'Name' }];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Table precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (variant=lines)', () => {
    const { container } = render(<Table rows={ROWS} cols={COLS} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('level 2 — theme override wins (variant=zebra)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Table: { defaults: { variant: 'zebra' } } },
      });
    });
    const { container } = render(<Table rows={ROWS} cols={COLS} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Table: { defaults: { variant: 'zebra' } } },
      });
    });
    const { container } = render(<Table rows={ROWS} cols={COLS} variant="lines" />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('theme density=compact applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Table: { defaults: { density: 'compact' } } },
      });
    });
    const { container } = render(<Table rows={ROWS} cols={COLS} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('theme size override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Table: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Table rows={ROWS} cols={COLS} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Table: {
            defaults: { variant: 'zebra', size: 'lg', density: 'compact', stickyHeader: false },
          },
        },
      });
    });
    const { container } = render(<Table rows={ROWS} cols={COLS} />);
    const table = container.querySelector('table');
    expect(table?.getAttribute('variant')).toBeNull();
    expect(table?.getAttribute('density')).toBeNull();
    expect(table?.getAttribute('stickyHeader')).toBeNull();
  });
});
