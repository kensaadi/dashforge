/**
 * Multi-mount consistency tests for `useDashFieldArray` (V3).
 *
 * These tests are the load-bearing evidence that V3 fixes the
 * multi-step-wizard fault-line documented at
 * `/fault-lines/usefieldarray-multi-step-wizards` — namely, that
 * RHF's per-hook `useFieldArray` maintains a separate internal state
 * per instance, so two of them pointed at the same name do not
 * observe each other and mount / unmount cycles lose state.
 *
 * V3 moves array identity to the engine (`ArrayNode`), so every
 * `useDashFieldArray('items')` call reads the same engine array
 * node's ordered ids regardless of which component or step
 * instantiated the hook.
 *
 * Assertions here would FAIL against V1 (RHF-wrapper) and PASS
 * against V3 (engine-owned).
 */
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { render, screen, act } from '@testing-library/react';
import { DashFormProvider } from '../../core/DashFormProvider';
import { useDashFieldArray } from '../useDashFieldArray';

interface Item {
  name: string;
}

interface Values {
  items: Item[];
}

/**
 * Test rig — a simulated wizard that toggles between "Step A" and
 * "Step B", each of which mounts its own `useDashFieldArray('items')`
 * on the same array root.
 */
function Wizard({
  onFieldsRendered,
  onAppend,
}: {
  onFieldsRendered: (step: 'A' | 'B', fieldIds: string[]) => void;
  onAppend: (fn: (item: Item) => void) => void;
}) {
  const [step, setStep] = useState<'A' | 'B'>('A');

  return (
    <>
      <button type="button" onClick={() => setStep(step === 'A' ? 'B' : 'A')}>
        toggle
      </button>
      {step === 'A' && (
        <StepA onFieldsRendered={onFieldsRendered} onAppend={onAppend} />
      )}
      {step === 'B' && (
        <StepB onFieldsRendered={onFieldsRendered} onAppend={onAppend} />
      )}
    </>
  );
}

function StepA({
  onFieldsRendered,
  onAppend,
}: {
  onFieldsRendered: (step: 'A' | 'B', fieldIds: string[]) => void;
  onAppend: (fn: (item: Item) => void) => void;
}) {
  const { fields, append } = useDashFieldArray<Item>('items');
  onAppend(append);
  onFieldsRendered(
    'A',
    fields.map((f) => f.id)
  );
  return (
    <div data-testid="stepA">
      {fields.map((f) => (
        <div key={f.id} data-testid={`stepA-item-${f.id}`}>
          {f.id}
        </div>
      ))}
    </div>
  );
}

function StepB({
  onFieldsRendered,
  onAppend,
}: {
  onFieldsRendered: (step: 'A' | 'B', fieldIds: string[]) => void;
  onAppend: (fn: (item: Item) => void) => void;
}) {
  const { fields, append } = useDashFieldArray<Item>('items');
  onAppend(append);
  onFieldsRendered(
    'B',
    fields.map((f) => f.id)
  );
  return (
    <div data-testid="stepB">
      {fields.map((f) => (
        <div key={f.id} data-testid={`stepB-item-${f.id}`}>
          {f.id}
        </div>
      ))}
    </div>
  );
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <DashFormProvider<Values> defaultValues={{ items: [] }}>
    {children}
  </DashFormProvider>
);

