// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { AppShell } from './AppShell';
import { appShellVariants } from './appShell.variants';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 27 in libs/dashforge/README-BUG.md.
 *
 * `root` was `min-h-screen` while `main` declared `overflow-y-auto`. Those
 * describe two different layouts, and `min-h-screen` wins: the root grows
 * with the content, the WINDOW scrolls, and `main` never overflows, so its
 * `overflow-y-auto` is dead code on exactly the pages where it would have
 * mattered.
 *
 * Measured in Chrome on `learn/dash` before the fix, viewport 768px:
 *
 *   root height ................ 2207px   (grew to the content)
 *   main.scrollHeight/client ... 2207 / 2207   -> never overflows
 *   main.scrollTop = 600 ....... stayed 0
 *   window.scrollTo(0, 600) .... scrollY 600, header top -511
 *
 * The fix puts the two layouts on a `layout` axis instead of leaving them
 * contradicting each other in one recipe. jsdom does no layout, so what is
 * pinned here is the CLASS CONTRACT; the geometry above is the browser half
 * of the same assertion and is recorded in the register entry.
 */

const classesOf = (layout?: 'viewport' | 'page') => {
  const v = appShellVariants(layout ? { layout } : undefined);
  return {
    root: v.root().split(/\s+/).filter(Boolean),
    main: v.main().split(/\s+/).filter(Boolean),
    nav: v.nav().split(/\s+/).filter(Boolean),
  };
};

describe('BUG 27 regression guard — the shell picks one layout and commits to it', () => {
  it('never claims both layouts at once, in any mode', () => {
    // The defect, stated as the invariant it broke: a root that grows with
    // the content cannot also have a child that scrolls internally.
    for (const layout of [undefined, 'viewport', 'page'] as const) {
      const c = classesOf(layout);
      const rootGrows = c.root.includes('min-h-screen');
      const mainScrolls = c.main.includes('overflow-y-auto');
      expect(
        rootGrows && mainScrolls,
        `layout=${layout ?? 'default'} claims both`,
      ).toBe(false);
    }
  });

  it('defaults to the viewport shell the component documents and draws', () => {
    const c = classesOf();
    expect(c.root).toContain('h-dvh');
    expect(c.root).toContain('overflow-hidden');
    expect(c.root).not.toContain('min-h-screen');
    expect(c.main).toContain('overflow-y-auto');
  });

  it('uses h-dvh, never h-screen', () => {
    // `100vh` is the height the screen has only while a phone's address bar
    // is hidden, so `h-screen` makes a shell taller than the window and the
    // page scrolls again, on the devices where that is worst.
    const c = classesOf('viewport');
    expect(c.root).toContain('h-dvh');
    expect(c.root).not.toContain('h-screen');
  });

  it('gives the nav its own scroller in the viewport shell', () => {
    // Fixed must not mean clipped: on a short screen the last nav items
    // have to stay reachable.
    expect(classesOf('viewport').nav).toContain('overflow-y-auto');
  });

  it('layout="page" restores the window-scrolls shell, without a dead scroller', () => {
    const c = classesOf('page');
    expect(c.root).toContain('min-h-screen');
    expect(c.root).not.toContain('h-dvh');
    expect(c.root).not.toContain('overflow-hidden');
    // `main` must not advertise a scroller it cannot be in this mode.
    expect(c.main).not.toContain('overflow-y-auto');
  });

  it('the classes actually reach the DOM', () => {
    const { container } = render(
      <AppShell header={<div>h</div>} nav={<div>n</div>} footer={<div>f</div>}>
        <p>page</p>
      </AppShell>,
    );
    const root = container.firstElementChild as HTMLElement;
    const main = container.querySelector('main') as HTMLElement;

    expect(root.className).toContain('h-dvh');
    expect(root.className).not.toContain('min-h-screen');
    expect(main.className).toContain('overflow-y-auto');
  });
});
