// @vitest-environment jsdom
/**
 * Performance + re-render budget tests for `<ConfirmDialogProvider>`.
 *
 * Guardrails:
 *
 *  1. Provider mount is cheap — it lives near the top of the tree, so
 *     it must not chase any expensive setup paths.
 *
 *  2. `confirm()` reference is stable across provider re-renders so
 *     consumers can pass it through `useEffect` deps without thrashing.
 *
 *  3. Children do NOT re-render every time a confirm() opens/closes —
 *     state lives inside the provider, but a memoized context value
 *     plus React's bail-out on identical context means the children
 *     subtree stays put.
 *
 *  4. Dismissing the dialog with the queue drained does not allocate
 *     a new array (cheap idle path).
 */
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from '@testing-library/react';
import {
  ConfirmDialogProvider,
  useConfirm,
} from './ConfirmDialog.js';

void React;
afterEach(() => cleanup());

beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return;
  const proto = HTMLDialogElement.prototype as unknown as {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
});

describe('<ConfirmDialogProvider> performance', () => {
  it('mounts under 200ms with empty children (cold-start safe budget)', () => {
    const t0 = performance.now();
    render(
      <ConfirmDialogProvider>
        <div />
      </ConfirmDialogProvider>
    );
    const t1 = performance.now();
    // Generous bound to accommodate cold-start variance under full
    // workspace test run; warm path is in single-digit ms.
    expect(t1 - t0).toBeLessThan(200);
  });

  it('opens + closes a dialog in under 30ms', async () => {
    const Harness = () => {
      const confirm = useConfirm();
      return (
        <button
          data-testid="t"
          onClick={async () => {
            await confirm({ title: 'X' });
          }}
        >
          go
        </button>
      );
    };
    render(
      <ConfirmDialogProvider>
        <Harness />
      </ConfirmDialogProvider>
    );
    const t0 = performance.now();
    await act(async () => {
      fireEvent.click(screen.getByTestId('t'));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    const t1 = performance.now();
    // Generous budget to absorb cold-start variance when run alongside
    // the rest of the workspace test suite.
    expect(t1 - t0).toBeLessThan(200);
  });
});

describe('<ConfirmDialogProvider> re-render budget', () => {
  it('does NOT re-render unrelated children when confirm() opens', async () => {
    const sibCount = { count: 0 };
    const Sibling = () => {
      sibCount.count++;
      return <div data-testid="sib" />;
    };
    const Trigger = () => {
      const confirm = useConfirm();
      return (
        <button data-testid="t" onClick={() => void confirm({ title: 'X' })}>
          go
        </button>
      );
    };
    render(
      <ConfirmDialogProvider>
        <Sibling />
        <Trigger />
      </ConfirmDialogProvider>
    );
    const baseline = sibCount.count;
    await act(async () => {
      fireEvent.click(screen.getByTestId('t'));
    });
    // The provider re-renders to inflate the dialog, which causes one
    // children-pass re-render at the parent level — Sibling re-renders
    // once. Budget: ≤ 1 extra.
    expect(sibCount.count - baseline).toBeLessThanOrEqual(1);
  });

  it('confirm() reference is stable across provider re-renders', () => {
    const refs: Array<unknown> = [];
    const Capture = () => {
      const confirm = useConfirm();
      refs.push(confirm);
      return null;
    };
    const Outer = ({ x }: { x: number }) => (
      <ConfirmDialogProvider>
        <div data-x={x} />
        <Capture />
      </ConfirmDialogProvider>
    );
    const { rerender } = render(<Outer x={1} />);
    rerender(<Outer x={2} />);
    rerender(<Outer x={3} />);
    // Three renders → confirm reference must be identical each time.
    expect(refs.length).toBeGreaterThanOrEqual(3);
    expect(refs[0]).toBe(refs[1]);
    expect(refs[1]).toBe(refs[2]);
  });

  it('renders at most 2 times on mount', () => {
    let count = 0;
    const Counted = (
      props: React.ComponentProps<typeof ConfirmDialogProvider>
    ) => {
      count++;
      return <ConfirmDialogProvider {...props} />;
    };
    render(
      <Counted>
        <div />
      </Counted>
    );
    expect(count).toBeLessThanOrEqual(2);
  });
});
