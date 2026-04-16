import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OTPInput } from './OTPInput';
import type { OTPInputProps } from './otpField.types';

describe('OTPInput - Internal Primitive', () => {
  const defaultProps: OTPInputProps = {
    value: '',
    onChange: vi.fn(),
    length: 6,
    mode: 'numeric',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders hidden input and visual slots', () => {
      const { container } = render(<OTPInput {...defaultProps} />);

      // Hidden input should exist
      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toBeInTheDocument();

      // Visual slots container should be rendered with presentation role
      const slotsContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      expect(slotsContainer).toBeInTheDocument();
    });

    it('renders correct number of slots', () => {
      const { container } = render(<OTPInput {...defaultProps} length={4} />);

      // Count slot divs (they're inside the presentation container)
      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');
      expect(slots?.length).toBe(4);
    });

    it('displays value in slots', () => {
      const { container } = render(<OTPInput {...defaultProps} value="123" />);

      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');

      expect(slots?.[0].textContent).toBe('1');
      expect(slots?.[1].textContent).toBe('2');
      expect(slots?.[2].textContent).toBe('3');
      expect(slots?.[3].textContent).toBe('');
    });
  });

  describe('Character Input', () => {
    it('accepts numeric input in numeric mode', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5' } });

      expect(onChange).toHaveBeenCalledWith('5');
    });

    it('rejects non-numeric input in numeric mode', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} mode="numeric" />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a' } });

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('accepts alphanumeric input when mode="alphanumeric"', () => {
      const onChange = vi.fn();
      render(
        <OTPInput {...defaultProps} onChange={onChange} mode="alphanumeric" />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'a' } });
      expect(onChange).toHaveBeenCalledWith('a');

      fireEvent.change(input, { target: { value: '5' } });
      expect(onChange).toHaveBeenCalledWith('5');

      fireEvent.change(input, { target: { value: 'Z' } });
      expect(onChange).toHaveBeenCalledWith('Z');
    });

    it('accepts only alpha input when mode="alpha"', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} mode="alpha" />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'a' } });
      expect(onChange).toHaveBeenCalledWith('a');

      fireEvent.change(input, { target: { value: 'Z' } });
      expect(onChange).toHaveBeenCalledWith('Z');

      fireEvent.change(input, { target: { value: '5' } });
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('truncates input to max length', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} length={4} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '123456' } });

      expect(onChange).toHaveBeenCalledWith('1234');
    });
  });

  describe('Paste Handling', () => {
    it('handles paste of complete code', () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
          length={6}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '123456',
        } as unknown as DataTransfer,
      });

      expect(onChange).toHaveBeenCalledWith('123456');
      // onComplete is called synchronously
      expect(onComplete).toHaveBeenCalledWith('123456');
    });

    it('handles paste of partial code', () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
          length={6}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '12',
        } as unknown as DataTransfer,
      });

      expect(onChange).toHaveBeenCalledWith('12');
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('sanitizes pasted content based on mode', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} mode="numeric" />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '12-34-56',
        } as unknown as DataTransfer,
      });

      expect(onChange).toHaveBeenCalledWith('123456');
    });

    it('truncates pasted content to max length', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} length={4} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '123456789',
        } as unknown as DataTransfer,
      });

      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('inserts pasted content at current caret position', () => {
      const onChange = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          value="12"
          length={6}
          mode="alphanumeric"
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 1 (between '1' and '2')
      input.setSelectionRange(1, 1);

      // Paste "ABC"
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => 'ABC',
        } as unknown as DataTransfer,
      });

      // Should insert at position 1: "1" + "ABC" + "2" = "1ABC2"
      expect(onChange).toHaveBeenCalledWith('1ABC2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles ArrowLeft key', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 2
      input.setSelectionRange(2, 2);

      fireEvent.keyDown(input, { key: 'ArrowLeft' });

      // Caret should move to position 1
      expect(input.selectionStart).toBe(1);
    });

    it('handles ArrowRight key', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 1
      input.setSelectionRange(1, 1);

      fireEvent.keyDown(input, { key: 'ArrowRight' });

      // Caret should move to position 2
      expect(input.selectionStart).toBe(2);
    });

    it('handles Home key', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 2
      input.setSelectionRange(2, 2);

      fireEvent.keyDown(input, { key: 'Home' });

      // Caret should move to position 0
      expect(input.selectionStart).toBe(0);
    });

    it('handles End key', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 0
      input.setSelectionRange(0, 0);

      fireEvent.keyDown(input, { key: 'End' });

      // Caret should move to position 3 (after last character)
      expect(input.selectionStart).toBe(3);
    });

    it('End key places caret after last entered character', () => {
      render(<OTPInput {...defaultProps} value="12" length={6} />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 0
      input.setSelectionRange(0, 0);

      fireEvent.keyDown(input, { key: 'End' });

      // Caret should be at position 2 (value.length), not 1 (value.length - 1)
      expect(input.selectionStart).toBe(2);
    });

    it('handles Backspace key', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} value="123" onChange={onChange} />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 2 (after '2')
      input.setSelectionRange(2, 2);

      fireEvent.keyDown(input, { key: 'Backspace' });

      // Should delete character at position 1 ('2')
      expect(onChange).toHaveBeenCalledWith('13');
    });

    it('handles Delete key', () => {
      const onChange = vi.fn();
      render(<OTPInput {...defaultProps} value="123" onChange={onChange} />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Set caret to position 1 (before '2')
      input.setSelectionRange(1, 1);

      fireEvent.keyDown(input, { key: 'Delete' });

      // Should delete character at position 1 ('2')
      expect(onChange).toHaveBeenCalledWith('13');
    });
  });

  describe('Click on Slot', () => {
    it('repositions caret when slot is clicked', () => {
      const { container } = render(<OTPInput {...defaultProps} value="123" />);
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');

      // Click on slot index 2
      fireEvent.click(slots![2]);

      // Caret should move to position 2
      expect(input.selectionStart).toBe(2);
    });

    it('does not respond to click when disabled', () => {
      const { container } = render(
        <OTPInput {...defaultProps} value="123" disabled />
      );
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');

      // Set initial caret position
      input.setSelectionRange(0, 0);

      // Click on slot index 2
      fireEvent.click(slots![2]);

      // Caret should not move (stays at 0)
      expect(input.selectionStart).toBe(0);
    });

    it('allows clicking on empty future slots', async () => {
      const { container } = render(
        <OTPInput {...defaultProps} value="12" length={6} />
      );
      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;

      // Spy on setSelectionRange to verify it's called with correct position
      const setSelectionRangeSpy = vi.spyOn(input, 'setSelectionRange');

      const slotContainer = container.querySelector(
        '[role="presentation"][aria-hidden="true"]'
      );
      const slots = slotContainer?.querySelectorAll('div');

      // Click on slot index 4 (empty, beyond current value)
      fireEvent.click(slots![4]);

      // Verify setSelectionRange was called with position 4
      // (This proves the fix works, even if JSDOM doesn't fully support it)
      expect(setSelectionRangeSpy).toHaveBeenCalledWith(4, 4);
    });
  });

  describe('onComplete Callback', () => {
    it('fires onComplete when all slots filled via typing', () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
          length={4}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '1234' } });

      expect(onComplete).toHaveBeenCalledWith('1234');
    });

    it('fires onComplete when all slots filled via paste', () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
          length={4}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '1234',
        } as unknown as DataTransfer,
      });

      // onComplete is called synchronously
      expect(onComplete).toHaveBeenCalledWith('1234');
    });

    it('does not fire onComplete when partially filled', () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
          length={6}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '123' } });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<OTPInput {...defaultProps} disabled />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe('AutoFocus', () => {
    it('focuses input on mount when autoFocus is true', () => {
      render(<OTPInput {...defaultProps} autoFocus />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveFocus();
    });

    it('does not focus input on mount when autoFocus is false', () => {
      render(<OTPInput {...defaultProps} autoFocus={false} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).not.toHaveFocus();
    });
  });

  describe('Blur Handling', () => {
    it('calls onBlur when input loses focus', () => {
      const onBlur = vi.fn();
      render(<OTPInput {...defaultProps} onBlur={onBlur} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('ARIA and Accessibility', () => {
    it('passes inputProps to hidden input', () => {
      render(
        <OTPInput
          {...defaultProps}
          inputProps={{
            'aria-label': 'Enter code',
            'aria-required': true,
          }}
        />
      );

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveAttribute('aria-label', 'Enter code');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('sets inputMode based on mode prop', () => {
      const { rerender } = render(
        <OTPInput {...defaultProps} mode="numeric" />
      );
      let input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveAttribute('inputMode', 'numeric');

      rerender(<OTPInput {...defaultProps} mode="alphanumeric" />);
      input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
      expect(input).toHaveAttribute('inputMode', 'text');
    });

    it('sets autoComplete="one-time-code" for mobile auto-fill', () => {
      render(<OTPInput {...defaultProps} />);

      const input = screen.getByRole('textbox', {
        hidden: true,
      }) as HTMLInputElement;
      expect(input).toHaveAttribute('autoComplete', 'one-time-code');
    });
  });
});
