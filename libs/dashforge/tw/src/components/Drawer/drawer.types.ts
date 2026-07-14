import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { DrawerVariants } from './drawer.variants.js';

/**
 * Subset of `<Drawer>` props theme-configurable via
 * `theme.components.Drawer.defaults` (Option C).
 *
 * Only *visual identity* axes go here — behavioral state (`open`,
 * `resize`, `disableEscapeClose`, etc.) stays per-instance. A theme
 * saying "all drawers default to `position='right'` + `size='md'` +
 * `variant='temporary'` + close button visible" is the identity
 * decision a DS designer would pin globally; a theme saying "all
 * drawers default to `open={true}`" would be nonsensical.
 */
export interface DrawerVariantProps {
  position?: DrawerVariants['position'];
  size?: DrawerVariants['size'];
  variant?: DrawerVariants['variant'];
  showCloseButton?: boolean;
}

/**
 * Per-slot className override map. Consumed via
 * `theme.components.Drawer.slotProps` (application-wide) and instance
 * `slotProps` (per-render).
 */
export interface DrawerSlotProps {
  overlay?: { className?: string };
  content?: { className?: string };
  header?: { className?: string };
  title?: { className?: string };
  closeButton?: { className?: string };
  body?: { className?: string };
  footer?: { className?: string };
  resizeHandle?: { className?: string };
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Drawer?: {
      defaults?: Partial<DrawerVariantProps>;
      slotProps?: DrawerSlotProps;
    };
  }
}

/**
 * Props for `<Drawer>` — edge-anchored sliding panel.
 *
 * Distinct from `<Dialog>` (viewport-centered), `<Popover>` (attached to
 * a trigger), and `<Menu>` (contextual list): Drawer anchors to a
 * viewport edge and spans the full length of that edge. Typical uses:
 * side inspector (right), navigation drawer (left mobile), tool drawer
 * (left/right desktop), bottom sheet (bottom mobile), notification tray
 * (top).
 *
 * Built on `@radix-ui/react-dialog` for the modal `temporary` variant
 * (focus trap, scroll lock, Esc, `aria-modal`) and on
 * `<RadixDialog.Root modal={false}>` for `persistent` (non-modal,
 * coexists with page content).
 *
 * Bridge integration: **none** — Drawer is not a form field. `visibleWhen`
 * and `access` follow the catalog convention (reactive predicate +
 * RBAC gate).
 *
 * @example Right-side inspector
 * ```tsx
 * <Drawer
 *   open={inspectorOpen}
 *   onOpenChange={setInspectorOpen}
 *   position="right"
 *   variant="persistent"
 *   title="Properties"
 *   resize
 *   resizeKey="blueprintInspector"
 * >
 *   <InspectorPanel />
 * </Drawer>
 * ```
 *
 * @example Mobile bottom sheet
 * ```tsx
 * <Drawer
 *   open={sheetOpen}
 *   onOpenChange={setSheetOpen}
 *   position="bottom"
 *   size="lg"
 *   title="Filters"
 *   footer={<Button onClick={applyFilters}>Apply</Button>}
 * >
 *   <FilterList />
 * </Drawer>
 * ```
 */
export interface DrawerProps {
  // ─── Controlled interface ────────────────────────────────────────────
  /** Controlled open state. */
  open: boolean;
  /**
   * Fires when the drawer requests to change open state — Esc,
   * backdrop click, close button, or `Radix.Root.onOpenChange`. Mirror
   * of `<Dialog onOpenChange>`. No `reason` parameter — consumers that
   * need to differentiate escape-vs-backdrop use `disableEscapeClose` /
   * `disableBackdropClose` explicitly.
   */
  onOpenChange: (open: boolean) => void;

  // ─── Positioning + sizing ────────────────────────────────────────────
  /**
   * Which viewport edge the drawer anchors to. Drives the translate
   * direction on open/close and which border is visible on the panel.
   * @default 'right'
   */
  position?: DrawerVariants['position'];

