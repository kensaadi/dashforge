// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Autocomplete } from './Autocomplete';
import type { AutocompleteProps } from './Autocomplete';

void React;
afterEach(() => cleanup());

/**
 * Regression / feature guard for BUG 19 in libs/dashforge/README-BUG.md.
 *
 * Before the fix, `<Autocomplete multiple>` did not compile: the internal
 * `MuiAutocompleteProps` type pinned the `Multiple` generic to `false`, and
 * the passthrough `Omit` did not name `multiple`, so consumers hit
 * `Type 'true' is not assignable to type 'false'`.
 *
 * After the type-level widening, `Multiple` is `boolean` and
 * `<Autocomplete multiple>` compiles. The `value` / `onChange` public
 * signature accepts `TValue | TValue[] | null` so multi consumers can pass
 * an array.
 *
 * **Scope:** this file pins the TYPE-LEVEL surface for BUG 19. Full runtime
 * multi-select in the value / onChange / bridge pipeline is tracked as a
 * follow-up feature (needs a NormalizedOption<TValue>[] converter on the
 * value-in path and an array-shaped setter on the way out). Until then,
 * consumers who need runtime multi still use the workaround documented in
 * README-BUG.md § BUG 19 (`inventory-kit/…/MultiSelectField.tsx`).
 */
describe('BUG 19 — <Autocomplete multiple> type-level compiles', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
  ];

  it('accepts `multiple: true` in the props type without a TS error', () => {
    // This test guards the TYPE contract. Assignability is the whole point:
    // before the widening it would fail with `Type 'true' is not assignable
    // to type 'false'`. The compiler runs on this file, so the test passing
    // is proof enough.
    const scalarProps: AutocompleteProps<string> = {
      name: 'one',
      options,
      value: 'a',
      onChange: (v) => void v,
    };
    const multiProps: AutocompleteProps<string> = {
      name: 'many',
      options,
      multiple: true,
      value: ['a', 'b'],
      onChange: (v) => void v,
    };
    expect(scalarProps.name).toBe('one');
    expect(multiProps.name).toBe('many');
    expect(Array.isArray(multiProps.value)).toBe(true);
  });

  it('scalar mode (default, no `multiple`) still renders', () => {
    const { container } = render(
      <Autocomplete
        name="one"
        options={options}
        value="a"
        onChange={() => undefined}
      />,
    );
    const combobox = container.querySelector('input[role="combobox"]');
    expect(combobox).toBeTruthy();
    // No chips in scalar mode.
    expect(container.querySelectorAll('.MuiChip-root').length).toBe(0);
  });
});
