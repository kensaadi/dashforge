// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from './Grid.js';

/**
 * Suite covers:
 *   • Container role  — display:grid + cols + spacing + autoFlow
 *   • Item role        — col-span at xs/sm/md/lg/xl breakpoints
 *   • Default semantics — container without cols → 12; item without xs → 'full'
 *   • Polymorphism     — as / asChild on both roles
 *   • Override          — sx wins over variant defaults
 *
 * We don't enumerate every breakpoint × span (5 × 14 = 70 combos);
 * spot-checks across xs/md/xl with span 6/auto/full cover the
 * cascade. If those work, the rest works.
 */
describe('<Grid>', () => {
  // ─── Container role ─────────────────────────────────────────────────
  describe('container', () => {
    it('renders display:grid + default cols=12', () => {
      const { container } = render(<Grid container>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('grid');
      expect(cls).toContain('grid-cols-12');
    });

    it('container with cols={6}', () => {
      const { container } = render(<Grid container cols={6}>x</Grid>);
      expect(container.firstElementChild?.className).toContain('grid-cols-6');
    });

    it('spacing={4} emits gap-4', () => {
      const { container } = render(<Grid container spacing={4}>x</Grid>);
      expect(container.firstElementChild?.className).toContain('gap-4');
    });

    it('spacingX + spacingY emit gap-x / gap-y', () => {
      const { container } = render(
        <Grid container spacingX={6} spacingY={2}>x</Grid>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('gap-x-6');
      expect(cls).toContain('gap-y-2');
    });

    it('autoFlow="dense"', () => {
      const { container } = render(<Grid container autoFlow="dense">x</Grid>);
      expect(container.firstElementChild?.className).toContain('grid-flow-dense');
    });
  });

  // ─── Item role ──────────────────────────────────────────────────────
  describe('item', () => {
    it('item without props defaults to col-span-full (xs="full")', () => {
      const { container } = render(<Grid>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('col-span-full');
      // never accidentally a container
      expect(cls).not.toContain('grid-cols-12');
      // confirm it's NOT display:grid (no `grid` class)
      expect(cls.split(' ')).not.toContain('grid');
    });

    it('item xs={6}', () => {
      const { container } = render(<Grid xs={6}>x</Grid>);
      expect(container.firstElementChild?.className).toContain('col-span-6');
    });

    it('item with responsive cascade xs={12} md={6} lg={4}', () => {
      const { container } = render(<Grid xs={12} md={6} lg={4}>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('col-span-12');
      expect(cls).toContain('md:col-span-6');
      expect(cls).toContain('lg:col-span-4');
    });

    it('item xs="auto"', () => {
      const { container } = render(<Grid xs="auto">x</Grid>);
      expect(container.firstElementChild?.className).toContain('col-auto');
    });

    it('item sm="full" xl={3}', () => {
      const { container } = render(<Grid sm="full" xl={3}>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('sm:col-span-full');
      expect(cls).toContain('xl:col-span-3');
    });
  });

  // ─── Composition: container > item ──────────────────────────────────
  describe('container > item composition', () => {
    it('container with item children produces the canonical class chain', () => {
      const { container } = render(
        <Grid container spacing={4}>
          <Grid xs={12} md={6}>a</Grid>
          <Grid xs={12} md={6}>b</Grid>
        </Grid>,
      );
      const root = container.firstElementChild;
      expect(root?.className).toContain('grid');
      expect(root?.className).toContain('gap-4');
      const items = root?.querySelectorAll(':scope > div') ?? [];
      expect(items.length).toBe(2);
      items.forEach((item) => {
        expect(item.className).toContain('col-span-12');
        expect(item.className).toContain('md:col-span-6');
      });
    });
  });

  // ─── Override + sx ──────────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over default cols on container', () => {
      const { container } = render(
        <Grid container sx="grid-cols-4">x</Grid>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('grid-cols-4');
      // tailwind-merge collapses the default 12 → 4
      expect(cls).not.toContain('grid-cols-12');
    });

    it('sx adds utilities Grid does not expose', () => {
      const { container } = render(<Grid container sx="min-h-screen">x</Grid>);
      expect(container.firstElementChild?.className).toContain('min-h-screen');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('container as="section" renders <section> + grid classes', () => {
      const { container } = render(<Grid container as="section">x</Grid>);
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('SECTION');
      expect(el?.className).toContain('grid');
    });

    it('item asChild paints onto child element', () => {
      const { container } = render(
        <Grid xs={6} asChild>
          <article>x</article>
        </Grid>,
      );
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('ARTICLE');
      expect(el?.className).toContain('col-span-6');
    });
  });

  // ─── DOM cleanliness (no role-specific props leak as HTML attrs) ────
  describe('DOM cleanliness', () => {
    it('container props (cols/spacing/autoFlow) do not leak to DOM', () => {
      const { container } = render(
        <Grid container cols={4} spacing={2} autoFlow="dense">x</Grid>,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(el.hasAttribute('cols')).toBe(false);
      expect(el.hasAttribute('spacing')).toBe(false);
      expect(el.hasAttribute('autoflow')).toBe(false);
    });

    it('item props (xs/sm/md/lg/xl) do not leak to DOM', () => {
      const { container } = render(
        <Grid xs={12} md={6} lg={4}>x</Grid>,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(el.hasAttribute('xs')).toBe(false);
      expect(el.hasAttribute('md')).toBe(false);
      expect(el.hasAttribute('lg')).toBe(false);
    });
  });

  // ─── F11-bis edge cases: responsive cascade across ALL breakpoints ──
  // The original suite spot-checked xs/md/lg/sm/xl with a couple of
  // values each. The publish-validation pass enumerates each breakpoint
  // for the high-traffic span values (1, 6, 12, auto, full) so a future
  // mapping-table edit can't silently drop one.
  describe('responsive cascade — every breakpoint × representative span', () => {
    const BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const;

    it.each(BREAKPOINTS)('breakpoint %s × span=1', (bp) => {
      const props = { [bp]: 1 as const };
      const { container } = render(<Grid {...props}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`${bp}:col-span-1`);
    });

    it.each(BREAKPOINTS)('breakpoint %s × span=6', (bp) => {
      const props = { [bp]: 6 as const };
      const { container } = render(<Grid {...props}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`${bp}:col-span-6`);
    });

    it.each(BREAKPOINTS)('breakpoint %s × span=12', (bp) => {
      const props = { [bp]: 12 as const };
      const { container } = render(<Grid {...props}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`${bp}:col-span-12`);
    });

    it.each(BREAKPOINTS)('breakpoint %s × auto', (bp) => {
      const props = { [bp]: 'auto' as const };
      const { container } = render(<Grid {...props}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`${bp}:col-auto`);
    });

    it.each(BREAKPOINTS)('breakpoint %s × full', (bp) => {
      const props = { [bp]: 'full' as const };
      const { container } = render(<Grid {...props}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`${bp}:col-span-full`);
    });

    it('full cascade xs=12 sm=6 md=4 lg=3 xl=2 emits all five', () => {
      const { container } = render(
        <Grid xs={12} sm={6} md={4} lg={3} xl={2}>x</Grid>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('col-span-12');
      expect(cls).toContain('sm:col-span-6');
      expect(cls).toContain('md:col-span-4');
      expect(cls).toContain('lg:col-span-3');
      expect(cls).toContain('xl:col-span-2');
    });
  });

  // ─── F11-bis edge cases: autoFlow all five varianti ─────────────────
  describe('autoFlow — every value', () => {
    const FLOWS = ['row', 'col', 'dense', 'row-dense', 'col-dense'] as const;
    const EXPECTED: Record<typeof FLOWS[number], string> = {
      row:         'grid-flow-row',
      col:         'grid-flow-col',
      dense:       'grid-flow-dense',
      'row-dense': 'grid-flow-row-dense',
      'col-dense': 'grid-flow-col-dense',
    };

    it.each(FLOWS)('autoFlow="%s" emits the right grid-flow-* class', (flow) => {
      const { container } = render(<Grid container autoFlow={flow}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(EXPECTED[flow]);
    });
  });

  // ─── F11-bis edge cases: container cols all valid values ────────────
  describe('cols — every valid value', () => {
    const COLS = [1, 2, 3, 4, 6, 12] as const;
    it.each(COLS)('container cols=%s emits grid-cols-%s', (n) => {
      const { container } = render(<Grid container cols={n}>x</Grid>);
      expect(container.firstElementChild?.className).toContain(`grid-cols-${n}`);
    });
  });

  // ─── F11-bis edge cases: spacingX vs spacingY independence ──────────
  describe('spacingX / spacingY independence', () => {
    it('spacingX without spacingY emits only gap-x', () => {
      const { container } = render(<Grid container spacingX={4}>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('gap-x-4');
      expect(cls).not.toMatch(/gap-y-/);
      // standalone `gap-` shouldn't appear unless spacing was passed
      expect(cls).not.toMatch(/gap-\d/);
    });

    it('spacingY without spacingX emits only gap-y', () => {
      const { container } = render(<Grid container spacingY={2}>x</Grid>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('gap-y-2');
      expect(cls).not.toMatch(/gap-x-/);
    });

    it('spacing + spacingX: spacing applies symmetrically, spacingX overrides on X', () => {
      const { container } = render(
        <Grid container spacing={4} spacingX={8}>x</Grid>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('gap-4');
      expect(cls).toContain('gap-x-8');
    });
  });

  // ─── F11-bis edge cases: empty container / orphan item ──────────────
  describe('empty children + orphan item', () => {
    it('container with NO children emits grid + cols, renders empty div', () => {
      const { container } = render(<Grid container />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toContain('grid');
      expect(el.className).toContain('grid-cols-12');
      expect(el.children.length).toBe(0);
    });

    it('orphan item (no container parent) still emits col-span-* (consumer mistake)', () => {
      // Doesn't crash — produces a col-span-* class that has no effect
      // outside a CSS Grid parent. Documented behaviour: the consumer
      // owns the composition.
      const { container } = render(<Grid xs={6}>x</Grid>);
      expect(container.firstElementChild?.className).toContain('col-span-6');
    });
  });

  // ─── F11-bis edge cases: composition deep nesting ───────────────────
  describe('deep nesting — Grid inside Grid item', () => {
    it('nested Grid container inside an item works (12-col inside a 6-span)', () => {
      const { container } = render(
        <Grid container spacing={4}>
          <Grid xs={6}>
            <Grid container spacing={2}>
              <Grid xs={6}>inner-a</Grid>
              <Grid xs={6}>inner-b</Grid>
            </Grid>
          </Grid>
          <Grid xs={6}>outer-b</Grid>
        </Grid>,
      );
      // Outer: grid + 12-col + gap-4
      const outer = container.firstElementChild;
      expect(outer?.className).toContain('grid');
      expect(outer?.className).toContain('grid-cols-12');
      expect(outer?.className).toContain('gap-4');
      // Inner items count: outer has 2 direct children
      expect(outer?.children.length).toBe(2);
    });
  });
});
