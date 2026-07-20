// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Popover } from './Popover.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Popover precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    render(
      <Popover open content={<div>panel</div>}>
        <button>trigger</button>
      </Popover>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content).not.toBeNull();
  });

  it('level 2 — theme override wins (side=top)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Popover: { defaults: { side: 'top' } } },
      });
    });
    render(
      <Popover open content={<div>x</div>}>
        <button>t</button>
      </Popover>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.getAttribute('data-side')).toBe('top');
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Popover: { defaults: { side: 'top' } } },
      });
    });
    render(
      <Popover open side="right" content={<div>x</div>}>
        <button>t</button>
      </Popover>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.getAttribute('data-side')).toBe('right');
  });

  it('theme align override applies (start)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Popover: { defaults: { align: 'start' } } },
      });
    });
    render(
      <Popover open content={<div>x</div>}>
        <button>t</button>
      </Popover>
    );
    const content = document.querySelector('[role="dialog"]');
    expect(content?.getAttribute('data-align')).toBe('start');
  });

  it('slotProps precedence — instance slotProps merged onto the content slot', () => {
    render(
      <Popover
        open
        content={<div>x</div>}
        slotProps={{ content: { className: 'df-slot-popover-content-token' } }}
      >
        <button>t</button>
      </Popover>,
    );
    const el = document.querySelector('.df-slot-popover-content-token');
    expect(el).toBeTruthy();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Popover: {
            defaults: { side: 'top', align: 'end', sideOffset: 12 },
          },
        },
      });
    });
    render(
      <Popover open content={<div>x</div>}>
        <button>t</button>
      </Popover>
    );
    const content = document.querySelector('[role="dialog"]');
    // Radix sets data-side/data-align, but no `sideOffset` should
    // ever land on the DOM as an attribute.
    expect(content?.getAttribute('sideOffset')).toBeNull();
  });
});