  /**
   * Bounded-axis preset (width for left/right, height for top/bottom).
   * The `full` variant fills the viewport on the bounded axis.
   * @default 'md'
   */
  size?: DrawerVariants['size'];

  /**
   * Three modes, each with a different dismiss contract:
   *
   *   - `'temporary'` (default) — modal. Backdrop dims the page,
   *     focus is trapped, `<body>` scroll is locked, Esc + backdrop
   *     click close.
   *   - `'persistent'` — non-modal. No backdrop, coexists with page
   *     content, no scroll lock. Esc + click-outside still close
   *     (unless individually disabled).
   *   - `'sticky'` — non-modal, non-dismissible via user gesture.
   *     Same visual as `persistent` but Esc + click-outside are
   *     ignored. The drawer stays open until the consumer closes it
   *     programmatically (via `onOpenChange(false)`) or the user
   *     clicks the `×` close button. Use for inspectors / toolbars
   *     that must remain anchored while the user works elsewhere on
   *     the page.
   *
   * Implemented via Radix's `modal` prop (`temporary` is `modal={true}`;
   * both non-modal modes are `modal={false}`) plus the internal
   * dismiss handlers.
   *
   * @default 'temporary'
   */
  variant?: DrawerVariants['variant'];

  // ─── Content composition ────────────────────────────────────────────
  /** Drawer body — rendered inside the `body` slot. */
  children?: ReactNode;

  /**
   * Optional title — rendered in the `header` slot as
   * `<RadixDialog.Title>`. Typed as `string | ReactNode` for API
   * discoverability (a plain string is the 90% case, ReactNode
   * unlocks full customization: icons + label, chip + title, etc.).
   */
  title?: string | ReactNode;

  /** Optional footer — action bar, rendered under the body. */
  footer?: ReactNode;

  /**
   * Show the `×` close button in the header. Mirror of Dialog's
   * `showCloseButton`.
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Where the `×` close button sits within the header row.
   *
   *   - `'end'` (default) — right side of the header, after the title.
   *     Standard convention across MUI, Chakra, shadcn.
   *   - `'start'` — left side of the header, before the title. Used by
   *     some full-screen mobile drawers (Material Design guideline) and
   *     by iOS-style sheets where the close affordance is at the leading
   *     edge.
   *
   * @default 'end'
   */
  closeButtonPosition?: 'start' | 'end';

  /**
   * Fires when the `×` close button is clicked. The drawer closes
   * unconditionally afterward (via `onOpenChange(false)`) — this is
   * a side-effect hook for logging, analytics, or last-mile cleanup.
   * If you need to BLOCK the close, guard the state upstream in
   * `onOpenChange` instead (the close button doesn't gate it).
   */
  onCloseClick?: () => void;

  /**
   * Custom auto-focus handler fired when the drawer opens. Escape hatch
   * for consumers who need different focus semantics than the default.
   *
   * DEFAULT (when this prop is omitted): the drawer prevents Radix's
   * built-in auto-focus (which lands on the first focusable child = the
   * × close button) and focuses the Content wrapper itself instead.
   * Screen readers still announce the dialog via `aria-labelledby` →
   * title; the visible focus ring simply doesn't stick to any child on
   * open.
   *
   * OVERRIDE this when:
   *   - You want to focus a specific interactive element on open (e.g.
   *     the first form field: `(e) => { e.preventDefault();
   *     firstInputRef.current?.focus() }`).
   *   - You need the Radix default (auto-focus the first tabbable) —
   *     pass `undefined` at call site? No — pass a handler that does
   *     nothing: `() => undefined`. The absence of preventDefault lets
   *     Radix's default fire.
   *   - You're troubleshooting a screen-reader-specific issue (JAWS,
   *     older NVDA versions) that needs a specific focus target.
   *
   * The event receives the underlying `FocusEvent` — call
   * `event.preventDefault()` to suppress Radix's default focus, then
   * do your own focus management.
   */
  onOpenAutoFocus?: (event: Event) => void;

