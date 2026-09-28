import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

/**
 * The option rows are rendered through MUI's `renderOption`, so their ARIA
 * attributes arrive from the spread rather than from our own JSX. Two
 * jsx-a11y rules flag them for that reason, and neither can read a spread:
 * they cannot tell whether `role`, `aria-selected` and `aria-disabled` are
 * really there. These cases answer that question against the DOM, so the
 * suppression on those two lines rests on something checked rather than on
 * an assumption about MUI's internals.
 */
describe('<Autocomplete> option row ARIA', () => {
  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada', disabled: true },
  ];

  const open = async () => {
    const user = userEvent.setup();
    render(
      <Autocomplete
        name="country"
        label="Country"
        options={options}
        getOptionDisabled={(o: (typeof options)[number]) => Boolean(o.disabled)}
      />
    );
    await user.click(screen.getByLabelText('Country'));
    return screen.getAllByRole('option');
  };

  it('gives every row the option role', async () => {
    const rows = await open();

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.tagName).toBe('LI');
      expect(row).toHaveAttribute('role', 'option');
    }
  });

  it('exposes selected state on every row, which the role requires', async () => {
    const rows = await open();

    // `role="option"` without `aria-selected` leaves a screen reader unable
    // to say which entry is chosen. This is the attribute
    // jsx-a11y/role-has-required-aria-props asks for and cannot see.
    for (const row of rows) {
      expect(row).toHaveAttribute('aria-selected');
      expect(['true', 'false']).toContain(row.getAttribute('aria-selected'));
    }
  });

  it('marks the selected row and only that one', async () => {
    const user = userEvent.setup();
    render(
      <Autocomplete
        name="country"
        label="Country"
        options={options}
        value="us"
      />
    );
    await user.click(screen.getByLabelText('Country'));

    const rows = screen.getAllByRole('option');
    const selected = rows.filter(
      (r) => r.getAttribute('aria-selected') === 'true'
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain('United States');
  });

  it('announces a disabled row as disabled', async () => {
    const rows = await open();
    const canada = rows.find((r) => r.textContent?.includes('Canada'));

    expect(canada).toHaveAttribute('aria-disabled', 'true');
  });
});
