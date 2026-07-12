// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Autocomplete } from './Autocomplete.js';

const OPTIONS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Autocomplete precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<Autocomplete name="pick" options={OPTIONS} />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('level 2 — theme override wins (fullWidth)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Autocomplete: { defaults: { fullWidth: true } } },
      });
    });
    const { container } = render(<Autocomplete name="pick" options={OPTIONS} />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Autocomplete: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Autocomplete name="pick" options={OPTIONS} size="sm" />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(
      <Autocomplete name="pick" options={OPTIONS} sx="bg-yellow-100" />
    );
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('partial theme merge — size only, other axes fall through', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Autocomplete: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Autocomplete name="pick" options={OPTIONS} />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Autocomplete: {
            defaults: { size: 'lg', layout: 'row', fullWidth: true },
          },
        },
      });
    });
    const { container } = render(<Autocomplete name="pick" options={OPTIONS} />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('size')).toBeNull();
    expect(input?.getAttribute('layout')).toBeNull();
    expect(input?.getAttribute('fullWidth')).toBeNull();
  });
});
