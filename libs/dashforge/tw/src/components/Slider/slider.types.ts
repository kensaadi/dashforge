import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { SliderVariants } from './slider.variants.js';

/**
 * The value shape a `<Slider>` accepts.
 *
 * - `number` — single-value mode (default). Common: volume, opacity,
 *   threshold, rating.
 * - `readonly [number, number]` — range mode (`range={true}`). Common:
 *   price range, min/max filter, time window.
 */
export type SliderValue = number | readonly [number, number];

/**
 * A tick on the track.
 *
 * @property value — the numeric position on the track (must be within
 *                   `[min, max]`).
 * @property label — optional display node under the tick. Passing
 *                   `undefined` renders only the tick, no text.
 */
export interface SliderMark {
  value: number;
  label?: ReactNode;
}

/**
 * Subset of `<Slider>` props theme-configurable via
 * `theme.components.Slider.defaults` (Option C).
 *
 * These are the visual axes a DS typically pins application-wide —
 * density, layout, color intent. `error` / `disabled` / `fullWidth`
 * are per-instance state axes, not visual identity.
 */
export type SliderVariantProps = Pick<
  SliderVariants,
  'size' | 'layout' | 'color' | 'fullWidth'
>;

/**
 * Per-slot override map. See {@link sliderVariants} for the full slot
 * roster.
 */
export interface SliderSlotProps {
  root?: { className?: string };
  label?: { className?: string };
  requiredMark?: { className?: string };
  controlWrapper?: { className?: string };
  track?: { className?: string };
  rangeSegment?: { className?: string };
  thumb?: { className?: string };
  mark?: { className?: string };
  markLabel?: { className?: string };
  valueLabel?: { className?: string };
  helperText?: { className?: string };
  errorText?: { className?: string };
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Slider?: {
      defaults?: Partial<SliderVariantProps>;
      slotProps?: SliderSlotProps;
    };
  }
}

// ─── Common (mode-agnostic) props ────────────────────────────────────
interface SliderCommonProps {
  // ─── Bridge integration ───────────────────────────────────────────
  /**
   * Field name. Required — matches every other tw form widget. Enforced
   * at the type level to prevent the "silent no-op" family of bugs
   * (see #113).
   */
  name: string;

  /**
   * RHF rules. Forwarded to `bridge.register(name, rules)` inside a
   * `<DashFormProvider>`. Ignored standalone.
   */
  rules?: unknown;

  // ─── Field layout / labelling ────────────────────────────────────
  /** Text or node above (or to the left in `inline` layout) the control. */
  label?: ReactNode;
  /** Descriptive line below the control. Replaced by the validation error message when the field is invalid. */
  helperText?: ReactNode;
  /** Force error state (danger colour on track + thumb, `aria-invalid` on the thumb). */
  error?: boolean;
  /** Renders the red `*` next to the label. */
  required?: boolean;
  /** Grays out the control; blocks drag + keyboard. */
  disabled?: boolean;
  /** Stretches the root to `w-full`. */
  fullWidth?: boolean;

  /**
   * Layout — `stacked` (label above) or `inline` (label left of the
   * control). Matches TextField / Select / Autocomplete.
   * @default 'stacked'
   */
  layout?: SliderVariants['layout'];

  /**
   * Density knob.
   * @default 'md'
   */
  size?: SliderVariants['size'];

  /**
   * Colour intent for the range segment + thumb + value label.
   * `neutral` auto-inverts via the preset CSS-var swap. Configurable
   * application-wide via `theme.components.Slider.defaults.color`.
   * @default 'primary'
   */
  color?: SliderVariants['color'];

  // ─── Visibility + RBAC ────────────────────────────────────────────
  /** Reactive visibility predicate. Falsy → renders null. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC gate — see `useAccessState`. */
  access?: AccessRequirement;

  // ─── Numeric range ────────────────────────────────────────────────
  /** Lower bound of the track. @default 0 */
  min?: number;
  /** Upper bound of the track. @default 100 */
  max?: number;
  /**
   * Step size between valid values. `keyboardStep` in Radix defaults
   * to this. Set to `1` for integers, `0.1` / `0.01` for fractional.
   * @default 1
   */
  step?: number;

