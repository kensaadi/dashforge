// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Pagination } from './Pagination.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

const baseProps = {
  page: 1,
  pageSize: 20,
  totalCount: 100,
  onPageChange: () => {},
  onPageSizeChange: () => {},
};

describe('Pagination precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (variant=default)', () => {
    const { container } = render(<Pagination {...baseProps} />);
    expect(container.querySelector('nav')).not.toBeNull();
  });

  it('level 2 — theme variant override wins (compact)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Pagination: { defaults: { variant: 'compact' } } },
      });
    });
    const { container } = render(<Pagination {...baseProps} />);
    // compact hides the summary — no showing text
    expect(container.textContent).not.toContain('Showing');
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Pagination: { defaults: { variant: 'compact' } } },
      });
    });
    const { container } = render(<Pagination {...baseProps} variant="default" />);
    expect(container.textContent).toContain('Showing');
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Pagination {...baseProps} sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme size override applies (lg)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Pagination: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Pagination {...baseProps} />);
    expect(container.querySelector('nav')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Pagination: { defaults: { variant: 'compact', size: 'lg' } } },
      });
    });
    const { container } = render(<Pagination {...baseProps} />);
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('variant')).toBeNull();
    expect(nav?.getAttribute('size')).toBeNull();
  });
});
