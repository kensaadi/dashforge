// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { RadioGroup } from './RadioGroup';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 16 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, `RadioGroup` called `useEngineVisibility` and RBAC access
 * hooks, then `return null` at the top of render when the predicate was
 * false, and only THEN mapped `options` calling `useAccessState` per option.
 * When the predicate flipped, React saw a different hook count and threw
 * "Rendered more hooks than during the previous render", unmounting the
 * whole tree.
 *
 * The fix moved every hook call above every early return and consolidated
 * `options.map(useAccessState)` into a single `useAccessStates` call that
 * accepts an array. These tests pin both properties:
 *
 * 1. Flipping `visibleWhen` FROM the render tree (real state change, not a
 *    prop-change that never reaches the engine) does NOT throw and does
 *    NOT log a "Rendered fewer/more hooks" React console.error.
 * 2. Changing `options.length` while the RadioGroup stays mounted does NOT
 *    throw either (that is what the `useAccessStates` consolidation
 *    protects against on its own).
 */

describe('BUG 16 regression guard — RadioGroup `visibleWhen` flip', () => {
  it('does not throw and logs no hooks-mismatch when `visibleWhen` actually flips across renders', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];

    // The closure captures React state, so a state change flips the value
    // the predicate returns — this is what the engine-driven original
    // (`() => engine.getNode('flag')?.value`) would look like at runtime,
    // reduced to what we can control from a test.
    function Harness() {
      const [show, setShow] = React.useState(true);
      return (
        <DashFormProvider defaultValues={{ color: 'a' }}>
          <RadioGroup
            name="color"
            options={opts}
            visibleWhen={() => show}
            data-testid="rg"
          />
          <button
            type="button"
            data-testid="toggle"
            onClick={() => setShow((v) => !v)}
          >
            toggle
          </button>
        </DashFormProvider>
      );
    }

    const { getByTestId, queryAllByRole } = render(<Harness />);

    // Initial render: predicate true → RadioGroup visible → radios present.
    expect(queryAllByRole('radio').length).toBe(2);

    // Flip 1: true → false. RadioGroup returns null; radios gone.
    act(() => {
      fireEvent.click(getByTestId('toggle'));
    });
    expect(queryAllByRole('radio').length).toBe(0);

    // Flip 2: false → true. RadioGroup remounts; radios back.
    act(() => {
      fireEvent.click(getByTestId('toggle'));
    });
    expect(queryAllByRole('radio').length).toBe(2);

    // Flip 3: true → false. Final.
    act(() => {
      fireEvent.click(getByTestId('toggle'));
    });
    expect(queryAllByRole('radio').length).toBe(0);

    // React 19 surfaces the rules-of-hooks violation as a console.error
    // before it throws. Any hooks-mismatch message counts.
    const hooksMismatch = errSpy.mock.calls.some((args) =>
      args.some(
        (a) =>
          typeof a === 'string' &&
          (a.includes('Rendered more hooks') ||
            a.includes('Rendered fewer hooks')),
      ),
    );
    expect(hooksMismatch).toBe(false);
    errSpy.mockRestore();
  });

  it('does not throw when `options.length` changes across renders', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function Harness({ count }: { count: number }) {
      const opts = Array.from({ length: count }, (_, i) => ({
        value: `v${i}`,
        label: `V${i}`,
      }));
      return (
        <DashFormProvider defaultValues={{ pick: '' }}>
          <RadioGroup name="pick" options={opts} />
        </DashFormProvider>
      );
    }

    const { rerender, queryAllByRole } = render(<Harness count={2} />);
    expect(queryAllByRole('radio').length).toBe(2);
    act(() => rerender(<Harness count={5} />));
    expect(queryAllByRole('radio').length).toBe(5);
    act(() => rerender(<Harness count={1} />));
    expect(queryAllByRole('radio').length).toBe(1);
    act(() => rerender(<Harness count={7} />));
    expect(queryAllByRole('radio').length).toBe(7);

    const hooksMismatch = errSpy.mock.calls.some((args) =>
      args.some(
        (a) =>
          typeof a === 'string' &&
          (a.includes('Rendered more hooks') ||
            a.includes('Rendered fewer hooks')),
      ),
    );
    expect(hooksMismatch).toBe(false);
    errSpy.mockRestore();
  });
});
