// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { moveColumn } from './useColumnReorder.js';

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
