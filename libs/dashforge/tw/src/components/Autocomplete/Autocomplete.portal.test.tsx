// @vitest-environment jsdom
/**
 * The listbox is portaled, and it is still OURS.
 *
 * Regression cover for BUG 7 and BUG 8 (see
 * `libs/dashforge/README-BUG.md`), which are one mistake made twice:
 * portaling the listbox to `document.body` moved it out of the
 * component's DOM subtree, and two separate pieces of code kept asking
 * "is this inside my root?" to mean "is this mine?".
 *
 *   BUG 8 — the click-outside handler closed the popover and reset the
 *   input on a mousedown over an option, before that option's own
 *   `onClick` could run. Mouse selection was impossible; the keyboard
 *   path raises no mousedown and kept working, which is what hid it.
 *
 *   BUG 7 — Radix's `DismissableLayer` dismissed on the focus the
 *   combobox input itself receives, because the input is the ANCHOR and
 *   therefore outside `Popover.Content`.
 *
 * WHAT THESE TESTS CAN AND CANNOT REACH. The click-outside handler is
 * plain DOM, so BUG 8 is reproduced here exactly. Radix's focus
 * dismissal does NOT run under jsdom — an earlier attempt to cover BUG 7
 * behaviourally passed with the fix, without it, and with a deliberately
 * broken version of it, so it was deleted rather than kept as decoration.
 * What both share is the predicate, and that is unit-tested below: if
 * somebody narrows `isWithinCombobox` back to the root alone, the first
 * test fails whether or not a browser is involved.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Autocomplete, isWithinCombobox } from './Autocomplete.js';
import type { AutocompleteOption } from './autocomplete.types.js';

const fruits: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
];

describe('isWithinCombobox', () => {
  it('counts the portaled listbox as ours, not just the root', () => {
    const root = document.createElement('div');
    const input = document.createElement('input');
    root.appendChild(input);

    // Portaled: a sibling of the root, not a descendant. This is the
    // shape that broke both handlers.
    const listbox = document.createElement('ul');
    const option = document.createElement('li');
    listbox.appendChild(option);

    const elsewhere = document.createElement('button');

    expect(isWithinCombobox(input, root, listbox)).toBe(true);
    // The one that regressed twice.
    expect(isWithinCombobox(option, root, listbox)).toBe(true);
    expect(isWithinCombobox(elsewhere, root, listbox)).toBe(false);
    expect(isWithinCombobox(null, root, listbox)).toBe(false);
  });

  it('survives a missing listbox — the popover may be closed', () => {
    const root = document.createElement('div');
    const input = document.createElement('input');
    root.appendChild(input);

    expect(isWithinCombobox(input, root, null)).toBe(true);
    expect(isWithinCombobox(document.createElement('div'), root, null)).toBe(false);
  });
});

describe('<Autocomplete> — picking with the mouse', () => {
  it('does not close or reset on a mousedown over an option', async () => {
    render(<Autocomplete name="fruit" label="Fruit" options={fruits} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'ap' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    // The listbox really is outside the component's subtree — the whole
    // premise of the bug. If this ever stops being true the guard is
    // still correct, but the regression it covers is gone.
    const listbox = screen.getByRole('listbox');
    expect(input.closest('div')?.contains(listbox)).toBe(false);

    // A real mouse fires mousedown BEFORE click. This is the event that
    // used to close the popover and wipe the field.
    fireEvent.mouseDown(screen.getByText('Apricot'));

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.value).toBe('ap');
  });

  it('commits the option on the full mouse sequence', async () => {
    render(<Autocomplete name="fruit" label="Fruit" options={fruits} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'ap' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    const option = screen.getByText('Apricot');
    fireEvent.mouseDown(option);
    fireEvent.click(option);

    // The value is what the reporter could not get: "if you search for
    // the article it does not select it at all".
    // Generous, because the whole suite runs in parallel and the
    // default 1s window has been seen to lapse under load. The
    // assertion is about the value arriving, not about how fast.
    await waitFor(() => expect(input.value).toBe('Apricot'), { timeout: 5000 });

    // The popover CLOSING after a pick is deliberately not asserted
    // here. `handleOptionClick` closes it and then refocuses the input,
    // and under jsdom that focus re-opens it — in a browser the input
    // never lost focus (`preventBlur` on mousedown), so no focus event
    // fires and it stays shut. Asserting it here would pin jsdom's
    // behaviour rather than the component's.
  });

  it('STILL dismisses on a mousedown genuinely outside', async () => {
    render(
      <div>
        <Autocomplete name="fruit" label="Fruit" options={fruits} />
        <button type="button">elsewhere</button>
      </div>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'ap' } });
    await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('true'));

    // The guard must not turn "dismiss on outside" into "never
    // dismiss" — that would trade a broken field for a popover nobody
    // can close.
    fireEvent.mouseDown(screen.getByText('elsewhere'));

    await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('false'), { timeout: 5000 });
  });
});
