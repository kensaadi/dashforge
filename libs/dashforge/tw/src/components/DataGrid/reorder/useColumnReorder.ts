import { useCallback, useRef, useState, type DragEvent } from 'react';

/**
 * Native HTML5 drag-and-drop reorder for DataGrid column headers.
 *
 * Zero new runtime deps — uses the browser's built-in drag events.
 * The hook returns handler factories you wire onto each `<th>` plus
 * a `dropTarget` state used to render the visual indicator (a left
 * or right border on the hovered column).
 *
 *  - `dragStart(field)` → onDragStart; stashes source field in a ref
 *    + sets `dataTransfer.effectAllowed = 'move'`.
 *  - `dragOver(field)` → onDragOver; preventDefault + computes
 *    whether the cursor is over the LEFT or RIGHT half of the
 *    target → updates dropTarget so the indicator renders.
 *  - `drop(field)` → onDrop; computes the new order array via
 *    `moveColumn(source, target, side)` and commits it.
 *  - `dragEnd()` → onDragEnd; clears state.
 *
 * Reorder math: when dropping `source` onto the LEFT half of
 * `target`, the source is inserted BEFORE the target's position
 * in the order list. RIGHT half → AFTER.
 */

export interface UseColumnReorderArgs {
  /** The current order. */
  order: string[];
  /** Commit a new order. */
  onChange: (next: string[]) => void;
}

export interface DropTarget {
  field: string;
  side: 'left' | 'right';
}

export interface ColumnReorderHandlers {
  /** Current drop target (used by the renderer to show the indicator). */
  dropTarget: DropTarget | null;
  /** Field currently being dragged (used to dim the source header). */
  draggingField: string | null;
  dragStart: (field: string) => (e: DragEvent<HTMLElement>) => void;
  dragOver: (field: string) => (e: DragEvent<HTMLElement>) => void;
  drop: (field: string) => (e: DragEvent<HTMLElement>) => void;
  dragEnd: () => void;
}

export function useColumnReorder(
  args: UseColumnReorderArgs,
): ColumnReorderHandlers {
  const { order, onChange } = args;
  const sourceRef = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);

  const dragStart = useCallback(
    (field: string) => (e: DragEvent<HTMLElement>) => {
      sourceRef.current = field;
      setDraggingField(field);
      try {
        e.dataTransfer.effectAllowed = 'move';
        // Some browsers refuse to start a drag if no data is set.
        e.dataTransfer.setData('text/plain', field);
      } catch {
        /* noop — jsdom doesn't implement dataTransfer fully. */
      }
    },
    [],
  );

  const dragOver = useCallback(
    (field: string) => (e: DragEvent<HTMLElement>) => {
      if (sourceRef.current == null) return;
      if (field === sourceRef.current) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      // Determine LEFT vs RIGHT half of the target.
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      const side: 'left' | 'right' = e.clientX < midpoint ? 'left' : 'right';
      setDropTarget((prev) =>
        prev && prev.field === field && prev.side === side
          ? prev
          : { field, side },
      );
    },
    [],
  );

  const drop = useCallback(
    (field: string) => (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const source = sourceRef.current;
      sourceRef.current = null;
      setDraggingField(null);
      const target = dropTarget;
      setDropTarget(null);
      if (!source || source === field) return;
      const side = target?.field === field ? target.side : 'right';
      const next = moveColumn(order, source, field, side);
      if (!arraysEqual(next, order)) onChange(next);
    },
    [order, onChange, dropTarget],
  );

  const dragEnd = useCallback(() => {
    sourceRef.current = null;
    setDraggingField(null);
    setDropTarget(null);
  }, []);

  return { dropTarget, draggingField, dragStart, dragOver, drop, dragEnd };
}

/**
 * Move `source` next to `target` in the `order` list.
 * `side='left'` inserts before; `side='right'` inserts after.
 * Exposed for unit testing.
 */
export function moveColumn(
  order: string[],
  source: string,
  target: string,
  side: 'left' | 'right',
): string[] {
  const withoutSource = order.filter((f) => f !== source);
  const targetIndex = withoutSource.indexOf(target);
  if (targetIndex === -1) return order;
  const insertAt = side === 'left' ? targetIndex : targetIndex + 1;
  return [
    ...withoutSource.slice(0, insertAt),
    source,
    ...withoutSource.slice(insertAt),
  ];
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
