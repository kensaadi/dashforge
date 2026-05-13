import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashFormProvider } from './DashFormProvider';
import { useDashFormContext } from './useDashFormContext';
import { useDashFieldMeta } from '../hooks/useDashFieldMeta';
import { DashFormContext } from '@dashforge/ui-core';
import type { Resolver, FieldError } from 'react-hook-form';
import { useState, useContext } from 'react';
import type React from 'react';

/**
 * RESOLVER PASS-THROUGH TESTS
 *
 * Verify that resolver integration works without modifying:
 * - Bridge interface
 * - Engine adapter
 * - Reaction system
 * - onChange wrapper
 * - Error gating
 *
 * These tests use ONLY mock resolvers (no external validation libraries).
 */

interface TestFormValues {
  email: string;
  trigger?: string;
  target?: string;
}

/**
 * Test component that exposes bridge methods for testing
 */
function TestComponent({ fieldName = 'email' }: { fieldName?: string }) {
  const bridge = useContext(DashFormContext);
  const [inputValue, setInputValue] = useState('');

  if (!bridge) throw new Error('Bridge not available');

  // Subscribe to per-field meta changes so the component re-renders when
  // resolver-emitted errors arrive (post-0.1.6 the bridge identity is
  // stable, so reading bridge.getError() during render is no longer
  // sufficient on its own).
  const { error } = useDashFieldMeta(fieldName);

  // CR fix #4 (0.1.9-alpha): bridge.register is optional on the type,
  // so call sites must non-null assert. The `if (!bridge) throw` above
  // already guarantees `bridge` itself is defined.
  const registration = bridge.register!(fieldName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    setInputValue(newValue);
    registration.onChange?.(e);
  };

  return (
    <div>
      <input
        data-testid={`input-${fieldName}`}
        {...registration}
        value={inputValue}
        onChange={handleChange}
      />
      {error && <span data-testid="error">{error.message}</span>}
      <span data-testid="touched">
        {bridge.isTouched!(fieldName) ? 'touched' : 'untouched'}
      </span>
    </div>
  );
}

