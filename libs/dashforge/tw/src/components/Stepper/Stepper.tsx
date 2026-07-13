import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { Step, __IS_STEP } from './Step.js';
import { StepperContext } from './StepperContext.js';
import { stepperVariants } from './stepper.variants.js';
import type {
  StepError,
  StepperProps,
  StepProps,
  StepState,
  UseStepReturn,
} from './stepper.types.js';

/**
 * Type-guard for `<Step>` children. Matches on the imported `Step`
 * function AND on the `__IS_STEP` symbol as a fallback for tree cloning
 * across module boundaries (rare in practice, robust when it happens).
 */
function isStepElement(
  child: ReactNode,
): child is ReactElement<StepProps> {
  if (!isValidElement(child)) return false;
  const type = child.type as unknown;
  if (type === Step) return true;
  if (typeof type === 'function' || typeof type === 'object') {
    const marker = (type as { [key: symbol]: boolean })[__IS_STEP];
    if (marker === true) return true;
  }
  return false;
}

/**
 * Flatten one level of fragments so consumers can conditionally render
 * groups of steps.
 */
function flattenChildren(children: ReactNode): ReactNode[] {
  const flat: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      const nested = (child.props as { children?: ReactNode }).children;
      flat.push(...flattenChildren(nested));
      return;
    }
    flat.push(child);
  });
  return flat;
}

/**
 * `<Stepper>` — declarative multi-step navigation with compound `<Step>`
 * children. The parent walks its children, extracts each `<Step>`'s
 * props, filters by `visibleWhen`, and drives the strip + content
 * rendering. Consumers reach the current step state + navigation API
 * via the `useStep()` hook.
 *
 * See {@link StepperProps} for the full API surface.
 */
