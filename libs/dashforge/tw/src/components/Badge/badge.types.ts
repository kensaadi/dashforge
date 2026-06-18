import type { ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';

/**
 * Intent color — drives the badge background. Default is `danger`
 * because the most common notification UX expects a red dot/count
 * for "needs attention" affordance.
 */
export type BadgeColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** 4 corner positions for the floating badge. */
export type BadgePlacement =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

/**
 * Anchor shape:
 *   - `'rectangular'` (default) — badge sits at the bounding-box
 *     corner. Use for square-ish anchors like IconButton, Card.
 *   - `'circular'` — badge offset to align with the circular edge.
 *     Use for round anchors like Avatar.
 */
export type BadgeOverlap = 'rectangular' | 'circular';

/**
 * Per-slot className overrides for `<Badge>`.
 */
export interface BadgeSlotProps {
  /** Outer wrapper (relative-positioned, contains the anchor + badge). */
  root?: { className?: string };
  /** The floating badge pill / dot itself. */
  badge?: { className?: string };
}

/**
 * Props for `<Badge>` — anchored indicator (count / dot / short text).
 *
 * Wrapper-only mode: `<Badge>` always wraps an anchor element passed
 * as `children`. For standalone inline pills (status labels, tags),
 * use `<Chip>` — Badge and Chip are complementary, not interchangeable.
 *
 * Relationship with Chip:
 *   - `<Chip>` = inline pill (interactive — `onClick`, `onDelete`,
 *     `selected`). Standalone, no anchor.
 *   - `<Badge>` = anchored indicator (passive — small count / dot
 *     overlaid on top of another element).
 */
export interface BadgeProps {
  // ─── Required ──────────────────────────────────────────────────
  /** The anchor element (Avatar / IconButton / button / Card / custom). */
  children: ReactNode;

  // ─── Content ───────────────────────────────────────────────────
  /**
   * Numeric or string content to display inside the badge.
   *   - `number` → formatted via `max` (overflow renders as `"N+"`)
   *   - `string` → rendered verbatim (e.g., `"NEW"`)
   *   - omitted + `dot=false` → no badge rendered (or only at zero if
   *     `showZero=true`)
   */
  content?: number | string;

  /**
   * Dot-only mode — small circle without content. When `true`,
   * `content` and `max` are ignored.
   */
  dot?: boolean;

  /**
   * Overflow threshold for numeric `content`. Values above render
   * as `{max}+`. Set to `-1` to disable overflow (always raw number).
   * @default 99
   */
  max?: number;

  /**
   * Whether to render the badge when numeric `content` is `0`.
   * Hidden by default — the typical notification UX is "no badge =
   * nothing to see".
   * @default false
   */
  showZero?: boolean;

  /**
   * Imperative hide — keeps the badge in the DOM but applies
   * `display: none`. Use for opacity/scale fade animations without
   * unmounting.
   * @default false
   */
  invisible?: boolean;

  // ─── Visual ────────────────────────────────────────────────────
  /** @default 'danger' — typical "needs attention" notification color. */
  color?: BadgeColor;

  /** @default 'top-right' */
  placement?: BadgePlacement;

  /**
   * Anchor shape — controls badge offset.
   * - `'rectangular'` (default) sits at the bounding-box corner
   * - `'circular'` offsets to align with the circular anchor edge
   *   (use with `<Avatar shape="circle">`)
   * @default 'rectangular'
   */
  overlap?: BadgeOverlap;

  /**
   * White/neutral ring around the badge — visually separates from
   * the anchor surface. Token-driven via `ring-neutral-50` which
   * auto-inverts via the dashforgePreset CSS-var swap (no `dark:`
   * needed).
   * @default true
   */
  withRing?: boolean;

  // ─── Bridge integration (Sprint 4.4) ───────────────────────────
  /**
   * RBAC requirement — hides the badge for unauthorized subjects.
   * The wrapped anchor element remains visible (use Box `access`
   * to gate the anchor too).
   *
   * Use case: admin-only notification count, role-gated indicators.
   */
  access?: AccessRequirement;

  /**
   * Reactive visibility predicate. When `false`, the badge dot/count
   * is not rendered (children always render). Use for state-driven
   * indicators tied to engine values.
   */
  visibleWhen?: (engine: Engine) => boolean;

  // ─── Override ──────────────────────────────────────────────────
  /** Root-element class shortcut. */
  sx?: ClassValue;

  /** Standard className — appended to the root via `cn()`. */
  className?: string;

  /** Per-slot overrides — root + badge. */
  slotProps?: BadgeSlotProps;
}
