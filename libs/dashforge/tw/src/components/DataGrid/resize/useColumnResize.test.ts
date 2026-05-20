// @vitest-environment jsdom
/**
 * Unit tests for `useColumnResize` — the pointer-drag + keyboard
 * column-resize hook (Sprint 4.2-bis, keyboard `nudge` added in
 * Sprint 6 P2). Sprint 6 P4 — direct coverage of the clamp logic
 * and the drag commit path.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useColumnResize } from './useColumnResize.js';

describe('useColumnResize — nudge (keyboard path)', () => {
  it('commits currentWidth + delta', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: { a: 100 }, onChange }),
    );
    result.current.nudge('a', 100, 16, 40, 400);
    expect(onChange).toHaveBeenCalledWith({ a: 116 });
  });

  it('clamps to the effective minimum', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: { a: 50 }, onChange }),
    );
    // currentWidth 50, delta -64 → 14, clamped up to min 40.
    result.current.nudge('a', 50, -64, 40, 400);
    expect(onChange).toHaveBeenCalledWith({ a: 40 });
  });

  it('clamps to the effective maximum', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: { a: 380 }, onChange }),
    );
    // currentWidth 380, delta +64 → 444, clamped down to max 400.
    result.current.nudge('a', 380, 64, 40, 400);
    expect(onChange).toHaveBeenCalledWith({ a: 400 });
  });

  it('honors the hook-level minWidth/maxWidth floor/ceiling', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({
        widths: {},
        onChange,
        minWidth: 80,
        maxWidth: 200,
      }),
    );
    // clampMin 40 < hook min 80 → effective min is 80.
    result.current.nudge('a', 100, -64, 40, 1000);
    expect(onChange).toHaveBeenCalledWith({ a: 80 });
  });

  it('preserves the other columns in the width map', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: { a: 100, b: 200 }, onChange }),
    );
    result.current.nudge('a', 100, 16, 40, 400);
    expect(onChange).toHaveBeenCalledWith({ a: 116, b: 200 });
  });
});

describe('useColumnResize — startResize (pointer-drag path)', () => {
  it('returns an event handler from the factory', () => {
    const { result } = renderHook(() =>
      useColumnResize({ widths: {}, onChange: () => {} }),
    );
    const handler = result.current.startResize('a', 100, 40, 400);
    expect(typeof handler).toBe('function');
  });

  it('a pointer drag commits a clamped new width via pointermove', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: { a: 100 }, onChange }),
    );
    const el = document.createElement('span');
    document.body.appendChild(el);

    // Synthetic pointerdown — shape mirrors React's PointerEvent.
    const downEvent = {
      pointerType: 'mouse',
      button: 0,
      clientX: 500,
      pointerId: 1,
      currentTarget: el,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.PointerEvent<HTMLElement>;

    result.current.startResize('a', 100, 40, 400)(downEvent);

    // Drag 30px to the right → 100 + 30 = 130.
    const move = new Event('pointermove') as Event & { clientX: number };
    move.clientX = 530;
    el.dispatchEvent(move);
    expect(onChange).toHaveBeenLastCalledWith({ a: 130 });

    // Drag far left → clamps to min 40.
    const move2 = new Event('pointermove') as Event & { clientX: number };
    move2.clientX = 0;
    el.dispatchEvent(move2);
    expect(onChange).toHaveBeenLastCalledWith({ a: 40 });

    // pointerup tears the listeners down — a later move is a no-op.
    const up = new Event('pointerup') as Event & { pointerId: number };
    up.pointerId = 1;
    el.dispatchEvent(up);
    onChange.mockClear();
    const move3 = new Event('pointermove') as Event & { clientX: number };
    move3.clientX = 999;
    el.dispatchEvent(move3);
    expect(onChange).not.toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it('ignores a non-primary mouse button', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColumnResize({ widths: {}, onChange }),
    );
    const el = document.createElement('span');
    const downEvent = {
      pointerType: 'mouse',
      button: 2, // right-click
      clientX: 0,
      pointerId: 1,
      currentTarget: el,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.PointerEvent<HTMLElement>;
    result.current.startResize('a', 100, 40, 400)(downEvent);
    const move = new Event('pointermove') as Event & { clientX: number };
    move.clientX = 200;
    el.dispatchEvent(move);
    // No listener was attached → no commit.
    expect(onChange).not.toHaveBeenCalled();
  });
});
