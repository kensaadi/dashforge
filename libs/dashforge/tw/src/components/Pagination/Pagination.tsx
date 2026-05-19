import { useState, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import { cn } from '../../utils/cn.js';
import { paginationVariants } from './pagination.variants.js';
import { computePageRange } from './pagination.helpers.js';
import type { PaginationProps, PaginationLabels } from './pagination.types.js';

const DEFAULT_LABELS: Required<PaginationLabels> = {
  first: 'First',
  prev: 'Previous',
  next: 'Next',
  last: 'Last',
  page: 'Page',
  of: 'of',
  showing: 'Showing',
  perPage: 'per page',
  goToPage: 'Go to page',
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Dashforge TW `<Pagination>` — controlled pagination primitive.
 *
 * Three variants:
 *  - `default`  — page-size selector + summary + page numbers + nav buttons + jump input
 *  - `compact`  — page numbers + nav buttons only (no summary, no selector, no jump)
 *  - `minimal`  — "Page X of Y" + prev/next only
 *
 * Always controlled (no internal state besides the jump-input draft).
 *
 * A11Y:
 *  - `<nav aria-label="Pagination">` root
 *  - `aria-current="page"` on the active page button
 *  - `aria-label` on every interactive element
 *
 * @example
 * ```tsx
 * const [page, setPage] = useState(1);
 * const [pageSize, setPageSize] = useState(20);
 *
 * <Pagination
 *   page={page}
 *   pageSize={pageSize}
 *   totalCount={1437}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function Pagination(props: PaginationProps) {
  const {
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = true,
    showJumpInput = true,
    disabled = false,
    labels: labelsProp,
    variant = 'default',
    size = 'md',
    sx,
    slotProps,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const v = paginationVariants({ variant, size });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pages = computePageRange(safePage, totalPages, siblingCount, boundaryCount);

  // Summary range
  const firstItem = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalCount);

  // Jump input local state (commit on Enter or blur)
  const [jumpDraft, setJumpDraft] = useState('');

  const goTo = useCallback(
    (nextPage: number) => {
      if (disabled) return;
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      if (clamped !== safePage) onPageChange(clamped);
    },
    [disabled, totalPages, safePage, onPageChange],
  );

  const commitJump = useCallback(() => {
    const parsed = Number(jumpDraft);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setJumpDraft('');
      return;
    }
    goTo(Math.floor(parsed));
    setJumpDraft('');
  }, [jumpDraft, goTo]);

  const onJumpKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitJump();
      }
    },
    [commitJump],
  );

  const handlePageSize = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (!onPageSizeChange) return;
      const next = Number(e.target.value);
      if (Number.isFinite(next) && next > 0) onPageSizeChange(next);
    },
    [onPageSizeChange],
  );

  const isMinimal = variant === 'minimal';

  return (
    <nav
      aria-label="Pagination"
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      {/* Summary — only in `default` variant. `compact` skips it entirely.
          `minimal` renders a different "Page X of Y" summary below. */}
      {variant === 'default' && (
        <span className={cn(v.summary(), slotProps?.summary?.className)}>
          {labels.showing} {firstItem}-{lastItem} {labels.of} {totalCount}
        </span>
      )}

      {/* Minimal-mode summary (text-only "Page X of Y") */}
      {isMinimal && (
        <span className={cn(v.summary(), 'text-sm', slotProps?.summary?.className)}>
          {labels.page} {safePage} {labels.of} {totalPages}
        </span>
      )}

      {/* Nav buttons + page list */}
      <ul className={cn(v.list(), slotProps?.list?.className)}>
        {showFirstLast && !isMinimal && (
          <li>
            <button
              type="button"
              aria-label={labels.first}
              disabled={disabled || safePage === 1}
              onClick={() => goTo(1)}
              className={cn(v.navButton(), slotProps?.navButton?.className)}
            >
              «
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            aria-label={labels.prev}
            disabled={disabled || safePage === 1}
            onClick={() => goTo(safePage - 1)}
            className={cn(v.navButton(), slotProps?.navButton?.className)}
          >
            ‹
          </button>
        </li>
        {/* Page-number buttons hidden in minimal mode */}
        {!isMinimal &&
          pages.map((entry, idx) =>
            entry === 'ellipsis' ? (
              <li key={`e-${idx}`}>
                <span
                  aria-hidden="true"
                  className={cn(v.ellipsis(), slotProps?.ellipsis?.className)}
                >
                  …
                </span>
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  aria-label={`${labels.page} ${entry}`}
                  aria-current={entry === safePage ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => goTo(entry)}
                  className={cn(
                    v.pageButton(),
                    entry === safePage && v.activeButton(),
                    slotProps?.pageButton?.className,
                    entry === safePage && slotProps?.activeButton?.className,
                  )}
                >
                  {entry}
                </button>
              </li>
            ),
          )}
        <li>
          <button
            type="button"
            aria-label={labels.next}
            disabled={disabled || safePage === totalPages}
            onClick={() => goTo(safePage + 1)}
            className={cn(v.navButton(), slotProps?.navButton?.className)}
          >
            ›
          </button>
        </li>
        {showFirstLast && !isMinimal && (
          <li>
            <button
              type="button"
              aria-label={labels.last}
              disabled={disabled || safePage === totalPages}
              onClick={() => goTo(totalPages)}
              className={cn(v.navButton(), slotProps?.navButton?.className)}
            >
              »
            </button>
          </li>
        )}
      </ul>

      {/* Page-size selector + jump input — only in default variant */}
      {variant === 'default' && onPageSizeChange && (
        <label
          className={cn(v.pageSizeSelector(), slotProps?.pageSizeSelector?.className)}
        >
          <span className="sr-only">{labels.perPage}</span>
          <select
            value={pageSize}
            onChange={handlePageSize}
            disabled={disabled}
            aria-label={labels.perPage}
            className={cn(
              // Auto-invert via CSS-var swap — no `dark:` variants needed
              // on neutral palette.
              'rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>{labels.perPage}</span>
        </label>
      )}

      {variant === 'default' && showJumpInput && (
        <label className="inline-flex items-center gap-2">
          <span className="sr-only">{labels.goToPage}</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpDraft}
            placeholder={labels.goToPage}
            disabled={disabled}
            onChange={(e) => setJumpDraft(e.target.value)}
            onKeyDown={onJumpKeyDown}
            onBlur={commitJump}
            aria-label={labels.goToPage}
            className={cn(v.jumpInput(), slotProps?.jumpInput?.className)}
          />
        </label>
      )}
    </nav>
  );
}
