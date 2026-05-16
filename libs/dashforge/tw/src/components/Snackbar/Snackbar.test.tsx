// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
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
beforeEach(() => {
  vi.useRealTimers();
});

/**
 * Test trigger — exposes a button per snackbar call. Each click
 * dispatches with the given options.
 */
function Trigger({
  options,
  testid = 'trigger',
}: {
  options: Parameters<ReturnType<typeof useSnackbar>['enqueue']>[0];
  testid?: string;
}) {
  const { enqueue } = useSnackbar();
  return (
    <button data-testid={testid} onClick={() => enqueue(options)}>
      enqueue
    </button>
  );
}

describe('<SnackbarProvider> + useSnackbar()', () => {
  describe('basic enqueue + render', () => {
    it('renders nothing initially', () => {
      render(
        <SnackbarProvider>
          <div />
        </SnackbarProvider>
      );
      expect(screen.queryByRole('region', { name: 'Notifications' })).toBeTruthy();
      expect(screen.queryByText(/./)).toBeNull();
    });

    it('shows a snackbar when enqueue() is called', () => {
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'Saved!' }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(screen.getByText('Saved!')).toBeTruthy();
    });

    it('renders the close button by default', () => {
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'Saved!' }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(
        screen.getByRole('button', { name: 'Dismiss notification' })
      ).toBeTruthy();
    });

    it('hides the close button when showClose=false', () => {
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'No close', showClose: false }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(
        screen.queryByRole('button', { name: 'Dismiss notification' })
      ).toBeNull();
    });
  });

  describe('dismiss', () => {
    it('removes the snackbar on close-button click', () => {
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'Saved!', autoHideMs: 0 }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(screen.getByText('Saved!')).toBeTruthy();
      act(() => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Dismiss notification' })
        );
      });
      expect(screen.queryByText('Saved!')).toBeNull();
    });

    it('dismissAll() clears every visible snackbar', () => {
      function MultiTrigger() {
        const { enqueue, dismissAll } = useSnackbar();
        return (
          <>
            <button
              data-testid="add1"
              onClick={() => enqueue({ message: 'A', autoHideMs: 0 })}
            >
              add A
            </button>
            <button
              data-testid="add2"
              onClick={() => enqueue({ message: 'B', autoHideMs: 0 })}
            >
              add B
            </button>
            <button data-testid="clear" onClick={() => dismissAll()}>
              clear
            </button>
          </>
        );
      }
      render(
        <SnackbarProvider>
          <MultiTrigger />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('add1'));
        fireEvent.click(screen.getByTestId('add2'));
      });
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
      act(() => {
        fireEvent.click(screen.getByTestId('clear'));
      });
      expect(screen.queryByText('A')).toBeNull();
      expect(screen.queryByText('B')).toBeNull();
    });
  });

  describe('auto-dismiss', () => {
    it('auto-dismisses after autoHideMs', () => {
      vi.useFakeTimers();
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'Auto', autoHideMs: 1000 }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(screen.getByText('Auto')).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(screen.queryByText('Auto')).toBeNull();
    });

    it('does NOT auto-dismiss when autoHideMs is 0', () => {
      vi.useFakeTimers();
      render(
        <SnackbarProvider>
          <Trigger options={{ message: 'Sticky', autoHideMs: 0 }} />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(screen.getByText('Sticky')).toBeTruthy();
    });
  });

  describe('action button', () => {
    it('invokes the action callback and dismisses the snackbar', () => {
      const action = vi.fn();
      render(
        <SnackbarProvider>
          <Trigger
            options={{
              message: 'Undo?',
              autoHideMs: 0,
              action: { label: 'Undo', onClick: action },
            }}
          />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      });
      expect(action).toHaveBeenCalledOnce();
      expect(screen.queryByText('Undo?')).toBeNull();
    });
  });

  describe('de-dup (same id)', () => {
    it('replaces an existing snackbar instead of stacking when ids match', () => {
      function TwoCallsSameId() {
        const { enqueue } = useSnackbar();
        return (
          <button
            data-testid="t"
            onClick={() => {
              enqueue({ id: 'saved', message: 'Saved v1', autoHideMs: 0 });
              enqueue({ id: 'saved', message: 'Saved v2', autoHideMs: 0 });
            }}
          >
            twice
          </button>
        );
      }
      render(
        <SnackbarProvider>
          <TwoCallsSameId />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('t'));
      });
      // Only v2 should be visible.
      expect(screen.queryByText('Saved v1')).toBeNull();
      expect(screen.getByText('Saved v2')).toBeTruthy();
    });
  });

  describe('maxVisible queueing', () => {
    it('caps the visible count and promotes queued items on dismiss', () => {
      vi.useFakeTimers();
      function AddMany() {
        const { enqueue, dismiss } = useSnackbar();
        return (
          <>
            <button
              data-testid="add-all"
              onClick={() => {
                enqueue({ id: 'a', message: 'A', autoHideMs: 0 });
                enqueue({ id: 'b', message: 'B', autoHideMs: 0 });
                enqueue({ id: 'c', message: 'C', autoHideMs: 0 });
              }}
            >
              all
            </button>
            <button
              data-testid="kill-a"
              onClick={() => dismiss('a')}
            >
              kill A
            </button>
          </>
        );
      }
      render(
        <SnackbarProvider maxVisible={2}>
          <AddMany />
        </SnackbarProvider>
      );
      act(() => {
        fireEvent.click(screen.getByTestId('add-all'));
      });
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
      expect(screen.queryByText('C')).toBeNull(); // queued
      act(() => {
        fireEvent.click(screen.getByTestId('kill-a'));
      });
      expect(screen.queryByText('A')).toBeNull();
      expect(screen.getByText('B')).toBeTruthy();
      expect(screen.getByText('C')).toBeTruthy(); // promoted
    });
  });

  describe('useSnackbar() outside provider', () => {
    it('throws a helpful error', () => {
      const Lone = () => {
        useSnackbar();
        return null;
      };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(() => render(<Lone />)).toThrow(/useSnackbar/);
      spy.mockRestore();
    });
  });

  describe('a11y wiring', () => {
    it('renders an aria-live="polite" region with label "Notifications"', () => {
      render(
        <SnackbarProvider>
          <div />
        </SnackbarProvider>
      );
      const region = screen.getByRole('region', { name: 'Notifications' });
      expect(region.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('severity rendering', () => {
    (['info', 'success', 'warning', 'danger'] as const).forEach((sev) => {
      it(`renders the ${sev} glyph`, () => {
        render(
          <SnackbarProvider>
            <Trigger options={{ message: sev, severity: sev }} />
          </SnackbarProvider>
        );
        act(() => {
          fireEvent.click(screen.getByTestId('trigger'));
        });
        expect(screen.getByText(sev)).toBeTruthy();
      });
    });
  });
});
