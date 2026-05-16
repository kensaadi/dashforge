// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { Textarea } from './Textarea.js';

describe('<Textarea>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders a <textarea> element with the label', () => {
      render(<Textarea name="bio" label="Bio" />);
      const el = screen.getByLabelText('Bio');
      expect(el).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('respects the `rows` attribute (default 3, overridable)', () => {
      const { rerender } = render(<Textarea name="bio" label="Bio" />);
      expect(screen.getByLabelText('Bio').getAttribute('rows')).toBe('3');
      rerender(<Textarea name="bio" label="Bio" rows={6} />);
      expect(screen.getByLabelText('Bio').getAttribute('rows')).toBe('6');
    });

    it('renders helperText when provided', () => {
      render(
        <Textarea name="bio" label="Bio" helperText="Tell us about yourself" />
      );
      expect(screen.getByText('Tell us about yourself')).toBeTruthy();
    });

    it('renders a `*` for required fields', () => {
      render(<Textarea name="bio" label="Bio" required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('fires onChange when typed into', () => {
      const onChange = vi.fn();
      render(<Textarea name="bio" label="Bio" onChange={onChange} />);
      fireEvent.change(screen.getByLabelText('Bio'), {
        target: { value: 'hello' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('applies the `disabled` attribute on the textarea', () => {
      render(<Textarea name="bio" label="Bio" disabled />);
      const el = screen.getByLabelText('Bio') as HTMLTextAreaElement;
      expect(el.disabled).toBe(true);
    });
  });

  describe('inside DashFormProvider', () => {
    it('reflects the typed value on the textarea element', () => {
      render(
        <DashFormProvider defaultValues={{ bio: '' }}>
          <Textarea name="bio" label="Bio" />
        </DashFormProvider>
      );
      const el = screen.getByLabelText('Bio') as HTMLTextAreaElement;
      fireEvent.change(el, { target: { value: 'A short bio.' } });
      // The bridge updates synchronously; the rendered value mirrors it.
      expect(el.value).toBe('A short bio.');
    });
  });

  describe('resize variant', () => {
    it('default `vertical` adds resize-y', () => {
      render(<Textarea name="bio" label="Bio" />);
      expect(screen.getByLabelText('Bio').className).toMatch(/resize-y/);
    });

    it('`none` adds resize-none', () => {
      render(<Textarea name="bio" label="Bio" resize="none" />);
      expect(screen.getByLabelText('Bio').className).toMatch(/resize-none/);
    });
  });
});
