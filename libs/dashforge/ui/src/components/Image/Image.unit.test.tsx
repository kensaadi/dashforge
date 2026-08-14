import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Image } from './Image';

/**
 * Unit tests for the MUI `<Image>`. Covers rendering + a11y, native
 * attribute forwarding, object-fit, the loading skeleton (MUI
 * `<Skeleton>`, only with a reserved box), and the error fallback.
 *
 * Notes: `fit` / `visibility` are asserted on the img's inline style
 * (reliable in jsdom); `rounded` / `aspectRatio` land in emotion CSS
 * classes (not inline) and are exercised indirectly via the skeleton.
 */
describe('<Image> (MUI)', () => {
  describe('rendering + a11y', () => {
    it('renders an <img> with src and alt', () => {
      render(<Image src="/cat.jpg" alt="A cat" />);
      const img = screen.getByRole('img', { name: 'A cat' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/cat.jpg');
    });

    it('is lazy by default and honours loading="eager"', () => {
      const { container, rerender } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
      rerender(<Image src="/a.jpg" alt="a" loading="eager" />);
      expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
    });

    it('forwards native <img> attributes', () => {
      const { container } = render(
        <Image src="/a.jpg" alt="a" decoding="async" data-testid="x" />,
      );
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute('decoding', 'async');
      expect(img).toHaveAttribute('data-testid', 'x');
    });
  });

  describe('fit', () => {
    it('defaults object-fit to cover (inline style)', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('img')!.style.objectFit).toBe('cover');
    });

    it('maps fit to object-fit', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" fit="contain" />);
      expect(container.querySelector('img')!.style.objectFit).toBe('contain');
    });
  });

  describe('loading skeleton', () => {
    it('shows a MUI skeleton while loading when a box is reserved', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio={1} />);
      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    });

    it('removes the skeleton once the image loads', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" aspectRatio={1} />);
      fireEvent.load(container.querySelector('img')!);
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });

    it('skips the skeleton without a reserved box', () => {
      const { container } = render(<Image src="/a.jpg" alt="a" />);
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });

    it('can be turned off via showSkeleton={false}', () => {
      const { container } = render(
        <Image src="/a.jpg" alt="a" aspectRatio={1} showSkeleton={false} />,
      );
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });
  });

  describe('error fallback', () => {
    it('shows the default fallback on error and hides the broken img', () => {
      const { container } = render(<Image src="/broken.jpg" alt="a" aspectRatio={1} />);
      fireEvent.error(container.querySelector('img')!);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('img')!.style.visibility).toBe('hidden');
    });

    it('renders a custom fallback', () => {
      const { container } = render(
        <Image src="/broken.jpg" alt="a" aspectRatio={1} fallback={<span>oops</span>} />,
      );
      fireEvent.error(container.querySelector('img')!);
      expect(screen.getByText('oops')).toBeInTheDocument();
    });

    it('resets error state when src changes in place', () => {
      const { container, rerender } = render(<Image src="/broken.jpg" alt="a" aspectRatio={1} />);
      fireEvent.error(container.querySelector('img')!);
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<Image src="/good.jpg" alt="a" aspectRatio={1} />);
      expect(container.querySelector('svg')).not.toBeInTheDocument();
      expect(container.querySelector('img')!.style.visibility).not.toBe('hidden');
    });
  });
});
