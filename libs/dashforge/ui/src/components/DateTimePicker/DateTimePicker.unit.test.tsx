import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from './DateTimePicker';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for DateTimePicker component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 * Tests all three modes: date, time, datetime.
 */
describe('DateTimePicker', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders datetime input with label', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
        />
      );

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('datetime-local');
    });

    it('renders date input when mode="date"', () => {
      render(
        <DateTimePicker name="birthdate" label="Birth Date" mode="date" />
      );

      const input = screen.getByLabelText('Birth Date') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('date');
    });

    it('renders time input when mode="time"', () => {
      render(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />
      );

      const input = screen.getByLabelText('Meeting Time') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('time');
    });

    it('defaults to datetime mode when mode not specified', () => {
      render(<DateTimePicker name="timestamp" label="Timestamp" />);

      const input = screen.getByLabelText('Timestamp') as HTMLInputElement;
      expect(input.type).toBe('datetime-local');
    });

    it('mode="datetime": typing datetime triggers onChange with ISO string', async () => {
      const user = userEvent.setup();
      const values: (string | null)[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState<string | null>(null);
        return (
          <DateTimePicker
            name="appointment"
            label="Appointment"
            mode="datetime"
            value={value}
            onChange={(iso: string | null) => {
              setValue(iso);
              values.push(iso);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;

      // Type a local datetime value
      await user.clear(input);
      await user.type(input, '2026-02-25T13:45');
      await user.tab(); // blur

      // Expect onChange was called with ISO string (UTC)
      expect(values.length).toBeGreaterThan(0);
      const lastValue = values[values.length - 1];
      expect(lastValue).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      // Verify it's parseable
      expect(() => new Date(lastValue as string)).not.toThrow();
    });

    it('mode="date": typing date triggers onChange with ISO string', async () => {
      const user = userEvent.setup();
      const values: (string | null)[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState<string | null>(null);
        return (
          <DateTimePicker
            name="birthdate"
            label="Birth Date"
            mode="date"
            value={value}
            onChange={(iso: string | null) => {
              setValue(iso);
              values.push(iso);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Birth Date') as HTMLInputElement;

      // Type a date value
      await user.clear(input);
      await user.type(input, '2026-02-25');
      await user.tab(); // blur

      // Expect onChange was called with ISO string
      expect(values.length).toBeGreaterThan(0);
      const lastValue = values[values.length - 1];
      expect(lastValue).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('mode="time": typing time triggers onChange with ISO string', async () => {
      const user = userEvent.setup();
      const values: (string | null)[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState<string | null>(null);
        return (
          <DateTimePicker
            name="meetingTime"
            label="Meeting Time"
            mode="time"
            value={value}
            onChange={(iso: string | null) => {
              setValue(iso);
              values.push(iso);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Meeting Time') as HTMLInputElement;

      // Type a time value
      await user.clear(input);
      await user.type(input, '13:45');
      await user.tab(); // blur

      // Expect onChange was called with ISO string
      expect(values.length).toBeGreaterThan(0);
      const lastValue = values[values.length - 1];
      expect(lastValue).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('clearing input triggers onChange with null', async () => {
      const user = userEvent.setup();
      const values: (string | null)[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState<string | null>(
          '2026-02-25T13:45:00.000Z'
        );
        return (
          <DateTimePicker
            name="appointment"
            label="Appointment"
            mode="datetime"
            value={value}
            onChange={(iso: string | null) => {
              setValue(iso);
              values.push(iso);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;

      // Clear the input
      await user.clear(input);
      await user.tab(); // blur

      // Expect onChange was called with null
      expect(values).toContain(null);
    });

    it('respects explicit helperText', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          helperText="Select a date and time"
        />
      );

      expect(screen.getByText('Select a date and time')).toBeInTheDocument();
    });

    it('respects explicit error prop', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          helperText="This field is required"
          error={true}
        />
      );

      const helperText = screen.getByText('This field is required');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('Mui-error');
    });

    it('visibleWhen false renders null (plain mode)', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          visibleWhen={() => false}
        />
      );

      expect(screen.queryByLabelText('Appointment')).not.toBeInTheDocument();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('mode="datetime": binds ISO from bridge to input display', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: '2026-02-25T10:30:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;
      // Input should show local datetime string (YYYY-MM-DDTHH:mm format)
      expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('mode="date": binds ISO from bridge to input display', () => {
      renderWithBridge(
        <DateTimePicker
          name="birthdate"
          label="Birth Date"
          mode="date"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { birthdate: '2026-02-25T12:00:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Birth Date') as HTMLInputElement;
      // Input should show local date string (YYYY-MM-DD format)
      expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('mode="time": binds ISO from bridge to input display', () => {
      renderWithBridge(
        <DateTimePicker
          name="meetingTime"
          label="Meeting Time"
          mode="time"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { meetingTime: '2026-02-25T14:30:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time') as HTMLInputElement;
      // Input should show local time string (HH:mm format)
      expect(input.value).toMatch(/^\d{2}:\d{2}$/);
    });

    it('defaults to empty input when bridge value is null', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
          },
        }
      );

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('mode="datetime": typing updates bridge with ISO string', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
          },
        }
      );

      const input = screen.getByLabelText('Appointment');
      await user.type(input, '2026-02-25T15:30');

      // Verify bridge state was updated with ISO string
      expect(state?.values.appointment).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('mode="date": typing updates bridge with ISO string', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="birthdate" label="Birth Date" mode="date" />,
        {
          mockBridgeOptions: {
            defaultValues: { birthdate: null },
          },
        }
      );

      const input = screen.getByLabelText('Birth Date');
      await user.type(input, '2026-03-15');

      // Verify bridge state was updated with ISO string
      expect(state?.values.birthdate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('mode="time": typing updates bridge with ISO string', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />,
        {
          mockBridgeOptions: {
            defaultValues: { meetingTime: null },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time');
      await user.type(input, '16:45');

      // Verify bridge state was updated with ISO string
      expect(state?.values.meetingTime).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('clearing input updates bridge to null', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: '2026-02-25T10:30:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Appointment');
      await user.clear(input);

      // Verify bridge state was updated to null
      expect(state?.values.appointment).toBeNull();
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="appointment" label="Appointment" />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
          },
        }
      );

      const input = screen.getByLabelText('Appointment');
      await user.click(input);
      await user.tab(); // Move focus away (triggers blur)

      // Verify touched state was updated
      expect(state?.touched.appointment).toBe(true);
    });

    it('explicit value prop overrides bridge value (including null)', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          mode="datetime"
          value={null}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: '2026-02-25T10:30:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Appointment') as HTMLInputElement;
      // Explicit value={null} should override bridge value
      expect(input.value).toBe('');
    });

    it('mode="time": preserves base date when updating time', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />,
        {
          mockBridgeOptions: {
            // Initial value: Feb 25, 2026 at 10:00 UTC
            defaultValues: { meetingTime: '2026-02-25T10:00:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time');
      // Type a new time: 13:45
      await user.clear(input);
      await user.type(input, '13:45');

      // Get the updated ISO string
      const updatedIso = state?.values.meetingTime as string;
      expect(updatedIso).toBeTruthy();

      // Convert both dates to local date components
      const originalDate = new Date('2026-02-25T10:00:00.000Z');
      const updatedDate = new Date(updatedIso);

      // Verify the local date (year, month, day) is preserved
      expect(updatedDate.getFullYear()).toBe(originalDate.getFullYear());
      expect(updatedDate.getMonth()).toBe(originalDate.getMonth());
      expect(updatedDate.getDate()).toBe(originalDate.getDate());

      // Verify the time changed (at least hours should differ)
      // We can't assert exact time due to timezone, but we can verify it's an ISO string
      expect(updatedIso).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    // === lastValidIsoRef fallback tests (0.1.6-alpha fix) =====================
    //
    // The DateTimePicker keeps a `lastValidIsoRef` that captures the most
    // recent non-empty ISO seen during render. When the user types a partial
    // value in `mode="time"`, intermediate keystrokes parse to `null` and the
    // bridge briefly returns `''` (empty string) instead of a valid base
    // date. Without the fallback, `inputValueToIso(mode='time', input, '')`
    // would default to TODAY, silently changing year/month/day.
    //
    // Three things have to hold for the fix to work:
    //   1. The fallback uses `||` (not `??`) so '' coalesces to the ref.
    //   2. The ref is populated only with NON-EMPTY ISO strings (so it stays
    //      as the last-known-good).
    //   3. With no previously-valid ISO at all, the fallback degrades to
    //      today's date (no crash, just less-useful preservation).

    it('mode="time": lastValidIsoRef fallback preserves the date when bridge briefly returns empty string', async () => {
      // This scenario triggers the `||` fallback explicitly: between
      // `user.clear()` (bridge → '') and the first valid `user.type` keystroke,
      // the only way to recover the original date is through lastValidIsoRef.
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />,
        {
          mockBridgeOptions: {
            // mockBridge.getValue returns '' for null/undefined values
            // (see test-utils/mockBridge.ts). This is exactly the shape that
            // would break the previous `?? baseIso` implementation.
            defaultValues: { meetingTime: '2026-02-25T10:00:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time');
      // First clear (bridge transitions to '' via setValue(null)),
      // then re-type a full HH:mm string.
      await user.clear(input);
      await user.type(input, '08:30');

      const updatedIso = state?.values.meetingTime as string;
      expect(updatedIso).toBeTruthy();

      const recoveredDate = new Date(updatedIso);
      const originalDate = new Date('2026-02-25T10:00:00.000Z');

      // The y/m/d MUST come from `lastValidIsoRef.current`, not from today.
      expect(recoveredDate.getFullYear()).toBe(originalDate.getFullYear());
      expect(recoveredDate.getMonth()).toBe(originalDate.getMonth());
      expect(recoveredDate.getDate()).toBe(originalDate.getDate());
    });

    it('mode="time": lastValidIsoRef stays at last NON-EMPTY ISO across multiple edit cycles', async () => {
      // The ref must NOT be overwritten by intermediate empty/invalid states.
      // Concretely: type a valid time, clear, type a new one — the second
      // submit should still be anchored to the ORIGINAL date.
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />,
        {
          mockBridgeOptions: {
            defaultValues: { meetingTime: '2026-02-25T10:00:00.000Z' },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time');

      // First edit cycle.
      await user.clear(input);
      await user.type(input, '08:30');
      const firstIso = state?.values.meetingTime as string;
      expect(firstIso).toBeTruthy();

      // Second edit cycle (clear → empty bridge → type new time).
      await user.clear(input);
      await user.type(input, '14:15');
      const secondIso = state?.values.meetingTime as string;
      expect(secondIso).toBeTruthy();

      // Both updates must preserve the ORIGINAL date — the ref is stable
      // through the empty-bridge window.
      const original = new Date('2026-02-25T10:00:00.000Z');
      const firstDate = new Date(firstIso);
      const secondDate = new Date(secondIso);
      expect(firstDate.getFullYear()).toBe(original.getFullYear());
      expect(firstDate.getMonth()).toBe(original.getMonth());
      expect(firstDate.getDate()).toBe(original.getDate());
      expect(secondDate.getFullYear()).toBe(original.getFullYear());
      expect(secondDate.getMonth()).toBe(original.getMonth());
      expect(secondDate.getDate()).toBe(original.getDate());
    });

    it('mode="time": with NO previous valid ISO the fallback degrades to today (no crash)', async () => {
      // When the field starts empty and the user types a time directly, there
      // is nothing in lastValidIsoRef to fall back to. The component must
      // still produce a valid ISO string — it just won't anchor to a chosen
      // calendar day. Verify it produces a syntactically valid ISO + matches
      // today's local date components (best-effort fallback).
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <DateTimePicker name="meetingTime" label="Meeting Time" mode="time" />,
        {
          mockBridgeOptions: {
            defaultValues: { meetingTime: null },
          },
        }
      );

      const input = screen.getByLabelText('Meeting Time');
      await user.type(input, '09:15');

      const isoStr = state?.values.meetingTime as string;
      expect(isoStr).toBeTruthy();
      // Syntactically valid ISO.
      expect(isoStr).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      // Date components match TODAY (local) — degraded fallback path.
      const produced = new Date(isoStr);
      const today = new Date();
      expect(produced.getFullYear()).toBe(today.getFullYear());
      expect(produced.getMonth()).toBe(today.getMonth());
      expect(produced.getDate()).toBe(today.getDate());
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('not touched + submitCount 0: no error text visible', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          rules={{ required: 'Appointment is required' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
            errors: { appointment: { message: 'Appointment is required' } },
            touched: { appointment: false },
            submitCount: 0,
          },
        }
      );

      // Error exists but should not be visible (not touched, not submitted)
      expect(
        screen.queryByText('Appointment is required')
      ).not.toBeInTheDocument();
    });

    it('touched true: error text visible', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          rules={{ required: 'Appointment is required' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
            errors: { appointment: { message: 'Appointment is required' } },
            touched: { appointment: true },
            submitCount: 0,
          },
        }
      );

      // Error should be visible (field is touched)
      expect(screen.getByText('Appointment is required')).toBeInTheDocument();
    });

    it('submitCount > 0: error text visible', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          rules={{ required: 'Appointment is required' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
            errors: { appointment: { message: 'Appointment is required' } },
            touched: { appointment: false },
            submitCount: 1,
          },
        }
      );

      // Error should be visible (form submitted)
      expect(screen.getByText('Appointment is required')).toBeInTheDocument();
    });

    it('explicit error={false} suppresses bridge error message', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          error={false}
          rules={{ required: 'Appointment is required' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
            errors: { appointment: { message: 'Appointment is required' } },
            touched: { appointment: true },
            submitCount: 1,
          },
        }
      );

      // Even though field is touched and submitted, explicit error={false} suppresses
      expect(
        screen.queryByText('Appointment is required')
      ).not.toBeInTheDocument();
    });

    it('explicit helperText overrides bridge error message', () => {
      renderWithBridge(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          helperText="Custom helper text"
          rules={{ required: 'Appointment is required' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
            errors: { appointment: { message: 'Appointment is required' } },
            touched: { appointment: true },
            submitCount: 0,
          },
        }
      );

      // Explicit helperText should be shown instead of bridge error
      expect(screen.getByText('Custom helper text')).toBeInTheDocument();
      expect(
        screen.queryByText('Appointment is required')
      ).not.toBeInTheDocument();
    });
  });

  describe('Intent D: Visibility', () => {
    it('bound mode renders when visibleWhen undefined', () => {
      renderWithBridge(
        <DateTimePicker name="appointment" label="Appointment" />,
        {
          mockBridgeOptions: {
            defaultValues: { appointment: null },
          },
        }
      );

      expect(screen.getByLabelText('Appointment')).toBeInTheDocument();
    });

    it('visibleWhen true renders component (plain mode)', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          visibleWhen={() => true}
        />
      );

      expect(screen.getByLabelText('Appointment')).toBeInTheDocument();
    });

    it('visibleWhen false renders null (plain mode)', () => {
      render(
        <DateTimePicker
          name="appointment"
          label="Appointment"
          visibleWhen={() => false}
        />
      );

      expect(screen.queryByLabelText('Appointment')).not.toBeInTheDocument();
    });
  });
});
