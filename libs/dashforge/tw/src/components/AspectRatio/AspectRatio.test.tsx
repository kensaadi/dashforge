// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AspectRatio } from './AspectRatio.js';

describe('<AspectRatio>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<AspectRatio>x</AspectRatio>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('default ratio is 1 (square)', () => {
      const { container } = render(<AspectRatio>x</AspectRatio>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.aspectRatio).toBe('1 / 1');
    });

    it('always has w-full baseline', () => {
      const { container } = render(<AspectRatio>x</AspectRatio>);
      expect(container.firstElementChild?.className).toContain('w-full');
    });
  });

  // ─── ratio prop ─────────────────────────────────────────────────────
  describe('ratio', () => {
    it('numeric ratio 16/9 → "1.7777… / 1"', () => {
      const { container } = render(<AspectRatio ratio={16 / 9}>x</AspectRatio>);
      const el = container.firstElementChild as HTMLElement;
      // 16/9 ≈ 1.7777, formatted as "<number> / 1"
      expect(el.style.aspectRatio).toMatch(/^1\.\d+ \/ 1$/);
    });

    it('numeric ratio 4/3', () => {
      const { container } = render(<AspectRatio ratio={4 / 3}>x</AspectRatio>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.aspectRatio).toMatch(/^1\.\d+ \/ 1$/);
    });

    it('string ratio "16 / 9" passes through', () => {
      const { container } = render(<AspectRatio ratio="16 / 9">x</AspectRatio>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.aspectRatio).toBe('16 / 9');
    });

    it('string ratio "21/9" passes through (ultrawide)', () => {
      const { container } = render(<AspectRatio ratio="21/9">x</AspectRatio>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.aspectRatio).toBe('21/9');
    });
  });

  // ─── Override ───────────────────────────────────────────────────────
  describe('override', () => {
    it('sx adds utility classes', () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9} sx="rounded-xl overflow-hidden">
          x
        </AspectRatio>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('rounded-xl');
      expect(cls).toContain('overflow-hidden');
    });

    it('user style merges with aspect-ratio', () => {
      const { container } = render(
        <AspectRatio ratio={1} style={{ backgroundColor: 'red' }}>x</AspectRatio>,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.backgroundColor).toBe('red');
      expect(el.style.aspectRatio).toBe('1 / 1');
    });

    it('user style aspect-ratio overrides the prop (last wins)', () => {
      const { container } = render(
        <AspectRatio ratio={1} style={{ aspectRatio: '2 / 1' }}>x</AspectRatio>,
      );
      const el = container.firstElementChild as HTMLElement;
      // Inline style merge — user's later spread wins
      expect(el.style.aspectRatio).toBe('2 / 1');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="figure" renders <figure>', () => {
      const { container } = render(
        <AspectRatio as="figure" ratio={1}>x</AspectRatio>,
      );
      expect(container.firstElementChild?.tagName).toBe('FIGURE');
    });

    it('as="picture" works for responsive image markup', () => {
      const { container } = render(
        <AspectRatio as="picture" ratio={16 / 9}>
          <img src="x.jpg" alt="" />
        </AspectRatio>,
      );
      expect(container.firstElementChild?.tagName).toBe('PICTURE');
    });
  });

  // ─── Child rendering ────────────────────────────────────────────────
  describe('child rendering', () => {
    it('renders an <img> child', () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="hero.jpg" alt="hero" className="w-full h-full object-cover" />
        </AspectRatio>,
      );
      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBe('hero.jpg');
    });

    it('renders multiple children (e.g. overlay pattern)', () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="hero.jpg" alt="hero" />
          <div className="absolute inset-0 bg-black/40" />
        </AspectRatio>,
      );
      expect(container.firstElementChild?.children.length).toBe(2);
    });
  });

  // ─── Pass-through ───────────────────────────────────────────────────
  it('forwards data-* + aria-*', () => {
    const { container } = render(
      <AspectRatio data-testid="ar" aria-label="hero">x</AspectRatio>,
    );
    const el = container.firstElementChild;
    expect(el?.getAttribute('data-testid')).toBe('ar');
    expect(el?.getAttribute('aria-label')).toBe('hero');
  });

  // ─── F11-bis edge cases ─────────────────────────────────────────────
  describe('extreme ratio values', () => {
    it('ratio="21 / 9" (ultrawide cinema) passes through verbatim', () => {
      const { container } = render(<AspectRatio ratio="21 / 9">x</AspectRatio>);
      expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('21 / 9');
    });

    it('ratio="9 / 16" (portrait video) passes through verbatim', () => {
      const { container } = render(<AspectRatio ratio="9 / 16">x</AspectRatio>);
      expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('9 / 16');
    });

    it('numeric tiny ratio (0.5) formats as "0.5 / 1"', () => {
      const { container } = render(<AspectRatio ratio={0.5}>x</AspectRatio>);
      expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('0.5 / 1');
    });

    it('numeric large ratio (3) formats as "3 / 1"', () => {
      const { container } = render(<AspectRatio ratio={3}>x</AspectRatio>);
      expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('3 / 1');
    });
  });

  describe('rounded clipped media pattern (the #1 doc gotcha)', () => {
    it('rounded + overflow-hidden both end up on the className', () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9} sx="rounded-2xl overflow-hidden">
          <img src="x.jpg" alt="" className="w-full h-full object-cover" />
        </AspectRatio>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('rounded-2xl');
      expect(cls).toContain('overflow-hidden');
    });
  });
});
