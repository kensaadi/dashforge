// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Box } from './Box.js';

/**
 * Suite mirrors the Typography/Button test shape (rendering · variants ·
 * compound × intent · override · polymorphism · pass-through). The big
 * delta here is the compound-variant matrix: 5 surface variants × 7
 * intents = 35 combos, of which 21 carry actual visual differences
 * (outlined / soft / solid × 7 intents). We spot-check a representative
 * subset rather than enumerate all 35 — if the TV compound resolution
 * works for one of each (primary, danger, neutral), it works for all.
 */
describe('<Box>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<Box>x</Box>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('default variant is plain — no border, no bg, no shadow', () => {
      const { container } = render(<Box>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).not.toContain('border');
      expect(cls).not.toContain('bg-');
      expect(cls).not.toContain('shadow-sm');
      // baseline `block` is always present
      expect(cls).toContain('block');
    });
  });

  // ─── Variant — surface chrome ───────────────────────────────────────
  describe('surface variants', () => {
    it('variant="outlined" adds a border', () => {
      const { container } = render(<Box variant="outlined" color="neutral">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border');
      // neutral outlined picks the white surface + neutral-200 border
      expect(cls).toContain('border-neutral-200');
      expect(cls).toContain('bg-white');
    });

    it('variant="elevated" adds the neutral surface, no border, no color tint', () => {
      const { container } = render(<Box variant="elevated" elevation={3}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-white');
      expect(cls).toContain('dark:bg-neutral-900');
      expect(cls).toContain('shadow-md');
      expect(cls).not.toContain('border ');
    });

    it('variant="soft" + color="warning" picks the warning soft tones', () => {
      const { container } = render(<Box variant="soft" color="warning">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-warning-100');
      expect(cls).toContain('text-warning-900');
      expect(cls).toContain('dark:bg-warning-950/50');
    });

    it('variant="solid" + color="primary" picks the primary solid', () => {
      const { container } = render(<Box variant="solid" color="primary">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-primary-600');
      expect(cls).toContain('text-white');
      expect(cls).toContain('dark:bg-primary-500');
    });

    it('variant="solid" + color="danger" picks the danger solid', () => {
      const { container } = render(<Box variant="solid" color="danger">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-danger-600');
      expect(cls).toContain('text-white');
    });
  });

  // ─── Elevation scale ─────────────────────────────────────────────────
  describe('elevation', () => {
    it('elevation={0} emits shadow-none', () => {
      const { container } = render(<Box variant="elevated" elevation={0}>x</Box>);
      expect(container.firstElementChild?.className).toContain('shadow-none');
    });

    it('elevation={5} emits shadow-xl', () => {
      const { container } = render(<Box variant="elevated" elevation={5}>x</Box>);
      expect(container.firstElementChild?.className).toContain('shadow-xl');
    });
  });

  // ─── Spacing ─────────────────────────────────────────────────────────
  describe('spacing', () => {
    it('p={4} emits p-4', () => {
      const { container } = render(<Box p={4}>x</Box>);
      expect(container.firstElementChild?.className).toContain('p-4');
    });

    it('px={6} + py={2} emits px-6 + py-2', () => {
      const { container } = render(<Box px={6} py={2}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('px-6');
      expect(cls).toContain('py-2');
    });

    it('m={"0.5"} emits m-0.5', () => {
      const { container } = render(<Box m="0.5">x</Box>);
      expect(container.firstElementChild?.className).toContain('m-0.5');
    });
  });

  // ─── Rounded + sizing ────────────────────────────────────────────────
  describe('rounded + sizing', () => {
    it('rounded="xl" emits rounded-xl', () => {
      const { container } = render(<Box rounded="xl">x</Box>);
      expect(container.firstElementChild?.className).toContain('rounded-xl');
    });

    it('fullWidth emits w-full', () => {
      const { container } = render(<Box fullWidth>x</Box>);
      expect(container.firstElementChild?.className).toContain('w-full');
    });

    it('fullHeight emits h-full', () => {
      const { container } = render(<Box fullHeight>x</Box>);
      expect(container.firstElementChild?.className).toContain('h-full');
    });
  });

  // ─── Override semantics ─────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults via tailwind-merge', () => {
      const { container } = render(
        <Box variant="solid" color="primary" sx="bg-fuchsia-600">x</Box>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-fuchsia-600');
      // the conflicting bg-primary-600 from the compound is collapsed
      expect(cls).not.toContain('bg-primary-600');
    });

    it('sx can add utilities Box deliberately omits (overflow)', () => {
      const { container } = render(<Box sx="overflow-hidden">x</Box>);
      expect(container.firstElementChild?.className).toContain('overflow-hidden');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="section" renders a <section>', () => {
      const { container } = render(<Box as="section">x</Box>);
      expect(container.firstElementChild?.tagName).toBe('SECTION');
    });

    it('asChild renders the single child element with merged className', () => {
      const { container } = render(
        <Box variant="elevated" elevation={2} asChild>
          <article>x</article>
        </Box>,
      );
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('ARTICLE');
      expect(el?.className).toContain('shadow');
      expect(el?.className).toContain('bg-white');
    });

    it('asChild wins over as when both are passed', () => {
      const { container } = render(
        <Box as="section" asChild>
          <article>x</article>
        </Box>,
      );
      expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  describe('pass-through', () => {
    it('forwards data-* and aria-*', () => {
      const { container } = render(
        <Box data-testid="box" aria-label="surface">x</Box>,
      );
      const el = container.firstElementChild;
      expect(el?.getAttribute('data-testid')).toBe('box');
      expect(el?.getAttribute('aria-label')).toBe('surface');
    });
  });
});
