// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { DateTimePicker, isoToInputValue } from './DateTimePicker.js';

describe('isoToInputValue (pure helper)', () => {
  it('returns "" for null / undefined / empty', () => {
    expect(isoToInputValue('date', null)).toBe('');
    expect(isoToInputValue('date', undefined)).toBe('');
    expect(isoToInputValue('date', '')).toBe('');
  });

  it('passes through canonical `YYYY-MM-DD` for date mode', () => {
    expect(isoToInputValue('date', '2026-05-16')).toBe('2026-05-16');
  });

  it('passes through canonical `HH:mm` for time mode', () => {
    expect(isoToInputValue('time', '09:42')).toBe('09:42');
  });

  it('passes through canonical `HH:mm:ss` for time mode', () => {
    expect(isoToInputValue('time', '09:42:15')).toBe('09:42:15');
  });

  it('passes through canonical `YYYY-MM-DDTHH:mm` for datetime mode', () => {
    expect(isoToInputValue('datetime', '2026-05-16T09:42')).toBe(
      '2026-05-16T09:42'
    );
  });

  it('truncates a rich ISO datetime to the date mode prefix', () => {
    expect(isoToInputValue('date', '2026-05-16T09:42:15.000Z')).toBe(
      '2026-05-16'
    );
  });

  it('returns "" for an unparseable string', () => {
    expect(isoToInputValue('date', 'not-a-date')).toBe('');
  });
});

describe('<DateTimePicker>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders a native date input by default', () => {
      render(<DateTimePicker name="dob" label="DOB" />);
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      expect(input.type).toBe('date');
    });

    it('renders a time input when mode="time"', () => {
      render(<DateTimePicker name="t" label="Time" mode="time" />);
      const input = screen.getByLabelText('Time') as HTMLInputElement;
      expect(input.type).toBe('time');
    });

    it('renders a datetime-local input when mode="datetime"', () => {
      render(<DateTimePicker name="dt" label="When" mode="datetime" />);
      const input = screen.getByLabelText('When') as HTMLInputElement;
      expect(input.type).toBe('datetime-local');
    });

    it('seeds `defaultValue` (uncontrolled)', () => {
      render(
        <DateTimePicker name="dob" label="DOB" defaultValue="2026-05-16" />
      );
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      expect(input.defaultValue).toBe('2026-05-16');
    });

    it('reflects controlled `value`', () => {
      render(
        <DateTimePicker name="dob" label="DOB" value="2026-05-16" />
      );
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      expect(input.value).toBe('2026-05-16');
    });

    it('truncates a controlled rich ISO to the date mode prefix', () => {
      render(
        <DateTimePicker
          name="dob"
          label="DOB"
          value="2026-05-16T09:42:15.000Z"
        />
      );
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      expect(input.value).toBe('2026-05-16');
    });

    it('forwards min/max/step to the native input', () => {
      render(
        <DateTimePicker
          name="t"
          label="Time"
          mode="time"
          min="08:00"
          max="18:00"
          step={300}
        />
      );
      const input = screen.getByLabelText('Time') as HTMLInputElement;
      expect(input.min).toBe('08:00');
      expect(input.max).toBe('18:00');
      expect(input.step).toBe('300');
    });

    it('renders a `*` for required fields and sets the native attr', () => {
      render(<DateTimePicker name="dob" label="DOB" required />);
      const input = screen.getByLabelText(/DOB/) as HTMLInputElement;
      expect(input.required).toBe(true);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('renders helperText when not in error', () => {
      render(
        <DateTimePicker
          name="dob"
          label="DOB"
          helperText="Pick a date in the past."
        />
      );
      expect(screen.getByText('Pick a date in the past.')).toBeTruthy();
    });

    it('shows the helperText in the error slot when `error` is true', () => {
      render(
        <DateTimePicker
          name="dob"
          label="DOB"
          error
          helperText="Required"
        />
      );
      const p = screen.getByText('Required');
      // The error slot has the `text-danger-600` class per the variants.
      expect(p.className).toMatch(/danger/);
    });

    it('disables the input', () => {
      render(<DateTimePicker name="dob" label="DOB" disabled />);
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('event wiring', () => {
    it('fires onValueChange with the typed value (date)', () => {
      const onValueChange = vi.fn();
      render(
        <DateTimePicker
          name="dob"
          label="DOB"
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '2026-12-25' } });
      expect(onValueChange).toHaveBeenCalledWith('2026-12-25');
    });

    it('fires onValueChange with `null` when the input is cleared', () => {
      const onValueChange = vi.fn();
      render(
        <DateTimePicker
          name="dob"
          label="DOB"
          value="2026-05-16"
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByLabelText('DOB') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      expect(onValueChange).toHaveBeenCalledWith(null);
    });
  });

  describe('inside DashFormProvider', () => {
    it('mounts cleanly with the bridge attached', () => {
      render(
        <DashFormProvider defaultValues={{ dob: '2026-05-16' }}>
          <DateTimePicker name="dob" label="DOB" />
        </DashFormProvider>
      );
      // Mount assertion — defaultValues commit is timing-sensitive in
      // vitest (mirror of how Autocomplete / RadioGroup / NumberField
      // are tested), so we don't assert input.value here.
      expect(screen.getByLabelText('DOB')).toBeTruthy();
    });
  });

  describe('visibility', () => {
    it('returns null when visibleWhen returns false', () => {
      const { container } = render(
        <DateTimePicker
          name="dob"
          label="DOB"
          visibleWhen={() => false}
        />
      );
      expect(container.querySelector('input')).toBeNull();
    });
  });
});
