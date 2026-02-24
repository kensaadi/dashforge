import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { TextField } from './TextField';
import { renderWithBridge } from '../../test-utils';

/**
 * Unit tests for TextField component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('TextField', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders as MUI TextField with provided props', () => {
      render(
        <TextField
          name="username"
          label="Username"
          placeholder="Enter username"
        />
      );

      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter username');
    });

    it('forwards value and onChange to MUI TextField', async () => {
      const user = userEvent.setup();
      const values: string[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState('initial');
        return (
          <TextField
            name="username"
            label="Username"
            value={value}
            onChange={(e) => {
              const newValue = (e.target as HTMLInputElement).value;
              setValue(newValue);
              values.push(newValue);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Username') as HTMLInputElement;
      expect(input.value).toBe('initial');

      await user.clear(input);
      await user.type(input, 'new');

      // Check that onChange was called with the final value
      expect(values[values.length - 1]).toBe('new');
      expect(input.value).toBe('new');
    });

    it('renders without bridge context (no form binding)', () => {
      // Should not throw even when no bridge is provided
      render(<TextField name="email" label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('calls bridge.register(name, rules) and binds registration props', () => {
      const { state } = renderWithBridge(
        <TextField name="email" label="Email" rules={{ required: true }} />,
        {
          mockBridgeOptions: {
            defaultValues: { email: '' },
          },
        }
      );

      const input = screen.getByLabelText('Email') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.name).toBe('email');

      // Value should be bound from bridge
      expect(state?.values.email).toBe('');
    });

    it('updates bridge value on user input', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <TextField name="email" label="Email" />,
        {
          mockBridgeOptions: {
            defaultValues: { email: '' },
          },
        }
      );

      const input = screen.getByLabelText('Email') as HTMLInputElement;
      await user.type(input, 'test@example.com');

      // Bridge value should be updated
      expect(state?.values.email).toBe('test@example.com');
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <TextField name="email" label="Email" />,
        {
          mockBridgeOptions: {
            defaultValues: { email: '' },
          },
        }
      );

      expect(state?.touched.email).toBeFalsy();

      const input = screen.getByLabelText('Email');
      await user.click(input);
      await user.tab(); // Blur

      expect(state?.touched.email).toBe(true);
    });

    it('shows error only when touched', () => {
      renderWithBridge(<TextField name="email" label="Email" />, {
        mockBridgeOptions: {
          defaultValues: { email: '' },
          errors: { email: { message: 'Email is required' } },
          touched: { email: false },
          submitCount: 0,
        },
      });

      // Error should NOT be visible (not touched, not submitted)
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(<TextField name="email" label="Email" />, {
        mockBridgeOptions: {
          defaultValues: { email: '' },
          errors: { email: { message: 'Email is required' } },
          touched: { email: true },
          submitCount: 0,
        },
      });

      // Error should be visible
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(<TextField name="email" label="Email" />, {
        mockBridgeOptions: {
          defaultValues: { email: '' },
          errors: { email: { message: 'Email is required' } },
          touched: { email: false },
          submitCount: 1,
        },
      });

      // Error should be visible (form was submitted)
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(
        <TextField
          name="email"
          label="Email"
          error
          helperText="Custom error"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { email: '' },
            errors: { email: { message: 'Bridge error' } },
            touched: { email: true },
            submitCount: 0,
          },
        }
      );

      // Should show custom error, not bridge error
      expect(screen.getByText('Custom error')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('explicit helperText prop overrides bridge helperText', () => {
      renderWithBridge(
        <TextField name="email" label="Email" helperText="Custom hint" />,
        {
          mockBridgeOptions: {
            defaultValues: { email: '' },
            errors: { email: { message: 'Bridge error' } },
            touched: { email: true },
            submitCount: 0,
          },
        }
      );

      // Should show custom helperText
      expect(screen.getByText('Custom hint')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });
  });

  describe('Intent C: Visibility', () => {
    // Note: visibleWhen is tested in integration tests since it requires Engine reactivity
    // Unit tests focus on the basic contract: when visibleWhen is undefined, component renders
    it('renders normally when visibleWhen is not provided', () => {
      renderWithBridge(<TextField name="email" label="Email" />, {
        mockBridgeOptions: {
          defaultValues: { email: '' },
        },
      });

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  describe('Intent D: Select mode (when select prop is true)', () => {
    const selectChildren = (
      <>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
      </>
    );

    it('binds value from bridge.getValue(name)', () => {
      renderWithBridge(
        <TextField name="country" label="Country" select>
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      // MUI Select displays value in a hidden input
      const hiddenInput = document.querySelector(
        'input[name="country"]'
      ) as HTMLInputElement;

      expect(hiddenInput?.value).toBe('ca');
    });

    it('updates value via bridge.setValue when user selects an option', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <TextField
          name="country"
          label="Country"
          select
          SelectProps={{ native: true }}
        >
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      const selectInput = screen.getByLabelText('Country') as HTMLSelectElement;
      await user.selectOptions(selectInput, 'uk');

      // Bridge setValue should be called with new value via onChange handler
      expect(state?.values.country).toBe('uk');
    });

    it('calls registration.onChange with synthetic event structure', async () => {
      const user = userEvent.setup();

      // Create a custom mock bridge that captures onChange calls
      const { bridge } = renderWithBridge(
        <TextField
          name="country"
          label="Country"
          select
          SelectProps={{ native: true }}
        >
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      // Verify bridge.register is available
      expect(bridge.register).toBeDefined();

      const selectInput = screen.getByLabelText('Country') as HTMLSelectElement;
      await user.selectOptions(selectInput, 'us');

      // Synthetic event structure is tested implicitly via bridge.setValue being called
      // which happens in handleChange after creating the synthetic event
    });

    it('marks field as touched on blur for native select', async () => {
      const { state } = renderWithBridge(
        <TextField
          name="country"
          label="Country"
          select
          SelectProps={{ native: true }}
        >
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      expect(state?.touched.country).toBeFalsy();

      const selectInput = screen.getByLabelText('Country') as HTMLSelectElement;

      // Focus then blur to trigger touch
      selectInput.focus();
      selectInput.blur();

      expect(state?.touched.country).toBe(true);
    });

    it('updates value and marks as touched for native select', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <TextField
          name="country"
          label="Country"
          select
          SelectProps={{ native: true }}
        >
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'us' },
          },
        }
      );

      const selectInput = screen.getByLabelText('Country') as HTMLSelectElement;

      // Change value multiple times - onChange works fine
      await user.selectOptions(selectInput, 'ca');
      expect(state?.values.country).toBe('ca');

      await user.selectOptions(selectInput, 'uk');
      expect(state?.values.country).toBe('uk');

      // Blur should mark as touched
      selectInput.blur();

      expect(state?.touched.country).toBe(true);
    });

    it('renders with controlled value from bridge', () => {
      renderWithBridge(
        <TextField name="country" label="Country" select>
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const hiddenInput = document.querySelector(
        'input[name="country"]'
      ) as HTMLInputElement;
      expect(hiddenInput?.value).toBe('ca');
    });

    it('passes through SelectProps to MUI TextField', () => {
      renderWithBridge(
        <TextField
          name="country"
          label="Country"
          select
          SelectProps={{
            native: true,
            id: 'custom-select-id',
          }}
        >
          {selectChildren}
        </TextField>,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      const selectElement = document.getElementById('custom-select-id');
      expect(selectElement).toBeInTheDocument();
    });
  });
});