describe('useDashFieldArray — V3 multi-mount consistency', () => {
  it('preserves item ids across a step unmount+mount cycle (the fault-line fix)', () => {
    let latestAppend: (item: Item) => void = () => {
      throw new Error('append not captured');
    };
    const captured: Record<string, string[]> = {};

    const { getByRole } = render(
      wrapper({
        children: (
          <Wizard
            onFieldsRendered={(step, ids) => {
              captured[`last-${step}`] = ids;
            }}
            onAppend={(fn) => {
              latestAppend = fn;
            }}
          />
        ),
      })
    );

    // Step A initially rendered — append 2 items via A
    act(() => {
      latestAppend({ name: 'a-1' });
    });
    act(() => {
      latestAppend({ name: 'a-2' });
    });

    const idsAfterStepA = captured['last-A'];
    expect(idsAfterStepA).toHaveLength(2);

    // Toggle to Step B — this UNMOUNTS Step A and MOUNTS Step B on
    // the SAME array root. Under V1 (RHF wrapper) each step had its
    // own `useFieldArray` state so Step B would either see nothing
    // or freshly-generated ids. Under V3 Step B reads the SAME
    // engine array node → sees the exact same ids.
    act(() => {
      getByRole('button', { name: 'toggle' }).click();
    });

    const idsAfterStepB = captured['last-B'];
    expect(idsAfterStepB).toEqual(idsAfterStepA);

    // Toggle back to Step A — Step B unmounts, Step A re-mounts.
    // Ids still match: identity was never lost.
    act(() => {
      getByRole('button', { name: 'toggle' }).click();
    });

    expect(captured['last-A']).toEqual(idsAfterStepA);
  });

  it('items appended in Step A are visible in Step B after remount', () => {
    let latestAppend: (item: Item) => void = () => {
      throw new Error('append not captured');
    };
    const captured: Record<string, string[]> = {};

    const { getByRole, queryAllByTestId } = render(
      wrapper({
        children: (
          <Wizard
            onFieldsRendered={(step, ids) => {
              captured[`last-${step}`] = ids;
            }}
            onAppend={(fn) => {
              latestAppend = fn;
            }}
          />
        ),
      })
    );

    // Append 3 items via Step A
    act(() => {
      latestAppend({ name: 'a-1' });
      latestAppend({ name: 'a-2' });
      latestAppend({ name: 'a-3' });
    });

    expect(queryAllByTestId(/^stepA-item-/)).toHaveLength(3);

    // Switch to Step B — should see all 3 items (their ids preserved)
    act(() => {
      getByRole('button', { name: 'toggle' }).click();
    });

    expect(queryAllByTestId(/^stepB-item-/)).toHaveLength(3);
    expect(captured['last-B']).toEqual(captured['last-A']);
  });

  it('a mutation via Step A propagates to a simultaneously-mounted second reader', () => {
    // Two instances of the hook mounted at the same time under the
    // same provider — both read the same engine array node.

    let appendFromA: (item: Item) => void = () => {
      throw new Error('append A not captured');
    };
    const captured: Record<string, string[]> = {};

    function TwoReaders() {
      const A = useDashFieldArray<Item>('items');
      const B = useDashFieldArray<Item>('items');
      appendFromA = A.append;
      captured['A'] = A.fields.map((f) => f.id);
      captured['B'] = B.fields.map((f) => f.id);
      return null;
    }

    render(wrapper({ children: <TwoReaders /> }));

    expect(captured['A']).toEqual([]);
    expect(captured['B']).toEqual([]);

    act(() => {
      appendFromA({ name: 'x' });
    });

    // Both readers see the same single id after the mutation.
    expect(captured['A']).toHaveLength(1);
    expect(captured['B']).toHaveLength(1);
    expect(captured['A']).toEqual(captured['B']);
  });

  it('mid-array remove preserves ids for the surviving items across a remount', () => {
    let latestAppend: (item: Item) => void = () => {
      throw new Error('append not captured');
    };
    let latestRemove: (idx: number) => void = () => {
      throw new Error('remove not captured');
    };
    const captured: Record<string, string[]> = {};

    function Panel() {
      const { fields, append, remove } = useDashFieldArray<Item>('items');
      latestAppend = append;
      latestRemove = remove;
      captured['panel'] = fields.map((f) => f.id);
      return (
        <ul>
          {fields.map((f) => (
            <li key={f.id} data-testid={`p-${f.id}`}>
              {f.id}
            </li>
          ))}
        </ul>
      );
    }

    // Toggle-parent mounts either Panel or an empty div.
    function TogglePanel() {
      const [show, setShow] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            data-testid="toggle-panel"
          >
            toggle-panel
          </button>
          {show ? <Panel /> : <div data-testid="empty" />}
        </>
      );
    }

    render(wrapper({ children: <TogglePanel /> }));

    act(() => {
      latestAppend({ name: '0' });
      latestAppend({ name: '1' });
      latestAppend({ name: '2' });
    });

    const [id0, , id2] = captured['panel'];

    act(() => {
      latestRemove(1);
    });

    expect(captured['panel']).toEqual([id0, id2]);

    // Unmount + remount the panel — ids for the two surviving
    // items are still id0 and id2 (engine-owned identity).
    act(() => {
      screen.getByTestId('toggle-panel').click();
    });
    act(() => {
      screen.getByTestId('toggle-panel').click();
    });

    expect(captured['panel']).toEqual([id0, id2]);
  });
});
