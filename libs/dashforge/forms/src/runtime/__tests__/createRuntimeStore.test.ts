import { describe, expect, it, vi } from 'vitest';
import {
  createRuntimeStore,
  DEFAULT_FIELD_RUNTIME,
} from '../createRuntimeStore';
import type {
  SelectFieldRuntimeData,
} from '../runtime.types';

// Helper to wait for valtio's async subscription batch
const waitForValtio = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('createRuntimeStore', () => {
  describe('Store Creation', () => {
    it('creates store with default config', () => {
      const store = createRuntimeStore();

      expect(store).toBeDefined();
      expect(typeof store.getFieldRuntime).toBe('function');
      expect(typeof store.setFieldRuntime).toBe('function');
      expect(typeof store.subscribeFieldRuntime).toBe('function');
      expect(typeof store.reset).toBe('function');
      expect(typeof store.getState).toBe('function');
    });

    it('creates store with debug enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const store = createRuntimeStore({ debug: true });

      expect(store).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] Created',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('initializes with empty fields', () => {
      const store = createRuntimeStore();
      const state = store.getState();

      expect(state.fields).toEqual({});
    });
  });

  describe('Lazy Field Creation', () => {
    it('creates field on first read (getFieldRuntime)', () => {
      const store = createRuntimeStore();

      const runtime = store.getFieldRuntime('country');

      expect(runtime).toEqual(DEFAULT_FIELD_RUNTIME);

      const state = store.getState();
      expect(state.fields['country']).toBeDefined();
    });

    it('creates field on first write (setFieldRuntime)', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', { status: 'loading' });

      const state = store.getState();
      expect(state.fields['country']).toBeDefined();
      expect(state.fields['country'].status).toBe('loading');
    });

    it('returns default state for newly created field', () => {
      const store = createRuntimeStore();

      const runtime = store.getFieldRuntime('newField');

      expect(runtime).toEqual({
        status: 'idle',
        error: null,
        data: null,
      });
    });

    it('multiple calls to getFieldRuntime are idempotent', () => {
      const store = createRuntimeStore();

      const runtime1 = store.getFieldRuntime('country');
      const runtime2 = store.getFieldRuntime('country');

      expect(runtime1).toEqual(runtime2);
    });

    it('logs lazy creation in debug mode (read)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.getFieldRuntime('country');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] Lazy-created field on read',
        { name: 'country' }
      );

      consoleSpy.mockRestore();
    });

    it('logs lazy creation in debug mode (write)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.setFieldRuntime('country', { status: 'loading' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] Lazy-created field on write',
        { name: 'country' }
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Read Operations', () => {
    it('returns default state for non-existent field', () => {
      const store = createRuntimeStore();

      const runtime = store.getFieldRuntime('nonExistent');

      expect(runtime).toEqual(DEFAULT_FIELD_RUNTIME);
    });

    it('returns immutable snapshot', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', { status: 'loading' });
      const runtime = store.getFieldRuntime('country');

      // Snapshot from valtio is frozen and cannot be mutated
      expect(() => {
        (runtime as any).status = 'ready';
      }).toThrow();

      // Original should be unchanged
      const freshRuntime = store.getFieldRuntime('country');
      expect(freshRuntime.status).toBe('loading');
    });

    it('supports generic type parameter', () => {
      const store = createRuntimeStore();

      const options = [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ];

      store.setFieldRuntime<SelectFieldRuntimeData>('country', {
        status: 'ready',
        data: { options },
      });

      const runtime =
        store.getFieldRuntime<SelectFieldRuntimeData>('country');

      expect(runtime.data?.options).toEqual(options);
    });
  });

  describe('Write Operations', () => {
    it('merges partial updates', () => {
      const store = createRuntimeStore();

      // Initial write
      store.setFieldRuntime('country', { status: 'loading' });

      // Partial update
      store.setFieldRuntime('country', { error: 'Network error' });

      const runtime = store.getFieldRuntime('country');

      expect(runtime).toEqual({
        status: 'loading', // Preserved
        error: 'Network error', // Updated
        data: null, // Preserved
      });
    });

    it('preserves unspecified properties', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', {
        status: 'ready',
        data: { options: ['us', 'ca'] },
      });

      // Update only status
      store.setFieldRuntime('country', { status: 'loading' });

      const runtime = store.getFieldRuntime('country');

      expect(runtime.status).toBe('loading');
      expect(runtime.data).toEqual({ options: ['us', 'ca'] }); // Preserved
      expect(runtime.error).toBeNull(); // Preserved
    });

    it('creates field before merge if not exists', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('newField', { status: 'loading' });

      const runtime = store.getFieldRuntime('newField');

      expect(runtime).toEqual({
        status: 'loading',
        error: null,
        data: null,
      });
    });

    it('logs setFieldRuntime in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.setFieldRuntime('country', { status: 'loading' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] setFieldRuntime',
        expect.objectContaining({
          name: 'country',
          patch: { status: 'loading' },
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Subscriptions - CRITICAL: Per-Field Isolation', () => {
    it('fires listener when subscribed field changes', async () => {
      const store = createRuntimeStore();
      const listener = vi.fn();

      store.subscribeFieldRuntime('country', listener);
      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('CRITICAL: does NOT fire listener when different field changes', async () => {
      const store = createRuntimeStore();
      const countryListener = vi.fn();
      const cityListener = vi.fn();

      // Subscribe to both fields
      store.subscribeFieldRuntime('country', countryListener);
      store.subscribeFieldRuntime('city', cityListener);

      // Change country - only country listener should fire
      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(countryListener).toHaveBeenCalledTimes(1);
      expect(cityListener).toHaveBeenCalledTimes(0); // CRITICAL

      // Change city - only city listener should fire
      store.setFieldRuntime('city', { status: 'loading' });

      await waitForValtio();

      expect(countryListener).toHaveBeenCalledTimes(1); // Still 1
      expect(cityListener).toHaveBeenCalledTimes(1); // CRITICAL
    });

    it('CRITICAL: subscription isolation with multiple fields', async () => {
      const store = createRuntimeStore();
      const fieldAListener = vi.fn();
      const fieldBListener = vi.fn();
      const fieldCListener = vi.fn();

      store.subscribeFieldRuntime('fieldA', fieldAListener);
      store.subscribeFieldRuntime('fieldB', fieldBListener);
      store.subscribeFieldRuntime('fieldC', fieldCListener);

      // Update fieldB
      store.setFieldRuntime('fieldB', { status: 'loading' });

      await waitForValtio();

      // Only fieldB listener should fire
      expect(fieldAListener).toHaveBeenCalledTimes(0);
      expect(fieldBListener).toHaveBeenCalledTimes(1);
      expect(fieldCListener).toHaveBeenCalledTimes(0);
    });

    it('multiple subscribers to same field receive updates', async () => {
      const store = createRuntimeStore();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribeFieldRuntime('country', listener1);
      store.subscribeFieldRuntime('country', listener2);

      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe function stops notifications', async () => {
      const store = createRuntimeStore();
      const listener = vi.fn();

      const unsubscribe = store.subscribeFieldRuntime('country', listener);

      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.setFieldRuntime('country', { status: 'ready' });

      await waitForValtio();

      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('logs subscription in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.subscribeFieldRuntime('country', () => {});

      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] subscribeFieldRuntime',
        { name: 'country' }
      );

      consoleSpy.mockRestore();
    });

    it('logs field changes in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.subscribeFieldRuntime('country', () => {});
      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[RuntimeStore] Field changed, notifying listener',
        expect.objectContaining({
          name: 'country',
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Reset (Internal Utility)', () => {
    it('clears all fields', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', { status: 'loading' });
      store.setFieldRuntime('city', { status: 'ready' });

      const stateBefore = store.getState();
      expect(Object.keys(stateBefore.fields).length).toBe(2);

      store.reset();

      const stateAfter = store.getState();
      expect(stateAfter.fields).toEqual({});
    });

    it('clears all subscriptions on reset (subscriptions lost)', async () => {
      // NOTE: When reset() clears fields, existing subscriptions are lost
      // because the proxy objects are replaced. This is expected behavior.
      const store = createRuntimeStore();
      const countryListener = vi.fn();

      store.subscribeFieldRuntime('country', countryListener);
      store.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      expect(countryListener).toHaveBeenCalledTimes(1);
      countryListener.mockClear();

      // Reset clears fields and breaks subscriptions
      store.reset();

      // Re-creating the field won't notify old subscribers
      store.setFieldRuntime('country', { status: 'ready' });

      await waitForValtio();

      // Old listener should NOT fire (subscription was lost on reset)
      expect(countryListener).toHaveBeenCalledTimes(0);
    });

    it('logs reset in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const store = createRuntimeStore({ debug: true });

      store.reset();

      expect(consoleSpy).toHaveBeenCalledWith('[RuntimeStore] reset (manual)');

      consoleSpy.mockRestore();
    });

    it('fields can be recreated after reset (lazy)', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', { status: 'loading' });
      store.reset();

      // Should work - lazy creation
      store.setFieldRuntime('country', { status: 'ready' });

      const runtime = store.getFieldRuntime('country');
      expect(runtime.status).toBe('ready');
    });
  });

  describe('getState (Internal)', () => {
    it('returns raw Valtio proxy', () => {
      const store = createRuntimeStore();

      const state = store.getState();

      expect(state).toBeDefined();
      expect(state.fields).toBeDefined();
    });

    it('reflects current store state', () => {
      const store = createRuntimeStore();

      store.setFieldRuntime('country', { status: 'loading' });

      const state = store.getState();

      expect(state.fields['country']).toBeDefined();
      expect(state.fields['country'].status).toBe('loading');
    });
  });
});
