import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { Video } from './Video';

/**
 * Unit tests for the MUI `<Video>`. Covers rendering, native attribute
 * forwarding, `<source>` children, object-fit, the loading skeleton (MUI
 * `<Skeleton>`, only with a reserved box and no poster), and the error
 * fallback. `fit` / `visibility` are asserted on the video's inline style
 * (reliable in jsdom).
 */
describe('<Video> (MUI)', () => {
  describe('rendering', () => {
    it('renders a <video> with src and controls by default', () => {
      const { container } = render(<Video src="/clip.mp4" />);
      const video = container.querySelector('video')!;
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', '/clip.mp4');
      expect(video).toHaveAttribute('controls');
    });

    it('can turn controls off and set a poster', () => {
      const { container } = render(<Video src="/a.mp4" poster="/p.jpg" controls={false} />);
      const video = container.querySelector('video')!;
      expect(video).not.toHaveAttribute('controls');
      expect(video).toHaveAttribute('poster', '/p.jpg');
    });

    it('forwards native <video> attributes', () => {
      const { container } = render(<Video src="/a.mp4" loop data-testid="x" />);
      const video = container.querySelector('video')!;
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('data-testid', 'x');
    });

    it('renders <source> children for multi-format delivery', () => {
      const { container } = render(
        <Video aspectRatio={16 / 9}>
          <source src="/a.webm" type="video/webm" />
          <source src="/a.mp4" type="video/mp4" />
        </Video>,
      );
      expect(container.querySelectorAll('video source')).toHaveLength(2);
    });
  });

  describe('fit', () => {
    it('defaults object-fit to cover (inline style)', () => {
      const { container } = render(<Video src="/a.mp4" />);
      expect(container.querySelector('video')!.style.objectFit).toBe('cover');
    });

    it('maps fit to object-fit', () => {
      const { container } = render(<Video src="/a.mp4" fit="contain" />);
      expect(container.querySelector('video')!.style.objectFit).toBe('contain');
    });
  });

  describe('loading skeleton', () => {
    it('shows a MUI skeleton while loading when a box is reserved and no poster', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} />);
      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    });

    it('removes the skeleton once the first frame loads', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} />);
      fireEvent.loadedData(container.querySelector('video')!);
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });

    it('skips the skeleton when a poster is given', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} poster="/p.jpg" />);
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });

    it('skips the skeleton without a reserved box', () => {
      const { container } = render(<Video src="/a.mp4" />);
      expect(container.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
    });
  });

  describe('error fallback', () => {
    it('shows the default fallback on error and hides the broken player', () => {
      const { container } = render(<Video src="/broken.mp4" aspectRatio={1} />);
      fireEvent.error(container.querySelector('video')!);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('video')!.style.visibility).toBe('hidden');
    });

    it('resets error state when src changes in place', () => {
      const { container, rerender } = render(<Video src="/broken.mp4" aspectRatio={1} />);
      fireEvent.error(container.querySelector('video')!);
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<Video src="/good.mp4" aspectRatio={1} />);
      expect(container.querySelector('svg')).not.toBeInTheDocument();
      expect(container.querySelector('video')!.style.visibility).not.toBe('hidden');
    });
  });
});
