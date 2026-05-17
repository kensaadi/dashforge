// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Container } from './Container.js';

describe('<Container>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<Container>x</Container>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('has mx-auto + w-full baseline', () => {
      const { container } = render(<Container>x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('mx-auto');
      expect(cls).toContain('w-full');
    });

    it('default size is xl (max-w-screen-xl)', () => {
      const { container } = render(<Container>x</Container>);
      expect(container.firstElementChild?.className).toContain('max-w-screen-xl');
    });

    it('default px is true — responsive padding ramp', () => {
      const { container } = render(<Container>x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('px-4');
      expect(cls).toContain('sm:px-6');
      expect(cls).toContain('lg:px-8');
    });

    it('default centerContent is false — no flex column', () => {
      const { container } = render(<Container>x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      // baseline doesn't include flex
      expect(cls.split(' ')).not.toContain('flex');
    });
  });

  // ─── Size axis ──────────────────────────────────────────────────────
  describe('size', () => {
    it('size="sm"', () => {
      const { container } = render(<Container size="sm">x</Container>);
      expect(container.firstElementChild?.className).toContain('max-w-screen-sm');
    });

    it('size="lg"', () => {
      const { container } = render(<Container size="lg">x</Container>);
      expect(container.firstElementChild?.className).toContain('max-w-screen-lg');
    });

    it('size="2xl"', () => {
      const { container } = render(<Container size="2xl">x</Container>);
      expect(container.firstElementChild?.className).toContain('max-w-screen-2xl');
    });

    it('size="fluid" emits no max-w-* class', () => {
      const { container } = render(<Container size="fluid">x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).not.toContain('max-w-screen');
      // still mx-auto + w-full baseline
      expect(cls).toContain('mx-auto');
    });
  });

  // ─── Padding axis ───────────────────────────────────────────────────
  describe('padding', () => {
    it('px={false} skips the responsive padding ramp', () => {
      const { container } = render(<Container px={false}>x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).not.toContain('px-4');
      expect(cls).not.toContain('sm:px-6');
    });
  });

  // ─── Center content ─────────────────────────────────────────────────
  describe('centerContent', () => {
    it('centerContent turns into flex column items-center', () => {
      const { container } = render(<Container centerContent>x</Container>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex');
      expect(cls).toContain('flex-col');
      expect(cls).toContain('items-center');
    });
  });

  // ─── Override semantics ─────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over default size via tailwind-merge', () => {
      const { container } = render(
        <Container sx="max-w-3xl">x</Container>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('max-w-3xl');
      // tailwind-merge collapses the conflicting max-w-screen-xl
      expect(cls).not.toContain('max-w-screen-xl');
    });

    it('sx can add vertical padding (Container does not expose it)', () => {
      const { container } = render(<Container sx="py-12">x</Container>);
      expect(container.firstElementChild?.className).toContain('py-12');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="main" renders <main> with Container chrome', () => {
      const { container } = render(<Container as="main">x</Container>);
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('MAIN');
      expect(el?.className).toContain('mx-auto');
    });

    it('asChild paints onto the child element', () => {
      const { container } = render(
        <Container size="lg" asChild>
          <article>x</article>
        </Container>,
      );
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('ARTICLE');
      expect(el?.className).toContain('max-w-screen-lg');
    });

    it('asChild wins over as when both are passed', () => {
      const { container } = render(
        <Container as="main" asChild>
          <section>x</section>
        </Container>,
      );
      expect(container.firstElementChild?.tagName).toBe('SECTION');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  describe('pass-through', () => {
    it('forwards data-* + aria-*', () => {
      const { container } = render(
        <Container data-testid="c" aria-label="page">x</Container>,
      );
      const el = container.firstElementChild;
      expect(el?.getAttribute('data-testid')).toBe('c');
      expect(el?.getAttribute('aria-label')).toBe('page');
    });
  });
});
