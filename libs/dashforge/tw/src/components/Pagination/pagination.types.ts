import type { PaginationVariants } from './pagination.variants.js';

/**
 * Subset of `<Pagination>` props theme-configurable via
 * `theme.components.Pagination.defaults` (Option C).
 */
export type PaginationVariantProps = Pick<PaginationVariants, 'variant' | 'size'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Pagination?: {
      defaults?: Partial<PaginationVariantProps>;
    };
  }
}

export interface PaginationSlotProps {
  root?: { className?: string };
  summary?: { className?: string };
  list?: { className?: string };
  pageButton?: { className?: string };
  activeButton?: { className?: string };
  navButton?: { className?: string };
  ellipsis?: { className?: string };
  pageSizeSelector?: { className?: string };
  jumpInput?: { className?: string };
}

/**
 * I18n strings for `<Pagination>`. Default = English. Override the
 * subset you need to translate; the rest fall back to defaults.
 */
export interface PaginationLabels {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
  page?: string;
  of?: string;
  showing?: string;
  perPage?: string;
  goToPage?: string;
}

/**
 * Props for `<Pagination>`.
 *
 * Controlled component: the consumer owns `page` + `pageSize`. The
 * component emits `onPageChange` / `onPageSizeChange` and recomputes
 * the visible page range from `totalCount`.
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
 *   pageSizeOptions={[10, 20, 50, 100]}
 * />
 * ```
 */
export interface PaginationProps extends Pick<PaginationVariants, 'variant' | 'size'> {
  /** Current page, **1-indexed**. */
  page: number;

  /** Items per page. */
  pageSize: number;

  /** Total items in the underlying data set (NOT total pages — we compute that). */
  totalCount: number;

  /** Fired when the user picks a different page. */
  onPageChange: (page: number) => void;

  /**
   * Fired when the user picks a different page size. Omit (or pass
   * undefined) to hide the page-size selector.
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Options shown in the page-size selector.
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];

  /**
   * How many page buttons to show on each side of the current page.
   * @default 1
   */
  siblingCount?: number;

  /**
   * How many page buttons to always show at the start/end of the
   * sequence (acts as "boundary"). @default 1
   */
  boundaryCount?: number;

  /**
   * Show first/last buttons (`«` / `»`). @default true
   */
  showFirstLast?: boolean;

  /**
   * Show the direct page-jump input (variant=`default` only).
   * @default true
   */
  showJumpInput?: boolean;

  /**
   * Disable all interactive elements (kept rendered but inert).
   */
  disabled?: boolean;

  /**
   * I18n strings. Defaults are English; pass the subset you need
   * to translate.
   */
  labels?: PaginationLabels;

  /** Root-level Tailwind override. */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: PaginationSlotProps;
}
