import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReactionRegistry } from '../createReactionRegistry';
import type {
  ReactionDefinition,
  ReactionWhenContext,
  ReactionRunContext,
} from '../reaction.types';
import { DEFAULT_FIELD_RUNTIME } from '../../runtime/createRuntimeStore';

describe('createReactionRegistry', () => {
  // Helper to create mock dependencies
  const createMockDeps = () => ({
    getValue: vi.fn((name: string) => `value-${name}` as unknown),
    getFieldRuntime: vi.fn(() => ({ ...DEFAULT_FIELD_RUNTIME, data: null })),
    setFieldRuntime: vi.fn(),
  });

  describe('6.1 Registry Creation', () => {
    it('creates registry with default config', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      expect(registry).toBeDefined();
      expect(registry.registerReactions).toBeInstanceOf(Function);
      expect(registry.evaluateAll).toBeInstanceOf(Function);
      expect(registry.evaluateForField).toBeInstanceOf(Function);
      expect(registry.hasInitialEvaluationCompleted).toBeInstanceOf(Function);
      expect(registry.getReactions).toBeInstanceOf(Function);
      expect(registry.reset).toBeInstanceOf(Function);
    });

    it('creates registry with debug enabled', () => {
      const deps = createMockDeps();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const registry = createReactionRegistry({ ...deps, debug: true });
      expect(registry).toBeDefined();

      consoleLogSpy.mockRestore();
    });

    it('registry starts empty', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      expect(registry.getReactions()).toHaveLength(0);
    });

    it('initialEvaluationCompleted starts false', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      expect(registry.hasInitialEvaluationCompleted()).toBe(false);
    });
  });

  describe('6.2 Reaction Registration (v4)', () => {
    it('registers single reaction', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          run: vi.fn(),
        },
      ];

      registry.registerReactions(reactions);

      expect(registry.getReactions()).toHaveLength(1);
      expect(registry.getReactions()[0].id).toBe('reaction-1');
    });

    it('registers multiple reactions in batch', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
        { id: 'reaction-2', watch: ['field2'], run: vi.fn() },
        { id: 'reaction-3', watch: ['field3'], run: vi.fn() },
      ];

      registry.registerReactions(reactions);

      expect(registry.getReactions()).toHaveLength(3);
    });

    it('builds watch index correctly', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
        { id: 'reaction-2', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);

      // Trigger field change evaluation
      registry.evaluateForField('field1');

      // Wait for async execution
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalledTimes(2);
    });

    it('handles reactions with multiple watch fields', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1', 'field2', 'field3'], run: runSpy },
      ];

      registry.registerReactions(reactions);

      // Trigger each field
      registry.evaluateForField('field1');
      registry.evaluateForField('field2');
      registry.evaluateForField('field3');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalledTimes(3);
    });

    it('getReactions returns all registered reactions', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
        { id: 'reaction-2', watch: ['field2'], run: vi.fn() },
      ];

      registry.registerReactions(reactions);

      const result = registry.getReactions();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('reaction-1');
      expect(result[1].id).toBe('reaction-2');
    });

    it('throws error on duplicate reaction IDs (v4)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        { id: 'duplicate-id', watch: ['field1'], run: vi.fn() },
        { id: 'duplicate-id', watch: ['field2'], run: vi.fn() },
      ];

      expect(() => {
        registry.registerReactions(reactions);
      }).toThrow(/Duplicate reaction ID detected: "duplicate-id"/);
    });

    it('second registerReactions call is no-op (v4)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const firstBatch: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
      ];

      const secondBatch: ReactionDefinition[] = [
        { id: 'reaction-2', watch: ['field2'], run: vi.fn() },
      ];

      registry.registerReactions(firstBatch);
      registry.registerReactions(secondBatch); // Should be no-op

      const allReactions = registry.getReactions();
      expect(allReactions).toHaveLength(1);
      expect(allReactions[0].id).toBe('reaction-1');
    });

    it('second registerReactions logs warning in debug mode (v4)', () => {
      const deps = createMockDeps();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const registry = createReactionRegistry({ ...deps, debug: true });

      const firstBatch: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
      ];
      const secondBatch: ReactionDefinition[] = [
        { id: 'reaction-2', watch: ['field2'], run: vi.fn() },
      ];

      registry.registerReactions(firstBatch);
      registry.registerReactions(secondBatch);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('registerReactions called after initial registration')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('6.3 When Condition Evaluation', () => {
    it('executes run when condition is true', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('truthy-value');
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: (ctx: ReactionWhenContext) => Boolean(ctx.getValue('field1')),
          run: runSpy,
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('skips run when condition is false', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('');
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: (ctx: ReactionWhenContext) => Boolean(ctx.getValue('field1')),
          run: runSpy,
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).not.toHaveBeenCalled();
    });

    it('executes run when condition is omitted (always true)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          run: runSpy,
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('when context provides getValue access', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('test-value');
      const registry = createReactionRegistry({ ...deps });

      const whenSpy = vi.fn((ctx) => {
        const value = ctx.getValue('field1');
        return value === 'test-value';
      });

      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: whenSpy,
          run: vi.fn(),
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(whenSpy).toHaveBeenCalled();
      expect(deps.getValue).toHaveBeenCalledWith('field1');
    });

    it('when condition can read multiple fields', async () => {
      const deps = createMockDeps();
      deps.getValue.mockImplementation((name: string) => {
        return name === 'field1' ? 'value1' : 'value2';
      });

      const registry = createReactionRegistry({ ...deps });

      const whenSpy = vi.fn((ctx) => {
        const val1 = ctx.getValue('field1');
        const val2 = ctx.getValue('field2');
        return val1 === 'value1' && val2 === 'value2';
      });

      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: whenSpy,
          run: vi.fn(),
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(whenSpy).toHaveBeenCalled();
    });
  });

  describe('6.4 Run Execution', () => {
    it('executes sync run handler', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('executes async run handler (awaits completion)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(runSpy).toHaveBeenCalled();
    });

    it('run context provides getValue', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('test-value');
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const value = ctx.getValue('field1');
        expect(value).toBe('test-value');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('run context provides getRuntime', async () => {
      const deps = createMockDeps();
      const mockRuntime = { ...DEFAULT_FIELD_RUNTIME, status: 'loading' as const, data: null };
      deps.getFieldRuntime.mockReturnValue(mockRuntime);
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const runtime = ctx.getRuntime('field1');
        expect(runtime.status).toBe('loading');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('run context provides setRuntime', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        ctx.setRuntime('field1', { status: 'loading' });
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(deps.setFieldRuntime).toHaveBeenCalledWith('field1', { status: 'loading' });
    });

    it('multiple reactions can watch same field (all execute, async)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy1 = vi.fn();
      const runSpy2 = vi.fn();
      const runSpy3 = vi.fn();

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy1 },
        { id: 'reaction-2', watch: ['field1'], run: runSpy2 },
        { id: 'reaction-3', watch: ['field1'], run: runSpy3 },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy1).toHaveBeenCalled();
      expect(runSpy2).toHaveBeenCalled();
      expect(runSpy3).toHaveBeenCalled();
    });
  });

  describe('6.5 Async Staleness Tracking', () => {
    it('beginAsync returns incrementing request IDs', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      let requestId1: number | undefined;
      let requestId2: number | undefined;
      let requestId3: number | undefined;

      const runSpy = vi.fn((ctx) => {
        if (!requestId1) {
          requestId1 = ctx.beginAsync('test-key');
        } else if (!requestId2) {
          requestId2 = ctx.beginAsync('test-key');
        } else {
          requestId3 = ctx.beginAsync('test-key');
        }
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);

      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 0));
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 0));
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(requestId1).toBe(1);
      expect(requestId2).toBe(2);
      expect(requestId3).toBe(3);
    });

    it('isLatest returns true for latest request', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      let isLatest = false;

      const runSpy = vi.fn((ctx) => {
        const requestId = ctx.beginAsync('test-key');
        isLatest = ctx.isLatest('test-key', requestId);
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(isLatest).toBe(true);
    });

    it('isLatest returns false for stale request', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      let firstRequestId: number | undefined;
      let isFirstLatest = false;

      const runSpy = vi.fn((ctx) => {
        if (!firstRequestId) {
          firstRequestId = ctx.beginAsync('test-key');
        } else {
          // Trigger second request
          ctx.beginAsync('test-key');
          // Check if first is latest
          isFirstLatest = ctx.isLatest('test-key', firstRequestId);
        }
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 0));
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(isFirstLatest).toBe(false);
    });

    it('multiple async operations tracked separately by key', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const id1 = ctx.beginAsync('key1');
        const id2 = ctx.beginAsync('key2');
        const id3 = ctx.beginAsync('key1'); // Same key as first

        expect(id1).toBe(1);
        expect(id2).toBe(1);
        expect(id3).toBe(2);

        expect(ctx.isLatest('key1', id1)).toBe(false);
        expect(ctx.isLatest('key1', id3)).toBe(true);
        expect(ctx.isLatest('key2', id2)).toBe(true);
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('async staleness prevents stale data overwrites', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const results: string[] = [];

      const runSpy = vi.fn(async (ctx) => {
        const requestId = ctx.beginAsync('fetch-data');

        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, requestId === 1 ? 20 : 10));

        // Only apply if latest
        if (ctx.isLatest('fetch-data', requestId)) {
          results.push(`result-${requestId}`);
        }
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);

      // Trigger first request (slower)
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Trigger second request (faster)
      registry.evaluateForField('field1');
      await new Promise((resolve) => setTimeout(resolve, 30));

      // Only second result should be applied
      expect(results).toEqual(['result-2']);
    });
  });

  describe('6.6 Field Change Evaluation', () => {
    it('evaluateForField executes matching reactions', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('evaluateForField ignores non-watched fields', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field2'); // Different field

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).not.toHaveBeenCalled();
    });

    it('evaluateForField handles field with no watchers (no-op)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      registry.registerReactions([]);

      // Should not throw
      expect(() => {
        registry.evaluateForField('non-existent-field');
      }).not.toThrow();
    });

    it('evaluateForField respects when conditions', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('');
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: (ctx: ReactionWhenContext) => Boolean(ctx.getValue('field1')),
          run: runSpy,
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('6.7 Initial Evaluation (with Strict Mode Protection - v3)', () => {
    it('evaluateAll executes all reactions', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy1 = vi.fn();
      const runSpy2 = vi.fn();
      const runSpy3 = vi.fn();

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy1 },
        { id: 'reaction-2', watch: ['field2'], run: runSpy2 },
        { id: 'reaction-3', watch: ['field3'], run: runSpy3 },
      ];

      registry.registerReactions(reactions);
      registry.evaluateAll();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy1).toHaveBeenCalled();
      expect(runSpy2).toHaveBeenCalled();
      expect(runSpy3).toHaveBeenCalled();
    });

    it('evaluateAll respects when conditions', async () => {
      const deps = createMockDeps();
      deps.getValue.mockImplementation((name: string) => {
        return name === 'field1' ? 'truthy' : '';
      });

      const registry = createReactionRegistry({ ...deps });

      const runSpy1 = vi.fn();
      const runSpy2 = vi.fn();

      const reactions: ReactionDefinition[] = [
        {
          id: 'reaction-1',
          watch: ['field1'],
          when: (ctx: ReactionWhenContext) => Boolean(ctx.getValue('field1')),
          run: runSpy1,
        },
        {
          id: 'reaction-2',
          watch: ['field2'],
          when: (ctx: ReactionWhenContext) => Boolean(ctx.getValue('field2')),
          run: runSpy2,
        },
      ];

      registry.registerReactions(reactions);
      registry.evaluateAll();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy1).toHaveBeenCalled();
      expect(runSpy2).not.toHaveBeenCalled();
    });

    it('evaluateAll works with empty registry (no-op)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      registry.registerReactions([]);

      // Should not throw
      expect(() => {
        registry.evaluateAll();
      }).not.toThrow();
    });

    it('evaluateAll sets initialEvaluationCompleted flag', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
      ];

      registry.registerReactions(reactions);

      expect(registry.hasInitialEvaluationCompleted()).toBe(false);

      registry.evaluateAll();

      expect(registry.hasInitialEvaluationCompleted()).toBe(true);
    });

    it('evaluateAll called twice is no-op (Strict Mode protection)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn();
      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);

      registry.evaluateAll();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Second call should be no-op
      registry.evaluateAll();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should only execute once
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it('hasInitialEvaluationCompleted returns correct state', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      expect(registry.hasInitialEvaluationCompleted()).toBe(false);

      registry.evaluateAll();

      expect(registry.hasInitialEvaluationCompleted()).toBe(true);
    });
  });

  describe('6.8 Error Handling', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('reaction error does not crash registry', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const errorReaction = vi.fn(() => {
        throw new Error('Test error');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'error-reaction', watch: ['field1'], run: errorReaction },
      ];

      registry.registerReactions(reactions);

      // Should not throw
      expect(() => {
        registry.evaluateForField('field1');
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(errorReaction).toHaveBeenCalled();
    });

    it('reaction error is logged (console.error)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const errorReaction = vi.fn(() => {
        throw new Error('Test error');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'error-reaction', watch: ['field1'], run: errorReaction },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Run failed'),
        expect.objectContaining({
          id: 'error-reaction',
        })
      );
    });

    it('other reactions continue after one fails', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const errorReaction = vi.fn(() => {
        throw new Error('Test error');
      });
      const successReaction = vi.fn();

      const reactions: ReactionDefinition[] = [
        { id: 'error-reaction', watch: ['field1'], run: errorReaction },
        { id: 'success-reaction', watch: ['field1'], run: successReaction },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(errorReaction).toHaveBeenCalled();
      expect(successReaction).toHaveBeenCalled();
    });
  });

  describe('6.9 Edge Cases', () => {
    it('empty reactions array (safe no-op)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      expect(() => {
        registry.registerReactions([]);
      }).not.toThrow();

      expect(registry.getReactions()).toHaveLength(0);
    });

    it('reaction watches non-existent field (no crash)', async () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const value = ctx.getValue('non-existent-field');
        expect(value).toBeDefined(); // Should return mock value
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['non-existent-field'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('non-existent-field');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('getValue returns undefined for missing field', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue(undefined);
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx: ReactionRunContext) => {
        const value = ctx.getValue('missing-field');
        expect(value).toBeUndefined();
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });

    it('reset clears all state including completion flag and reactionById map (v4)', () => {
      const deps = createMockDeps();
      const registry = createReactionRegistry({ ...deps });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: vi.fn() },
      ];

      registry.registerReactions(reactions);
      registry.evaluateAll();

      expect(registry.getReactions()).toHaveLength(1);
      expect(registry.hasInitialEvaluationCompleted()).toBe(true);

      registry.reset();

      expect(registry.getReactions()).toHaveLength(0);
      expect(registry.hasInitialEvaluationCompleted()).toBe(false);
    });
  });

  describe('6.10 Value Semantics', () => {
    it('getValue reads from injected function', async () => {
      const deps = createMockDeps();
      deps.getValue.mockReturnValue('injected-value');
      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const value = ctx.getValue('field1');
        expect(value).toBe('injected-value');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateForField('field1');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(deps.getValue).toHaveBeenCalledWith('field1');
      expect(runSpy).toHaveBeenCalled();
    });

    it('reactions work with value-driven semantics', async () => {
      const deps = createMockDeps();
      // Simulate Engine first, RHF fallback pattern
      deps.getValue.mockImplementation((name: string) => {
        // This would be: engine.getNode(name)?.value ?? rhf.getValues(name)
        return `value-from-rhf-${name}`;
      });

      const registry = createReactionRegistry({ ...deps });

      const runSpy = vi.fn((ctx) => {
        const value = ctx.getValue('field1');
        expect(value).toBe('value-from-rhf-field1');
      });

      const reactions: ReactionDefinition[] = [
        { id: 'reaction-1', watch: ['field1'], run: runSpy },
      ];

      registry.registerReactions(reactions);
      registry.evaluateAll();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(runSpy).toHaveBeenCalled();
    });
  });
});
