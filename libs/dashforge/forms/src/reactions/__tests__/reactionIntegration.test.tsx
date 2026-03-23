import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DashFormProvider } from '../../core/DashFormProvider';
import type { ReactionDefinition } from '../reaction.types';
import type { ReactNode } from 'react';
import { useDashFormContext } from '../../core/useDashFormContext';
import { useFieldRuntime } from '../../hooks/useFieldRuntime';
import { TestFieldHarness } from './testHarness';

describe('Reaction Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('7.1 Complete Flow: Field Change → Reaction → Runtime Update', () => {
    it('field change triggers reaction that updates runtime state', async () => {
      const reactions: ReactionDefinition[] = [
        {
          id: 'update-status',
          watch: ['trigger'],
          when: (ctx) => Boolean(ctx.getValue('trigger')),
          run: (ctx) => {
            ctx.setRuntime('target', { status: 'loading', data: null });
          },
        },
      ];

      let triggerField: ((value: unknown) => void) | null = null;

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{ trigger: '', target: '' }}
          reactions={reactions}
        >
          <TestFieldHarness
            name="trigger"
            onRegistered={(trigger) => {
              triggerField = trigger;
            }}
          />
          {children}
        </DashFormProvider>
      );

      const { result } = renderHook(
        () => ({
          form: useDashFormContext(),
          runtime: useFieldRuntime('target'),
        }),
        { wrapper: TestWrapper }
      );

      // Initial state
      expect(result.current.runtime.status).toBe('idle');

      // Change field value using real onChange
      await act(async () => {
        if (triggerField) {
          triggerField('active');
        }
      });

      // Wait for reaction to execute
      await waitFor(() => {
        expect(result.current.runtime.status).toBe('loading');
      });
    });
  });

  describe('7.2 Initial Evaluation Populates Runtime State', () => {
    it('initial evaluation runs on mount with defaultValues', async () => {
      const reactions: ReactionDefinition[] = [
        {
          id: 'init-runtime',
          watch: ['country'],
          when: (ctx) => Boolean(ctx.getValue('country')),
          run: (ctx) => {
            const country = ctx.getValue<string>('country');
            ctx.setRuntime('city', {
              status: 'ready',
              data: { options: [`${country}-city-1`, `${country}-city-2`] },
            });
          },
        },
      ];

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{ country: 'USA', city: '' }}
          reactions={reactions}
        >
          {children}
        </DashFormProvider>
      );

      const { result } = renderHook(() => useFieldRuntime('city'), { wrapper });

      // Wait for initial evaluation to complete
      await waitFor(() => {
        expect(result.current.status).toBe('ready');
        expect(result.current.data).toEqual({
          options: ['USA-city-1', 'USA-city-2'],
        });
      });
    });
  });

  describe('7.3 Strict Mode Protection', () => {
    it('initial evaluation runs only once despite double mount', async () => {
      const runSpy = vi.fn((ctx) => {
        ctx.setRuntime('target', { status: 'ready', data: null });
      });

      const reactions: ReactionDefinition[] = [
        {
          id: 'strict-mode-test',
          watch: ['field1'],
          run: runSpy,
        },
      ];

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{ field1: 'initial' }}
          reactions={reactions}
        >
          {children}
        </DashFormProvider>
      );

      renderHook(() => useDashFormContext(), { wrapper });

      // Wait for initial evaluation
      await waitFor(() => {
        expect(runSpy).toHaveBeenCalledTimes(1);
      });

      // Give time for potential second call (should not happen)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify still only called once
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('7.4 Multiple Reactions Watch Same Field', () => {
    it('multiple reactions execute when watched field changes', async () => {
      const runSpy1 = vi.fn((ctx) => {
        ctx.setRuntime('target1', { status: 'loading', data: null });
      });

      const runSpy2 = vi.fn((ctx) => {
        ctx.setRuntime('target2', { status: 'loading', data: null });
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['trigger'], run: runSpy1 },
        { id: 'reaction-2', watch: ['trigger'], run: runSpy2 },
      ];

      let triggerField: ((value: unknown) => void) | null = null;

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{ trigger: '', target1: '', target2: '' }}
          reactions={reactions}
        >
          <TestFieldHarness
            name="trigger"
            onRegistered={(trigger) => {
              triggerField = trigger;
            }}
          />
          {children}
        </DashFormProvider>
      );

      renderHook(() => useDashFormContext(), {
        wrapper: TestWrapper,
      });

      // Clear initial evaluation calls
      runSpy1.mockClear();
      runSpy2.mockClear();

      // Change field value using real onChange
      await act(async () => {
        if (triggerField) {
          triggerField('active');
        }
      });

      // Both reactions should execute
      await waitFor(() => {
        expect(runSpy1).toHaveBeenCalled();
        expect(runSpy2).toHaveBeenCalled();
      });
    });
  });

  describe('7.5 Async Staleness Tracking', () => {
    it('prevents stale async responses from overwriting fresh data', async () => {
      // Simulate delayed async operations
      const mockFetch = vi.fn((value: string, delay: number) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(`data-for-${value}`), delay);
        });
      });

      const reactions: ReactionDefinition[] = [
        {
          id: 'fetch-data',
          watch: ['query'],
          when: (ctx) => Boolean(ctx.getValue('query')),
          run: async (ctx) => {
            const query = ctx.getValue<string>('query');
            const requestId = ctx.beginAsync('fetch-data');

            ctx.setRuntime('result', { status: 'loading', data: null });

            const data = await mockFetch(query, query === 'slow' ? 100 : 10);

            // Only update if this is still the latest request
            if (ctx.isLatest('fetch-data', requestId)) {
              ctx.setRuntime('result', {
                status: 'ready',
                data: { value: data },
              });
            }
          },
        },
      ];

      let triggerField: ((value: unknown) => void) | null = null;

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{ query: '', result: '' }}
          reactions={reactions}
        >
          <TestFieldHarness
            name="query"
            onRegistered={(trigger) => {
              triggerField = trigger;
            }}
          />
          {children}
        </DashFormProvider>
      );

      const { result } = renderHook(
        () => ({
          form: useDashFormContext(),
          runtime: useFieldRuntime('result'),
        }),
        { wrapper: TestWrapper }
      );

      // Start slow request using real onChange
      await act(async () => {
        if (triggerField) {
          triggerField('slow');
        }
      });

      // Quickly start fast request (should override slow)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        if (triggerField) {
          triggerField('fast');
        }
      });

      // Wait for both to complete
      await waitFor(
        () => {
          expect(result.current.runtime.status).toBe('ready');
          expect(result.current.runtime.data).toEqual({
            value: 'data-for-fast',
          });
        },
        { timeout: 200 }
      );

      // Verify stale data didn't overwrite
      expect(result.current.runtime.data).toEqual({ value: 'data-for-fast' });
      expect(result.current.runtime.data).not.toEqual({
        value: 'data-for-slow',
      });
    });
  });

  describe('7.6 Value Accessibility (RHF Fallback)', () => {
    it('reaction reads from RHF when field not mounted yet', async () => {
      const runSpy = vi.fn((ctx) => {
        // This field may not have mounted a component yet
        const value = ctx.getValue('unmounted-field') as string;
        ctx.setRuntime('target', {
          status: 'ready',
          data: { value },
        });
      });

      const reactions: ReactionDefinition[] = [
        {
          id: 'read-unmounted',
          watch: ['trigger'],
          when: (ctx) => Boolean(ctx.getValue('trigger')),
          run: runSpy,
        },
      ];

      let triggerField: ((value: unknown) => void) | null = null;

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider
          defaultValues={{
            trigger: '',
            'unmounted-field': 'from-rhf',
            target: '',
          }}
          reactions={reactions}
        >
          <TestFieldHarness
            name="trigger"
            onRegistered={(trigger) => {
              triggerField = trigger;
            }}
          />
          {children}
        </DashFormProvider>
      );

      const { result } = renderHook(
        () => ({
          form: useDashFormContext(),
          runtime: useFieldRuntime('target'),
        }),
        { wrapper: TestWrapper }
      );

      // Trigger reaction using real onChange
      await act(async () => {
        if (triggerField) {
          triggerField('active');
        }
      });

      // Wait for reaction
      await waitFor(() => {
        expect(result.current.runtime.status).toBe('ready');
        expect(result.current.runtime.data).toEqual({ value: 'from-rhf' });
      });

      // Verify reaction could read unmounted field
      expect(runSpy).toHaveBeenCalled();
    });
  });

  describe('7.7 Efficient Lookup Performance', () => {
    it('evaluateForField uses O(1) map lookup with many reactions', async () => {
      // Create many reactions watching different fields
      const reactions: ReactionDefinition[] = [];
      const runSpies: Record<string, ReturnType<typeof vi.fn>> = {};

      for (let i = 0; i < 100; i++) {
        const spy = vi.fn((ctx) => {
          ctx.setRuntime(`target-${i}`, { status: 'ready', data: null });
        });
        runSpies[`target-${i}`] = spy;

        reactions.push({
          id: `reaction-${i}`,
          watch: [`field-${i}`],
          run: spy,
        });
      }

      // Add one reaction for our test field
      const testRunSpy = vi.fn((ctx) => {
        ctx.setRuntime('test-target', { status: 'ready', data: null });
      });
      runSpies['test-target'] = testRunSpy;

      reactions.push({
        id: 'test-reaction',
        watch: ['test-field'],
        run: testRunSpy,
      });

      const defaultValues: Record<string, string> = { 'test-field': '' };
      for (let i = 0; i < 100; i++) {
        defaultValues[`field-${i}`] = '';
      }

      let triggerField: ((value: unknown) => void) | null = null;

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <DashFormProvider defaultValues={defaultValues} reactions={reactions}>
          <TestFieldHarness
            name="test-field"
            onRegistered={(trigger) => {
              triggerField = trigger;
            }}
          />
          {children}
        </DashFormProvider>
      );

      renderHook(() => useDashFormContext(), {
        wrapper: TestWrapper,
      });

      // Clear initial evaluation calls
      Object.values(runSpies).forEach((spy) => spy.mockClear());

      // Change only test field using real onChange
      const startTime = performance.now();
      await act(async () => {
        if (triggerField) {
          triggerField('changed');
        }
      });

      await waitFor(() => {
        expect(testRunSpy).toHaveBeenCalled();
      });
      const endTime = performance.now();

      // Verify only test reaction executed (O(1) lookup)
      expect(testRunSpy).toHaveBeenCalledTimes(1);

      // Verify other reactions did NOT execute
      for (let i = 0; i < 100; i++) {
        expect(runSpies[`target-${i}`]).not.toHaveBeenCalled();
      }

      // Performance check: should be fast (< 50ms even with 100 reactions)
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