  // ─── Marks ────────────────────────────────────────────────────────
  /**
   * Tick marks on the track.
   *
   * - `readonly SliderMark[]` — explicit marks with optional labels.
   * - `true` — auto-generate marks at every `step` position (only up to
   *   a reasonable density; skipped if the resulting count > 21).
   * - `false` / omitted — no marks.
   */
  marks?: readonly SliderMark[] | boolean;

  // ─── Value label ──────────────────────────────────────────────────
  /**
   * Show the current value as a tooltip above the thumb.
   *
   * - `'auto'` — visible on hover, drag, or keyboard focus.
   * - `'always'` — always visible.
   * - `'off'` — never rendered.
   *
   * @default 'off'
   */
  showValueLabel?: 'auto' | 'always' | 'off';

  /**
   * Format the display value in the value label tooltip and in the
   * marks' labels when `marks: true` auto-labelling kicks in.
   * @default (value) => String(value)
   */
  formatValue?: (value: number) => ReactNode;

  // ─── Commit strategy ─────────────────────────────────────────────
  /**
   * When true, writes to the form bridge on every drag tick instead of
   * only on drag-end. Costs 60 setValue/sec during drag but gives the
   * "value in form == value shown" semantic if the consumer's form
   * depends on the value reactively (e.g. price-range filter feeding a
   * live product list).
   *
   * Keyboard changes always commit immediately regardless of this
   * setting — each arrow-key press is a single tick + commit.
   *
   * @default false
   */
  commitOnChange?: boolean;

  // ─── Escape hatches ──────────────────────────────────────────────
  /**
   * Utility-class shortcut for `slotProps.controlWrapper.className` —
   * mirrors the Dashforge idiom on other primitives.
   */
  sx?: string;

  /** Per-slot overrides. */
  slotProps?: SliderSlotProps;

  /** `data-testid` on the root wrapper. */
  testId?: string;
}

// ─── Mode-narrowed prop shapes ───────────────────────────────────────

/**
 * Single-value mode — `range` omitted or `false`. `value` /
 * `defaultValue` are `number`; `onChange` / `onCommit` receive `number`.
 */
export interface SliderSingleProps extends SliderCommonProps {
  range?: false;
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /**
   * Fires on every drag tick + keyboard step. UI-side handler — does
   * NOT write to the bridge unless `commitOnChange` is true.
   */
  onChange?: (value: number) => void;
  /**
   * Fires on drag-end (pointer up) and on every keyboard step. This is
   * what writes to the form bridge — matches MUI / Ant defaults.
   */
  onCommit?: (value: number) => void;
  onBlur?: () => void;
}

/**
 * Range mode — `range={true}`. `value` / `defaultValue` are
 * `[number, number]`; `onChange` / `onCommit` receive the tuple.
 */
export interface SliderRangeProps extends SliderCommonProps {
  range: true;
  /** Controlled `[min, max]` tuple. */
  value?: readonly [number, number];
  /** Uncontrolled initial `[min, max]` tuple. */
  defaultValue?: readonly [number, number];
  /** UI-side per-tick callback. */
  onChange?: (value: readonly [number, number]) => void;
  /** Drag-end / keyboard-step callback. Writes to the bridge. */
  onCommit?: (value: readonly [number, number]) => void;
  onBlur?: () => void;
}

/**
 * Props for `<Slider>`.
 *
 * Discriminated on `range` — TypeScript narrows `value` / `onChange` /
 * `onCommit` to `number` (single) or `[number, number]` (range) based
 * on the runtime `range` prop.
 *
 * @example Single-value (volume slider)
 * ```tsx
 * <Slider name="volume" min={0} max={100} value={volume} onCommit={setVolume} />
 * ```
 *
 * @example Range (price filter)
 * ```tsx
 * <Slider
 *   name="priceRange"
 *   range
 *   min={0}
 *   max={1000}
 *   value={[100, 500]}
 *   onCommit={setPriceRange}
 * />
 * ```
 *
 * @example Marks with labels + custom formatter
 * ```tsx
 * <Slider
 *   name="brightness"
 *   min={0} max={100} step={25}
 *   marks={[
 *     { value: 0,   label: 'Off' },
 *     { value: 50,  label: 'Med' },
 *     { value: 100, label: 'Max' },
 *   ]}
 *   showValueLabel="auto"
 *   formatValue={(v) => `${v}%`}
 * />
 * ```
 */
export type SliderProps = SliderSingleProps | SliderRangeProps;
