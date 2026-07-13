// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from './Slider.js';

// Radix Slider consumes `ResizeObserver` via `@radix-ui/react-use-size`
// to lay out the track. jsdom does not ship one, so provide a minimal
// polyfill for the test environment. Same trick every other Radix-based
// component test would need if it added Slider later.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class ResizeObserverPolyfill {
      observe() { /* noop */ }
      unobserve() { /* noop */ }
      disconnect() { /* noop */ }
    }
    globalThis.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;
  }
});

describe('<Slider>', () => {
  // ─── Base rendering ───────────────────────────────────────────────
  describe('base rendering', () => {
    it('renders a slider with a thumb (single mode)', () => {
      render(<Slider name="volume" value={50} onCommit={() => undefined} />);
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(1);
    });

    it('renders two thumbs in range mode', () => {
      render(
        <Slider
          name="price"
          range
          value={[10, 50]}
          onCommit={() => undefined}
        />,
      );
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(2);
    });

    it('applies default variant classes (color=primary + size=md)', () => {
      const { container } = render(
        <Slider name="x" value={50} onCommit={() => undefined} />,
      );
      const range = container.querySelector('[class*="bg-primary"]');
      expect(range).toBeTruthy();
    });

    it('renders the label + required marker when provided', () => {
      render(
        <Slider name="x" label="Volume" required value={50} onCommit={() => undefined} />,
      );
      const label = screen.getByText('Volume');
      expect(label).toBeTruthy();
      expect(label.parentElement?.textContent).toContain('*');
    });
  });

  // ─── Value contract — single ──────────────────────────────────────
  describe('single mode value contract', () => {
    it('accepts a controlled numeric value', () => {
      render(<Slider name="x" value={42} onCommit={() => undefined} />);
      const thumb = screen.getByRole('slider');
      expect(thumb.getAttribute('aria-valuenow')).toBe('42');
    });

    it('respects defaultValue when uncontrolled', () => {
      render(<Slider name="x" defaultValue={30} />);
      const thumb = screen.getByRole('slider');
      expect(thumb.getAttribute('aria-valuenow')).toBe('30');
    });

    it('commits a number to onCommit on keyboard step', () => {
      const onCommit = vi.fn();
      render(<Slider name="x" defaultValue={50} onCommit={onCommit} />);
      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      expect(onCommit).toHaveBeenCalled();
      expect(typeof onCommit.mock.calls[0][0]).toBe('number');
    });
  });

  // ─── Value contract — range ───────────────────────────────────────
  describe('range mode value contract', () => {
    it('accepts a controlled [min, max] tuple', () => {
      render(
        <Slider name="x" range value={[20, 80]} onCommit={() => undefined} />,
      );
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs[0].getAttribute('aria-valuenow')).toBe('20');
      expect(thumbs[1].getAttribute('aria-valuenow')).toBe('80');
    });

    it('commits a tuple to onCommit', () => {
      const onCommit = vi.fn();
      render(
        <Slider
          name="x"
          range
          defaultValue={[20, 80]}
          onCommit={onCommit}
        />,
      );
      const thumbs = screen.getAllByRole('slider');
      thumbs[1].focus();
      fireEvent.keyDown(thumbs[1], { key: 'ArrowRight' });
      expect(onCommit).toHaveBeenCalled();
      const commitVal = onCommit.mock.calls[0][0];
      expect(Array.isArray(commitVal)).toBe(true);
      expect(commitVal).toHaveLength(2);
    });
  });

  // ─── min / max / step ─────────────────────────────────────────────
  describe('numeric range', () => {
    it('honours min / max / step defaults (0 / 100 / 1)', () => {
      render(<Slider name="x" value={50} onCommit={() => undefined} />);
      const thumb = screen.getByRole('slider');
      expect(thumb.getAttribute('aria-valuemin')).toBe('0');
      expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    });

    it('accepts custom min / max', () => {
      render(
        <Slider name="x" min={-50} max={50} value={0} onCommit={() => undefined} />,
      );
      const thumb = screen.getByRole('slider');
      expect(thumb.getAttribute('aria-valuemin')).toBe('-50');
      expect(thumb.getAttribute('aria-valuemax')).toBe('50');
    });
  });

  // ─── Commit strategy ──────────────────────────────────────────────
  describe('commit strategy', () => {
    it('by default: onChange fires on drag tick, onCommit only on release', () => {
      // Radix onValueChange is invoked on drag ticks; onValueCommit is
      // invoked on drag-end. We only expose commit via `onCommit` —
      // `onChange` is UI-side only. Keyboard steps trigger both.
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(
        <Slider
          name="x"
          defaultValue={50}
          onChange={onChange}
          onCommit={onCommit}
        />,
      );
      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      // Keyboard step fires both.
      expect(onChange).toHaveBeenCalled();
      expect(onCommit).toHaveBeenCalled();
    });
  });

  // ─── Marks ───────────────────────────────────────────────────────
  describe('marks', () => {
    it('renders explicit marks with their labels', () => {
      render(
        <Slider
          name="x"
          value={50}
          onCommit={() => undefined}
          marks={[
            { value: 0,  label: 'Off' },
            { value: 50, label: 'Med' },
            { value: 100, label: 'Max' },
          ]}
        />,
      );
      expect(screen.getByText('Off')).toBeTruthy();
      expect(screen.getByText('Med')).toBeTruthy();
      expect(screen.getByText('Max')).toBeTruthy();
    });

    it('auto-generates marks when marks={true} and step is coarse enough', () => {
      const { container } = render(
        <Slider name="x" step={25} value={50} onCommit={() => undefined} marks />,
      );
      // 0, 25, 50, 75, 100 = 5 mark ticks.
      const ticks = container.querySelectorAll('[data-in-range]');
      expect(ticks.length).toBe(5);
    });

    it('suppresses auto-marks when step density > 21 ticks', () => {
      const { container } = render(
        <Slider name="x" step={1} value={50} onCommit={() => undefined} marks />,
      );
      // 0..100 step 1 = 101 marks → auto-suppress.
      const ticks = container.querySelectorAll('[data-in-range]');
      expect(ticks.length).toBe(0);
    });
  });

  // ─── Value label ─────────────────────────────────────────────────
  describe('value label', () => {
    it('shows the value label when showValueLabel="always"', () => {
      render(
        <Slider
          name="x"
          value={73}
          onCommit={() => undefined}
          showValueLabel="always"
        />,
      );
      expect(screen.getByText('73')).toBeTruthy();
    });

    it('renders through formatValue for custom units', () => {
      render(
        <Slider
          name="x"
          value={50}
          onCommit={() => undefined}
          showValueLabel="always"
          formatValue={(v) => `${v}%`}
        />,
      );
      expect(screen.getByText('50%')).toBeTruthy();
    });

    it('does not render the value label when showValueLabel="off"', () => {
      const { container } = render(
        <Slider
          name="x"
          value={50}
          onCommit={() => undefined}
          showValueLabel="off"
        />,
      );
      // No absolute-positioned tooltip class.
      const labels = container.querySelectorAll('[class*="valueLabel"]');
      expect(labels.length).toBe(0);
    });
  });

  // ─── Color intent ────────────────────────────────────────────────
  describe('color intent', () => {
    it('applies the danger palette when color="danger"', () => {
      const { container } = render(
        <Slider name="x" color="danger" value={50} onCommit={() => undefined} />,
      );
      const range = container.querySelector('[class*="bg-danger"]');
      expect(range).toBeTruthy();
    });

    it('applies the success palette when color="success"', () => {
      const { container } = render(
        <Slider name="x" color="success" value={50} onCommit={() => undefined} />,
      );
      const range = container.querySelector('[class*="bg-success"]');
      expect(range).toBeTruthy();
    });
  });

  // ─── States ──────────────────────────────────────────────────────
  describe('states', () => {
    it('disabled blocks keyboard nav', () => {
      const onCommit = vi.fn();
      render(<Slider name="x" value={50} disabled onCommit={onCommit} />);
      const thumb = screen.getByRole('slider');
      thumb.focus();
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      expect(onCommit).not.toHaveBeenCalled();
    });

    it('error state wires aria-invalid and flips the palette to danger', () => {
      const { container } = render(
        <Slider name="x" value={50} error onCommit={() => undefined} />,
      );
      const thumb = screen.getByRole('slider');
      expect(thumb.getAttribute('aria-invalid')).toBe('true');
      const range = container.querySelector('[class*="bg-danger"]');
      expect(range).toBeTruthy();
    });
  });

  // ─── Escape hatches ──────────────────────────────────────────────
  describe('escape hatches', () => {
    it('sx appends to the controlWrapper', () => {
      const { container } = render(
        <Slider name="x" value={50} onCommit={() => undefined} sx="tracking-wide" />,
      );
      // controlWrapper is a direct child under the root wrapper.
      expect(container.innerHTML).toContain('tracking-wide');
    });
  });

  // ─── Standalone dev-warn (#113) ──────────────────────────────────
  it('#113: warns when standalone widget renders without value/onCommit', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Slider name="loose" />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls[0][0] as string;
    expect(message).toContain('<Slider name="loose">');
    warnSpy.mockRestore();
  });
});
