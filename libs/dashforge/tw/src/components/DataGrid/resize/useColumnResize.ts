import { useCallback, useRef, type PointerEvent as RPointerEvent } from 'react';

/**
 * Native column-resize behavior for DataGrid (and Table later if
 * promoted to `_shared`).
 *
 * The returned `startResize` is wired to a `pointerdown` handler on a
 * thin grabber positioned at the right edge of a `<th>`. We capture
 * the pointer on the target element so `pointermove` / `pointerup`
 * keep flowing even if the cursor leaves the grabber.
 *
 * Why native pointer events vs a drag library:
 *  - Zero new runtime deps (sprint constraint)
 *  - Pointer events normalize mouse/touch/pen out of the box
 *  - Pointer capture means we don't have to track the global
 *    `mousemove` / `mouseup` — the browser routes events to our
 *    listener until release.
 */

export interface UseColumnResizeArgs {
  /** Current column widths (Record<field, px>). */
  widths: Record<string, number>;
  /** Commit a new width map. */
  onChange: (next: Record<string, number>) => void;
  /** Hard floor for any column (px). @default 40 */
  minWidth?: number;
  /** Hard ceiling for any column (px). @default 1200 */
  maxWidth?: number;
}

export interface ColumnResizeHandlers {
  startResize: (
    field: string,
    startWidth: number,
    clampMin: number,
    clampMax: number,
  ) => (e: RPointerEvent<HTMLElement>) => void;
}

export function useColumnResize(args: UseColumnResizeArgs): ColumnResizeHandlers {
  const { widths, onChange, minWidth = 40, maxWidth = 1200 } = args;

  // We need the LATEST widths inside the pointermove closure. Stick
  // them in a ref so the closure captured at pointerdown stays valid
  // for the duration of the drag.
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const startResize = useCallback(
    (
      field: string,
      startWidth: number,
      clampMin: number,
      clampMax: number,
    ) => {
      return (e: RPointerEvent<HTMLElement>) => {
        // Only respond to the primary mouse button (or touch / pen).
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const target = e.currentTarget;
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          // jsdom or older browsers — fine to fall back to global listeners.
        }

        const effectiveMin = Math.max(minWidth, clampMin);
        const effectiveMax = Math.min(maxWidth, clampMax);

        const handleMove = (ev: PointerEvent) => {
          const delta = ev.clientX - startX;
          const next = clamp(startWidth + delta, effectiveMin, effectiveMax);
          onChange({ ...widthsRef.current, [field]: next });
        };

        const handleEnd = (ev: PointerEvent) => {
          try {
            target.releasePointerCapture(ev.pointerId);
          } catch {
            /* noop */
          }
          target.removeEventListener('pointermove', handleMove);
          target.removeEventListener('pointerup', handleEnd);
          target.removeEventListener('pointercancel', handleEnd);
        };

        target.addEventListener('pointermove', handleMove);
        target.addEventListener('pointerup', handleEnd);
        target.addEventListener('pointercancel', handleEnd);
      };
    },
    [onChange, minWidth, maxWidth],
  );

  return { startResize };
}

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
