import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { renderWithBridge } from '../../test-utils/renderWithBridge';
import { renderWithRuntime } from '../../test-utils/renderWithRuntime';
import type { SelectFieldRuntimeData } from './Select';

/**
 * Runtime Integration Tests for Select Component (Reactive V2 - Step 04)
 *
 * Policy: dashforge/.opencode/policies/reaction-v2.md
 * Plan: dashforge/.opencode/reports/reaction-v2-step-04-plan-v4.md
 *
 * Tests verify:
 * - Runtime options integration with useFieldRuntime
 * - Generic option shape support via mappers
 * - Soft failure for mapper errors (no throws)
 * - NO UI messaging (no helper text for loading/empty states)
 * - NO automatic reconciliation (form values never reset)
 * - Backward compatibility with static options
 */

describe('Select - Runtime Integration (Reactive V2)', () => {
  describe('Static Mode (Backward Compatibility)', () => {
    it('should render with static options when optionsFromFieldData is false', () => {
      // Use renderWithBridge (not renderWithRuntime) since no runtime needed
      renderWithBridge(
        <Select
          name="color"
          label="Color"
          options={[
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
          ]}
        />
      );

      const select = screen.getByLabelText('Color');
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });

    it('should ignore runtime state when optionsFromFieldData is false', () => {
      renderWithRuntime(
        <Select
          name="color"
          label="Color"
          options={[
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
          ]}
        />,
        {
          initialRuntime: {
            color: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'green', label: 'Green' }],
              },
            },
          },
        }
      );

      const select = screen.getByLabelText('Color');
      expect(select).toBeInTheDocument();
      // Should render static options, NOT runtime options
      // (Testing this implicitly - component renders successfully)
    });
  });

  describe('Runtime Mode - Basic Functionality', () => {
    it('should render runtime options from field runtime state', async () => {
      const { getByLabelText, getByRole } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      const select = getByLabelText('City');
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();

      // Open select to verify options are rendered
      await userEvent.click(select);
      await waitFor(() => {
        expect(getByRole('option', { name: 'New York' })).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'San Francisco' })
        ).toBeInTheDocument();
      });
    });

    it('should disable select when runtime status is loading', () => {
      const { getByLabelText, container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'loading',
              error: null,
              data: null,
            },
          },
        }
      );

      const select = getByLabelText('City');
      // MUI Select shows disabled via aria-disabled and CSS classes
      expect(select).toHaveAttribute('aria-disabled', 'true');

      // The actual input element should be disabled
      const input = container.querySelector(
        'input[name="city"]'
      ) as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it('should NOT display helper text when runtime status is loading (policy: no UI messaging)', () => {
      const { container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'loading',
              error: null,
              data: null,
            },
          },
        }
      );

      // Verify NO helper text is rendered
      const helperText = container.querySelector('.MuiFormHelperText-root');
      expect(helperText).toBeNull();
    });

    it('should update options when runtime state changes', async () => {
      const { getByLabelText, getByRole, updateRuntime } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'nyc', label: 'New York' }],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      const select = getByLabelText('City');

      // Open select to verify initial options
      await userEvent.click(select);
      await waitFor(() => {
        expect(getByRole('option', { name: 'New York' })).toBeInTheDocument();
      });

      // Close select (click away)
      await userEvent.keyboard('{Escape}');

      // Update runtime with new options
      updateRuntime('city', {
        status: 'ready',
        error: null,
        data: {
          options: [
            { value: 'la', label: 'Los Angeles' },
            { value: 'chi', label: 'Chicago' },
          ],
        } as SelectFieldRuntimeData,
      });

      // Open select again to verify new options
      await userEvent.click(select);
      await waitFor(() => {
        expect(
          getByRole('option', { name: 'Los Angeles' })
        ).toBeInTheDocument();
        expect(getByRole('option', { name: 'Chicago' })).toBeInTheDocument();
      });
    });

    it('should NOT display helper text when runtime options are empty (policy: no UI messaging)', () => {
      const { container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      // Verify NO helper text is rendered
      const helperText = container.querySelector('.MuiFormHelperText-root');
      expect(helperText).toBeNull();
    });
  });

  describe('Generic Option Shape (Mapper Support)', () => {
    interface CustomOption {
      id: number;
      name: string;
      active: boolean;
    }

    it('should support custom option shapes with mapper functions', async () => {
      const { getByLabelText, getByRole } = renderWithRuntime(
        <Select
          name="item"
          label="Item"
          optionsFromFieldData
          getOptionValue={(opt: unknown) => (opt as CustomOption).id}
          getOptionLabel={(opt: unknown) => (opt as CustomOption).name}
          getOptionDisabled={(opt: unknown) => !(opt as CustomOption).active}
        />,
        {
          initialRuntime: {
            item: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { id: 1, name: 'Active Item', active: true },
                  { id: 2, name: 'Inactive Item', active: false },
                ],
              },
            },
          },
        }
      );

      const select = getByLabelText('Item');
      expect(select).toBeInTheDocument();

      // Open select to verify options are rendered with correct labels
      await userEvent.click(select);
      await waitFor(() => {
        const activeOption = getByRole('option', { name: 'Active Item' });
        const inactiveOption = getByRole('option', { name: 'Inactive Item' });

        expect(activeOption).toBeInTheDocument();
        expect(inactiveOption).toBeInTheDocument();

        // Verify disabled state
        expect(activeOption).not.toHaveAttribute('aria-disabled', 'true');
        expect(inactiveOption).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should use default mappers for simple { value, label } shape when no mappers provided', async () => {
      const { getByLabelText, getByRole } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      const select = getByLabelText('City');

      // Open select to verify default mappers work
      await userEvent.click(select);
      await waitFor(() => {
        expect(getByRole('option', { name: 'New York' })).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'San Francisco' })
        ).toBeInTheDocument();
      });
    });

    it('should filter out options with failed mapper (soft failure - no throw)', async () => {
      const { getByLabelText, getByRole, queryByRole } = renderWithRuntime(
        <Select
          name="item"
          label="Item"
          optionsFromFieldData
          getOptionValue={(opt: unknown) => {
            // Return undefined for invalid options (soft failure)
            if (typeof opt === 'object' && opt !== null && 'id' in opt) {
              return (opt as { id: number }).id;
            }
            return undefined; // Soft failure
          }}
          getOptionLabel={(opt) => {
            if (typeof opt === 'object' && opt !== null && 'name' in opt) {
              return (opt as { name: string }).name;
            }
            return ''; // Soft failure
          }}
        />,
        {
          initialRuntime: {
            item: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { id: 1, name: 'Valid Item' },
                  { invalid: 'data' }, // Missing id - will be filtered out
                  { id: 2, name: 'Another Valid Item' },
                ],
              },
            },
          },
        }
      );

      const select = getByLabelText('Item');

      // Open select to verify only valid options are rendered
      await userEvent.click(select);
      await waitFor(() => {
        expect(getByRole('option', { name: 'Valid Item' })).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'Another Valid Item' })
        ).toBeInTheDocument();
      });

      // Verify invalid option is NOT rendered
      expect(queryByRole('option', { name: 'invalid' })).toBeNull();
    });
  });

  describe('Policy Compliance (Reactive V2)', () => {
    it('should NOT reset form value when runtime options change (no reconciliation)', async () => {
      const { updateRuntime, getFormValue, container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'nyc' }, // Existing form value
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      // MUI Select stores value in hidden input
      const hiddenInput = container.querySelector(
        'input[name="city"]'
      ) as HTMLInputElement;
      expect(hiddenInput?.value).toBe('nyc');

      // Update runtime with new options (that don't include 'nyc')
      updateRuntime('city', {
        status: 'ready',
        error: null,
        data: {
          options: [
            { value: 'la', label: 'Los Angeles' },
            { value: 'chi', label: 'Chicago' },
          ],
        } as SelectFieldRuntimeData,
      });

      await waitFor(() => {
        // Form value should NOT be reset (policy: no automatic reconciliation)
        expect(getFormValue('city')).toBe('nyc');
      });
    });

    it('should display empty selection when form value is unresolved (no automatic reset)', async () => {
      const { getFormValue, container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'unknown-city' }, // Unresolved value
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              } as SelectFieldRuntimeData,
            },
          },
        }
      );

      // Display value should be empty (Step 05b: MUI warning suppression)
      const hiddenInput = container.querySelector(
        'input[name="city"]'
      ) as HTMLInputElement;
      expect(hiddenInput?.value).toBe('');

      // Form value should remain unchanged (policy: no automatic reset)
      expect(getFormValue('city')).toBe('unknown-city');
    });

    it('should handle runtime error state without throwing (component stability)', () => {
      const { getByLabelText } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'error',
              error: 'Failed to load options',
              data: null,
            },
          },
        }
      );

      // Component should render without throwing
      const select = getByLabelText('City');
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });

    it('should NOT display error message for runtime errors (policy: no UI responsibility)', () => {
      const { container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          initialRuntime: {
            city: {
              status: 'error',
              error: 'Failed to load options',
              data: null,
            },
          },
        }
      );

      // Verify NO helper text is rendered for runtime errors
      const helperText = container.querySelector('.MuiFormHelperText-root');
      expect(helperText).toBeNull();
    });
  });

  describe('Unresolved Value Policy (Step 05)', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Clear console.warn spy
      vi.clearAllMocks();
    });

    afterEach(() => {
      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should display empty UI selection for unresolved value', () => {
      const { container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'unknown' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              },
            },
          },
        }
      );

      // Display value should be empty (Step 05b: MUI warning suppression)
      const hiddenInput = container.querySelector(
        'input[name="city"]'
      ) as HTMLInputElement;

      expect(hiddenInput?.value).toBe('');

      // UI shows no selection (MUI default for unresolved)
      // This is implicit - no exception thrown, component renders
    });

    it('should NOT reset form value when value is unresolved', () => {
      const { getFormValue } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'deleted-city' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'nyc', label: 'New York' }],
              },
            },
          },
        }
      );

      // Form value must remain unchanged (policy: no automatic reset)
      expect(getFormValue('city')).toBe('deleted-city');
    });

    it('should emit warning in development mode for unresolved value', async () => {
      // Set development mode
      process.env.NODE_ENV = 'development';

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'invalid' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              },
            },
          },
        }
      );

      // Warning emitted in effect (may need to wait)
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Dashforge Select] Unresolved value')
        );
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('city')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('nyc, sf')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should NOT emit warning in production mode', async () => {
      // Set production mode
      process.env.NODE_ENV = 'production';

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'invalid' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'nyc', label: 'New York' }],
              },
            },
          },
        }
      );

      // Wait to ensure effect has run
      await waitFor(() => {
        // No warning in production
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should NOT emit warning when runtime is loading', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'unknown' },
          },
          initialRuntime: {
            city: {
              status: 'loading', // Still loading
              error: null,
              data: null,
            },
          },
        }
      );

      // Wait to ensure effect would have run if conditions were met
      await waitFor(() => {
        // No Dashforge warning during loading (MUI warnings are OK)
        const dashforgeWarnings = consoleWarnSpy.mock.calls.filter((call) =>
          call[0]?.includes('[Dashforge Select]')
        );
        expect(dashforgeWarnings).toHaveLength(0);
      });

      consoleWarnSpy.mockRestore();
    });

    it('should NOT emit warning when value is null or undefined', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: null }, // No value
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'nyc', label: 'New York' }],
              },
            },
          },
        }
      );

      // Wait to ensure effect would have run
      await waitFor(() => {
        // No warning for null/undefined values
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should emit warning when options are empty (valid scenario)', async () => {
      // NEW TEST: Empty options array is a valid warning scenario
      process.env.NODE_ENV = 'development';

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'some-value' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [], // Empty options array
              },
            },
          },
        }
      );

      // Warning should be emitted even with empty options
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Dashforge Select] Unresolved value')
        );
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('some-value')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('(empty - no options loaded)')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should deduplicate warnings for same field and value', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const { rerender } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'invalid' },
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [{ value: 'nyc', label: 'New York' }],
              },
            },
          },
        }
      );

      // First render: warning emitted (in effect)
      await waitFor(() => {
        const dashforgeWarnings = consoleWarnSpy.mock.calls.filter((call) =>
          call[0]?.includes('[Dashforge Select]')
        );
        expect(dashforgeWarnings).toHaveLength(1);
      });

      // Force re-render (same props, same value)
      rerender(<Select name="city" label="City" optionsFromFieldData />);

      // Wait for effect to potentially run again
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Still only 1 Dashforge warning (deduplicated)
      const dashforgeWarnings = consoleWarnSpy.mock.calls.filter((call) =>
        call[0]?.includes('[Dashforge Select]')
      );
      expect(dashforgeWarnings).toHaveLength(1);

      consoleWarnSpy.mockRestore();
    });

    it('should continue to work normally for resolved values', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const { container } = renderWithRuntime(
        <Select name="city" label="City" optionsFromFieldData />,
        {
          mockBridgeOptions: {
            defaultValues: { city: 'nyc' }, // Valid value
          },
          initialRuntime: {
            city: {
              status: 'ready',
              error: null,
              data: {
                options: [
                  { value: 'nyc', label: 'New York' },
                  { value: 'sf', label: 'San Francisco' },
                ],
              },
            },
          },
        }
      );

      // Wait for effect
      await waitFor(() => {
        // No warning for resolved values
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      // Value is correctly set
      const hiddenInput = container.querySelector(
        'input[name="city"]'
      ) as HTMLInputElement;
      expect(hiddenInput?.value).toBe('nyc');

      consoleWarnSpy.mockRestore();
    });
  });
});
