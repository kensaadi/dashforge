// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { TextField } from './TextField';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 33 in libs/dashforge/README-BUG.md.
 *
 * `useEngineVisibility` (ui-core) used to call `useSnapshot` from inside
 * `if (engine) { ... }`, below an `if (!visibleWhen) return true` early
 * return. The hook count therefore depended on two ordinary inputs:
 *
 *   render 1: visibleWhen === undefined  -> 0 hook calls
 *   render 2: visibleWhen === predicate  -> 1 hook call   -> React throws
 *
 * `visibleWhen={flag ? predicate : undefined}` is the obvious way to write
 * an optional predicate, so this was reachable from ordinary consumer code.
 * Same defect class as BUG 16, one layer down: there the hook count followed
 * `options.length`, here it follows whether a prop is present.
 *
 * The fix hoisted the subscription to a single unconditional `useSnapshot`
 * call whose SUBJECT varies (engine nodes when there is something to watch,
 * a never-mutated module-level proxy otherwise), which keeps the set of
 * real subscriptions identical to what the conditional version had.
 *
 * Counterpart on the tw side: the same ui-core hook backs both renderers,
 * so one fix covers them; this suite is where the guard lives because
 * ui-core has no test target of its own.
 */

/** True if React logged a rules-of-hooks mismatch during the test. */
function sawHooksMismatch(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls.some((args) =>
    args.some(
      (a) =>
        typeof a === 'string' &&
        (a.includes('Rendered more hooks') ||
          a.includes('Rendered fewer hooks')),
    ),
  );
}

describe('BUG 33 regression guard — `visibleWhen` appearing and disappearing', () => {
  it('survives visibleWhen flipping undefined -> defined -> undefined while mounted', () => {
    const errSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    function Harness() {
      const [gated, setGated] = React.useState(false);
      return (
        <DashFormProvider defaultValues={{ email: '' }}>
          <TextField
            name="email"
            label="Email"
            visibleWhen={gated ? () => true : undefined}
          />
          <button
            type="button"
            data-testid="toggle"
            onClick={() => setGated((v) => !v)}
          >
            toggle
          </button>
        </DashFormProvider>
      );
    }

    const { getByTestId, queryAllByRole } = render(<Harness />);

    // No predicate: visible (nothing gates it).
    expect(queryAllByRole('textbox').length).toBe(1);

    // undefined -> predicate returning true. Still visible, but the hook
    // count inside useEngineVisibility changes. This is the crash.
    act(() => {
      fireEvent.click(getByTestId('toggle'));
    });
    expect(queryAllByRole('textbox').length).toBe(1);

    // predicate -> undefined again.
    act(() => {
      fireEvent.click(getByTestId('toggle'));
    });
    expect(queryAllByRole('textbox').length).toBe(1);

    expect(sawHooksMismatch(errSpy)).toBe(false);
    errSpy.mockRestore();
  });

  it('survives visibleWhen appearing while it evaluates to false', () => {
    const errSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    function Harness({ gated }: { gated: boolean }) {
      return (
        <DashFormProvider defaultValues={{ nickname: '' }}>
          <TextField
            name="nickname"
            label="Nickname"
            visibleWhen={gated ? () => false : undefined}
          />
        </DashFormProvider>
      );
    }

    const { rerender, queryAllByRole } = render(<Harness gated={false} />);
    expect(queryAllByRole('textbox').length).toBe(1);

    // Predicate appears and hides the field: unmount path plus a hook-count
    // change in the same render.
    act(() => rerender(<Harness gated={true} />));
    expect(queryAllByRole('textbox').length).toBe(0);

    act(() => rerender(<Harness gated={false} />));
    expect(queryAllByRole('textbox').length).toBe(1);

    expect(sawHooksMismatch(errSpy)).toBe(false);
    errSpy.mockRestore();
  });
});
