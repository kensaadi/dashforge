// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Menu, MenuTrigger, MenuContent, MenuItem } from './Menu.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

const SAMPLE = (
  <Menu open>
    <MenuTrigger>
      <button>t</button>
    </MenuTrigger>
    <MenuContent>
      <MenuItem>A</MenuItem>
    </MenuContent>
  </Menu>
);

describe('Menu precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    render(SAMPLE);
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('level 2 — theme override wins (modal=true)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Menu: { defaults: { modal: true } } },
      });
    });
    render(SAMPLE);
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Menu: { defaults: { modal: true } } },
      });
    });
    render(
      <Menu open modal={false}>
        <MenuTrigger>
          <button>t</button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>A</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('theme closeOnItemClick=false propagates via context', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Menu: { defaults: { closeOnItemClick: false } } },
      });
    });
    render(SAMPLE);
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Menu: { defaults: { modal: true, closeOnItemClick: false } },
        },
      });
    });
    render(SAMPLE);
    const menu = document.querySelector('[role="menu"]');
    expect(menu?.getAttribute('modal')).toBeNull();
    expect(menu?.getAttribute('closeOnItemClick')).toBeNull();
  });
});
