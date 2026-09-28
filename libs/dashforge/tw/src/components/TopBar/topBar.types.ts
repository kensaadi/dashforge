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

/** Per-slot class overrides for `<TopBarBrand>`. */
export interface TopBarBrandSlotProps {
  /** Outer wrapper holding logo, title and subtitle. */
  root?: { className?: string };
  /** The mark. */
  logo?: { className?: string };
  /** Wrapper around the two text lines. */
  text?: { className?: string };
  /** The primary line. */
  title?: { className?: string };
  /** The secondary line. */
  subtitle?: { className?: string };
}

/**
 * Props for `<TopBarBrand>` — the "mark plus a line or two of text" block
 * that fills a `<TopBar>`'s `start` slot. kensaadi/dashforge#63 gap G.
 *
 * A **sibling export, not `TopBar.Brand`**, despite how the request was
 * written: this catalog attaches subcomponents as named siblings
 * (`Card` / `CardContent` / `CardActionArea`), and one component doing it
 * differently is worse than matching the request's punctuation.
 *
 * It is deliberately layout only: no link, no routing, no click. A brand
 * that navigates home is a `<Link>` or a router component wrapped around
 * this, which keeps the router out of the library.
 *
 * ⚠️ This lands ahead of kensaadi/dashforge#132, whose job is to freeze the
 * AppShell and TopBar surface, and #134 lists this helper as one of its
 * deliverables. It is kept to the smallest shape that removes the
 * duplication so the audit can adopt or reshape it cheaply.
 */
export interface TopBarBrandProps {
  /** The mark: an svg, an `<img>`, an icon. Omit for text-only brands. */
  logo?: ReactNode;

  /**
   * The primary line, e.g. the product name.
   */
  title: ReactNode;

  /**
   * The secondary line, e.g. the open file or the current page. Omitted,
   * the block is a single line and the title centres against the logo.
   *
   * @default undefined
   */
  subtitle?: ReactNode;

  /**
   * Utility classes appended to the root's variant chain, resolved through
   * `tailwind-merge`.
   *
   * @default undefined
   */
  sx?: string;

  /**
   * Per-slot class overrides.
   *
   * @default undefined
   */
  slotProps?: TopBarBrandSlotProps;
}
