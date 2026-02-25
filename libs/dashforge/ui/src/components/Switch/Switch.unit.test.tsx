import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for Switch component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('Switch', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders as MUI Switch with provided label', () => {
      render(<Switch name="notifications" label="Enable notifications" />);

      const switchElement = screen.getByLabelText('Enable notifications');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('type', 'checkbox');
    });

    it('forwards checked and onChange to MUI Switch', async () => {
      const user = userEvent.setup();
      const checkedValues: boolean[] = [];

      const Wrapper = () => {
        const [checked, setChecked] = useState(false);
        return (
          <Switch
            name="notifications"
            label="Enable notifications"
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

      const switchElement = screen.getByLabelText(
        'Enable notifications'
      ) as HTMLInputElement;
      expect(switchElement.checked).toBe(false);

      await user.click(switchElement);

      expect(checkedValues[checkedValues.length - 1]).toBe(true);
      expect(switchElement.checked).toBe(true);

      await user.click(switchElement);

      expect(checkedValues[checkedValues.length - 1]).toBe(false);
      expect(switchElement.checked).toBe(false);
    });

    it('renders without bridge context (no form binding)', () => {
      render(<Switch name="darkMode" label="Enable dark mode" />);
      expect(screen.getByLabelText('Enable dark mode')).toBeInTheDocument();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('calls bridge.register(name, rules) and binds to bridge value', () => {
      const { state } = renderWithBridge(
        <Switch
          name="notifications"
          label="Enable notifications"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { notifications: false },
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable notifications'
      ) as HTMLInputElement;
      expect(switchElement).toBeInTheDocument();
      expect(switchElement.name).toBe('notifications');

      // Value should be bound from bridge (default false)
      expect(state?.values.notifications).toBe(false);
      expect(switchElement.checked).toBe(false);
    });

    it('renders checked when bridge value is true', () => {
      renderWithBridge(
        <Switch name="notifications" label="Enable notifications" />,
        {
          mockBridgeOptions: {
            defaultValues: { notifications: true },
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable notifications'
      ) as HTMLInputElement;
      expect(switchElement.checked).toBe(true);
    });

    it('defaults to false when bridge value is undefined', () => {
      renderWithBridge(
        <Switch name="notifications" label="Enable notifications" />,
        {
          mockBridgeOptions: {
            defaultValues: {},
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable notifications'
      ) as HTMLInputElement;
      expect(switchElement.checked).toBe(false);
    });

    it('updates bridge value when user toggles switch', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Switch name="darkMode" label="Enable dark mode" />,
        {
          mockBridgeOptions: {
            defaultValues: { darkMode: false },
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable dark mode'
      ) as HTMLInputElement;
      expect(state?.values.darkMode).toBe(false);
      expect(switchElement.checked).toBe(false);

      await user.click(switchElement);

      // Bridge value should be updated to true
      expect(state?.values.darkMode).toBe(true);
      // Wait for component to re-render with new checked value
      await screen.findByLabelText('Enable dark mode');
      expect(switchElement.checked).toBe(true);

      await user.click(switchElement);

      // Bridge value should be updated to false
      expect(state?.values.darkMode).toBe(false);
      // Wait for component to re-render with new checked value
      await screen.findByLabelText('Enable dark mode');
      expect(switchElement.checked).toBe(false);
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Switch name="notifications" label="Enable notifications" />,
        {
          mockBridgeOptions: {
            defaultValues: { notifications: false },
          },
        }
      );

      expect(state?.touched.notifications).toBeFalsy();

      const switchElement = screen.getByLabelText('Enable notifications');
      await user.click(switchElement);
      await user.tab(); // Blur

      expect(state?.touched.notifications).toBe(true);
    });

    it('explicit checked prop overrides bridge value (prop precedence)', () => {
      renderWithBridge(
        <Switch
          name="notifications"
          label="Enable notifications"
          checked={false}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { notifications: true },
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable notifications'
      ) as HTMLInputElement;

      // Explicit prop checked={false} should override bridge value (true)
      expect(switchElement.checked).toBe(false);
    });

    it('explicit checked={true} prop overrides bridge value false', () => {
      renderWithBridge(
        <Switch name="darkMode" label="Enable dark mode" checked={true} />,
        {
          mockBridgeOptions: {
            defaultValues: { darkMode: false },
          },
        }
      );

      const switchElement = screen.getByLabelText(
        'Enable dark mode'
      ) as HTMLInputElement;

      // Explicit prop checked={true} should override bridge value (false)
      expect(switchElement.checked).toBe(true);
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('shows error only when touched', () => {
      renderWithBridge(<Switch name="terms" label="Accept terms" />, {
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
      renderWithBridge(<Switch name="terms" label="Accept terms" />, {
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
      renderWithBridge(<Switch name="terms" label="Accept terms" />, {
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
        <Switch
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
        <Switch name="terms" label="Accept terms" helperText="Custom hint" />,
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
  });

  describe('Intent D: Visibility', () => {
    it('renders normally when visibleWhen is not provided', () => {
      renderWithBridge(
        <Switch name="notifications" label="Enable notifications" />,
        {
          mockBridgeOptions: {
            defaultValues: { notifications: false },
          },
        }
      );

      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });

    it('renders null when visibleWhen returns false (plain mode)', () => {
      // Plain mode test: outside DashFormContext, no Engine required
      // This tests the basic visibility contract: visibleWhen false => null
      render(
        <Switch
          name="notifications"
          label="Enable notifications"
          visibleWhen={() => false}
        />
      );

      // Component should render null, so label should not be in document
      expect(
        screen.queryByLabelText('Enable notifications')
      ).not.toBeInTheDocument();
    });

    // Note: visibleWhen with Engine reactivity (state-dependent predicates)
    // is tested in integration tests, not unit tests.
  });
});
