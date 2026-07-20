import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Drawer>` variant recipe — edge-anchored sliding panel.
 *
 * Slots:
 *   - `overlay`      — backdrop (rendered only when `variant='temporary'`)
 *   - `content`      — the drawer panel itself (positioned + sized)
 *   - `header`       — top region holding title + close button
 *   - `title`        — the accessible heading
 *   - `closeButton`  — the `×` button (top-right of header)
 *   - `body`         — main scrollable content region
 *   - `footer`       — bottom action bar (rendered when `footer` prop is set)
 *   - `resizeHandle` — drag handle on the free edge (rendered when `resize=true`)
 *
 * Axes:
 *   - `position`  — which viewport edge the drawer anchors to. Drives the
 *                   translate direction on open/close + which side gets a
 *                   border.
 *   - `size`      — bounded-axis preset (width for left/right, height for
 *                   top/bottom). Applied programmatically in `Drawer.tsx`
 *                   because the same size name maps to a different axis
 *                   depending on `position`.
 *   - `variant`   — `'temporary'` (modal, backdrop, focus trap, scroll
 *                   lock) or `'persistent'` (non-modal, no backdrop,
 *                   coexists with the surrounding content).
 *
 * Motion is gated by `prefers-reduced-motion`: slide animations collapse
 * to instantaneous appear/disappear for users who opt out.
 */
export const drawerVariants = tv({
  slots: {
    overlay: [
      // Elevated over common host-app top-bars (MUI AppBar defaults to
      // z-1300; Chakra AppShell uses ~1000). z-[1400] sits above them
      // without touching the reserved "topmost" (~9999) tier for host
      // error overlays / dev tools. Matches Chakra Drawer's own default.
      'fixed inset-0 z-[1400] bg-neutral-950/60 backdrop-blur-sm',
      // Fade the backdrop in/out via a pure CSS keyframe (defined in
      // Drawer.tsx's module-level style injection).
      'data-[state=open]:animate-[df-drawer-fade-in_300ms_ease-out]',
      'data-[state=closed]:animate-[df-drawer-fade-out_200ms_ease-in]',
      'motion-reduce:animate-none',
    ],
    content: [
      // Same z-tier as the overlay (see note above) plus 10 so the
      // drawer panel stacks above its own backdrop reliably.
      'fixed z-[1410] flex flex-col',
      // bg-white hardcoded (doesn't auto-invert) so `dark:` is needed.
      // Same pattern as Dialog for cross-primitive consistency.
      'bg-white dark:bg-neutral-100 shadow-xl',
      // border-neutral-200 auto-inverts via CSS var swap.
      'border-neutral-200',
      'focus:outline-none',
      // Hint the browser to composite the sliding drawer on the GPU —
      // avoids paint flashes on lower-end devices during the slide.
      'will-change-transform',
      'motion-reduce:animate-none motion-reduce:transform-none',
    ],
    header: [
      'flex items-center justify-between shrink-0',
      'border-b border-neutral-200 px-4 py-3',
    ],
    // `m-0` explicit — Radix's `Dialog.Title` renders an `<h2>` (or the
    // asChild target). Typography's own recipe now emits `m-0` (fixed in
    // #131) but this slot is styled directly on Radix's h2, NOT via
    // <Typography>, so the UA-margin reset must live here too — belt-
    // and-suspenders that survives if Radix ever changes the rendered
    // element or a consumer disables Tailwind preflight.
    title: 'text-base font-semibold leading-tight text-neutral-900 m-0',
    closeButton: [
      'inline-flex items-center justify-center h-8 w-8 shrink-0',
      // Distinct bordered button — the × is a canonical dismiss
      // affordance, and a subtle border makes it clearly tappable at
      // a glance (screenshot-matched per user feedback). Uses the
      // catalog's neutral surface tokens so it auto-inverts in dark
      // mode without a `dark:` variant.
      'rounded-md border border-neutral-200',
      'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
      'transition-colors motion-reduce:transition-none',
    ],
    body: 'flex-1 min-h-0 overflow-y-auto p-4',
    footer: [
      'shrink-0 border-t border-neutral-200 px-4 py-3',
      'flex items-center justify-end gap-2',
    ],
    resizeHandle: [
      'absolute select-none touch-none',
      // Handle is a thin bar; hover/focus tint via primary-500 alpha.
      // The visible bar is `bg-transparent` by default; hovering or
      // keyboard-focusing surfaces the affordance.
      'bg-transparent hover:bg-primary-500/30',
      'focus:outline-none focus-visible:bg-primary-500/50',
      'transition-colors motion-reduce:transition-none',
    ],
  },
  variants: {
    position: {
      // The per-position slide keyframes are defined in Drawer.tsx's
      // module-level style injection (`df-drawer-slide-{in,out}-{side}`).
      // 300ms open with `ease-out` gives the "curtain opening" feel: the
      // drawer glides in from the anchored edge and decelerates as it
      // lands. Close is faster (200ms, `ease-in`) so the user isn't
      // waiting on the dismissal.
      right: {
        content: [
          'right-0 top-0 h-full border-l',
          'data-[state=open]:animate-[df-drawer-slide-in-right_300ms_ease-out]',
          'data-[state=closed]:animate-[df-drawer-slide-out-right_200ms_ease-in]',
        ],
        resizeHandle: 'left-0 top-0 h-full w-1.5 cursor-ew-resize',
      },
      left: {
        content: [
          'left-0 top-0 h-full border-r',
          'data-[state=open]:animate-[df-drawer-slide-in-left_300ms_ease-out]',
          'data-[state=closed]:animate-[df-drawer-slide-out-left_200ms_ease-in]',
        ],
        resizeHandle: 'right-0 top-0 h-full w-1.5 cursor-ew-resize',
      },
      top: {
        content: [
          'top-0 left-0 w-full border-b',
          'data-[state=open]:animate-[df-drawer-slide-in-top_300ms_ease-out]',
          'data-[state=closed]:animate-[df-drawer-slide-out-top_200ms_ease-in]',
        ],
        resizeHandle: 'bottom-0 left-0 w-full h-1.5 cursor-ns-resize',
      },
      bottom: {
        content: [
          'bottom-0 left-0 w-full border-t',
          'data-[state=open]:animate-[df-drawer-slide-in-bottom_300ms_ease-out]',
          'data-[state=closed]:animate-[df-drawer-slide-out-bottom_200ms_ease-in]',
        ],
        resizeHandle: 'top-0 left-0 w-full h-1.5 cursor-ns-resize',
      },
    },
    variant: {
      temporary: {},
      persistent: {
        // Persistent drawers coexist with page content — no backdrop, no
        // scroll lock, and the content itself is still fully interactive
        // (Radix's `modal={false}` handles the pointer-events).
      },
      sticky: {
        // Same visual as persistent (no backdrop, non-modal), but the
        // component logic in `Drawer.tsx` force-enables
        // `disableBackdropClose` + `disableEscapeClose` so the drawer
        // stays open until the consumer or the close button say
        // otherwise. No slot delta needed here.
      },
    },
    // Size is an *axis label*; the concrete width/height class is applied
    // programmatically in Drawer.tsx via SIZE_PRESETS below because the
    // same `md` maps to `w-80` for left/right but `h-72` for top/bottom.
    size: {
      sm: {},
      md: {},
      lg: {},
      full: {},
    },
  },
  defaultVariants: {
    position: 'right',
    variant: 'temporary',
    size: 'md',
  },
});

export type DrawerVariants = VariantProps<typeof drawerVariants>;

/**
 * Size presets. Each entry maps a size name to a Tailwind class for
 * both the horizontal axis (used by left/right drawers → width) and the
 * vertical axis (used by top/bottom drawers → height).
 *
 * `full` uses `w-screen` / `h-screen` for a full-viewport drawer — the
 * mobile-fullscreen pattern.
 *
 * Values in px (approximate):
 *   sm  → 256 (w-64)   / 192 (h-48)
 *   md  → 320 (w-80)   / 288 (h-72)
 *   lg  → 384 (w-96)   / 384 (h-96)
 *   full → 100vw       / 100vh
 */
export const DRAWER_SIZE_PRESETS: Record<
  NonNullable<DrawerVariants['size']>,
  { x: string; y: string; xPx: number; yPx: number }
> = {
  sm: { x: 'w-64', y: 'h-48', xPx: 256, yPx: 192 },
  md: { x: 'w-80', y: 'h-72', xPx: 320, yPx: 288 },
  lg: { x: 'w-96', y: 'h-96', xPx: 384, yPx: 384 },
  full: { x: 'w-screen', y: 'h-screen', xPx: -1, yPx: -1 },
};

/**
 * Whether a position places the drawer on a horizontal edge (left/right),
 * in which case the bounded axis is width — versus a vertical edge
 * (top/bottom), where the bounded axis is height. Used everywhere the
 * component needs to decide whether to work with `w-*` classes and `x`
 * axis coordinates, or `h-*` and `y`.
 */
export function isHorizontalDrawer(
  position: NonNullable<DrawerVariants['position']>,
): boolean {
  return position === 'left' || position === 'right';
}
