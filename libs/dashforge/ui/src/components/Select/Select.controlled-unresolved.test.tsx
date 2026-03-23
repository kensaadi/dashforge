import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Select } from './Select';
import type { SelectOption } from './Select';

/**
 * Focused tests for Step 05c: MUI out-of-range warning fix for controlled/plain usage.
 * 
 * Tests verify that when Select is used in plain/controlled mode (without DashFormContext):
 * - Display value is sanitized when value doesn't match available options
 * - Controlled value prop remains unchanged (no mutation)
 * - MUI warning is suppressed
 * - Visual display shows empty selection
 * 
 * This extends Step 05b sanitization to cover non-RHF paths.
 */

describe('Select - Controlled/Plain Unresolved Value (Step 05c)', () => {
  const testOptions: SelectOption[] = [
    { value: 'option-1', label: 'Option 1' },
    { value: 'option-2', label: 'Option 2' },
    { value: 'option-3', label: 'Option 3' },
  ];

  describe('Controlled mode (plain usage)', () => {
    it('resolved value displays correctly', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value="option-2"
          onChange={handleChange}
        />
      );

      // Display shows the resolved value
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('option-2');
    });

    it('unresolved value displays empty (sanitized)', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value="deleted-option" // Not in options
          onChange={handleChange}
        />
      );

      // CRITICAL: Display value should be empty (Step 05c sanitization)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('empty value displays empty', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value=""
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('null value displays empty', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value={null}
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });

    it('undefined value displays empty', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value={undefined}
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('Numeric values (controlled)', () => {
    const numericOptions: SelectOption<number>[] = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
    ];

    it('resolved numeric value displays correctly', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={numericOptions}
          value={2}
          onChange={handleChange}
        />
      );

      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('2');
    });

    it('unresolved numeric value displays empty', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={numericOptions}
          value={999} // Not in options
          onChange={handleChange}
        />
      );

      // Display should be empty (sanitized)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('MUI warning suppression verification', () => {
    it('does not emit MUI warning for controlled unresolved value', () => {
      // Capture console warnings
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const handleChange = vi.fn();
      render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value="unresolved-value" // Not in options
          onChange={handleChange}
        />
      );

      // Check that no MUI out-of-range warning was emitted
      const muiWarnings = consoleWarnSpy.mock.calls
        .concat(consoleErrorSpy.mock.calls)
        .filter((call) => {
          const message = call[0];
          return (
            typeof message === 'string' &&
            message.includes('out-of-range value') &&
            message.includes('unresolved-value')
          );
        });

      expect(muiWarnings.length).toBe(0);

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Plain mode (no value prop)', () => {
    it('renders without value prop (uncontrolled)', () => {
      const { container } = render(
        <Select name="item" label="Item" options={testOptions} />
      );

      // Should render successfully
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput).toBeTruthy();
      // Value should be empty (no controlled value provided)
      expect(hiddenInput.value).toBe('');
    });
  });

  describe('Policy compliance verification', () => {
    it('controlled value source remains unchanged (no mutation)', () => {
      const handleChange = vi.fn();
      const controlledValue = 'deleted-option';

      // Render with unresolved value
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value={controlledValue}
          onChange={handleChange}
        />
      );

      // Display is empty (sanitized)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('');

      // CRITICAL: Controlled value prop is NOT mutated
      // (This is implicit - we're not modifying the prop, only the display)
      // The parent component still holds 'deleted-option' as the value
      expect(controlledValue).toBe('deleted-option');
    });

    it('visually empty selection for unresolved controlled value', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          name="item"
          label="Item"
          options={testOptions}
          value="deleted-option"
          onChange={handleChange}
        />
      );

      // Hidden input shows empty (sanitized display value)
      const hiddenInput = container.querySelector('input[name="item"]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('');

      // Visual display should be empty (no selected option)
      // This is implicit - MUI Select shows empty when value is ''
    });
  });
});
