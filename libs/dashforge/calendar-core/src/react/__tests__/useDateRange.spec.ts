import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useDateRange } from '../useDateRange.js';
import type { CalendarRangeDay, CalendarRangeMonth } from '../useDateRange.js';

const VIEW = { defaultMonth: 5, defaultYear: 2026, today: '2026-05-20' } as const;

function findDay(
  months: CalendarRangeMonth[],
  iso: string,
): CalendarRangeDay | undefined {
  return months
    .flatMap((month) => month.weeks)
    .flatMap((week) => week.days)
    .find((day) => day.iso === iso);
}

describe('useDateRange', () => {
  it('starts with an empty range', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    expect(result.current.range).toEqual({ start: null, end: null });
  });

  it('renders a single month by default', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    expect(result.current.months).toHaveLength(1);
    expect(result.current.months[0]?.month).toBe(5);
  });

  it('renders two consecutive months when monthCount is 2', () => {
    const { result } = renderHook(() => useDateRange({ ...VIEW, monthCount: 2 }));
    expect(result.current.months).toHaveLength(2);
    expect(result.current.months[0]?.month).toBe(5);
    expect(result.current.months[1]?.month).toBe(6);
    expect(result.current.months[1]?.year).toBe(2026);
  });

  it('wraps the trailing month across the year boundary', () => {
    const { result } = renderHook(() =>
      useDateRange({ defaultMonth: 12, defaultYear: 2026, today: '2026-05-20', monthCount: 2 }),
    );
    expect(result.current.months[1]?.month).toBe(1);
    expect(result.current.months[1]?.year).toBe(2027);
  });

  it('first click sets the start, end stays null', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    expect(result.current.range).toEqual({ start: '2026-05-10', end: null });
  });

  it('second click sets the end — a complete range', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    expect(result.current.range).toEqual({ start: '2026-05-10', end: '2026-05-15' });
  });

  it('swaps when the second click lands before the start', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    act(() => {
      result.current.selectDate('2026-05-08');
    });
    expect(result.current.range).toEqual({ start: '2026-05-08', end: '2026-05-15' });
  });

  it('a third click restarts the range', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    act(() => {
      result.current.selectDate('2026-05-22');
    });
    expect(result.current.range).toEqual({ start: '2026-05-22', end: null });
  });

  it('flags the committed range band on the grid cells', () => {
    const { result } = renderHook(() =>
      useDateRange({ ...VIEW, defaultValue: { start: '2026-05-10', end: '2026-05-13' } }),
    );
    const { months } = result.current;
    expect(findDay(months, '2026-05-10')?.isRangeStart).toBe(true);
    expect(findDay(months, '2026-05-13')?.isRangeEnd).toBe(true);
    expect(findDay(months, '2026-05-11')?.isInRange).toBe(true);
    expect(findDay(months, '2026-05-12')?.isInRange).toBe(true);
    expect(findDay(months, '2026-05-09')?.isInRange).toBe(false);
    expect(findDay(months, '2026-05-14')?.isInRange).toBe(false);
  });

  it('carries range flags onto the trailing month', () => {
    const { result } = renderHook(() =>
      useDateRange({
        ...VIEW,
        monthCount: 2,
        defaultValue: { start: '2026-05-28', end: '2026-06-04' },
      }),
    );
    const { months } = result.current;
    expect(findDay(months, '2026-05-28')?.isRangeStart).toBe(true);
    expect(findDay(months, '2026-06-02')?.isInRange).toBe(true);
    expect(findDay(months, '2026-06-04')?.isRangeEnd).toBe(true);
  });

  it('shows a hover preview band while a start is picked', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.hoverDate('2026-05-14');
    });
    const { months } = result.current;
    expect(findDay(months, '2026-05-10')?.isRangePreview).toBe(true);
    expect(findDay(months, '2026-05-12')?.isRangePreview).toBe(true);
    expect(findDay(months, '2026-05-14')?.isRangePreview).toBe(true);
    expect(findDay(months, '2026-05-15')?.isRangePreview).toBe(false);
  });

  it('does not preview once the range is complete', () => {
    const { result } = renderHook(() => useDateRange(VIEW));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    act(() => {
      result.current.hoverDate('2026-05-20');
    });
    expect(findDay(result.current.months, '2026-05-18')?.isRangePreview).toBe(false);
  });

  it('ignores clicks on disabled dates', () => {
    const { result } = renderHook(() =>
      useDateRange({ ...VIEW, disabledDates: ['2026-05-10'] }),
    );
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    expect(result.current.range).toEqual({ start: null, end: null });
  });

  it('respects minDate / maxDate bounds', () => {
    const { result } = renderHook(() =>
      useDateRange({ ...VIEW, minDate: '2026-05-05', maxDate: '2026-05-25' }),
    );
    act(() => {
      result.current.selectDate('2026-05-02');
    });
    expect(result.current.range.start).toBeNull();
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.selectDate('2026-05-30');
    });
    expect(result.current.range).toEqual({ start: '2026-05-10', end: null });
  });

  it('reports each change through onChange — partial then complete', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDateRange({ ...VIEW, onChange }));
    act(() => {
      result.current.selectDate('2026-05-10');
    });
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    expect(onChange).toHaveBeenNthCalledWith(1, { start: '2026-05-10', end: null });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      start: '2026-05-10',
      end: '2026-05-15',
    });
  });

  it('is controlled when `value` is supplied — internal state is ignored', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDateRange({ ...VIEW, value: { start: '2026-05-10', end: null }, onChange }),
    );
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    expect(result.current.range).toEqual({ start: '2026-05-10', end: null });
    expect(onChange).toHaveBeenCalledWith({ start: '2026-05-10', end: '2026-05-15' });
  });

  it('seeds the displayed month from the range start', () => {
    const { result } = renderHook(() =>
      useDateRange({
        today: '2026-05-20',
        defaultValue: { start: '2026-08-03', end: null },
      }),
    );
    expect(result.current.month).toBe(8);
    expect(result.current.year).toBe(2026);
  });
});
