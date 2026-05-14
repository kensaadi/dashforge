import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { createEngine } from '@dashforge/ui-core';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Test wrapper that provides a minimal DashForm context with react-hook-form.
 * This simulates the real DashFormProvider behavior for testing.
 */
function TestDashForm({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const rhf = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const engine = useMemo(() => createEngine({ debug: false }), []);

  // Subscribe to formState to enable reactivity
  const errors = rhf.formState.errors;
  const touchedFields = rhf.formState.touchedFields;
  const dirtyFields = rhf.formState.dirtyFields;
  const submitCount = rhf.formState.submitCount;

  // Watch all form values: this subscribes the wrapper to RHF state so the
  // per-field listeners below fire on every value change. The returned array
  // is intentionally unused (we don't depend on a `valuesVersion` string in
  // the 0.2.0-beta bridge contract).
  rhf.watch();

  // Helper to get nested values by dot path
  const getByPath = (obj: unknown, path: string): unknown => {
    if (!obj || typeof obj !== 'object') return null;
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
      if (!current || typeof current !== 'object') return null;
      current = (current as Record<string, unknown>)[key];
    }
    return current;
  };

  // Per-field subscription registry (0.2.0-beta required surface).
  // Broadcast model: every state-change cycle (errors / touchedFields /
  // dirtyFields / values) notifies every registered listener. The
  // production DashFormProvider does a per-field diff; for this test
  // wrapper we keep it minimal — Select consumers re-read state via
  // useSyncExternalStore and only depend on "something changed", not on
  // "this exact field changed".
  const listenersRef = useRef<Set<() => void>>(new Set());
  const notifyAll = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);
  const subscribeField = useCallback(
    (_name: string, listener: () => void): (() => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );
  useEffect(() => {
    notifyAll();
  }, [errors, touchedFields, dirtyFields, submitCount, notifyAll]);

  // Build minimal bridge matching DashFormProvider's 0.2.0-beta contract.
  const bridgeValue = useMemo<DashFormBridge>(
    () => ({
      engine,
      register: (name: string, rules?: unknown) => {
        const rhfRegister = rhf.register(name as never, rules as never);

        // Wrap onChange like the real DashFormProvider does
        const originalOnChange = rhfRegister.onChange;
        const wrappedOnChange = async (event: unknown) => {
          // Call RHF onChange first
          const result = await originalOnChange(event as never);
          return result;
        };

        // Return registration with wrapped onChange
        return {
          ...rhfRegister,
          onChange: wrappedOnChange,
        } as never;
      },
      unregister: (name: string) => {
        rhf.unregister(name as never);
      },
      getError: (name: string) => {
        const err = getByPath(errors, name);
        if (err && typeof err === 'object' && 'message' in err) {
          const msg = (err as { message: unknown }).message;
          if (typeof msg === 'string') {
            return { message: msg };
          }
        }
        return null;
      },
      getValue: (name: string) => {
        return rhf.getValues(name as never);
      },
      setValue: (name: string, value: unknown) => {
        rhf.setValue(name as never, value as never, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: false,
        });
      },
      isTouched: (name: string): boolean => {
        const touched = getByPath(touchedFields, name);
        return Boolean(touched);
      },
      isDirty: (name: string): boolean => {
        const dirty = getByPath(dirtyFields, name);
        return Boolean(dirty);
      },
      submitCount,
      subscribeField,
    }),
    [
      engine,
      rhf,
      errors,
      touchedFields,
      dirtyFields,
      submitCount,
      subscribeField,
    ]
  );

  return (
    <DashFormContext.Provider value={bridgeValue}>
      {children}
    </DashFormContext.Provider>
  );
}

describe('Select - value update bug', () => {
  it('value updates when option is selected', async () => {
    const user = userEvent.setup();

    render(
      <TestDashForm>
        <Select
          name="country"
          label="Country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ]}
          rules={{ required: 'Country is required' }}
        />
      </TestDashForm>
    );

    const selectInput = screen.getByLabelText('Country');

    // Initial state: no value selected (just shows a zero-width space)
    const hiddenInput = document.querySelector(
      'input[name="country"]'
    ) as HTMLInputElement;
    expect(hiddenInput?.value).toBe('');

    // Open the Select menu
    await user.click(selectInput);

    // Click on an option
    const option = await screen.findByRole('option', { name: 'United States' });
    await user.click(option);

    // Wait for React to process state updates
    await screen.findByDisplayValue('us');

    // EXPECTED: Select should now display "United States" and value should be "us"
    // This test will FAIL initially because MUI Select onChange event doesn't
    // have the correct shape for RHF (missing target.name)
    expect(selectInput).toHaveTextContent('United States');

    // Verify the hidden input has the correct value
    expect(hiddenInput).toHaveValue('us');
  });

  it('value updates immediately without touching other fields', async () => {
    const user = userEvent.setup();

    render(
      <TestDashForm>
        <Select
          name="test.country"
          label="Country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ]}
          rules={{ required: 'Country is required' }}
        />
        <Select
          name="test.language"
          label="Language"
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ]}
        />
      </TestDashForm>
    );

    const countrySelect = screen.getByLabelText('Country');

    // Open the Country select menu
    await user.click(countrySelect);

    // Click on "Canada"
    const canadaOption = await screen.findByRole('option', { name: 'Canada' });
    await user.click(canadaOption);

    // BUG: Without valuesVersion subscription, the Select won't update immediately
    // It will only update after touching another field (like language)
    // This test will FAIL initially because TextField doesn't subscribe to valuesVersion

    // Wait for the hidden input to have the value (RHF state updates)
    const hiddenInput = document.querySelector(
      'input[name="test.country"]'
    ) as HTMLInputElement;
    await screen.findByDisplayValue('ca');

    // CRITICAL: Select should display "Canada" immediately WITHOUT touching other fields
    expect(countrySelect).toHaveTextContent('Canada');
    expect(hiddenInput).toHaveValue('ca');
  });
});
