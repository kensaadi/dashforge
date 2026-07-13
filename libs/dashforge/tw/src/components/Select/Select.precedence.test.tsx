// @vitest-environment jsdom
/**
 * Option C precedence chain — Select.
 *
 * Axes flowing through the chain:
 *   1. TV `defaultVariants` (size=md, layout=stacked, fullWidth=false).
 *   2. `theme.components.Select.defaults` (application-wide DS density).
 *   3. Instance props.
 *   4. `sx` (utility escape hatch, merged via tailwind-merge).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Select } from './Select.js';
import type { SelectOption } from './select.types.js';

const OPTS: SelectOption<string>[] = [{ value: 'a', label: 'A' }];

function triggerClasses(container: HTMLElement): Set<string> {
  const btn = container.querySelector('button[role="combobox"]');
  return new Set((btn?.className ?? '').split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Select precedence chain — Option C', () => {
  it('level 1 — TV defaults: size=md, layout=stacked, fullWidth=false', () => {
    const { container } = render(
      <Select name="x" options={OPTS} value="a" onChange={() => undefined} />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('h-10')).toBe(true); // size md
    expect(cls.has('text-base')).toBe(true);
    // fullWidth axis lives on the root wrapper (not the trigger — the
    // trigger has `w-full` in its base classes to fill its parent).
    const root = container.querySelector(':scope > div, :scope > [class*="flex"]') as HTMLElement;
    expect(root?.className ?? '').not.toContain('w-full');
  });

  it('level 2 — theme.components.Select.defaults wins over TV defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Select: { defaults: { size: 'sm', fullWidth: true } },
        },
      });
    });
    const { container } = render(
      <Select name="x" options={OPTS} value="a" onChange={() => undefined} />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('h-8')).toBe(true);      // size sm
    expect(cls.has('text-sm')).toBe(true);
    // fullWidth axis flips the root to `w-full`.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('w-full');
  });

  it('level 3 — instance props win over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Select: { defaults: { size: 'sm' } },
        },
      });
    });
    const { container } = render(
      <Select
        name="x"
        options={OPTS}
        value="a"
        onChange={() => undefined}
        size="lg"
      />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('h-12')).toBe(true);   // instance lg wins
    expect(cls.has('h-8')).toBe(false);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(
      <Select
        name="x"
        options={OPTS}
        value="a"
        onChange={() => undefined}
        size="md"
        sx="h-6"
      />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('h-6')).toBe(true);
    expect(cls.has('h-10')).toBe(false);
  });

  it('theme slotProps.trigger.className merges into the trigger', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Select: {
            slotProps: { trigger: { className: 'font-mono' } },
          },
        },
      });
    });
    const { container } = render(
      <Select name="x" options={OPTS} value="a" onChange={() => undefined} />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('font-mono')).toBe(true);
  });

  it('DS-identity scenario — bare Select renders the theme.defaults size everywhere', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Select: { defaults: { size: 'sm', layout: 'inline', fullWidth: true } },
        },
      });
    });
    const { container } = render(
      <Select name="x" options={OPTS} value="a" onChange={() => undefined} />,
    );
    const cls = triggerClasses(container);
    expect(cls.has('h-8')).toBe(true);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('w-full');
  });
});
