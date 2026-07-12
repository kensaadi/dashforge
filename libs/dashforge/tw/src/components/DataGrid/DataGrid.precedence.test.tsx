// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { DataGrid } from './DataGrid.js';

type Row = { id: string; name: string };
const ROWS: Row[] = [{ id: '1', name: 'A' }];
const COLS = [{ key: 'name' as const, header: 'Name' }];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('DataGrid precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<DataGrid rows={ROWS} cols={COLS} getRowId={(r) => r.id} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('level 2 — theme override renders (variant=zebra)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DataGrid: { defaults: { variant: 'zebra' } } },
      });
    });
    const { container } = render(<DataGrid rows={ROWS} cols={COLS} getRowId={(r) => r.id} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DataGrid: { defaults: { variant: 'zebra' } } },
      });
    });
    const { container } = render(<DataGrid rows={ROWS} cols={COLS} getRowId={(r) => r.id} variant="lines" />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('theme size/density override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          DataGrid: { defaults: { size: 'lg', density: 'spacious' } },
        },
      });
    });
    const { container } = render(<DataGrid rows={ROWS} cols={COLS} getRowId={(r) => r.id} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          DataGrid: { defaults: { variant: 'zebra', size: 'lg', density: 'compact' } },
        },
      });
    });
    const { container } = render(<DataGrid rows={ROWS} cols={COLS} getRowId={(r) => r.id} />);
    const table = container.querySelector('table');
    expect(table?.getAttribute('variant')).toBeNull();
    expect(table?.getAttribute('density')).toBeNull();
  });
});
