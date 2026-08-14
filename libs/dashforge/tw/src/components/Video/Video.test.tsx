// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Video } from './Video.js';

void React;
afterEach(() => cleanup());

const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: 'clip', action: 'read', effect: 'allow' },
        { resource: 'clip', action: 'edit', effect: 'deny' },
      ],
    },
  ],
};
const viewer: Subject = { id: 'v', roles: ['viewer'] };

/**
 * Unit tests for <Video>. Covers:
 *   - Rendering (video, src/poster, controls default, native attr + ref)
 *   - fit → object-*  and  rounded token → root
 *   - aspectRatio → CSS aspect-ratio (no layout shift)
 *   - Loading skeleton (reserved box, no poster; removed on loadeddata)
 *   - Error fallback (default glyph + custom; video hidden; reset on src)
 *   - sx / slotProps overrides
 *   - access (RBAC) + visibleWhen
 */
describe('<Video>', () => {
  describe('rendering', () => {
    it('renders a <video> with src and controls by default', () => {
      const { container } = render(<Video src="/clip.mp4" />);
      const video = container.querySelector('video')!;
      expect(video).toBeTruthy();
      expect(video.getAttribute('src')).toBe('/clip.mp4');
      expect(video.hasAttribute('controls')).toBe(true);
    });

    it('can turn controls off and set a poster', () => {
      const { container } = render(<Video src="/a.mp4" poster="/p.jpg" controls={false} />);
      const video = container.querySelector('video')!;
      expect(video.hasAttribute('controls')).toBe(false);
      expect(video.getAttribute('poster')).toBe('/p.jpg');
    });

    it('forwards native <video> attributes and the ref', () => {
      const ref = React.createRef<HTMLVideoElement>();
      const { container } = render(
        <Video ref={ref} src="/a.mp4" loop muted playsInline data-testid="x" />,
      );
      const video = container.querySelector('video')!;
      expect(ref.current).toBe(video);
      expect(video.hasAttribute('loop')).toBe(true);
      expect(video.getAttribute('data-testid')).toBe('x');
    });

    it('renders <source> children for multi-format delivery', () => {
      const { container } = render(
        <Video aspectRatio={16 / 9}>
          <source src="/a.webm" type="video/webm" />
          <source src="/a.mp4" type="video/mp4" />
        </Video>,
      );
      expect(container.querySelectorAll('video source').length).toBe(2);
    });
  });

  describe('fit + rounded', () => {
    it('defaults to object-cover', () => {
      const { container } = render(<Video src="/a.mp4" />);
      expect(container.querySelector('video')!.className).toContain('object-cover');
    });

    it('maps fit to object-*', () => {
      const { container } = render(<Video src="/a.mp4" fit="contain" />);
      expect(container.querySelector('video')!.className).toContain('object-contain');
    });

    it('applies the rounded token to the root', () => {
      const { container } = render(<Video src="/a.mp4" rounded="full" />);
      expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
    });
  });

  describe('aspect ratio (no layout shift)', () => {
    it('sets CSS aspect-ratio on the root from a number', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={16 / 9} />);
      expect((container.firstChild as HTMLElement).style.aspectRatio).toBe(`${16 / 9} / 1`);
    });

    it('accepts a CSS aspect-ratio string', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio="4 / 3" />);
      expect((container.firstChild as HTMLElement).style.aspectRatio).toBe('4 / 3');
    });
  });

  describe('loading skeleton', () => {
    it('shows a skeleton while loading when a box is reserved and no poster', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} />);
      expect(container.querySelector('[role="presentation"]')).toBeTruthy();
    });

    it('removes the skeleton once the first frame loads', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} />);
      fireEvent.loadedData(container.querySelector('video')!);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });

    it('skips the skeleton when a poster is given', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} poster="/p.jpg" />);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });

    it('skips the skeleton without a reserved box', () => {
      const { container } = render(<Video src="/a.mp4" />);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });

    it('can be turned off via showSkeleton={false}', () => {
      const { container } = render(<Video src="/a.mp4" aspectRatio={1} showSkeleton={false} />);
      expect(container.querySelector('[role="presentation"]')).toBeNull();
    });
  });

  describe('error fallback', () => {
    it('shows the default fallback on error and hides the broken player', () => {
      const { container } = render(<Video src="/broken.mp4" aspectRatio={1} />);
      fireEvent.error(container.querySelector('video')!);
      expect(container.querySelector('svg')).toBeTruthy();
      expect(container.querySelector('video')!.style.visibility).toBe('hidden');
    });

    it('renders a custom fallback', () => {
      const { container, getByText } = render(
        <Video src="/broken.mp4" aspectRatio={1} fallback={<span>oops</span>} />,
      );
      fireEvent.error(container.querySelector('video')!);
      expect(getByText('oops')).toBeTruthy();
    });

    it('resets error state when src changes in place', () => {
      const { container, rerender } = render(<Video src="/broken.mp4" aspectRatio={1} />);
      fireEvent.error(container.querySelector('video')!);
      expect(container.querySelector('svg')).toBeTruthy();

      rerender(<Video src="/good.mp4" aspectRatio={1} />);
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('video')!.style.visibility).not.toBe('hidden');
    });
  });

  describe('overrides', () => {
    it('sx wins on the root via tailwind-merge', () => {
      const { container } = render(<Video src="/a.mp4" rounded="lg" sx="rounded-sm" />);
      const cls = (container.firstChild as HTMLElement).className;
      expect(cls).toContain('rounded-sm');
      expect(cls).not.toContain('rounded-lg');
    });

    it('applies slotProps.video className to the video', () => {
      const { container } = render(
        <Video src="/a.mp4" slotProps={{ video: { className: 'grayscale' } }} />,
      );
      expect(container.querySelector('video')!.className).toContain('grayscale');
    });
  });

  describe('access (RBAC) + visibleWhen', () => {
    it('renders when access is granted', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Video src="/a.mp4" access={{ resource: 'clip', action: 'read' }} />
        </RbacProvider>,
      );
      expect(container.querySelector('video')).toBeTruthy();
    });

    it('hides when access is denied with onUnauthorized="hide"', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Video src="/a.mp4" access={{ resource: 'clip', action: 'edit', onUnauthorized: 'hide' }} />
        </RbacProvider>,
      );
      expect(container.querySelector('video')).toBeNull();
    });

    it('dims (aria-disabled) when denied with onUnauthorized="disable"', () => {
      const { container } = render(
        <RbacProvider policy={READ_ONLY_POLICY} subject={viewer}>
          <Video src="/a.mp4" access={{ resource: 'clip', action: 'edit', onUnauthorized: 'disable' }} />
        </RbacProvider>,
      );
      const root = container.firstChild as HTMLElement;
      expect(container.querySelector('video')).toBeTruthy();
      expect(root.getAttribute('aria-disabled')).toBe('true');
      expect(root.className).toContain('opacity-60');
    });

    it('renders normally when visibleWhen is not provided', () => {
      const { container } = render(<Video src="/a.mp4" />);
      expect(container.querySelector('video')).toBeTruthy();
    });
  });
});
