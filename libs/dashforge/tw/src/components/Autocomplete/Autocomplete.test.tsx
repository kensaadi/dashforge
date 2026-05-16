// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { Autocomplete } from './Autocomplete.js';
import type { AutocompleteOption } from './autocomplete.types.js';

const fruits: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('<Autocomplete>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders the input + label + open trigger', () => {
      render(
        <Autocomplete name="fruit" label="Pick a fruit" options={fruits} />
      );
      // Aria ComboBox produces a combobox role on the input
      expect(screen.getByRole('combobox')).toBeTruthy();
      expect(screen.getByText('Pick a fruit')).toBeTruthy();
      // The chevron is a button with aria-label="Open"
      expect(screen.getByLabelText('Open')).toBeTruthy();
    });

    it('displays the default value selected (label of the option)', () => {
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          defaultValue="banana"
        />
      );
      // The combobox input value shows the option label
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('Banana');
    });

    it('renders a `*` for required fields', () => {
      render(<Autocomplete name="fruit" label="Fruit" options={fruits} required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('renders the helperText when provided', () => {
      render(
        <Autocomplete
          name="fruit"
          label="Fruit"
          options={fruits}
          helperText="Choose your favourite"
        />
      );
      expect(screen.getByText('Choose your favourite')).toBeTruthy();
    });

    it('exposes a clear button only when a value is selected', () => {
      const { rerender } = render(
        <Autocomplete name="fruit" options={fruits} />
      );
      expect(screen.queryByLabelText('Clear selection')).toBeNull();

      rerender(
        <Autocomplete name="fruit" options={fruits} defaultValue="cherry" />
      );
      expect(screen.getByLabelText('Clear selection')).toBeTruthy();
    });

    it('disables the combobox when `disabled`', () => {
      render(<Autocomplete name="fruit" options={fruits} disabled />);
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('inside DashFormProvider', () => {
    it('mounts cleanly inside a bridge-providing tree', () => {
      render(
        <DashFormProvider defaultValues={{ fruit: 'apple' }}>
          <Autocomplete name="fruit" label="Fruit" options={fruits} />
        </DashFormProvider>
      );
      // Mount-only assertion (RHF defaultValues commit is timing-
      // sensitive in vitest; the end-to-end round-trip is verified in
      // the dash smoke page — same pattern as RadioGroup / NumberField).
      expect(screen.getByRole('combobox')).toBeTruthy();
    });
  });

  describe('event wiring', () => {
    it('fires onValueChange with `null` when the clear button is pressed', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          value="apple"
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onValueChange).toHaveBeenCalledWith(null);
    });
  });
});
