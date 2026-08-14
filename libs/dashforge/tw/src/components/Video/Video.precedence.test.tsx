// @vitest-environment jsdom
/**
 * Option C precedence chain — Video (mirrors the Image precedence test).
 *
 * Locks the 4-level override order:
 *   1. `defaultVariants` from tailwind-variants (videoVariants recipe)
 *   2. Theme override via `patchTheme({ components: { Video: { defaults } } })`
 *   3. Instance prop (`<Video fit="fill" />`)
 *   4. `sx` — final utility-class layer via tailwind-merge
 *
 * `fit` lands on the `video` slot, `rounded` on the `root` slot; `sx`
 * targets the root, so the level-4 assertion uses `rounded`.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Video } from './Video.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Video precedence chain — Option C', () => {
  it('level 1 — TV defaultVariants: fit=cover (video), rounded=none (root)', () => {
    const { container } = render(<Video src="/a.mp4" />);
    expect(classesOf(container.querySelector('video')!).has('object-cover')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-none')).toBe(true);
  });

  it('level 2 — theme defaults win over TV defaults', () => {
    act(() => {
      patchTheme({ components: { Video: { defaults: { fit: 'contain', rounded: 'lg' } } } });
    });
    const { container } = render(<Video src="/a.mp4" />);
    expect(classesOf(container.querySelector('video')!).has('object-contain')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-lg')).toBe(true);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      patchTheme({ components: { Video: { defaults: { fit: 'contain', rounded: 'lg' } } } });
    });
    const { container } = render(<Video src="/a.mp4" fit="fill" rounded="full" />);
    expect(classesOf(container.querySelector('video')!).has('object-fill')).toBe(true);
    expect(classesOf(container.firstChild as HTMLElement).has('rounded-full')).toBe(true);
  });

  it('level 4 — sx wins over theme + prop on the root (tailwind-merge)', () => {
    act(() => {
      patchTheme({ components: { Video: { defaults: { rounded: 'lg' } } } });
    });
    const { container } = render(<Video src="/a.mp4" rounded="full" sx="rounded-sm" />);
    const cls = classesOf(container.firstChild as HTMLElement);
    expect(cls.has('rounded-sm')).toBe(true);
    expect(cls.has('rounded-full')).toBe(false);
    expect(cls.has('rounded-lg')).toBe(false);
  });

  it('theme slotProps apply and instance slotProps win alongside them', () => {
    act(() => {
      patchTheme({ components: { Video: { slotProps: { video: { className: 'theme-video' } } } } });
    });
    const { container } = render(
      <Video src="/a.mp4" slotProps={{ video: { className: 'local-video' } }} />,
    );
    const cls = classesOf(container.querySelector('video')!);
    expect(cls.has('theme-video')).toBe(true);
    expect(cls.has('local-video')).toBe(true);
  });
});
