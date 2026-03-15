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
 * - Explicit props (highest priority)
 * - Form validation state (gated by touched/submit)
 * - Error gating rules (Form Closure v1)
 *
 * Error Display Gating:
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam while typing before user interaction
 */
export function resolveValidationState(
  name: string,
  bridge: DashFormBridge,
  explicitError: boolean | undefined,
  explicitHelperText: React.ReactNode | undefined
): ValidationState {
  // Get auto error from form validation
  const autoErr = bridge.getError?.(name) ?? null;

  // Get touched state and submit count for error gating
  const autoTouched = bridge.isTouched?.(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  // Gate error display: only show if field touched OR form submitted
  const allowAutoError = autoTouched || submitCount > 0;

  // Compute resolved props with precedence:
  // 1. Explicit props override auto values (explicit wins)
  // 2. Auto values from form validation (gated by touched/submit)
  const error = explicitError ?? (Boolean(autoErr) && allowAutoError);
  const helperText =
    explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);

  return { error, helperText };
}
