import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { Select } from './Select';
import type { SelectOption } from './Select';
import { renderWithBridge, renderWithRuntime } from '../../test-utils';

/**
 * Focused tests for Step 05b: MUI out-of-range warning fix.
 * 
 * Tests verify that when a field value doesn't match any available option:
 * 1. The visual display is empty (no MUI warning)
 * 2. The RHF value remains unchanged (no automatic reset)
 * 3. Resolved values still render normally
 * 
 * Policy: reaction-v2.md Section 3.2
 * - UI displays no selected value
 * - Form value remains unchanged
 * - NO automatic reset
 */
describe('Select - Unresolved Value Display (Step 05b)', () => {
  const testOptions = [
    { value: 'option-1', label: 'Option 1' },
    { value: 'option-2', label: 'Option 2' },
    { value: 'option-3', label: 'Option 3' },
  ];

  describe('Static mode', () => {
    it('resolved value displays correctly', () => {
      const { state, container } = renderWithBridge(
        <Select name="item" label="Item" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'option-2' },
          },
        }
      );

      // Bridge value is correct
      expect(state?.values.item).toBe('option-2');

      // Display shows the value (find hidden input by name)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('option-2');
    });

    it('unresolved value displays empty, RHF value unchanged', () => {
      const { state, container } = renderWithBridge(
        <Select name="item" label="Item" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'deleted-option' }, // Not in options
          },
        }
      );

      // CRITICAL: RHF value must remain unchanged
      expect(state?.values.item).toBe('deleted-option');

      // Display value should be empty (prevents MUI warning)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('empty value displays empty', () => {
      const { state, container } = renderWithBridge(
        <Select name="item" label="Item" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { item: '' },
          },
        }
      );

      expect(state?.values.item).toBe('');

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('null value displays empty', () => {
      const { state, container } = renderWithBridge(
        <Select name="item" label="Item" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { item: null },
          },
        }
      );

      expect(state?.values.item).toBeNull();

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('Runtime mode (optionsFromFieldData)', () => {
    it('resolved value displays correctly when runtime ready', () => {
      const { state, container } = renderWithRuntime(
        <Select name="item" label="Item" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'option-2' },
          },
          initialRuntime: {
            item: {
              status: 'ready',
              error: null,
              data: { options: testOptions },
            },
          },
        }
      );

      // Bridge value is correct
      expect(state?.values.item).toBe('option-2');

      // Display shows the value
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('option-2');
    });

    it('unresolved value displays empty when runtime ready, RHF unchanged', () => {
      const { state, container } = renderWithRuntime(
        <Select name="item" label="Item" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'deleted-option' },
          },
          initialRuntime: {
            item: {
              status: 'ready',
              error: null,
              data: { options: testOptions },
            },
          },
        }
      );

      // CRITICAL: RHF value must remain unchanged
      expect(state?.values.item).toBe('deleted-option');

      // Display value should be empty (prevents MUI warning)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('value is sanitized during runtime loading (Step 05d fix)', () => {
      // Step 05d: During loading, sanitization now applies (empty array causes sanitization)
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
        <DashForm defaultValues={{ item: 'some-value' }} reactions={reactions}>
          <Select name="item" optionsFromFieldData />
        </DashForm>
      );

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      // Step 05d: Value is now sanitized to empty during loading (prevents MUI warnings)
      expect(hiddenInput.value).toBe('');
    });

    it('empty options with non-empty value displays empty', () => {
      const { state, container } = renderWithRuntime(
        <Select name="item" label="Item" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'some-value' },
          },
          initialRuntime: {
            item: {
              status: 'ready',
              error: null,
              data: { options: [] },
            },
          },
        }
      );

      // RHF value unchanged
      expect(state?.values.item).toBe('some-value');

      // Display empty (unresolved)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('Generic option shape with mappers', () => {
    interface CustomOption {
      id: number;
      name: string;
      active: boolean;
    }

    const customOptions: CustomOption[] = [
      { id: 1, name: 'First', active: true },
      { id: 2, name: 'Second', active: true },
      { id: 3, name: 'Third', active: false },
    ];

    it('resolved numeric value displays correctly', () => {
      const { state, container } = renderWithBridge(
        <Select<number>
          name="item"
          label="Item"
          options={customOptions as unknown as SelectOption<number>[]}
          getOptionValue={(opt) => (opt as CustomOption).id}
          getOptionLabel={(opt) => (opt as CustomOption).name}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 2 },
          },
        }
      );

      expect(state?.values.item).toBe(2);

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('2');
    });

    it('unresolved numeric value displays empty, RHF unchanged', () => {
      const { state, container } = renderWithBridge(
        <Select<number>
          name="item"
          label="Item"
          options={customOptions as unknown as SelectOption<number>[]}
          getOptionValue={(opt) => (opt as CustomOption).id}
          getOptionLabel={(opt) => (opt as CustomOption).name}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 999 }, // Not in options
          },
        }
      );

      // RHF value unchanged
      expect(state?.values.item).toBe(999);

      // Display empty
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('MUI warning suppression verification', () => {
    it('does not emit MUI warning for unresolved value', () => {
      // Spy on console.error to catch MUI warnings
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithBridge(
        <Select name="item" label="Item" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { item: 'unresolved-value' },
          },
        }
      );

      // Check that no MUI "out-of-range" warning was emitted
      const muiWarnings = consoleErrorSpy.mock.calls.filter((call) =>
        call.some((arg) =>
          String(arg).includes('out of range') ||
          String(arg).includes('out-of-range') ||
          String(arg).includes('not a valid value')
        )
      );

      expect(muiWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });
});
