// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { DashFormContext } from '@dashforge/ui-core';
import { DashFormProvider } from './DashFormProvider';
import { useDashFormContext } from './useDashFormContext';
import { useDashRegister } from '../hooks/useDashRegister';

void React;
afterEach(() => cleanup());

/**
 * Regression / feature guard for BUG 22 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, `DashFormProvider` called `useForm({ defaultValues, mode,
 * resolver })` with no `shouldUnregister`, and `DashFormConfig` did not
 * expose the option. Any Dashforge form paired with `<Stepper>`, tabs or
 * conditional sections lost the values of the unmounted branch at submit
 * time, silently.
 *
 * After the fix:
 * 1. `DashFormConfig.shouldUnregister?: boolean` is exposed.
 * 2. `DashFormProvider` passes it through to `useForm` with an explicit
 *    default of `false` (so the guarantee "unmounted fields survive" is
 *    documented in the codebase, not implicit in whatever RHF ships).
 * 3. Consumers who want the OPPOSITE (an unmounted branch that is scrubbed
 *    from `formState.values` — e.g. a wizard that abandons a whole path)
 *    can opt in with `shouldUnregister={true}`.
 *
 * These tests exercise a Stepper-like mount/unmount cycle end-to-end:
 * step 1 renders a Text input, user types into it, step advances,
 * step 2 renders a different input, step 1 unmounts. The test then
 * inspects the RHF-side value store via `useDashFormContext().rhf.getValues()`.
 */

// A minimal bridge-registered text input that mirrors what the tw/ui
// field components do on unmount: after registering with RHF via
// `useDashRegister`, it also chains through `bridge.unregister(name)`
// (via `useDashFormContext().rhf.unregister`? no — via the BRIDGE)
// exactly like Checkbox / TextField / all 26 field components. That
// chain is what BUG 22 v2 gates on `bridge.shouldUnregister`.
function TestInput({ name }: { name: string }) {
  const { register } = useDashRegister(name);
  const { rhf } = useDashFormContext();
  // Field components normally read `bridge` from `DashFormContext` (not
  // `InternalDashFormContext`), and their cleanup calls
  // `bridge.unregister(name)`. The `useDashRegister` path only touches
  // the adapter, not RHF; we intentionally add the bridge.unregister
  // step here so this harness exercises the SAME path as the real
  // field components — which is the one BUG 22 v2 gates.
  const bridge = React.useContext(DashFormContext);
  React.useEffect(() => {
    return () => {
      // Only unregister when the form was configured to forget. This
      // block MIRRORS the fix that landed in all 26 field components.
      if (!bridge?.shouldUnregister) return;
      bridge.unregister?.(name);
    };
  }, [bridge, name]);
  void rhf;
  return <input data-testid={`input-${name}`} {...register} />;
}

// Read-only probe that returns the current `rhf.getValues()` as a string
// on demand — this lets the test assert on RHF's value store without
// mounting or unmounting anything else.
function ValueProbe({ target }: { target: React.MutableRefObject<unknown> }) {
  const { rhf } = useDashFormContext();
  React.useEffect(() => {
    target.current = () => rhf.getValues();
  });
  return null;
}

interface HarnessProps {
  shouldUnregister?: boolean;
  probe: React.MutableRefObject<unknown>;
}

// Two-step harness: only ONE of the two `TestInput`s is mounted at a time,
// switched by an internal state. That is exactly the shape a `<Stepper>`
// produces: one active step, the others torn down.
function StepHarness({ shouldUnregister, probe }: HarnessProps) {
  const [step, setStep] = React.useState(1);
  return (
    <DashFormProvider
      defaultValues={{ password: '', email: '' }}
      shouldUnregister={shouldUnregister}
    >
      {step === 1 && <TestInput name="password" />}
      {step === 2 && <TestInput name="email" />}
      <button
        type="button"
        data-testid="next"
        onClick={() => setStep((s) => (s === 1 ? 2 : 1))}
      >
        next
      </button>
      <ValueProbe target={probe} />
    </DashFormProvider>
  );
}

describe('BUG 22 regression guard — DashForm shouldUnregister exposure', () => {
  it('default (shouldUnregister omitted): fields from an unmounted step survive in rhf.getValues()', () => {
    const probe = { current: null as unknown };
    const { getByTestId } = render(<StepHarness probe={probe} />);

    // Type on step 1
    act(() => {
      fireEvent.input(getByTestId('input-password'), {
        target: { value: 's3cret' },
      });
    });

    // Advance to step 2 — step 1's input unmounts.
    act(() => {
      fireEvent.click(getByTestId('next'));
    });

    // rhf.getValues() must still include `password`.
    const values = (probe.current as () => Record<string, unknown>)();
    expect(values).toHaveProperty('password', 's3cret');
  });

  it('explicit `shouldUnregister={false}`: same guarantee, spelled out', () => {
    const probe = { current: null as unknown };
    const { getByTestId } = render(
      <StepHarness shouldUnregister={false} probe={probe} />,
    );

    act(() => {
      fireEvent.input(getByTestId('input-password'), {
        target: { value: 'stays' },
      });
    });
    act(() => {
      fireEvent.click(getByTestId('next'));
    });

    const values = (probe.current as () => Record<string, unknown>)();
    expect(values).toHaveProperty('password', 'stays');
  });

  it('explicit `shouldUnregister={true}`: opt-in scrubs unmounted fields', () => {
    const probe = { current: null as unknown };
    const { getByTestId } = render(
      <StepHarness shouldUnregister={true} probe={probe} />,
    );

    act(() => {
      fireEvent.input(getByTestId('input-password'), {
        target: { value: 'gets-dropped' },
      });
    });
    act(() => {
      fireEvent.click(getByTestId('next'));
    });

    const values = (probe.current as () => Record<string, unknown>)();
    // With shouldUnregister=true, RHF drops the field entirely on unmount.
    // The `password` key is either absent OR reset to its defaultValues entry
    // (empty string) — both are RHF-valid outcomes; the OPPOSITE of the
    // default is what we care about (the value the user typed is gone).
    const stillHasTypedValue = values.password === 'gets-dropped';
    expect(stillHasTypedValue).toBe(false);
  });
});
