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
});
