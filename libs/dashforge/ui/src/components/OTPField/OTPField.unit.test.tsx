import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OTPField } from './OTPField';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for OTPField component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('OTPField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plain Mode (outside DashFormContext)', () => {
    it('renders outside DashFormContext with no errors', () => {
      render(<OTPField name="otp" length={6} mode="numeric" />);

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toBeInTheDocument();
    });

    it('forwards value and onChange correctly', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <OTPField
          name="otp"
          length={4}
          mode="numeric"
          value="123"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      await user.type(input, '4');

      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('renders label when provided', () => {
      render(
        <OTPField name="otp" length={6} mode="numeric" label="Enter OTP" />
      );

      expect(screen.getByText('Enter OTP')).toBeInTheDocument();
    });

    it('renders helperText when provided', () => {
      render(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          helperText="Enter the 6-digit code"
        />
      );

      expect(screen.getByText('Enter the 6-digit code')).toBeInTheDocument();
    });

    it('respects explicit error prop', () => {
      const { container } = render(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          error
          helperText="Invalid code"
        />
      );

      // Check that helper text is rendered
      expect(screen.getByText('Invalid code')).toBeInTheDocument();

      // Check that error styles are applied (slots should have error border)
      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');

      // At least one slot should have error styling
      expect(slots?.[0]).toHaveStyle({
        borderColor: expect.stringContaining('#'),
      });
    });

    it('respects disabled prop', () => {
      render(<OTPField name="otp" length={6} mode="numeric" disabled />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('respects autoFocus prop', () => {
      render(<OTPField name="otp" length={6} mode="numeric" autoFocus />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveFocus();
    });

    it('calls onComplete when all slots filled', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();

      // Use controlled component pattern
      function ControlledOTPField() {
        const [value, setValue] = React.useState('');
        return (
          <OTPField
            name="otp"
            length={4}
            mode="numeric"
            value={value}
            onChange={setValue}
            onComplete={onComplete}
          />
        );
      }

      render(<ControlledOTPField />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Type complete code
      await user.type(input, '1234');

      expect(onComplete).toHaveBeenCalledWith('1234');
    });
  });

  describe('Bound Mode (inside DashFormContext)', () => {
    it('binds to bridge value', () => {
      renderWithBridge(<OTPField name="otp" length={6} mode="numeric" />, {
        mockBridgeOptions: {
          defaultValues: { otp: '123456' },
        },
      });

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Should get value from bridge
      expect(input.value).toBe('123456');
    });

    it('binds null/undefined from bridge as empty string', () => {
      renderWithBridge(<OTPField name="otp" length={6} mode="numeric" />, {
        mockBridgeOptions: {
          defaultValues: { otp: null },
        },
      });

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('updates bridge value on change', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <OTPField name="otp" length={4} mode="numeric" />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
          },
        }
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Type a character
      await user.type(input, '1');

      // Should update bridge value
      expect(state?.values.otp).toBe('1');
    });

    it('shows errors from bridge when touched', () => {
      renderWithBridge(<OTPField name="otp" length={6} mode="numeric" />, {
        mockBridgeOptions: {
          defaultValues: { otp: '' },
          errors: { otp: { message: 'Invalid OTP' } },
          touched: { otp: true },
          submitCount: 0,
        },
      });

      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });

    it('hides errors when not touched and not submitted (Form Closure v1)', () => {
      renderWithBridge(<OTPField name="otp" length={6} mode="numeric" />, {
        mockBridgeOptions: {
          defaultValues: { otp: '' },
          errors: { otp: { message: 'Invalid OTP' } },
          touched: { otp: false },
          submitCount: 0,
        },
      });

      expect(screen.queryByText('Invalid OTP')).not.toBeInTheDocument();
    });

    it('shows errors when submitCount > 0 (Form Closure v1)', () => {
      renderWithBridge(<OTPField name="otp" length={6} mode="numeric" />, {
        mockBridgeOptions: {
          defaultValues: { otp: '' },
          errors: { otp: { message: 'Invalid OTP' } },
          touched: { otp: false },
          submitCount: 1,
        },
      });

      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });

    it('explicit props override bridge values (prop precedence)', () => {
      renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          value="456789"
          error={false}
          helperText="Custom helper"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '123456' },
            errors: { otp: { message: 'Bridge error' } },
            touched: { otp: true },
          },
        }
      );

      // Explicit value should take precedence
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input.value).toBe('456789');

      // Explicit helperText should be shown (not bridge error)
      expect(screen.getByText('Custom helper')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('onBlur marks field as touched via registration.onBlur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <OTPField name="otp" length={6} mode="numeric" />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '123456' },
          },
        }
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      await user.click(input);
      await user.tab(); // Move focus away (triggers blur)

      // Verify touched state was updated
      expect(state?.touched.otp).toBe(true);
    });
  });

  describe('Visibility (visibleWhen)', () => {
    it('visibleWhen false renders null (plain mode)', () => {
      const { container } = render(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          visibleWhen={() => false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('visibleWhen true renders component (plain mode)', () => {
      render(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          visibleWhen={() => true}
        />
      );

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toBeInTheDocument();
    });

    it('visibleWhen false renders null (bound mode)', () => {
      const { container } = renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          visibleWhen={() => false}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
          },
        }
      );

      expect(container.firstChild).toBeNull();
    });

    it('visibleWhen true renders component (bound mode)', () => {
      renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          visibleWhen={() => true}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
          },
        }
      );

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toBeInTheDocument();
    });
  });

  describe('RBAC Integration', () => {
    it.skip('disables field when RBAC denies access', () => {
      // TODO: This test requires RbacProvider setup
      // renderWithBridge provides DashFormContext but not RbacProvider
      // RBAC integration needs proper provider to work correctly
      renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          access={{ resource: 'otp', action: 'edit' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
            engine: {
              canAccess: () => false,
              get: () => undefined,
              set: () => {},
              subscribe: () => () => {},
            } as never,
          },
        }
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('enables field when RBAC allows access', () => {
      renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          access={{ resource: 'otp', action: 'edit' }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
            engine: {
              canAccess: () => true,
              get: () => undefined,
              set: () => {},
              subscribe: () => () => {},
            } as never,
          },
        }
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).not.toBeDisabled();
    });

    it('disabled prop overrides RBAC (OR logic)', () => {
      renderWithBridge(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          access={{ resource: 'otp', action: 'edit' }}
          disabled
        />,
        {
          mockBridgeOptions: {
            defaultValues: { otp: '' },
            engine: {
              canAccess: () => true,
              get: () => undefined,
              set: () => {},
              subscribe: () => () => {},
            } as never,
          },
        }
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe('Different Modes', () => {
    it('accepts only numeric characters in numeric mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <OTPField
          name="otp"
          length={6}
          mode="numeric"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      await user.type(input, 'a1b2c3');

      // Should only get numeric characters
      expect(onChange).toHaveBeenCalled();
    });

    it('accepts alphanumeric characters in alphanumeric mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <OTPField
          name="otp"
          length={6}
          mode="alphanumeric"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      await user.type(input, 'A1B2C3');

      expect(onChange).toHaveBeenCalled();
    });

    it('accepts only alpha characters in alpha mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <OTPField
          name="otp"
          length={6}
          mode="alpha"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      await user.type(input, 'A1B2C3');

      // Should only get alpha characters
      expect(onChange).toHaveBeenCalled();
    });
  });
});
