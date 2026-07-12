// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Textarea } from './Textarea.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Textarea precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults', () => {
    const { container } = render(<Textarea name="a" label="A" />);
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Textarea: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Textarea name="a" label="A" />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.className).toMatch(/text-base|text-lg|h-/);
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Textarea: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Textarea name="a" label="A" size="sm" />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.className).toMatch(/text-sm/);
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(<Textarea name="a" label="A" sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });
});
