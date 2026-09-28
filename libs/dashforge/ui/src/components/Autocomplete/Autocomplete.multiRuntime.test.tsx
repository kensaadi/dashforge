// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { Autocomplete } from './Autocomplete';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

/**
 * BUG 19 — the runtime half.
 *
 * The type-level widening landed 2026-09-15 so `<Autocomplete multiple>`
 * would compile, but the value pipeline stayed scalar: an array coming out
 * of the bridge was narrowed to `null`, so MUI's multi mode rendered with
 * no chips and `onChange` handed back an array the scalar mapper could not
 * read. These tests pin the storage contract in both directions.
 *
 * Multi runs as a PARALLEL pipeline rather than a widened scalar one. The
 * scalar path owns freeSolo, display sanitization and controlled
 * `inputValue`, none of which applies while MUI renders chips and owns the
 * filter text, and all of which is where BUG 2, BUG 7 and BUG 8 came from.
 */

/** Open the listbox and pick an option by its label. */
async function pick(label: string) {
  const input = screen.getByRole('combobox');
  fireEvent.mouseDown(input);
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  const opt = await screen.findByRole('option', { name: label });
  fireEvent.click(opt);
}

describe('BUG 19 — <Autocomplete multiple> runtime, bridge mode', () => {
  it('renders a chip per stored value', () => {
    render(
      <DashForm defaultValues={{ colors: ['red', 'blue'] }}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
      </DashForm>,
    );
    // Labels, not raw values: the array is mapped through the options.
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.queryByText('Green')).toBeNull();
  });

  it('still renders a value that matches no option, so it can be removed', () => {
    // A stored value with no matching option must not vanish from the UI
    // while staying in the payload — that makes it impossible to clear.
    render(
      <DashForm defaultValues={{ colors: ['red', 'ultraviolet'] }}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
      </DashForm>,
    );
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('ultraviolet')).toBeTruthy();
  });

  it('writes an array back to the form, not a scalar', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ colors: [] }} onSubmit={onSubmit}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await pick('Green');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ colors: ['green'] });
  });

  it('accumulates across picks instead of replacing', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ colors: ['red'] }} onSubmit={onSubmit}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await pick('Blue');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0][0] as { colors: string[] };
    expect([...submitted.colors].sort()).toEqual(['blue', 'red']);
  });

  it('calls the consumer onChange with the array too', async () => {
    const onChange = vi.fn();
    render(
      <DashForm defaultValues={{ colors: [] }}>
        <Autocomplete
          name="colors"
          label="Colors"
          options={OPTS}
          multiple
          onChange={onChange}
        />
      </DashForm>,
    );

    await pick('Red');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][0]).toEqual(['red']);
  });
});

describe('BUG 19 — the scalar path is untouched', () => {
  it('single mode still stores a scalar', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ color: '' }} onSubmit={onSubmit}>
        <Autocomplete name="color" label="Color" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    await pick('Green');
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ color: 'green' });
  });

  it('single mode renders no chips', () => {
    const { container } = render(
      <DashForm defaultValues={{ color: 'red' }}>
        <Autocomplete name="color" label="Color" options={OPTS} />
      </DashForm>,
    );
    expect(container.querySelectorAll('.MuiChip-root').length).toBe(0);
  });
});

describe('BUG 19 — plain mode (no provider)', () => {
  it('maps an array value to chips and reports an array back', async () => {
    const onChange = vi.fn();
    render(
      <Autocomplete
        name="colors"
        label="Colors"
        options={OPTS}
        multiple
        value={['red']}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Red')).toBeTruthy();

    await pick('Blue');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect([...(onChange.mock.calls[0][0] as string[])].sort()).toEqual([
      'blue',
      'red',
    ]);
  });
});
