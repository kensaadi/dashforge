// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DateRangePicker } from './DateRangePicker.js';

beforeAll(() => {
  // Radix Popover (Floating UI) needs ResizeObserver — jsdom lacks it.
  if (!('ResizeObserver' in globalThis)) {
    class ResizeObserverStub {
      observe(): void {
        /* no-op */
      }
      unobserve(): void {
        /* no-op */
      }
      disconnect(): void {
        /* no-op */
      }
    }
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
      ResizeObserverStub;
  }
});

describe('DateRangePicker', () => {
  it('renders a labelled trigger with the placeholder', () => {
    render(
      <DateRangePicker name="period" label="Period" placeholder="Pick a range" />,
    );
    expect(screen.queryByText('Period')).not.toBeNull();
    expect(screen.getByRole('button').textContent).toContain('Pick a range');
  });

  it('shows a localized controlled range', () => {
    render(
      <DateRangePicker
        name="p"
        value={{ start: '2026-05-10', end: '2026-05-15' }}
      />,
    );
    expect(screen.getByRole('button').textContent).toContain(
      'May 10, 2026 – May 15, 2026',
    );
  });

  it('opens a dual-month popover from the trigger', () => {
    render(
      <DateRangePicker name="p" defaultValue={{ start: '2026-05-10', end: null }} />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Select|May/ }));
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });

  it('completes the range on the second click and closes the popover', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        name="p"
        defaultValue={{ start: '2026-05-10', end: null }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /May 10/ }));
    fireEvent.click(screen.getByRole('button', { name: /May 18, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-10', end: '2026-05-18' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('restarts the range on a fresh click and keeps the popover open', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        name="p"
        defaultValue={{ start: '2026-05-20', end: '2026-05-25' }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /May 20/ }));
    fireEvent.click(screen.getByRole('button', { name: /May 12, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-12', end: null });
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('does not open the popover when disabled', () => {
    render(<DateRangePicker name="p" disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
