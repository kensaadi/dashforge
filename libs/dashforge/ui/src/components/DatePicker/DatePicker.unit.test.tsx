import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DatePicker } from './DatePicker';
import { renderWithBridge } from '../../test-utils';

describe('DatePicker', () => {
  it('renders a read-only labelled input', () => {
    render(<DatePicker name="birthday" label="Birthday" />);
    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('shows a localized controlled value', () => {
    render(<DatePicker name="d" value="2026-05-20" />);
    expect(screen.getByRole('textbox')).toHaveValue('May 20, 2026');
  });

  it('opens the calendar popup on icon click', () => {
    render(<DatePicker name="d" defaultValue="2026-05-20" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeInTheDocument();
  });

  it('selects a date from the popup, updates the input and closes', () => {
    const onChange = vi.fn();
    render(
      <DatePicker name="d" defaultValue="2026-05-20" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
    expect(screen.getByRole('textbox')).toHaveValue('May 15, 2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps a controlled value fixed but still reports the change', () => {
    const onChange = vi.fn();
    render(<DatePicker name="d" value="2026-05-20" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-05-15');
    expect(screen.getByRole('textbox')).toHaveValue('May 20, 2026');
  });

  it('closes the popup on Escape', () => {
    render(<DatePicker name="d" defaultValue="2026-05-20" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open the popup when disabled', () => {
    render(<DatePicker name="d" disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles the popup shut when the calendar icon is clicked again', () => {
    render(<DatePicker name="d" defaultValue="2026-05-20" />);
    const icon = screen.getByRole('button', { name: 'Open calendar' });
    fireEvent.click(icon);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(icon);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('commits the selected date to the form bridge', () => {
    const { state } = renderWithBridge(
      <DatePicker name="startDate" label="Start" />,
      { mockBridgeOptions: { defaultValues: { startDate: '2026-05-20' } } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
    // The selected date must stick — it must not be reverted by the
    // touched-marking blur that fires as the popup closes.
    expect(state?.values.startDate).toBe('2026-05-15');
  });
});
