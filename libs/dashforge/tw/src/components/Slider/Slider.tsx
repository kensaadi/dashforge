import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge, FieldRegistration } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { useStandaloneFieldWarning } from '../../hooks/useStandaloneFieldWarning.js';
import { resolveValidationState } from '../_shared/resolveValidationState.js';
import { sliderVariants } from './slider.variants.js';
import type {
  SliderMark,
  SliderProps,
  SliderSingleProps,
  SliderRangeProps,
} from './slider.types.js';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

/**
 * Convert an incoming `value` from the consumer-facing shape
 * (`number | [number, number]`) into the Radix internal shape
 * (`number[]`, always at least length 1).
 */
function toRadixValue(
  value: number | readonly [number, number] | undefined,
  range: boolean,
  min: number,
): number[] {
  if (range) {
    if (Array.isArray(value)) return [value[0], value[1]];
    return [min, min];
  }
  if (typeof value === 'number') return [value];
  return [min];
}

/** Reverse of `toRadixValue`. */
function fromRadixValue(
  value: number[],
  range: boolean,
): number | readonly [number, number] {
  if (range) return [value[0] ?? 0, value[1] ?? 0] as const;
  return value[0] ?? 0;
}

/**
 * Auto-generate marks at every `step` position between `min` and `max`.
 * Suppressed when the resulting count exceeds 21 (would visually cram
 * the track).
 */
function autoMarks(
  min: number,
  max: number,
  step: number,
  format: (v: number) => ReactNode,
): SliderMark[] {
  if (step <= 0) return [];
  const count = Math.floor((max - min) / step);
  if (count + 1 > 21) return [];
  const out: SliderMark[] = [];
  for (let i = 0; i <= count; i++) {
    const v = min + i * step;
    out.push({ value: v, label: format(v) });
  }
  return out;
}

/**
 * Compute the % offset of a given value on the track. Used for mark +
 * value-label positioning.
 */
