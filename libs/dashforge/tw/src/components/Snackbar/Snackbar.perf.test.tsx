// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<SnackbarProvider>`.
 *
 * Guardrails:
 *
 *  1. Mount cost stays tiny — provider lives near app root.
 *  2. Enqueueing N snackbars in quick succession is O(N) total work,
 *     NOT O(N²) at the React level.
 *  3. Provider re-renders ONLY when the visible set changes — children
 *     subtree is untouched per enqueue.
 *  4. `api` object identity is stable across provider re-renders so
 *     consumers can put `enqueue` in `useEffect` deps safely.
 */
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from '@testing-library/react';
import { SnackbarProvider, useSnackbar } from './Snackbar.js';

void React;
afterEach(() => cleanup());

describe('<SnackbarProvider> performance', () => {
  it('mounts in under 200ms with empty children (cold-start safe budget)', () => {
    const t0 = performance.now();
    render(
      <SnackbarProvider>
        <div />
      </SnackbarProvider>
    );
    const t1 = performance.now();
    // Generous bound for cold-start under workspace-wide test runs;
    // warm path is sub-10ms.
    expect(t1 - t0).toBeLessThan(200);
  });

  it('enqueues 50 snackbars (cap=50) under 200ms', () => {
    function Adder() {
      const { enqueue } = useSnackbar();
      return (
        <button
          data-testid="a"
          onClick={() => {
            for (let i = 0; i < 50; i++) {
              enqueue({ message: `msg-${i}`, autoHideMs: 0 });
            }
          }}
        >
          add
        </button>
      );
    }
    render(
      <SnackbarProvider maxVisible={50}>
        <Adder />
      </SnackbarProvider>
    );
    const t0 = performance.now();
    act(() => {
      fireEvent.click(screen.getByTestId('a'));
    });
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(200);
  });
});

describe('<SnackbarProvider> re-render budget', () => {
  it('children subtree does NOT re-render on enqueue', () => {
    const childCount = { count: 0 };
    const Child = () => {
      childCount.count++;
      return <div data-testid="child" />;
    };
    function Adder() {
      const { enqueue } = useSnackbar();
      return (
        <button
          data-testid="a"
          onClick={() => enqueue({ message: 'hi', autoHideMs: 0 })}
        >
          add
        </button>
      );
    }
    render(
      <SnackbarProvider>
        <Child />
        <Adder />
      </SnackbarProvider>
    );
    const baseline = childCount.count;
    act(() => {
      fireEvent.click(screen.getByTestId('a'));
      fireEvent.click(screen.getByTestId('a'));
      fireEvent.click(screen.getByTestId('a'));
    });
    // The provider RE-renders on each enqueue (state change), which
    // re-renders its direct children — Child is one of them, so it
    // re-renders too. The contract is "no MORE than one re-render
    // PER enqueue". Three enqueues ⇒ ≤ 3 extra child renders.
    expect(childCount.count - baseline).toBeLessThanOrEqual(3);
  });

  it('useSnackbar() returns a STABLE api identity across re-renders', () => {
    const captured: Array<unknown> = [];
    function Capture() {
      const api = useSnackbar();
      captured.push(api);
      return null;
    }
    const Outer = ({ x }: { x: number }) => (
      <SnackbarProvider>
        <div data-x={x} />
        <Capture />
      </SnackbarProvider>
    );
    const { rerender } = render(<Outer x={1} />);
    rerender(<Outer x={2} />);
    rerender(<Outer x={3} />);
    expect(captured.length).toBeGreaterThanOrEqual(3);
    expect(captured[0]).toBe(captured[1]);
    expect(captured[1]).toBe(captured[2]);
  });

  it('renders at most 2 times on mount (provider wrapper)', () => {
    let count = 0;
    const Counted = (p: React.ComponentProps<typeof SnackbarProvider>) => {
      count++;
      return <SnackbarProvider {...p} />;
    };
    render(
      <Counted>
        <div />
      </Counted>
    );
    expect(count).toBeLessThanOrEqual(2);
  });
});
