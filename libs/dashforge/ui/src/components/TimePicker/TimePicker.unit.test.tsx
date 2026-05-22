import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TimePicker } from './TimePicker';
import { renderWithBridge } from '../../test-utils';

describe('TimePicker', () => {
  it('renders an editable labelled input', () => {
    render(<TimePicker name="alarm" label="Alarm" />);
    expect(screen.getByText('Alarm')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
  });

  it('shows a 24-hour controlled value', () => {
    render(<TimePicker name="t" value="14:30" />);
    expect(screen.getByRole('textbox')).toHaveValue('14:30');
  });

  it('formats the value in 12-hour notation when hour12 is set', () => {
    render(<TimePicker name="t" value="14:30" hour12 />);
    expect(screen.getByRole('textbox')).toHaveValue('2:30 PM');
  });

  it('opens the dropdown on icon click', () => {
    render(<TimePicker name="t" />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open time list' }));
    expect(screen.getByRole('listbox', { name: 'Time options' })).toBeInTheDocument();
  });

  it('selects a time from the dropdown, updates the input and closes', () => {
    const onChange = vi.fn();
    render(<TimePicker name="t" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open time list' }));
    fireEvent.click(screen.getByRole('option', { name: '09:00' }));
    expect(onChange).toHaveBeenCalledWith('09:00');
    expect(screen.getByRole('textbox')).toHaveValue('09:00');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('parses free-typed input on blur', () => {
    const onChange = vi.fn();
    render(<TimePicker name="t" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '2:30 pm' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith('14:30');
    expect(input).toHaveValue('14:30');
  });

  it('reverts invalid typed input', () => {
    const onChange = vi.fn();
    render(<TimePicker name="t" value="08:00" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '99:99' } });
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('08:00');
  });

  it('commits null when the input is cleared', () => {
    const onChange = vi.fn();
    render(<TimePicker name="t" defaultValue="09:00" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('does not open the dropdown when disabled', () => {
    render(<TimePicker name="t" disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open time list' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('commits the selected time to the form bridge', () => {
    const { state } = renderWithBridge(
      <TimePicker name="startTime" label="Start" />,
      { mockBridgeOptions: { defaultValues: { startTime: '08:00' } } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open time list' }));
    fireEvent.click(screen.getByRole('option', { name: '10:30' }));
    expect(state?.values.startTime).toBe('10:30');
  });
});
