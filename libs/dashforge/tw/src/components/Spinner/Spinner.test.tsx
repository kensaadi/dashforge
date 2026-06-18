// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { Spinner } from './Spinner.js';

void React;
afterEach(() => cleanup());

/**
 * Unit tests for `<Spinner>`. Covers:
 *   - Default rendering (role, label, animate-spin)
 *   - Size axis (5 enum values → w/h spacing classes)
 *   - Color → text-{color}-600 class
 *   - color omitted → no text class (inherits currentColor)
 *   - Thickness → SVG stroke-width
 *   - withTrack → second <circle> with low opacity
 *   - Delay → null for first N ms, then visible
 *   - visibleWhen → null on false (regardless of delay)
 *   - className / sx overrides
 *   - motion-reduce gating (class present)
 */

describe('<Spinner>', () => {
  describe('basic rendering', () => {
    it('renders with role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeTruthy();
    });

    it('exposes the default "Loading" label to screen readers', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading')).toBeTruthy();
    });

    it('respects custom label', () => {
      render(<Spinner label="Saving" />);
      expect(screen.getByText('Saving')).toBeTruthy();
    });

    it('applies animate-spin class', () => {
      const { container } = render(<Spinner />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('animate-spin');
    });

    it('applies motion-reduce:animate-none class (WCAG 2.3.3)', () => {
      const { container } = render(<Spinner />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('motion-reduce:animate-none');
    });

    it('renders the spinning arc SVG path', () => {
      const { container } = render(<Spinner />);
      const path = container.querySelector('path');
      expect(path).toBeTruthy();
    });
  });

  describe('size axis', () => {
    it.each([
      ['xs', 'w-3'],
      ['sm', 'w-4'],
      ['md', 'w-5'],
      ['lg', 'w-6'],
      ['xl', 'w-8'],
    ] as const)('size=%s → %s', (size, expected) => {
      const { container } = render(<Spinner size={size} />);
      const root = container.firstElementChild!;
      expect(root.className).toContain(expected);
    });
  });

  describe('color resolution', () => {
    it('omits text-* class when color is undefined (inherits currentColor)', () => {
      const { container } = render(<Spinner />);
      const root = container.firstElementChild!;
      // No text-{color}-600 class — color flows in via currentColor
      // from the parent.
      expect(root.className).not.toMatch(/text-(neutral|primary|secondary|success|warning|danger|info)-/);
    });

    it('applies text-primary-600 when color="primary"', () => {
      const { container } = render(<Spinner color="primary" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('text-primary-600');
    });

    it('applies text-danger-600 when color="danger"', () => {
      const { container } = render(<Spinner color="danger" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('text-danger-600');
    });
  });

  describe('thickness', () => {
    it('default thickness=md → stroke-width=2.25', () => {
      const { container } = render(<Spinner />);
      const path = container.querySelector('path')!;
      expect(path.getAttribute('stroke-width')).toBe('2.25');
    });

    it('thickness=thin → stroke-width=1.5', () => {
      const { container } = render(<Spinner thickness="thin" />);
      const path = container.querySelector('path')!;
      expect(path.getAttribute('stroke-width')).toBe('1.5');
    });

    it('thickness=thick → stroke-width=3', () => {
      const { container } = render(<Spinner thickness="thick" />);
      const path = container.querySelector('path')!;
      expect(path.getAttribute('stroke-width')).toBe('3');
    });
  });

  describe('withTrack', () => {
    it('does NOT render the track circle by default', () => {
      const { container } = render(<Spinner />);
      // Only the arc <path> — no <circle>.
      expect(container.querySelector('circle')).toBeNull();
    });

    it('renders a track circle when withTrack=true', () => {
      const { container } = render(<Spinner withTrack />);
      const circle = container.querySelector('circle');
      expect(circle).toBeTruthy();
    });

    it('track has stroke-opacity=0.2', () => {
      const { container } = render(<Spinner withTrack />);
      const circle = container.querySelector('circle')!;
      expect(circle.getAttribute('stroke-opacity')).toBe('0.2');
    });
  });

  describe('delay (anti-flash)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders null for the first `delay` ms', () => {
      const { container } = render(<Spinner delay={150} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders the spinner after `delay` ms have elapsed', () => {
      const { container } = render(<Spinner delay={150} />);
      expect(container.firstChild).toBeNull();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(container.firstChild).toBeTruthy();
    });

    it('renders immediately when delay=0 (synchronous path)', () => {
      const { container } = render(<Spinner delay={0} />);
      expect(container.firstChild).toBeTruthy();
    });

    it('renders immediately when delay is omitted', () => {
      const { container } = render(<Spinner />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('visibleWhen bridge', () => {
    it('renders when visibleWhen returns true', () => {
      render(<Spinner visibleWhen={() => true} />);
      expect(screen.getByRole('status')).toBeTruthy();
    });

    it('returns null when visibleWhen returns false', () => {
      const { container } = render(<Spinner visibleWhen={() => false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders normally when visibleWhen is omitted', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeTruthy();
    });
  });

  describe('overrides', () => {
    it('appends sx', () => {
      const { container } = render(<Spinner sx="mt-4" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('mt-4');
    });

    it('appends className', () => {
      const { container } = render(<Spinner className="my-custom-spinner" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('my-custom-spinner');
    });
  });
});
