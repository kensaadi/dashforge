/**
 * Compute the array of page indices (or `'ellipsis'` sentinels) to
 * render for a `<Pagination>`.
 *
 * Algorithm (standard "siblings + boundaries + ellipsis fill"):
 *  1. Always show `boundaryCount` pages at the start and `boundaryCount`
 *     at the end.
 *  2. Show `siblingCount` pages on each side of the current page.
 *  3. Fill gaps wider than 1 with `'ellipsis'`.
 *  4. If a gap is exactly 1 page wide, include that page directly
 *     (no ellipsis for a single hidden number).
 *
 * Output is 1-indexed page numbers OR the literal string `'ellipsis'`.
 *
 * @example
 * ```ts
 * range(1, 10, 1, 1)  // [1, 'ellipsis', 5, 'ellipsis', 10] when current=5
 * range(1, 5, 1, 1)   // [1, 2, 3, 4, 5]
 * range(1, 100, 1, 1) // edges varying with current
 * ```
 */
export function computePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  // Budget: if `totalPages` fits within boundaries + siblings + current
  // (plus the 2 hypothetical ellipsis slots), don't bother with ellipses
  // at all — list every page. Avoids the "[1, 2, …, 5]" footgun where
  // the user expected to see 3 and 4 explicitly.
  const minPagesForEllipsis = 2 * boundaryCount + 2 * siblingCount + 3;
  if (totalPages <= minPagesForEllipsis) {
    return range(1, totalPages);
  }

  const startBoundary = range(1, Math.min(boundaryCount, totalPages));
  const endBoundary = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages,
  );

  const siblingsStart = Math.max(currentPage - siblingCount, boundaryCount + 2);
  const siblingsEnd = Math.min(
    currentPage + siblingCount,
    totalPages - boundaryCount - 1,
  );
  const siblings = range(siblingsStart, siblingsEnd);

  const showStartEllipsis = siblingsStart > boundaryCount + 2;
  const showEndEllipsis = siblingsEnd < totalPages - boundaryCount - 1;

  const out: (number | 'ellipsis')[] = [...startBoundary];

  if (showStartEllipsis) {
    out.push('ellipsis');
  } else if (siblingsStart === boundaryCount + 2) {
    // Single hidden page → fill it directly instead of an ellipsis.
    out.push(boundaryCount + 1);
  }

  out.push(...siblings);

  if (showEndEllipsis) {
    out.push('ellipsis');
  } else if (siblingsEnd === totalPages - boundaryCount - 1) {
    out.push(totalPages - boundaryCount);
  }

  out.push(...endBoundary);

  // Dedupe while preserving order (overlapping ranges produce duplicates
  // when totalPages is small). Two distinct rules:
  //   1. Number entries: keep only the first occurrence.
  //   2. Ellipsis entries: collapse adjacent ellipses to one.
  const seen = new Set<number>();
  const deduped: (number | 'ellipsis')[] = [];
  let prevWasEllipsis = false;
  for (const entry of out) {
    if (entry === 'ellipsis') {
      if (!prevWasEllipsis) {
        deduped.push('ellipsis');
        prevWasEllipsis = true;
      }
      continue;
    }
    if (!seen.has(entry)) {
      seen.add(entry);
      deduped.push(entry);
      prevWasEllipsis = false;
    }
  }
  return deduped;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
