import { describe, it, expect } from 'vitest';
import { resolveValidationState } from './resolveValidationState.js';
import type { DashFormBridge } from '@dashforge/ui-core';

/**
 * Regression guard for BUG 32 in libs/dashforge/README-BUG.md.
 *
 * BUG 17 (2026-09-15) inverted the `helperText` precedence so a
 * constant hint stops swallowing the validation message. That fix
 * landed on the MUI side only. `@dashforge/tw` carries its OWN copy of
 * the resolver — this file — and it kept the broken order for ten days,
 * because the BUG 17 verification was a grep for imports of the MUI
 * file and a copy is unreachable that way.
 *
 * The broken shape produced a field that painted the danger state and
 * set `aria-invalid="true"` while still rendering the hint text: a red
 * field with no stated reason. Fourteen bridge-managed components in
 * this package route through here, so the single line was worth
 * fourteen components.
 *
 * ⚠️ The MUI side has an equivalent suite at
 * `ui/src/components/TextField/textField.validation.test.ts`. The two
 * resolvers are copies kept in step by hand — when the precedence
 * changes on one side, both this file and that one must move together.
 */

function bridgeWith(opts: {
  err?: { message: string } | null;
  touched?: boolean;
  submitCount?: number;
}): DashFormBridge {
  const { err = null, touched = false, submitCount = 0 } = opts;
  return {
    getError: () => err,
    isTouched: () => touched,
    submitCount,
  } as unknown as DashFormBridge;
}

describe('resolveValidationState (tw) — BUG 32 regression guard', () => {
  it('the validation message wins over an explicit hint once the field is touched', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: { message: 'Required' }, touched: true }),
      undefined,
      'Unique, uppercase',
    );
    expect(s.error).toBe(true);
    expect(s.helperText).toBe('Required');
  });

  it('the validation message wins after submit, even if the field was never touched', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: { message: 'Required' }, submitCount: 1 }),
      undefined,
      'Unique, uppercase',
    );
    expect(s.error).toBe(true);
    expect(s.helperText).toBe('Required');
  });

  it('falls back to the explicit hint when there is no error to show', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: null, touched: true }),
      undefined,
      'Unique, uppercase',
    );
    expect(s.error).toBe(false);
    expect(s.helperText).toBe('Unique, uppercase');
  });

  it('falls back to the explicit hint while pristine (auto error still gated)', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: { message: 'Required' }, touched: false, submitCount: 0 }),
      undefined,
      'Unique, uppercase',
    );
    expect(s.error).toBe(false);
    expect(s.helperText).toBe('Unique, uppercase');
  });

  it('surfaces the message with no hint passed (the path that always worked)', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: { message: 'Required' }, touched: true }),
      undefined,
      undefined,
    );
    expect(s.error).toBe(true);
    expect(s.helperText).toBe('Required');
  });

  it('an explicit `error` prop still forces the visual state', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: null, touched: false }),
      true,
      'Hint',
    );
    expect(s.error).toBe(true);
    // No auto message to show, so the hint fills the row.
    expect(s.helperText).toBe('Hint');
  });

  it('returns undefined helperText when neither an error nor a hint is present', () => {
    const s = resolveValidationState(
      'sku',
      bridgeWith({ err: null }),
      undefined,
      undefined,
    );
    expect(s.error).toBe(false);
    expect(s.helperText).toBeUndefined();
  });
});