export function Stepper(props: StepperProps) {
  const themeDefaults = useComponentDefaults('Stepper');
  const merged: StepperProps = { ...themeDefaults?.defaults, ...props };
  const {
    children,
    initialStep,
    allowJumpTo = 'visited',
    onComplete,
    onStepChange,
    onStepInvalid,
    color,
    size,
    orientation,
    labelPlacement,
    visibleWhen,
    access,
    sx,
    slotProps,
    testId,
  } = merged;

  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  // ───── Walk children → step configs + passthrough ─────
  // Non-<Step> children (e.g. a consumer's shared "Back / Next" footer
  // that reads `useStep()`) are preserved and rendered AFTER the
  // content panel, still inside the StepperContext.Provider so `useStep`
  // works. Only DOM-level content (`<div>`, plain strings) triggers the
  // dev-warn — those signal a misplaced JSX island that likely wanted
  // to live inside a step.
  const { stepDefs, passthrough } = useMemo(() => {
    const flat = flattenChildren(children);
    const defs: StepProps[] = [];
    const pass: ReactNode[] = [];
    let sawStrayDom = false;
    flat.forEach((child, i) => {
      if (child === null || child === undefined || child === false) return;
      if (isStepElement(child)) {
        defs.push(child.props);
        return;
      }
      // Element children (function/class components) are preserved as
      // passthrough — this is the useStep()-hook pattern. Non-element
      // children (strings, numbers, plain DOM elements) are considered
      // stray content and dev-warned.
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        (typeof child === 'object' &&
          child !== null &&
          'type' in child &&
          typeof child.type === 'string')
      ) {
        sawStrayDom = true;
        return;
      }
      pass.push(<Fragment key={`stepper-passthrough-${i}`}>{child}</Fragment>);
    });
    if (sawStrayDom && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console -- dev-only, guarded by NODE_ENV.
      console.warn(
        '[@dashforge/tw] <Stepper> received bare DOM children (text or ' +
          'intrinsic elements like <div>). Only <Step> configs and ' +
          'component children (e.g. a footer reading useStep()) are ' +
          'recognized; stray DOM was ignored.',
      );
    }
    return { stepDefs: defs, passthrough: pass };
  }, [children]);

  // ───── Reactive visibleWhen filtering ─────
  // We deliberately recompute on every render — the closure can freely
  // capture local state; React's render cascade guarantees fresh reads.
  const visibleSteps = useMemo(() => {
    return stepDefs.filter((step) => {
      if (!step.visibleWhen) return true;
      try {
        // The engine argument is only defined inside a DashForm. Outside
        // a form, the predicate still runs — closures over external
        // state (e.g. component-local `useState`) work by design.
        return step.visibleWhen(bridge?.engine as never);
      } catch {
        return true;
      }
    });
  }, [stepDefs, bridge?.engine]);

  const visibleStepNames = useMemo(
    () => visibleSteps.map((s) => s.name),
    [visibleSteps],
  );

  // ───── State ─────
  const resolveInitial = useCallback((): string => {
    if (initialStep && visibleStepNames.includes(initialStep)) {
      return initialStep;
    }
    if (initialStep && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console -- dev-only warning.
      console.warn(
        `[@dashforge/tw] <Stepper initialStep="${initialStep}"> did not ` +
          `match any visible step. Falling back to the first visible step.`,
      );
    }
    return visibleStepNames[0] ?? '';
  }, [initialStep, visibleStepNames]);

  const [currentStep, setCurrentStep] = useState<string>(() => resolveInitial());
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(() => {
    // Pre-mark every step before `initialStep` as visited so
    // `allowJumpTo="visited"` doesn't lock the user out of resuming.
    const initial = resolveInitial();
    const idx = visibleStepNames.indexOf(initial);
    const prefix = idx >= 0 ? visibleStepNames.slice(0, idx + 1) : [initial];
    return new Set(prefix);
  });
  const [errors, setErrors] = useState<StepError[]>([]);

  // Handle current step disappearing (e.g. its `visibleWhen` flipped to
  // false while the user was on it). Snap to the nearest previous
  // visible step, or the first if none exists.
  useEffect(() => {
    if (currentStep && visibleStepNames.includes(currentStep)) return;
    if (visibleStepNames.length === 0) {
      setCurrentStep('');
      return;
    }
    setCurrentStep(visibleStepNames[0]);
  }, [currentStep, visibleStepNames]);

  const currentStepIndex = visibleStepNames.indexOf(currentStep);
  const currentStepDef = currentStepIndex >= 0 ? visibleSteps[currentStepIndex] : null;
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep =
    currentStepIndex >= 0 && currentStepIndex === visibleSteps.length - 1;

  // Refs for the async transition path to always see the freshest state.
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // ───── canGoNext (sync readout) ─────
  const canGoNext = useMemo(() => {
    if (!currentStepDef) return false;
    if (!currentStepDef.fields || currentStepDef.fields.length === 0) return true;
    if (!bridge?.getError) return true;
    return currentStepDef.fields.every((field) => bridge.getError(field) === null);
  }, [currentStepDef, bridge]);

  // ───── Transitions ─────
  const clearErrorFor = useCallback((name: string) => {
    setErrors((prev) => prev.filter((e) => e.step !== name));
  }, []);

  const goNext = useCallback(async (): Promise<boolean> => {
    const step = currentStepDef;
    if (!step) return false;
    const idx = visibleStepNames.indexOf(currentStepRef.current);

    // 1. `fields` validation via bridge.trigger.
    if (step.fields && step.fields.length > 0) {
      if (bridge?.trigger) {
        const ok = await bridge.trigger(step.fields);
        if (!ok) {
          // Collect the RHF error dictionary from the bridge for the
          // failed fields. `getError` is present on every bridge impl.
          const errorMap: Record<string, unknown> = {};
          step.fields.forEach((f) => {
            const err = bridge.getError?.(f);
            if (err) errorMap[f] = err;
          });
          setErrors((prev) => [
            ...prev.filter((e) => e.step !== step.name),
            {
              step: step.name,
              label: step.label,
              reason: 'fields',
              errors: errorMap,
            },
          ]);
          onStepInvalid?.({
            step: step.name,
            index: idx,
            reason: 'fields',
            errors: errorMap,
          });
          return false;
        }
      } else if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console -- dev-only guard.
        console.warn(
          `[@dashforge/tw] <Step name="${step.name}" fields={[...]}> was ` +
            `used outside a <DashForm> (or with a bridge that does not ` +
            `implement trigger). The fields validation is skipped.`,
        );
      }
    }

    // 2. `isValid` custom callback (AND semantics with `fields`).
    if (step.isValid) {
      const ok = await step.isValid();
      if (!ok) {
        setErrors((prev) => [
          ...prev.filter((e) => e.step !== step.name),
          {
            step: step.name,
            label: step.label,
            reason: 'isValid',
            errors: null,
          },
        ]);
        onStepInvalid?.({
          step: step.name,
          index: idx,
          reason: 'isValid',
          errors: null,
        });
        return false;
      }
    }

    // Both gates passed — clear this step's stale error entry, if any.
    clearErrorFor(step.name);

    // 3. Advance (or complete).
    if (idx >= 0 && idx < visibleStepNames.length - 1) {
      const next = visibleStepNames[idx + 1];
      setCurrentStep(next);
      setVisitedSteps((prev) => new Set([...prev, next]));
      onStepChange?.(step.name, next, 'next');
      return true;
    }
    // Past the last step — fire onComplete.
    onComplete?.();
    return true;
  }, [
    bridge,
    clearErrorFor,
    currentStepDef,
    onComplete,
    onStepChange,
    onStepInvalid,
    visibleStepNames,
  ]);

  const goBack = useCallback(() => {
    const idx = visibleStepNames.indexOf(currentStepRef.current);
    if (idx <= 0) return;
    const prev = visibleStepNames[idx - 1];
    setCurrentStep(prev);
    onStepChange?.(currentStepRef.current, prev, 'back');
  }, [onStepChange, visibleStepNames]);

  const goToStep = useCallback(
    (name: string) => {
      if (!visibleStepNames.includes(name)) return;
      if (allowJumpTo === 'none') return;
      if (allowJumpTo === 'visited' && !visitedSteps.has(name)) return;
      const from = currentStepRef.current;
      if (from === name) return;
      setCurrentStep(name);
      onStepChange?.(from, name, 'jump');
    },
    [allowJumpTo, onStepChange, visibleStepNames, visitedSteps],
  );

  const reset = useCallback(() => {
    const initial = resolveInitial();
    setCurrentStep(initial);
    const idx = visibleStepNames.indexOf(initial);
    const prefix = idx >= 0 ? visibleStepNames.slice(0, idx + 1) : [initial];
    setVisitedSteps(new Set(prefix));
    setErrors([]);
  }, [resolveInitial, visibleStepNames]);

  // ───── Context value ─────
  const contextValue = useMemo<UseStepReturn>(
    () => ({
      currentStep,
      currentStepIndex,
      visibleSteps: visibleSteps.map((s) => ({ name: s.name, label: s.label })),
      visitedSteps,
      errors,
      goNext,
      goBack,
      goToStep,
      reset,
      isFirstStep,
      isLastStep,
      canGoNext,
    }),
    [
      canGoNext,
      currentStep,
      currentStepIndex,
      errors,
      goBack,
      goNext,
      goToStep,
      isFirstStep,
      isLastStep,
      reset,
      visibleSteps,
      visitedSteps,
    ],
  );

  // ───── Render ─────
  if (!isVisible) return null;
  if (!accessState.visible) return null;

  const v = stepperVariants({
    color,
    size,
    orientation,
    labelPlacement,
  });

  const rootClasses = cn(v.root(), sx, slotProps?.root?.className);
  const stripClasses = cn(v.strip(), slotProps?.strip?.className);
  const contentClasses = cn(v.content(), slotProps?.content?.className);

  return (
    <StepperContext.Provider value={contextValue}>
      <div className={rootClasses} data-testid={testId}>
        <div className={stripClasses} role="list">
          {visibleSteps.map((step, index) => {
            const state = resolveStepState({
              step: step.name,
              index,
              currentIndex: currentStepIndex,
              errors,
            });
            const isClickable =
              allowJumpTo === 'visited' && visitedSteps.has(step.name);
            const stepClass = cn(
              v.step(),
              'group/step',
              isClickable && 'cursor-pointer',
              slotProps?.step?.className,
            );
            const indicatorClass = cn(
              v.indicator(),
              slotProps?.indicator?.className,
            );
            const labelGroupClass = cn(
              v.labelGroup(),
              slotProps?.labelGroup?.className,
            );
            const labelClass = cn(v.label(), slotProps?.label?.className);
            const helperClass = cn(
              v.helperText(),
              slotProps?.helperText?.className,
            );
            const optionalClass = cn(
              v.optionalTag(),
              slotProps?.optionalTag?.className,
            );

            return (
              <Fragment key={step.name}>
                <div
                  role="listitem"
                  className={stepClass}
                  data-state={state}
                  data-current={index === currentStepIndex || undefined}
                  data-name={step.name}
                  onClick={isClickable ? () => goToStep(step.name) : undefined}
                >
                  <span
                    className={indicatorClass}
                    data-state={state}
                    aria-label={`Step ${index + 1}: ${
                      typeof step.label === 'string' ? step.label : step.name
                    }`}
                  >
                    <IndicatorContent
                      index={index}
                      state={state}
                      icon={step.icon}
                    />
                  </span>
                  <span className={labelGroupClass}>
                    <span className={labelClass}>{step.label}</span>
                    {step.helperText ? (
                      <span className={helperClass}>{step.helperText}</span>
                    ) : null}
                    {step.optional ? (
                      <span className={optionalClass}>
                        {step.optional === true ? 'Optional' : step.optional}
                      </span>
                    ) : null}
                  </span>
                </div>
                {index < visibleSteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      v.connector(),
                      slotProps?.connector?.className,
                    )}
                    data-completed={index < currentStepIndex || undefined}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </div>
        <div className={contentClasses}>{currentStepDef?.children ?? null}</div>
        {passthrough}
      </div>
    </StepperContext.Provider>
  );
}

Stepper.displayName = 'Stepper';

/**
 * Derive a step's rendered state from its position + the error set.
 */
function resolveStepState({
  step,
  index,
  currentIndex,
  errors,
}: {
  step: string;
  index: number;
  currentIndex: number;
  errors: StepError[];
}): StepState {
  if (errors.some((e) => e.step === step)) return 'invalid';
  if (index === currentIndex) return 'current';
  if (index < currentIndex) return 'completed';
  return 'pending';
}

/**
 * Render the content of the indicator dot based on state + icon override.
 * Completed → check, invalid → alert-triangle, current/pending → icon
 * (if any) OR the step number.
 */
function IndicatorContent({
  index,
  state,
  icon,
}: {
  index: number;
  state: StepState;
  icon?: ReactNode;
}) {
  if (state === 'completed') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 8.5l3 3 6-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === 'invalid') {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 2L14 13H2L8 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.5v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.25" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  if (icon) return <>{icon}</>;
  return <>{index + 1}</>;
}
