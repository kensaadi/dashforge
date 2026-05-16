import type { ReactNode } from 'react';
import type { DashFormBridge } from '@dashforge/ui-core';

/**
 * Resolved validation state for a bridge-managed field.
 *
 * Returned by `resolveValidationState`, this is consumed by all form
 * components that surface error + helper text (TextField, Checkbox,
 * Switch, …) to derive their final render state.
 */
export interface ValidationState {
  error: boolean;
  helperText: ReactNode;
}

/**
 * Compute `error` + `helperText` for a bridge-managed field.
 *
 * **Renderer-agnostic** — copy of the MUI-side
 * `textField.validation.ts`. Promoted to a `_shared/` directory inside
 * `@dashforge/tw` so all form components (TextField + Checkbox +
 * Switch) reuse the same precedence logic without depending on a
 * specific component folder.
 *
 * Precedence rules (matches MUI side byte-for-byte):
 *
 *  1. **Explicit props win.** If the user passed `error` / `helperText`
 *     explicitly, those values are used as-is.
 *  2. **Auto values are gated by interaction.** The bridge's error is
 *     surfaced only when the field is `touched` OR the form has been
 *     submitted at least once (`submitCount > 0`). This prevents the
 *     "error spam while typing" anti-pattern.
 *  3. **`error === false` explicitly clears the bridge's error message
 *     text.** Useful for forcing a "valid" visual state regardless of
 *     bridge state.
 *
 * @param name         field name registered with the bridge
 * @param bridge       active `DashFormBridge` (guaranteed non-null at
 *                     call sites by the surrounding `if (bridge)`)
 * @param explicitError    `error` prop from the consumer
 * @param explicitHelperText `helperText` prop from the consumer
 */
export function resolveValidationState(
  name: string,
  bridge: DashFormBridge,
  explicitError: boolean | undefined,
  explicitHelperText: ReactNode | undefined
): ValidationState {
  const autoErr = bridge.getError(name) ?? null;
  const autoTouched = bridge.isTouched(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  const allowAutoError = autoTouched || submitCount > 0;

  const error = explicitError ?? (Boolean(autoErr) && allowAutoError);
  const helperText =
    explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);

  return { error, helperText };
}
