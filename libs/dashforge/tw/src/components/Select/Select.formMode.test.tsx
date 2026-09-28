// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { Select } from './Select';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'full', label: 'Full time' },
  { value: 'part', label: 'Part time' },
];

/**
 * Form-mode coverage for `<Select>`, written while closing BUG 23.
 *
 * BUG 23 turned the trigger from `<button>` into `<div role="combobox">`
 * and moved the `name` DOM attribute to `data-name`, because `name` is not
 * valid on a div. The question that raised — does that touch the `name`
 * PROP, the one that wires the field to react-hook-form? — had **no test
 * answering it**: every existing `Select` test was standalone, none went
 * through a provider.
 *
 * It does not, and these pin why. The prop feeds `bridge.register(name)`,
 * `bridge.getValue(name)`, `bridge.setValue(name, …)` and the synthetic
 * `target: { name, value }` passed to RHF's `onChange` / `onBlur`. The DOM
 * attribute was never part of that path: `registration` is never spread
 * onto the element, only its `onChange` and `onBlur` are called, and the
 * old trigger was `type="button"`, which never participates in native form
 * submission anyway.
 */

describe('<Select> in form mode — the `name` prop is the RHF key', () => {
  it('submits the chosen value under its `name`, with the trigger carrying none', async () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <DashForm defaultValues={{ workType: '' }} onSubmit={onSubmit}>
        <Select name="workType" label="Work type" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    // The DOM attribute is gone; the prop is not the DOM attribute.
    const trigger = screen.getByRole('combobox');
    expect(trigger.tagName).toBe('DIV');
    expect(trigger.hasAttribute('name')).toBe(false);
    expect(trigger.getAttribute('data-name')).toBe('workType');

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Part time' }));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ workType: 'part' });
  });

  it('reads its initial value from the form defaults, keyed by `name`', () => {
    render(
      <DashForm defaultValues={{ workType: 'full' }}>
        <Select name="workType" label="Work type" options={OPTS} />
      </DashForm>,
    );
    expect(screen.getByRole('combobox').textContent).toContain('Full time');
  });

  it('resolves its validation message by `name`', async () => {
    render(
      <DashForm defaultValues={{ workType: '' }} onSubmit={vi.fn()}>
        <Select
          name="workType"
          label="Work type"
          options={OPTS}
          rules={{ required: 'Work type is required' }}
        />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.submit(document.querySelector('form') as HTMLFormElement);

    // The message reaching the field proves the name-keyed error lookup
    // still lands on this instance.
    await waitFor(() =>
      expect(screen.getByText('Work type is required')).toBeTruthy(),
    );
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });

  it('blocks submission while invalid, then lets it through once picked', async () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <DashForm defaultValues={{ workType: '' }} onSubmit={onSubmit}>
        <Select
          name="workType"
          label="Work type"
          options={OPTS}
          rules={{ required: 'Work type is required' }}
        />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByText('Work type is required')).toBeTruthy(),
    );
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Full time' }));
    fireEvent.submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ workType: 'full' });
  });
});
