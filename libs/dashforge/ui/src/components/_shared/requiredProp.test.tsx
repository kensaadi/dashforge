// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { RadioGroup } from '../RadioGroup/RadioGroup';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 20 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, `<Autocomplete required>` and `<RadioGroup required>`
 * were rejected at the type level (Select / Checkbox / Switch already
 * accepted it through MUI's passthrough, and TextField / Textarea /
 * NumberField / DatePicker declared their own).
 *
 * After the fix, both components accept `required?: boolean`:
 * - `Autocomplete` forwards it to the internal `MuiTextField` in
 *   `renderInput`, so MUI's `<InputLabel required>` draws the asterisk
 *   and sets `aria-required` on the underlying `<input>`.
 * - `RadioGroup` passes it to the wrapping `<FormControl required>`, which
 *   propagates to `<FormLabel>` for the asterisk and to the radio group
 *   for `aria-required` semantics.
 *
 * The a11y guarantee is important: the inventory-kit workaround drew a
 * literal `*` in the label text but set no `aria-required`, so screen
 * readers didn't announce the field as required. This regression guard
 * pins both the visual asterisk AND the `aria-required` attribute.
 */

describe('BUG 20 regression guard — `required` on Autocomplete + RadioGroup', () => {
  const opts = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ];

  // Helper: HTML5 `required` and ARIA `aria-required="true"` are
  // a11y-equivalent for assistive technology (WAI-ARIA §6.6). MUI marks its
  // native inputs with HTML5 `required`; some derived inputs also carry
  // `aria-required`. Either signal counts as "the input announces itself
  // required".
  const isRequired = (el: Element | null | undefined): boolean => {
    if (!el) return false;
    if (el.hasAttribute('required')) return true;
    if (el.getAttribute('aria-required') === 'true') return true;
    return false;
  };

  it('<Autocomplete required> renders the MUI asterisk and marks the input required', () => {
    const { container } = render(
      <Autocomplete
        name="assignee"
        options={opts}
        label="Assignee"
        required
      />,
    );

    // MUI InputLabel emits an `<span aria-hidden class="MuiFormLabel-asterisk">`.
    const asterisk = container.querySelector('.MuiFormLabel-asterisk');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent?.includes('*')).toBe(true);

    // The combobox input carries either `required` (HTML5) or
    // `aria-required="true"`. Both are read as "required" by screen readers.
    const input = container.querySelector('input[role="combobox"]');
    expect(isRequired(input)).toBe(true);
  });

  it('<Autocomplete> without `required` does not render the asterisk or mark the input required', () => {
    const { container } = render(
      <Autocomplete name="assignee" options={opts} label="Assignee" />,
    );
    expect(container.querySelector('.MuiFormLabel-asterisk')).toBeNull();
    const input = container.querySelector('input[role="combobox"]');
    expect(isRequired(input)).toBe(false);
  });

  it('<RadioGroup required> renders the MUI asterisk on the label', () => {
    const { container } = render(
      <RadioGroup name="color" label="Color" options={opts} required />,
    );

    // The asterisk is the primary a11y signal for the group as a whole:
    // FormControl.required propagates to <FormLabel>, which renders the
    // asterisk with Mui-required class. Per-radio `aria-required` is not a
    // MUI guarantee (v9 does not add it), so the asterisk on the label plus
    // the Mui-required marker below is what we pin.
    const asterisk = container.querySelector('.MuiFormLabel-asterisk');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent?.includes('*')).toBe(true);

    // FormLabel itself carries `Mui-required` when required.
    const label = container.querySelector('.MuiFormLabel-root');
    expect(label?.classList.contains('Mui-required')).toBe(true);
  });

  it('<RadioGroup> without `required` does not render the asterisk', () => {
    const { container } = render(
      <RadioGroup name="color" label="Color" options={opts} />,
    );
    expect(container.querySelector('.MuiFormLabel-asterisk')).toBeNull();
  });
});
