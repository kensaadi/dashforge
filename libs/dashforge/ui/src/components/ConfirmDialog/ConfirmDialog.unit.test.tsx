import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialogProvider } from './ConfirmDialogProvider';
import { useConfirm } from './useConfirm';
import type { ConfirmResult } from './types';

/**
 * Unit tests for ConfirmDialog system.
 * Tests cover provider setup, dialog rendering, promise resolution with semantic results,
 * state management, props forwarding, re-entrancy, description rendering, and provider unmount.
 *
 * TDD-first: All tests written before implementation.
 */
describe('ConfirmDialog', () => {
  describe('Intent A: Provider Setup', () => {
    it('throws error when useConfirm called outside ConfirmDialogProvider', () => {
      // Test that hook throws when used outside provider
      const TestComponent = () => {
        useConfirm(); // No provider wrapping
        return null;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useConfirm must be used within ConfirmDialogProvider');
    });

    it('provides confirm function via useConfirm hook', () => {
      const TestComponent = () => {
        const confirm = useConfirm();
        expect(typeof confirm).toBe('function');
        return <div>Test</div>;
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Intent B: Dialog Rendering', () => {
    it('does not render dialog on mount', () => {
      render(
        <ConfirmDialogProvider>
          <div>App content</div>
        </ConfirmDialogProvider>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog when confirm is called', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button onClick={() => confirm({ title: 'Test Title' })}>Open</button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders title and description from options', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Delete User',
                description: 'This cannot be undone.',
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    });

    it('renders custom confirm and cancel button texts', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Delete?',
                confirmText: 'Yes, Delete',
                cancelText: 'No, Keep',
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(
        screen.getByRole('button', { name: 'Yes, Delete' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'No, Keep' })
      ).toBeInTheDocument();
    });

    it('uses default "Confirm" and "Cancel" when texts not provided', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button onClick={() => confirm({ title: 'Are you sure?' })}>
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(
        screen.getByRole('button', { name: 'Confirm' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders string description wrapped in DialogContentText', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Title',
                description: 'Simple text description',
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const text = screen.getByText('Simple text description');
      expect(text.closest('.MuiDialogContentText-root')).toBeInTheDocument();
    });

    it('renders ReactNode description directly without DialogContentText wrapper', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Title',
                description: (
                  <div data-testid="custom-description">
                    <strong>Bold text</strong>
                  </div>
                ),
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const custom = screen.getByTestId('custom-description');
      expect(custom).toBeInTheDocument();
      expect(
        custom.closest('.MuiDialogContentText-root')
      ).not.toBeInTheDocument();
    });

    it('does not render DialogContent when description is omitted', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button onClick={() => confirm({ title: 'Just title' })}>Open</button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(
        document.querySelector('.MuiDialogContent-root')
      ).not.toBeInTheDocument();
    });
  });

  describe('Intent C: Promise Resolution', () => {
    it('resolves promise with confirmed status when confirm button clicked', async () => {
      const user = userEvent.setup();
      let result: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          result = await confirm({ title: 'Confirm?' });
        };
        return <button onClick={handleClick}>Open</button>;
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(result).toEqual({ status: 'confirmed' });
      });
    });

    it('resolves promise with cancelled status when cancel button clicked', async () => {
      const user = userEvent.setup();
      let result: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          result = await confirm({ title: 'Confirm?' });
        };
        return <button onClick={handleClick}>Open</button>;
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(result).toEqual({
          status: 'cancelled',
          reason: 'cancel-button',
        });
      });
    });

    it('resolves promise with cancelled/backdrop status when backdrop clicked', async () => {
      const user = userEvent.setup();
      let result: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          result = await confirm({ title: 'Confirm?' });
        };
        return <button onClick={handleClick}>Open</button>;
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        await user.click(backdrop);
      }

      await waitFor(() => {
        expect(result).toEqual({ status: 'cancelled', reason: 'backdrop' });
      });
    });

    it('resolves promise with cancelled/escape-key status when ESC key pressed', async () => {
      const user = userEvent.setup();
      let result: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          result = await confirm({ title: 'Confirm?' });
        };
        return <button onClick={handleClick}>Open</button>;
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(result).toEqual({ status: 'cancelled', reason: 'escape-key' });
      });
    });

    it('returns blocked status immediately when confirm called while dialog already open', async () => {
      const user = userEvent.setup();
      let result1: ConfirmResult | undefined;
      let result2: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          // First call - opens dialog
          const promise1 = confirm({ title: 'First?' });

          // Second call - immediate blocked result (no queue)
          result2 = await confirm({ title: 'Second?' });

          // Complete first dialog
          result1 = await promise1;
        };
        return <button onClick={handleClick}>Open</button>;
      };

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      // Second call should return blocked immediately
      await waitFor(() => {
        expect(result2).toEqual({
          status: 'blocked',
          reason: 'reentrant-call',
        });
      });

      // First dialog should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('First?')).toBeInTheDocument();

      // Dev warning should be logged (if not production)
      if (process.env.NODE_ENV !== 'production') {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Cannot open new confirm dialog while another is pending'
          )
        );
      }

      // Complete first dialog
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      await waitFor(() => {
        expect(result1).toEqual({ status: 'confirmed' });
      });

      consoleWarnSpy.mockRestore();
    });

    it('resolves pending promise with provider-unmount when provider unmounts', async () => {
      const user = userEvent.setup();
      let result: ConfirmResult | undefined;

      const TestComponent = () => {
        const confirm = useConfirm();
        const handleClick = async () => {
          result = await confirm({ title: 'Confirm?' });
        };
        return <button onClick={handleClick}>Open</button>;
      };

      const { unmount } = render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Unmount provider while dialog is open
      unmount();

      // Promise should resolve with provider-unmount
      await waitFor(() => {
        expect(result).toEqual({
          status: 'cancelled',
          reason: 'provider-unmount',
        });
      });
    });
  });

  describe('Intent D: Dialog State Management', () => {
    it('closes dialog after confirm button clicked', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button onClick={() => confirm({ title: 'Confirm?' })}>Open</button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes dialog after cancel button clicked', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button onClick={() => confirm({ title: 'Confirm?' })}>Open</button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Intent E: Button Props Forwarding', () => {
    it('forwards confirmButtonProps to confirm button', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Delete?',
                confirmButtonProps: { color: 'error', variant: 'contained' },
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmBtn).toHaveClass('MuiButton-containedError');
    });

    it('forwards cancelButtonProps to cancel button', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Cancel?',
                cancelButtonProps: { color: 'secondary' },
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelBtn).toHaveClass('MuiButton-textSecondary');
    });
  });

  describe('Intent F: DialogProps Forwarding', () => {
    it('forwards maxWidth from dialogProps to MUI Dialog', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Test',
                dialogProps: { maxWidth: 'xs' },
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('MuiDialog-paperWidthXs');
    });

    it('forwards fullScreen from dialogProps to MUI Dialog', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const confirm = useConfirm();
        return (
          <button
            onClick={() =>
              confirm({
                title: 'Test',
                dialogProps: { fullScreen: true },
              })
            }
          >
            Open
          </button>
        );
      };

      render(
        <ConfirmDialogProvider>
          <TestComponent />
        </ConfirmDialogProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
    });
  });
});
