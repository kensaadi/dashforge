import type { ReactNode } from 'react';
import type { TopBarVariants } from './topBar.variants.js';

/**
 * Subset of `<TopBar>` props theme-configurable via
 * `theme.components.TopBar.defaults` (Option C).
 */
export type TopBarVariantProps = Pick<TopBarVariants, 'height' | 'sticky'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    TopBar?: {
      defaults?: Partial<TopBarVariantProps>;
      slotProps?: TopBarSlotProps;
    };
  }
}

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
export interface TopBarProps {
  /**
   * Bar height tier — sm:h-12, md:h-14, lg:h-16.
   * @default 'md'
   */
  height?: TopBarVariants['height'];

  /**
   * Apply `position: sticky; top: 0` so the bar stays pinned during
   * page scroll.
   * @default true
   */
  sticky?: TopBarVariants['sticky'];

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
