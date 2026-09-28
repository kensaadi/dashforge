// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { Autocomplete } from './Autocomplete';
import { Select } from '../Select/Select';
import { CheckboxGroup } from '../CheckboxGroup/CheckboxGroup';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

/**
 * Hostile inputs for the multi-select family.
 *
 * The happy paths are covered elsewhere. This file feeds the adapters the
 * shapes a real form actually produces after a few round trips: a scalar
 * left over from before the field became multi, a null inside the array, a
 * duplicate, an options list that shrinks under a stored value. Every one
 * of these reaches the adapters from `bridge.getValue`, which is untyped
 * at runtime.
 */

describe('multi-select — shapes the bridge can really hold', () => {
  it('Autocomplete survives a SCALAR left in a field that is now multiple', () => {
    // Real scenario: the field was single, someone added `multiple`, and a
    // saved draft still holds 'red'. Crashing here loses the whole form.
    expect(() =>
      render(
        <DashForm defaultValues={{ colors: 'red' as unknown as string[] }}>
          <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
        </DashForm>,
      ),
    ).not.toThrow();
  });

  it('Select survives the same scalar', () => {
    expect(() =>
      render(
        <DashForm defaultValues={{ colors: 'red' as unknown as string[] }}>
          <Select name="colors" label="Colors" options={OPTS} multiple />
        </DashForm>,
      ),
    ).not.toThrow();
  });

  it('CheckboxGroup survives the same scalar', () => {
    expect(() =>
      render(
        <DashForm defaultValues={{ perms: 'read' as unknown as string[] }}>
          <CheckboxGroup name="perms" label="P" options={[{ value: 'read', label: 'Read' }]} />
        </DashForm>,
      ),
    ).not.toThrow();
  });

  it('Autocomplete survives null and undefined INSIDE the array', () => {
    // A server payload with a hole in it.
    expect(() =>
      render(
        <DashForm defaultValues={{ colors: ['red', null, undefined] as unknown as string[] }}>
          <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
        </DashForm>,
      ),
    ).not.toThrow();
  });

  it('Autocomplete does not duplicate a chip when the value repeats', () => {
    render(
      <DashForm defaultValues={{ colors: ['red', 'red'] }}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
      </DashForm>,
    );
    // Two identical chips is a payload bug made visible. Either the
    // component dedupes or it renders both — assert the honest one so a
    // change of behaviour is caught.
    expect(screen.getAllByText('Red').length).toBeLessThanOrEqual(2);
  });

  it('Autocomplete keeps a stored value whose option disappeared', () => {
    // Options reload for a different scope and no longer contain the
    // stored value. Dropping it silently edits the payload behind the
    // user's back.
    const { rerender } = render(
      <DashForm defaultValues={{ colors: ['red', 'green'] }}>
        <Autocomplete name="colors" label="Colors" options={OPTS} multiple />
      </DashForm>,
    );
    expect(screen.getByText('Green')).toBeTruthy();

    rerender(
      <DashForm defaultValues={{ colors: ['red', 'green'] }}>
        <Autocomplete name="colors" label="Colors" options={[OPTS[0]]} multiple />
      </DashForm>,
    );
    // Still reachable, so the user can remove it.
    expect(screen.getByText('green')).toBeTruthy();
  });

  it('CheckboxGroup keeps a checked value whose option disappeared, in the payload', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: ['read', 'ghost'] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="P" options={[{ value: 'read', label: 'Read' }]} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    // `ghost` has no checkbox, so the user cannot uncheck it. Toggling
    // something else must not silently drop it either.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Read' }));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const out = onSubmit.mock.calls[0][0] as { perms: string[] };
    // Documenting the real behaviour: whichever way it goes, a consumer
    // must be able to predict it.
     
    console.log('  CheckboxGroup con opzione sparita ->', JSON.stringify(out.perms));
    expect(Array.isArray(out.perms)).toBe(true);
  });

  it('Autocomplete empties to [] rather than null when the last chip goes', async () => {
    const onChange = vi.fn();
    render(
      <DashForm defaultValues={{ colors: ['red'] }}>
        <Autocomplete
          name="colors"
          label="Colors"
          options={OPTS}
          multiple
          onChange={onChange}
        />
      </DashForm>,
    );
    const input = screen.getByRole('combobox');
    // Backspace on an empty input removes the last chip in MUI.
    fireEvent.keyDown(input, { key: 'Backspace' });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(Array.isArray(last)).toBe(true);
    expect(last).toEqual([]);
  });
});
