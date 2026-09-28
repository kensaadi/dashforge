// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { DashForm } from '@dashforge/forms';
import { RbacProvider } from '@dashforge/rbac';
import { NO_ACCESS_POLICY, guestSubject } from '../../test-utils/rbacTestUtils';
import { CheckboxGroup } from './CheckboxGroup';

void React;
afterEach(() => cleanup());

const OPTS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
];

/**
 * `<CheckboxGroup>` — the third piece of README-BUG § BUG 19.
 *
 * `<Autocomplete multiple>` and `<Select multiple>` cover the long-list
 * cases; this is the small-set one. It is `<RadioGroup>` with array
 * storage, so these tests check the two things that differ (the array
 * contract and toggling) plus the family behaviours that must not have been
 * lost in the copy.
 */

const boxes = () => screen.getAllByRole('checkbox') as HTMLInputElement[];
const box = (label: string) =>
  screen.getByRole('checkbox', { name: label }) as HTMLInputElement;

describe('CheckboxGroup — the array contract', () => {
  it('reflects the stored array as checked state', () => {
    render(
      <DashForm defaultValues={{ perms: ['read', 'admin'] }}>
        <CheckboxGroup name="perms" label="Permissions" options={OPTS} />
      </DashForm>,
    );
    expect(box('Read').checked).toBe(true);
    expect(box('Write').checked).toBe(false);
    expect(box('Admin').checked).toBe(true);
  });

  it('stores an array, not a scalar, and accumulates', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: ['read'] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="Permissions" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.click(box('Write'));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ perms: ['read', 'write'] });
  });

  it('unchecking removes just that entry', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: ['read', 'write', 'admin'] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="Permissions" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.click(box('Write'));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ perms: ['read', 'admin'] });
  });

  it('keeps the declared option order, not the click order', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: [] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="Permissions" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    // Click out of order.
    fireEvent.click(box('Admin'));
    fireEvent.click(box('Read'));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    // A payload whose order drifts with the clicking is a nuisance to
    // snapshot and to diff.
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ perms: ['read', 'admin'] });
  });

  it('submits an empty array, never null or a string', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: ['read'] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="Permissions" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.click(box('Read'));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const out = onSubmit.mock.calls[0][0] as { perms: unknown };
    expect(Array.isArray(out.perms)).toBe(true);
    expect(out.perms).toEqual([]);
  });
});

describe('CheckboxGroup — validation', () => {
  it('blocks submit and shows the message when required', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: [] }} onSubmit={onSubmit}>
        <CheckboxGroup
          name="perms"
          label="Permissions"
          options={OPTS}
          rules={{ required: 'Pick at least one' }}
        />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByText('Pick at least one')).toBeTruthy());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('the validation message wins over an explicit helperText (BUG 17)', async () => {
    const { container } = render(
      <DashForm defaultValues={{ perms: [] }} onSubmit={vi.fn()}>
        <CheckboxGroup
          name="perms"
          label="Permissions"
          options={OPTS}
          helperText="Choose the roles this user needs"
          rules={{ required: 'Pick at least one' }}
        />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByText('Pick at least one')).toBeTruthy());
    expect(screen.queryByText('Choose the roles this user needs')).toBeNull();
  });
});

describe('CheckboxGroup — plain mode', () => {
  it('is controlled by value/onChange without a provider', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        name="perms"
        label="Permissions"
        options={OPTS}
        value={['read']}
        onChange={onChange}
      />,
    );
    expect(box('Read').checked).toBe(true);

    fireEvent.click(box('Admin'));
    expect(onChange).toHaveBeenCalledWith(['read', 'admin']);
  });
});

