import type { ReactNode } from 'react';
import type { AppShellVariants } from './appShell.variants.js';

export interface AppShellSlotProps {
  root?: { className?: string };
  header?: { className?: string };
  nav?: { className?: string };
  navMobile?: { className?: string };
  main?: { className?: string };
  footer?: { className?: string };
  backdrop?: { className?: string };
}

/**
 * Props for `<AppShell>`.
 *
 * Top-level layout orchestrator with 4 named slots:
 *
 *   - `header` (top, sticky)
 *   - `nav`    (left side, fixed-width on desktop, drawer on mobile)
 *   - `footer` (bottom, non-sticky)
 *   - `children` (main content, scrolls independently)
 *
 * Responsive behavior:
 *   - **≥ md (768px)**: nav is rendered inline at the left.
 *   - **< md**:        nav slides in as an overlay drawer when
 *                      `navOpen={true}` (controlled).
 *
 * The shell is router-agnostic — pass any nav/header content. Typical
 * pairing is `<LeftNav>` + `<TopBar>` (with a hamburger button in
 * `TopBar.start` that flips `navOpen`).
 */
export interface AppShellProps extends AppShellVariants {
  header?: ReactNode;
  nav?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /**
   * Mobile drawer open state. Controlled — provide
   * `onNavOpenChange` to update. When `undefined`, the mobile drawer
   * is always closed (consumer hasn't wired up the toggle yet).
   */
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: AppShellSlotProps;
}
