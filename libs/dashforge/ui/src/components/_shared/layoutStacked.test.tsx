// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { Textarea } from '../Textarea/Textarea';
import { NumberField } from '../NumberField/NumberField';

void React;
afterEach(() => cleanup());

/**
 * Regression / feature guard for BUG 14 and BUG 15 in
 * libs/dashforge/README-BUG.md.
 *
 * Before the fix:
 * - `<Autocomplete layout="stacked">` did not compile (BUG 14).
 * - `<Textarea layout="stacked">` and `<NumberField layout="stacked">`
 *   did not compile (BUG 15).
 *
 * After the fix, all three accept `layout` and, in stacked / inline mode,
 * hand the label + helperText to `FieldLayoutShell`. This test pins two
 * invariants for each:
 *
 * 1. Rendering with `layout="stacked"` does not crash.
 * 2. The external label is rendered as a separate `<label>` element
 *    (FieldLayoutShell's <FormLabel>), not embedded inside the MUI input
 *    (that is the whole point of stacked mode).
 * 3. `layout="floating"` (default) does NOT produce an external label —
 *    it keeps MUI's built-in floating behavior.
 */

const opts = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

// FieldLayoutShell renders a <label class="MuiFormLabel-root"> outside
// the MUI control. In floating mode, MUI renders <label class="MuiInputLabel-root">
// INSIDE the input's fieldset. This selector picks up ONLY the shell's label
// (MuiFormLabel-root not paired with MuiInputLabel-root).
function externalLabel(container: HTMLElement): Element | null {
  const labels = container.querySelectorAll('label.MuiFormLabel-root');
  for (const l of Array.from(labels)) {
    if (!l.classList.contains('MuiInputLabel-root')) return l;
  }
  return null;
}

describe('BUG 14 / BUG 15 regression guard — `layout="stacked"` renders and produces an external label', () => {
  describe('<Autocomplete layout="stacked">', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <Autocomplete
          name="tag"
          label="Tag"
          options={opts}
          layout="stacked"
        />,
      );
      expect(container.querySelector('input[role="combobox"]')).toBeTruthy();
    });

    it('renders an external label via FieldLayoutShell', () => {
      const { container } = render(
        <Autocomplete
          name="tag"
          label="Tag"
          options={opts}
          layout="stacked"
        />,
      );
      const label = externalLabel(container);
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Tag');
    });

    it('renders NO external label in `layout="floating"` (default)', () => {
      const { container } = render(
        <Autocomplete name="tag" label="Tag" options={opts} />,
      );
      expect(externalLabel(container)).toBeNull();
    });
  });

  describe('<Textarea layout="stacked">', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <Textarea name="notes" label="Notes" layout="stacked" />,
      );
      expect(container.querySelector('textarea')).toBeTruthy();
    });

    it('renders an external label via FieldLayoutShell', () => {
      const { container } = render(
        <Textarea name="notes" label="Notes" layout="stacked" />,
      );
      const label = externalLabel(container);
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Notes');
    });

    it('renders NO external label in `layout="floating"` (default)', () => {
      const { container } = render(<Textarea name="notes" label="Notes" />);
      expect(externalLabel(container)).toBeNull();
    });
  });

  describe('<NumberField layout="stacked">', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <NumberField name="qty" label="Quantity" layout="stacked" />,
      );
      expect(container.querySelector('input[type="number"]')).toBeTruthy();
    });

    it('renders an external label via FieldLayoutShell', () => {
      const { container } = render(
        <NumberField name="qty" label="Quantity" layout="stacked" />,
      );
      const label = externalLabel(container);
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Quantity');
    });

    it('renders NO external label in `layout="floating"` (default)', () => {
      const { container } = render(
        <NumberField name="qty" label="Quantity" />,
      );
      expect(externalLabel(container)).toBeNull();
    });
  });
});
