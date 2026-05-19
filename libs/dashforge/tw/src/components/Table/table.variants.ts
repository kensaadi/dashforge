import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Table>` variant recipe.
 *
 * Slots:
 *  - `root`              — outer wrapper
 *  - `toolbar`           — search + filter chips row above table
 *  - `search`            — search input
 *  - `scroll`            — `<div class="overflow-auto">` wrapping the table
 *  - `table`             — `<table>` element
 *  - `thead`             — `<thead>` (sticky positioning here)
 *  - `tbody`             — `<tbody>`
 *  - `headerRow`         — `<tr>` inside `<thead>`
 *  - `headerCell`        — `<th>` cell
 *  - `headerCellButton`  — `<button>` inside sortable `<th>`
 *  - `row`               — `<tr>` inside `<tbody>` (data row)
 *  - `cell`              — `<td>` data cell
 *  - `selectionCell`     — first `<td>` when selection mode active
 *  - `expandToggleCell`  — second `<td>` when expandable active
 *  - `expandedRow`       — full-width `<tr>` rendered after an expanded row
 *  - `rowActionsCell`    — last `<td>` when `rowActions` provided
 *  - `emptyState`        — placeholder when rows is empty
 *  - `loadingOverlay`    — skeleton overlay when loading
 *  - `bulkActionFooter`  — sticky footer with bulk actions
 *
 * Variant axes:
 *  - `variant` — visual row-division style:
 *      - `plain`    — minimal separators
 *      - `lines`    — Stripe-style thin horizontal dividers (default)
 *      - `striped`  — alternating row backgrounds (zebra)
 *      - `bordered` — full cell borders
 *      - `card`     — each row rendered as a separate surface card
 *  - `size`    — `sm` / `md` (default) / `lg`
 *  - `density` — `compact` (40px row) / `comfortable` (default 48px) / `spacious` (56px)
 *
 * Smart-default alignment (per column) is applied by the Table
 * component code, NOT here — it depends on the runtime-detected
 * value type, which the recipe doesn't see.
 *
 * **Dashforge identity rule** (memory: `feedback_dashforge_preset_is_identity`):
 * This recipe uses NO `dark:` variants on the neutral palette. The
 * `dashforgePreset()` CSS-variable swap auto-inverts neutral tokens
 * (`bg-neutral-50` is light surface in light mode, dark surface in
 * dark mode — same class, different physical color). Adding a
 * `dark:` variant on neutral palette = DOUBLE inversion = breaks
 * dark mode. The selected-row state uses the canonical LeftNav
 * `itemActive` pattern (`bg-primary-100 text-primary-900 font-medium`),
 * which works in both modes because the primary palette has no
 * inversion (both `bg` and `text` resolve to the same physical
 * colors regardless of mode → guaranteed contrast).
 */
export const tableVariants = tv({
  slots: {
    root: 'w-full',
    toolbar: 'flex flex-wrap items-center gap-3 mb-3',
    search: [
      'inline-flex items-center gap-2',
      'w-full max-w-sm rounded-md',
      'border border-neutral-300',
      // bg-neutral-50 auto-inverts via CSS var swap (light in light mode,
      // dark in dark mode). Same semantic as TextField wrapper.
      'bg-neutral-50',
      'focus-within:ring-2 focus-within:ring-primary-500',
      'transition-colors motion-reduce:transition-none',
    ],
    scroll: 'relative w-full overflow-auto rounded-md',
    table: 'w-full caption-bottom text-left',
    // thead matches the page surface (auto-inverts). When sticky the
    // header sits opaque against the scroll content beneath it.
    thead: 'bg-neutral-50',
    tbody: '',
    headerRow: '',
    headerCell: [
      // Less prominent than the body — secondary-text intent
      // (auto-inverts: dark grey in light mode, light grey in dark).
      'text-neutral-700',
      'font-semibold whitespace-nowrap select-none',
      'border-b border-neutral-200',
    ],
    headerCellButton: [
      'group inline-flex items-center gap-1 select-none',
      // hover increases prominence (auto-inverts).
      'hover:text-neutral-900',
      'focus:outline-none focus-visible:underline',
      'transition-colors motion-reduce:transition-none',
    ],
    row: [
      'group/row transition-colors motion-reduce:transition-none',
      // bg-neutral-100 = "elevated above surface" in both modes via
      // auto-inversion. Slightly visible against the table bg.
      'hover:bg-neutral-100',
      // Canonical LeftNav `itemActive` pattern — primary palette
      // doesn't invert, so dark-navy text on light-blue bg in BOTH
      // modes. Guaranteed contrast.
      'data-[selected=true]:bg-primary-100',
      'data-[selected=true]:text-primary-900',
      'data-[selected=true]:font-medium',
    ],
    cell: [
      // Auto-inverts — dark text in light mode, light text in dark mode.
      'text-neutral-900',
      'border-b border-neutral-200',
      'align-middle',
    ],
    selectionCell: 'w-10 text-center',
    expandToggleCell: 'w-10 text-center',
    // Expanded panel uses one tier of elevation above the page surface.
    expandedRow: 'bg-neutral-100',
    rowActionsCell: [
      'w-12 text-right',
      // Row actions hidden until row is hovered or focus-within
      // (Pencil & Paper UX pattern: reveal-on-hover reduces visual density).
      'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100',
      'transition-opacity motion-reduce:transition-none',
    ],
    emptyState: [
      'py-12 text-center text-neutral-500',
    ],
    loadingOverlay: [
      'pointer-events-none',
    ],
    bulkActionFooter: [
      'sticky bottom-0 z-20',
      'flex flex-wrap items-center justify-between gap-3',
      'px-3 py-2 mt-0',
      'border-t border-neutral-200',
      // Surface-elevated bg + shadow ladder.
      'bg-neutral-50 shadow-md',
    ],
  },
  variants: {
    variant: {
      plain: {},
      lines: {
        // Default — Stripe-style 1px horizontal dividers (already
        // applied via `border-b` on row + cell). No extra style here.
      },
      striped: {
        // bg-neutral-100/60 = subtle elevation tier (auto-inverts).
        row: 'odd:bg-neutral-100/60',
      },
      bordered: {
        table: 'border border-neutral-200',
        cell: 'border-r last:border-r-0 border-neutral-200',
        headerCell: 'border-r last:border-r-0 border-neutral-200',
      },
      card: {
        scroll: 'overflow-visible',
        table: 'border-separate border-spacing-y-2',
        row: [
          'rounded-lg shadow-sm',
          // Each row becomes an elevated card above the surface.
          'bg-neutral-50',
        ],
        cell: 'border-b-0 first:rounded-l-lg last:rounded-r-lg',
        headerCell: 'border-b-0',
      },
    },
    size: {
      sm: {
        headerCell: 'text-xs',
        cell: 'text-xs',
        search: 'text-xs',
      },
      md: {
        headerCell: 'text-sm',
        cell: 'text-sm',
        search: 'text-sm',
      },
      lg: {
        headerCell: 'text-base',
        cell: 'text-base',
        search: 'text-base',
      },
    },
    density: {
      // Pencil & Paper UX research: 40px / 48px / 56px row height.
      compact: {
        headerCell: 'px-2 py-1',
        cell: 'px-2 py-1',
      },
      comfortable: {
        headerCell: 'px-3 py-2',
        cell: 'px-3 py-2',
      },
      spacious: {
        headerCell: 'px-4 py-3',
        cell: 'px-4 py-3',
      },
    },
    stickyHeader: {
      true: {
        thead: 'sticky top-0 z-10',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'lines',
    size: 'md',
    density: 'comfortable',
    stickyHeader: true,
  },
});

export type TableVariants = VariantProps<typeof tableVariants>;
