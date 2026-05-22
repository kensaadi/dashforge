// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DateTimePicker } from './DateTimePicker.js';

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

describe('DateTimePicker', () => {
  it('renders a labelled trigger with the placeholder', () => {
    render(
      <DateTimePicker name="appt" label="Appointment" placeholder="Pick one" />,
    );
    expect(screen.queryByText('Appointment')).not.toBeNull();
    expect(screen.getByRole('button').textContent).toContain('Pick one');
  });

  it('shows a formatted controlled value', () => {
    render(<DateTimePicker name="d" value="2026-05-20T14:30" />);
    expect(screen.getByRole('button').textContent).toContain(
      'May 20, 2026, 14:30',
    );
  });

  it('opens a popover with a calendar and a time list', () => {
    render(<DateTimePicker name="d" defaultValue="2026-05-20T10:00" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(screen.getByRole('grid')).not.toBeNull();
    expect(screen.getByRole('listbox', { name: 'Time options' })).not.toBeNull();
  });

  it('picking a date updates the value and keeps the popover open', () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker name="d" defaultValue="2026-05-20T10:00" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15T10:00');
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('picking a time completes the value and closes the popover', () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker name="d" defaultValue="2026-05-20T10:00" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: '14:30' }));
    expect(onChange).toHaveBeenCalledWith('2026-05-20T14:30');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not open the popover when disabled', () => {
    render(<DateTimePicker name="d" disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
