// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link.js';

describe('<Link>', () => {
  // ─── Base rendering ─────────────────────────────────────────────────
  describe('base rendering', () => {
    it('renders an <a> with the passed href', () => {
      render(<Link href="/dashboard">Go</Link>);
      const a = screen.getByRole('link', { name: 'Go' });
      expect(a.tagName).toBe('A');
      expect(a.getAttribute('href')).toBe('/dashboard');
    });

    it('applies default variants (primary + hover-underline + normal + md)', () => {
      const { container } = render(<Link href="/x">Go</Link>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('text-primary-700');
      expect(cls).toContain('hover:underline');
      expect(cls).toContain('font-normal');
      expect(cls).toContain('text-base');
    });

    it('is keyboard-focusable and carries a visible focus ring', () => {
      const { container } = render(<Link href="/x">Go</Link>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('focus-visible:ring-2');
      expect(cls).toContain('focus-visible:ring-primary-500');
    });

    it('forwards a ref to the underlying <a>', () => {
      const ref = { current: null as HTMLAnchorElement | null };
      render(<Link ref={(el) => { ref.current = el; }} href="/x">Go</Link>);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('A');
    });
  });

  // ─── Variant axes ───────────────────────────────────────────────────
  describe('variant axes', () => {
    it('color="danger" is NOT accepted (TS-narrowed axis), but color="muted" is', () => {
      const { container } = render(<Link href="/x" color="muted">Go</Link>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('text-neutral-600');
    });

    it('underline="always" persists the underline', () => {
      const { container } = render(<Link href="/x" underline="always">Go</Link>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('underline');
      expect(cls).toContain('underline-offset-2');
      expect(cls).not.toContain('hover:underline');
    });

    it('underline="none" strips underline entirely', () => {
      const { container } = render(<Link href="/x" underline="none">Go</Link>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('no-underline');
    });

    it('weight="semibold" emits font-semibold', () => {
      const { container } = render(<Link href="/x" weight="semibold">Go</Link>);
      expect(container.firstElementChild?.className).toContain('font-semibold');
    });

    it('size="xs" emits text-xs', () => {
      const { container } = render(<Link href="/x" size="xs">Go</Link>);
      expect(container.firstElementChild?.className).toContain('text-xs');
    });

    it('color="inherit" opts out — paints from the parent surface', () => {
      const { container } = render(<Link href="/x" color="inherit">Go</Link>);
      expect(container.firstElementChild?.className).toContain('text-inherit');
    });
  });

  // ─── Slots (icons as arbitrary ReactNode) ───────────────────────────
  describe('icon slots', () => {
    it('renders startIcon before the text', () => {
      const { container } = render(
        <Link href="/x" startIcon={<span data-testid="s">★</span>}>Go</Link>,
      );
      const a = container.firstElementChild as HTMLElement;
      const first = a.firstElementChild;
      expect(first?.querySelector('[data-testid="s"]')).toBeTruthy();
    });

    it('renders endIcon after the text', () => {
      const { container } = render(
        <Link href="/x" endIcon={<span data-testid="e">↗</span>}>Go</Link>,
      );
      const a = container.firstElementChild as HTMLElement;
      const last = a.lastElementChild;
      expect(last?.querySelector('[data-testid="e"]')).toBeTruthy();
    });

    it('accepts an <img> as an icon (S3-style URL scenario)', () => {
      const { container } = render(
        <Link href="/x" startIcon={<img src="https://s3.example.com/logo.svg" alt="" width={16} />}>
          Brand
        </Link>,
      );
      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('https://s3.example.com/logo.svg');
    });

    it('omits the icon wrapper span when no icon is passed', () => {
      const { container } = render(<Link href="/x">Go</Link>);
      // Only the text node, no wrapper spans.
      expect(container.firstElementChild?.children.length).toBe(0);
    });

    it('applies slotProps.startIcon.className to the leading wrapper', () => {
      const { container } = render(
        <Link
          href="/x"
          startIcon={<span data-testid="s">★</span>}
          slotProps={{ startIcon: { className: 'text-red-500' } }}
        >
          Go
        </Link>,
      );
      const wrapper = container.firstElementChild?.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain('text-red-500');
      // Base classes stay too.
      expect(wrapper.className).toContain('inline-flex');
    });
  });

  // ─── external behavior ─────────────────────────────────────────────
  describe('external prop', () => {
    it('sets target="_blank" and rel="noopener noreferrer" when true', () => {
      render(<Link href="https://ex.com" external>Ex</Link>);
      const a = screen.getByRole('link', { name: 'Ex' });
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('does NOT append any auto-glyph (dev owns the visual affordance)', () => {
      const { container } = render(<Link href="https://ex.com" external>Ex</Link>);
      // Only the text; no injected trailing span.
      expect(container.firstElementChild?.children.length).toBe(0);
      expect(container.firstElementChild?.textContent).toBe('Ex');
    });

    it('honours consumer-supplied target / rel — does NOT overwrite', () => {
      render(
        <Link href="https://ex.com" external target="_self" rel="me">
          Ex
        </Link>,
      );
      const a = screen.getByRole('link', { name: 'Ex' });
      expect(a.getAttribute('target')).toBe('_self');
      expect(a.getAttribute('rel')).toBe('me');
    });

    it('leaves target / rel unset when external is false', () => {
      render(<Link href="/internal">Go</Link>);
      const a = screen.getByRole('link', { name: 'Go' });
      expect(a.hasAttribute('target')).toBe(false);
      expect(a.hasAttribute('rel')).toBe(false);
    });
  });

  // ─── asChild — Radix Slot polymorphism ─────────────────────────────
  describe('asChild polymorphism', () => {
    it('paints Link classes onto the child element instead of wrapping', () => {
      const { container } = render(
        <Link asChild color="primary" underline="always">
          <button type="button" data-testid="child">Go</button>
        </Link>,
      );
      // No wrapping <a> — the child <button> is the root.
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('BUTTON');
      expect(root.getAttribute('data-testid')).toBe('child');
      // Link classes applied to it.
      expect(root.className).toContain('text-primary-700');
      expect(root.className).toContain('underline');
    });

    it('does not render startIcon / endIcon when asChild is true', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { container } = render(
        <Link asChild startIcon={<span data-testid="s">★</span>}>
          <a href="/x">Go</a>
        </Link>,
      );
      expect(container.querySelector('[data-testid="s"]')).toBeNull();
      warnSpy.mockRestore();
    });

    it('warns in dev when startIcon / endIcon are passed with asChild', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(
        <Link asChild endIcon={<span>↗</span>}>
          <a href="/x">Go</a>
        </Link>,
      );
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('asChild');
      warnSpy.mockRestore();
    });
  });

  // ─── sx + slotProps escape hatches ─────────────────────────────────
  describe('escape hatches', () => {
    it('sx appends utility classes that win via tailwind-merge', () => {
      const { container } = render(
        <Link href="/x" color="primary" sx="text-red-500">Go</Link>,
      );
      const cls = container.firstElementChild?.className ?? '';
      // Consumer sx wins on color — variant primary is dropped.
      expect(cls).toContain('text-red-500');
      expect(cls).not.toContain('text-primary-700');
    });

    it('slotProps.root.className merges into the root class chain', () => {
      const { container } = render(
        <Link href="/x" slotProps={{ root: { className: 'w-full' } }}>Go</Link>,
      );
      expect(container.firstElementChild?.className).toContain('w-full');
    });
  });

  // ─── #112 safety-net — className sneak-in ──────────────────────────
  it('#112: preserves variant classes when className is smuggled via spread', () => {
    const smuggled = { className: 'min-h-0' } as Record<string, unknown>;
    const { container } = render(
      <Link href="/x" color="primary" {...(smuggled as never)}>Go</Link>,
    );
    const cls = container.firstElementChild?.className ?? '';
    expect(cls).toContain('text-primary-700');
    expect(cls).toContain('min-h-0');
  });
});
