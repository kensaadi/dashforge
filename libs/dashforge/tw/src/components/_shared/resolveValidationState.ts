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
 * **Renderer-agnostic.** Mirrors the MUI-side
 * `ui/src/components/TextField/textField.validation.ts`. Promoted to a
 * `_shared/` directory inside `@dashforge/tw` so all 14 bridge-managed
 * form components reuse the same precedence without depending on a
 * specific component folder.
 *
 * ⚠️ This file is a COPY, not an import. The two sides have to be kept
 * in step by hand, and once already were not: BUG 17 (2026-09-15)
 * inverted the `helperText` precedence on the MUI side only, and this
 * copy kept the broken order for ten days until BUG 32 caught it. The
 * verification that missed it was a grep for imports of the MUI file,
 * which by construction cannot reach a copy. **When you change the
 * precedence here, change it there too — and vice versa.**
 *
 * Precedence rules:
 *
 *  1. **`error`: the explicit prop wins.** An author who passes `error`
 *     is forcing the visual state, so it overrides the auto-gate.
 *  2. **`helperText`: the validation message wins while it is showing;
 *     the explicit prop is the fallback for the no-error state.** A
 *     constant hint ("Unique, uppercase") must not swallow the reason a
 *     required field was rejected — that leaves the user looking at a
 *     red field with no explanation. See README-BUG.md § BUG 17 / § BUG 32.
 *  3. **Auto values are gated by interaction.** The bridge's error is
 *     surfaced only when the field is `touched` OR the form has been
 *     submitted at least once (`submitCount > 0`). This prevents the
 *     "error spam while typing" anti-pattern.
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

  // `error` still lets an explicit prop force the visual state.
  const error = explicitError ?? (Boolean(autoErr) && allowAutoError);

  // BUG 32: the validation message wins over the explicit hint while it
  // is showing. The previous order (`explicitHelperText ?? autoMessage`)
  // short-circuited on the hint, so any field carrying one painted the
  // danger state and `aria-invalid="true"` while still rendering the
  // hint text — a red field with no stated reason. Identical inversion
  // to the one BUG 17 landed on the MUI side.
  const autoMessage = allowAutoError ? autoErr?.message : undefined;
  const helperText = autoMessage ?? explicitHelperText;

  return { error, helperText };
}
