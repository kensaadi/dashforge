/**
 * Step 05d: Runtime Select Loading State MUI Warning Fix Tests
 * 
 * Purpose:
 * - Verify MUI out-of-range warnings are eliminated during runtime loading state
 * - Validate sanitization works when runtime status is 'loading' or 'idle'
 * - Confirm display value is sanitized to empty when options not yet loaded
 * 
 * Scope:
 * - Runtime-driven Select (optionsFromFieldData=true)
 * - Loading state (status='loading')
 * - Idle state (status='idle')
 * - Error state (status='error')
 * 
 * Policy Compliance (reaction-v2.md):
 * - No reconciliation
 * - No automatic value reset
 * - Display-layer only sanitization
 * - Form value remains unchanged
 */

import { render } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { Select } from './Select';

describe('Select - Runtime Loading State (Step 05d)', () => {
  describe('Loading state with preset value', () => {
    it('should sanitize display value to empty during loading (prevents MUI warning)', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items',
          watch: [],
          run: async (ctx) => {
            // Set loading state (options not yet available)
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });
            // Intentionally don't complete - stay in loading state
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }} // Value exists before options load
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // During loading, display value should be sanitized to empty
      // (normalizedOptions is empty, so value doesn't match any option)
      expect((input as HTMLInputElement).value).toBe('');

      // No MUI out-of-range warnings
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Idle state with preset value', () => {
    it('should sanitize display value to empty in idle state', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // No reactions - runtime stays in idle state
      const { container } = render(
        <DashForm defaultValues={{ item: 'preset-value' }}>
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // In idle state with no options, display is empty
      expect((input as HTMLInputElement).value).toBe('');

      // No warnings
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not be disabled in idle state (no explicit loading)', () => {
      const { container } = render(
        <DashForm defaultValues={{ item: 'preset-value' }}>
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // Not disabled in idle state (only loading state disables)
      expect(input).not.toBeDisabled();
    });
  });

  describe('Error state with preset value', () => {
    it('should sanitize display value to empty in error state', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items-error',
          watch: [],
          run: async (ctx) => {
            // Simulate fetch error
            ctx.setRuntime('item', {
              status: 'error',
              data: null,
              error: 'Failed to load options',
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // In error state with no options, display is empty
      expect((input as HTMLInputElement).value).toBe('');

      // No MUI warnings
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not be disabled in error state', () => {
      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items-error',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'error',
              data: null,
              error: 'Failed to load options',
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // Not disabled in error state
      expect(input).not.toBeDisabled();
    });
  });

  describe('Transition from loading to ready', () => {
    it('should display resolved value after options load', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items-async',
          watch: [],
          run: async (ctx) => {
            // Initial loading state
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });

            // Simulate async fetch
            await new Promise(resolve => setTimeout(resolve, 10));

            // Options loaded
            ctx.setRuntime('item', {
              status: 'ready',
              data: {
                options: [
                  { value: 'preset-value', label: 'Preset Value' },
                  { value: 'other-value', label: 'Other Value' },
                ],
              },
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');

      // Wait for async reaction to complete
      await vi.waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('preset-value');
      }, { timeout: 1000 });

      // After loading completes, value is resolved and displays correctly
      expect((input as HTMLInputElement).value).toBe('preset-value');

      // No warnings throughout the entire lifecycle
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should display empty for unresolved value after options load', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items-unresolved',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            // Options loaded, but preset value doesn't match
            ctx.setRuntime('item', {
              status: 'ready',
              data: {
                options: [
                  { value: 'valid-a', label: 'Valid A' },
                  { value: 'valid-b', label: 'Valid B' },
                ],
              },
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'unresolved-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');

      // Wait for async reaction to complete
      await vi.waitFor(() => {
        const options = container.querySelectorAll('[role="option"]');
        return options.length > 0;
      }, { timeout: 1000 });

      // After options load, unresolved value displays as empty
      expect((input as HTMLInputElement).value).toBe('');

      // No MUI warnings (sanitization prevents them)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Policy compliance', () => {
    it('should sanitize display value during loading (display-layer only)', () => {
      // This test verifies display sanitization without form value access
      // Policy: Display is sanitized, but form value remains unchanged (see integration tests)
      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');

      // Display is sanitized to empty during loading
      expect((input as HTMLInputElement).value).toBe('');
      
      // Note: Form value verification requires integration test with form.getValues()
      // The important behavior is: display sanitization prevents MUI warnings
    });

    it('should sanitize display value in idle state', () => {
      const { container } = render(
        <DashForm defaultValues={{ item: 'preset-value' }}>
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');

      // Display is empty (no options loaded)
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('should sanitize display value in error state', () => {
      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items-error',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'error',
              data: null,
              error: 'Failed to load',
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: 'preset-value' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');

      // Display is empty (error state, no options)
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  describe('Edge cases', () => {
    it('should handle numeric values during loading', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ numItem: number }>[] = [
        {
          id: 'load-numeric',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('numItem', {
              status: 'loading',
              data: null,
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ numItem: 123 }}
          reactions={reactions}
        >
          <Select<number>
            name="numItem"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="numItem"]');
      
      // Numeric value sanitized to empty during loading
      expect((input as HTMLInputElement).value).toBe('');

      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty string value during loading', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string }>[] = [
        {
          id: 'load-items',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: '' }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // Empty string is valid "no selection" - passes through
      expect((input as HTMLInputElement).value).toBe('');

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle null value during loading', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const reactions: ReactionDefinition<{ item: string | null }>[] = [
        {
          id: 'load-items',
          watch: [],
          run: async (ctx) => {
            ctx.setRuntime('item', {
              status: 'loading',
              data: null,
              error: null,
            });
          },
        },
      ];

      const { container } = render(
        <DashForm
          defaultValues={{ item: null }}
          reactions={reactions}
        >
          <Select
            name="item"
            optionsFromFieldData
          />
        </DashForm>
      );

      const input = container.querySelector('input[name="item"]');
      
      // null is valid "no selection" - displays as empty
      expect((input as HTMLInputElement).value).toBe('');

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
