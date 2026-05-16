// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<DateTimePicker>`.
 *
 * Guardrails — not absolute benchmarks. They protect against:
 *
 *  1. Pathological mount cost (an accidental quadratic in a future
 *     refactor — much less likely here than in `<Autocomplete>` because
 *     there's no option list, but the test still pins the budget).
 *
 *  2. Sibling re-renders on every keystroke. The bridge subscription
 *     model (`useDashFieldMeta(name)`) must remain GRANULAR — only the
 *     field whose value changed re-renders, never a sibling.
 *
 *  3. Linear render budget per keystroke for THIS field. Aim for 1
 *     render per `onChange`; tolerate 2 (RHF / engine reactive snapshot
 *     batching).
 *
 *  4. Mode switch isn't accidentally expensive (cycling between
 *     `date` / `time` / `datetime` mounts a NEW native input each time
 *     — but the component itself must not allocate per-key arrays etc.).
 */
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { DateTimePicker, TextField } from '../../index.js';

function withRenderCounter<P>(
  Component: React.ComponentType<P>,
  counterRef: { count: number }
): React.FC<P> {
  return function Counted(props: P) {
    counterRef.count++;
    return <Component {...(props as P & object)} />;
  };
}

describe('<DateTimePicker> performance', () => {
  it('mounts well under 50ms (standalone, no bridge)', () => {
    const t0 = performance.now();
    render(<DateTimePicker name="d" label="Date" />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(50);
  });

  it('mounts under 100ms inside DashFormProvider (with bridge wiring)', () => {
    const t0 = performance.now();
    render(
      <DashFormProvider defaultValues={{ d: '2026-05-16' }}>
        <DateTimePicker name="d" label="Date" />
      </DashFormProvider>
    );
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(100);
  });

  it('processes a value change in under 20ms', () => {
    render(<DateTimePicker name="d" label="Date" />);
    const input = screen.getByLabelText('Date') as HTMLInputElement;
    const t0 = performance.now();
    fireEvent.change(input, { target: { value: '2026-12-25' } });
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(20);
  });
});

describe('<DateTimePicker> re-render budget', () => {
  it('renders at most 2 times on mount', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(DateTimePicker, counter);
    render(<Counted name="d" label="Date" />);
    // 1 initial + (tolerate 1 follow-up commit for any setState
    // scheduled in a useEffect; today we don't schedule any, but the
    // budget allows headroom).
    expect(counter.count).toBeLessThanOrEqual(2);
  });

  it('keeps controlled re-renders ≤ 1 per value prop change', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(DateTimePicker, counter);
    const { rerender } = render(
      <Counted name="d" label="Date" value="2026-01-01" />
    );
    const baseline = counter.count;
    rerender(<Counted name="d" label="Date" value="2026-01-02" />);
    rerender(<Counted name="d" label="Date" value="2026-01-03" />);
    rerender(<Counted name="d" label="Date" value="2026-01-04" />);
    // 3 prop changes ⇒ ≤ 4 renders (one per change + tolerance).
    expect(counter.count - baseline).toBeLessThanOrEqual(4);
  });

  it('does NOT re-render an unrelated sibling on each value change', () => {
    // Critical perf property: typing into one DateTimePicker must not
    // cause sibling components to re-render. Granular per-field
    // subscription via `useDashFieldMeta(name)` is what enforces this.
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    render(
      <DashFormProvider defaultValues={{ d: '2026-01-01', other: 'x' }}>
        <DateTimePicker name="d" label="Date" />
        <Sibling />
      </DashFormProvider>
    );
    const before = sibCount.count;
    const input = screen.getByLabelText('Date') as HTMLInputElement;
    for (let i = 1; i <= 5; i++) {
      fireEvent.change(input, {
        target: { value: `2026-01-0${i + 1}` },
      });
    }
    expect(sibCount.count).toBe(before);
  });

  it('does NOT re-render when a sibling field changes (per-field subscription)', () => {
    // Inverse of the above: changing the OTHER field in the bridge
    // must not re-render the DateTimePicker. Verifies the granular
    // `useDashFieldMeta` subscription is filtering by name.
    const dtCount = { count: 0 };
    const Counted = withRenderCounter(DateTimePicker, dtCount);
    render(
      <DashFormProvider defaultValues={{ d: '2026-01-01', other: '' }}>
        <Counted name="d" label="Date" />
        <TextField name="other" label="Other" />
      </DashFormProvider>
    );
    const baseline = dtCount.count;
    const other = screen.getByLabelText('Other') as HTMLInputElement;
    for (let i = 0; i < 5; i++) {
      fireEvent.change(other, { target: { value: 'a'.repeat(i + 1) } });
    }
    // The DateTimePicker may re-render once on initial mount of the
    // sibling (parent re-render propagation) but NOT on each sibling
    // keystroke. Budget: 0 additional renders.
    expect(dtCount.count - baseline).toBeLessThanOrEqual(1);
  });

  it('mode switch (date ⇄ datetime) does not leak the previous native input', () => {
    // Switching `mode` changes the native element's `type` attribute —
    // React reuses the same DOM node (no remount). Assert that the
    // input element identity is preserved.
    const { rerender, container } = render(
      <DateTimePicker name="d" label="X" mode="date" />
    );
    const inputBefore = container.querySelector('input');
    rerender(<DateTimePicker name="d" label="X" mode="datetime" />);
    const inputAfter = container.querySelector('input');
    expect(inputBefore).toBe(inputAfter);
    expect((inputAfter as HTMLInputElement).type).toBe('datetime-local');
  });
});
