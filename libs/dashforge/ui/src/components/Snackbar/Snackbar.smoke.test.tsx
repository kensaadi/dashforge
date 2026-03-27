import { screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SnackbarProvider } from './SnackbarProvider';
import { useSnackbar } from './useSnackbar';

// Smoke tests for Snackbar - validates core functionality without complex timer testing
describe('Snackbar Smoke Tests', () => {
  describe('Provider Setup', () => {
    test('throws error when useSnackbar called outside provider', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSnackbar());
      }).toThrow('useSnackbar must be used within SnackbarProvider');

      consoleErrorSpy.mockRestore();
    });

    test('provides API when useSnackbar called inside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.enqueue).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.closeAll).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.info).toBe('function');
    });
  });

  describe('Basic Enqueue', () => {
    test('enqueue shows snackbar immediately', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Test message');
      });

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('enqueue returns unique incremental ID', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      let id1: string;
      let id2: string;
      let id3: string;

      act(() => {
        id1 = result.current.enqueue('Message 1');
        id2 = result.current.enqueue('Message 2');
        id3 = result.current.enqueue('Message 3');
      });

      expect(id1!).toBe('snackbar-1');
      expect(id2!).toBe('snackbar-2');
      expect(id3!).toBe('snackbar-3');
    });
  });

  describe('Queue Management', () => {
    test('shows max 3 snackbars simultaneously', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

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
  });

  describe('Manual Dismiss', () => {
    test('close(id) dismisses specific snackbar', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

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

    test('closeAll dismisses all visible snackbars', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

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

  describe('Variants', () => {
    test('renders success variant', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Success message', { variant: 'success' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledSuccess');
    });

    test('renders error variant', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Error message', { variant: 'error' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledError');
    });
  });

  describe('Convenience Helpers', () => {
    test('success() helper enqueues with variant=success', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.success('Success message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledSuccess');
    });

    test('error() helper enqueues with variant=error', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.error('Error message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledError');
    });

    test('warning() helper enqueues with variant=warning', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.warning('Warning message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledWarning');
    });

    test('info() helper enqueues with variant=info', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.info('Info message');
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-filledInfo');
    });
  });

  describe('Auto-Dismiss (Basic)', () => {
    test('snackbar auto-dismisses after duration', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: 100 });
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.queryByText('Message 1')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    test('snackbar persists when autoHideDuration is null', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Message 1', { autoHideDuration: null });
      });

      expect(screen.getByText('Message 1')).toBeInTheDocument();

      // Wait a bit to ensure it doesn't auto-dismiss
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    test('renders action button when provided', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SnackbarProvider>{children}</SnackbarProvider>
      );

      const { result } = renderHook(() => useSnackbar(), { wrapper });

      act(() => {
        result.current.enqueue('Message', {
          action: <button>Undo</button>,
        });
      });

      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });
});
