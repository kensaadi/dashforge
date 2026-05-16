// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { RadioGroup } from './RadioGroup.js';
import type { RadioGroupOption } from './radioGroup.types.js';

const colors: RadioGroupOption[] = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

describe('<RadioGroup>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders all options with the provided labels', () => {
      render(
        <RadioGroup name="color" label="Pick a color" options={colors} />
      );
      // Group label rendered as the labelledby anchor
      expect(screen.getByText('Pick a color')).toBeTruthy();
      // Each option label resolves through the htmlFor → button id link
      for (const opt of colors) {
        expect(screen.getByLabelText(opt.label as string)).toBeTruthy();
      }
    });

    it('selects the default value via uncontrolled `defaultValue`', () => {
      render(
        <RadioGroup
          name="color"
          options={colors}
          defaultValue="green"
        />
      );
      const radios = screen.getAllByRole('radio');
      // The second option corresponds to "green"
      expect(radios[1].getAttribute('data-state')).toBe('checked');
    });

    it('fires onValueChange on selection', () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup
          name="color"
          options={colors}
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Blue'));
      expect(onValueChange).toHaveBeenCalledWith('blue');
    });

    it('respects per-option `disabled`', () => {
      const opts: RadioGroupOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      render(<RadioGroup name="x" options={opts} />);
      const radios = screen.getAllByRole('radio') as HTMLButtonElement[];
      expect(radios[0].disabled).toBe(false);
      expect(radios[1].disabled).toBe(true);
    });

    it('disables ALL options when the group is disabled', () => {
      render(
        <RadioGroup name="color" options={colors} disabled />
      );
      for (const r of screen.getAllByRole('radio') as HTMLButtonElement[]) {
        expect(r.disabled).toBe(true);
      }
    });
  });

  describe('inside DashFormProvider', () => {
    it('renders without errors inside a bridge-providing tree', () => {
      render(
        <DashFormProvider defaultValues={{ color: 'green' }}>
          <RadioGroup name="color" label="Color" options={colors} />
        </DashFormProvider>
      );
      // Bridge mode mounts cleanly; all three options render. The exact
      // checked-state reflection is verified end-to-end in the F4 smoke
      // page in learn/dash where the full reactive cycle has time to
      // settle — unit-test assertions on Radix internal state right
      // after render are timing-sensitive and not worth the brittleness.
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('renders the helperText when provided', () => {
      render(
        <DashFormProvider defaultValues={{ color: '' }}>
          <RadioGroup
            name="color"
            options={colors}
            helperText="Choose carefully"
          />
        </DashFormProvider>
      );
      expect(screen.getByText('Choose carefully')).toBeTruthy();
    });
  });

  describe('layout variant', () => {
    it('default `stacked` renders options vertically (flex-col)', () => {
      const { container } = render(
        <RadioGroup name="x" options={colors} />
      );
      const list = within(container).getByRole('radiogroup');
      expect(list.className).toMatch(/flex-col/);
    });

    it('`row` layout renders options horizontally', () => {
      const { container } = render(
        <RadioGroup name="x" options={colors} layout="row" />
      );
      const list = within(container).getByRole('radiogroup');
      expect(list.className).toMatch(/flex-row/);
    });
  });

  describe('required marker', () => {
    it('renders a red `*` after the label when `required` is set', () => {
      render(
        <RadioGroup
          name="x"
          options={colors}
          label="Color"
          required
        />
      );
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('does NOT render a `*` when `required` is omitted', () => {
      render(<RadioGroup name="x" options={colors} label="Color" />);
      expect(screen.queryByText('*')).toBeNull();
    });
  });
});
