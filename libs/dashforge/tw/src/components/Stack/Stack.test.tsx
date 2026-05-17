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

  // ─── F11-bis edge cases: divider with array / null / mixed children ─
  describe('divider edge cases', () => {
    it('children passed as an array still gets N-1 dividers', () => {
      // Children.toArray handles arrays the same as iterated siblings —
      // the divider count is items.length - 1 regardless of how the
      // children were passed in.
      const items = ['a', 'b', 'c', 'd'];
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          {items.map((t) => <span key={t}>{t}</span>)}
        </Stack>,
      );
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(3);
    });

    it('null children are stripped before divider insertion', () => {
      // React's Children.toArray filters out null/undefined/false before
      // returning the flat array — so a conditional child collapses to
      // nothing and dividers are sized to the remaining set.
      const showB = false;
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          <span>a</span>
          {showB && <span>b</span>}
          <span>c</span>
        </Stack>,
      );
      // After stripping `false`: 2 effective children → 1 divider
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(1);
    });

    it('mixed text + element children — divider between EVERY pair', () => {
      const { container } = render(
        <Stack divider={<hr data-testid="div" />}>
          {'plain string'}
          <span>element child</span>
          {42}
          <span>last</span>
        </Stack>,
      );
      // 4 effective children (Children.toArray wraps primitives) → 3 dividers
      expect(container.querySelectorAll('[data-testid="div"]').length).toBe(3);
    });

    it('nested Stack inside Stack with divider — inner Stack counts as 1 child', () => {
      const { container } = render(
        <Stack gap={2} divider={<hr data-testid="outer-div" />}>
          <span>top</span>
          <Stack gap={1} direction="row">
            <span>nested-a</span>
            <span>nested-b</span>
          </Stack>
          <span>bottom</span>
        </Stack>,
      );
      // Outer has 3 effective children → 2 outer dividers
      expect(container.querySelectorAll('[data-testid="outer-div"]').length).toBe(2);
    });

    it('divider key is stable across re-renders (no key warning)', () => {
      // Re-rendering with the same children + divider shouldn't produce
      // React key warnings. We assert nothing throws + the structure is
      // identical to a single render.
      const { container, rerender } = render(
        <Stack divider={<hr data-testid="d" />}>
          <span>a</span>
          <span>b</span>
        </Stack>,
      );
      const firstRender = container.innerHTML;
      rerender(
        <Stack divider={<hr data-testid="d" />}>
          <span>a</span>
          <span>b</span>
        </Stack>,
      );
      expect(container.innerHTML).toBe(firstRender);
    });
  });

  // ─── F11-bis edge cases: gap value coverage ─────────────────────────
  describe('gap — every token step', () => {
    const GAPS = [0, '0.5', 1, 2, 3, 4, 6, 8, 12, 16, 24] as const;
    it.each(GAPS)('gap=%s emits gap-%s', (g) => {
      const { container } = render(<Stack gap={g}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`gap-${g}`);
    });
  });

  // ─── F11-bis edge cases: align / justify all values ─────────────────
  describe('align + justify — all valid values', () => {
    const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
    const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

    it.each(ALIGNS)('align="%s"', (v) => {
      const { container } = render(<Stack align={v}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`items-${v}`);
    });

    it.each(JUSTIFIES)('justify="%s"', (v) => {
      const { container } = render(<Stack justify={v}>x</Stack>);
      expect(container.firstElementChild?.className).toContain(`justify-${v}`);
    });
  });

  // ─── F11-bis edge cases: empty Stack ────────────────────────────────
  describe('empty Stack', () => {
    it('renders an empty div with flex classes', () => {
      const { container } = render(<Stack gap={4} />);
      const el = container.firstElementChild;
      expect(el?.children.length).toBe(0);
      expect(el?.className).toContain('flex');
      expect(el?.className).toContain('gap-4');
    });

    it('empty Stack with divider does NOT render the divider', () => {
      const { container } = render(<Stack divider={<hr data-testid="d" />} />);
      expect(container.querySelectorAll('[data-testid="d"]').length).toBe(0);
    });
  });
});
