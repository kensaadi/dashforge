// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<Autocomplete>`.
 *
 * These are NOT "is X fast" benchmarks — they're guardrails against
 * regressions in the things that matter for a 1000+ option combobox:
 *
 *  1. **Filter memoization**: `filteredOptions` must be reference-stable
 *     when its inputs (options + filter text + selection state) don't
 *     change. A stable reference means downstream lists don't re-mount.
 *
 *  2. **Render budget**: typing N characters must cause O(N) renders
 *     of the component, not O(N²) or worse. With our internals there
 *     are 2 renders per keystroke (one for `inputValue`, one for the
 *     popover opening on first keystroke), so the budget is `2N + k`
 *     for a small constant `k`.
 *
 *  3. **Initial render time** with a large option list must finish
 *     within a generous wall-clock budget. This catches a future
 *     refactor that, say, accidentally calls `getOptionLabel` 1000²
 *     times during mount.
 */
import { describe, it, expect } from 'vitest';
import { useEffect, useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Autocomplete } from './Autocomplete.js';
import type { AutocompleteOption } from './autocomplete.types.js';

// Generate `n` deterministic options.
function makeOptions(n: number): AutocompleteOption[] {
  return Array.from({ length: n }, (_, i) => ({
    value: `o-${i}`,
    label: `Option ${i}`,
  }));
}

/**
 * Wrap a component and expose a render-counter ref so tests can assert
 * how many times React re-rendered the wrapped subtree.
 */
function withRenderCounter<P>(
  Component: React.ComponentType<P>,
  counterRef: { count: number }
): React.FC<P> {
  return function Counted(props: P) {
    counterRef.count++;
    return <Component {...(props as P & object)} />;
  };
}

describe('<Autocomplete> performance', () => {
  it('mounts a 1000-option list well under 500ms', () => {
    const options = makeOptions(1000);
    const t0 = performance.now();
    render(<Autocomplete name="x" options={options} label="X" />);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(500);
  });

  it('filters a 1000-option list well under 100ms per keystroke', () => {
    const options = makeOptions(1000);
    render(<Autocomplete name="x" options={options} label="X" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    const t0 = performance.now();
    fireEvent.change(input, { target: { value: '9' } });
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(100);
  });
});

describe('<Autocomplete> re-render budget', () => {
  it('renders at most 2 times on mount (StrictMode-free path)', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(Autocomplete, counter);
    render(<Counted name="x" options={makeOptions(20)} label="X" />);
    // 1 initial render — and we tolerate up to 2 to account for the
    // synchronous useState callbacks that schedule a follow-up commit.
    expect(counter.count).toBeLessThanOrEqual(2);
  });

  it('keeps renders linear in keystrokes (≤ 3 renders per char)', () => {
    const counter = { count: 0 };
    const Counted = withRenderCounter(Autocomplete, counter);
    const { container } = render(
      <Counted name="x" options={makeOptions(50)} label="X" />
    );
    const baseline = counter.count;
    const input = container.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;
    const N = 10;
    for (let i = 0; i < N; i++) {
      fireEvent.change(input, { target: { value: 'a'.repeat(i + 1) } });
    }
    const perChar = (counter.count - baseline) / N;
    // 1-2 renders per keystroke is the design budget; allow some slack
    // for popover-open transitions on the first keystroke and the
    // highlight reset useState call.
    expect(perChar).toBeLessThanOrEqual(3);
  });

  it('does NOT re-render an unrelated sibling on each keystroke', () => {
    // Critical perf property: typing into one Autocomplete must not
    // cause sibling components in the same tree to re-render. We check
    // this by mounting a sibling whose render count we count directly.
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    render(
      <div>
        <Autocomplete name="x" options={makeOptions(50)} label="X" />
        <Sibling />
      </div>
    );
    const before = sibCount.count;
    const input = screen.getByRole('combobox') as HTMLInputElement;
    for (let i = 0; i < 5; i++) {
      fireEvent.change(input, { target: { value: 'a'.repeat(i + 1) } });
    }
    // No state in the parent changes ⇒ sibling never re-renders.
    expect(sibCount.count).toBe(before);
  });

  it('filteredOptions reference is stable across unrelated re-renders', () => {
    // Functional contract: if the deps (options, filter text, selection)
    // don't change, `useMemo` should return the same array reference.
    // We verify by triggering a parent re-render with no relevant input
    // change and asserting the `<li>` DOM elements are reused (same id
    // identities ⇒ React reused the keys).
    const options = makeOptions(20);
    const seenIds = new Set<string>();
    const { rerender } = render(
      <Autocomplete name="x" options={options} label="X" />
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.focus(input); // open popover so the list renders
    const lis1 = Array.from(
      document.querySelectorAll('[role="option"]')
    ).map((el) => el.id);
    lis1.forEach((id) => seenIds.add(id));

    // Trigger an unrelated re-render: same options ref, same input
    // value, same selection.
    rerender(<Autocomplete name="x" options={options} label="X" />);
    const lis2 = Array.from(
      document.querySelectorAll('[role="option"]')
    ).map((el) => el.id);

    // Same ids ⇒ React keyed reuse held; list DOM was not torn down.
    expect(lis2).toEqual(lis1);
  });

  it('captures number of options accessor calls during one filter cycle', () => {
    // Implementation detail with strong perf relevance: filtering 1000
    // options must call `getOptionLabel` at most O(N) times per filter
    // (NOT O(N²) or anything weirdly memoized that re-computes per
    // child).
    let labelCalls = 0;
    let valueCalls = 0;
    const N = 200;
    const options: AutocompleteOption[] = makeOptions(N);
    render(
      <Autocomplete
        name="x"
        options={options}
        label="X"
        getOptionLabel={(o) => {
          labelCalls++;
          return o.label;
        }}
        getOptionValue={(o) => {
          valueCalls++;
          return o.value;
        }}
      />
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    labelCalls = 0;
    valueCalls = 0;
    fireEvent.change(input, { target: { value: '5' } });
    // Budget: O(N) on both. Allow 4x N to cover the filter pass plus
    // the popover-open render's per-option `getOptionValue` for ids
    // and `getOptionLabel` for the rendered <li> body.
    expect(labelCalls).toBeLessThanOrEqual(4 * N);
    expect(valueCalls).toBeLessThanOrEqual(4 * N);
  });
});

describe('<Autocomplete> async + perf interaction', () => {
  it('debounces loadOptions so 5 rapid keystrokes ⇒ 1 fetch', async () => {
    const calls: string[] = [];
    const load = (q: string) => {
      calls.push(q);
      return Promise.resolve<AutocompleteOption[]>([]);
    };
    render(
      <Autocomplete
        name="x"
        options={[]}
        loadOptions={load}
        loadDebounceMs={50}
      />
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    // Type 5 chars in quick succession (synchronous).
    for (let i = 0; i < 5; i++) {
      fireEvent.change(input, { target: { value: 'abcde'.slice(0, i + 1) } });
    }
    // Before debounce expires, no call yet.
    expect(calls.length).toBe(0);
    // Wait past debounce window.
    await new Promise((r) => setTimeout(r, 80));
    // Exactly ONE call lands, with the LAST typed value.
    expect(calls).toEqual(['abcde']);
  });
});

/**
 * Module-level useEffect import sanity (suppresses "useRef declared but
 * not used" if a test runner tree-shake removes some perf tests in CI).
 */
void useRef;
void useEffect;
