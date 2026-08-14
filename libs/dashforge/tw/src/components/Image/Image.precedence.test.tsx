// @vitest-environment jsdom
/**
 * Option C precedence chain — Image.
 *
 * Locks the 4-level override order:
 *   1. `defaultVariants` from tailwind-variants (imageVariants recipe)
 *   2. Theme override via `patchTheme({ components: { Image: { defaults } } })`
 *   3. Instance prop (`<Image fit="fill" />`)
 *   4. `sx` — final utility-class layer via tailwind-merge
 *
 * `fit` lands on the `img` slot, `rounded` on the `root` slot; `sx`
 * targets the root, so the level-4 assertion uses `rounded`.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Image } from './Image.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  // Reset the theme store so one test's patchTheme doesn't leak.
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Image precedence chain — Option C', () => {
  it('level 1 — TV defaultVariants: fit=cover (img), rounded=none (root)', () => {
    const { container } = render(<Image src="/a.jpg" alt="a" />);
    expect(classesOf(container.querySelector('img')!).has('object-cover')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-none')).toBe(true);
  });

  it('level 2 — theme defaults win over TV defaults', () => {
    act(() => {
      patchTheme({ components: { Image: { defaults: { fit: 'contain', rounded: 'lg' } } } });
    });
    const { container } = render(<Image src="/a.jpg" alt="a" />);
    expect(classesOf(container.querySelector('img')!).has('object-contain')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-lg')).toBe(true);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      patchTheme({ components: { Image: { defaults: { fit: 'contain', rounded: 'lg' } } } });
    });
    const { container } = render(<Image src="/a.jpg" alt="a" fit="fill" rounded="full" />);
    expect(classesOf(container.querySelector('img')!).has('object-fill')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-full')).toBe(true);
  });

  it('level 4 — sx wins over theme + prop on the root (tailwind-merge)', () => {
    act(() => {
      patchTheme({ components: { Image: { defaults: { rounded: 'lg' } } } });
    });
    const { container } = render(<Image src="/a.jpg" alt="a" rounded="full" sx="rounded-sm" />);
    const cls = classesOf(container.firstChild as HTMLElement);
    expect(cls.has('rounded-sm')).toBe(true);
    expect(cls.has('rounded-full')).toBe(false);
    expect(cls.has('rounded-lg')).toBe(false);
  });

  it('theme slotProps apply and instance slotProps win alongside them', () => {
    act(() => {
      patchTheme({ components: { Image: { slotProps: { img: { className: 'theme-img' } } } } });
    });
    const { container } = render(
      <Image src="/a.jpg" alt="a" slotProps={{ img: { className: 'local-img' } }} />,
    );
    const cls = classesOf(container.querySelector('img')!);
    expect(cls.has('theme-img')).toBe(true);
    expect(cls.has('local-img')).toBe(true);
  });
});
