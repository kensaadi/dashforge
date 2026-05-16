import type { ReactNode } from 'react';
import type { TopBarVariants } from './topBar.variants.js';

export interface TopBarSlotProps {
  root?: { className?: string };
  start?: { className?: string };
  center?: { className?: string };
  end?: { className?: string };
}

/**
 * Props for `<TopBar>`.
 *
 * Pure composition container with 3 named slots — `start`, `center`,
 * `end` — that fill a sticky horizontal bar.
 *
 * Typical patterns:
 *
 *   - **start**: mobile menu toggle, brand/logo
 *   - **center**: Breadcrumbs, page title, global search
 *   - **end**: notifications icon, user menu, theme toggle
 *
 * The component is intentionally minimal: it just lays out the three
 * regions. All semantics (e.g., `<header role="banner">`) come for
 * free from rendering as an HTML `<header>` element.
 */
export interface TopBarProps extends TopBarVariants {
  /** Left-aligned slot (mobile menu, brand). */
  start?: ReactNode;
  /** Center slot (breadcrumbs, title). Grows to fill remaining space. */
  center?: ReactNode;
  /** Right-aligned slot (actions, user menu). */
  end?: ReactNode;
  /** Convenience: render the bar as a plain `<div>` (no banner role). */
  asDiv?: boolean;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot className overrides. */
  slotProps?: TopBarSlotProps;
  /** Children render between `start` and `end` when no `center` is set. */
  children?: ReactNode;
}
