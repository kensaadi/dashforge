// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TimePicker } from './TimePicker.js';

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

describe('TimePicker', () => {
  it('renders a labelled trigger with the placeholder', () => {
    render(<TimePicker name="alarm" label="Alarm" placeholder="Pick a time" />);
    expect(screen.queryByText('Alarm')).not.toBeNull();
    expect(screen.getByRole('button').textContent).toContain('Pick a time');
  });

  it('shows a 24-hour controlled value', () => {
    render(<TimePicker name="t" value="14:30" />);
    expect(screen.getByRole('button').textContent).toContain('14:30');
  });

  it('formats the value in 12-hour notation when hour12 is set', () => {
    render(<TimePicker name="t" value="14:30" hour12 />);
    expect(screen.getByRole('button').textContent).toContain('2:30 PM');
  });

  it('opens the time-list popover from the trigger', () => {
    render(<TimePicker name="t" />);
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox', { name: 'Time options' })).not.toBeNull();
  });

  it('selects a time from the popover, updates the trigger and closes', () => {
    const onChange = vi.fn();
    render(<TimePicker name="t" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: '09:00' }));
    expect(onChange).toHaveBeenCalledWith('09:00');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('button').textContent).toContain('09:00');
  });

  it('does not open the popover when disabled', () => {
    render(<TimePicker name="t" disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