describe('DashFormProvider - Resolver Pass-Through', () => {
  /**
   * TEST 1: Resolver errors flow through bridge.getError()
   *
   * Validates:
   * - Resolver validation runs
   * - Errors populate formState.errors
   * - Errors exposed via bridge.getError()
   * - Error gating respects touched state
   */
  it('should expose resolver errors via bridge.getError()', async () => {
    // Mock resolver that validates email format
    const mockResolver: Resolver<TestFormValues> = async (values) => {
      const errors: Record<string, FieldError> = {};

      if (!values.email) {
        errors.email = {
          type: 'required',
          message: 'Email required by resolver',
        };
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = {
          type: 'pattern',
          message: 'Invalid email format',
        };
      }

      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
      };
    };

    render(
      <DashFormProvider<TestFormValues>
        resolver={mockResolver}
        defaultValues={{ email: '' }}
      >
        <TestComponent />
      </DashFormProvider>
    );

    const input = screen.getByTestId('input-email');

    // Type invalid email
    fireEvent.change(input, { target: { value: 'invalid' } });

    // Deterministic blur trigger
    fireEvent.blur(input);

    // Wait for validation to run
    await waitFor(() => {
      const error = screen.queryByTestId('error');
      expect(error).not.toBeNull();
      if (error && 'textContent' in error) {
        expect((error as HTMLElement).textContent).toBe('Invalid email format');
      }
    });

    // Verify touched state updated
    const touchedElement = screen.getByTestId('touched');
    if ('textContent' in touchedElement) {
      expect((touchedElement as HTMLElement).textContent).toBe('touched');
    }
  });

  /**
   * TEST 2: Backward compatibility - no resolver
   *
   * Validates:
   * - When resolver is undefined, RegisterOptions validation works
   * - Behavior identical to pre-resolver implementation
   * - Zero regression in existing functionality
   */
  it('should maintain RegisterOptions validation when no resolver provided', async () => {
    function TestWithRules() {
      const bridge = useContext(DashFormContext);
      const [inputValue, setInputValue] = useState('');

      if (!bridge) throw new Error('Bridge not available');

      // Subscribe to per-field meta so error updates re-render the component.
      const { error } = useDashFieldMeta('email');

      const registration = bridge.register!('email', {
        required: 'Email required by RegisterOptions',
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        setInputValue(newValue);
        registration.onChange?.(e);
      };

      return (
        <div>
          <input
            data-testid="input-email"
            {...registration}
            value={inputValue}
            onChange={handleChange}
          />
          {error && <span data-testid="error">{error.message}</span>}
        </div>
      );
    }

    render(
      <DashFormProvider<TestFormValues> 
        defaultValues={{ email: '' }}
        mode="onBlur"
      >
        <TestWithRules />
      </DashFormProvider>
    );

    const input = screen.getByTestId('input-email');

    // Focus and blur without entering value
    fireEvent.focus(input);
    fireEvent.blur(input);

    // Wait for RegisterOptions validation
    await waitFor(() => {
      const error = screen.queryByTestId('error');
      expect(error).not.toBeNull();
      if (error && 'textContent' in error) {
        expect((error as HTMLElement).textContent).toBe('Email required by RegisterOptions');
      }
    });
  });

  /**
   * TEST 3: Resolver with field rules behavior
   *
   * Validates:
   * - When resolver provided, it becomes primary validation source
   * - Behavior follows React Hook Form's validation flow
   * - No breaking changes to existing systems
   */
  it('should use resolver as primary validation when both resolver and field rules provided', async () => {
    const mockResolver: Resolver<TestFormValues> = async (values) => {
      return {
        values: values.email ? values : {},
        errors: values.email
          ? {}
          : {
              email: {
                type: 'resolver',
                message: 'Resolver error',
              },
            },
      };
    };

    function TestWithBoth() {
      const bridge = useContext(DashFormContext);
      const [inputValue, setInputValue] = useState('');

      if (!bridge) throw new Error('Bridge not available');

      // Subscribe to per-field meta so error updates re-render the component.
      const { error } = useDashFieldMeta('email');

      const registration = bridge.register!('email', {
        required: 'RegisterOptions error',
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        setInputValue(newValue);
        registration.onChange?.(e);
      };

      return (
        <div>
          <input
            data-testid="input-email"
            {...registration}
            value={inputValue}
            onChange={handleChange}
          />
          {error && <span data-testid="error">{error.message}</span>}
        </div>
      );
    }

    render(
      <DashFormProvider<TestFormValues>
        resolver={mockResolver}
        defaultValues={{ email: '' }}
        mode="onBlur"
      >
        <TestWithBoth />
      </DashFormProvider>
    );

    const input = screen.getByTestId('input-email');

    // Blur to trigger validation
    fireEvent.blur(input);

    // Wait for validation - resolver takes precedence per RHF behavior
    await waitFor(() => {
      const error = screen.queryByTestId('error');
      expect(error).not.toBeNull();
      if (error && 'textContent' in error) {
        expect((error as HTMLElement).textContent).toBe('Resolver error');
      }
    });
  });

  /**
   * TEST 4: Resolver does not break onChange wrapper
   *
   * Validates:
   * - onChange → wrapper → syncValueToEngine flow still works
   * - Resolver doesn't interfere with engine sync
   * - Engine node updated with value
   */
  it('should maintain onChange wrapper and engine sync with resolver', async () => {
    const mockResolver: Resolver<TestFormValues> = async (values) => {
      // Valid always - no validation errors
      return { values, errors: {} };
    };

    const syncSpy = vi.fn();

    function TestWithSync() {
      const bridge = useContext(DashFormContext);
      const { adapter } = useDashFormContext();
      const [inputValue, setInputValue] = useState('');

      if (!bridge) throw new Error('Bridge not available');

      // Spy on syncValueToEngine
      vi.spyOn(adapter, 'syncValueToEngine').mockImplementation(syncSpy);

      const registration = bridge.register!('trigger');

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        setInputValue(newValue);
        registration.onChange?.(e);
      };

      return (
        <div>
          <input
            data-testid="input-trigger"
            {...registration}
            value={inputValue}
            onChange={handleChange}
          />
          <span data-testid="sync-count">{syncSpy.mock.calls.length}</span>
        </div>
      );
    }

    render(
      <DashFormProvider<TestFormValues>
        resolver={mockResolver}
        defaultValues={{ trigger: '' }}
      >
        <TestWithSync />
      </DashFormProvider>
    );

    const input = screen.getByTestId('input-trigger');

    // Type value to trigger onChange
    fireEvent.change(input, { target: { value: 'test' } });

    // Verify syncValueToEngine was called
    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalled();
      expect(syncSpy).toHaveBeenCalledWith('trigger', 'test');
    });
  });

  /**
   * TEST 5: Resolver does not break reactions
   *
   * Validates:
   * - Reaction evaluation works with resolver
   * - onChange → engine sync → reaction evaluates
   * - Resolver doesn't interfere with reaction system
   */
  it('should maintain reaction system with resolver', async () => {
    const mockResolver: Resolver<TestFormValues> = async (values) => {
      return { values, errors: {} };
    };

    const reactionRunSpy = vi.fn();

    const reactions = [
      {
        id: 'test-reaction',
        watch: ['trigger' as const],
        when: (ctx: { getValue: (name: string) => unknown }) =>
          Boolean(ctx.getValue('trigger')),
        run: reactionRunSpy,
      },
    ];

    function TestWithReaction() {
      const bridge = useContext(DashFormContext);
      const [inputValue, setInputValue] = useState('');

      if (!bridge) throw new Error('Bridge not available');

      const registration = bridge.register!('trigger');

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        setInputValue(newValue);
        registration.onChange?.(e);
      };

      return (
        <div>
          <input
            data-testid="input-trigger"
            {...registration}
            value={inputValue}
            onChange={handleChange}
          />
          <span data-testid="reaction-count">
            {reactionRunSpy.mock.calls.length}
          </span>
        </div>
      );
    }

    render(
      <DashFormProvider<TestFormValues>
        resolver={mockResolver}
        defaultValues={{ trigger: '', target: '' }}
        reactions={reactions}
      >
        <TestWithReaction />
      </DashFormProvider>
    );

    const input = screen.getByTestId('input-trigger');

    // Change trigger field value
    fireEvent.change(input, { target: { value: 'trigger-value' } });

    // Wait for reaction to fire
    await waitFor(() => {
      expect(reactionRunSpy).toHaveBeenCalled();
    });
  });
});
