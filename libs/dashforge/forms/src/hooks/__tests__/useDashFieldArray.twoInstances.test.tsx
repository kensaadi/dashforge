import { describe, it, expect } from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashFormProvider } from '../../core/DashFormProvider';
import { useDashFieldArray } from '../useDashFieldArray';

interface TestItem {
  name: string;
  value: number;
}

/**
 * kensaadi/dashforge#139 — characterization of TWO `useDashFieldArray`
 * instances mounted on one `name`, under a single `DashFormProvider`.
 *
 * This is the multi-step-wizard shape: step 2 and step 4 both edit
 * `items`. It is described on the public `/fault-lines` page, so it must
 * be pinned in CI rather than left to be discovered by a reader.
 *
 * The test asserts what the code does today and deliberately does not
 * argue for it. If these expectations start failing, the behaviour moved
 * and the public page has to move with it, in the same change.
 */
describe('useDashFieldArray — two instances on one name', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DashFormProvider<{ items: TestItem[] }> defaultValues={{ items: [] }}>
      {children}
    </DashFormProvider>
  );

  /** Both hooks mounted inside the SAME provider, as two steps would be. */
  const renderBoth = () =>
    renderHook(
      () => ({
        stepA: useDashFieldArray<TestItem>('items'),
        stepB: useDashFieldArray<TestItem>('items'),
      }),
      { wrapper }
    );

  it('both instances start empty', () => {
    const { result } = renderBoth();

    expect(result.current.stepA.fields).toEqual([]);
    expect(result.current.stepB.fields).toEqual([]);
  });

  it('an append on one instance is observed by the other', () => {
    const { result } = renderBoth();

    act(() => {
      result.current.stepA.append({ name: 'first', value: 1 });
    });

    expect(result.current.stepA.fields).toHaveLength(1);
    // The constraint this test was filed to pin: under RHF's own
    // `useFieldArray` each hook keeps a private `fields` snapshot, so
    // this length would be 0. The hook now owns array identity in the
    // engine and registers the node once per name, so the second
    // instance subscribes to the same node instead of starting its own.
    expect(result.current.stepB.fields).toHaveLength(1);
  });

  it('the two instances agree on item identity, not merely on length', () => {
    const { result } = renderBoth();

    act(() => {
      result.current.stepA.append({ name: 'first', value: 1 });
      result.current.stepA.append({ name: 'second', value: 2 });
    });

    const idsA = result.current.stepA.fields.map((f) => f.id);
    const idsB = result.current.stepB.fields.map((f) => f.id);

    // Same ids in the same order: a shared list, not two lists that
    // happen to be the same size.
    expect(idsB).toEqual(idsA);
    expect(new Set(idsA).size).toBe(2);
  });

  it('a remove on one instance is observed by the other', () => {
    const { result } = renderBoth();

    act(() => {
      result.current.stepA.append({ name: 'first', value: 1 });
      result.current.stepA.append({ name: 'second', value: 2 });
    });
    const survivingId = result.current.stepA.fields[1].id;

    act(() => {
      result.current.stepB.remove(0);
    });

    expect(result.current.stepA.fields).toHaveLength(1);
    expect(result.current.stepB.fields).toHaveLength(1);
    expect(result.current.stepA.fields[0].id).toBe(survivingId);
  });

  it('a move on one instance reorders the other the same way', () => {
    const { result } = renderBoth();

    act(() => {
      result.current.stepA.append({ name: 'first', value: 1 });
      result.current.stepA.append({ name: 'second', value: 2 });
    });
    const [firstId, secondId] = result.current.stepA.fields.map((f) => f.id);

    act(() => {
      result.current.stepB.move(0, 1);
    });

    expect(result.current.stepA.fields.map((f) => f.id)).toEqual([
      secondId,
      firstId,
    ]);
    expect(result.current.stepB.fields.map((f) => f.id)).toEqual([
      secondId,
      firstId,
    ]);
  });

  it('a second instance mounted later adopts the existing list', () => {
    // The wizard case proper: step 4 mounts after step 2 has already
    // added rows, and must subscribe to the existing node rather than
    // re-register it and reset identity.
    //
    // Two real components rather than a conditional hook call: the hook
    // count per component has to stay constant, which is the rule the
    // first draft of this case broke.
    type Api = ReturnType<typeof useDashFieldArray<TestItem>>;
    const seen: { a?: Api; b?: Api } = {};

    function StepA() {
      seen.a = useDashFieldArray<TestItem>('items');
      return null;
    }
    function StepB() {
      seen.b = useDashFieldArray<TestItem>('items');
      return null;
    }

    const { rerender } = render(
      <DashFormProvider<{ items: TestItem[] }> defaultValues={{ items: [] }}>
        <StepA />
      </DashFormProvider>
    );

    act(() => {
      seen.a!.append({ name: 'first', value: 1 });
    });
    const idsBefore = seen.a!.fields.map((f) => f.id);
    expect(idsBefore).toHaveLength(1);

    rerender(
      <DashFormProvider<{ items: TestItem[] }> defaultValues={{ items: [] }}>
        <StepA />
        <StepB />
      </DashFormProvider>
    );

    expect(seen.b!.fields.map((f) => f.id)).toEqual(idsBefore);
    expect(seen.a!.fields.map((f) => f.id)).toEqual(idsBefore);
  });
});
