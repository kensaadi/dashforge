import { forwardRef, useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import {
  CIRCULAR_GEOMETRY,
  LINEAR_TRACK_HEIGHTS,
  progressVariants,
} from './progress.variants.js';
import type { ProgressProps, ProgressThickness } from './progress.types.js';

/**
 * Clamp a value to `[min, max]`, defaulting to `min` for NaN.
 */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_THICKNESS: ProgressThickness = 'md';

/**
 * `<Progress>` — display-only determinate progress indicator.
 *
 * Two visual flavors on the same primitive:
 *   - `variant='linear'`   — horizontal bar (default). The `bar` slot
 *                            fills from `min` to the current `value`.
 *   - `variant='circular'` — SVG arc. The `arc` slot draws from the
 *                            top of a circle for `(value/max) * 100%`
 *                            of the circumference.
 *
 * No bridge integration — Progress does not write a value on submit.
 * `visibleWhen` and `access` follow the catalog convention so the
 * primitive stays plug-compatible with the rest of the form widgets
 * even without being an input itself.
 *
 * @see ProgressProps
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  props,
  ref,
) {
  const themeDefaults = useComponentDefaults('Progress');
  const merged: ProgressProps = { ...themeDefaults?.defaults, ...props };
  const themeSlotProps = themeDefaults?.slotProps;

  const {
    value: rawValue,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    variant,
    color,
    size,
    thickness = DEFAULT_THICKNESS,
    fullWidth,
    label,
    showLabel = false,
    formatLabel = (v: number, m: number) =>
      `${Math.round(((v - min) / Math.max(m - min, 1)) * 100)}%`,
    visibleWhen,
    access,
    'aria-label': ariaLabelProp,
    sx,
    slotProps,
    testId,
  } = merged;

  // ───── Reactive visibility + RBAC (catalog-uniform) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  if (!isVisible) return null;
  if (!accessState.visible) return null;

  // ───── Value resolution ─────
  const value = clamp(rawValue, min, max);
  const span = Math.max(max - min, 1);
  const ratio = (value - min) / span;
  const percent = Math.round(ratio * 100);

  const resolvedVariant = variant ?? 'linear';
  const resolvedSize = size ?? 'md';

  const v = progressVariants({
    variant: resolvedVariant,
    color,
    size: resolvedSize,
    fullWidth,
  });

  // ───── Class chain ─────
  const rootClasses = cn(v.root(), sx, themeSlotProps?.root?.className, slotProps?.root?.className);
  const labelClasses = cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className);
  const controlClasses = cn(v.control(), themeSlotProps?.control?.className, slotProps?.control?.className);
  const trackClasses = cn(v.track(), themeSlotProps?.track?.className, slotProps?.track?.className);
  const barClasses = cn(v.bar(), themeSlotProps?.bar?.className, slotProps?.bar?.className);
  const arcClasses = cn(v.arc(), themeSlotProps?.arc?.className, slotProps?.arc?.className);
  const valueLabelClasses = cn(v.valueLabel(), themeSlotProps?.valueLabel?.className, slotProps?.valueLabel?.className);

  const resolvedAriaLabel =
    ariaLabelProp ??
    (typeof label === 'string' ? label : undefined) ??
    'progress';

  const displayLabel = showLabel ? formatLabel(value, max) : null;

  return (
    <div ref={ref} className={rootClasses} data-testid={testId}>
      {label != null && <span className={labelClasses}>{label}</span>}

      {resolvedVariant === 'linear' ? (
        <div className={controlClasses}>
          <div
            role="progressbar"
            aria-label={resolvedAriaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            className={trackClasses}
            style={{ height: LINEAR_TRACK_HEIGHTS[resolvedSize][thickness] }}
          >
            <div
              className={barClasses}
              style={{ width: `${percent}%` }}
              aria-hidden="true"
            />
          </div>
          {showLabel && (
            <span className={valueLabelClasses}>{displayLabel}</span>
          )}
        </div>
      ) : (
        <CircularSvg
          size={resolvedSize}
          thickness={thickness}
          percent={percent}
          value={value}
          min={min}
          max={max}
          ariaLabel={resolvedAriaLabel}
          arcClass={arcClasses}
          trackClass={cn('stroke-neutral-200', themeSlotProps?.track?.className, slotProps?.track?.className)}
          controlClass={controlClasses}
          valueLabelClass={valueLabelClasses}
          displayLabel={displayLabel}
        />
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

/**
 * Circular flavor renderer. Split from the main component so the SVG
 * math + <circle> composition doesn't inline in the top-level tree.
 */
function CircularSvg(props: {
  size: 'sm' | 'md' | 'lg';
  thickness: ProgressThickness;
  percent: number;
  value: number;
  min: number;
  max: number;
  ariaLabel: string;
  arcClass: string;
  trackClass: string;
  controlClass: string;
  valueLabelClass: string;
  displayLabel: React.ReactNode;
}) {
  const {
    size,
    thickness,
    percent,
    value,
    min,
    max,
    ariaLabel,
    arcClass,
    trackClass,
    controlClass,
    valueLabelClass,
    displayLabel,
  } = props;

  const geom = CIRCULAR_GEOMETRY[size][thickness];
  const cx = geom.size / 2;
  const cy = geom.size / 2;
  const radius = (geom.size - geom.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div
      className={controlClass}
      style={{ width: geom.size, height: geom.size }}
    >
      <svg
        width={geom.size}
        height={geom.size}
        viewBox={`0 0 ${geom.size} ${geom.size}`}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        // Rotate so the arc starts at 12 o'clock (top) — SVG's default
        // origin is 3 o'clock. Rotation is around the SVG center.
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          className={trackClass}
          strokeWidth={geom.stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          className={arcClass}
          strokeWidth={geom.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      {displayLabel != null && (
        <span className={valueLabelClass}>{displayLabel}</span>
      )}
    </div>
  );
}
