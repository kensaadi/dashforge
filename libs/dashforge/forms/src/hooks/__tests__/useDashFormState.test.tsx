/**
 * Tests for `useDashFormState` + verification that `bridge.setValue`
 * now correctly propagates dirty/touched state (BUG 4 fix).
 *
 * Two concerns exercised in the same file because they answer the
 * same use case: a consumer that wants to gate a Save button on
 * `formState.isDirty`.
 *
 * Before the fix:
 * - `bridge.setValue` called `rhf.setValue(name, value)` without
 *   options, so `dirtyFields` never got populated and `isDirty` never
 *   flipped.
 * - Consumers reading `rhf.formState.isDirty` directly from a nested
 *   component (via `useDashFormContext().rhf`) got the current value
 *   but never re-rendered on change — RHF proxy scopes its
 *   subscription to `useForm`'s caller (the provider).
 *
 * After the fix:
 * - `bridge.setValue` passes `{ shouldDirty: true, shouldTouch: true }`
 *   so `dirtyFields[name]` and `touchedFields[name]` flip on every
 *   programmatic write.
 * - `useDashFormState({ control })` — via the new `useDashFormState`
 *   hook — subscribes the caller so form-level flags re-render the
 *   consumer.
 */
import { describe, it, expect } from 'vitest';
import { useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { render, act } from '@testing-library/react';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { DashFormProvider } from '../../core/DashFormProvider';
import { useDashFormState } from '../useDashFormState';
import { useDashFieldArray } from '../useDashFieldArray';

interface Values {
  email: string;
  age: number;
  items: { name: string }[];
}

/**
 * Helper: grabs the bridge from context and exposes it to the test
 * scope through a ref, so the test body can call `bridge.setValue`
 * without needing a real UI to click.
 */
function GrabBridge({
  onReady,
}: {
  onReady: (bridge: DashFormBridge) => void;
}) {
  const bridge = useContext(DashFormContext);
  useEffect(() => {
    if (bridge) onReady(bridge);
  }, [bridge, onReady]);
  return null;
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <DashFormProvider<Values>
    defaultValues={{ email: '', age: 0, items: [] }}
    mode="onChange"
  >
    {children}
  </DashFormProvider>
);

describe('BUG 4 fix — bridge.setValue marks dirty + touched', () => {
  it('populates formState.dirtyFields when writing via bridge.setValue', () => {
    let bridgeRef: DashFormBridge | null = null;
    let latestDirtyFields: Record<string, unknown> | null = null;

    function Observer() {
      const { dirtyFields } = useDashFormState<Values>();
      latestDirtyFields = dirtyFields as Record<string, unknown>;
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <GrabBridge onReady={(b) => { bridgeRef = b; }} />
            <Observer />
          </>
        ),
      })
    );

    // Baseline: no dirty fields
    expect(latestDirtyFields).toEqual({});

    // Write via bridge programmatically
    act(() => {
      bridgeRef!.setValue('email', 'a@b.c');
    });

    // Before fix: dirtyFields stayed {}. After fix: has `email: true`.
    expect(latestDirtyFields).toHaveProperty('email');
    expect(latestDirtyFields!.email).toBeTruthy();
  });

  it('populates formState.touchedFields when writing via bridge.setValue', () => {
    let bridgeRef: DashFormBridge | null = null;
    let latestTouched: Record<string, unknown> | null = null;

    function Observer() {
      const { touchedFields } = useDashFormState<Values>();
      latestTouched = touchedFields as Record<string, unknown>;
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <GrabBridge onReady={(b) => { bridgeRef = b; }} />
            <Observer />
          </>
        ),
      })
    );

    expect(latestTouched).toEqual({});

    act(() => {
      bridgeRef!.setValue('email', 'a@b.c');
    });

    expect(latestTouched).toHaveProperty('email');
    expect(latestTouched!.email).toBeTruthy();
  });

  it('formState.isDirty flips to true after any bridge.setValue write', () => {
    let bridgeRef: DashFormBridge | null = null;
    const isDirtyLog: boolean[] = [];

    function Observer() {
      const { isDirty } = useDashFormState<Values>();
      isDirtyLog.push(isDirty);
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <GrabBridge onReady={(b) => { bridgeRef = b; }} />
            <Observer />
          </>
        ),
      })
    );

    // First render: isDirty = false
    expect(isDirtyLog[0]).toBe(false);

    act(() => {
      bridgeRef!.setValue('email', 'a@b.c');
    });

    // After write, Observer re-renders and isDirty flipped
    expect(isDirtyLog[isDirtyLog.length - 1]).toBe(true);
  });
});

