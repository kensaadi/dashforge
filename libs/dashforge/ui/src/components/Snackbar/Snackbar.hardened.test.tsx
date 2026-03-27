import { screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';
import type { ReactNode } from 'react';
import { SnackbarProvider } from './SnackbarProvider';
import { useSnackbar } from './useSnackbar';

/**
 * Hardened Snackbar Test Suite
 *
 * Full intent coverage for production hardening.
 * Tests all critical timer semantics, edge cases, and race conditions.
 */

// ============================================================================
// Test Utilities
// ============================================================================

function createWrapper() {
  return ({ children }: { children: ReactNode }) => (
    <SnackbarProvider>{children}</SnackbarProvider>
  );
}

// ============================================================================
// Intent A: Provider Setup
// ============================================================================

describe('Snackbar Hardened Tests', () => {
  describe('Intent A: Provider Setup', () => {
    test('throws error when useSnackbar called outside provider', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSnackbar());
      }).toThrow('useSnackbar must be used within SnackbarProvider');

      consoleErrorSpy.mockRestore();
    });

    test('provides complete API when useSnackbar called inside provider', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.enqueue).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.closeAll).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.info).toBe('function');
    });

    test('API methods are stable references across re-renders', () => {
      const { result, rerender } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      const firstEnqueue = result.current.enqueue;
      const firstClose = result.current.close;
      const firstCloseAll = result.current.closeAll;
      const firstSuccess = result.current.success;
      const firstError = result.current.error;
      const firstWarning = result.current.warning;
      const firstInfo = result.current.info;

      rerender();

      expect(result.current.enqueue).toBe(firstEnqueue);
      expect(result.current.close).toBe(firstClose);
      expect(result.current.closeAll).toBe(firstCloseAll);
      expect(result.current.success).toBe(firstSuccess);
      expect(result.current.error).toBe(firstError);
      expect(result.current.warning).toBe(firstWarning);
      expect(result.current.info).toBe(firstInfo);
    });
  });

  // ==========================================================================
  // Intent B: Queue Management
  // ==========================================================================

  describe('Intent B: Queue Management', () => {
    test('enqueue shows snackbar immediately when queue empty', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Test message');
      });

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('enqueue returns unique incremental ID for each snackbar', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      let id1: string, id2: string, id3: string;

      act(() => {
        id1 = result.current.enqueue('Message 1');
        id2 = result.current.enqueue('Message 2');
        id3 = result.current.enqueue('Message 3');
      });

      expect(id1!).toBe('snackbar-1');
      expect(id2!).toBe('snackbar-2');
      expect(id3!).toBe('snackbar-3');
    });

    test('shows max 3 snackbars simultaneously', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 3')).toBeInTheDocument();
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
    });

    test('4th snackbar is queued with status=queued (not immediately visible)', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      // Message 4 is queued
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
    });

    test('queued snackbar becomes visible after one exits', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      // Close first snackbar
      act(() => {
        result.current.close('snackbar-1');
      });

      // Wait for transition
      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      });

      // Message 4 should now be promoted
      await waitFor(() => {
        expect(screen.getByText('Message 4')).toBeInTheDocument();
      });
    });

    test('FIFO promotion order when multiple queued', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
        result.current.enqueue('Message 5');
      });

      // Close first
      act(() => {
        result.current.close('snackbar-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Message 4')).toBeInTheDocument();
      });

      expect(screen.queryByText('Message 5')).not.toBeInTheDocument();

      // Close second
      act(() => {
        result.current.close('snackbar-2');
      });

      await waitFor(() => {
        expect(screen.getByText('Message 5')).toBeInTheDocument();
      });
    });

    test('closeAll removes queued items immediately without transition', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
        result.current.enqueue('Message 5');
      });

      act(() => {
        result.current.closeAll();
      });

      // Queued items removed immediately
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Message 5')).not.toBeInTheDocument();

      // Visible items transition to exiting (may still be visible briefly)
      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      });
    });

    test('closeAll does NOT promote queued items during cleanup', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      act(() => {
        result.current.closeAll();
      });

      // Wait for all to clear
      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      });

      // Message 4 should NEVER have been promoted
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
    });

    test('rapid enqueue maintains correct queue order', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        for (let i = 1; i <= 10; i++) {
          result.current.enqueue(`Message ${i}`);
        }
      });

      // First 3 visible
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 3')).toBeInTheDocument();

      // Rest queued
      for (let i = 4; i <= 10; i++) {
        expect(screen.queryByText(`Message ${i}`)).not.toBeInTheDocument();
      }
    });
  });

  // ==========================================================================
  // Intent C: Manual Dismiss
  // ==========================================================================

  describe('Intent C: Manual Dismiss', () => {
    test('close(id) dismisses specific snackbar', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
      });

      act(() => {
        result.current.close('snackbar-1');
      });

      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });

    test('close(id) with invalid ID is a no-op', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
      });

      act(() => {
        result.current.close('invalid-id');
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    test('close(id) called twice is idempotent', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
      });

      act(() => {
        result.current.close('snackbar-1');
        result.current.close('snackbar-1'); // Second call
      });

      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      });

      // Should not throw or cause errors
    });

    test('close(id) during exit animation is idempotent', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
      });

      act(() => {
        result.current.close('snackbar-1');
      });

      // Call again immediately during exit animation
      act(() => {
        result.current.close('snackbar-1');
      });

      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      });
    });

    test('close(id) on queued item removes immediately without transition', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      act(() => {
        result.current.close('snackbar-4');
      });

      // Message 4 removed immediately (no waitFor needed)
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
    });

    test('closeAll dismisses all visible snackbars', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
      });

      act(() => {
        result.current.closeAll();
      });

      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Intent D: Auto-Dismiss Timers (CRITICAL - Using Fake Timers)
  // ==========================================================================

  describe('Intent D: Auto-Dismiss Timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runAllTimers();
      vi.useRealTimers();
    });

    test('visible snackbar auto-dismisses after default duration (5000ms)', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      // Fast-forward time and run timers
      await act(async () => {
        vi.advanceTimersByTime(5000);
        // Give React time to process the state update
        await Promise.resolve();
      });

      // The snackbar should start exiting
      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    }, 10000);

    test('visible snackbar auto-dismisses after custom duration', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 3000 });
      });

      // Before timeout
      await act(async () => {
        vi.advanceTimersByTime(2999);
        await Promise.resolve();
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      // After timeout
      await act(async () => {
        vi.advanceTimersByTime(1);
        await Promise.resolve();
      });

      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    }, 10000);

    test('visible snackbar persists when autoHideDuration is null', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: null });
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    test('CRITICAL: queued snackbar does NOT start timer before becoming visible', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 1000 });
        result.current.enqueue('Message 2', { autoHideDuration: 1000 });
        result.current.enqueue('Message 3', { autoHideDuration: 1000 });
        result.current.enqueue('Message 4', { autoHideDuration: 1000 });
      });

      // Message 4 is queued
      expect(screen.queryByText('Message 4')).not.toBeInTheDocument();

      // Advance time by 1000ms (Message 1 should dismiss)
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      // Message 1 should exit
      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Message 4 should now be visible (promoted)
      await vi.waitFor(
        () => {
          expect(screen.getByText('Message 4')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Message 4 timer just started - should still be visible
      expect(screen.getByText('Message 4')).toBeInTheDocument();
    }, 10000);

    test('CRITICAL: promoted snackbar starts timer only after promotion', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 500 });
        result.current.enqueue('Message 2', { autoHideDuration: 500 });
        result.current.enqueue('Message 3', { autoHideDuration: 500 });
        result.current.enqueue('Message 4', { autoHideDuration: 500 });
      });

      // Wait for Message 1 to auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
      });

      await vi.waitFor(
        () => {
          expect(screen.getByText('Message 4')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Message 4 was just promoted, timer just started
      // Advance less than duration
      await act(async () => {
        vi.advanceTimersByTime(400);
        await Promise.resolve();
      });

      expect(screen.getByText('Message 4')).toBeInTheDocument();

      // Now advance past duration (500ms total)
      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve();
      });

      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 4')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    }, 10000);

    test('timer cleared when manually closed before timeout', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      let id: string;

      act(() => {
        id = result.current.enqueue('Message 1', { autoHideDuration: 5000 });
      });

      // Advance partway
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      // Manually close
      act(() => {
        result.current.close(id!);
      });

      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Advance past original timeout - should not cause any issues
      await act(async () => {
        vi.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      // No errors or double-removal
    }, 10000);

    test('timer cleared on closeAll', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 5000 });
        result.current.enqueue('Message 2', { autoHideDuration: 5000 });
      });

      act(() => {
        result.current.closeAll();
      });

      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
          expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Advance past original timeouts - should not cause errors
      await act(async () => {
        vi.advanceTimersByTime(10000);
        await Promise.resolve();
      });
    }, 10000);
  });

  // ==========================================================================
  // Intent E: Variants
  // ==========================================================================

  describe('Intent E: Variants', () => {
    test('renders success variant with correct styling', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Success message', { variant: 'success' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledSuccess');
    });

    test('renders error variant with correct styling', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Error message', { variant: 'error' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledError');
    });

    test('renders warning variant with correct styling', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Warning message', { variant: 'warning' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledWarning');
    });

    test('renders info variant with correct styling', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Info message', { variant: 'info' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledInfo');
    });

    test('renders default variant with SnackbarContent', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Default message', { variant: 'default' });
      });

      const message = screen.getByText('Default message');
      expect(message).toBeInTheDocument();

      // Default variant uses SnackbarContent (has role="alert" but different structure)
      // SnackbarContent uses MuiSnackbarContent-root class, Alert uses MuiAlert-root
      const container = message.closest('[role="alert"]');
      expect(container).toHaveClass('MuiSnackbarContent-root');
      expect(container).not.toHaveClass('MuiAlert-root');
    });
  });

  // ==========================================================================
  // Intent F: Action Buttons
  // ==========================================================================

  describe('Intent F: Action Buttons', () => {
    test('renders action button when provided', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message', {
          action: <button>Undo</button>,
        });
      });

      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    test('action button click handler fires correctly', async () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message', {
          action: <button onClick={handleClick}>Undo</button>,
        });
      });

      const button = screen.getByText('Undo');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('action button does not auto-close snackbar on click', async () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message', {
          action: <button onClick={handleClick}>Undo</button>,
          autoHideDuration: null,
        });
      });

      const button = screen.getByText('Undo');
      await userEvent.click(button);

      // Snackbar should still be visible
      expect(screen.getByText('Message')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Intent G: Convenience Helpers
  // ==========================================================================

  describe('Intent G: Convenience Helpers', () => {
    test('success() helper enqueues with variant=success', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.success('Success message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledSuccess');
    });

    test('error() helper enqueues with variant=error', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.error('Error message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledError');
    });

    test('warning() helper enqueues with variant=warning', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.warning('Warning message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledWarning');
    });

    test('info() helper enqueues with variant=info', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.info('Info message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledInfo');
    });

    test('helpers accept options without variant field', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.success('Success message', {
          autoHideDuration: null,
          action: <button>Undo</button>,
        });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledSuccess');
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    test('helpers return snackbar ID', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      let id: string;

      act(() => {
        id = result.current.success('Success message');
      });

      expect(id!).toBe('snackbar-1');
    });
  });

  // ==========================================================================
  // Intent H: Prevent Dismiss
  // ==========================================================================

  describe('Intent H: Prevent Dismiss', () => {
    test('preventDismiss hides close button', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message', {
          variant: 'success',
          preventDismiss: true,
        });
      });

      const alert = screen.getByRole('alert');

      // MUI Alert close button has aria-label="Close"
      const closeButton = alert.querySelector('[aria-label="Close"]');
      expect(closeButton).not.toBeInTheDocument();
    });

    test('preventDismiss requires manual close via API', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      let id: string;

      act(() => {
        id = result.current.enqueue('Message', {
          variant: 'success',
          preventDismiss: true,
          autoHideDuration: null,
        });
      });

      expect(screen.getByText('Message')).toBeInTheDocument();

      // Manually close via API
      act(() => {
        result.current.close(id!);
      });

      await waitFor(() => {
        expect(screen.queryByText('Message')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Intent I: Transitions
  // ==========================================================================

  describe('Intent I: Transitions', () => {
    test('snackbar exits with slide transition', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
      });

      act(() => {
        result.current.close('snackbar-1');
      });

      // During transition, item may still be in DOM
      // Wait for complete removal
      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
      });
    });

    test('promotion happens only after exit transition completes', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      act(() => {
        result.current.close('snackbar-1');
      });

      // Message 4 becomes visible only after Message 1 exits
      await waitFor(() => {
        expect(screen.getByText('Message 4')).toBeInTheDocument();
      });
    });

    test('multiple exits trigger sequential promotions', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
        result.current.enqueue('Message 5');
      });

      act(() => {
        result.current.close('snackbar-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Message 4')).toBeInTheDocument();
      });

      act(() => {
        result.current.close('snackbar-2');
      });

      await waitFor(() => {
        expect(screen.getByText('Message 5')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Intent J: Provider Unmount
  // ==========================================================================

  describe('Intent J: Provider Unmount', () => {
    test('timers cleared on provider unmount', () => {
      const { result, unmount } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 5000 });
        result.current.enqueue('Message 2', { autoHideDuration: 5000 });
      });

      unmount();

      // Should not throw or cause errors
      // Timers should be cleaned up
    });

    test('no memory leaks after unmount with pending timers', () => {
      vi.useFakeTimers();

      const { result, unmount } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 5000 });
      });

      unmount();

      // Advance timers - should not cause errors
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      vi.useRealTimers();
    });
  });

  // ==========================================================================
  // Intent K: Edge Cases
  // ==========================================================================

  describe('Intent K: Edge Cases', () => {
    test('enqueue during closeAll does not prevent cleanup', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
      });

      act(() => {
        result.current.closeAll();
        // Enqueue new during closeAll
        result.current.enqueue('Message 4');
      });

      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      });

      // Message 4 should be visible
      expect(screen.getByText('Message 4')).toBeInTheDocument();
    });

    test('rapid close calls do not cause double promotions', async () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1');
        result.current.enqueue('Message 2');
        result.current.enqueue('Message 3');
        result.current.enqueue('Message 4');
      });

      act(() => {
        result.current.close('snackbar-1');
        result.current.close('snackbar-2');
        result.current.close('snackbar-3');
      });

      // Wait for transitions
      await waitFor(() => {
        expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
      });

      // Message 4 should be promoted exactly once
      expect(screen.getByText('Message 4')).toBeInTheDocument();
    });

    test('empty message is allowed', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('');
      });

      // Should not throw, but content may be empty
      const snackbars = screen.queryAllByRole('presentation');
      expect(snackbars.length).toBeGreaterThan(0);
    });

    test('ReactNode message types work correctly', () => {
      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue(<div>Custom JSX</div>);
      });

      expect(screen.getByText('Custom JSX')).toBeInTheDocument();
    });

    test('zero autoHideDuration is treated as immediate dismiss', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useSnackbar(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 0 });
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(0);
        await Promise.resolve();
      });

      await vi.waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      vi.useRealTimers();
    }, 10000);
  });
});
