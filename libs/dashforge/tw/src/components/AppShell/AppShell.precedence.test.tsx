// @vitest-environment jsdom
/**
 * Option C precedence chain — AppShell.
 *
 * AppShell carried only `slotProps` in `theme.components` until the
 * `layout` axis landed with BUG 27. The new axis could then be set per
 * instance but not once for the app, which is backwards for a shell:
 * it is the one component you mount exactly once and want to configure
 * from the theme.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { AppShell } from './AppShell.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

const rootOf = (c: HTMLElement) => (c.firstElementChild as HTMLElement).className;

describe('AppShell precedence chain — Option C', () => {
  it('level 1 — component default is the viewport shell', () => {
    const { container } = render(<AppShell>page</AppShell>);
    expect(rootOf(container)).toContain('h-dvh');
    expect(rootOf(container)).not.toContain('min-h-screen');
  });

  it('level 2 — theme override wins: layout=page', () => {
    act(() => {
       
      (patchTheme as any)({
        components: { AppShell: { defaults: { layout: 'page' } } },
      });
    });
    const { container } = render(<AppShell>page</AppShell>);
    expect(rootOf(container)).toContain('min-h-screen');
    expect(rootOf(container)).not.toContain('h-dvh');
  });

  it('level 3 — instance prop wins over the theme', () => {
    act(() => {
       
      (patchTheme as any)({
        components: { AppShell: { defaults: { layout: 'page' } } },
      });
    });
    const { container } = render(<AppShell layout="viewport">page</AppShell>);
    expect(rootOf(container)).toContain('h-dvh');
  });

  it('theme slotProps still apply alongside defaults', () => {
    // The two must not be mutually exclusive: `slotProps` was the only
    // thing AppShell supported before, and it has to keep working.
    act(() => {
       
      (patchTheme as any)({
        components: {
          AppShell: {
            defaults: { layout: 'page' },
            slotProps: { root: { className: 'shell-probe' } },
          },
        },
      });
    });
    const { container } = render(<AppShell>page</AppShell>);
    expect(rootOf(container)).toContain('min-h-screen');
    expect(rootOf(container)).toContain('shell-probe');
  });
});
