import { describe, it, expect } from 'vitest';
import { resolveValidationState } from './textField.validation';
import type { DashFormBridge } from '@dashforge/ui-core';

/**
 * Regression guard for BUG 17 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, the resolver was:
 *   const helperText = explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
 * So a constant `helperText="Unique, uppercase"` prop hid the required-field
 * error permanently, not just before touched/submit. These tests pin the
 * inverted precedence: the validation message wins while it is showing, and
 * the explicit prop is only the fallback for the "no error" state.
 *
 * The `error` boolean still lets an explicit prop force the visual, unchanged.
 */

function makeBridge(overrides: Partial<{
  err: { message: string } | null;
  touched: boolean;
  submitCount: number;
}>): DashFormBridge {
  const { err = null, touched = false, submitCount = 0 } = overrides;
  return {
    getError: () => err,
    isTouched: () => touched,
    submitCount,
    // The resolver never touches these, but the interface requires them.
    engine: {} as unknown as DashFormBridge['engine'],
    getValue: () => undefined,
    setValue: () => undefined,
    register: () => ({}) as never,
    unregister: () => undefined,
  } as unknown as DashFormBridge;
}

describe('resolveValidationState (BUG 17 regression guard)', () => {
  it('shows the validation message when the field is touched, even if an explicit hint is passed', () => {
    const bridge = makeBridge({
      err: { message: 'Required' },
      touched: true,
    });
    const state = resolveValidationState(
      'sku',
      bridge,
      undefined,
      'Unique, uppercase',
    );
    expect(state.error).toBe(true);
    expect(state.helperText).toBe('Required');
  });

  it('shows the validation message after submit, even if an explicit hint is passed', () => {
    const bridge = makeBridge({
      err: { message: 'Required' },
      touched: false,
      submitCount: 1,
    });
    const state = resolveValidationState(
      'sku',
      bridge,
      undefined,
      'Unique, uppercase',
    );
    expect(state.error).toBe(true);
    expect(state.helperText).toBe('Required');
  });

  it('falls back to the explicit hint when there is no error to show', () => {
    const bridge = makeBridge({ err: null, touched: true });
    const state = resolveValidationState(
      'sku',
      bridge,
      undefined,
      'Unique, uppercase',
    );
    expect(state.error).toBe(false);
    expect(state.helperText).toBe('Unique, uppercase');
  });

  it('falls back to the explicit hint while pristine (auto error gated)', () => {
    const bridge = makeBridge({
      err: { message: 'Required' },
      touched: false,
      submitCount: 0,
    });
    const state = resolveValidationState(
      'sku',
      bridge,
      undefined,
      'Unique, uppercase',
    );
    // Auto error is gated by touched/submit, so hint stays visible.
    expect(state.error).toBe(false);
    expect(state.helperText).toBe('Unique, uppercase');
  });

  it('lets an explicit `error` prop override the auto-error gate', () => {
    const bridge = makeBridge({ err: null, touched: false });
    const state = resolveValidationState('sku', bridge, true, 'Hint');
    expect(state.error).toBe(true);
    // No auto message present → falls back to explicit hint.
    expect(state.helperText).toBe('Hint');
  });

  it('returns undefined helperText when neither error nor explicit hint is set', () => {
    const bridge = makeBridge({ err: null, touched: false });
    const state = resolveValidationState('sku', bridge, undefined, undefined);
    expect(state.error).toBe(false);
    expect(state.helperText).toBeUndefined();
  });
});
