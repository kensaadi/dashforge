/**
 * Integration test for `FormEngineAdapter.notifyValueChange` (V3 P2).
 *
 * Proves that a hook or consumer that mutates engine state directly
 * (e.g. `useDashFieldArray` in V3) can trigger the reaction system
 * for the affected field name — WITHOUT going through
 * `syncValueToEngine` (which requires a registered scalar node).
 *
 * This is the wire that lets V3 `useDashFieldArray` fire reactions on
 * append / remove / move without breaking the existing input-driven
 * flow. If this notification path is missed, reactions watching array
 * roots stay silent on structural changes — reintroducing exactly the
 * silent-failure class the article documents for the multi-step
 * wizard fault-line.
 */
import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { render, act } from '@testing-library/react';
import { DashFormProvider } from '../../core/DashFormProvider';
import { useDashFormContext } from '../../core/useDashFormContext';
import type { ReactionDefinition } from '../reaction.types';

interface Values {
  users: unknown[];
}

/**
 * Helper component that grabs the adapter through the internal context
 * and hands it back to the test through a callback. Mirrors the pattern
 * used to access `rhf` in escape-hatch scenarios.
 */
function GrabAdapter({
  onReady,
}: {
  onReady: (notify: (name: string) => void) => void;
}) {
  const { adapter } = useDashFormContext<Values>();
  useEffect(() => {
    onReady((name) => adapter.notifyValueChange(name));
  }, [adapter, onReady]);
  return null;
}

describe('FormEngineAdapter.notifyValueChange (V3 P2 wiring)', () => {
  it('fires reactions watching a field name without touching engine nodes', async () => {
    const fired: string[] = [];

    const reactions: ReactionDefinition<Values>[] = [
      {
        id: 'observe-users',
        watch: ['users'],
        run: (ctx) => {
          // Record which field triggered the run — the array root.
          fired.push('reaction fired: users');
          // ctx.getValue works even though we've never registered a
          // scalar node at "users" — the reaction context reads from RHF.
          const usersValue = ctx.getValue<unknown[]>('users');
          fired.push(`length=${(usersValue ?? []).length}`);
        },
      },
    ];

    let notifyValueChange: ((name: string) => void) | null = null;

    render(
      <DashFormProvider<Values>
        defaultValues={{ users: [] }}
        reactions={reactions}
      >
        <GrabAdapter
          onReady={(notify) => {
            notifyValueChange = notify;
          }}
        />
      </DashFormProvider>
    );

    // Give the initial reaction evaluation (from provider mount) time to run.
    await act(async () => {
      await Promise.resolve();
    });

    // Baseline: initial evaluation from provider mount fires once.
    const baseline = fired.length;
    expect(baseline).toBeGreaterThan(0);

    // Now the P2 wire — programmatic notification.
    expect(notifyValueChange).not.toBeNull();
    await act(async () => {
      notifyValueChange!('users');
      await Promise.resolve();
    });

    // Reaction fired again in response to notifyValueChange.
    expect(fired.length).toBeGreaterThan(baseline);
    expect(fired[fired.length - 2]).toBe('reaction fired: users');
  });

  it('does NOT fire reactions watching a different field name', async () => {
    const firedOnA: string[] = [];
    const firedOnB: string[] = [];

    const reactions: ReactionDefinition<Values>[] = [
      { id: 'a', watch: ['users'], run: () => firedOnA.push('a') },
      { id: 'b', watch: ['addresses'], run: () => firedOnB.push('b') },
    ];

    let notifyValueChange: ((name: string) => void) | null = null;

    render(
      <DashFormProvider<Values>
        defaultValues={{ users: [] }}
        reactions={reactions}
      >
        <GrabAdapter
          onReady={(notify) => {
            notifyValueChange = notify;
          }}
        />
      </DashFormProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    const baselineA = firedOnA.length;
    const baselineB = firedOnB.length;

    await act(async () => {
      notifyValueChange!('users');
      await Promise.resolve();
    });

    // Only reaction 'a' fired again; 'b' is unchanged.
    expect(firedOnA.length).toBeGreaterThan(baselineA);
    expect(firedOnB.length).toBe(baselineB);
  });

  it('does not require a registered scalar node — notification is name-only', async () => {
    // The reaction watches a synthetic name that has NO scalar engine node
    // (no field is ever registered under that name). notifyValueChange
    // should still fire the reaction because it broadcasts by name, not
    // via engine.updateNode.
    const fired: string[] = [];
    const reactions: ReactionDefinition<Values>[] = [
      {
        id: 'watch-unregistered',
        watch: ['some.synthetic.name'],
        run: () => fired.push('ok'),
      },
    ];

    let notifyValueChange: ((name: string) => void) | null = null;
    render(
      <DashFormProvider<Values>
        defaultValues={{ users: [] }}
        reactions={reactions}
      >
        <GrabAdapter
          onReady={(notify) => {
            notifyValueChange = notify;
          }}
        />
      </DashFormProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    const baseline = fired.length;

    await act(async () => {
      notifyValueChange!('some.synthetic.name');
      await Promise.resolve();
    });

    expect(fired.length).toBeGreaterThan(baseline);
  });
});
