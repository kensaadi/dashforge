// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  waitFor,
} from '@testing-library/react';
import {
  ConfirmDialogProvider,
  useConfirm,
} from './ConfirmDialog.js';

void React;
afterEach(() => cleanup());

// jsdom 22 doesn't implement HTMLDialogElement open/close. Shim the bits
// our component touches BEFORE any test runs — without this the very
// first `dlg.showModal()` call throws "not implemented".
beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return;
  const proto = HTMLDialogElement.prototype as unknown as {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
    open?: boolean;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
      // Mirror native dispatch order (open is sync, no 'open' event).
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
});

/**
 * Test harness — exposes the imperative `confirm()` to the test via a
 * `data-` attribute on a click target. Each click triggers a NEW
 * confirm call, and `last result` is recorded on the harness for
 * assertions.
 */
function Harness({
  capture,
  options,
}: {
  capture: { last?: boolean | null };
  options?: Parameters<ReturnType<typeof useConfirm>>[0];
}) {
  const confirm = useConfirm();
  return (
    <button
      type="button"
      data-testid="trigger"
      onClick={async () => {
        capture.last = null;
        const ok = await confirm(options);
        capture.last = ok;
      }}
    >
      Open
    </button>
  );
}

describe('<ConfirmDialogProvider> + useConfirm()', () => {
  describe('rendering', () => {
    it('renders only its children when no request is active', () => {
      render(
        <ConfirmDialogProvider>
          <div data-testid="child">app</div>
        </ConfirmDialogProvider>
      );
      expect(screen.getByTestId('child')).toBeTruthy();
      // The <dialog> exists (always mounted) but has no `open` attribute.
      const dlg = document.querySelector('dialog');
      expect(dlg).toBeTruthy();
      expect(dlg?.hasAttribute('open')).toBe(false);
    });

    it('opens the native dialog when confirm() is called', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} options={{ title: 'T', body: 'B' }} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const dlg = document.querySelector('dialog') as HTMLDialogElement;
      expect(dlg.hasAttribute('open')).toBe(true);
      expect(screen.getByText('T')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
    });
  });

  describe('event resolution', () => {
    it('resolves true on Confirm click', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      });
      await waitFor(() => expect(capture.last).toBe(true));
    });

    it('resolves false on Cancel click', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      });
      await waitFor(() => expect(capture.last).toBe(false));
    });

    it('resolves false on backdrop click', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const dlg = document.querySelector('dialog') as HTMLDialogElement;
      // Backdrop click: event target equals the dialog element itself.
      await act(async () => {
        fireEvent.click(dlg);
      });
      await waitFor(() => expect(capture.last).toBe(false));
    });

    it('does NOT close on backdrop when disableBackdropClose=true', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness
            capture={capture}
            options={{ disableBackdropClose: true }}
          />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const dlg = document.querySelector('dialog') as HTMLDialogElement;
      await act(async () => {
        fireEvent.click(dlg);
      });
      // No resolution yet — dialog stays open.
      expect(capture.last).toBeNull();
      expect(dlg.hasAttribute('open')).toBe(true);
    });
  });

  describe('useConfirm() outside provider', () => {
    it('throws a helpful error', () => {
      const Lone = () => {
        useConfirm();
        return null;
      };
      // Suppress React's console.error noise for this expected throw.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<Lone />)).toThrow(/useConfirm/);
      spy.mockRestore();
    });
  });

  describe('severity', () => {
    it('applies the danger color class on the confirm button', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} options={{ severity: 'danger' }} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const btn = screen.getByRole('button', { name: 'Confirm' });
      expect(btn.className).toMatch(/danger/);
    });
  });

  describe('queueing', () => {
    it('processes concurrent confirm() calls FIFO', async () => {
      const captures: Array<{ last?: boolean | null }> = [{}, {}];
      function Multi() {
        const confirm = useConfirm();
        return (
          <>
            <button
              data-testid="t1"
              onClick={async () => {
                captures[0].last = await confirm({ title: 'First' });
              }}
            >
              t1
            </button>
            <button
              data-testid="t2"
              onClick={async () => {
                captures[1].last = await confirm({ title: 'Second' });
              }}
            >
              t2
            </button>
          </>
        );
      }
      render(
        <ConfirmDialogProvider>
          <Multi />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('t1'));
        fireEvent.click(screen.getByTestId('t2'));
      });
      // First request is showing.
      expect(screen.getByText('First')).toBeTruthy();
      // Resolve the first one — second should pop up.
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      });
      await waitFor(() => expect(captures[0].last).toBe(true));
      await waitFor(() => expect(screen.getByText('Second')).toBeTruthy());
      // Resolve the second one.
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      });
      await waitFor(() => expect(captures[1].last).toBe(false));
    });
  });

  describe('custom labels', () => {
    it('renders confirmLabel + cancelLabel from options', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness
            capture={capture}
            options={{ confirmLabel: 'Delete', cancelLabel: 'Keep' }}
          />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeTruthy();
    });
  });

  describe('a11y wiring', () => {
    it('sets aria-labelledby when a title is provided', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} options={{ title: 'Heads up' }} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const dlg = document.querySelector('dialog') as HTMLDialogElement;
      const labelledBy = dlg.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(
        labelledBy ? document.getElementById(labelledBy)?.textContent : null
      ).toBe('Heads up');
    });

    it('does NOT set aria-labelledby when no title', async () => {
      const capture: { last?: boolean | null } = {};
      render(
        <ConfirmDialogProvider>
          <Harness capture={capture} options={{ body: 'no title' }} />
        </ConfirmDialogProvider>
      );
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      const dlg = document.querySelector('dialog') as HTMLDialogElement;
      expect(dlg.getAttribute('aria-labelledby')).toBeNull();
    });
  });
});
