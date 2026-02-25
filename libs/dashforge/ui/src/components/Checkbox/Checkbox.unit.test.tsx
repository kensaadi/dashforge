import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import { renderWithBridge } from '../../test-utils';

/**
 * Unit tests for Checkbox component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('Checkbox', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders as MUI Checkbox with provided label', () => {
      render(<Checkbox name="terms" label="Accept terms and conditions" />);

      const checkbox = screen.getByLabelText('Accept terms and conditions');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('forwards checked and onChange to MUI Checkbox', async () => {
      const user = userEvent.setup();
      const checkedValues: boolean[] = [];

      const Wrapper = () => {
        const [checked, setChecked] = useState(false);
        return (
          <Checkbox
            name="terms"
            label="Accept terms"
            checked={checked}
            onChange={(e) => {
              const newChecked = (e.target as HTMLInputElement).checked;
              setChecked(newChecked);
              checkedValues.push(newChecked);
            }}
          />
        );
      };

      render(<Wrapper />);

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);

      expect(checkedValues[checkedValues.length - 1]).toBe(true);
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);

      expect(checkedValues[checkedValues.length - 1]).toBe(false);
      expect(checkbox.checked).toBe(false);
    });

    it('renders without bridge context (no form binding)', () => {
      render(<Checkbox name="subscribe" label="Subscribe to newsletter" />);
      expect(
        screen.getByLabelText('Subscribe to newsletter')
      ).toBeInTheDocument();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('calls bridge.register(name, rules) and binds to bridge value', () => {
      const { state } = renderWithBridge(
        <Checkbox
          name="terms"
          label="Accept terms"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
          },
        }
      );

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.name).toBe('terms');

      // Value should be bound from bridge (default false)
      expect(state?.values.terms).toBe(false);
      expect(checkbox.checked).toBe(false);
    });

    it('renders checked when bridge value is true', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: { terms: true },
        },
      });

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('defaults to false when bridge value is undefined', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: {},
        },
      });

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('updates bridge value when user toggles checkbox', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Checkbox name="subscribe" label="Subscribe to newsletter" />,
        {
          mockBridgeOptions: {
            defaultValues: { subscribe: false },
          },
        }
      );

      const checkbox = screen.getByLabelText(
        'Subscribe to newsletter'
      ) as HTMLInputElement;
      expect(state?.values.subscribe).toBe(false);
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);

      // Bridge value should be updated to true
      expect(state?.values.subscribe).toBe(true);
      // Wait for component to re-render with new checked value
      await screen.findByLabelText('Subscribe to newsletter');
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);

      // Bridge value should be updated to false
      expect(state?.values.subscribe).toBe(false);
      // Wait for component to re-render with new checked value
      await screen.findByLabelText('Subscribe to newsletter');
      expect(checkbox.checked).toBe(false);
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Checkbox name="terms" label="Accept terms" />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
          },
        }
      );

      expect(state?.touched.terms).toBeFalsy();

      const checkbox = screen.getByLabelText('Accept terms');
      await user.click(checkbox);
      await user.tab(); // Blur

      expect(state?.touched.terms).toBe(true);
    });

    it('props.checked={false} overrides bridge value true', () => {
      renderWithBridge(
        <Checkbox name="terms" label="Accept terms" checked={false} />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: true },
          },
        }
      );

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      // props.checked takes precedence over bridge value
      expect(checkbox.checked).toBe(false);
    });

    it('props.checked={true} overrides bridge value false', () => {
      renderWithBridge(
        <Checkbox name="terms" label="Accept terms" checked={true} />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
          },
        }
      );

      const checkbox = screen.getByLabelText(
        'Accept terms'
      ) as HTMLInputElement;
      // props.checked takes precedence over bridge value
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('shows error only when touched', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: { terms: false },
          errors: { terms: { message: 'You must accept terms' } },
          touched: { terms: false },
          submitCount: 0,
        },
      });

      // Error should NOT be visible (not touched, not submitted)
      expect(
        screen.queryByText('You must accept terms')
      ).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: { terms: false },
          errors: { terms: { message: 'You must accept terms' } },
          touched: { terms: true },
          submitCount: 0,
        },
      });

      // Error should be visible
      expect(screen.getByText('You must accept terms')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: { terms: false },
          errors: { terms: { message: 'You must accept terms' } },
          touched: { terms: false },
          submitCount: 1,
        },
      });

      // Error should be visible (form was submitted)
      expect(screen.getByText('You must accept terms')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(
        <Checkbox
          name="terms"
          label="Accept terms"
          error
          helperText="Custom error"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
            errors: { terms: { message: 'Bridge error' } },
            touched: { terms: true },
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
        <Checkbox name="terms" label="Accept terms" helperText="Custom hint" />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
            errors: { terms: { message: 'Bridge error' } },
            touched: { terms: true },
            submitCount: 0,
          },
        }
      );

      // Should show custom helperText
      expect(screen.getByText('Custom hint')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('error={false} suppresses bridge error message', () => {
      renderWithBridge(
        <Checkbox name="terms" label="Accept terms" error={false} />,
        {
          mockBridgeOptions: {
            defaultValues: { terms: false },
            errors: { terms: { message: 'Bridge error' } },
            touched: { terms: true },
            submitCount: 1,
          },
        }
      );

      // Bridge error should be suppressed even though touched and submitted
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });
  });

  describe('Intent D: Visibility', () => {
    it('renders normally when visibleWhen is not provided', () => {
      renderWithBridge(<Checkbox name="terms" label="Accept terms" />, {
        mockBridgeOptions: {
          defaultValues: { terms: false },
        },
      });

      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    // Note: visibleWhen with false condition requires Engine reactivity (valtio)
    // This is tested in integration tests, not unit tests
    // See TextField tests for similar pattern (line 212-214)
  });
});
