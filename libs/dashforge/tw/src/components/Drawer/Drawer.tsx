import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import {
  DRAWER_SIZE_PRESETS,
  drawerVariants,
  isHorizontalDrawer,
} from './drawer.variants.js';
import type { DrawerProps } from './drawer.types.js';

const DEFAULT_RESIZE_MIN = 240;
const DEFAULT_RESIZE_MAX = 800;
const STORAGE_PREFIX = 'df.drawer.';

/**
 * Keyframe injection — module-level side-effect.
 *
 * Drawer uses CSS keyframe animations to slide in from the anchored
 * edge (parte da 0 → cresce fino a max, effetto tenda). Tailwind
 * doesn't ship these built-in and `tailwindcss-animate` isn't a
 * dependency of the dashforgePreset — so we inject the four position
 * pairs (right/left/top/bottom) + backdrop fade directly. Guarded via
 * an ID so re-imports and multiple Drawer instances don't stack the
 * `<style>` tag.
 *
 * The animations use `translate3d` for GPU acceleration; `will-change`
 * on the content class hints the browser to composite. Motion is
 * fully suppressed inside the variants recipe via
 * `motion-reduce:animate-none`, so users with `prefers-reduced-motion`
 * see instantaneous open/close regardless of these keyframes.
 */
function injectDrawerKeyframes(): void {
  if (typeof document === 'undefined') return;
  const id = 'df-drawer-keyframes';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
@keyframes df-drawer-slide-in-right  { from { transform: translate3d(100%, 0, 0); }  to { transform: translate3d(0, 0, 0); } }
@keyframes df-drawer-slide-out-right { from { transform: translate3d(0, 0, 0); }    to { transform: translate3d(100%, 0, 0); } }
@keyframes df-drawer-slide-in-left   { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(0, 0, 0); } }
@keyframes df-drawer-slide-out-left  { from { transform: translate3d(0, 0, 0); }     to { transform: translate3d(-100%, 0, 0); } }
@keyframes df-drawer-slide-in-top    { from { transform: translate3d(0, -100%, 0); } to { transform: translate3d(0, 0, 0); } }
@keyframes df-drawer-slide-out-top   { from { transform: translate3d(0, 0, 0); }     to { transform: translate3d(0, -100%, 0); } }
@keyframes df-drawer-slide-in-bottom { from { transform: translate3d(0, 100%, 0); }  to { transform: translate3d(0, 0, 0); } }
@keyframes df-drawer-slide-out-bottom{ from { transform: translate3d(0, 0, 0); }     to { transform: translate3d(0, 100%, 0); } }
@keyframes df-drawer-fade-in         { from { opacity: 0; } to { opacity: 1; } }
@keyframes df-drawer-fade-out        { from { opacity: 1; } to { opacity: 0; } }
`;
  document.head.appendChild(style);
}

// Inject at module load — idempotent via ID guard.
injectDrawerKeyframes();

/**
 * Inline `×` icon — shared between the two close-button render sites
 * (position="start" and position="end"). Extracted so the two branches
 * stay in visual sync without duplicating the SVG markup.
 */
function CloseIconSvg() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/**
 * Clamp a numeric value to `[min, max]`. Non-finite inputs return `min`.
 */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * `<Drawer>` — edge-anchored sliding panel primitive (Sprint 6 SHIP #4).
 *
 * Distinct from Dialog / Popover / Menu: anchors to one of the four
 * viewport edges and spans the full length of that edge. Three variants:
 *   - `temporary` (default) — modal with backdrop, focus trap, scroll lock,
 *     Esc + backdrop close.
 *   - `persistent` — non-modal, coexists with page content, no backdrop;
 *     Esc + click-outside still close (unless individually disabled).
 *   - `sticky` — non-modal, non-dismissible via user gesture. Same visual
 *     as `persistent` but Esc + click-outside are ignored. Only the close
 *     button and programmatic `onOpenChange(false)` close it.
 *
 * See {@link DrawerProps} for the full API surface.
 */
export function Drawer(props: DrawerProps) {
  const themeDefaults = useComponentDefaults('Drawer');
  const merged: DrawerProps = { ...themeDefaults?.defaults, ...props };
  // Theme-level slotProps (Option C Track B). Instance `slotProps` wins
  // per-slot via the `cn()` order below — theme classes come first,
  // instance classes second, so `tailwind-merge` picks the instance
  // where they collide.
  const themeSlotProps = themeDefaults?.slotProps;

  const {
    open,
    onOpenChange,
    position = 'right',
    size = 'md',
    variant = 'temporary',
    children,
    title,
    footer,
    showCloseButton = true,
    closeButtonPosition = 'end',
    onCloseClick,
    onOpenAutoFocus,
    // No literal defaults here — the effective values below apply the
    // sticky-variant defaults ONLY when the consumer hasn't explicitly
    // set a value. `disableEscapeClose={false}` on a sticky drawer
    // therefore re-enables Esc close (opt-in), while `disableEscapeClose`
    // omitted keeps the sticky default of "Esc ignored".
    disableBackdropClose,
    disableEscapeClose,
    resize = false,
    resizeKey,
    resizeMin = DEFAULT_RESIZE_MIN,
    resizeMax = DEFAULT_RESIZE_MAX,
    onSizeChange,
    visibleWhen,
    access,
    sx,
    slotProps,
    testId,
  } = merged;

  // Sticky mode = persistent chrome + NON-dismissible defaults. The
  // consumer's explicit `disableBackdropClose` / `disableEscapeClose`
  // WIN (via `??`) so `variant="sticky" disableEscapeClose={false}`
  // re-enables Esc close — an opt-in escape hatch. When omitted, sticky
  // defaults both flags to `true` so the drawer stays open.
  //
  // Non-sticky variants keep the historical default of `false` (Esc +
  // backdrop close both wired) when the flags are omitted.
  const isSticky = variant === 'sticky';
  const effectiveDisableBackdropClose =
    disableBackdropClose ?? isSticky;
  const effectiveDisableEscapeClose =
    disableEscapeClose ?? isSticky;
  // Only `temporary` runs modal (focus trap + scroll lock + backdrop).
  // Both `persistent` and `sticky` are non-modal.
  const isModal = variant === 'temporary';

  // Bridge — visibility + RBAC. Both hooks called unconditionally
  // (rules-of-hooks) BEFORE any early return.
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  const isHorizontal = isHorizontalDrawer(position);
  const preset = DRAWER_SIZE_PRESETS[size];
  const sizeClass = isHorizontal ? preset.x : preset.y;
  const initialFallback = isHorizontal ? preset.xPx : preset.yPx;

  // Resize state — null means "use the preset class from TV". A concrete
  // number takes over via inline style (px) once the user has resized
  // OR once the persisted value is read from localStorage.
  const [resizedSize, setResizedSize] = useState<number | null>(null);

  // Dev-warn once per mount when resize is enabled but no key is provided.
  const hasWarnedRef = useRef(false);
  useEffect(() => {
    if (!resize) return;
    if (resizeKey) return;
    if (hasWarnedRef.current) return;
    if (process.env.NODE_ENV === 'production') return;
    hasWarnedRef.current = true;
    // eslint-disable-next-line no-console -- dev-only, guarded above.
    console.warn(
      '[@dashforge/tw] <Drawer resize> was used without a `resizeKey`. ' +
        'The resized dimension will not persist across sessions. Pass a ' +
        'string identifier to `resizeKey` (e.g. `resizeKey="inspector"`) ' +
        'to enable localStorage persistence.',
    );
  }, [resize, resizeKey]);

  // Read persisted size from localStorage on mount. Kept out of the
  // useState initializer so SSR/SSG builds don't try to touch `window`.
  useEffect(() => {
    if (!resize || !resizeKey) return;
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${resizeKey}`);
      if (stored == null) return;
      const parsed = Number(stored);
      if (!Number.isFinite(parsed)) return;
      setResizedSize(clamp(parsed, resizeMin, resizeMax));
    } catch {
      // localStorage may throw on Safari private mode / iframe policies.
      // The consumer just doesn't get persistence — silent recovery.
    }
    // Intentionally only reading on mount; consumers changing resizeKey
    // mid-life aren't a supported flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resize, resizeKey]);

  // Commit path used by both pointer drag and keyboard step.
  const commitSize = useCallback(
    (next: number) => {
      const clamped = clamp(next, resizeMin, resizeMax);
      setResizedSize(clamped);
      onSizeChange?.(clamped);
      if (!resizeKey) return;
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}${resizeKey}`,
          String(clamped),
        );
      } catch {
        // Same reason as above — private mode or storage-quota errors
        // shouldn't crash the drag.
      }
    },
    [onSizeChange, resizeKey, resizeMax, resizeMin],
  );

  // ───── Pointer drag ─────
  const dragStateRef = useRef<{ startPos: number; startSize: number } | null>(
    null,
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const currentSize =
        resizedSize ?? (initialFallback > 0 ? initialFallback : 0);
      dragStateRef.current = {
        startPos: isHorizontal ? e.clientX : e.clientY,
        startSize: currentSize,
      };
    },
    [initialFallback, isHorizontal, resizedSize],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current;
      if (!state) return;
      const currentPos = isHorizontal ? e.clientX : e.clientY;
      const delta = currentPos - state.startPos;
      // The handle sits on the OPPOSITE edge from the anchor. Dragging
      // AWAY from the anchor edge grows the drawer.
      //   right anchor  → handle on left edge  → moving left (negative dx) grows
      //   left anchor   → handle on right edge → moving right (positive dx) grows
      //   top anchor    → handle on bottom edge → moving down (positive dy) grows
      //   bottom anchor → handle on top edge   → moving up (negative dy) grows
      const growsWithPositive = position === 'left' || position === 'top';
      const signedDelta = growsWithPositive ? delta : -delta;
      commitSize(state.startSize + signedDelta);
    },
    [commitSize, isHorizontal, position],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      dragStateRef.current = null;
    },
    [],
  );

  // ───── Keyboard step ─────
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 8 : 1;
      const currentSize =
        resizedSize ?? (initialFallback > 0 ? initialFallback : 0);
      const growsWithPositive = position === 'left' || position === 'top';

      const growKey = isHorizontal
        ? growsWithPositive
          ? 'ArrowRight'
          : 'ArrowLeft'
        : growsWithPositive
          ? 'ArrowDown'
          : 'ArrowUp';
      const shrinkKey = isHorizontal
        ? growsWithPositive
          ? 'ArrowLeft'
          : 'ArrowRight'
        : growsWithPositive
          ? 'ArrowUp'
          : 'ArrowDown';

      if (e.key === growKey) {
        e.preventDefault();
        commitSize(currentSize + step);
      } else if (e.key === shrinkKey) {
        e.preventDefault();
        commitSize(currentSize - step);
      }
    },
    [commitSize, initialFallback, isHorizontal, position, resizedSize],
  );

  // Early returns AFTER all hooks.
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = drawerVariants({ position, variant, size });

  const contentClasses = cn(
    v.content(),
    // Only apply the TV `w-*` / `h-*` preset class when the user has NOT
    // resized. Once resized, inline style takes over so drag operations
    // don't stutter against the class-derived size.
    resizedSize == null ? sizeClass : undefined,
    themeSlotProps?.content?.className,
    slotProps?.content?.className,
    sx,
  );
  const contentStyle: CSSProperties | undefined =
    resizedSize != null
      ? isHorizontal
        ? { width: resizedSize }
        : { height: resizedSize }
      : undefined;

  const resolvedSizeForAria =
    resizedSize ?? (initialFallback > 0 ? initialFallback : 0);

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={isModal}
    >
      <RadixDialog.Portal>
        {isModal && (
          <RadixDialog.Overlay
            className={cn(
              v.overlay(),
              themeSlotProps?.overlay?.className,
              slotProps?.overlay?.className,
            )}
          />
        )}
        <RadixDialog.Content
          className={contentClasses}
          style={contentStyle}
          data-testid={testId}
          data-position={position}
          data-variant={variant}
          // Drawer has no `description` prop. Radix logs a dev-warn when
          // `aria-describedby` is set on Content but no matching
          // Description child exists — set it to undefined via the
          // documented escape.
          aria-describedby={undefined}
          // Aria-label fallback for content with no visible title.
          // Radix requires a Title element in the tree — we render one
          // (visible or sr-only) below to satisfy that contract.
          {...(title == null ? { 'aria-label': 'Drawer' } : {})}
          onPointerDownOutside={(e) => {
            if (effectiveDisableBackdropClose) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (effectiveDisableEscapeClose) e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            // Consumer override wins — full control over focus semantics
            // when the drawer opens (screen-reader-specific tweaks, custom
            // focus target, etc.).
            if (onOpenAutoFocus) {
              onOpenAutoFocus(e);
              return;
            }
            // Default behavior: prevent Radix's built-in auto-focus (which
            // lands on the first focusable child = the × close button, and
            // paints a primary focus ring reading as "dismiss is the
            // recommended action" — the opposite of the intended UX) and
            // focus the Content wrapper instead. Radix already sets
            // `tabIndex={-1}` on it, so screen readers still announce the
            // dialog via `aria-labelledby` → title, and keyboard users can
            // Tab to reach the body content.
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
        >
          {title == null ? (
            // Always render a Title element so Radix's a11y contract is
            // satisfied. When the consumer doesn't provide a visible
            // title, render it `sr-only` — screen readers still announce
            // "Drawer", visually hidden.
            <RadixDialog.Title className="sr-only">Drawer</RadixDialog.Title>
          ) : null}
          {(title != null || showCloseButton) && (
            <div
              className={cn(
                v.header(),
                themeSlotProps?.header?.className,
                slotProps?.header?.className,
              )}
              data-close-position={closeButtonPosition}
            >
              {showCloseButton && closeButtonPosition === 'start' && (
                <RadixDialog.Close
                  aria-label="Close"
                  className={cn(
                    v.closeButton(),
                    themeSlotProps?.closeButton?.className,
                    slotProps?.closeButton?.className,
                  )}
                  onClick={onCloseClick}
                >
                  <CloseIconSvg />
                </RadixDialog.Close>
              )}
              {title != null ? (
                <RadixDialog.Title
                  className={cn(
                    v.title(),
                    themeSlotProps?.title?.className,
                    slotProps?.title?.className,
                  )}
                >
                  {title}
                </RadixDialog.Title>
              ) : (
                // Spacer so the close button stays flush to its edge
                // (start OR end) regardless of whether a title is shown.
                <span aria-hidden="true" />
              )}
              {showCloseButton && closeButtonPosition === 'end' && (
                <RadixDialog.Close
                  aria-label="Close"
                  className={cn(
                    v.closeButton(),
                    themeSlotProps?.closeButton?.className,
                    slotProps?.closeButton?.className,
                  )}
                  onClick={onCloseClick}
                >
                  <CloseIconSvg />
                </RadixDialog.Close>
              )}
            </div>
          )}

          <div
            className={cn(
              v.body(),
              themeSlotProps?.body?.className,
              slotProps?.body?.className,
            )}
          >
            {children}
          </div>

          {footer != null && (
            <div
              className={cn(
                v.footer(),
                themeSlotProps?.footer?.className,
                slotProps?.footer?.className,
              )}
            >
              {footer}
            </div>
          )}

          {resize && (
            <div
              role="separator"
              aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
              aria-valuenow={resolvedSizeForAria}
              aria-valuemin={resizeMin}
              aria-valuemax={resizeMax}
              aria-label="Resize drawer"
              tabIndex={0}
              data-testid={testId ? `${testId}-resize-handle` : undefined}
              className={cn(
                v.resizeHandle(),
                themeSlotProps?.resizeHandle?.className,
                slotProps?.resizeHandle?.className,
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
            />
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

Drawer.displayName = 'Drawer';
