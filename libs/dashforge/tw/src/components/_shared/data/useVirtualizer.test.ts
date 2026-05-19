// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { computeWindow } from './useVirtualizer.js';

describe('computeWindow', () => {
  it('returns empty window when totalCount is 0', () => {
    const w = computeWindow({
      totalCount: 0,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 0,
    });
    expect(w.endIndex).toBeLessThan(w.startIndex);
    expect(w.paddingTop).toBe(0);
    expect(w.paddingBottom).toBe(0);
  });

  it('returns first window when scrollTop=0 (with overscan)', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 0,
      overscan: 5,
    });
    // viewport fits 600 / 48 = 12.5 → 13 rows + 5 overscan top + 5 overscan bottom
    expect(w.startIndex).toBe(0);
    // 13 visible + 5 overscan_bottom = end at 17 ish
    expect(w.endIndex).toBeGreaterThanOrEqual(12);
    expect(w.paddingTop).toBe(0);
    expect(w.paddingBottom).toBeGreaterThan(0);
  });

  it('scrolls forward — start index advances with scrollTop', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 480, // 10 rows down
      overscan: 0,
    });
    expect(w.startIndex).toBe(10);
    expect(w.paddingTop).toBe(480);
  });

  it('overscan extends start index upward', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 480,
      overscan: 5,
    });
    expect(w.startIndex).toBe(5);
    expect(w.paddingTop).toBe(5 * 48);
  });

  it('overscan extends end index downward', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 0,
      overscan: 5,
    });
    // raw end was ceil(600/48) = 13. with overscan: 13 + 5 = 18.
    expect(w.endIndex).toBe(18);
  });

  it('clamps start at 0 when overscan would go negative', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 0,
      overscan: 10,
    });
    expect(w.startIndex).toBe(0);
    expect(w.paddingTop).toBe(0);
  });

  it('clamps end at totalCount-1 when overscan would exceed', () => {
    // scroll near the end
    const w = computeWindow({
      totalCount: 20,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 480, // would try to show rows 10-22
      overscan: 5,
    });
    expect(w.endIndex).toBe(19); // clamped
    expect(w.paddingBottom).toBe(0);
  });

  it('paddingTop + visible rows + paddingBottom = total scrollable height', () => {
    const totalCount = 1000;
    const rowHeight = 48;
    const w = computeWindow({
      totalCount,
      rowHeight,
      viewportHeight: 600,
      scrollTop: 5000,
      overscan: 3,
    });
    const visibleRowCount = w.endIndex - w.startIndex + 1;
    const totalRendered = w.paddingTop + visibleRowCount * rowHeight + w.paddingBottom;
    const totalExpected = totalCount * rowHeight;
    expect(totalRendered).toBe(totalExpected);
  });

  it('handles small dataset (everything fits in viewport)', () => {
    const w = computeWindow({
      totalCount: 5,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 0,
      overscan: 5,
    });
    expect(w.startIndex).toBe(0);
    expect(w.endIndex).toBe(4); // clamped to totalCount - 1
    expect(w.paddingTop).toBe(0);
    expect(w.paddingBottom).toBe(0);
  });

  it('returns empty window when rowHeight = 0 (defensive)', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 0,
      viewportHeight: 600,
      scrollTop: 100,
    });
    expect(w.endIndex).toBeLessThan(w.startIndex);
  });

  it('returns empty window when viewportHeight = 0', () => {
    const w = computeWindow({
      totalCount: 1000,
      rowHeight: 48,
      viewportHeight: 0,
      scrollTop: 100,
    });
    expect(w.endIndex).toBeLessThan(w.startIndex);
  });

  it('supports very large dataset (1 million rows)', () => {
    const w = computeWindow({
      totalCount: 1_000_000,
      rowHeight: 48,
      viewportHeight: 600,
      scrollTop: 24_000_000, // ~middle
      overscan: 5,
    });
    expect(w.startIndex).toBe(499_995);
    expect(w.endIndex).toBeGreaterThan(w.startIndex);
    expect(w.paddingTop).toBe(499_995 * 48);
    expect(w.paddingBottom).toBeGreaterThan(0);
  });
});
