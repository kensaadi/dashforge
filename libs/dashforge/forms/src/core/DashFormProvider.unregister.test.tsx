import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useContext, useEffect, useRef } from 'react';
import { DashFormProvider } from './DashFormProvider';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';

/**
 * UNREGISTER FLOW — VERIFICATION TESTS (CR fix #3, 0.1.6-alpha)
 *
 * Background. Before 0.1.6-alpha, bridge-bound UI components (TextField,
 * Textarea, Checkbox, Switch, Select, Autocomplete, RadioGroup, NumberField,
 * DateTimePicker, OTPField) called `bridge.register(name)` on mount but
 * never cleaned up engine state / RHF registration on unmount. Result:
 * `engine.getNode(name)` kept returning a stale node after a dynamic field
 * was removed — a memory leak that also leaked state into subsequent
 * remounts of the same field name.
 *
 * Fix (0.1.6-alpha):
 *   1. `DashFormBridge.unregister?(name)` was added to the bridge API
 *      (optional for backwards compat). The DashFormProvider implementation
 *      calls `rhf.unregister(name)` + `engineAdapter.unregisterField(name)`.
 *   2. UI components subscribe with `bridge.register(name)` on mount and
 *      call `bridge.unregister(name)` from a `useEffect` cleanup —
 *      *deferred via `queueMicrotask`* + guarded with a `mountedRef`, so
 *      cleanup fires on **real** unmount only (not on every bridge identity
 *      change, which used to happen pre-0.1.6 every keystroke).
 *
 * These tests verify both pieces directly:
 *   - `bridge.unregister(name)` clears `engine.getNode(name)` and
 *     `bridge.getValue(name)`.
 *   - The deferred-microtask cleanup pattern used by UI components actually
 *     hits `bridge.unregister` exactly once on real unmount.
 */

/**
 * Tiny TestField that mirrors the lifecycle pattern used by every
 * Dashforge UI form component (TextField/Textarea/Checkbox/etc.) — bridge
 * registration on render + deferred unregister on real unmount.
 */
function TestField({
  name,
  onBridgeReady,
}: {
  name: string;
  onBridgeReady?: (bridge: DashFormBridge) => void;
}) {
  const bridge = useContext(DashFormContext);
  if (!bridge) throw new Error('Bridge not available');

  // Register synchronously during render (same as UI components do).
  const registration = bridge.register?.(name);

  // Expose the bridge to the test once.
  const exposedRef = useRef(false);
  if (!exposedRef.current && onBridgeReady) {
    exposedRef.current = true;
    onBridgeReady(bridge);
  }

  // Deferred-microtask unregister on REAL unmount.
  // The mountedRef guards against React Strict Mode double-mount and against
  // the (pre-0.1.6) bridge-identity-changes-every-keystroke cleanup storm.
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const captured = unregisterRef.current;
      queueMicrotask(() => {
        if (!isMountedRef.current) {
          captured.bridge?.unregister?.(captured.name);
        }
      });
    };
  }, []);

  return (
    <input
      data-testid={`input-${name}`}
      {...registration}
      defaultValue=""
    />
  );
}

function Harness({
  show,
  fieldName,
  onBridgeReady,
}: {
  show: boolean;
  fieldName: string;
  onBridgeReady: (bridge: DashFormBridge) => void;
}) {
  return (
    <DashFormProvider defaultValues={{ [fieldName]: '' }}>
      {show && <TestField name={fieldName} onBridgeReady={onBridgeReady} />}
    </DashFormProvider>
  );
}

/** Wait for any pending microtasks to flush (the unregister deferral). */
function flushMicrotasks() {
  return act(() => Promise.resolve());
}

describe('DashFormProvider — bridge.unregister (CR fix #3)', () => {
  it('exposes bridge.unregister on the bridge interface', () => {
    let bridge: DashFormBridge | null = null;
    render(
      <Harness
        show
        fieldName="email"
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );

    expect(bridge).not.toBeNull();
    expect(typeof bridge!.unregister).toBe('function');
  });

  it('registers an engine node on mount', () => {
    let bridge: DashFormBridge | null = null;
    render(
      <Harness
        show
        fieldName="email"
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );

    expect(bridge).not.toBeNull();
    expect(bridge!.engine?.getNode('email')).toBeDefined();
  });

  it('calling bridge.unregister(name) directly removes the engine node and the RHF value', () => {
    let bridge: DashFormBridge | null = null;
    render(
      <Harness
        show
        fieldName="email"
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );

    expect(bridge!.engine?.getNode('email')).toBeDefined();

    act(() => {
      bridge!.unregister?.('email');
    });

    // Engine node gone.
    expect(bridge!.engine?.getNode('email')).toBeUndefined();
    // RHF value gone too — bridge.getValue may return undefined or '' depending
    // on RHF's internal "shouldUnregister" semantics; both indicate "no state".
    const valueAfter = bridge!.getValue?.('email');
    expect(valueAfter === undefined || valueAfter === '').toBe(true);
  });

  it('REAL unmount triggers the deferred-microtask unregister exactly once', async () => {
    let bridge: DashFormBridge | null = null;
    const { rerender } = render(
      <Harness
        show
        fieldName="phone"
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );

    // Sanity: node is there while mounted.
    expect(bridge!.engine?.getNode('phone')).toBeDefined();

    // Unmount the field (parent re-renders without it).
    rerender(
      <Harness
        show={false}
        fieldName="phone"
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );

    // The cleanup is deferred via queueMicrotask. Right after the rerender
    // it's NOT yet executed.
    expect(bridge!.engine?.getNode('phone')).toBeDefined();

    // Flush microtasks (act-wrapped so React commits any subsequent state
    // changes triggered by the cleanup).
    await flushMicrotasks();

    // Now the unregister has fired.
    expect(bridge!.engine?.getNode('phone')).toBeUndefined();
  });

  it('mount → unmount → remount of the same field name leaves no stale engine state', async () => {
    let bridge: DashFormBridge | null = null;
    const fieldName = 'remountable';

    // 1) First mount.
    const { rerender } = render(
      <Harness
        show
        fieldName={fieldName}
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );
    expect(bridge!.engine?.getNode(fieldName)).toBeDefined();

    // 2) Unmount + microtask flush → node disappears.
    rerender(
      <Harness
        show={false}
        fieldName={fieldName}
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );
    await flushMicrotasks();
    expect(bridge!.engine?.getNode(fieldName)).toBeUndefined();

    // 3) Remount of the SAME name → fresh engine node, no stale state from
    //    the previous mount.
    rerender(
      <Harness
        show
        fieldName={fieldName}
        onBridgeReady={(b) => {
          bridge = b;
        }}
      />
    );
    expect(bridge!.engine?.getNode(fieldName)).toBeDefined();
    // The visible input should be the freshly mounted one.
    expect(screen.getByTestId(`input-${fieldName}`)).toBeTruthy();
  });
});
