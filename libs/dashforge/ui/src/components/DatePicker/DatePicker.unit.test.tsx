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

  // Regression for #114: with the bridge default value at `null`, the first
  // day-cell click has to commit to the bridge (null → valid transition).
  // The user-reported symptom was "popup closes but the input stays empty"
  // because `handleCalendarChange` was believed not to fire. In hindsight
  // the live path works end-to-end; keep this test so a future refactor
  // that breaks the null-seeded controlled path (e.g. `useCalendar`
  // treating `selected === null` as "no controlled state" and skipping
  // `onSelect`) is caught in CI instead of the next dash smoke session.
  //
  // Fake system time so the calendar opens on a known month regardless of
  // the wall clock — with `defaultValue == null` the calendar seeds off
  // `today`, so the day button label we click must live in that month.
  it('commits from a null default value (issue #114)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00Z'));
    try {
      const { state } = renderWithBridge(
        <DatePicker
          name="startDate"
          label="Start"
          minDate="2026-05-01"
          maxDate="2026-07-31"
        />,
        { mockBridgeOptions: { defaultValues: { startDate: null } } },
      );
      expect(screen.getByRole('textbox')).toHaveValue('');
      expect(state?.values.startDate).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
      fireEvent.click(screen.getByRole('button', { name: /May 15, 2026/ }));
      expect(state?.values.startDate).toBe('2026-05-15');
      expect(screen.getByRole('textbox')).toHaveValue('May 15, 2026');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
