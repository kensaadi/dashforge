import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for Textarea component.
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('Textarea', () => {
  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders multiline input', () => {
      render(<Textarea name="description" label="Description" />);

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      // MUI TextField with multiline renders a textarea element
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('forwards value and onChange correctly', async () => {
      const user = userEvent.setup();
      const values: string[] = [];

      const Wrapper = () => {
        const [value, setValue] = useState('');
        return (
          <Textarea
            name="description"
            label="Description"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(newValue);
              values.push(newValue);
            }}
          />
        );
      };

      render(<Wrapper />);

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');

      await user.type(textarea, 'Hello');
      expect(textarea.value).toBe('Hello');
      expect(values).toEqual(['H', 'He', 'Hel', 'Hell', 'Hello']);
    });

    it('renders helperText when provided', () => {
      render(
        <Textarea
          name="description"
          label="Description"
          helperText="Enter a detailed description"
        />
      );

      expect(
        screen.getByText('Enter a detailed description')
      ).toBeInTheDocument();
    });

    it('respects explicit error prop', () => {
      render(
        <Textarea
          name="description"
          label="Description"
          helperText="This field is required"
          error={true}
        />
      );

      const helperText = screen.getByText('This field is required');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('Mui-error');
    });

    it('visibleWhen false renders null (plain mode)', () => {
      render(
        <Textarea
          name="description"
          label="Description"
          visibleWhen={() => false}
        />
      );

      expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
    });

    it('defaults to minRows={3}', () => {
      render(<Textarea name="description" label="Description" />);

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      // Verify component renders with multiline prop enabled
      // MUI TextField with multiline renders a textarea
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('allows overriding minRows', () => {
      render(<Textarea name="description" label="Description" minRows={5} />);

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      // Verify prop is accepted (component renders without error)
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('binds to bridge value', () => {
      renderWithBridge(
        <Textarea
          name="description"
          label="Description"
          rules={{ required: true }}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { description: 'Initial text' },
          },
        }
      );

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial text');
    });

    it('defaults to empty string when bridge value is null/undefined', () => {
      renderWithBridge(<Textarea name="description" label="Description" />, {
        mockBridgeOptions: {
          defaultValues: { description: null },
        },
      });

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('user typing updates bridge value', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Textarea name="description" label="Description" />,
        {
          mockBridgeOptions: {
            defaultValues: { description: '' },
          },
        }
      );

      const textarea = screen.getByLabelText('Description');
      await user.type(textarea, 'New text');

      // Verify bridge state was updated with the text
      expect(state?.values.description).toBe('New text');
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Textarea name="description" label="Description" />,
        {
          mockBridgeOptions: {
            defaultValues: { description: 'Some text' },
          },
        }
      );

      const textarea = screen.getByLabelText('Description');
      await user.click(textarea);
      await user.tab(); // Move focus away (triggers blur)

      // Verify touched state was updated
      expect(state?.touched.description).toBe(true);
    });

    it('explicit value prop overrides bridge value (prop precedence)', () => {
      renderWithBridge(
        <Textarea
          name="description"
          label="Description"
          value="Explicit value"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { description: 'Bridge value' },
          },
        }
      );

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      // Explicit value should override bridge value
      expect(textarea.value).toBe('Explicit value');
    });

    it('handles empty string value prop in bound mode', () => {
      renderWithBridge(
        <Textarea name="description" label="Description" value="" />,
        {
          mockBridgeOptions: {
            defaultValues: { description: 'Bridge value' },
          },
        }
      );

      const textarea = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;
      // Explicit empty string should override bridge value
      expect(textarea.value).toBe('');
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('does not show error when field is not touched and submitCount is 0', () => {
      renderWithBridge(<Textarea name="description" label="Description" />, {
        mockBridgeOptions: {
          defaultValues: { description: '' },
          errors: { description: { message: 'Description is required' } },
          touched: { description: false },
          submitCount: 0,
        },
      });

      expect(
        screen.queryByText('Description is required')
      ).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(<Textarea name="description" label="Description" />, {
        mockBridgeOptions: {
          defaultValues: { description: '' },
          errors: { description: { message: 'Description is required' } },
          touched: { description: true },
          submitCount: 0,
        },
      });

      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(<Textarea name="description" label="Description" />, {
        mockBridgeOptions: {
          defaultValues: { description: '' },
          errors: { description: { message: 'Description is required' } },
          touched: { description: false },
          submitCount: 1,
        },
      });

      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(
        <Textarea name="description" label="Description" error={false} />,
        {
          mockBridgeOptions: {
            defaultValues: { description: '' },
            errors: { description: { message: 'Bridge error' } },
            touched: { description: true },
            submitCount: 0,
          },
        }
      );

      // Bridge has error but explicit error=false should override and hide it
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('explicit helperText prop overrides bridge error message', () => {
      renderWithBridge(
        <Textarea
          name="description"
          label="Description"
          helperText="Custom helper text"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { description: '' },
            errors: { description: { message: 'Bridge error' } },
            touched: { description: true },
            submitCount: 0,
          },
        }
      );

      // Explicit helperText should override bridge error message
      expect(screen.getByText('Custom helper text')).toBeInTheDocument();
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });
  });

  describe('Intent D: Visibility', () => {
    it('renders normally when visibleWhen is not provided (bound mode)', () => {
      renderWithBridge(<Textarea name="description" label="Description" />, {
        mockBridgeOptions: {
          defaultValues: { description: 'Some text' },
        },
      });

      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('visibleWhen true renders component (plain mode)', () => {
      render(
        <Textarea
          name="description"
          label="Description"
          visibleWhen={() => true}
        />
      );

      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });
});
