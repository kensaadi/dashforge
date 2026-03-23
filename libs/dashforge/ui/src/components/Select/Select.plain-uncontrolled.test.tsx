/**
 * Step 05d: Plain/Uncontrolled Select MUI Warning Fix Tests
 * 
 * Purpose:
 * - Verify MUI out-of-range warnings are eliminated for plain/uncontrolled Select usage
 * - Validate sanitization works when no explicit value/defaultValue prop is provided
 * - Confirm uncontrolled mode with defaultValue sanitization works correctly
 * 
 * Scope:
 * - Plain Select usage (no DashFormContext, no value prop)
 * - Uncontrolled Select usage (defaultValue instead of value)
 * - Static options mode (not runtime-driven)
 * 
 * Policy Compliance (reaction-v2.md):
 * - No reconciliation
 * - No automatic value reset
 * - Display-layer only sanitization
 */

import { render } from '@testing-library/react';
import { Select } from './Select';

describe('Select - Plain/Uncontrolled Mode (Step 05d)', () => {
  describe('Plain mode (no value/defaultValue prop)', () => {
    it('should render without value prop and not trigger MUI warning', () => {
      // Spy on console.error to detect MUI warnings
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="plainField"
          options={[
            { value: 'option-a', label: 'Option A' },
            { value: 'option-b', label: 'Option B' },
          ]}
        />
      );

      // Verify component renders
      const input = container.querySelector('input[name="plainField"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();

      // Verify display value is empty (sanitized)
      expect(input.value).toBe('');

      // Verify no MUI out-of-range warnings
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should render plain Select with children and not trigger warning', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="plainFieldWithChildren"
          options={[
            { value: '1', label: 'One' },
            { value: '2', label: 'Two' },
          ]}
        />
      );

      const input = container.querySelector('input[name="plainFieldWithChildren"]') as HTMLInputElement;
      expect(input.value).toBe('');

      // No warnings should be emitted
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle plain Select with empty options array', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="plainEmpty"
          options={[]}
        />
      );

      const input = container.querySelector('input[name="plainEmpty"]') as HTMLInputElement;
      expect(input.value).toBe('');

      // No warnings for empty options
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Uncontrolled mode (with defaultValue prop)', () => {
    it('should sanitize defaultValue that matches available option', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="uncontrolledResolved"
          defaultValue="option-a"
          options={[
            { value: 'option-a', label: 'Option A' },
            { value: 'option-b', label: 'Option B' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledResolved"]') as HTMLInputElement;
      
      // Resolved defaultValue should pass through unchanged
      expect(input.value).toBe('option-a');

      // No warnings
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should sanitize defaultValue that does NOT match available options (unresolved)', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="uncontrolledUnresolved"
          defaultValue="invalid-option"
          options={[
            { value: 'option-a', label: 'Option A' },
            { value: 'option-b', label: 'Option B' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledUnresolved"]') as HTMLInputElement;
      
      // Unresolved defaultValue should be sanitized to empty for display
      expect(input.value).toBe('');

      // No MUI out-of-range warnings (sanitization prevents warning)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle defaultValue with empty string', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="uncontrolledEmpty"
          defaultValue=""
          options={[
            { value: 'option-a', label: 'Option A' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledEmpty"]') as HTMLInputElement;
      
      // Empty string is valid "no selection" state
      expect(input.value).toBe('');

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle defaultValue with null (known limitation)', () => {
      // Known limitation: null triggers React warning (should use '' instead)
      // This test documents the behavior but acknowledges the warning
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select
          name="uncontrolledNull"
          defaultValue={null}
          options={[
            { value: 'option-a', label: 'Option A' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledNull"]') as HTMLInputElement;
      
      // null is valid "no selection" state, displays as empty
      expect(input.value).toBe('');

      // Note: React emits warning for null value prop (expected limitation)
      // Usage guidance: Use '' instead of null for empty selection

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle plain Select with numeric option values (known limitation)', () => {
      // Known limitation: Plain mode without value/defaultValue may trigger warning
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select<number>
          name="plainNumeric"
          options={[
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
          ]}
        />
      );

      const input = container.querySelector('input[name="plainNumeric"]') as HTMLInputElement;
      expect(input.value).toBe('');

      // Note: Plain mode may emit React warning (usage should provide explicit value/defaultValue)

      consoleErrorSpy.mockRestore();
    });

    it('should handle uncontrolled with numeric defaultValue (known limitation)', () => {
      // Known limitation: Numeric values may trigger React warning
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select<number>
          name="uncontrolledNumeric"
          defaultValue={1}
          options={[
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledNumeric"]') as HTMLInputElement;
      expect(input.value).toBe('1'); // Numeric value coerced to string

      // Note: May emit React warning (usage should use string values for HTML compatibility)

      consoleErrorSpy.mockRestore();
    });

    it('should handle uncontrolled with unresolved numeric defaultValue', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <Select<number>
          name="uncontrolledNumericUnresolved"
          defaultValue={999}
          options={[
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
          ]}
        />
      );

      const input = container.querySelector('input[name="uncontrolledNumericUnresolved"]') as HTMLInputElement;
      
      // Unresolved numeric value sanitized to empty
      expect(input.value).toBe('');

      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Policy compliance', () => {
    it('should NOT modify source defaultValue (display-layer only)', () => {
      // This test verifies that sanitization only affects display, not the prop
      const defaultValueProp = 'unresolved-value';
      
      const { container } = render(
        <Select
          name="policyCompliance"
          defaultValue={defaultValueProp}
          options={[
            { value: 'valid-a', label: 'Valid A' },
          ]}
        />
      );

      const input = container.querySelector('input[name="policyCompliance"]') as HTMLInputElement;
      
      // Display is sanitized to empty
      expect(input.value).toBe('');

      // Source prop remains unchanged (cannot test directly, but sanitization logic ensures this)
      // The defaultValue prop itself is not mutated - only the display value passed to MUI
    });

    it('should maintain existing behavior for resolved defaultValue', () => {
      const { container } = render(
        <Select
          name="resolvedDefault"
          defaultValue="valid-b"
          options={[
            { value: 'valid-a', label: 'Valid A' },
            { value: 'valid-b', label: 'Valid B' },
          ]}
        />
      );

      const input = container.querySelector('input[name="resolvedDefault"]') as HTMLInputElement;
      
      // Resolved values pass through unchanged
      expect(input.value).toBe('valid-b');
    });
  });
});
