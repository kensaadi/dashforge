import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Resolver } from 'react-hook-form';
import { DashForm } from './DashForm';

/**
 * REGRESSION TEST — `resolver` prop passthrough (fixed in 0.2.1-beta)
 *
 * Background. `DashForm` destructures its config props
 * (`engine` / `defaultValues` / `debug` / `mode` / `reactions`) and forwards
 * the rest (`...formProps`) onto the underlying `<form>` element. Before the
 * fix, `resolver` was NOT in the destructured list, so it fell through into
 * `...formProps` and was spread onto the raw `<form>` DOM node — React
 * rejected it with *"Invalid value for prop `resolver` on `form` tag"* and,
 * worse, the resolver never reached React Hook Form. Schema-based
 * validation via `<DashForm resolver={...}>` (the documented primary
 * pattern) silently did nothing.
 *
 * The fix adds `resolver` to the destructured props and forwards it to
 * `DashFormProvider`. These tests lock that in:
 *   1. the rendered `<form>` carries NO `resolver` attribute, and
 *   2. submitting the form actually invokes the resolver (proof it reached
 *      RHF).
 */

interface TestFormValues {
  email: string;
}

describe('DashForm — resolver prop passthrough (regression)', () => {
  it('does NOT leak the `resolver` prop onto the <form> DOM element', () => {
    const resolver: Resolver<TestFormValues> = vi.fn(async (values) => ({
      values,
      errors: {},
    }));

    const { container } = render(
      <DashForm<TestFormValues>
        resolver={resolver}
        defaultValues={{ email: '' }}
      >
        <button type="submit">Submit</button>
      </DashForm>
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    // The bug spread `resolver` onto the <form> as an invalid DOM attribute.
    expect(form!.getAttribute('resolver')).toBeNull();
  });

  it('forwards the resolver to RHF — submitting the form invokes it', async () => {
    const resolver: Resolver<TestFormValues> = vi.fn(async (values) => ({
      values,
      errors: {},
    }));

    const { container } = render(
      <DashForm<TestFormValues>
        resolver={resolver}
        defaultValues={{ email: '' }}
      >
        <button type="submit">Submit</button>
      </DashForm>
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    // If the resolver reached RHF, RHF calls it during the submit
    // validation pass. Before the fix it was stranded on the <form> node
    // and never invoked.
    await waitFor(() => {
      expect(resolver).toHaveBeenCalled();
    });
  });

  it('resolver errors block the onSubmit handler', async () => {
    // A resolver that always rejects `email`.
    const resolver: Resolver<TestFormValues> = vi.fn(async () => ({
      values: {},
      errors: {
        email: { type: 'required', message: 'Email is required' },
      },
    }));
    const onSubmit = vi.fn();

    const { container } = render(
      <DashForm<TestFormValues>
        resolver={resolver}
        defaultValues={{ email: '' }}
        onSubmit={onSubmit}
      >
        <button type="submit">Submit</button>
      </DashForm>
    );

    fireEvent.submit(container.querySelector('form')!);

    // Resolver runs...
    await waitFor(() => expect(resolver).toHaveBeenCalled());
    // ...and because it returned an error, onSubmit must NOT fire.
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders children inside the form', () => {
    const resolver: Resolver<TestFormValues> = vi.fn(async (values) => ({
      values,
      errors: {},
    }));

    render(
      <DashForm<TestFormValues>
        resolver={resolver}
        defaultValues={{ email: '' }}
      >
        <button type="submit">Submit</button>
      </DashForm>
    );

    expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
  });
});
