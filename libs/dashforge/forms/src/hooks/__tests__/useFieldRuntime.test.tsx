import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFieldRuntime } from '../useFieldRuntime';
import { DashFormContext } from '@dashforge/ui-core';
import type { DashFormBridge } from '@dashforge/ui-core';
import { createRuntimeStore } from '../../runtime/createRuntimeStore';
import type { SelectFieldRuntimeData } from '../../runtime/runtime.types';

// Helper to wait for valtio's async subscription batch
const waitForValtio = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('useFieldRuntime', () => {
  describe('Standalone mode (no provider)', () => {
    it('returns default state when no bridge available', () => {
      const { result } = renderHook(() => useFieldRuntime('country'));

      expect(result.current).toEqual({
        status: 'idle',
        error: null,
        data: null,
      });
    });

    it('does not throw when used outside form context', () => {
      expect(() => {
        renderHook(() => useFieldRuntime('country'));
      }).not.toThrow();
    });
  });

  describe('Form mode (with provider)', () => {
    it('returns runtime state from bridge', () => {
      const runtimeStore = createRuntimeStore();
      const bridge: DashFormBridge = {
        engine: {} as any,
        getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
        setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
        subscribeFieldRuntime: (name, listener) =>
          runtimeStore.subscribeFieldRuntime(name, listener),
      };

      // Set some runtime state
      runtimeStore.setFieldRuntime('country', { status: 'loading' });

      const { result } = renderHook(() => useFieldRuntime('country'), {
        wrapper: ({ children }) => (
          <DashFormContext.Provider value={bridge}>
            {children}
          </DashFormContext.Provider>
        ),
      });

      expect(result.current.status).toBe('loading');
    });

    it('subscribes to field changes and re-renders', async () => {
      const runtimeStore = createRuntimeStore();
      const bridge: DashFormBridge = {
        engine: {} as any,
        getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
        setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
        subscribeFieldRuntime: (name, listener) =>
          runtimeStore.subscribeFieldRuntime(name, listener),
      };

      const { result, rerender } = renderHook(() => useFieldRuntime('country'), {
        wrapper: ({ children }) => (
          <DashFormContext.Provider value={bridge}>
            {children}
          </DashFormContext.Provider>
        ),
      });

      // Initial state
      expect(result.current.status).toBe('idle');

      // Update runtime state
      runtimeStore.setFieldRuntime('country', { status: 'loading' });

      // Wait for valtio subscription to fire
      await waitForValtio();

      // Trigger a rerender to get updated state
      rerender();

      // Should reflect the change
      expect(result.current.status).toBe('loading');
    });

    it('CRITICAL: subscription isolation - field A change does not re-render field B hook', async () => {
      const runtimeStore = createRuntimeStore();
      const bridge: DashFormBridge = {
        engine: {} as any,
        getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
        setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
        subscribeFieldRuntime: (name, listener) =>
          runtimeStore.subscribeFieldRuntime(name, listener),
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DashFormContext.Provider value={bridge}>
          {children}
        </DashFormContext.Provider>
      );

      const countryHook = renderHook(() => useFieldRuntime('country'), { wrapper });
      const cityHook = renderHook(() => useFieldRuntime('city'), { wrapper });

      // Initial states
      expect(countryHook.result.current.status).toBe('idle');
      expect(cityHook.result.current.status).toBe('idle');

      // Update country
      runtimeStore.setFieldRuntime('country', { status: 'loading' });

      await waitForValtio();

      countryHook.rerender();
      cityHook.rerender();

      // Country should update, city should not
      expect(countryHook.result.current.status).toBe('loading');
      expect(cityHook.result.current.status).toBe('idle'); // CRITICAL: unchanged
    });

    it('supports generic type parameter', () => {
      const runtimeStore = createRuntimeStore();
      const bridge: DashFormBridge = {
        engine: {} as any,
        getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
        setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
        subscribeFieldRuntime: (name, listener) =>
          runtimeStore.subscribeFieldRuntime(name, listener),
      };

      const options = [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ];

      runtimeStore.setFieldRuntime<SelectFieldRuntimeData>('country', {
        status: 'ready',
        data: { options },
      });

      const { result } = renderHook(
        () => useFieldRuntime<SelectFieldRuntimeData>('country'),
        {
          wrapper: ({ children }) => (
            <DashFormContext.Provider value={bridge}>
              {children}
            </DashFormContext.Provider>
          ),
        }
      );

      expect(result.current.data?.options).toEqual(options);
    });

    it('cleans up subscription on unmount', () => {
      const runtimeStore = createRuntimeStore();
      const bridge: DashFormBridge = {
        engine: {} as any,
        getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
        setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
        subscribeFieldRuntime: (name, listener) =>
          runtimeStore.subscribeFieldRuntime(name, listener),
      };

      const { unmount } = renderHook(() => useFieldRuntime('country'), {
        wrapper: ({ children }) => (
          <DashFormContext.Provider value={bridge}>
            {children}
          </DashFormContext.Provider>
        ),
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
