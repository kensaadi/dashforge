import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useCalendar } from '../useCalendar.js';

describe('useCalendar', () => {
  it('derives the initial view from "today"', () => {
    const { result } = renderHook(() => useCalendar({ today: '2026-05-20' }));
    expect(result.current.month).toBe(5);
    expect(result.current.year).toBe(2026);
    expect(result.current.monthLabel).toBe('May 2026');
  });

  it('builds a 6-row, 42-cell grid with 7 weekday headers', () => {
    const { result } = renderHook(() => useCalendar({ today: '2026-05-20' }));
    expect(result.current.weeks).toHaveLength(6);
    const totalDays = result.current.weeks.reduce((sum, week) => sum + week.days.length, 0);
    expect(totalDays).toBe(42);
    expect(result.current.weekdayNames).toHaveLength(7);
  });

  it('flags today and selected days in the grid', () => {
    const { result } = renderHook(() =>
      useCalendar({ today: '2026-05-20', selected: '2026-05-15' }),
    );
    const allDays = result.current.weeks.flatMap((week) => week.days);
    expect(allDays.find((day) => day.iso === '2026-05-20')?.isToday).toBe(true);
    expect(allDays.find((day) => day.iso === '2026-05-15')?.isSelected).toBe(true);
    expect(allDays.find((day) => day.iso === '2026-05-15')?.isToday).toBe(false);
  });

  it('navigates months, wrapping the year', () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: 12, defaultYear: 2026, today: '2026-05-20' }),
    );
    expect(result.current.month).toBe(12);
    act(() => {
      result.current.goToNextMonth();
    });
    expect(result.current.month).toBe(1);
    expect(result.current.year).toBe(2027);
    act(() => {
      result.current.goToPreviousMonth();
    });
    expect(result.current.month).toBe(12);
    expect(result.current.year).toBe(2026);
  });

  it('moves roving focus with navigate()', () => {
    const { result } = renderHook(() => useCalendar({ today: '2026-05-20' }));
    expect(result.current.focusedDate).toBe('2026-05-20');
    act(() => {
      result.current.navigate('right');
    });
    expect(result.current.focusedDate).toBe('2026-05-21');
    act(() => {
      result.current.navigate('down');
    });
    expect(result.current.focusedDate).toBe('2026-05-28');
  });

  it('follows the grid across a month edge when navigating', () => {
    const { result } = renderHook(() =>
      useCalendar({ today: '2026-05-20', defaultFocusedDate: '2026-05-31' }),
    );
    expect(result.current.month).toBe(5);
    act(() => {
      result.current.navigate('right');
    });
    expect(result.current.focusedDate).toBe('2026-06-01');
    expect(result.current.month).toBe(6);
  });

  it('selects an enabled date and emits onSelect', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCalendar({ today: '2026-05-20', onSelect }));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    expect(onSelect).toHaveBeenCalledWith('2026-05-10');
  });

  it('does not select a disabled date', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({ today: '2026-05-20', minDate: '2026-05-15', onSelect }),
    );
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.isDayDisabled('2026-05-10')).toBe(true);
    expect(result.current.isDayDisabled('2026-05-20')).toBe(false);
  });

  it('marks disabled days in the grid view-model', () => {
    const { result } = renderHook(() =>
      useCalendar({ today: '2026-05-20', disabledDates: ['2026-05-12'] }),
    );
    const day = result.current.weeks
      .flatMap((week) => week.days)
      .find((entry) => entry.iso === '2026-05-12');
    expect(day?.isDisabled).toBe(true);
  });

  it('honours controlled month/year and reports change requests', () => {
    const onMonthChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({ month: 5, year: 2026, today: '2026-05-20', onMonthChange }),
    );
    act(() => {
      result.current.goToNextMonth();
    });
    // Controlled: the displayed month does not move on its own ...
    expect(result.current.month).toBe(5);
    // ... but the requested change is reported to the consumer.
    expect(onMonthChange).toHaveBeenCalledWith(6, 2026);
  });
});
