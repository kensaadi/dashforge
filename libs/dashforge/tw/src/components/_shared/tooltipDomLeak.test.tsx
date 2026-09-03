// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { TextField } from '../TextField/TextField.js';
import { NumberField } from '../NumberField/NumberField.js';
import { Textarea } from '../Textarea/Textarea.js';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 9 in libs/dashforge/README-BUG.md.
 *
 * The three field components below (`TextField`, `NumberField`,
 * `Textarea`) spread `{...rest}` onto a real `<input>` / `<textarea>`.
 * If a future edit removes `tooltip` from the destructured keys, the
 * prop's value will land as an unknown HTML attribute on the DOM —
 * React 19 forwards lowercase unknown attrs silently, so nothing in
 * the console will say a word. These assertions fail loudly instead.
 *
 * The other six bridge-integrated field components in this package
 * (`Autocomplete`, `Select`, `DatePicker`, `RadioGroup`, `Checkbox`,
 * `Switch`) do NOT spread `{...rest}` onto any DOM element — they
 * compose the `<input>` / `<button>` / `<div>` from explicit props
 * only — so tooltip cannot leak from them structurally. The bug
 * report's "9 components affected" claim was verified empirically
 * against Autocomplete (0 elements out of ~2200 rendered with the
 * probed tooltip value) and confirmed as an over-claim; the real
 * blast radius is these three. See README-BUG § Fixed § BUG 9 for
 * the details.
 */

const noLeak = (root: HTMLElement) => {
  // Scan the entire rendered subtree, not just the top-level element,
  // because helper text / label are rendered as siblings and one might
  // some day pick up an accidental prop spread too.
  const all = root.querySelectorAll('*');
  for (const el of Array.from(all)) {
    if (el.hasAttribute('tooltip')) {
      throw new Error(
        `tooltip attribute leaked onto <${el.tagName.toLowerCase()}>: ` +
          `"${el.getAttribute('tooltip')}". Add \`tooltip\` to the ` +
          `component's destructure block so it does not fall into ` +
          `\`...rest\`. See README-BUG § BUG 9.`,
      );
    }
  }
};

describe('BUG 9 regression guard — no `tooltip` HTML attribute on rendered DOM', () => {
  it('TextField does not leak `tooltip` when passed as a string', () => {
    const { container } = render(
      <TextField name="probe" tooltip="probe-string-tooltip" />,
    );
    noLeak(container);
    // Also assert the specific input receives no tooltip attr.
    const input = container.querySelector('input[name="probe"]');
    expect(input?.hasAttribute('tooltip')).toBe(false);
  });

  it('TextField does not leak `tooltip` when passed as the object form', () => {
    const { container } = render(
      <TextField
        name="probe"
        tooltip={{ content: 'probe-object-tooltip', side: 'right' }}
      />,
    );
    noLeak(container);
  });

  it('NumberField does not leak `tooltip`', () => {
    const { container } = render(
      <NumberField name="qty" tooltip="probe-number-tooltip" />,
    );
    noLeak(container);
    const input = container.querySelector('input[name="qty"]');
    expect(input?.hasAttribute('tooltip')).toBe(false);
  });

  it('Textarea does not leak `tooltip`', () => {
    const { container } = render(
      <Textarea name="notes" tooltip="probe-textarea-tooltip" />,
    );
    noLeak(container);
    const textarea = container.querySelector('textarea[name="notes"]');
    expect(textarea?.hasAttribute('tooltip')).toBe(false);
  });
});
