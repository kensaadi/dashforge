// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { OTPField } from './OTPField.js';

describe('<OTPField>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders the configured number of slots (default 6)', () => {
      const { container } = render(<OTPField name="otp" label="Code" />);
      // Slots are `<div data-active>` cells inside the slots row — the
      // hidden input is the 7th flex child but is the only role=textbox.
      const slots = container.querySelectorAll('[aria-hidden="true"][class*="rounded-md"]');
      expect(slots).toHaveLength(6);
    });

    it('renders the requested number of slots (length=4)', () => {
      const { container } = render(
        <OTPField name="otp" label="Code" length={4} />
      );
      const slots = container.querySelectorAll('[aria-hidden="true"][class*="rounded-md"]');
      expect(slots).toHaveLength(4);
    });

    it('renders a `*` for required fields', () => {
      render(<OTPField name="otp" label="Code" required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('renders helperText when provided', () => {
      render(
        <OTPField name="otp" label="Code" helperText="Check your phone" />
      );
      expect(screen.getByText('Check your phone')).toBeTruthy();
    });

    it('displays a controlled value across its slots', () => {
      const { container } = render(
        <OTPField name="otp" label="Code" value="1234" length={4} onChange={() => undefined} />
      );
      const charSpans = container.querySelectorAll('[class*="font-mono"] span');
      // First 4 slots are filled with 1234
      expect(charSpans[0]?.textContent).toBe('1');
      expect(charSpans[1]?.textContent).toBe('2');
      expect(charSpans[2]?.textContent).toBe('3');
      expect(charSpans[3]?.textContent).toBe('4');
    });

    it('numeric mode sanitises non-digit input', () => {
      const onChange = vi.fn();
      render(
        <OTPField name="otp" label="Code" mode="numeric" length={4} onChange={onChange} />
      );
      // The hidden input absorbs keystrokes
      const input = screen.getByLabelText('Code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '12ab34' } });
      // Only digits survive (and capped at length=4)
      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('alphanumeric mode allows letters + digits', () => {
      const onChange = vi.fn();
      render(
        <OTPField
          name="otp"
          label="Code"
          mode="alphanumeric"
          length={6}
          onChange={onChange}
        />
      );
      const input = screen.getByLabelText('Code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a1B2-c3' } });
      expect(onChange).toHaveBeenCalledWith('a1B2c3');
    });

    it('fires onComplete when all slots are filled', () => {
      const onComplete = vi.fn();
      render(
        <OTPField
          name="otp"
          label="Code"
          length={4}
          onComplete={onComplete}
        />
      );
      const input = screen.getByLabelText('Code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '9999' } });
      expect(onComplete).toHaveBeenCalledWith('9999');
    });

    it('does NOT fire onComplete on partial input', () => {
      const onComplete = vi.fn();
      render(
        <OTPField name="otp" label="Code" length={6} onComplete={onComplete} />
      );
      const input = screen.getByLabelText('Code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '123' } });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('respects `disabled` on the underlying input', () => {
      render(<OTPField name="otp" label="Code" disabled />);
      const input = screen.getByLabelText('Code') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('inside DashFormProvider', () => {
    it('mounts cleanly inside a bridge-providing tree', () => {
      render(
        <DashFormProvider defaultValues={{ otp: '' }}>
          <OTPField name="otp" label="Code" length={4} />
        </DashFormProvider>
      );
      // Mount-only assertion. Initial value reflection and round-trip
      // are timing-sensitive in vitest; verified end-to-end in dash.
      expect(screen.getByLabelText('Code')).toBeInstanceOf(HTMLInputElement);
    });
  });
});