describe('CheckboxGroup — RBAC and visibility', () => {
  it('hides the whole group when access says hide', () => {
    const { container } = render(
      <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
        <CheckboxGroup
          name="perms"
          options={OPTS}
          access={{ resource: 'acl', action: 'read', onUnauthorized: 'hide' }}
        />
      </RbacProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('keeps a checked option visible even when its access says hide', () => {
    // Hiding a checked box would strand a value in the payload that the
    // user can neither see nor clear.
    render(
      <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
        <DashForm defaultValues={{ perms: ['admin'] }}>
          <CheckboxGroup
            name="perms"
            options={[
              { value: 'read', label: 'Read' },
              {
                value: 'admin',
                label: 'Admin',
                access: { resource: 'acl', action: 'grant', onUnauthorized: 'hide' },
              },
            ]}
          />
        </DashForm>
      </RbacProvider>,
    );
    const admin = box('Admin');
    expect(admin.checked).toBe(true);
    expect(admin.disabled).toBe(true);
  });

  it('renders null when visibleWhen is false', () => {
    const { container } = render(
      <DashForm defaultValues={{ perms: [] }}>
        <CheckboxGroup name="perms" options={OPTS} visibleWhen={() => false} />
      </DashForm>,
    );
    expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(0);
  });

  it('survives visibleWhen flipping while mounted (BUG 16 / BUG 33)', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function Harness() {
      const [show, setShow] = React.useState(true);
      return (
        <DashForm defaultValues={{ perms: [] }}>
          <CheckboxGroup name="perms" options={OPTS} visibleWhen={() => show} />
          <button type="button" data-testid="t" onClick={() => setShow((v) => !v)}>
            toggle
          </button>
        </DashForm>
      );
    }

    render(<Harness />);
    expect(boxes().length).toBe(3);
    fireEvent.click(screen.getByTestId('t'));
    expect(screen.queryAllByRole('checkbox').length).toBe(0);
    fireEvent.click(screen.getByTestId('t'));
    expect(boxes().length).toBe(3);

    const mismatch = errSpy.mock.calls.some((a) =>
      a.some(
        (x) =>
          typeof x === 'string' &&
          (x.includes('Rendered more hooks') || x.includes('Rendered fewer hooks')),
      ),
    );
    expect(mismatch).toBe(false);
    errSpy.mockRestore();
  });

  it('disables every option when the group is disabled', () => {
    render(
      <DashForm defaultValues={{ perms: [] }}>
        <CheckboxGroup name="perms" options={OPTS} disabled />
      </DashForm>,
    );
    expect(boxes().every((b) => b.disabled)).toBe(true);
  });
});

describe('CheckboxGroup — a value with no option must survive a toggle', () => {
  /**
   * Written to break the implementation, not to confirm it.
   *
   * `nextValues` rebuilds the array from `options` on the CHECK path, to
   * keep the declared order. Anything the form holds that is NOT in
   * `options` therefore has no seat in that rebuild and is dropped — while
   * the UNCHECK path, a plain filter, preserves it. Two paths, two
   * behaviours, and the user never touched the missing value.
   *
   * Real scenario: options load async, or reload for a different scope,
   * and the form already holds a value from the previous set.
   */
  it('keeps an unknown stored value when CHECKING another option', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <DashForm defaultValues={{ perms: ['ghost'] }} onSubmit={onSubmit}>
        <CheckboxGroup name="perms" label="P" options={OPTS} />
        <button type="submit">Submit</button>
      </DashForm>,
    );

    fireEvent.click(box('Read'));
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const out = onSubmit.mock.calls[0][0] as { perms: string[] };
    expect(
      out.perms,
      `checking 'read' must not drop 'ghost'; got ${JSON.stringify(out.perms)}`,
    ).toEqual(['ghost', 'read']);
  });

  it('keeps it when UNCHECKING too, which already worked', () => {
    // The asymmetry is the bug: assert both paths so it cannot come back
    // on one side only.
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        name="perms"
        options={OPTS}
        value={['ghost', 'read']}
        onChange={onChange}
      />,
    );
    fireEvent.click(box('Read'));
    expect(onChange).toHaveBeenCalledWith(['ghost']);
  });
});
