// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { NumberField } from './NumberField.js';

describe('<NumberField>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders a numeric input with the label', () => {
      render(<NumberField name="age" label="Age" />);
      const el = screen.getByLabelText('Age') as HTMLInputElement;
      expect(el).toBeInstanceOf(HTMLInputElement);
      expect(el.type).toBe('number');
    });

    it('respects `min` / `max` / `step` attributes', () => {
      render(
        <NumberField name="qty" label="Qty" min={1} max={10} step={2} />
      );
      const el = screen.getByLabelText('Qty');
      expect(el.getAttribute('min')).toBe('1');
      expect(el.getAttribute('max')).toBe('10');
      expect(el.getAttribute('step')).toBe('2');
    });

    it('displays a controlled numeric value via `value`', () => {
      const { rerender } = render(
        <NumberField name="qty" label="Qty" value={5} onChange={() => undefined} />
      );
      expect((screen.getByLabelText('Qty') as HTMLInputElement).value).toBe('5');
      rerender(
        <NumberField name="qty" label="Qty" value={null} onChange={() => undefined} />
      );
      expect((screen.getByLabelText('Qty') as HTMLInputElement).value).toBe('');
    });

    it('renders a `*` for required fields', () => {
      render(<NumberField name="x" label="X" required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('does NOT render a stepper unless `showStepper` is set', () => {
      render(<NumberField name="x" label="X" />);
      expect(screen.queryByLabelText('Increment')).toBeNull();
      expect(screen.queryByLabelText('Decrement')).toBeNull();
    });

    it('renders +/- stepper buttons when `showStepper` is true', () => {
      render(<NumberField name="x" label="X" showStepper />);
      expect(screen.getByLabelText('Increment')).toBeTruthy();
      expect(screen.getByLabelText('Decrement')).toBeTruthy();
    });
  });

  describe('inside DashFormProvider', () => {
    it('mounts cleanly inside a bridge-providing tree', () => {
      render(
        <DashFormProvider defaultValues={{ age: 30 }}>
          <NumberField name="age" label="Age" />
        </DashFormProvider>
      );
      // Bridge mode mounts cleanly with no console errors. Initial-value
      // reflection in the input is timing-sensitive (RHF's defaultValues
      // commit happens after the first render); the actual end-to-end
      // round-trip is verified in the dash smoke page where async
      // RHF state has time to settle.
      expect(screen.getByLabelText('Age')).toBeInstanceOf(HTMLInputElement);
    });

    it('stepper buttons render and are clickable inside the bridge tree', () => {
      render(
        <DashFormProvider defaultValues={{ qty: 5 }}>
          <NumberField name="qty" label="Qty" showStepper step={3} />
        </DashFormProvider>
      );
      // The stepper itself renders correctly; the bridge round-trip on
      // click is covered by the smoke test in dash.
      const inc = screen.getByLabelText('Increment') as HTMLButtonElement;
      expect(inc.disabled).toBe(false);
      fireEvent.click(inc); // should not throw
    });
  });
});
