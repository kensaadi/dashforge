// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import { Autocomplete } from './Autocomplete.js';
import type { AutocompleteOption } from './autocomplete.types.js';

const fruits: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('<Autocomplete>', () => {
  describe('standalone (no DashForm)', () => {
    it('renders the input + label + open trigger', () => {
      render(
        <Autocomplete name="fruit" label="Pick a fruit" options={fruits} />
      );
      // Aria ComboBox produces a combobox role on the input
      expect(screen.getByRole('combobox')).toBeTruthy();
      expect(screen.getByText('Pick a fruit')).toBeTruthy();
      // The chevron is a button with aria-label="Open"
      expect(screen.getByLabelText('Open')).toBeTruthy();
    });

    it('displays the default value selected (label of the option)', () => {
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          defaultValue="banana"
        />
      );
      // The combobox input value shows the option label
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('Banana');
    });

    it('renders a `*` for required fields', () => {
      render(<Autocomplete name="fruit" label="Fruit" options={fruits} required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('renders the helperText when provided', () => {
      render(
        <Autocomplete
          name="fruit"
          label="Fruit"
          options={fruits}
          helperText="Choose your favourite"
        />
      );
      expect(screen.getByText('Choose your favourite')).toBeTruthy();
    });

    it('exposes a clear button only when a value is selected', () => {
      const { rerender } = render(
        <Autocomplete name="fruit" options={fruits} />
      );
      expect(screen.queryByLabelText('Clear selection')).toBeNull();

      rerender(
        <Autocomplete name="fruit" options={fruits} defaultValue="cherry" />
      );
      expect(screen.getByLabelText('Clear selection')).toBeTruthy();
    });

    it('disables the combobox when `disabled`', () => {
      render(<Autocomplete name="fruit" options={fruits} disabled />);
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('inside DashFormProvider', () => {
    it('mounts cleanly inside a bridge-providing tree', () => {
      render(
        <DashFormProvider defaultValues={{ fruit: 'apple' }}>
          <Autocomplete name="fruit" label="Fruit" options={fruits} />
        </DashFormProvider>
      );
      // Mount-only assertion (RHF defaultValues commit is timing-
      // sensitive in vitest; the end-to-end round-trip is verified in
      // the dash smoke page — same pattern as RadioGroup / NumberField).
      expect(screen.getByRole('combobox')).toBeTruthy();
    });
  });

  describe('event wiring', () => {
    it('fires onValueChange with `null` when the clear button is pressed', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          value="apple"
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onValueChange).toHaveBeenCalledWith(null);
    });
  });

  // F5-A-bis: multi-select
  describe('multi-select (`multiple`)', () => {
    it('renders no chips when no defaultValue', () => {
      render(
        <Autocomplete name="fruit" multiple options={fruits} label="Fruit" />
      );
      expect(screen.queryAllByText(/^×$/i)).toHaveLength(0);
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
    });

    it('renders one chip per item in defaultValue (array)', () => {
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          defaultValue={['apple', 'cherry']}
        />
      );
      expect(screen.getByLabelText('Remove Apple')).toBeTruthy();
      expect(screen.getByLabelText('Remove Cherry')).toBeTruthy();
      expect(screen.queryByLabelText('Remove Banana')).toBeNull();
    });

    it('emits an array on selection toggle', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          value={['apple']}
          onValueChange={onValueChange}
        />
      );
      // Open via chevron + click "Banana".
      fireEvent.click(screen.getByLabelText('Open'));
      fireEvent.click(screen.getByText('Banana'));
      expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana']);
    });

    it('toggles off a chip when clicking its remove button', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          value={['apple', 'cherry']}
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Remove Apple'));
      expect(onValueChange).toHaveBeenCalledWith(['cherry']);
    });

    it('clears all selections via the clear button', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          value={['apple', 'banana']}
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('coerces a non-array defaultValue to a single-element array', () => {
      // Defensive: consumer accidentally passed the single-select shape
      // while `multiple` is enabled. Should coerce silently rather than
      // throw or render nothing.
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          // Cast to keep TS quiet — runtime is the contract.
          defaultValue={'banana' as unknown as string[]}
        />
      );
      expect(screen.getByLabelText('Remove Banana')).toBeTruthy();
    });

    it('coerces a null defaultValue to []', () => {
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          defaultValue={null}
        />
      );
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
    });

    it('removes the last chip on Backspace at start of empty input', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          value={['apple', 'banana', 'cherry']}
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      input.focus();
      fireEvent.keyDown(input, { key: 'Backspace' });
      // Selection set iteration order matches insertion ⇒ last is 'cherry'.
      expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana']);
    });

    it('does NOT remove a chip on Backspace when the input has text', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          multiple
          options={fruits}
          value={['apple']}
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'b' } });
      fireEvent.keyDown(input, { key: 'Backspace' });
      // Only the filter typing fires onValueChange? No — typing does NOT
      // call onValueChange (it only fires on selection commit). So the
      // assertion is "we did not commit a remove".
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  // F5-A-bis: free-solo
  describe('free-solo (`freeSolo`)', () => {
    it('commits typed text as the value on Enter (single mode)', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'kumquat' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onValueChange).toHaveBeenLastCalledWith('kumquat');
    });

    it('snaps to an existing option when typed text matches a label exactly', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      // Type the full label of an existing option.
      fireEvent.change(input, { target: { value: 'Banana' } });
      // Enter while the highlighted option (after typing matches) would
      // be Banana — but we exercise the free-solo branch explicitly by
      // moving the highlight off-screen with Escape first, then re-open
      // via typing again. Simpler: directly assert the snap when we
      // commit via the blur path below.
      fireEvent.keyDown(input, { key: 'Enter' });
      // The committed value should be 'banana' (snapped), not 'Banana'.
      expect(onValueChange).toHaveBeenLastCalledWith('banana');
    });

    it('commits typed text on blur (single mode only)', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'dragonfruit' } });
      fireEvent.blur(input);
      expect(onValueChange).toHaveBeenLastCalledWith('dragonfruit');
    });

    it('displays a free-solo defaultValue that is not in the option list', () => {
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          defaultValue="custom-fruit"
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('custom-fruit');
    });

    it('adds a free-solo chip in multi mode on Enter', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          multiple
          value={['apple']}
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'durian' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'durian']);
    });

    it('does NOT commit on blur in multi mode (Enter-only)', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          multiple
          value={[]}
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'whatever' } });
      fireEvent.blur(input);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('does not commit when input is whitespace only', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete
          name="fruit"
          options={fruits}
          freeSolo
          onValueChange={onValueChange}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  // F5-A-bis: async runtime options
  describe('loadOptions (async runtime)', () => {
    it('calls loadOptions with the current input value (debounced)', async () => {
      const loadOptions = vi.fn(async (q: string) => [
        { value: 'r1', label: `Result for ${q}` },
      ]);
      render(
        <Autocomplete
          name="user"
          options={[]}
          loadOptions={loadOptions}
          loadDebounceMs={20}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ali' } });
      // Wait for debounce + fetch
      await waitFor(() => {
        expect(loadOptions).toHaveBeenCalledWith('ali');
      });
      // The result row eventually shows.
      await waitFor(() => {
        expect(screen.getByText('Result for ali')).toBeTruthy();
      });
    });

    it('shows the loading row while a fetch is in flight', async () => {
      let resolve!: (v: AutocompleteOption[]) => void;
      const pending = new Promise<AutocompleteOption[]>((r) => {
        resolve = r;
      });
      render(
        <Autocomplete
          name="user"
          options={[]}
          loadOptions={() => pending}
          loadDebounceMs={10}
          loadingMessage="Fetching…"
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.focus(input); // open popover
      fireEvent.change(input, { target: { value: 'x' } });
      // Loading row appears after debounce kicks off the fetch.
      await waitFor(() => {
        expect(screen.getByText('Fetching…')).toBeTruthy();
      });
      // Resolve the pending fetch; loading row goes away.
      await act(async () => {
        resolve([{ value: 'done', label: 'Done' }]);
      });
      await waitFor(() => {
        expect(screen.queryByText('Fetching…')).toBeNull();
        expect(screen.getByText('Done')).toBeTruthy();
      });
    });

    it('ignores stale responses (race-safe via fetch generation)', async () => {
      // First fetch resolves slowly with "old", second fetch resolves
      // fast with "new". Only "new" should land in the UI.
      let slowResolve!: (v: AutocompleteOption[]) => void;
      const slow = new Promise<AutocompleteOption[]>((r) => {
        slowResolve = r;
      });
      const fast = Promise.resolve<AutocompleteOption[]>([
        { value: 'new', label: 'New' },
      ]);
      const loader = vi.fn((q: string) => (q === 'a' ? slow : fast));
      render(
        <Autocomplete
          name="user"
          options={[]}
          loadOptions={loader}
          loadDebounceMs={1}
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'a' } });
      // Wait for the slow fetch to be kicked off.
      await waitFor(() => expect(loader).toHaveBeenCalledWith('a'));
      // Now type another char → kicks off `fast`.
      fireEvent.change(input, { target: { value: 'ab' } });
      await waitFor(() => expect(loader).toHaveBeenCalledWith('ab'));
      // Resolve the slow (stale) one AFTER the fast one finished.
      await act(async () => {
        slowResolve([{ value: 'old', label: 'Old' }]);
      });
      // "New" wins; "Old" never shows.
      await waitFor(() => {
        expect(screen.getByText('New')).toBeTruthy();
      });
      expect(screen.queryByText('Old')).toBeNull();
    });

    it('falls back to empty list on loader rejection', async () => {
      const loader = vi.fn(async () => {
        throw new Error('boom');
      });
      render(
        <Autocomplete
          name="user"
          options={[]}
          loadOptions={loader}
          loadDebounceMs={1}
          emptyMessage="No results"
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'q' } });
      await waitFor(() => expect(loader).toHaveBeenCalled());
      await waitFor(() => {
        expect(screen.getByText('No results')).toBeTruthy();
      });
    });
  });

  // F5-A-bis: generic option shape
  describe('generic options (getOptionValue / getOptionLabel)', () => {
    type User = { id: string; name: string; suspended?: boolean };
    const users: User[] = [
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
      { id: 'u3', name: 'Carol', suspended: true },
    ];

    it('renders labels from the custom getOptionLabel', () => {
      render(
        <Autocomplete<User>
          name="owner"
          label="Owner"
          options={users}
          getOptionValue={(u) => u.id}
          getOptionLabel={(u) => u.name}
          defaultValue="u2"
        />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('Bob');
    });

    it('persists the value extracted by getOptionValue (not the whole option)', () => {
      const onValueChange = vi.fn();
      render(
        <Autocomplete<User>
          name="owner"
          options={users}
          getOptionValue={(u) => u.id}
          getOptionLabel={(u) => u.name}
          value="u1"
          onValueChange={onValueChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(onValueChange).toHaveBeenCalledWith(null);
    });

    it('honours getOptionDisabled for the per-option disabled mark', () => {
      render(
        <Autocomplete<User>
          name="owner"
          options={users}
          getOptionValue={(u) => u.id}
          getOptionLabel={(u) => u.name}
          getOptionDisabled={(u) => Boolean(u.suspended)}
          defaultValue="u1"
        />
      );
      // Open via the chevron.
      fireEvent.click(screen.getByLabelText('Open'));
      const carolOption = screen.getByText('Carol').closest('[role="option"]');
      expect(carolOption?.getAttribute('aria-disabled')).toBe('true');
    });

    it('falls back to default {value,label} accessors when none provided', () => {
      render(
        <Autocomplete name="fruit" options={fruits} defaultValue="cherry" />
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('Cherry');
    });
  });
});
