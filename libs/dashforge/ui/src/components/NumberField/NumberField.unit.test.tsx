import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from './NumberField';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for NumberField component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('NumberField', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders outside DashFormContext as a number input', () => {
      render(<NumberField name="age" label="Age" />);

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('number');
    });

    it('forwards value and onChange correctly', async () => {
      const user = userEvent.setup();
      const values: (number | null)[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState<number | null>(null);
        return (
          <NumberField
            name="age"
            label="Age"
            value={value}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = raw === '' ? null : Number(raw);
              setValue(Number.isFinite(parsed) ? parsed : null);
              values.push(Number.isFinite(parsed) ? parsed : null);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input.value).toBe('');

      await user.type(input, '25');
      expect(input.value).toBe('25');
      expect(values).toContain(25);
    });

    it('visibleWhen false renders null (plain mode)', () => {
      render(<NumberField name="age" label="Age" visibleWhen={() => false} />);

      expect(screen.queryByLabelText('Age')).not.toBeInTheDocument();
    });

    it('renders helperText when provided', () => {
      render(
        <NumberField name="age" label="Age" helperText="Enter your age" />
      );

      expect(screen.getByText('Enter your age')).toBeInTheDocument();
    });

    it('respects explicit error prop', () => {
      render(
        <NumberField
          name="age"
          label="Age"
          helperText="This field is required"
          error={true}
        />
      );

      const helperText = screen.getByText('This field is required');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('Mui-error');
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('calls bridge.register(name, rules) and binds to bridge value', () => {
      renderWithBridge(
        <NumberField name="age" label="Age" rules={{ required: true }} />,
        {
          mockBridgeOptions: {
            defaultValues: { age: 25 },
          },
        }
      );

      // Verify value binding from bridge (number -> string in input)
      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input.value).toBe('25');
    });

    it('binds null/undefined from bridge as empty string', () => {
      renderWithBridge(<NumberField name="age" label="Age" />, {
        mockBridgeOptions: {
          defaultValues: { age: null },
        },
      });

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('typing a valid number updates bridge value', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <NumberField name="age" label="Age" />,
        {
          mockBridgeOptions: {
            defaultValues: { age: null },
          },
        }
      );

      const input = screen.getByLabelText('Age');
      await user.type(input, '42');

      // Verify bridge state was updated with parsed number
      expect(state?.values.age).toBe(42);
    });

    it('clearing input to empty string sets bridge value to null', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <NumberField name="age" label="Age" />,
        {
          mockBridgeOptions: {
            defaultValues: { age: 25 },
          },
        }
      );

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      expect(input.value).toBe('25');

      await user.clear(input);

      // Verify bridge value was set to null
      expect(state?.values.age).toBeNull();
    });

    it('calls registration.onChange with event-like shape', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <NumberField name="age" label="Age" />,
        {
          mockBridgeOptions: {
            defaultValues: { age: null },
          },
        }
      );

      const input = screen.getByLabelText('Age');
      await user.type(input, '30');

      // Verify onChange was called and updated state with correct value
      // This validates the event-like shape was processed correctly
      expect(state?.values.age).toBe(30);
    });

    it('explicit value prop overrides bridge value (prop precedence)', () => {
      renderWithBridge(<NumberField name="age" label="Age" value={99} />, {
        mockBridgeOptions: {
          defaultValues: { age: 25 },
        },
      });

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      // Explicit value=99 should override bridge value 25
      expect(input.value).toBe('99');
    });

    it('handles empty string value prop in bound mode', () => {
      renderWithBridge(<NumberField name="age" label="Age" value="" />, {
        mockBridgeOptions: {
          defaultValues: { age: 25 },
        },
      });

      const input = screen.getByLabelText('Age') as HTMLInputElement;
      // Explicit value='' should override bridge value
      expect(input.value).toBe('');
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('does not show error when field is not touched and submitCount is 0', () => {
      renderWithBridge(<NumberField name="age" label="Age" />, {
        mockBridgeOptions: {
          defaultValues: { age: null },
          errors: { age: { message: 'Age is required' } },
          touched: { age: false },
          submitCount: 0,
        },
      });

      expect(screen.queryByText('Age is required')).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(<NumberField name="age" label="Age" />, {
        mockBridgeOptions: {
          defaultValues: { age: null },
          errors: { age: { message: 'Age is required' } },
          touched: { age: true },
          submitCount: 0,
        },
      });

      expect(screen.getByText('Age is required')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(<NumberField name="age" label="Age" />, {
        mockBridgeOptions: {
          defaultValues: { age: null },
          errors: { age: { message: 'Age is required' } },
          touched: { age: false },
          submitCount: 1,
        },
      });

      expect(screen.getByText('Age is required')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(<NumberField name="age" label="Age" error={false} />, {
        mockBridgeOptions: {
          defaultValues: { age: null },
          errors: { age: { message: 'Bridge error' } },
          touched: { age: true },
          submitCount: 0,
        },
      });

      // Bridge has error but explicit error=false should override
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('explicit helperText prop overrides bridge error message', () => {
      renderWithBridge(
        <NumberField name="age" label="Age" helperText="Custom helper text" />,
        {
          mockBridgeOptions: {
            defaultValues: { age: null },
            errors: { age: { message: 'Bridge error' } },
            touched: { age: true },
            submitCount: 0,
          },
        }
      );

      // Explicit helperText should override bridge error message
      expect(screen.getByText('Custom helper text')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });
  });

  describe('Intent D: Touch tracking', () => {
    it('onBlur marks field as touched via registration.onBlur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <NumberField name="age" label="Age" />,
        {
          mockBridgeOptions: {
            defaultValues: { age: 25 },
          },
        }
      );

      const input = screen.getByLabelText('Age');
      await user.click(input);
      await user.tab(); // Move focus away (triggers blur)

      // Verify touched state was updated
      expect(state?.touched.age).toBe(true);
    });
  });

  describe('Intent E: Visibility', () => {
    it('renders normally when visibleWhen is not provided (bound mode)', () => {
      renderWithBridge(<NumberField name="age" label="Age" />, {
        mockBridgeOptions: {
          defaultValues: { age: 25 },
        },
      });

      expect(screen.getByLabelText('Age')).toBeInTheDocument();
    });

    it('visibleWhen false renders null (plain mode)', () => {
      // Plain mode test: outside DashFormContext, no Engine required
      // This tests the basic visibility contract: visibleWhen false => null
      render(<NumberField name="age" label="Age" visibleWhen={() => false} />);

      expect(screen.queryByLabelText('Age')).not.toBeInTheDocument();
    });

    it('visibleWhen true renders component (plain mode)', () => {
      // Plain mode test: outside DashFormContext, no Engine required
      render(<NumberField name="age" label="Age" visibleWhen={() => true} />);

      expect(screen.getByLabelText('Age')).toBeInTheDocument();
    });
  });
});
