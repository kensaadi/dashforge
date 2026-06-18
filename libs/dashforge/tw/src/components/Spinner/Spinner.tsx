import { forwardRef, useContext, useEffect, useState } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { cn } from '../../utils/cn.js';
import {
  SPINNER_STROKE_WIDTH,
  SPINNER_TRACK_OPACITY,
  spinnerVariants,
} from './spinner.variants.js';
import type { SpinnerProps } from './spinner.types.js';

/**
 * `<Spinner>` — rotating-arc loading indicator.
 *
 * Visual: a partial-arc SVG rotating via Tailwind's `animate-spin`
 * (pure CSS, GPU-accelerated). Optional `withTrack` renders a faint
 * ghost ring (20% opacity of currentColor) behind the arc — the
 * standard "premium spinner" pattern used by Stripe / Vercel / Linear.
 *
 * Color resolution:
 *   - `color="primary"` (or any 7 intent) → `text-{color}-600` class
 *     → SVG `stroke="currentColor"` picks it up
 *   - `color` omitted → no `text-*` class emitted → SVG inherits
 *     parent's text color via `currentColor`. **This is the right
 *     default for nested usage** (inside Button, Alert, Card).
 *
 * A11y:
 *   - `role="status"` on the wrapper
 *   - `aria-live="polite"` so SR queues the announcement
 *   - visually-hidden text label inside (`'Loading'` default)
 *   - `animate-spin` is gated on `motion-reduce` (WCAG 2.3.3)
 *
 * Delay (anti-flash):
 *   - `delay={150}` mounts as `null` for the first 150ms, then swaps
 *     to the actual SVG. Quick operations that finish before 150ms
 *     never render the spinner — eliminates the "flash" UX bug.
 *
 * @example
 * ```tsx
 * // 1. Inside a Button — inherits text color
 * <button><Spinner size="sm" /> Saving...</button>
 *
 * // 2. Standalone with explicit color
 * <Spinner color="primary" size="lg" label="Loading dashboard data" />
 *
 * // 3. Anti-flash on quick submits
 * <Spinner visibleWhen={() => isSubmitting} delay={150} />
 *
 * // 4. With track for busy backgrounds
 * <Spinner color="primary" withTrack size="xl" />
 * ```
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  props,
  ref
) {
  const {
    size = 'md',
    color,
    thickness = 'md',
    withTrack = false,
    label = 'Loading',
    delay = 0,
    visibleWhen,
    sx,
    className,
  } = props;

  // Bridge — engine-reactive visibility. Hook called unconditionally
  // (rules-of-hooks). Outside a `<DashForm>`, predicate evaluated as
  // a plain closure.
  const bridge = useContext(DashFormContext);
  const isBridgeVisible = useEngineVisibility(bridge?.engine, visibleWhen);

  // Anti-flash delay — render `null` for the first `delay` ms after
  // the spinner becomes visible. Skipping the timer entirely when
  // delay=0 keeps the synchronous render path for the common case.
  const [delayElapsed, setDelayElapsed] = useState(delay <= 0);
  useEffect(() => {
    if (delay <= 0) {
      setDelayElapsed(true);
      return;
    }
    setDelayElapsed(false);
    const handle = setTimeout(() => setDelayElapsed(true), delay);
    return () => clearTimeout(handle);
  }, [delay]);

  if (!isBridgeVisible || !delayElapsed) return null;

  const classes = cn(
    spinnerVariants({ size, color }),
    sx,
    className
  );

  const strokeWidth = SPINNER_STROKE_WIDTH[thickness];

  // Decorative mode — when label is explicitly empty (""), suppress
  // role="status" and the visually-hidden label entirely. Used when
  // the Spinner is embedded inside another component that already
  // announces its loading state via `aria-busy` (e.g., Button) — the
  // inner spinner is then purely visual chrome.
  const isDecorative = label === '';

  return (
    <span
      ref={ref}
      className={classes}
      role={isDecorative ? undefined : 'status'}
      aria-live={isDecorative ? undefined : 'polite'}
      aria-hidden={isDecorative ? true : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        width="100%"
        height="100%"
      >
        {/* Track ring — faint full circle behind the arc. Renders
            only when `withTrack` is true. Uses currentColor with
            explicit opacity so it follows the parent's text color in
            BOTH light and dark mode without any `dark:` variant. */}
        {withTrack && (
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeOpacity={SPINNER_TRACK_OPACITY}
            fill="none"
          />
        )}
        {/* Spinning arc — a 90° segment of the circle. The rotation
            comes from the wrapper's `animate-spin` class, not from
            transforming the SVG itself. `strokeLinecap="round"` gives
            the soft, premium-looking ends. */}
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {/* Visually-hidden label for screen readers. Skipped entirely
          in decorative mode. */}
      {!isDecorative && (
        <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
          {label}
        </span>
      )}
    </span>
  );
});

Spinner.displayName = 'Spinner';
