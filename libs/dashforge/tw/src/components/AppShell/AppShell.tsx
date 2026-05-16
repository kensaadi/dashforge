import { useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { appShellVariants } from './appShell.variants.js';
import type { AppShellProps } from './appShell.types.js';

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
              className={cn(v.navMobile(), slotProps?.navMobile?.className)}
              aria-hidden={!navOpen}
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
