import { createContext } from 'react';
import type { UseStepReturn } from './stepper.types.js';

/**
 * Internal context wired by `<Stepper>` and read by `useStep()`. Not
 * exported from the package — consumers reach the state only via the
 * `useStep()` hook.
 */
export const StepperContext = createContext<UseStepReturn | null>(null);

if (process.env.NODE_ENV !== 'production') {
  StepperContext.displayName = 'StepperContext';
}
