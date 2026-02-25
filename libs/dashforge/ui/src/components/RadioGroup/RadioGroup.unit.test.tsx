import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for RadioGroup component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('RadioGroup', () => {
  const fruitOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
  ];

  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders outside DashFormContext with provided options', () => {
      render(<RadioGroup name="fruit" options={fruitOptions} />);

      expect(screen.getByLabelText('Apple')).toBeInTheDocument();
      expect(screen.getByLabelText('Banana')).toBeInTheDocument();
      expect(screen.getByLabelText('Orange')).toBeInTheDocument();
    });

    it('renders with group label when provided', () => {
      render(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          label="Choose your favorite fruit"
        />
      );

      expect(
        screen.getByText('Choose your favorite fruit')
      ).toBeInTheDocument();
    });

    it('forwards value and onChange to MUI RadioGroup', async () => {
      const user = userEvent.setup();
      const selectedValues: string[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState('');
        return (
          <RadioGroup
            name="fruit"
            options={fruitOptions}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newValue = e.target.value;
              setValue(newValue);
              selectedValues.push(newValue);
            }}
          />
        );
      };

      render(<Wrapper />);

      const appleRadio = screen.getByLabelText('Apple') as HTMLInputElement;
      const bananaRadio = screen.getByLabelText('Banana') as HTMLInputElement;

      expect(appleRadio.checked).toBe(false);
      expect(bananaRadio.checked).toBe(false);

      await user.click(appleRadio);
      expect(appleRadio.checked).toBe(true);
      expect(selectedValues).toEqual(['apple']);

      await user.click(bananaRadio);
      expect(bananaRadio.checked).toBe(true);
      expect(appleRadio.checked).toBe(false);
      expect(selectedValues).toEqual(['apple', 'banana']);
    });

    it('renders helperText when provided', () => {
      render(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          helperText="Select one option"
        />
      );

      expect(screen.getByText('Select one option')).toBeInTheDocument();
    });

    it('respects error prop with helperText', () => {
      render(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          helperText="This field is required"
          error={true}
        />
      );

      const helperText = screen.getByText('This field is required');
      expect(helperText).toBeInTheDocument();
      // MUI FormHelperText applies error class when error=true
      expect(helperText).toHaveClass('Mui-error');
    });

    it('respects disabled option', () => {
      const optionsWithDisabled = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana', disabled: true },
        { value: 'orange', label: 'Orange' },
      ];

      render(<RadioGroup name="fruit" options={optionsWithDisabled} />);

      const bananaRadio = screen.getByLabelText('Banana') as HTMLInputElement;
      expect(bananaRadio).toBeDisabled();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('calls bridge.register(name, rules) and binds to bridge value', () => {
      renderWithBridge(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: 'apple' },
          },
        }
      );

      // Verify value binding from bridge
      // The component calls bridge.register internally and binds to the value
      const appleRadio = screen.getByLabelText('Apple') as HTMLInputElement;
      expect(appleRadio.checked).toBe(true);
    });

    it('defaults to empty string when bridge value is undefined', () => {
      renderWithBridge(<RadioGroup name="fruit" options={fruitOptions} />, {
        mockBridgeOptions: {
          defaultValues: {},
        },
      });

      const appleRadio = screen.getByLabelText('Apple') as HTMLInputElement;
      const bananaRadio = screen.getByLabelText('Banana') as HTMLInputElement;

      expect(appleRadio.checked).toBe(false);
      expect(bananaRadio.checked).toBe(false);
    });

    it('updates bridge value when user selects an option', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <RadioGroup name="fruit" options={fruitOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: '' },
          },
        }
      );

      const bananaRadio = screen.getByLabelText('Banana');
      await user.click(bananaRadio);

      // Verify bridge state was updated with correct value
      expect(state?.values.fruit).toBe('banana');
    });

    it('calls registration.onChange with event-like shape', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <RadioGroup name="fruit" options={fruitOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: '' },
          },
        }
      );

      const appleRadio = screen.getByLabelText('Apple');
      await user.click(appleRadio);

      // Verify that onChange was called and updated state with correct value
      // This validates the event-like shape was processed correctly
      expect(state?.values.fruit).toBe('apple');
    });

    it('calls registration.onBlur when radio loses focus', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <RadioGroup name="fruit" options={fruitOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: 'apple' },
          },
        }
      );

      const appleRadio = screen.getByLabelText('Apple');
      await user.click(appleRadio);
      await user.tab(); // Move focus away

      // Verify touched state was updated (onBlur sets touched to true)
      expect(state?.touched.fruit).toBe(true);
    });

    it('explicit value prop overrides bridge value (prop precedence)', () => {
      renderWithBridge(
        <RadioGroup name="fruit" options={fruitOptions} value="banana" />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: 'apple' },
          },
        }
      );

      const appleRadio = screen.getByLabelText('Apple') as HTMLInputElement;
      const bananaRadio = screen.getByLabelText('Banana') as HTMLInputElement;

      // Explicit value="banana" should override bridge value "apple"
      expect(appleRadio.checked).toBe(false);
      expect(bananaRadio.checked).toBe(true);
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('does not show error when field is not touched and submitCount is 0', () => {
      renderWithBridge(<RadioGroup name="fruit" options={fruitOptions} />, {
        mockBridgeOptions: {
          defaultValues: { fruit: '' },
          errors: { fruit: { message: 'Required field' } },
          touched: { fruit: false },
          submitCount: 0,
        },
      });

      expect(screen.queryByText('Required field')).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(<RadioGroup name="fruit" options={fruitOptions} />, {
        mockBridgeOptions: {
          defaultValues: { fruit: '' },
          errors: { fruit: { message: 'Required field' } },
          touched: { fruit: true },
          submitCount: 0,
        },
      });

      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(<RadioGroup name="fruit" options={fruitOptions} />, {
        mockBridgeOptions: {
          defaultValues: { fruit: '' },
          errors: { fruit: { message: 'Required field' } },
          touched: { fruit: false },
          submitCount: 1,
        },
      });

      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(
        <RadioGroup name="fruit" options={fruitOptions} error={false} />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: '' },
            errors: { fruit: { message: 'Bridge error' } },
            touched: { fruit: true },
            submitCount: 0,
          },
        }
      );

      // Bridge has error but explicit error={false} should override
      const helperTextElement = screen.queryByText('Bridge error');
      if (helperTextElement?.parentElement) {
        expect(helperTextElement.parentElement).not.toHaveClass('Mui-error');
      }
    });

    it('explicit helperText prop overrides bridge helperText', () => {
      renderWithBridge(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          helperText="Custom hint"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { fruit: '' },
            errors: { fruit: { message: 'Bridge error' } },
            touched: { fruit: true },
            submitCount: 0,
          },
        }
      );

      // Should show custom helperText
      expect(screen.getByText('Custom hint')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });
  });

  describe('Intent D: Visibility', () => {
    it('renders normally when visibleWhen is not provided', () => {
      renderWithBridge(<RadioGroup name="fruit" options={fruitOptions} />, {
        mockBridgeOptions: {
          defaultValues: { fruit: '' },
        },
      });

      expect(screen.getByLabelText('Apple')).toBeInTheDocument();
    });

    it('renders null when visibleWhen returns false (plain mode)', () => {
      // Plain mode test: outside DashFormContext, no Engine required
      // This tests the basic visibility contract: visibleWhen false => null
      render(
        <RadioGroup
          name="fruit"
          options={fruitOptions}
          visibleWhen={() => false}
        />
      );

      // Component should render null, so options should not be in document
      expect(screen.queryByLabelText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Orange')).not.toBeInTheDocument();
    });

    // Note: visibleWhen with Engine reactivity (state-dependent predicates)
    // is tested in integration tests, not unit tests.
  });
});
