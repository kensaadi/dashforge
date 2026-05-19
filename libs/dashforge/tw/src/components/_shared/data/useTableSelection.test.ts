// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useTableSelection } from './useTableSelection.js';

function setup(mode: 'none' | 'single' | 'multiple', initial: string[] = []) {
  return renderHook(() => {
    const [ids, setIds] = useState<string[]>(initial);
    const setIdsWithFn = (next: string[] | ((prev: string[]) => string[])) =>
      setIds((prev) => (typeof next === 'function' ? next(prev) : next));
    const selection = useTableSelection(mode, ids, setIdsWithFn);
    return { ids, selection };
  });
}

describe('useTableSelection — single mode', () => {
  it('toggleRow selects when not selected', () => {
    const { result } = setup('single');
    act(() => result.current.selection.toggleRow('a'));
    expect(result.current.ids).toEqual(['a']);
  });

  it('toggleRow on a different row REPLACES', () => {
    const { result } = setup('single', ['a']);
    act(() => result.current.selection.toggleRow('b'));
    expect(result.current.ids).toEqual(['b']);
  });

  it('toggleRow on same row DESELECTS', () => {
    const { result } = setup('single', ['a']);
    act(() => result.current.selection.toggleRow('a'));
    expect(result.current.ids).toEqual([]);
  });
});

describe('useTableSelection — multiple mode', () => {
  it('toggleRow ADDS to selection', () => {
    const { result } = setup('multiple');
    act(() => result.current.selection.toggleRow('a'));
    act(() => result.current.selection.toggleRow('b'));
    expect(result.current.ids.sort()).toEqual(['a', 'b']);
  });

  it('toggleRow on selected row REMOVES', () => {
    const { result } = setup('multiple', ['a', 'b']);
    act(() => result.current.selection.toggleRow('a'));
    expect(result.current.ids).toEqual(['b']);
  });

  it('toggleAll selects all when none selected', () => {
    const { result } = setup('multiple');
    act(() => result.current.selection.toggleAll(['a', 'b', 'c']));
    expect(result.current.ids).toEqual(['a', 'b', 'c']);
  });

  it('toggleAll deselects all when all already selected', () => {
    const { result } = setup('multiple', ['a', 'b', 'c']);
    act(() => result.current.selection.toggleAll(['a', 'b', 'c']));
    expect(result.current.ids).toEqual([]);
  });

  it('toggleAll selects all when SOME already selected', () => {
    const { result } = setup('multiple', ['a']);
    act(() => result.current.selection.toggleAll(['a', 'b', 'c']));
    expect(result.current.ids).toEqual(['a', 'b', 'c']);
  });

  it('isAllSelected reflects state', () => {
    const { result } = setup('multiple', ['a', 'b']);
    expect(result.current.selection.isAllSelected(['a', 'b'])).toBe(true);
    expect(result.current.selection.isAllSelected(['a', 'b', 'c'])).toBe(false);
  });

  it('isIndeterminate is true when some but not all selected', () => {
    const { result } = setup('multiple', ['a']);
    expect(result.current.selection.isIndeterminate(['a', 'b', 'c'])).toBe(true);
    expect(result.current.selection.isIndeterminate(['a'])).toBe(false); // all selected → false
  });

  it('clearSelection resets to empty', () => {
    const { result } = setup('multiple', ['a', 'b', 'c']);
    act(() => result.current.selection.clearSelection());
    expect(result.current.ids).toEqual([]);
  });
});

describe('useTableSelection — none mode', () => {
  it('toggleRow is no-op', () => {
    const { result } = setup('none');
    act(() => result.current.selection.toggleRow('a'));
    expect(result.current.ids).toEqual([]);
  });

  it('toggleAll is no-op', () => {
    const { result } = setup('none');
    act(() => result.current.selection.toggleAll(['a', 'b']));
    expect(result.current.ids).toEqual([]);
  });
});
