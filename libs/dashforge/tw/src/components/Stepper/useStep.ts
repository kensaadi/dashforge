import { useContext } from 'react';
import { StepperContext } from './StepperContext.js';
import type { UseStepReturn } from './stepper.types.js';

/**
 * Access the Stepper state + navigation API from any component rendered
 * inside a `<Stepper>` tree.
 *
 * The canonical use is inside the current step's children — a "Next" /
 * "Back" footer, a review summary showing the visible sequence, or an
 * error-routing Alert that turns each entry in `errors` into a clickable
 * link that calls `goToStep(name)`.
 *
 * Throws (dev only) when called outside a Stepper. In production the
 * hook returns a null-safe stub so a stale reference doesn't crash the
 * app — but the consumer's navigation buttons will be no-ops. Fix the
 * placement.
 *
 * @throws Error in dev if used outside `<Stepper>`.
 *
 * @example Custom footer
 * ```tsx
 * function StepFooter() {
 *   const step = useStep();
 *   return (
 *     <Stack direction="row" justify="between">
 *       <Button variant="outline" onClick={step.goBack} disabled={step.isFirstStep}>
 *         Back
 *       </Button>
 *       <Button onClick={step.goNext} disabled={!step.canGoNext}>
 *         {step.isLastStep ? 'Confirm' : 'Next'}
 *       </Button>
 *     </Stack>
 *   );
 * }
 * ```
 *
 * @example Error routing on the review step
 * ```tsx
 * function ReviewErrors() {
 *   const { errors, goToStep } = useStep();
 *   if (errors.length === 0) return null;
 *   return (
 *     <Alert color="danger" title="Fix these issues before submitting">
 *       {errors.map((e) => (
 *         <Link key={e.step} onClick={() => goToStep(e.step)}>
 *           {e.label}
 *         </Link>
 *       ))}
 *     </Alert>
 *   );
 * }
 * ```
 */
export function useStep(): UseStepReturn {
  const ctx = useContext(StepperContext);
  if (ctx === null) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        '[@dashforge/tw] useStep() must be used inside a <Stepper>. ' +
          'The hook returns the current step context, which is only ' +
          'available to descendants of the Stepper root.',
      );
    }
    // Production fallback — a null-safe stub. Keeps the app running
    // even if a component ends up outside a Stepper by accident. The
    // buttons wired to `goNext` / `goBack` become no-ops, which is a
    // better failure mode than a hard crash.
    return {
      currentStep: '',
      currentStepIndex: -1,
      visibleSteps: [],
      visitedSteps: new Set<string>(),
      errors: [],
      goNext: async () => false,
      goBack: () => undefined,
      goToStep: () => undefined,
      reset: () => undefined,
      isFirstStep: true,
      isLastStep: true,
      canGoNext: false,
    };
  }
  return ctx;
}
