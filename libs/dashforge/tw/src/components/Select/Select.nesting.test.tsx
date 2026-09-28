// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Select } from './Select';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

/**
 * Regression guard for BUG 23 in libs/dashforge/README-BUG.md.
 *
 * `<Select multiple>` rendered each chip's remove control as a `<button>`
 * inside the trigger, which was itself a `<button role="combobox">`.
 * `<button>`'s content model is phrasing content with NO interactive
 * descendant, so that markup is invalid: React reports a hydration error
 * and the HTML parser hoists the inner buttons out of the outer one, so the
 * tree the browser builds is not the tree the component described.
 *
 * The fix makes the trigger a `<div role="combobox" tabIndex={0}>`, which is
 * the ARIA APG select-only combobox pattern and gives the chips somewhere
 * legal to live. These tests pin the fix AND everything the native
 * `<button>` used to provide for free, since that is what a switch to a div
 * is at risk of quietly dropping.
 */

describe('BUG 23 regression guard — no interactive descendant in the trigger', () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('nests no interactive element inside the combobox trigger', () => {
    const { container } = render(
      <Select
        name="tags"
        multiple
        value={['solid', 'ghost']}
        options={OPTS}
        onChange={() => undefined}
      />,
    );

    const trigger = screen.getByRole('combobox');

    // The chips and their remove controls are rendered...
    expect(trigger.textContent).toContain('Solid');
    expect(
      screen.getByRole('button', { name: 'Remove Solid' }),
    ).toBeTruthy();

    // ...but the trigger is not a <button>, so nothing interactive is
    // nested inside one.
    expect(container.querySelector('button[role="combobox"]')).toBeNull();
    expect(trigger.tagName).toBe('DIV');
    expect(trigger.querySelector('button')).toBeTruthy();

    // And React logged no DOM-nesting complaint.
    const nesting = errSpy.mock.calls.some((args) =>
      args.some(
        (a) =>
          typeof a === 'string' &&
          (a.includes('cannot be a descendant of') ||
            a.includes('cannot contain a nested')),
      ),
    );
    expect(nesting).toBe(false);
  });

  it('carries no stray `type` attribute from the Radix trigger', () => {
    // Radix's PopoverTrigger injects `type="button"`, and with `asChild`
    // the child's props win — so the div has to neutralise it or the fix
    // trades one invalid attribute for another.
    render(<Select name="x" options={OPTS} />);
    expect(screen.getByRole('combobox').hasAttribute('type')).toBe(false);
  });

  it('keeps `aria-required` and `aria-invalid` on the combobox element', () => {
    // BUG 21 was exactly this cost on a different component: the a11y
    // signal has to stay on the element carrying role="combobox".
    const { rerender } = render(
      <Select name="x" required options={OPTS} />,
    );
    expect(screen.getByRole('combobox').getAttribute('aria-required')).toBe(
      'true',
    );

    rerender(<Select name="x" required error errorText="nope" options={OPTS} />);
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe(
      'true',
    );
  });

  it('is reachable by Tab and still opens on Enter and Space', () => {
    render(<Select name="x" options={OPTS} />);
    const trigger = screen.getByRole('combobox');

    // A div is only focusable with an explicit tabIndex.
    expect(trigger.getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('still announces its label, which `htmlFor` alone cannot do for a div', () => {
    // `<label for>` only associates with a LABELABLE element, and a div is
    // not one, so the accessible name has to come from aria-labelledby.
    //
    // Asserting this with `getByLabelText` alone would be a false green:
    // testing-library resolves `for` against any element id, labelable or
    // not, so it passes even where a real screen reader gets nothing. The
    // attribute is what has to be checked.
    render(<Select name="x" label="Variant" options={OPTS} />);
    const trigger = screen.getByRole('combobox');
    const labelledBy = trigger.getAttribute('aria-labelledby');

    expect(labelledBy).toBeTruthy();
    const labelEl = document.getElementById(labelledBy as string);
    expect(labelEl?.textContent).toContain('Variant');
    expect(screen.getByLabelText('Variant')).toBe(trigger);
  });

  it('removes a chip without opening the listbox', () => {
    const onChange = vi.fn();
    render(
      <Select
        name="tags"
        multiple
        value={['solid', 'ghost']}
        options={OPTS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Solid' }));

    expect(onChange.mock.calls[0][0]).toEqual(['ghost']);
    // The remove click must not bubble into the trigger's open toggle.
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('stays inert when disabled, without the native `disabled` attribute', () => {
    render(<Select name="x" disabled options={OPTS} />);
    const trigger = screen.getByRole('combobox');

    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.getAttribute('tabindex')).toBe('-1');

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders no remove buttons at all when disabled', () => {
    render(
      <Select
        name="tags"
        multiple
        disabled
        value={['solid']}
        options={OPTS}
        onChange={() => undefined}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Remove Solid' })).toBeNull();
  });
});