function pctOf(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Dashforge TW `<Slider>` — token-driven numeric value picker.
 *
 * Single or range mode via `range?: boolean` discriminator. Bridge
 * integration mirrors TextField / Autocomplete / Select. Commit to the
 * form bridge on drag-end by default (`onValueCommit`); opt into
 * per-tick commits via `commitOnChange`. Keyboard changes always
 * commit immediately.
 *
 * See {@link SliderProps} for the full API surface.
 */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  rawProps,
  ref,
) {
  // Merge Option C theme defaults into the props union — cast through
  // `SliderProps` since the discriminated union types don't play well
  // with the spread merge.
  const themeDefaults = useComponentDefaults('Slider');
  const merged = { ...themeDefaults?.defaults, ...rawProps } as SliderProps;
  const themeSlotProps = themeDefaults?.slotProps;

  const {
    name,
    rules,
    label,
    helperText,
    error,
    required,
    disabled,
    fullWidth,
    layout,
    size,
    color,
    visibleWhen,
    access,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = DEFAULT_STEP,
    marks,
    showValueLabel = 'off',
    formatValue = (v: number) => String(v),
    commitOnChange = false,
    onBlur,
    sx,
    slotProps,
    testId,
  } = merged;

  const isRange = merged.range === true;
  const userValue = merged.value as number | readonly [number, number] | undefined;
  const defaultValue = merged.defaultValue as
    | number
    | readonly [number, number]
    | undefined;
  const userOnChange = merged.onChange as
    | ((value: number) => void)
    | ((value: readonly [number, number]) => void)
    | undefined;
  const userOnCommit = merged.onCommit as
    | ((value: number) => void)
    | ((value: readonly [number, number]) => void)
    | undefined;

  // ───── Hooks (unconditional, before early returns) ─────
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const fieldMeta = useDashFieldMeta(name);
  const accessState = useAccessState(access);

  const controlId = useId();
  const helperId = `${controlId}-help`;
  const isFormMode = Boolean(bridge?.register);

  useStandaloneFieldWarning('Slider', name, isFormMode, userValue, userOnCommit ?? userOnChange);

  // Bridge unregister on real unmount (StrictMode-safe).
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: cap, name: capName } = unregisterRef.current;
      queueMicrotask(() => {
        if (!isMountedRef.current) cap?.unregister?.(capName);
      });
    };
  }, []);

  // ───── Uncontrolled internal state (used outside bridge, no `value`) ─────
  const [internalValue, setInternalValue] = useState<
    number | readonly [number, number]
  >(() => {
    if (defaultValue !== undefined) return defaultValue;
    return isRange ? ([min, max] as const) : min;
  });

  // ───── Register + resolve value ─────
  let resolvedValue: number | readonly [number, number];
  let registration: FieldRegistration | null = null;
  let resolvedError = error;
  let resolvedHelperText: ReactNode = helperText;

  if (isFormMode && bridge) {
    registration = bridge.register(name, rules);
    const bridgeValue = (bridge.getValue(name) ?? fieldMeta?.value) as
      | number
      | readonly [number, number]
      | undefined;
    resolvedValue =
      userValue !== undefined
        ? userValue
        : bridgeValue !== undefined && bridgeValue !== null
          ? bridgeValue
          : isRange
            ? ([min, max] as const)
            : min;
    const validation = resolveValidationState(name, bridge, error, helperText);
    resolvedError = validation.error;
    resolvedHelperText = validation.helperText;
  } else {
    resolvedValue = userValue !== undefined ? userValue : internalValue;
  }

  const effectiveDisabled =
    Boolean(disabled) || accessState.disabled || accessState.readonly;

  // ───── Commit helpers ─────
  const writeToBridge = useCallback(
    (next: number | readonly [number, number]) => {
      if (isFormMode && bridge) {
        bridge.setValue?.(name, next);
        if (registration?.onChange) {
          void registration.onChange({
            target: { name, value: next },
            type: 'change',
          });
        }
      } else if (userValue === undefined) {
        setInternalValue(next);
      }
    },
    [bridge, isFormMode, name, registration, userValue],
  );

  // ───── Drag interaction state ─────
  const [dragValue, setDragValue] = useState<
    number | readonly [number, number] | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const pointerDownRef = useRef(false);

  // Radix `onValueChange` = every tick. We update local UI (dragValue),
  // and only commit to the bridge if `commitOnChange` is on.
  const handleRadixChange = useCallback(
    (radixValues: number[]) => {
      const next = fromRadixValue(radixValues, isRange);
      setDragValue(next);

      if (isRange) {
        (userOnChange as ((value: readonly [number, number]) => void) | undefined)?.(
          next as readonly [number, number],
        );
      } else {
        (userOnChange as ((value: number) => void) | undefined)?.(next as number);
      }

      if (commitOnChange) writeToBridge(next);
    },
    [commitOnChange, isRange, userOnChange, writeToBridge],
  );

  // Radix `onValueCommit` = drag-end + keyboard step. This is the
  // canonical commit path — writes to bridge + calls user's onCommit.
  const handleRadixCommit = useCallback(
    (radixValues: number[]) => {
      const next = fromRadixValue(radixValues, isRange);
      setDragValue(null);
      setIsDragging(false);
      pointerDownRef.current = false;

      // Only write to bridge if we didn't already do it via commitOnChange.
      if (!commitOnChange) writeToBridge(next);

      if (isRange) {
        (userOnCommit as ((value: readonly [number, number]) => void) | undefined)?.(
          next as readonly [number, number],
        );
      } else {
        (userOnCommit as ((value: number) => void) | undefined)?.(next as number);
      }
    },
    [commitOnChange, isRange, userOnCommit, writeToBridge],
  );

  const displayValue = dragValue !== null ? dragValue : resolvedValue;
  const displayValueArr: number[] = useMemo(
    () => toRadixValue(displayValue, isRange, min),
    [displayValue, isRange, min],
  );

  // ───── Marks resolution ─────
  const resolvedMarks: SliderMark[] = useMemo(() => {
    if (!marks) return [];
    if (Array.isArray(marks)) return marks.filter((m) => m.value >= min && m.value <= max);
    if (marks === true) return autoMarks(min, max, step, formatValue);
    return [];
  }, [formatValue, marks, max, min, step]);

  // Focus / blur handlers on the thumb — flip the value-label visibility.
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (onBlur) onBlur();
    if (isFormMode && registration?.onBlur) {
      void registration.onBlur({
        target: { name, value: resolvedValue },
        type: 'blur',
      });
    }
  }, [isFormMode, name, onBlur, registration, resolvedValue]);

  const handlePointerDown = useCallback(() => {
    pointerDownRef.current = true;
    setIsDragging(true);
  }, []);

  // ───── Early returns (after all hooks are declared) ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  // ───── Class computation ─────
  const v = sliderVariants({
    color,
    size,
    layout,
    error: Boolean(resolvedError),
    fullWidth,
    disabled: effectiveDisabled,
  });

  const rootClasses = cn(v.root(), themeSlotProps?.root?.className, slotProps?.root?.className);
  const labelClasses = cn(v.label(), themeSlotProps?.label?.className, slotProps?.label?.className);
  const requiredMarkClasses = cn(v.requiredMark(), themeSlotProps?.requiredMark?.className, slotProps?.requiredMark?.className);
  const controlWrapperClasses = cn(
    v.controlWrapper(),
    themeSlotProps?.controlWrapper?.className,
    slotProps?.controlWrapper?.className,
    sx,
  );
  const trackClasses = cn(v.track(), themeSlotProps?.track?.className, slotProps?.track?.className);
  const rangeSegmentClasses = cn(v.rangeSegment(), themeSlotProps?.rangeSegment?.className, slotProps?.rangeSegment?.className);
  const thumbClasses = cn(v.thumb(), themeSlotProps?.thumb?.className, slotProps?.thumb?.className);
  const markClasses = cn(v.mark(), themeSlotProps?.mark?.className, slotProps?.mark?.className);
  const markLabelClasses = cn(v.markLabel(), themeSlotProps?.markLabel?.className, slotProps?.markLabel?.className);
  const valueLabelClasses = cn(v.valueLabel(), themeSlotProps?.valueLabel?.className, slotProps?.valueLabel?.className);
  const helperTextClasses = cn(v.helperText(), themeSlotProps?.helperText?.className, slotProps?.helperText?.className);
  const errorTextClasses = cn(v.errorText(), themeSlotProps?.errorText?.className, slotProps?.errorText?.className);

  const hasError = Boolean(resolvedError);
  const showValueLabelResolved =
    showValueLabel === 'always' ||
    (showValueLabel === 'auto' && (isDragging || isFocused || isHovered));

  // Determine which values are "in range" (between the two thumbs in
  // range mode) so their mark colour flips to the light variant.
  const isValueInSelectedRange = (v: number): boolean => {
    if (isRange) {
      const [a, b] = displayValueArr;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return v > lo && v < hi;
    }
    return v <= displayValueArr[0]!;
  };

  return (
    <div className={rootClasses} data-testid={testId}>
      {label != null && (
        <label htmlFor={controlId} className={labelClasses}>
          {label}
          {required && <span className={requiredMarkClasses}>*</span>}
        </label>
      )}

      <div
        className={controlWrapperClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <RadixSlider.Root
          id={controlId}
          className="relative flex items-center w-full h-full"
          value={displayValueArr}
          onValueChange={handleRadixChange}
          onValueCommit={handleRadixCommit}
          min={min}
          max={max}
          step={step}
          disabled={effectiveDisabled}
          name={name}
          aria-invalid={hasError || undefined}
          aria-describedby={resolvedHelperText != null ? helperId : undefined}
          aria-required={required || undefined}
        >
          <RadixSlider.Track className={trackClasses}>
            <RadixSlider.Range className={rangeSegmentClasses} />
            {resolvedMarks.map((mark) => {
              const pct = pctOf(mark.value, min, max);
              const inRange = isValueInSelectedRange(mark.value);
              return (
                <span
                  key={`mark-${mark.value}`}
                  className={markClasses}
                  data-in-range={inRange ? 'true' : 'false'}
                  style={{ left: `${pct}%` }}
                  aria-hidden="true"
                />
              );
            })}
          </RadixSlider.Track>

          {/* Marks labels are siblings of Track so they can position at
              their exact % on a full-width absolute layer. */}
          {resolvedMarks.some((m) => m.label != null) && (
            <div className="absolute inset-x-0 top-full pointer-events-none">
              {resolvedMarks.map((mark) => {
                if (mark.label == null) return null;
                const pct = pctOf(mark.value, min, max);
                return (
                  <span
                    key={`marklabel-${mark.value}`}
                    className={markLabelClasses}
                    data-disabled={effectiveDisabled ? 'true' : 'false'}
                    style={{ left: `${pct}%` }}
                  >
                    {mark.label}
                  </span>
                );
              })}
            </div>
          )}

          {displayValueArr.map((thumbValue, idx) => (
            <RadixSlider.Thumb
              key={`thumb-${idx}`}
              className={thumbClasses}
              onPointerDown={handlePointerDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-invalid={hasError || undefined}
              aria-label={
                isRange
                  ? idx === 0
                    ? `${label ?? name} minimum`
                    : `${label ?? name} maximum`
                  : (label as string | undefined) ?? name
              }
            >
              {showValueLabelResolved && (
                <span
                  className={valueLabelClasses}
                  style={{ left: '50%', top: '-4px' }}
                  aria-hidden="true"
                >
                  {formatValue(thumbValue)}
                </span>
              )}
            </RadixSlider.Thumb>
          ))}
        </RadixSlider.Root>
      </div>

      {hasError && resolvedHelperText != null ? (
        <div id={helperId} className={errorTextClasses}>
          {resolvedHelperText}
        </div>
      ) : resolvedHelperText != null ? (
        <div id={helperId} className={helperTextClasses}>
          {resolvedHelperText}
        </div>
      ) : null}
    </div>
  );
});

Slider.displayName = 'Slider';

// Re-export the discriminated prop shapes for consumers who need to
// build wrapper components with explicit typing (Blueprint bindings,
// admin builders, etc.).
export type { SliderSingleProps, SliderRangeProps };
