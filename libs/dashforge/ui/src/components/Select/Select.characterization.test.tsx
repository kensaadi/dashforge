import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { createEngine } from '@dashforge/ui-core';

/**
 * Characterization tests for Select component typing stabilization.
 * These tests lock current behavior BEFORE removing unsafe casts.
 *
 * Purpose: Ensure that removing `as never` and `as any` does NOT change runtime behavior.
 */
describe('Select - Characterization Tests (Type Safety)', () => {
  it('single select: selecting an option updates the field value', async () => {
    const user = userEvent.setup();
    const values: Record<string, unknown> = {};

    const mockBridge: DashFormBridge = {
      engine: createEngine({ debug: false }),
      register: (name: string) => ({
        name,
        onChange: async (event: unknown) => {
          // Extract value from event
          if (event && typeof event === 'object' && 'target' in event) {
            const target = (event as { target: unknown }).target;
            if (target && typeof target === 'object' && 'value' in target) {
              values[name] = (target as { value: unknown }).value;
            }
          }
        },
        onBlur: () => {},
        ref: () => {},
      }),
      getValue: (name: string) => values[name] ?? '',
      setValue: (name: string, value: unknown) => {
        values[name] = value;
      },
      getError: () => null,
      errorVersion: '{}',
      isTouched: () => false,
      touchedVersion: '{}',
      dirtyVersion: '{}',
      valuesVersion: JSON.stringify(values),
      submitCount: 0,
    };

    render(
      <DashFormContext.Provider value={mockBridge}>
        <Select
          name="status"
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </DashFormContext.Provider>
    );

    const selectInput = screen.getByLabelText('Status');
    await user.click(selectInput);

    const activeOption = await screen.findByRole('option', { name: 'Active' });
    await user.click(activeOption);

    // Value should be updated to 'active'
    expect(values['status']).toBe('active');
  });

  it('single select with numeric values: type T is preserved', async () => {
    const user = userEvent.setup();
    const values: Record<string, unknown> = {};

    const mockBridge: DashFormBridge = {
      engine: createEngine({ debug: false }),
      register: (name: string) => ({
        name,
        onChange: async (event: unknown) => {
          if (event && typeof event === 'object' && 'target' in event) {
            const target = (event as { target: unknown }).target;
            if (target && typeof target === 'object' && 'value' in target) {
              values[name] = (target as { value: unknown }).value;
            }
          }
        },
        onBlur: () => {},
        ref: () => {},
      }),
      getValue: (name: string) => values[name] ?? '',
      setValue: (name: string, value: unknown) => {
        values[name] = value;
      },
      getError: () => null,
      errorVersion: '{}',
      isTouched: () => false,
      touchedVersion: '{}',
      dirtyVersion: '{}',
      valuesVersion: JSON.stringify(values),
      submitCount: 0,
    };

    render(
      <DashFormContext.Provider value={mockBridge}>
        <Select<number>
          name="priority"
          label="Priority"
          options={[
            { value: 1, label: 'Low' },
            { value: 2, label: 'Medium' },
            { value: 3, label: 'High' },
          ]}
        />
      </DashFormContext.Provider>
    );

    const selectInput = screen.getByLabelText('Priority');
    await user.click(selectInput);

    const highOption = await screen.findByRole('option', { name: 'High' });
    await user.click(highOption);

    // Value should be numeric 3, not string "3"
    expect(values['priority']).toBe(3);
    expect(typeof values['priority']).toBe('number');
  });

  it('value shown in UI matches stored value', async () => {
    const user = userEvent.setup();
    let storedValue = '';

    const mockBridge: DashFormBridge = {
      engine: createEngine({ debug: false }),
      register: (name: string) => ({
        name,
        onChange: async (event: unknown) => {
          if (event && typeof event === 'object' && 'target' in event) {
            const target = (event as { target: unknown }).target;
            if (target && typeof target === 'object' && 'value' in target) {
              storedValue = String((target as { value: unknown }).value);
            }
          }
        },
        onBlur: () => {},
        ref: () => {},
      }),
      getValue: () => storedValue,
      setValue: (name: string, value: unknown) => {
        storedValue = String(value);
      },
      getError: () => null,
      errorVersion: '{}',
      isTouched: () => false,
      touchedVersion: '{}',
      dirtyVersion: '{}',
      valuesVersion: storedValue,
      submitCount: 0,
    };

    const { rerender } = render(
      <DashFormContext.Provider value={mockBridge}>
        <Select
          name="color"
          label="Color"
          options={[
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
          ]}
        />
      </DashFormContext.Provider>
    );

    const selectInput = screen.getByLabelText('Color');
    await user.click(selectInput);

    const blueOption = await screen.findByRole('option', { name: 'Blue' });
    await user.click(blueOption);

    expect(storedValue).toBe('blue');

    // Force re-render to verify UI shows stored value
    rerender(
      <DashFormContext.Provider value={mockBridge}>
        <Select
          name="color"
          label="Color"
          options={[
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
          ]}
        />
      </DashFormContext.Provider>
    );

    // UI should display "Blue"
    expect(selectInput).toHaveTextContent('Blue');
  });

  it('integration: Select bound through bridge updates correctly (no delayed updates)', async () => {
    const user = userEvent.setup();
    const formState: Record<string, unknown> = { country: '' };

    const mockBridge: DashFormBridge = {
      engine: createEngine({ debug: false }),
      register: (name: string) => ({
        name,
        onChange: async (event: unknown) => {
          if (event && typeof event === 'object' && 'target' in event) {
            const target = (event as { target: unknown }).target;
            if (target && typeof target === 'object' && 'value' in target) {
              formState[name] = (target as { value: unknown }).value;
            }
          }
        },
        onBlur: () => {},
        ref: () => {},
      }),
      getValue: (name: string) => formState[name] ?? '',
      setValue: (name: string, value: unknown) => {
        formState[name] = value;
      },
      getError: () => null,
      errorVersion: '{}',
      isTouched: () => false,
      touchedVersion: '{}',
      dirtyVersion: '{}',
      valuesVersion: JSON.stringify(formState),
      submitCount: 0,
    };

    render(
      <DashFormContext.Provider value={mockBridge}>
        <Select
          name="country"
          label="Country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ]}
        />
      </DashFormContext.Provider>
    );

    const selectInput = screen.getByLabelText('Country');

    // Initially empty
    expect(formState['country']).toBe('');

    // Select an option
    await user.click(selectInput);
    const usOption = await screen.findByRole('option', {
      name: 'United States',
    });
    await user.click(usOption);

    // Value should update immediately (no delayed updates)
    expect(formState['country']).toBe('us');
  });
});
