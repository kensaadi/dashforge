// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { RadioGroup } from './RadioGroup.js';

const OPTIONS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('RadioGroup precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (stacked)', () => {
    const { container } = render(<RadioGroup name="pick" label="Pick" options={OPTIONS} />);
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('level 2 — theme override wins (layout=row)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { RadioGroup: { defaults: { layout: 'row' } } },
      });
    });
    const { container } = render(<RadioGroup name="pick" label="Pick" options={OPTIONS} />);
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { RadioGroup: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(
      <RadioGroup name="pick" label="Pick" options={OPTIONS} size="sm" />
    );
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(
      <RadioGroup name="pick" label="Pick" options={OPTIONS} sx="bg-yellow-100" />
    );
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('partial theme merge — size only, layout falls through to TV', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { RadioGroup: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<RadioGroup name="pick" label="Pick" options={OPTIONS} />);
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('no axis leaks onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { RadioGroup: { defaults: { size: 'lg', layout: 'row' } } },
      });
    });
    const { container } = render(<RadioGroup name="pick" label="Pick" options={OPTIONS} />);
    const root = container.querySelector('[role="radiogroup"]');
    expect(root?.getAttribute('size')).toBeNull();
    expect(root?.getAttribute('layout')).toBeNull();
  });
});
