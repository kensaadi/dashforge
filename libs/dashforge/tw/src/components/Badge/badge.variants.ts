import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Badge>`.
 *
 * Slot layout:
 *   - `root`  — outer span (relative-positioned wrapper around the
 *               anchor). `inline-flex` so the wrapper shrinks to fit
 *               the anchor element.
 *   - `badge` — the floating absolute-positioned pill / dot. Two
 *               variants (`dot=true` → tiny circle, `dot=false` →
 *               pill with min-width to fit content).
 *
 * Color axis emits the `badge` background + text classes. The 7
 * intents map to:
 *   - solid bg: `bg-{intent}-500` (vivid, attention-grabbing for
 *     notifications — different from Chip which uses 600 for solid
 *     because chip surface is larger; small badge needs the brighter
 *     mid-tone)
 *   - text: `text-white` for primary/secondary/success/warning/danger/
 *     info; `text-neutral-50` for neutral (auto-inverts via CSS-var
 *     swap, no `dark:` needed)
 *
 * Placement axis emits absolute-position + translate utilities:
 *   - top-right (default): `top-0 right-0 -translate-y-1/2 translate-x-1/2`
 *   - top-left:    `top-0 left-0 -translate-y-1/2 -translate-x-1/2`
 *   - bottom-right: `bottom-0 right-0 translate-y-1/2 translate-x-1/2`
 *   - bottom-left:  `bottom-0 left-0 translate-y-1/2 -translate-x-1/2`
 *
 * Overlap axis adds an extra inset for circular anchors so the
 * badge sits along the round edge instead of the bounding box corner.
 */
export const badgeVariants = tv({
  slots: {
    root: 'relative inline-flex shrink-0',
    badge: [
      // Absolute positioning is owned by the placement compound rules.
      'absolute z-10',
      // Layout / typography — pill defaults; dot mode overrides
      // dimensions below.
      'inline-flex items-center justify-center',
      'rounded-full',
      'text-[10px] font-medium leading-none',
      'pointer-events-none select-none',
      // Smooth show/hide for `invisible` toggle (consumer-side
      // animation hook). Gated on motion-reduce per WCAG 2.3.3.
      'transition-transform duration-150 motion-reduce:transition-none motion-reduce:duration-0',
    ],
  },
  variants: {
    /**
     * `dot=true` → tiny circle (8px), no content. The badge slot
     * collapses to a fixed-size circle without the pill min-width.
     */
    dot: {
      true: {
        badge: 'w-2 h-2 p-0',
      },
      false: {
        // Content pill — 16px tall, padded inline, min-width so
        // single-digit counts still read centered.
        badge: 'min-w-4 h-4 px-1',
      },
    },
    /** Whether the floating badge is hidden via `display: none`. */
    invisible: {
      true: {
        badge: 'hidden',
      },
    },
    /** Halo ring for visual separation from the anchor surface. */
    withRing: {
      true: {
        // ring-neutral-50 auto-inverts via dashforgePreset CSS var
        // swap (no `dark:` needed for the neutral palette).
        badge: 'ring-2 ring-neutral-50',
      },
    },
    /** 7 intents — drives the badge background + text colour. */
    color: {
      neutral: {
        // Both classes on the neutral palette — auto-invert via CSS
        // var swap. No `dark:` variants needed.
        badge: 'bg-neutral-700 text-neutral-50',
      },
      primary: { badge: 'bg-primary-500 text-white' },
      secondary: { badge: 'bg-secondary-500 text-white' },
      success: { badge: 'bg-success-500 text-white' },
      warning: { badge: 'bg-warning-500 text-white' },
      danger: { badge: 'bg-danger-500 text-white' },
      info: { badge: 'bg-info-500 text-white' },
    },
    placement: {
      'top-right': {
        badge: 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
      },
      'top-left': {
        badge: 'top-0 left-0 -translate-y-1/2 -translate-x-1/2',
      },
      'bottom-right': {
        badge: 'bottom-0 right-0 translate-y-1/2 translate-x-1/2',
      },
      'bottom-left': {
        badge: 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2',
      },
    },
    /**
     * `overlap='circular'` adds an inward inset so the badge sits
     * along the circular anchor edge instead of the bounding-box
     * corner. The 14% offset is empirically tuned to match the
     * standard avatar / round-button geometry (matches MUI's value).
     */
    overlap: {
      rectangular: {},
      circular: {},
    },
  },
  compoundVariants: [
    // ─── overlap='circular' × placement — additional inset ─────────
    // The inward shift is in addition to the placement translate,
    // achieved via an extra `-{translate-corner}` adjustment.
    {
      overlap: 'circular',
      placement: 'top-right',
      class: {
        badge: 'top-[14%] right-[14%] translate-x-1/2 -translate-y-1/2',
      },
    },
    {
      overlap: 'circular',
      placement: 'top-left',
      class: {
        badge: 'top-[14%] left-[14%] -translate-x-1/2 -translate-y-1/2',
      },
    },
    {
      overlap: 'circular',
      placement: 'bottom-right',
      class: {
        badge: 'bottom-[14%] right-[14%] translate-x-1/2 translate-y-1/2',
      },
    },
    {
      overlap: 'circular',
      placement: 'bottom-left',
      class: {
        badge: 'bottom-[14%] left-[14%] -translate-x-1/2 translate-y-1/2',
      },
    },
  ],
  defaultVariants: {
    dot: false,
    invisible: false,
    withRing: true,
    color: 'danger',
    placement: 'top-right',
    overlap: 'rectangular',
  },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;