  // ─── Close behavior ──────────────────────────────────────────────────
  /**
   * Disable closing when the user clicks outside the drawer content.
   * Applies to `variant='temporary'` (backdrop click) and
   * `variant='persistent'` (click outside the invisible drawer area) —
   * `variant='sticky'` implicitly defaults this to `true` to keep the
   * drawer open.
   *
   * Explicit values WIN over the sticky default: pass `false` to
   * re-enable click-outside close on a sticky drawer (opt-in escape).
   * @default `false` for `temporary` and `persistent`, `true` for `sticky`
   */
  disableBackdropClose?: boolean;

  /**
   * Disable closing when the user presses Escape.
   *
   * Explicit values WIN over the sticky default: `variant='sticky'`
   * defaults this to `true` so the drawer stays open, but passing
   * `disableEscapeClose={false}` re-enables Esc close on a sticky
   * drawer (opt-in escape hatch).
   * @default `false` for `temporary` and `persistent`, `true` for `sticky`
   */
  disableEscapeClose?: boolean;

  // ─── Resize handle ───────────────────────────────────────────────────
  /**
   * Render a drag handle on the free edge of the drawer that lets the
   * user resize the bounded axis (width for left/right, height for
   * top/bottom).
   * @default false
   */
  resize?: boolean;

  /**
   * `localStorage` key for persisting the resized dimension across
   * sessions. Stored under `df.drawer.<resizeKey>`. When `resize=true`
   * and this is omitted, a one-time dev-warn fires and no persistence
   * is attempted.
   */
  resizeKey?: string;

  /**
   * Minimum size (px) for the bounded axis. Clamps `pointermove` and
   * keyboard-driven resizes.
   * @default 240
   */
  resizeMin?: number;

  /**
   * Maximum size (px) for the bounded axis.
   * @default 800
   */
  resizeMax?: number;

  /**
   * Optional callback that fires on every commit of the resize handle
   * (pointer-up OR keyboard step). Useful for consumers that want to
   * mirror the size into their own store (e.g. a Zustand slice for
   * layout preferences).
   */
  onSizeChange?: (size: number) => void;

  // ─── Reactivity + RBAC (catalog-uniform) ─────────────────────────────
  /**
   * Reactive visibility predicate. Falsy → renders `null`. The
   * predicate can freely mix engine state (via the `engine` argument)
   * and outer-scope local state / context / refs — React's re-render
   * cascade guarantees fresh values on every evaluation.
   *
   * ## Behavior when combined with `open={true}`
   *
   * `visibleWhen` does NOT sync back to `open` state. If the predicate
   * flips to `false` while `open={true}`:
   *   - The drawer unmounts (returns `null`)
   *   - `onOpenChange(false)` is NOT called — your `open` state stays
   *     `true`
   *   - When the predicate flips back to `true`, the drawer remounts
   *     with `open={true}` and reappears — no user gesture needed
   *
   * This is the "reactive UI" pattern: `visibleWhen` decides IF the
   * component participates in the tree; `open` decides its state WHEN
   * it participates. The two axes are orthogonal.
   *
   * If you need the drawer to close (state = false) when it's hidden —
   * for example, to also unmount its side-effects downstream — wire
   * that into `visibleWhen`'s upstream state via a `useEffect` in the
   * consumer, or listen for the flip and call `onOpenChange(false)`
   * yourself.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** RBAC gate — see `useAccessState`. */
  access?: AccessRequirement;

  // ─── Escape hatches ──────────────────────────────────────────────────
  /** Utility-class shortcut merged onto the `content` slot. */
  sx?: string;

  /** Per-slot className overrides. */
  slotProps?: DrawerSlotProps;

  /** `data-testid` on the content wrapper. */
  testId?: string;
}
