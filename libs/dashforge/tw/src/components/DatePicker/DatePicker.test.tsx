// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DatePicker } from './DatePicker.js';

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

describe('DatePicker', () => {
  it('renders a labelled trigger with the placeholder', () => {
    render(
      <DatePicker name="birthday" label="Birthday" placeholder="Pick one" />,
    );
    expect(screen.queryByText('Birthday')).not.toBeNull();
    expect(screen.getByRole('button').textContent).toContain('Pick one');
  });

  it('shows a localized controlled value', () => {
    render(<DatePicker name="d" value="2026-05-20" />);
    expect(screen.getByRole('button').textContent).toContain('May 20, 2026');
  });

  it('opens and toggles the calendar popover from the trigger', () => {
    render(<DatePicker name="d" defaultValue="2026-05-20" />);
    const trigger = screen.getByRole('button');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('selects a date from the popover, updates the trigger and closes', () => {
    const onChange = vi.fn();
    render(
      <DatePicker name="d" defaultValue="2026-05-20" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button').textContent).toContain('May 15, 2026');
  });

  it('keeps a controlled value fixed but still reports the change', () => {
    const onChange = vi.fn();
    render(<DatePicker name="d" value="2026-05-20" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
    expect(screen.getByRole('button').textContent).toContain('May 20, 2026');
  });

  it('does not open the popover when disabled', () => {
    render(<DatePicker name="d" disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
