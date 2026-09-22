// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Switch } from '../Switch/Switch.js';

void React;
afterEach(() => cleanup());

/**
 * Regression / feature guard for BUG 21 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, `<Checkbox>` and `<Switch>` in `@dashforge/tw` did not
 * declare `required?: boolean` — the only two field components in the
 * package missing it while the other 12 (Autocomplete, DatePicker,
 * NumberField, etc.) accepted it. A mandatory consent box was drawn as an
 * asterisk-in-label workaround by consumers, which announces nothing to
 * assistive technology.
 *
 * The fix wires `required` on both components:
 * - Renders a `*` marker at the end of the label (BUG 21 report's own
 *   layout call: the marker belongs beside the label text, not before it,
 *   because the label sits next to the control not above it).
 * - Sets `aria-required="true"` on the underlying Radix Root button
 *   (`<button role="checkbox">` / `<button role="switch">`, for which
 *   the HTML5 `required` attribute is a11y-inert).
 *
 * `.MuiFormLabel-asterisk` does NOT apply here — that is the MUI-side
 * marker for BUG 20's fix. The tw side draws its own `<span>` styled by
 * the `requiredMark` slot; we look for it via its text content.
 */

// Helper: is the asterisk rendered next to the label? Search for a `<span
// aria-hidden="true">*</span>` that lives inside a `<label>` element.
function hasRequiredMark(container: HTMLElement): boolean {
  const label = container.querySelector('label');
  if (!label) return false;
  const spans = label.querySelectorAll('span[aria-hidden="true"]');
  for (const s of Array.from(spans)) {
    if (s.textContent?.trim() === '*') return true;
  }
  return false;
}

// Helper: is the Radix Root announcing itself required to screen readers?
// The Root is a `<button role="checkbox">` or `<button role="switch">`
// depending on the component. `aria-required="true"` is the a11y marker.
function radixRootIsRequired(container: HTMLElement, role: 'checkbox' | 'switch'): boolean {
  const btn = container.querySelector(`button[role="${role}"]`);
  return btn?.getAttribute('aria-required') === 'true';
}

describe('BUG 21 regression guard — `required` on tw Checkbox + Switch', () => {
  describe('<Checkbox required>', () => {
    it('renders the asterisk marker next to the label', () => {
      const { container } = render(
        <Checkbox name="consent" label="I accept the terms" required />,
      );
      expect(hasRequiredMark(container)).toBe(true);
    });

    it('sets aria-required="true" on the Radix.Checkbox.Root button', () => {
      const { container } = render(
        <Checkbox name="consent" label="I accept the terms" required />,
      );
      expect(radixRootIsRequired(container, 'checkbox')).toBe(true);
    });

    it('does NOT render the asterisk or aria-required when `required` is omitted', () => {
      const { container } = render(
        <Checkbox name="opt" label="Send me updates" />,
      );
      expect(hasRequiredMark(container)).toBe(false);
      const btn = container.querySelector('button[role="checkbox"]');
      const aria = btn?.getAttribute('aria-required');
      // aria-required is either absent or "false".
      expect(aria === null || aria === 'false').toBe(true);
    });
  });

  describe('<Switch required>', () => {
    it('renders the asterisk marker next to the label', () => {
      const { container } = render(
        <Switch name="notify" label="Receive email notifications" required />,
      );
      expect(hasRequiredMark(container)).toBe(true);
    });

    it('sets aria-required="true" on the Radix.Switch.Root button', () => {
      const { container } = render(
        <Switch name="notify" label="Receive email notifications" required />,
      );
      expect(radixRootIsRequired(container, 'switch')).toBe(true);
    });

    it('does NOT render the asterisk or aria-required when `required` is omitted', () => {
      const { container } = render(
        <Switch name="dark" label="Enable dark mode" />,
      );
      expect(hasRequiredMark(container)).toBe(false);
      const btn = container.querySelector('button[role="switch"]');
      const aria = btn?.getAttribute('aria-required');
      expect(aria === null || aria === 'false').toBe(true);
    });
  });

  describe('Slot override', () => {
    it('applies slotProps.requiredMark.className to the asterisk element (Checkbox)', () => {
      const { container } = render(
        <Checkbox
          name="c"
          label="L"
          required
          slotProps={{ requiredMark: { className: 'probe-req-cls' } }}
        />,
      );
      const label = container.querySelector('label');
      const spans = label?.querySelectorAll('span[aria-hidden="true"]') ?? [];
      const marker = Array.from(spans).find(
        (s) => s.textContent?.trim() === '*',
      );
      expect(marker).toBeTruthy();
      expect(marker?.className).toMatch(/probe-req-cls/);
    });
  });
});