describe('useDashFieldArray — array mutations mark form dirty (BUG 4, replicated)', () => {
  it('append() marks the array root dirty', () => {
    let latestDirty: Record<string, unknown> | null = null;
    let appendFn: ((item: { name: string }) => void) | null = null;

    function ArrayReader() {
      const { append } = useDashFieldArray<{ name: string }>('items');
      appendFn = append;
      return null;
    }

    function Observer() {
      const { dirtyFields } = useDashFormState<Values>();
      latestDirty = dirtyFields as Record<string, unknown>;
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <ArrayReader />
            <Observer />
          </>
        ),
      })
    );

    expect(latestDirty).toEqual({});

    act(() => {
      appendFn!({ name: 'A' });
    });

    // `dirtyFields.items` becomes an array of item dirty flags (RHF
    // shape). Presence of the key is what we care about here — before
    // the fix it was completely absent.
    expect(latestDirty).toHaveProperty('items');
  });
});

describe('useDashFormState — subscription semantics', () => {
  it('re-renders the calling component when isDirty changes (proxy tracking works)', () => {
    let bridgeRef: DashFormBridge | null = null;
    const renderLog: number[] = [];

    function Observer() {
      // Access isDirty via the hook (subscribed) — should trigger
      // re-renders on change.
      const { isDirty } = useDashFormState<Values>();
      renderLog.push(isDirty ? 1 : 0);
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <GrabBridge onReady={(b) => { bridgeRef = b; }} />
            <Observer />
          </>
        ),
      })
    );

    const initialRenderCount = renderLog.length;
    expect(renderLog[0]).toBe(0);

    act(() => {
      bridgeRef!.setValue('email', 'new@example.com');
    });

    // Observer must have re-rendered post-mutation. Ideally at least
    // once more than the initial render.
    expect(renderLog.length).toBeGreaterThan(initialRenderCount);
    // And the latest isDirty is true.
    expect(renderLog[renderLog.length - 1]).toBe(1);
  });

  it('scoped to a single field name — re-renders only for that field', () => {
    let bridgeRef: DashFormBridge | null = null;
    const emailRenders = { count: 0, lastDirty: false };

    function EmailObserver() {
      // `name: 'email'` scopes the subscription so only email's own
      // dirty/touched/error changes trigger a re-render here.
      const { dirtyFields } = useDashFormState<Values>({ name: 'email' });
      emailRenders.count += 1;
      emailRenders.lastDirty = Boolean((dirtyFields as Record<string, unknown>).email);
      return null;
    }

    render(
      wrapper({
        children: (
          <>
            <GrabBridge onReady={(b) => { bridgeRef = b; }} />
            <EmailObserver />
          </>
        ),
      })
    );

    const baseline = emailRenders.count;

    // Write to a DIFFERENT field — email observer should be unaffected
    // (may still be re-invoked by React internals, but its computed
    // dirty for 'email' stays false).
    act(() => {
      bridgeRef!.setValue('age', 42);
    });
    expect(emailRenders.lastDirty).toBe(false);

    // Now write to email — observer sees the change.
    act(() => {
      bridgeRef!.setValue('email', 'x@y.z');
    });
    expect(emailRenders.lastDirty).toBe(true);
    expect(emailRenders.count).toBeGreaterThan(baseline);
  });

  it('throws when called outside DashFormProvider', () => {
    // Suppress React's error boundary warning noise for this test
    // by using a small try/catch pattern within the render.
    let caught: Error | null = null;
    function Consumer() {
      try {
        useDashFormState();
      } catch (err) {
        caught = err as Error;
      }
      return null;
    }
    render(<Consumer />);
    expect(caught).not.toBeNull();
    expect(caught!.message).toMatch(/DashFormProvider/);
  });
});
