// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Image } from './Image.js';

void React;
afterEach(() => cleanup());

const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: 'photo', action: 'read', effect: 'allow' },
        { resource: 'photo', action: 'edit', effect: 'deny' },
      ],
    },
  ],
};
const viewer: Subject = { id: 'v', roles: ['viewer'] };

/**
 * Unit tests for <Image>. Covers:
 *   - Rendering + a11y (img, alt/role, native attr + ref forwarding)
 *   - fit → object-*  and  rounded token → root
 *   - aspectRatio → CSS aspect-ratio (no layout shift)
 *   - Loading skeleton (only with a reserved box; removed on load)
 *   - Error fallback (default glyph + custom; img hidden; reset on src change)
 *   - sx / slotProps overrides
 */
describe('<Image>', () => {
  describe('rendering + a11y', () => {
    it('renders an <img> with src and alt', () => {
      render(<Image src="/cat.jpg" alt="A cat" />);
      const img = screen.getByRole('img', { name: 'A cat' });
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('/cat.jpg');
    });

    it('is lazy by default and honours loading="eager"', () => {
      const { container, rerender } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('img')!.getAttribute('loading')).toBe('lazy');
      rerender(<Image src="/a.jpg" alt="a" loading="eager" />);
      expect(container.querySelector('img')!.getAttribute('loading')).toBe('eager');
    });

    it('forwards native <img> attributes and the ref', () => {
      const ref = React.createRef<HTMLImageElement>();
      const { container } = render(
        <Image ref={ref} src="/a.jpg" alt="a" decoding="async" data-testid="x" />,
      );
      const img = container.querySelector('img')!;
      expect(ref.current).toBe(img);
      expect(img.getAttribute('decoding')).toBe('async');
      expect(img.getAttribute('data-testid')).toBe('x');
    });
  });

  describe('fit + rounded', () => {
    it('defaults to object-cover', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('img')!.className).toContain('object-cover');
    });

    it('maps fit to object-*', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" fit="contain" />);
      expect(container.querySelector('img')!.className).toContain('object-contain');
    });

    it('applies the rounded token to the root', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" rounded="full" />);
      expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
    });
  });

  describe('aspect ratio (no layout shift)', () => {
    it('sets CSS aspect-ratio on the root from a number', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio={16 / 9} />);
      expect((container.firstChild as HTMLElement).style.aspectRatio).toBe(`${16 / 9} / 1`);
    });

    it('accepts a CSS aspect-ratio string', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio="4 / 3" />);
      expect((container.firstChild as HTMLElement).style.aspectRatio).toBe('4 / 3');
    });
  });

  describe('loading skeleton', () => {
    it('shows a skeleton while loading when a box is reserved', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio={1} />);
      expect(container.querySelector('[role="presentation"]')).toBeTruthy();
    });

    it('removes the skeleton once the image loads', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio={1} />);
      fireEvent.load(container.querySelector('img')!);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });

    it('skips the skeleton without a reserved box', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });

    it('can be turned off via showSkeleton={false}', () => {
      const { container } = render(
        <Image src="/a.jpg" alt="a" aspectRatio={1} showSkeleton={false} />,
      );
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });
  });

  describe('error fallback', () => {
    it('shows the default fallback on error and hides the broken img', () => {
      const { container } = render(<Image src="/broken.jpg" alt="a" aspectRatio={1} />);
      fireEvent.error(container.querySelector('img')!);
      expect(container.querySelector('svg')).toBeTruthy();
      expect(container.querySelector('img')!.style.visibility).toBe('hidden');
    });

    it('renders a custom fallback', () => {
      const { container, getByText } = render(
        <Image src="/broken.jpg" alt="a" aspectRatio={1} fallback={<span>oops</span>} />,
      );
      fireEvent.error(container.querySelector('img')!);
      expect(getByText('oops')).toBeTruthy();
    });

    it('resets error state when src changes in place', () => {
      const { container, rerender } = render(<Image src="/broken.jpg" alt="a" aspectRatio={1} />);
      fireEvent.error(container.querySelector('img')!);
      expect(container.querySelector('svg')).toBeTruthy();

      rerender(<Image src="/good.jpg" alt="a" aspectRatio={1} />);
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('img')!.style.visibility).not.toBe('hidden');
    });
  });

  describe('overrides', () => {
    it('sx wins on the root via tailwind-merge', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" rounded="lg" sx="rounded-sm" />);
      const cls = (container.firstChild as HTMLElement).className;
      expect(cls).toContain('rounded-sm');
      expect(cls).not.toContain('rounded-lg');
    });

    it('applies slotProps.img className to the img', () => {
      const { container } = render(
        <Image src="/a.jpg" alt="a" slotProps={{ img: { className: 'grayscale' } }} />,
      );
      expect(container.querySelector('img')!.className).toContain('grayscale');
    });
  });

  describe('access (RBAC) + visibleWhen', () => {
    it('renders when access is granted', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Image src="/a.jpg" alt="a" access={{ resource: 'photo', action: 'read' }} />
        </RbacProvider>,
      );
      expect(container.querySelector('img')).toBeTruthy();
    });

    it('hides when access is denied with onUnauthorized="hide"', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Image src="/a.jpg" alt="a" access={{ resource: 'photo', action: 'edit', onUnauthorized: 'hide' }} />
        </RbacProvider>,
      );
      expect(container.querySelector('img')).toBeNull();
    });

    it('dims (aria-disabled) when denied with onUnauthorized="disable"', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Image src="/a.jpg" alt="a" access={{ resource: 'photo', action: 'edit', onUnauthorized: 'disable' }} />
        </RbacProvider>,
      );
      const root = container.firstChild as HTMLElement;
      expect(container.querySelector('img')).toBeTruthy();
      expect(root.getAttribute('aria-disabled')).toBe('true');
      expect(root.className).toContain('opacity-60');
    });

    it('renders normally when visibleWhen is not provided', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('img')).toBeTruthy();
    });
  });
});
