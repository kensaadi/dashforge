import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ClassValue } from 'tailwind-variants';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { Severity, SeverityVariant } from '../_shared/severity/severity.types.js';
import type { AlertVariantProps as AlertRecipeVariants } from './alert.variants.js';

/**
 * Subset of `<Alert>` props theme-configurable via
 * `theme.components.Alert.defaults` (Option C).
 */
export interface AlertDefaultVariantProps {
  variant?: SeverityVariant;
  density?: AlertRecipeVariants['density'];
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Alert?: {
      defaults?: Partial<AlertDefaultVariantProps>;
      slotProps?: AlertSlotProps;
    };
  }
}

/**
 * Per-slot override props for `<Alert>`. Mirrors the standard
 * `slotProps` contract used across `@dashforge/tw` components.
 */
export interface AlertSlotProps {
  root?: ComponentPropsWithoutRef<'div'>;
  icon?: ComponentPropsWithoutRef<'span'>;
  content?: ComponentPropsWithoutRef<'div'>;
  action?: ComponentPropsWithoutRef<'div'>;
  closeButton?: ComponentPropsWithoutRef<'button'>;
}

/**
 * Props for the `<Alert>` component.
 *
 * Mirrors the MUI Alert API surface 1:1 (drop-in muscle memory) with
 * a single deliberate divergence: `severity` uses `'danger'` instead of
 * MUI's `'error'` for alignment with the `danger.*` token palette in
 * `@dashforge/tw-tokens`.
 *
 * In addition to the MUI surface, Dashforge adds:
 *   - `visibleWhen` — engine-reactive visibility predicate (same
 *     contract as `<TextField>` / `<Checkbox>` / etc.)
 *   - `access` — RBAC integration via `@dashforge/rbac`
 *
 * @see https://mui.com/material-ui/api/alert/
 */
export interface AlertProps {
  /**
   * Visual severity. Drives the color treatment and the default ARIA
   * role (`alert` for warning / danger, `status` for info / success).
   *
   * Note: this is `danger`, not MUI's `error`. The runtime behaviour
   * is identical; the naming follows the Dashforge token palette.
   */
  severity: Severity;

  /**
   * Variant of the severity surface. Mirrors MUI's three-way axis.
   *
   * - `'standard'` (default) — tinted soft surface, severity-toned
   *   text. The "all-purpose" reading.
   * - `'filled'` — solid colored surface, light text. High visual
   *   weight, for blocking / critical messages.
   * - `'outlined'` — transparent surface, severity border + text.
   *   Minimal weight, for dense layouts.
   *
   * @default 'standard'
   */
  variant?: SeverityVariant;

  /** Body content of the alert. */
  children?: ReactNode;

  /**
   * Icon control with full MUI parity.
   *
   * - omitted / `undefined` → default per-severity icon (lib's inline
   *   stroke SVG)
   * - `ReactNode` → consumer-provided custom icon (Lucide, Phosphor,
   *   Tabler, custom SVG — bring your own iconography)
   * - `false` → no icon rendered (the colored surface carries the
   *   severity signal; use when icons compete with the layout)
   */
  icon?: ReactNode | false;

  /**
   * When defined, the alert renders a trailing close button that
   * fires this callback on click. Ignored if `action` is provided
   * (`action` slot wins, matching MUI behaviour).
   */
  onClose?: () => void;

  /**
   * `aria-label` for the close button.
   * @default 'Close'
   */
  closeText?: string;

  /**
   * Custom trailing slot — CTA buttons, links, inline forms. When
   * provided, replaces the auto-rendered close button. The consumer
   * is responsible for wiring any close behaviour into the custom
   * action node.
   */
  action?: ReactNode;

  /**
   * Override the auto-derived ARIA role. Defaults to `'alert'` for
   * `severity={'warning' | 'danger'}` (assertive announcement) and
   * `'status'` for `severity={'info' | 'success'}` (polite).
   */
  role?: 'alert' | 'status';

  /**
   * Reactive visibility predicate. Re-evaluated on every engine state
   * change when the alert is mounted inside a `<DashForm>`; outside a
   * form, evaluated as a plain predicate (the consumer captures any
   * external state in the closure).
   *
   * When the predicate returns `false`, the component renders `null`
   * — same contract as form fields.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * RBAC requirement. When the current subject does not satisfy the
   * requirement, the alert is hidden (or disabled / read-only,
   * per `onUnauthorized`).
   */
  access?: AccessRequirement;

  /** Root-element class shortcut (string or `clsx`-compatible value). */
  sx?: ClassValue;

  /** Standard React `className` — appended to the root via `cn()`. */
  className?: string;

  /** Per-slot overrides — typed handles for the inner elements. */
  slotProps?: AlertSlotProps;
}

/**
 * Props for the `<AlertTitle>` sub-component.
 *
 * AlertTitle is a separate exported component, not a prop on Alert —
 * follows MUI's pattern. Pass it as the first child of `<Alert>`:
 *
 * @example
 * <Alert severity="warning">
 *   <AlertTitle>Subscription expires soon</AlertTitle>
 *   Your Pro plan ends on 2026-06-20.
 * </Alert>
 */
export interface AlertTitleProps {
  children: ReactNode;
  className?: string;
}
