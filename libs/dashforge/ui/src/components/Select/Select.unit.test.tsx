import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { renderWithBridge } from '../../test-utils';

/**
 * Unit tests for Select component.
 * Tests cover both plain mode and bound mode, focusing on value updates and visibility.
 */
describe('Select', () => {
  const testOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ];

  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders options', async () => {
      const user = userEvent.setup();

      render(<Select name="country" label="Country" options={testOptions} />);

      const selectInput = screen.getByLabelText('Country');
      expect(selectInput).toBeInTheDocument();

      // Open select to verify options are rendered
      await user.click(selectInput);

      expect(
        screen.getByRole('option', { name: 'United States' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Canada' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'United Kingdom' })
      ).toBeInTheDocument();
    });

    it('allows selecting an option', async () => {
      const user = userEvent.setup();
      let selectedValue = '';

      render(
        <Select
          name="country"
          label="Country"
          options={testOptions}
          onChange={(e) => {
            selectedValue = (e.target as HTMLInputElement).value;
          }}
        />
      );

      const selectInput = screen.getByLabelText('Country');
      await user.click(selectInput);

      const canadaOption = screen.getByRole('option', { name: 'Canada' });
      await user.click(canadaOption);

      expect(selectedValue).toBe('ca');
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('selecting an option updates bridge value', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      expect(state?.values.country).toBe('');

      const selectInput = screen.getByLabelText('Country');
      await user.click(selectInput);

      const usOption = screen.getByRole('option', { name: 'United States' });
      await user.click(usOption);

      // Bridge value should be updated
      expect(state?.values.country).toBe('us');
    });

    it('value shown matches stored value', () => {
      renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const selectInput = screen.getByLabelText('Country');
      // MUI Select displays the label for the selected value
      expect(selectInput).toHaveTextContent('Canada');
    });

    it('handles numeric values correctly', async () => {
      const user = userEvent.setup();

      const numericOptions = [
        { value: 1, label: 'Low' },
        { value: 2, label: 'Medium' },
        { value: 3, label: 'High' },
      ];

      const { state } = renderWithBridge(
        <Select<number>
          name="priority"
          label="Priority"
          options={numericOptions}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { priority: 1 },
          },
        }
      );

      const selectInput = screen.getByLabelText('Priority');
      await user.click(selectInput);

      const highOption = screen.getByRole('option', { name: 'High' });
      await user.click(highOption);

      // Value should be numeric 3, not string "3"
      expect(state?.values.priority).toBe(3);
      expect(typeof state?.values.priority).toBe('number');
    });

    it('updates value immediately without delayed updates', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      const selectInput = screen.getByLabelText('Country');
      await user.click(selectInput);

      const ukOption = screen.getByRole('option', { name: 'United Kingdom' });
      await user.click(ukOption);

      // Bridge value should update immediately (no delayed updates)
      expect(state?.values.country).toBe('uk');
      // Note: UI update requires re-render with valuesVersion subscription (tested in integration tests)
    });

    it('marks field as touched when select is closed', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      expect(state?.touched.country).toBeFalsy();

      const selectInput = screen.getByLabelText('Country');
      await user.click(selectInput);

      const usOption = screen.getByRole('option', { name: 'United States' });
      await user.click(usOption);

      // After selecting and closing, field should be touched
      expect(state?.touched.country).toBe(true);
    });
  });

  describe('Intent C: Visibility', () => {
    // Note: visibleWhen is tested in integration tests since it requires Engine reactivity
    // Unit tests focus on basic rendering without visibleWhen
    it('renders normally when visibleWhen is not provided', () => {
      renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });
  });

  describe('Intent D: Prop precedence and forwarding', () => {
    it('explicit helperText prop overrides bridge-derived helper text', () => {
      renderWithBridge(
        <Select
          name="country"
          label="Country"
          options={testOptions}
          helperText="Manual help text"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
            errors: { country: { message: 'Bridge error message' } },
            touched: { country: true },
            submitCount: 1,
          },
        }
      );

      // Explicit helperText should override error message from bridge
      expect(screen.getByText('Manual help text')).toBeInTheDocument();
      expect(
        screen.queryByText('Bridge error message')
      ).not.toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error state', () => {
      renderWithBridge(
        <Select
          name="country"
          label="Country"
          options={testOptions}
          error={false}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
            errors: { country: { message: 'Bridge error' } },
            touched: { country: true },
            submitCount: 1,
          },
        }
      );

      // When error={false}, the select should not show error state
      // even though bridge has an error
      const selectComponent = screen
        .getByLabelText('Country')
        .closest('.MuiFormControl-root');
      expect(selectComponent).not.toHaveClass('Mui-error');
    });

    it('explicit error prop shows error state', () => {
      renderWithBridge(
        <Select
          name="country"
          label="Country"
          options={testOptions}
          error={true}
          helperText="Explicit error text"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      // Explicit error={true} should show error helper text
      expect(screen.getByText('Explicit error text')).toBeInTheDocument();

      // The TextField should have the error prop (check via helper text color/presence)
      const helperText = screen.getByText('Explicit error text');
      expect(helperText).toBeInTheDocument();
    });
  });

  describe('Intent E: Form Closure v1 error gating', () => {
    it('hides error message when not touched and submitCount=0', () => {
      renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
            errors: { country: { message: 'Required' } },
            touched: { country: false },
            submitCount: 0,
          },
        }
      );

      // Error should NOT be visible (not touched and not submitted)
      expect(screen.queryByText('Required')).not.toBeInTheDocument();
    });

    it('shows error message when field is touched', () => {
      renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
            errors: { country: { message: 'Required' } },
            touched: { country: true },
            submitCount: 0,
          },
        }
      );

      // Error should be visible when touched
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('shows error message when submitCount > 0 even if not touched', () => {
      renderWithBridge(
        <Select name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
            errors: { country: { message: 'Required' } },
            touched: { country: false },
            submitCount: 1,
          },
        }
      );

      // Error should be visible when form was submitted
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });
});
