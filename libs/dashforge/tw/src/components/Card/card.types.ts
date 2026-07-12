import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { BoxProps } from '../Box/box.types.js';

/**
 * Subset of `<Card>` props theme-configurable via
 * `theme.components.Card.defaults` (Option C).
 */
export interface CardVariantProps {
  variant?: 'outlined' | 'elevated' | 'plain';
  rounded?: BoxProps['rounded'];
  elevation?: BoxProps['elevation'];
  p?: BoxProps['p'];
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Card?: {
      defaults?: Partial<CardVariantProps>;
    };
  }
}

/**
 * `<Card>` — opinionated surface preset over `<Box>`.
 *
 * Architectural note: `<Box>` already implements the full surface
 * vocabulary (variant × color, elevation, rounded, spacing). `<Card>`
 * exists for **two reasons** on top of Box:
 *
 *   1. **MUI mental model** — devs migrating from `@mui/material/Card`
 *      reach for `<Card>` reflexively. Having the component (as a
 *      thin Box alias with card-shaped defaults) removes adoption
 *      friction without duplicating the surface system.
 *   2. **Restricted variant axis** — Card excludes `'soft'` and
 *      `'solid'` from Box's 5 variants. A "solid card" is semantically
 *      a banner; a "soft card" is a callout (use `<Alert>`). Restricting
 *      to `'outlined' | 'elevated' | 'plain'` is opinionated typing
 *      that catches misuse at compile time.
 *
 * Card inherits `access` + `visibleWhen` from Box (Sprint 4.4 surface
 * alignment) automatically — no per-component wiring needed.
 *
 * Defaults set by Card (override at the call site):
 *   - `variant='outlined'`  → soft border + bg tint (most card-like)
 *   - `rounded='lg'`        → 8px radius
 *   - `elevation={1}`       → faint shadow for visual weight
 *   - `p={0}`               → no inner padding (use `<CardContent>`)
 */
export interface CardProps
  extends Omit<BoxProps, 'variant'> {
  /**
   * Restricted variant — only the three card-appropriate Box variants.
   * - `'outlined'` (default) — bordered surface with subtle tint.
   * - `'elevated'` — surface with shadow, no border.
   * - `'plain'` — bare surface (background + radius), no border, no
   *   shadow. Use when wrapping content that already provides chrome.
   *
   * @default 'outlined'
   */
  variant?: 'outlined' | 'elevated' | 'plain';
}

/**
 * `<CardContent>` — padded inner section of a Card.
 *
 * A semantic alias for `<Box p={4}>` (or the equivalent spacing
 * step). Reads better in starter-kit code than the equivalent Box
 * call — the consumer expresses "this is the content area of the
 * card" rather than "this is a box with padding-4 inside a card".
 *
 * No surface props — CardContent inherits its background from the
 * parent Card. The only configurable axis is the padding step.
 */
export interface CardContentProps {
  /**
   * Inner padding token step (same scale as `<Box p>`).
   * @default 4
   */
  p?: BoxProps['p'];

  /** Content of the section. */
  children: ReactNode;

  /** Standard React `className` — appended to the root via `cn()`. */
  className?: string;

  /** Root-element class shortcut (string or clsx-compatible value). */
  sx?: ClassValue;
}

/**
 * `<CardActionArea>` — clickable wrapper inside (or around) a Card.
 *
 * The single value-add over a raw `<Box>` wrapper: focus ring +
 * hover state + Radix Slot polymorphism so the wrapper can become a
 * router `<Link>` without nesting `<a>` inside `<button>` (a11y
 * violation).
 *
 * Use cases:
 *   - "Card-as-CTA" patterns where the whole card surface should be
 *     clickable (e.g. "Open dashboard" tile)
 *   - Card-shaped router links in dashboards / navigation grids
 *   - Selectable cards in galleries (with `selected` + `onClick`)
 *
 * Always renders as `<button>` (or the asChild element) — focusable,
 * keyboard-accessible by default. `aria-pressed` when `selected=true`
 * for the toggle pattern (filter card / option card).
 */
export interface CardActionAreaProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'color'> {
  /** The card body / content to wrap. */
  children: ReactNode;

  /**
   * Render-as-child via Radix Slot. The CardActionArea styles paint
   * onto the immediate child element (typically a router `<Link>`).
   * No `<button>` DOM emitted.
   */
  asChild?: boolean;

  /**
   * Selected state — for toggle / option-card patterns. Adds
   * `aria-pressed="true"` and a primary-toned focus ring even when
   * not focused.
   */
  selected?: boolean;

  /**
   * RBAC requirement — controls clickability via the centralized
   * `@dashforge/rbac` policy engine.
   *   - `onUnauthorized: 'hide'`     → action area does not render
   *   - `onUnauthorized: 'disable'`  → clicks suppressed + dimmed
   *   - `onUnauthorized: 'readonly'` → mapped to disabled
   */
  access?: AccessRequirement;

  /**
   * Engine-reactive visibility predicate — Sprint 4.4 alignment.
   * When the predicate returns `false`, the action area renders `null`.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** Root-element class shortcut. */
  sx?: ClassValue;

  /** Standard React className — appended via `cn()`. */
  className?: string;
}
