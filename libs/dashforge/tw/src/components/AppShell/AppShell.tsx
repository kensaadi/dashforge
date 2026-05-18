import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn.js';
import { appShellVariants } from './appShell.variants.js';
import type { AppShellProps } from './appShell.types.js';

/**
 * Query selector for natively-focusable elements + anything with an
 * explicit positive (or implicit `0`) tabindex. Used by the focus
 * trap to enumerate the drawer's interactive content.
 *
 * Notes:
 *  - Excludes `[tabindex="-1"]` (intentionally non-tabbable).
 *  - Excludes `:disabled` — the browser already skips them in tab
 *    order; including them here would route focus to dead elements.
 *  - `details > summary` is the standard way to get a focusable
 *    `<details>` toggle.
 *
 * @internal
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"]):not(:disabled)',
  'details > summary:first-of-type',
].join(',');

/**
 * Dashforge TW AppShell — top-level layout orchestrator.
 *
 *   ┌──────────────────────────────────────────┐
 *   │              header                      │  ← `header` slot
 *   ├────────┬─────────────────────────────────┤
 *   │        │                                 │
 *   │  nav   │           main                  │  ← `nav` + `children`
 *   │        │                                 │
 *   ├────────┴─────────────────────────────────┤
 *   │              footer                      │  ← `footer` slot
 *   └──────────────────────────────────────────┘
 *
 * **Responsive**:
 *   - `≥ md`: nav stays in the inline slot at the left.
 *   - `< md`: nav becomes a slide-in drawer toggled by `navOpen`.
 *     A backdrop closes the drawer on click (mirrors `<Dialog>` UX).
 *
 * **Body scroll lock**: when the mobile drawer is open we add
 * `overflow-hidden` to `<body>` to prevent dual-scroll wobble. The
 * effect cleans up on close + on unmount.
 *
 * **A11y**:
 *   - `<main>` landmark wraps the content area.
 *   - `<header>` / `<footer>` come for free from their HTML tags.
 *   - The mobile drawer + backdrop participate in the standard
 *     "click outside to close" pattern — `Escape` closes the drawer
 *     too (added via global keydown).
 *   - **Focus trap** (WCAG 2.4.3) — when the mobile drawer opens:
 *       1. The previously-focused element is captured.
 *       2. Focus moves to the first focusable element inside the drawer.
 *       3. Tab / Shift+Tab wrap inside the drawer (cycle from
 *          last → first and first → last) — Tab can never escape
 *          to the page underneath while the drawer is open.
 *       4. On close, focus returns to the captured element (typically
 *          the hamburger toggle the user pressed to open the drawer).
 *     This pattern matches WAI-ARIA APG's modal dialog guidance even
 *     though the drawer isn't strictly a dialog — same focus
 *     management makes keyboard users' experience predictable.
 *   - **`role="dialog"` + `aria-modal="true"`** are applied to the
 *     drawer when open so screen readers announce it as a modal
 *     overlay rather than just an aside.
 */
export function AppShell(props: AppShellProps) {
  const {
    header,
    nav,
    footer,
    children,
    navOpen = false,
    onNavOpenChange,
    sx,
    slotProps,
  } = props;

  const v = appShellVariants({ navOpen });

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!navOpen || !onNavOpenChange) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onNavOpenChange(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navOpen, onNavOpenChange]);

  /*
   * Focus trap for the mobile drawer.
   *
   * Implementation:
   *  - On open: capture the currently-focused element (`document.activeElement`)
   *    so we can restore it on close. Then move focus to the first
   *    focusable element inside the drawer.
   *  - While open: a Tab/Shift+Tab keydown listener wraps focus inside
   *    the drawer subtree (last → first on Tab from end, first → last
   *    on Shift+Tab from start).
   *  - On close: restore focus to the captured element.
   *
   * Hand-rolled (no `focus-trap-react` dep) — the logic is ~20 LOC and
   * scoped to a single drawer; adding a runtime dep felt like overkill.
   * If we ever need more sophisticated trap semantics (nested traps,
   * sentinel nodes, etc.) the dep is the right call.
   */
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!navOpen) return;
    // 1) Capture the element that had focus before the drawer opened.
    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    // 2) Move focus to the first focusable element inside the drawer.
    //    Defer via rAF so the drawer DOM (slide-in animation start) has
    //    settled and the elements are actually visible/focusable.
    const raf = requestAnimationFrame(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const first = drawer.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    });

    // 3) Trap Tab / Shift+Tab inside the drawer.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = Array.from(
        drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        // Shift+Tab on first → wrap to last.
        if (active === first || !drawer.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab on last → wrap to first.
        if (active === last || !drawer.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      // 4) Restore focus to the previously-focused element on close.
      //    Guard against the element being removed from the DOM (rare
      //    but possible if the consumer re-renders the page while the
      //    drawer is open).
      const restore = restoreFocusRef.current;
      if (restore && document.body.contains(restore)) {
        restore.focus();
      }
    };
  }, [navOpen]);

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      {header && (
        <div className={cn(v.header(), slotProps?.header?.className)}>
          {header}
        </div>
      )}

      <div className={v.body()}>
        {nav && (
          <>
            <aside className={cn(v.nav(), slotProps?.nav?.className)}>
              {nav}
            </aside>
            <aside
              ref={drawerRef}
              className={cn(v.navMobile(), slotProps?.navMobile?.className)}
              aria-hidden={!navOpen}
              // When open, the drawer is a modal overlay — `dialog` +
              // `aria-modal="true"` so screen readers announce it as
              // such. When closed, drop both attributes (the aria-
              // hidden=true above already removes it from the AT tree).
              role={navOpen ? 'dialog' : undefined}
              aria-modal={navOpen ? true : undefined}
              // The drawer is the SAME nav content rendered twice — once
              // inline (desktop) and once as a slide-in (mobile). We
              // mark the inactive copy hidden from AT to avoid double
              // announcements.
            >
              {nav}
            </aside>
            <div
              className={cn(v.backdrop(), slotProps?.backdrop?.className)}
              role="presentation"
              onClick={() => onNavOpenChange?.(false)}
              data-testid="appshell-backdrop"
            />
          </>
        )}

        <main className={cn(v.main(), slotProps?.main?.className)}>
          {children}
        </main>
      </div>

      {footer && (
        <div className={cn(v.footer(), slotProps?.footer?.className)}>
          {footer}
        </div>
      )}
    </div>
  );
}
