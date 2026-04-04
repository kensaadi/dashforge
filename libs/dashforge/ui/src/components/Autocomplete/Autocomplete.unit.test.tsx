import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';
import { renderWithBridge } from '../../test-utils/renderWithBridge';

/**
 * Unit tests for Autocomplete component (freeSolo mode).
 * Tests cover both plain mode (outside DashFormContext) and bound mode (inside DashFormContext).
 */
describe('Autocomplete', () => {
  const testOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ];

  describe('Intent A: Plain mode (outside DashFormContext)', () => {
    it('renders input with label', () => {
      render(
        <Autocomplete name="country" label="Country" options={testOptions} />
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('selecting an option calls onChange with option.value', async () => {
      const user = userEvent.setup();
      let capturedValue: string | null | undefined;

      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          onChange={(value: string | null) => {
            capturedValue = value;
          }}
        />
      );

      const input = screen.getByLabelText('Country');
      await user.click(input);

      // Wait for options to appear
      const canadaOption = await screen.findByText('Canada');
      await user.click(canadaOption);

      expect(capturedValue).toBe('ca');
    });

    it('freeSolo typing + blur calls onChange with typed string', async () => {
      const user = userEvent.setup();
      let capturedValue: string | null | undefined;

      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          onChange={(value: string | null) => {
            capturedValue = value;
          }}
        />
      );

      const input = screen.getByLabelText('Country');
      await user.type(input, 'Custom text');
      await user.tab(); // Blur

      await waitFor(() => {
        expect(capturedValue).toBe('Custom text');
      });
    });

    it('clearing sets value to null', async () => {
      const user = userEvent.setup();
      const values: Array<string | null> = [];

      const Wrapper = () => {
        const [value, setValue] = useState<string | null>('ca');
        return (
          <Autocomplete
            name="country"
            label="Country"
            options={testOptions}
            value={value}
            onChange={(newValue: string | null) => {
              setValue(newValue);
              values.push(newValue);
            }}
          />
        );
      };

      render(<Wrapper />);

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      expect(input.value).toBe('Canada'); // Should show label for 'ca'

      // Find and click clear button
      const clearButton = screen.getByTitle('Clear');
      await user.click(clearButton);

      await waitFor(() => {
        expect(values[values.length - 1]).toBe(null);
      });
    });

    it('respects explicit helperText prop', () => {
      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          helperText="Select your country"
        />
      );

      expect(screen.getByText('Select your country')).toBeInTheDocument();
    });

    it('respects explicit error prop', () => {
      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          helperText="Country is required"
          error={true}
        />
      );

      const helperText = screen.getByText('Country is required');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('Mui-error');
    });

    it('visibleWhen false renders null (plain mode)', () => {
      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          visibleWhen={() => false}
        />
      );

      expect(screen.queryByLabelText('Country')).not.toBeInTheDocument();
    });
  });

  describe('Intent B: Bound mode (inside DashFormContext)', () => {
    it('registers and binds to bridge value (option.value)', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      // Should display the label for option.value 'ca'
      expect(input.value).toBe('Canada');
    });

    it('binds to unknown string as freeSolo text', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'Custom Country' },
          },
        }
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      // Should display the raw string since it doesn't match any option
      expect(input.value).toBe('Custom Country');
    });

    it('defaults to empty string when bridge value is null', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
          },
        }
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('selecting option updates bridge value with option.value', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
          },
        }
      );

      const input = screen.getByLabelText('Country');
      await user.click(input);

      const usOption = await screen.findByText('United States');
      await user.click(usOption);

      await waitFor(() => {
        expect(state?.values.country).toBe('us');
      });
    });

    it('freeSolo typing + blur updates bridge value with typed string', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: '' },
          },
        }
      );

      const input = screen.getByLabelText('Country');
      await user.type(input, 'Free text input');
      await user.tab(); // Blur to commit

      await waitFor(() => {
        expect(state?.values.country).toBe('Free text input');
      });
    });

    it('clearing sets bridge value to null', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      expect(state?.values.country).toBe('ca');

      const clearButton = screen.getByTitle('Clear');
      await user.click(clearButton);

      await waitFor(() => {
        expect(state?.values.country).toBe(null);
      });
    });

    it('marks field as touched on blur', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const input = screen.getByLabelText('Country');
      await user.click(input);
      await user.tab(); // Blur

      await waitFor(() => {
        expect(state?.touched.country).toBe(true);
      });
    });

    it('explicit value prop overrides bridge value (prop precedence)', () => {
      renderWithBridge(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          value="uk"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      // Explicit value should override bridge value
      expect(input.value).toBe('United Kingdom');
    });

    it('handles empty string value prop in bound mode', () => {
      renderWithBridge(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          value=""
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      const input = screen.getByLabelText('Country') as HTMLInputElement;
      // Explicit empty string should override bridge value
      expect(input.value).toBe('');
    });
  });

  describe('Intent C: Error gating (Form Closure v1)', () => {
    it('does not show error when field is not touched and submitCount is 0', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
            errors: { country: { message: 'Country is required' } },
            touched: { country: false },
            submitCount: 0,
          },
        }
      );

      expect(screen.queryByText('Country is required')).not.toBeInTheDocument();
    });

    it('shows error when field is touched', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
            errors: { country: { message: 'Country is required' } },
            touched: { country: true },
            submitCount: 0,
          },
        }
      );

      expect(screen.getByText('Country is required')).toBeInTheDocument();
    });

    it('shows error when submitCount > 0 even if not touched', () => {
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
            errors: { country: { message: 'Country is required' } },
            touched: { country: false },
            submitCount: 1,
          },
        }
      );

      expect(screen.getByText('Country is required')).toBeInTheDocument();
    });

    it('explicit error prop overrides bridge error', () => {
      renderWithBridge(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          error={false}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
            errors: { country: { message: 'Bridge error' } },
            touched: { country: true },
            submitCount: 0,
          },
        }
      );

      // Bridge has error but explicit error=false should override and hide it
      expect(screen.queryByText('Bridge error')).not.toBeInTheDocument();
    });

    it('explicit helperText prop overrides bridge error message', () => {
      renderWithBridge(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          helperText="Custom helper text"
        />,
        {
          mockBridgeOptions: {
            defaultValues: { country: null },
            errors: { country: { message: 'Bridge error' } },
            touched: { country: true },
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
      renderWithBridge(
        <Autocomplete name="country" label="Country" options={testOptions} />,
        {
          mockBridgeOptions: {
            defaultValues: { country: 'ca' },
          },
        }
      );

      expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });

    it('visibleWhen true renders component (plain mode)', () => {
      render(
        <Autocomplete
          name="country"
          label="Country"
          options={testOptions}
          visibleWhen={() => true}
        />
      );

      expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });
  });

  describe('Intent E: Generic option support', () => {
    interface Product {
      id: number;
      name: string;
      discontinued: boolean;
    }

    const products: Product[] = [
      { id: 1, name: 'Widget', discontinued: false },
      { id: 2, name: 'Gadget', discontinued: false },
      { id: 3, name: 'Doohickey', discontinued: true },
    ];

    it('accepts generic options with custom mappers (plain mode)', () => {
      render(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
          getOptionDisabled={(opt: Product) => opt.discontinued}
        />
      );

      const input = screen.getByLabelText('Product');
      expect(input).toBeInTheDocument();
    });

    it('displays custom label for selected generic option', () => {
      render(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
          getOptionDisabled={(opt: Product) => opt.discontinued}
        />
      );

      const input = screen.getByLabelText('Product') as HTMLInputElement;
      expect(input.value).toBe('Widget');
    });

    it('onChange receives mapped value (number type)', async () => {
      const user = userEvent.setup();
      let capturedValue: number | null | undefined;

      render(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
          onChange={(value: number | null) => {
            capturedValue = value;
          }}
        />
      );

      const input = screen.getByLabelText('Product');
      await user.click(input);

      const gadgetOption = await screen.findByText('Gadget');
      await user.click(gadgetOption);

      await waitFor(() => {
        expect(capturedValue).toBe(2);
      });
    });

    it('disabled options are not selectable', async () => {
      const user = userEvent.setup();

      render(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
          getOptionDisabled={(opt: Product) => opt.discontinued}
        />
      );

      const input = screen.getByLabelText('Product');
      await user.click(input);

      // Find the disabled option (Doohickey has discontinued: true)
      // Use getAllByRole to find the specific option element directly
      const options = screen.getAllByRole('option');
      const doohickeyOption = options.find((opt) =>
        opt.textContent?.includes('Doohickey')
      );

      expect(doohickeyOption).toBeDefined();

      // Verify it has aria-disabled="true" (our custom renderOption adds this)
      expect(doohickeyOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('filters out null/undefined options during normalization', async () => {
      const user = userEvent.setup();
      const optionsWithNulls: Array<Product | null | undefined> = [
        { id: 1, name: 'Widget', discontinued: false },
        null,
        { id: 2, name: 'Gadget', discontinued: false },
        undefined,
      ];

      render(
        <Autocomplete<number, Product | null | undefined>
          name="product"
          label="Product"
          options={optionsWithNulls}
          getOptionValue={(opt) => opt!.id}
          getOptionLabel={(opt) => opt!.name}
        />
      );

      const input = screen.getByLabelText('Product');
      await user.click(input);

      // Should only see 2 options
      expect(screen.getByText('Widget')).toBeInTheDocument();
      expect(screen.getByText('Gadget')).toBeInTheDocument();
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });

    it('uses default label mapper (String coercion) when getOptionLabel not provided', () => {
      const simpleOptions = [42, 99, 123];

      render(
        <Autocomplete<number, number>
          name="number"
          label="Number"
          options={simpleOptions}
          getOptionValue={(opt) => opt}
          value={42}
        />
      );

      const input = screen.getByLabelText('Number') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('uses default value mapper (identity) when getOptionValue not provided', async () => {
      const user = userEvent.setup();
      let capturedValue: string | null | undefined;

      render(
        <Autocomplete
          name="country"
          label="Country"
          options={['USA', 'Canada', 'Mexico']}
          onChange={(value: string | null) => {
            capturedValue = value;
          }}
        />
      );

      const input = screen.getByLabelText('Country');
      await user.click(input);

      const canadaOption = await screen.findByText('Canada');
      await user.click(canadaOption);

      await waitFor(() => {
        expect(capturedValue).toBe('Canada');
      });
    });

    it('binds to bridge value with generic type (bound mode)', () => {
      renderWithBridge(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { product: 2 },
          },
        }
      );

      const input = screen.getByLabelText('Product') as HTMLInputElement;
      expect(input.value).toBe('Gadget');
    });

    it('updates bridge value with mapped generic value', async () => {
      const user = userEvent.setup();

      const { state } = renderWithBridge(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { product: null },
          },
        }
      );

      const input = screen.getByLabelText('Product');
      await user.click(input);

      const widgetOption = await screen.findByText('Widget');
      await user.click(widgetOption);

      await waitFor(() => {
        expect(state?.values.product).toBe(1);
      });
    });

    // Phase 2: Display Sanitization (deferred per architecture plan)
    it('handles unresolved numeric value as null (display sanitization)', () => {
      renderWithBridge(
        <Autocomplete<number, Product>
          name="product"
          label="Product"
          options={products}
          getOptionValue={(opt: Product) => opt.id}
          getOptionLabel={(opt: Product) => opt.name}
        />,
        {
          mockBridgeOptions: {
            defaultValues: { product: 999 }, // Unresolved numeric value
          },
        }
      );

      const input = screen.getByLabelText('Product') as HTMLInputElement;
      // Should sanitize to empty string for unresolved numeric value (static mode)
      expect(input.value).toBe('');
    });

    // Note: Runtime mode sanitization tests require runtime mocking support
    // Future test: 'sanitizes unresolved string value in runtime mode'
    // - Set optionsFromFieldData=true
    // - Mock runtime.status='ready' with options
    // - Set string value not in options
    // - Expect input.value to be '' (sanitized)
  });
});
