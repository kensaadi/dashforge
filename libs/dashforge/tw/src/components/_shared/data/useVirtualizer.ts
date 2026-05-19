import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Window descriptor — which slice of the row array is currently
 * mounted in DOM, and how much spacer height to render above and
 * below the visible window so the scrollbar size matches the
 * "virtual" total height.
 */
export interface VirtualizerWindow {
  /** First row index inside the visible window (inclusive). */
  startIndex: number;
  /** Last row index inside the visible window (inclusive). */
  endIndex: number;
  /** Pixels to render above the visible rows (spacer top). */
  paddingTop: number;
  /** Pixels to render below the visible rows (spacer bottom). */
  paddingBottom: number;
}

export interface UseVirtualizerArgs {
  /** Total number of rows in the underlying data set. */
  totalCount: number;
  /** Fixed row height in pixels. */
  rowHeight: number;
  /**
   * Visible viewport height in pixels. Pass the height of the
   * scroll container.
   */
  viewportHeight: number;
  /** Current scrollTop of the scroll container. */
  scrollTop: number;
  /**
   * How many extra rows to render above / below the visible window
   * for smoother scrolling (reduces blank-flash on fast scroll).
   * @default 5
   */
  overscan?: number;
}

/**
 * Compute the visible window of rows + the spacer heights given the
 * current scroll position. Pure function — exported for testability.
 *
 * @example
 * ```ts
 * computeWindow({ totalCount: 1000, rowHeight: 48, viewportHeight: 600,
 *                 scrollTop: 0, overscan: 5 });
 * // → { startIndex: 0, endIndex: 17, paddingTop: 0, paddingBottom: 47136 }
 * ```
 */
export function computeWindow(args: UseVirtualizerArgs): VirtualizerWindow {
  const { totalCount, rowHeight, viewportHeight, scrollTop, overscan = 5 } = args;

  if (totalCount <= 0 || rowHeight <= 0 || viewportHeight <= 0) {
    return { startIndex: 0, endIndex: -1, paddingTop: 0, paddingBottom: 0 };
  }

  // Raw visible range from scrollTop alone.
  const rawStart = Math.floor(scrollTop / rowHeight);
  const rawEnd = Math.ceil((scrollTop + viewportHeight) / rowHeight);

  // Apply overscan + clamp to [0, totalCount - 1].
  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(totalCount - 1, rawEnd + overscan);

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = Math.max(0, (totalCount - 1 - endIndex) * rowHeight);

  return { startIndex, endIndex, paddingTop, paddingBottom };
}

/**
 * `useVirtualizer` — viewport-based row windowing for `<DataGrid>`.
 *
 * Hand-rolled (no `@tanstack/react-virtual` dep — constraint memorized
 * in `feedback_dashforge_preset_is_identity` companion: "no new
 * external runtime deps"). Uses scroll event + `requestAnimationFrame`
 * debounce + `ResizeObserver` on the container. Fixed row height
 * only in v1 — variable-height with measurement cache deferred to
 * v1-bis.
 *
 * Returns:
 *  - `scrollRef`: attach to the scroll container `<div>`.
 *  - `window`: which row indices to mount + top/bottom spacer heights
 *    to preserve scroll-area size.
 *  - `viewportHeight`: current container height (re-measured on
 *    `ResizeObserver` ticks).
 *
 * The DataGrid renders `rows.slice(window.startIndex, window.endIndex + 1)`
 * between two spacer `<tr style={{ height: paddingTop }} />` elements
 * (above and below). This preserves `<table>` semantics — screen
 * readers see a continuous structure with `aria-hidden` spacers.
 *
 * @example
 * ```tsx
 * const { scrollRef, window } = useVirtualizer({
 *   totalCount: rows.length,
 *   rowHeight: 48,
 *   overscan: 5,
 * });
 *
 * return (
 *   <div ref={scrollRef} style={{ height: 600, overflow: 'auto' }}>
 *     <table>
 *       <tbody>
 *         <tr aria-hidden="true" style={{ height: window.paddingTop }} />
 *         {rows.slice(window.startIndex, window.endIndex + 1).map(...)}
 *         <tr aria-hidden="true" style={{ height: window.paddingBottom }} />
 *       </tbody>
 *     </table>
 *   </div>
 * );
 * ```
 */
export function useVirtualizer(args: {
  totalCount: number;
  rowHeight: number;
  overscan?: number;
  /**
   * Initial viewport height — used before the ResizeObserver
   * settles on first paint. Pass an explicit `height` prop value
   * if you have one; otherwise the hook re-measures on layout.
   * @default 400
   */
  initialViewportHeight?: number;
}): {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  window: VirtualizerWindow;
  viewportHeight: number;
} {
  const { totalCount, rowHeight, overscan = 5, initialViewportHeight = 400 } = args;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(initialViewportHeight);

  // Debounce scroll handler via requestAnimationFrame so we never
  // re-render more than once per paint frame even when the scroll
  // event fires rapidly during fast scrolling.
  const rafIdRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const el = scrollRef.current;
      if (!el) return;
      setScrollTop(el.scrollTop);
    });
  }, []);

  // Attach scroll listener.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [handleScroll]);

  // Track container viewport height via ResizeObserver — re-virtualize
  // when the container size changes (window resize, sidebar collapse,
  // etc.). Use `useLayoutEffect` so the first measurement happens
  // before paint to avoid a flash of stale window.
  //
  // **Defensive**: only accept measurements > 0. jsdom (test env)
  // returns `clientHeight === 0` for unmounted containers, which would
  // collapse the window to empty. The hook keeps the
  // `initialViewportHeight` fallback in that case.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.clientHeight > 0) {
      setViewportHeight(el.clientHeight);
    }
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || entry.contentRect.height <= 0) return;
      setViewportHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const window = computeWindow({
    totalCount,
    rowHeight,
    viewportHeight,
    scrollTop,
    overscan,
  });

  return { scrollRef, window, viewportHeight };
}
