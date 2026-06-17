import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Pagination>` variant recipe.
 *
 * Slots:
 *  - `root`             — outer `<nav>` container
 *  - `summary`          — "Showing X-Y of Z" text
 *  - `list`             — `<ul>` of page buttons
 *  - `pageButton`       — individual page number button
 *  - `activeButton`     — modifier applied to the current page
 *  - `navButton`        — first/prev/next/last buttons
 *  - `ellipsis`         — `…` rendered when range gap
 *  - `pageSizeSelector` — native `<select>` for page size
 *  - `jumpInput`        — direct page jump `<input>`
 *
 * Variant axes:
 *  - `variant` — `default` (full kit) | `compact` (number buttons +
 *    prev/next only) | `minimal` ("X / Y pages" + prev/next only).
 *  - `size` — `sm` | `md` (default) | `lg`. Drives padding + text
 *    size on the buttons.
 */
export const paginationVariants = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-3',
    // All neutral classes auto-invert via the dashforgePreset() CSS-var
    // swap. `bg-neutral-50` provides the button surface (matches page
    // surface; the border gives the separation). `hover:bg-neutral-100`
    // is the one-tier elevation that works in both modes.
    summary: 'text-neutral-600',
    list: 'inline-flex items-center gap-1 list-none pl-0 m-0',
    pageButton: [
      'inline-flex items-center justify-center rounded-md',
      'border border-neutral-300',
      'bg-neutral-50',
      'text-neutral-700',
      'hover:bg-neutral-100',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      'transition-colors motion-reduce:transition-none',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    ],
    activeButton: [
      // Primary palette does NOT auto-invert — `dark:` shift is a
      // design choice for tone refinement (kept).
      'bg-primary-500 text-white border-primary-500',
      'hover:bg-primary-600 dark:hover:bg-primary-400',
    ],
    navButton: [
      'inline-flex items-center justify-center rounded-md',
      'border border-neutral-300',
      'bg-neutral-50',
      'text-neutral-700',
      'hover:bg-neutral-100',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      'transition-colors motion-reduce:transition-none',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    ],
    ellipsis: 'inline-flex items-center justify-center text-neutral-500 px-1',
    pageSizeSelector: [
      'inline-flex items-center gap-2',
      'text-neutral-700',
    ],
    jumpInput: [
      'rounded-md border border-neutral-300',
      'bg-neutral-50',
      'text-neutral-900',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      'transition-colors motion-reduce:transition-none',
    ],
  },
  variants: {
    // Note: variant-driven visibility is enforced via conditional JSX
    // rendering (in `Pagination.tsx`), NOT via `hidden` Tailwind class.
    // Reason: `display: none` keeps the elements in the DOM (and in the
    // a11y tree depending on how it's applied), which leaks into
    // testing-library `queryByText` and feels semantically wrong for
    // "this UI piece doesn't exist in this variant". So compact and
    // minimal slots stay empty here.
    variant: {
      default: {},
      compact: {},
      minimal: {},
    },
    size: {
      sm: {
        summary: 'text-xs',
        pageButton: 'h-7 min-w-7 px-2 text-xs',
        navButton: 'h-7 min-w-7 px-2 text-xs',
        ellipsis: 'h-7 min-w-5 text-xs',
        pageSizeSelector: 'text-xs',
        jumpInput: 'h-7 px-2 text-xs w-14',
      },
      md: {
        summary: 'text-sm',
        pageButton: 'h-9 min-w-9 px-3 text-sm',
        navButton: 'h-9 min-w-9 px-3 text-sm',
        ellipsis: 'h-9 min-w-6 text-sm',
        pageSizeSelector: 'text-sm',
        jumpInput: 'h-9 px-2 text-sm w-16',
      },
      lg: {
        summary: 'text-base',
        pageButton: 'h-10 min-w-10 px-4 text-base',
        navButton: 'h-10 min-w-10 px-4 text-base',
        ellipsis: 'h-10 min-w-7 text-base',
        pageSizeSelector: 'text-base',
        jumpInput: 'h-10 px-3 text-base w-20',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type PaginationVariants = VariantProps<typeof paginationVariants>;
