import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { ProgressVariants } from './progress.variants.js';

/**
 * Thickness axis — track height on `linear`, SVG `stroke-width` on
 * `circular`. Derived to concrete pixel values by
 * {@link LINEAR_TRACK_HEIGHTS} / {@link CIRCULAR_GEOMETRY} in the
 * variants file, so consumers see a symbolic API and internal geometry
 * stays a single place to tune.
 */
export type ProgressThickness = 'thin' | 'md' | 'thick';

/**
 * Subset of `<Progress>` props theme-configurable via
 * `theme.components.Progress.defaults` (Option C).
 */
export type ProgressVariantProps = Pick<
  ProgressVariants,
  'variant' | 'color' | 'size' | 'fullWidth'
> & {
  thickness?: ProgressThickness;
};

/**
 * Per-slot override map. See {@link progressVariants} for the full slot
 * roster.
 */
export interface ProgressSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  control?: { className?: string };
  track?: { className?: string };
  bar?: { className?: string };
  arc?: { className?: string };
  valueLabel?: { className?: string };
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Progress?: {
      defaults?: Partial<ProgressVariantProps>;
      slotProps?: ProgressSlotProps;
    };
  }
}

/**
 * Props for `<Progress>` — display-only determinate progress indicator.
 *
 * Distinct from `<Spinner>` (indeterminate loading with no value).
 * Progress *requires* a numeric `value` — if you don't know how far
 * along the operation is, reach for `<Spinner>` instead.
 *
 * Two visual flavors:
 *   - `variant='linear'`   — horizontal bar. Default.
 *   - `variant='circular'` — SVG arc with the value in the center.
 *
 * Bridge integration: **none**. Progress is display-only — it renders
 * the value the consumer holds in local state (or from a server-driven
 * store). It does not register on the form bridge, does not write to
 * `bridge.setValue`, does not appear in the form data on submit.
 *
 * `visibleWhen` + `access` follow the catalog convention — reactive
 * predicate closure supporting engine + local-state mixing, and RBAC
 * gating. `name` is **optional** (Progress is display-only; consumers
 * that gate visibility via `access` may pass a `name` for logging
 * consistency but it has no bridge role).
 *
 * @example Linear progress (upload)
 * ```tsx
 * <Progress value={uploadedBytes} max={totalBytes} showLabel />
 * ```
 *
 * @example Circular progress with custom formatter
 * ```tsx
 * <Progress
 *   variant="circular"
 *   value={score}
 *   max={100}
 *   showLabel
 *   formatLabel={(v) => `${v} pts`}
 *   color="success"
 * />
 * ```
 *
 * @example Wizard step indicator
 * ```tsx
 * <Progress
 *   value={currentStep}
 *   max={totalSteps}
 *   showLabel
 *   formatLabel={(v, max) => `Step ${v} of ${max}`}
 *   thickness="thick"
 * />
 * ```
 *
 * @example Conditional visibility (mixing engine + local state)
 * ```tsx
 * <Progress
 *   value={uploadedBytes}
 *   max={totalBytes}
 *   visibleWhen={(engine) => showAdvanced && engine.get('mode') === 'upload'}
 * />
 * ```
 */
export interface ProgressProps {
  // ─── Optional identity ────────────────────────────────────────────
  /**
   * Optional field name. Progress is display-only and does NOT register
   * on the form bridge — this is used only for logging / a11y grouping.
   */
  name?: string;

  // ─── Value contract ──────────────────────────────────────────────
  /**
   * Current value. Clamped to `[min, max]` internally.
   * Progress is a **determinate** indicator — indeterminate loading
   * (unknown ETA) is the job of `<Spinner>`.
   */
  value: number;

  /** Lower bound. @default 0 */
  min?: number;

  /** Upper bound. @default 100 */
  max?: number;

  // ─── Visual axes (Option C configurable) ─────────────────────────
  /**
   * `linear` (bar) or `circular` (arc). Configurable via
   * `theme.components.Progress.defaults.variant`.
   * @default 'linear'
   */
  variant?: ProgressVariants['variant'];

  /**
   * Colour intent for the filled portion. `neutral` auto-inverts via
   * the preset CSS-var swap.
   * @default 'primary'
   */
  color?: ProgressVariants['color'];

  /**
   * Density knob. Controls typography of the value label and the base
   * geometry for both linear (track height baseline) and circular (SVG
   * viewport diameter).
   * @default 'md'
   */
  size?: ProgressVariants['size'];

  /**
   * Track height (linear) / arc stroke-width (circular). Independent
   * axis from `size` so DSes can compose a "thin + large" or "thick +
   * small" combo.
   * @default 'md'
   */
  thickness?: ProgressThickness;

  /** Stretches the root to `w-full` (linear variant only). */
  fullWidth?: boolean;

  // ─── Label affordances ───────────────────────────────────────────
  /** Optional field-style label above the control. */
  label?: ReactNode;

  /**
   * When true, renders the value as a label — beside the bar (linear)
   * or in the centre of the arc (circular). Default formatter is
   * `${round((value / max) * 100)}%`; override via `formatLabel`.
   * @default false
   */
  showLabel?: boolean;

  /**
   * Formatter for the value label. Receives the current value AND the
   * max so consumers can render `value/max` compositions or free-form
   * copy like `Step 3 of 5` without an extra closure over `max`.
   *
   * Default returns the ratio rounded to a whole percent — e.g.
   * value=42, max=100 renders `42%`.
   */
  formatLabel?: (value: number, max: number) => ReactNode;

  // ─── Reactivity + RBAC (catalog-uniform) ─────────────────────────
  /**
   * Reactive visibility predicate. The predicate closure can freely
   * mix engine state (via the `engine` argument) and local state /
   * context / refs captured in the outer scope — React re-render
   * cascade guarantees fresh values on every evaluation.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** RBAC gate — see `useAccessState`. */
  access?: AccessRequirement;

  // ─── Accessibility ───────────────────────────────────────────────
  /**
   * Explicit `aria-label` on the progressbar. When omitted, falls back
   * to `label` (if a string) or to a generic "progress" label.
   */
  'aria-label'?: string;

  // ─── Escape hatches ──────────────────────────────────────────────
  /**
   * Utility-class shortcut for `slotProps.root.className` — Dashforge
   * idiom consistent with the rest of the catalog.
   */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: ProgressSlotProps;

  /** `data-testid` on the root wrapper. */
  testId?: string;
}
