// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { Select } from '../Select/Select';
import { Chip } from '../Chip/Chip';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

/**
 * BUG 23 and BUG 35 both replaced a native `<button>` with a
 * `<div role="button">`. A native `type="button"` is inert for form
 * submission by construction; a div is inert because nothing wired it up.
 * The difference matters the moment either one grows a keydown handler,
 * which both did.
 *
 * Written to find the accident: an Enter that reaches the form, a Space
 * that scrolls the page, a keyboard path that stops working once the
 * widget is inside a `<form>`. None of this is covered by the per-component
 * suites, which render the widgets bare.
 */

describe('div-based widgets inside a <form>', () => {
  it('Enter on the Select trigger opens the listbox and does NOT submit', () => {
    const onSubmit = vi.fn();
    render(
      <DashForm defaultValues={{ pick: '' }} onSubmit={onSubmit}>
        <Select name="pick" label="Pick" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Space on the Select trigger is consumed, not left to scroll the page', () => {
    render(
      <DashForm defaultValues={{ pick: '' }}>
        <Select name="pick" label="Pick" options={OPTS} />
      </DashForm>,
    );
    const trigger = screen.getByRole('combobox');
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    trigger.dispatchEvent(ev);
    // An unconsumed Space on a focusable div scrolls the document.
    expect(ev.defaultPrevented).toBe(true);
  });

  it('Enter on a clickable Chip fires onClick and does NOT submit', () => {
    const onSubmit = vi.fn();
    const onClick = vi.fn();
    render(
      <DashForm defaultValues={{ x: '' }} onSubmit={onSubmit}>
        <Chip label="tag" onClick={onClick} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.keyDown(screen.getByRole('button', { name: /tag/ }), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Space on a clickable Chip is consumed', () => {
    const onClick = vi.fn();
    render(<Chip label="tag" onClick={onClick} />);
    const chip = screen.getByRole('button', { name: /tag/ });
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    chip.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('Backspace on a Chip does not delete when there is no onDelete', () => {
    // The delete keys were added for the multi case. On a chip with no
    // delete handler they must be inert, not swallow the key from whatever
    // else might want it.
    const onClick = vi.fn();
    render(<Chip label="tag" onClick={onClick} />);
    const chip = screen.getByRole('button', { name: /tag/ });
    const ev = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
    chip.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a disabled Select trigger is out of the tab order AND inert to keys', () => {
    render(
      <DashForm defaultValues={{ pick: '' }}>
        <Select name="pick" label="Pick" options={OPTS} disabled />
      </DashForm>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('the Chip onClick receives an event it can actually preventDefault on', () => {
    // The keydown path hands the consumer's `onClick` a KeyboardEvent cast
    // as a MouseEvent. If a handler calls a method the cast promised but
    // the object lacks, it throws inside the consumer's code.
    let threw: unknown = null;
    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        void e.currentTarget;
      } catch (err) {
        threw = err;
      }
    };
    render(<Chip label="tag" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /tag/ }), { key: 'Enter' });
    expect(threw).toBeNull();
  });
});
