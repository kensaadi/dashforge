// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Stack } from './Stack.js';

describe('<Stack>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<Stack>x</Stack>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('has flex + flex-col by default', () => {
      const { container } = render(<Stack>x</Stack>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex');
      expect(cls).toContain('flex-col');
    });
  });

  // ─── Direction ──────────────────────────────────────────────────────
  describe('direction', () => {
    it('row', () => {
      const { container } = render(<Stack direction="row">x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-row');
    });

    it('row-reverse', () => {
      const { container } = render(<Stack direction="row-reverse">x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-row-reverse');
    });
  });

  // ─── Align + justify ────────────────────────────────────────────────
  describe('align + justify', () => {
    it('align="center" + justify="between"', () => {
      const { container } = render(
        <Stack align="center" justify="between">x</Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('items-center');
      expect(cls).toContain('justify-between');
    });

    it('align="baseline"', () => {
      const { container } = render(<Stack align="baseline">x</Stack>);
      expect(container.firstElementChild?.className).toContain('items-baseline');
    });
  });

  // ─── Gap + wrap + sizing ────────────────────────────────────────────
  describe('gap + wrap + sizing', () => {
    it('gap={4} emits gap-4', () => {
      const { container } = render(<Stack gap={4}>x</Stack>);
      expect(container.firstElementChild?.className).toContain('gap-4');
    });

    it('gap={"0.5"} emits gap-0.5', () => {
      const { container } = render(<Stack gap="0.5">x</Stack>);
      expect(container.firstElementChild?.className).toContain('gap-0.5');
    });

    it('wrap emits flex-wrap', () => {
      const { container } = render(<Stack wrap>x</Stack>);
      expect(container.firstElementChild?.className).toContain('flex-wrap');
    });

    it('fullWidth + fullHeight', () => {
      const { container } = render(<Stack fullWidth fullHeight>x</Stack>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('w-full');
      expect(cls).toContain('h-full');
    });
  });

  // ─── Divider ─────────────────────────────────────────────────────────
  describe('divider', () => {
    it('inserts N-1 dividers between N children', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Stack>,
      );
      // 3 children + 2 dividers
      expect(container.firstElementChild?.children.length).toBe(5);
      const dividers = container.querySelectorAll('[data-testid="div"]');
      expect(dividers.length).toBe(2);
    });

    it('does NOT insert dividers when there is only one child', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>only</span>
        </Stack>,
      );
      expect(container.firstElementChild?.children.length).toBe(1);
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(0);
    });

    it('treats a Fragment as a single child for divider boundary counting', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <>
            <span>a</span>
            <span>b</span>
          </>
          <span>c</span>
        </Stack>,
      );
      // React.Children.toArray does NOT recursively flatten fragments — it
      // treats them as opaque single children. Documented behaviour: 2
      // top-level children → 1 divider between them. If you need a divider
      // BETWEEN the items inside the fragment, hoist them out of it.
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(1);
    });

    it('renders string/number divider correctly', () => {
      const { container } = render(
        <Stack divider=" · ">
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Stack>,
      );
      expect(container.firstElementChild?.textContent).toBe('a · b · c');
    });

    it('asChild silently ignores divider', () => {
      const { container } = render(
        <Stack asChild divider={<hr data-testid="div" />}>
          <nav>
            <a href="#">link</a>
          </nav>
        </Stack>,
      );
      // Slot wraps a single child — divider has nowhere to go
      expect(container.firstElementChild?.tagName).toBe('NAV');
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(0);
    });
  });

  // ─── Override + sx ──────────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults', () => {
      const { container } = render(
        <Stack direction="row" sx="flex-col">x</Stack>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex-col');
      expect(cls).not.toContain('flex-row');
    });

    it('sx can add utilities Stack does not expose (overflow)', () => {
      const { container } = render(<Stack sx="overflow-x-auto">x</Stack>);
      expect(container.firstElementChild?.className).toContain('overflow-x-auto');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="nav" renders a <nav>', () => {
      const { container } = render(<Stack as="nav">x</Stack>);
      expect(container.firstElementChild?.tagName).toBe('NAV');
    });

    it('asChild wins over as', () => {
      const { container } = render(
        <Stack as="nav" asChild>
          <header>x</header>
        </Stack>,
      );
      expect(container.firstElementChild?.tagName).toBe('HEADER');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  it('forwards data-* + aria-*', () => {
    const { container } = render(
      <Stack data-testid="s" aria-label="settings">x</Stack>,
    );
    const el = container.firstElementChild;
    expect(el?.getAttribute('data-testid')).toBe('s');
    expect(el?.getAttribute('aria-label')).toBe('settings');
  });
});
