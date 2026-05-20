// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { moveColumn, useColumnReorder } from './useColumnReorder.js';

/** Minimal fake of the bits of a drag event the hook reads. */
function fakeDragStart() {
  return {
    dataTransfer: { effectAllowed: '', setData: vi.fn() },
  } as unknown as React.DragEvent<HTMLElement>;
}
function fakeDragOver(clientX: number) {
  return {
    preventDefault: vi.fn(),
    dataTransfer: { dropEffect: '' },
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, width: 100 }),
    },
    clientX,
  } as unknown as React.DragEvent<HTMLElement>;
}
function fakeDrop() {
  return { preventDefault: vi.fn() } as unknown as React.DragEvent<HTMLElement>;
}

describe('moveColumn', () => {
  const order = ['a', 'b', 'c', 'd'];

  it('moves source BEFORE target on left drop', () => {
    expect(moveColumn(order, 'd', 'b', 'left')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('moves source AFTER target on right drop', () => {
    expect(moveColumn(order, 'a', 'c', 'right')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('handles dragging right by one', () => {
    expect(moveColumn(order, 'a', 'b', 'right')).toEqual(['b', 'a', 'c', 'd']);
  });

  it('handles dragging left by one', () => {
    expect(moveColumn(order, 'd', 'c', 'left')).toEqual(['a', 'b', 'd', 'c']);
  });

  it('no-ops when source == target', () => {
    // moveColumn assumes the caller has already filtered source==target,
    // but if not, the source ends up next to itself (still valid order).
    expect(moveColumn(order, 'b', 'b', 'left')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns the original list when target is not in the order', () => {
    expect(moveColumn(order, 'a', 'zzz', 'left')).toEqual(order);
  });

  it('preserves all fields after the move', () => {
    const result = moveColumn(order, 'a', 'd', 'right');
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('useColumnReorder — drag handlers', () => {
  const order = ['a', 'b', 'c', 'd'];

  it('dragStart records the source field + dragging state', () => {
    const { result } = renderHook(() =>
      useColumnReorder({ order, onChange: vi.fn() }),
    );
    const e = fakeDragStart();
    act(() => result.current.dragStart('a')(e));
    expect(result.current.draggingField).toBe('a');
    expect(e.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'a');
  });

  it('dragOver on the RIGHT half marks a right-side drop target', () => {
    const { result } = renderHook(() =>
      useColumnReorder({ order, onChange: vi.fn() }),
    );
    act(() => result.current.dragStart('a')(fakeDragStart()));
    // clientX 80 of a 0..100 cell → past the midpoint → 'right'.
    act(() => result.current.dragOver('c')(fakeDragOver(80)));
    expect(result.current.dropTarget).toEqual({ field: 'c', side: 'right' });
  });

  it('dragOver on the LEFT half marks a left-side drop target', () => {
    const { result } = renderHook(() =>
      useColumnReorder({ order, onChange: vi.fn() }),
    );
    act(() => result.current.dragStart('a')(fakeDragStart()));
    act(() => result.current.dragOver('c')(fakeDragOver(20)));
    expect(result.current.dropTarget).toEqual({ field: 'c', side: 'left' });
  });

  it('dragOver onto the source column itself is a no-op', () => {
    const { result } = renderHook(() =>
      useColumnReorder({ order, onChange: vi.fn() }),
    );
    act(() => result.current.dragStart('a')(fakeDragStart()));
    act(() => result.current.dragOver('a')(fakeDragOver(80)));
    expect(result.current.dropTarget).toBeNull();
  });

  it('drop commits the reordered list via onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useColumnReorder({ order, onChange }));
    act(() => result.current.dragStart('a')(fakeDragStart()));
    act(() => result.current.dragOver('c')(fakeDragOver(80)));
    act(() => result.current.drop('c')(fakeDrop()));
    // 'a' dropped on the RIGHT of 'c' → ['b','c','a','d'].
    expect(onChange).toHaveBeenCalledWith(['b', 'c', 'a', 'd']);
  });

  it('drop on the source column does not call onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useColumnReorder({ order, onChange }));
    act(() => result.current.dragStart('a')(fakeDragStart()));
    act(() => result.current.drop('a')(fakeDrop()));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('dragEnd clears the dragging + drop-target state', () => {
    const { result } = renderHook(() =>
      useColumnReorder({ order, onChange: vi.fn() }),
    );
    act(() => result.current.dragStart('a')(fakeDragStart()));
    act(() => result.current.dragOver('c')(fakeDragOver(80)));
    act(() => result.current.dragEnd());
    expect(result.current.draggingField).toBeNull();
    expect(result.current.dropTarget).toBeNull();
  });
});
