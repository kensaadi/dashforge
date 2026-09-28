// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { Select } from './Select';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

/**
 * BUG 19 — `<Select multiple>`, the runtime half.
 *
 * `<Select>` composes from `<TextField select>`, so its value goes through
 * `createSelectIntegration`. That helper sanitized any value not present in
 * `availableValues` down to `''`, and an ARRAY is never a member of that
 * list — so a multi select in bridge mode resolved to `''` and MUI threw
 * outright:
 *
 *   MUI: The `value` prop must be an array when using the `Select`
 *        component with `multiple`.
 *
 * The integration is now multi-aware. Unresolved entries are dropped rather
 * than kept, matching the scalar path and differing on purpose from
 * `<Autocomplete multiple>` — see the note in `sanitizeSelectDisplayValue`.
 */

async function openAndPick(label: string) {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const opt = await screen.findByRole('option', { name: label });
  fireEvent.click(opt);
}

describe('BUG 19 — <Select multiple> runtime', () => {
  it('renders without throwing, with an array from the bridge', () => {
    // The regression that shipped: this used to be a hard MUI error.
    expect(() =>
      render(
        <DashForm defaultValues={{ colors: ['red'] }}>
          <Select name="colors" label="Colors" options={OPTS} multiple />
        </DashForm>,
      ),
    ).not.toThrow();
  });

  it('shows the stored selection', () => {
    render(
      <DashForm defaultValues={{ colors: ['red', 'blue'] }}>
        <Select name="colors" label="Colors" options={OPTS} multiple />
      </DashForm>,
    );
    const combo = screen.getByRole('combobox');
    expect(combo.textContent).toContain('Red');
    expect(combo.textContent).toContain('Blue');
    expect(combo.textContent).not.toContain('Green');
  });

  it('writes an array back to the form', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ colors: [] }} onSubmit={onSubmit}>
        <Select name="colors" label="Colors" options={OPTS} multiple />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await openAndPick('Green');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ colors: ['green'] });
  });

  it('accumulates instead of replacing', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ colors: ['red'] }} onSubmit={onSubmit}>
        <Select name="colors" label="Colors" options={OPTS} multiple />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await openAndPick('Blue');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const out = onSubmit.mock.calls[0][0] as { colors: string[] };
    expect([...out.colors].sort()).toEqual(['blue', 'red']);
  });

  it('drops a stored value that matches no option, without throwing', () => {
    // MUI logs an out-of-range warning for an unknown value, so the multi
    // path filters rather than passing it through. Documented divergence
    // from Autocomplete, which keeps it.
    expect(() =>
      render(
        <DashForm defaultValues={{ colors: ['red', 'ultraviolet'] }}>
          <Select name="colors" label="Colors" options={OPTS} multiple />
        </DashForm>,
      ),
    ).not.toThrow();
    expect(screen.getByRole('combobox').textContent).toContain('Red');
  });
});

describe('BUG 19 — <Select> scalar mode is untouched', () => {
  it('still stores a scalar', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ color: '' }} onSubmit={onSubmit}>
        <Select name="color" label="Color" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await openAndPick('Green');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ color: 'green' });
  });

  it('still sanitizes an unresolved scalar to empty', () => {
    render(
      <DashForm defaultValues={{ color: 'ultraviolet' }}>
        <Select name="color" label="Color" options={OPTS} />
      </DashForm>,
    );
    // MUI renders a zero-width space as the empty placeholder, so assert
    // the absence of any option label rather than an empty string.
    const text = screen.getByRole('combobox').textContent ?? '';
    expect(text.replace(/\u200b/g, '')).toBe('');
    expect(text).not.toContain('ultraviolet');
  });
});
