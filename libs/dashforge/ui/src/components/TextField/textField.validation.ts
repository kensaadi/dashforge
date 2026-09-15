import type { DashFormBridge } from '@dashforge/ui-core';

/**
 * Resolved validation state for a field
 */
export interface ValidationState {
  error: boolean;
  helperText: React.ReactNode;
}

/**
 * Resolves error and helperText for a field based on:
 * - Explicit props for `error`: still take precedence (an author who sets
 *   `error` typically wants to force the visual regardless of validation)
 * - `helperText`: the gated validation message wins when present, and the
 *   explicit `helperText` acts as the fallback that fills the row when
 *   there is nothing to report. This lets a static hint like "Unique,
 *   uppercase" coexist with a required-field error message instead of
 *   silently hiding it.
 *
 * Error Display Gating:
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 *
 * See `libs/dashforge/README-BUG.md` § BUG 17 for the reason the
 * `helperText` precedence was inverted.
 */
export function resolveValidationState(
  name: string,
  bridge: DashFormBridge,
  explicitError: boolean | undefined,
  explicitHelperText: React.ReactNode | undefined
): ValidationState {
  // Get auto error from form validation
  const autoErr = bridge.getError(name) ?? null;

  // Get touched state and submit count for error gating
  const autoTouched = bridge.isTouched(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  // Gate error display: only show if field touched OR form submitted
  const allowAutoError = autoTouched || submitCount > 0;

  // `error` still lets an explicit prop force the visual.
  const error = explicitError ?? (Boolean(autoErr) && allowAutoError);

  // `helperText`: the validation message wins while it is showing; the
  // explicit prop is the fallback for the "no error" state. Inverting the
  // precedence here fixes BUG 17: previously a field with a constant hint
  // never surfaced its required-field error, because `??` short-circuited
  // on the explicit prop and never reached the auto message.
  const autoMessage = allowAutoError ? autoErr?.message : undefined;
  const helperText = autoMessage ?? explicitHelperText;

  return { error, helperText };
}
