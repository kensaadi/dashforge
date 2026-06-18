import type { ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ChipVariants } from './chip.variants.js';

/**
 * Props for `<Chip>` — status / filter / tag pill.
 *
 * Mirrors MUI Chip's API surface where it makes sense (label, icon,
 * avatar, clickable, onDelete) and extends with Dashforge-specific
 * affordances (`selected` for filter chips, `access` for RBAC).
 *
 * Variant axis (`soft | solid | outline`) is the **Dashforge chip
 * vocabulary** — distinct from Button's (`solid | outline | ghost |
 * link`) and Alert's (`standard | filled | outlined`). The asymmetry
 * is intentional and category-scoped: each component family uses the
 * vocabulary that maps to its design needs (see CHANGELOG +
 * MIGRATION.md for the design note).
 *
 * @see https://mui.com/material-ui/api/chip/
 */
export interface ChipProps
  extends Pick<
    ChipVariants,
    'color' | 'variant' | 'size' | 'selected' | 'disabled'
  > {
  /**
   * The chip's textual content. Named `label` for MUI parity — most
   * design systems (MUI, Radix Themes, Mantine, Tremor) use `label`
   * as the canonical content prop on Chip / Badge / Pill primitives.
   */
  label: ReactNode;

  /**
   * Leading icon — typically a small SVG (16px). Consumer brings
   * their iconography. Rendered inside the chip BEFORE the label.
   * Falls back to `avatar` if not provided.
   */
  icon?: ReactNode;

  /**
   * Leading avatar — alternative to `icon`, typically a small
   * circular image (Avatar component or `<img>`). When BOTH `icon`
   * and `avatar` are set, `avatar` wins (matches MUI behaviour).
   */
  avatar?: ReactNode;

  /**
   * Makes the chip interactive — renders as `<button>` (instead of
   * `<span>`), adds focus ring + hover state. Set automatically to
   * `true` when `onClick` is provided.
   */
  clickable?: boolean;

  /**
   * Click handler. Implies `clickable=true`. Fires on chip-body
   * click (NOT on the delete button — `onDelete` is the dedicated
   * path for that).
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * When set, renders a trailing × delete button. The handler fires
   * on delete-button click and stops propagation so the chip's
   * `onClick` doesn't also fire.
   */
  onDelete?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Custom delete icon. Defaults to an inline stroke-style × SVG.
   * `currentColor` flows through, so the icon inherits the chip's
   * text colour.
   */
  deleteIcon?: ReactNode;

  /**
   * `aria-label` for the delete button. Required for screen readers
   * since the × glyph alone is not semantic.
   * @default 'Remove'
   */
  deleteLabel?: string;

  /**
   * Reactive visibility predicate. Re-evaluated on every engine state
   * change when the chip is mounted inside a `<DashForm>`; outside
   * a form, evaluated as a plain predicate (the consumer captures
   * any external state in the closure).
   *
   * When the predicate returns `false`, the component renders `null`
   * — same contract as `<Alert>` / `<TextField>` / other bridge-aware
   * components. Useful for status chips that should appear / disappear
   * based on form values without forcing JSX guards on the consumer.
   *
   * @example
   * ```tsx
   * // Inside a DashForm — engine-reactive
   * <Chip
   *   label="Premium"
   *   color="primary"
   *   visibleWhen={(engine) => engine.getNode('plan')?.value === 'premium'}
   * />
   *
   * // Outside a form — closure over external state
   * <Chip
   *   label={`${count} results`}
   *   visibleWhen={() => count > 0}
   * />
   * ```
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * RBAC requirement. Same contract as `<Button>` / `<IconButton>` —
   * `onUnauthorized: 'hide' | 'disable' | 'readonly'`.
   * (`readonly` maps to `disabled` for chips, matching Button.)
   */
  access?: AccessRequirement;

  /**
   * Root-element class shortcut (string or clsx-compatible value).
   * Last-wins via `tailwind-merge` inside `cn()`.
   */
  sx?: ClassValue;

  /** Standard React `className` — appended to the root via `cn()`. */
  className?: string;
}
