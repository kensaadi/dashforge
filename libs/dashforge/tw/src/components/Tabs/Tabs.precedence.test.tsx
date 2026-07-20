// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Tabs } from './Tabs.js';

const ITEMS = [
  { value: 'a', label: 'A', content: <div>Panel A</div> },
  { value: 'b', label: 'B', content: <div>Panel B</div> },
];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Tabs precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults (variant=underline)', () => {
    const { container } = render(<Tabs items={ITEMS} />);
    const list = container.querySelector('[role="tablist"]');
    expect(list?.className).toMatch(/border-b/);
  });

  it('level 2 — theme override wins (variant=pill)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Tabs: { defaults: { variant: 'pill' } } },
      });
    });
    const { container } = render(<Tabs items={ITEMS} />);
    const list = container.querySelector('[role="tablist"]');
    expect(list?.className).toMatch(/rounded-lg/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Tabs: { defaults: { variant: 'pill' } } },
      });
    });
    const { container } = render(<Tabs items={ITEMS} variant="underline" />);
    const list = container.querySelector('[role="tablist"]');
    expect(list?.className).toMatch(/border-b/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Tabs items={ITEMS} sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme orientation override applies (vertical)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Tabs: { defaults: { orientation: 'vertical' } } },
      });
    });
    const { container } = render(<Tabs items={ITEMS} />);
    const list = container.querySelector('[role="tablist"]');
    expect(list?.className).toMatch(/flex-col/);
  });

  it('slotProps precedence — instance slotProps merged onto tab list', () => {
    const { container } = render(
      <Tabs
        items={ITEMS}
        slotProps={{ list: { className: 'df-slot-tabs-list-token' } }}
      />,
    );
    expect(container.querySelector('.df-slot-tabs-list-token')).toBeTruthy();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Tabs: { defaults: { variant: 'pill', orientation: 'vertical' } } },
      });
    });
    const { container } = render(<Tabs items={ITEMS} />);
    const root = container.firstElementChild;
    expect(root?.getAttribute('variant')).toBeNull();
    expect(root?.getAttribute('orientation')).toBeNull();
  });
});
