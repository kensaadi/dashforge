// @vitest-environment jsdom
/**
 * Option C precedence chain — Drawer.
 *
 *   1. TV defaultVariants (position='right', size='md', variant='temporary', showCloseButton=true).
 *   2. theme.components.Drawer.defaults.
 *   3. Instance props.
 *   4. sx (utility escape hatch, tailwind-merge on the content slot).
 */
import * as React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Drawer } from './Drawer.js';

void React;

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Drawer precedence chain — Option C', () => {
  it('level 1 — TV defaults: position="right", variant="temporary", size="md"', () => {
    render(
      <Drawer open onOpenChange={() => undefined}>
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('[data-position]') as HTMLElement;
    expect(content).toBeTruthy();
    expect(content.getAttribute('data-position')).toBe('right');
    expect(content.getAttribute('data-variant')).toBe('temporary');
    // md preset applies w-80 to horizontal drawers.
    expect(content.className).toContain('w-80');
  });

  it('level 2 — theme.components.Drawer.defaults wins over TV', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Drawer: { defaults: { position: 'left', size: 'lg' } },
        },
      });
    });
    render(
      <Drawer open onOpenChange={() => undefined}>
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('[data-position]') as HTMLElement;
    expect(content.getAttribute('data-position')).toBe('left');
    // lg preset for horizontal drawer is w-96.
    expect(content.className).toContain('w-96');
  });

  it('level 3 — instance prop wins over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Drawer: { defaults: { position: 'left' } } },
      });
    });
    render(
      <Drawer open onOpenChange={() => undefined} position="bottom">
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('[data-position]') as HTMLElement;
    expect(content.getAttribute('data-position')).toBe('bottom');
  });

  it('level 4 — sx wins on content via tailwind-merge', () => {
    render(
      <Drawer open onOpenChange={() => undefined} sx="opacity-50">
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('[data-position]') as HTMLElement;
    expect(content.className).toContain('opacity-50');
  });

  it('slotProps precedence — instance slotProps merged onto content', () => {
    render(
      <Drawer
        open
        onOpenChange={() => undefined}
        slotProps={{ content: { className: 'content-token' } }}
      >
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('.content-token');
    expect(content).toBeTruthy();
  });

  it('DS-identity scenario — bare Drawer inherits full theme identity', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Drawer: {
            defaults: {
              position: 'bottom',
              size: 'lg',
              variant: 'persistent',
              showCloseButton: false,
            },
          },
        },
      });
    });
    render(
      <Drawer open onOpenChange={() => undefined}>
        <p>body</p>
      </Drawer>,
    );
    const content = document.querySelector('[data-position]') as HTMLElement;
    expect(content.getAttribute('data-position')).toBe('bottom');
    expect(content.getAttribute('data-variant')).toBe('persistent');
    // Bottom drawer + lg preset → h-96.
    expect(content.className).toContain('h-96');
    // Persistent variant → no overlay.
    const overlays = Array.from(
      document.querySelectorAll('[data-state="open"]'),
    ).filter((el) => {
      const c = el.className;
      return typeof c === 'string' && c.includes('fixed') && c.includes('inset-0');
    });
    expect(overlays).toHaveLength(0);
  });
});
