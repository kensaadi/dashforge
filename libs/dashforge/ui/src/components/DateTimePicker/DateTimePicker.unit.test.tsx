import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DateTimePicker } from './DateTimePicker';
import { renderWithBridge } from '../../test-utils';

describe('DateTimePicker', () => {
  it('renders a read-only labelled input', () => {
    render(<DateTimePicker name="appointment" label="Appointment" />);
    expect(screen.getByText('Appointment')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('shows a formatted controlled value', () => {
    render(<DateTimePicker name="d" value="2026-05-20T14:30" />);
    expect(screen.getByRole('textbox')).toHaveValue('May 20, 2026, 14:30');
  });

  it('opens a popup with a calendar and a time list on icon click', () => {
    render(<DateTimePicker name="d" defaultValue="2026-05-20T10:00" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(
      screen.getByRole('dialog', { name: 'Choose date and time' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Time options' })).toBeInTheDocument();
  });

  it('picking a date updates the value and keeps the popup open', () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker
        name="d"
        defaultValue="2026-05-20T10:00"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15T10:00');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('picking a time completes the value and closes the popup', () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker
        name="d"
        defaultValue="2026-05-20T10:00"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('option', { name: '14:30' }));
    expect(onChange).toHaveBeenCalledWith('2026-05-20T14:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popup on Escape', () => {
    render(<DateTimePicker name="d" defaultValue="2026-05-20T10:00" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open the popup when disabled', () => {
    render(<DateTimePicker name="d" disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('commits the selected datetime to the form bridge', () => {
    const { state } = renderWithBridge(
      <DateTimePicker name="appt" label="Appointment" />,
      { mockBridgeOptions: { defaultValues: { appt: '2026-05-20T09:00' } } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('option', { name: '11:00' }));
    expect(state?.values.appt).toBe('2026-05-20T11:00');
  });
});
