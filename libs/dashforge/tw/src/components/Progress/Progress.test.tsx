// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress.js';

describe('<Progress>', () => {
  // ─── Base rendering ───────────────────────────────────────────────
  describe('base rendering', () => {
    it('renders a progressbar with aria attributes (linear default)', () => {
      render(<Progress value={42} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('42');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });

    it('respects custom min / max', () => {
      render(<Progress value={5} min={0} max={10} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('5');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('10');
    });

    it('clamps value to [min, max]', () => {
      render(<Progress value={150} min={0} max={100} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('100');
    });

    it('clamps below min', () => {
      render(<Progress value={-20} min={0} max={100} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('0');
    });

    it('renders the field label above the control', () => {
      render(<Progress value={50} label="Upload" />);
      expect(screen.getByText('Upload')).toBeTruthy();
    });
  });

  // ─── Linear variant ───────────────────────────────────────────────
  describe('linear variant', () => {
    it('renders the bar with correct width percentage', () => {
      const { container } = render(<Progress value={40} min={0} max={100} />);
      const bar = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(bar.style.width).toBe('40%');
    });

    it('scales the width to a custom min/max span', () => {
      const { container } = render(<Progress value={5} min={0} max={10} />);
      const bar = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(bar.style.width).toBe('50%');
    });

    it('applies thickness (linear track height)', () => {
      const { container } = render(
        <Progress value={50} size="md" thickness="thick" />,
      );
      // Linear track has an inline style height derived from LINEAR_TRACK_HEIGHTS.
      const track = container.querySelector('[role="progressbar"]') as HTMLElement;
      // size=md + thickness=thick → 10 (see progress.variants.ts LINEAR_TRACK_HEIGHTS).
      expect(track.style.height).toBe('10px');
    });
  });

  // ─── Circular variant ─────────────────────────────────────────────
  describe('circular variant', () => {
    it('renders an SVG progressbar for variant="circular"', () => {
      render(<Progress variant="circular" value={60} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.tagName.toLowerCase()).toBe('svg');
      expect(bar.getAttribute('aria-valuenow')).toBe('60');
    });

    it('applies the correct viewport size per (size × thickness) pair', () => {
      const { container } = render(
        <Progress variant="circular" value={0} size="md" thickness="md" />,
      );
      const svg = container.querySelector('svg') as SVGElement;
      // size=md → viewport 48
      expect(svg.getAttribute('width')).toBe('48');
      expect(svg.getAttribute('height')).toBe('48');
    });

    it('sets stroke-dashoffset to render the current arc', () => {
      const { container } = render(
        <Progress variant="circular" value={50} min={0} max={100} size="md" thickness="md" />,
      );
      // Two circles: the track (index 0) and the arc (index 1). The
      // arc's stroke-dashoffset is (circumference * (1 - 0.5)).
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(2);
      const arcOffset = parseFloat(circles[1].getAttribute('stroke-dashoffset') ?? '0');
      expect(arcOffset).toBeGreaterThan(0);
    });
  });

  // ─── Value label ─────────────────────────────────────────────────
  describe('value label', () => {
    it('renders the default percentage when showLabel is true', () => {
      render(<Progress value={40} showLabel />);
      expect(screen.getByText('40%')).toBeTruthy();
    });

    it('uses the custom formatter when provided', () => {
      render(
        <Progress
          value={3}
          min={0}
          max={5}
          showLabel
          formatLabel={(v, max) => `Step ${v} of ${max}`}
        />,
      );
      expect(screen.getByText('Step 3 of 5')).toBeTruthy();
    });

    it('does not render the label when showLabel is false / omitted', () => {
      const { container } = render(<Progress value={40} />);
      expect(container.textContent).not.toContain('40%');
    });

    it('renders the label inside the SVG viewport on circular', () => {
      render(
        <Progress variant="circular" value={75} showLabel />,
      );
      expect(screen.getByText('75%')).toBeTruthy();
    });
  });

  // ─── Color intents ───────────────────────────────────────────────
  describe('color intents', () => {
    it('applies the danger palette to the linear bar', () => {
      const { container } = render(<Progress value={50} color="danger" />);
      const bar = container.querySelector('[class*="bg-danger"]');
      expect(bar).toBeTruthy();
    });

    it('applies the success stroke to the circular arc', () => {
      const { container } = render(
        <Progress variant="circular" value={50} color="success" />,
      );
      const arc = container.querySelector('[class*="stroke-success"]');
      expect(arc).toBeTruthy();
    });
  });

  // ─── Reactivity / RBAC (catalog uniform) ──────────────────────────
  describe('visibleWhen / access', () => {
    it('returns null when visibleWhen predicate is false', () => {
      const { container } = render(
        <Progress value={50} visibleWhen={() => false} />,
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders when visibleWhen predicate is true', () => {
      render(<Progress value={50} visibleWhen={() => true} />);
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('supports mixing engine + local state via closure', () => {
      const showAdvanced = true;
      render(
        <Progress
          value={50}
          visibleWhen={(engine) => {
            // Engine is null in standalone mode; the closure still
            // sees the outer-scope local variable.
            void engine;
            return showAdvanced;
          }}
        />,
      );
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });
  });

  // ─── Accessibility ───────────────────────────────────────────────
  describe('a11y', () => {
    it('uses `aria-label` prop when explicit', () => {
      render(<Progress value={50} aria-label="Upload progress" />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-label')).toBe('Upload progress');
    });

    it('falls back to `label` prop when `aria-label` is omitted', () => {
      render(<Progress value={50} label="Save" />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-label')).toBe('Save');
    });

    it('has a generic aria-label when neither is provided', () => {
      render(<Progress value={50} />);
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-label')).toBe('progress');
    });
  });

  // ─── Escape hatches ──────────────────────────────────────────────
  describe('escape hatches', () => {
    it('sx appends to the root', () => {
      const { container } = render(
        <Progress value={50} sx="tracking-wide" />,
      );
      expect(container.innerHTML).toContain('tracking-wide');
    });

    it('slotProps.bar.className merges into the linear bar', () => {
      const { container } = render(
        <Progress value={50} slotProps={{ bar: { className: 'opacity-50' } }} />,
      );
      const bar = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(bar.className).toContain('opacity-50');
    });
  });
});
