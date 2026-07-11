import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DateRangePicker } from './DateRangePicker';
import { renderWithBridge } from '../../test-utils';

describe('DateRangePicker', () => {
  it('renders a read-only labelled input', () => {
    render(<DateRangePicker name="period" label="Booking period" />);
    expect(screen.getByText('Booking period')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('shows a localized controlled range', () => {
    render(
      <DateRangePicker
        name="p"
        value={{ start: '2026-05-10', end: '2026-05-15' }}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('May 10, 2026 – May 15, 2026');
  });

  it('opens a dual-month popup on icon click', () => {
    render(
      <DateRangePicker name="p" defaultValue={{ start: '2026-05-10', end: null }} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(
      screen.getByRole('dialog', { name: 'Choose date range' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });

  it('completes the range on the second click and closes the popup', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        name="p"
        defaultValue={{ start: '2026-05-10', end: null }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 18, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-10', end: '2026-05-18' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('restarts the range on a fresh click and keeps the popup open', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        name="p"
        defaultValue={{ start: '2026-05-20', end: '2026-05-25' }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 12, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-12', end: null });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('swaps endpoints when the second click lands before the start', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        name="p"
        defaultValue={{ start: '2026-05-15', end: null }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 8, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-08', end: '2026-05-15' });
  });

  it('closes the popup on Escape', () => {
    render(
      <DateRangePicker name="p" defaultValue={{ start: '2026-05-10', end: null }} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open the popup when disabled', () => {
    render(<DateRangePicker name="p" disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an empty input (never "undefined – undefined") when no value is set', () => {
    // Regression for #61 — no value + no default + no bridge.
    render(<DateRangePicker name="x" label="Range" />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('renders an empty input when the bridge has no defaultValues entry for the field', () => {
    // Regression for #61 — RHF returns undefined for the path.
    renderWithBridge(<DateRangePicker name="x" label="Range" />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('renders an empty input when the bridge value is an object with undefined props', () => {
    // Regression for #61 — RHF partial-hydration path: the parent object
    // exists, but `start` / `end` are undefined. Must not template-render
    // the string "undefined".
    renderWithBridge(<DateRangePicker name="x" label="Range" />, {
      mockBridgeOptions: {
        defaultValues: { x: {} as unknown as { start: null; end: null } },
      },
    });
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
    expect(input).not.toHaveValue('undefined – undefined');
  });

  it('commits the completed range to the form bridge', () => {
    const { state } = renderWithBridge(
      <DateRangePicker name="period" label="Period" />,
      {
        mockBridgeOptions: {
          defaultValues: { period: { start: '2026-05-10', end: null } },
        },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 18, 2026/ }));
    expect(state?.values.period).toEqual({ start: '2026-05-10', end: '2026-05-18' });
  });
});
