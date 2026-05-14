import { createContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type {
  FieldValues,
  DefaultValues,
  FieldPath,
  PathValue,
  RegisterOptions,
} from 'react-hook-form';
import { createEngine, DashFormContext } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  BridgeFieldError,
  FieldRegistration,
} from '@dashforge/ui-core';
import type { DashFormContextValue, DashFormProviderProps } from './form.types';
import { FormEngineAdapter } from './FormEngineAdapter';
import { createRuntimeStore } from '../runtime/createRuntimeStore';
import type { FieldRuntimeState } from '../runtime/runtime.types';
import { createReactionRegistry } from '../reactions/createReactionRegistry';

/**
 * Helper to safely traverse an object by dot path.
 * Returns the value at the path, or null if not found.
 *
 * @param obj - Object to traverse
 * @param path - Dot-separated path (e.g., "dependent.group0")
 * @returns Value at path or null
 */
function getByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Internal context for @dashforge/forms package use only.
 * Contains full RHF methods and adapter.
 * NOT exported from package.
 */
export const InternalDashFormContext =
  createContext<DashFormContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  InternalDashFormContext.displayName = 'InternalDashFormContext';
}

/**
 * Provider component that sets up form infrastructure.
 *
 * **Responsibilities:**
 * - Creates or uses provided Engine instance
 * - Initializes React Hook Form with useForm
 * - Creates FormEngineAdapter to bridge RHF and Engine
 * - Provides context value to children
 *
 * **Phase 0 Implementation:**
 * - All infrastructure is set up correctly
 * - Adapter methods are stubs (no actual sync)
 * - Proper memoization to prevent unnecessary re-renders
 *
 * @template TFieldValues - Form field values type
 *
 * @example
 * ```tsx
 * // With auto-created engine
 * <DashFormProvider defaultValues={{ name: '' }}>
 *   <MyFormFields />
 * </DashFormProvider>
 *
 * // With provided engine
 * const engine = createEngine();
 * <DashFormProvider engine={engine} defaultValues={{ name: '' }}>
 *   <MyFormFields />
 * </DashFormProvider>
 * ```
 */
export function DashFormProvider<
  TFieldValues extends FieldValues = FieldValues
>({
  children,
  engine: externalEngine,
  defaultValues,
  debug = false,
  mode = 'onChange',
  reactions,
  resolver,
}: DashFormProviderProps<TFieldValues>) {
  // Create or use provided Engine instance
  // Memoized to prevent re-creation on every render
  const engine = useMemo(() => {
    if (externalEngine) {
      if (debug) {
        console.log('[DashFormProvider] Using provided Engine', externalEngine);
      }
      return externalEngine;
    }

    // Create engine with debug flag aligned to form debug
    const newEngine = createEngine({ debug });
    if (debug) {
      console.log('[DashFormProvider] Created new Engine', newEngine);
    }
    return newEngine;
  }, [externalEngine, debug]);

  // Initialize React Hook Form
  // Skip in SSR/SSG to avoid "Cannot read properties of null (reading 'useRef')" error
  const isClient = typeof window !== 'undefined';
  const rhf = isClient ? useForm<TFieldValues>({
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
    mode,
    resolver,
  }) : ({
    // SSR mock - minimal API to prevent errors
    register: () => ({}),
    unregister: () => {},
    watch: () => defaultValues ?? {},
    handleSubmit: (cb: any) => async () => {},
    reset: () => {},
    formState: {
      errors: {},
      touchedFields: {},
      dirtyFields: {},
      submitCount: 0,
      isSubmitting: false,
      isValidating: false,
      isDirty: false,
      isValid: true,
    },
    control: {} as any,
    getValues: () => defaultValues ?? {},
    setValue: () => {},
    getFieldState: () => ({
      isDirty: false,
      isTouched: false,
      invalid: false,
      error: undefined,
    }),
    clearErrors: () => {},
    setError: () => {},
    setFocus: () => {},
    trigger: async () => true,
  }) as any;

  // Subscribe to formState fields to ensure reactivity
  const errors = rhf.formState.errors;
  const touchedFields = rhf.formState.touchedFields;
  const dirtyFields = rhf.formState.dirtyFields;
  const submitCount = rhf.formState.submitCount;

  // Watch all form values to keep this component subscribed to RHF state.
  // Even though we no longer expose a valuesVersion string on the bridge
  // (removed in 0.2.0-beta), we still need rhf.watch() here so the provider
  // re-renders when values change, which in turn drives the per-field
  // notification effects below.
  rhf.watch();

  // Create adapter instance
  // Memoized to maintain stable reference across renders
  const adapter = useMemo(() => {
    const adapterInstance = new FormEngineAdapter(engine, rhf, { debug });

    if (debug) {
      console.log(
        '[DashFormProvider] Created FormEngineAdapter',
        adapterInstance
      );
    }

    return adapterInstance;
  }, [engine, rhf, debug]);

  // === Per-field subscription system =========================================
  // Map<fieldName, Set<listener>>. Listeners are notified ONLY when their
  // specific field's state changes (value/error/touched/dirty), enabling
  // isolated re-renders in UI components that pair this with
  // useSyncExternalStore. Replaces the legacy "void bridge?.errorVersion"
  // global subscribe trick that re-rendered every consumer on every keystroke.
  // ==========================================================================
  const fieldListenersRef = useRef<Map<string, Set<() => void>>>(new Map());

  const notifyField = useCallback((name: string) => {
    const listeners = fieldListenersRef.current.get(name);
    if (!listeners) return;
    listeners.forEach((listener) => listener());
  }, []);

  const subscribeField = useCallback(
    (name: string, listener: () => void): (() => void) => {
      let listeners = fieldListenersRef.current.get(name);
      if (!listeners) {
        listeners = new Set();
        fieldListenersRef.current.set(name, listeners);
      }
      listeners.add(listener);
      return () => {
        const current = fieldListenersRef.current.get(name);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) {
          fieldListenersRef.current.delete(name);
        }
      };
    },
    []
  );

  // Wire adapter value-sync to per-field notifier: when RHF→Engine sync
  // happens for a field, notify only that field's listeners.
  useEffect(() => {
    return adapter.addOnValueSyncListener((fieldName) => {
      notifyField(fieldName);
    });
  }, [adapter, notifyField]);

  // Diff RHF formState changes (errors/touched/dirty) to identify which
  // fields actually changed and notify only those listeners. This avoids
  // a global broadcast on every keystroke.
  const prevErrorsRef = useRef<Record<string, unknown>>({});
  const prevTouchedRef = useRef<Record<string, unknown>>({});
  const prevDirtyRef = useRef<Record<string, unknown>>({});

  const diffAndNotify = useCallback(
    (
      ref: React.MutableRefObject<Record<string, unknown>>,
      current: Record<string, unknown> | undefined
    ) => {
      const prev = ref.current ?? {};
      const next = current ?? {};
      const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      for (const key of allKeys) {
        // Cheap shallow compare (object identity changes when RHF mutates)
        if (prev[key] !== next[key]) {
          notifyField(key);
        }
      }
      ref.current = next;
    },
    [notifyField]
  );

  // NEW: Create runtime store (PROVIDER OWNS IT)
  // Memoized to maintain stable reference across renders
  const runtimeStore = useMemo(() => {
    const store = createRuntimeStore({ debug });

    if (debug) {
      console.log('[DashFormProvider] Created RuntimeStore', store);
    }

    return store;
  }, [debug]);

  // NEW: Create reaction registry (PROVIDER OWNS IT)
  // Registry created once per unique reactions array
  // registerReactions() called once during creation
  const reactionRegistry = useMemo(() => {
    if (!reactions || reactions.length === 0) {
      if (debug) {
        console.log('[DashFormProvider] No reactions to register');
      }
      return null;
    }

    const registry = createReactionRegistry<TFieldValues>({
      debug,
      // Inject dependencies for testability
      getValue: (name: string) => {
        // VALUE SEMANTICS: Engine first (if node exists), RHF fallback (always available)
        // This decouples reactions from component mount lifecycle
        const node = engine.getNode(name);
        if (node) return node.value;
        return rhf.getValues(name as FieldPath<TFieldValues>);
      },
      getFieldRuntime: (name: string) => runtimeStore.getFieldRuntime(name),
      setFieldRuntime: <TData = unknown>(
        name: string,
        patch: Partial<FieldRuntimeState<TData>>
      ) => runtimeStore.setFieldRuntime(name, patch),
    });

    // Register all reactions ONCE (v4 - one-shot registration)
    // Duplicate IDs will throw error here (fail-fast)
    registry.registerReactions(reactions);

    if (debug) {
      console.log('[DashFormProvider] Created ReactionRegistry', {
        reactionCount: reactions.length,
        note:
          'Reactions registered once, initial evaluation will run in useEffect (Strict Mode safe)',
      });
    }

    return registry;
  }, [reactions, debug, engine, rhf, runtimeStore]);

  // Run diff-and-notify after every render (when RHF formState changes).
  // RHF re-creates the errors/touchedFields/dirtyFields object references on
  // every relevant state change, so depending directly on those objects is
  // sufficient (pre-0.2.0-beta we depended on stringified version snapshots
  // for the same effect — the version strings were removed when the
  // deprecated `*Version` bridge properties were dropped).
  useEffect(() => {
    diffAndNotify(
      prevErrorsRef,
      errors as Record<string, unknown> | undefined
    );
  }, [errors, diffAndNotify]);

  useEffect(() => {
    diffAndNotify(
      prevTouchedRef,
      touchedFields as Record<string, unknown> | undefined
    );
  }, [touchedFields, diffAndNotify]);

  useEffect(() => {
    diffAndNotify(
      prevDirtyRef,
      dirtyFields as Record<string, unknown> | undefined
    );
  }, [dirtyFields, diffAndNotify]);

  // Stable refs that always point at the latest formState values. The bridge
  // closures read from these refs so they can return current data even though
  // the bridge object identity itself stays stable (no re-render cascades).
  const errorsRef = useRef(errors);
  errorsRef.current = errors;
  const touchedFieldsRef = useRef(touchedFields);
  touchedFieldsRef.current = touchedFields;
  const dirtyFieldsRef = useRef(dirtyFields);
  dirtyFieldsRef.current = dirtyFields;
  const submitCountRef = useRef(submitCount);
  submitCountRef.current = submitCount;

  // Build bridge value for public DashFormContext (minimal API)
  // Used by ui components to detect and integrate with form
  const bridgeValue = useMemo<DashFormBridge>(
    () => ({
      engine,

      // NEW: Expose CONTROLLED runtime APIs (NOT raw store)
      // Read API (safe for UI consumption)
      getFieldRuntime: (name: string) => runtimeStore.getFieldRuntime(name),

      // Write API (orchestration only - NOT for UI)
      setFieldRuntime: <TData = unknown>(
        name: string,
        patch: Partial<import('../runtime/runtime.types').FieldRuntimeState<TData>>
      ) => runtimeStore.setFieldRuntime(name, patch),

      // Subscribe API (wrapped by useFieldRuntime)
      subscribeFieldRuntime: (name: string, listener: () => void) =>
        runtimeStore.subscribeFieldRuntime(name, listener),

      register: (name: string, rules?: unknown) => {
        const fieldName = name as FieldPath<TFieldValues>;

        // Type rules as RegisterOptions for RHF compatibility
        // Bridge accepts unknown (library-agnostic), we narrow here at RHF boundary
        const typedRules = rules as
          | RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
          | undefined;
        const rhfRegister = rhf.register(fieldName, typedRules);

        // Register field with adapter (creates Engine node)
        adapter.registerField(fieldName);

        // Wrap onChange to sync to Engine
        const originalOnChange = rhfRegister.onChange;
        const wrappedOnChange = async (event: unknown) => {
          // RHF expects { target: unknown; type?: unknown } but components pass various event shapes
          // We narrow unknown to the shape RHF expects using a type guard
          const isEventLike = (
            e: unknown
          ): e is { target: unknown; type?: unknown } => {
            return e !== null && typeof e === 'object' && 'target' in e;
          };
          const rhfEvent = isEventLike(event) ? event : { target: event };

          // Call original RHF onChange first
          const result = await originalOnChange(rhfEvent);

          // Extract value from event for Engine sync
          let value: unknown;
          if (
            event &&
            typeof event === 'object' &&
            'target' in event &&
            event.target &&
            typeof event.target === 'object' &&
            'value' in event.target
          ) {
            value = (event.target as { value: unknown }).value;
          } else {
            value = event;
          }

          // Sync value to Engine
          adapter.syncValueToEngine(fieldName, value);

          return result;
        };

        // Return registration with wrapped onChange
        // Type as FieldRegistration (bridge contract) which extends RHF registration
        return {
          ...rhfRegister,
          onChange: wrappedOnChange,
        } as FieldRegistration;
      },
      unregister: (name: string) => {
        const fieldName = name as FieldPath<TFieldValues>;
        // Release RHF state and engine node so reactions stop firing for this field
        rhf.unregister(fieldName);
        adapter.unregisterField(fieldName);
      },
      // Per-field subscription (granular re-render path)
      subscribeField,
      getError: (name: string): BridgeFieldError | null => {
        const err = getByPath(errorsRef.current, name);

        // Check if error has a message property
        if (err && typeof err === 'object' && 'message' in err) {
          const msg = (err as { message: unknown }).message;
          if (typeof msg === 'string') {
            return { message: msg };
          }
        }

        return null;
      },
      isTouched: (name: string): boolean => {
        const touched = getByPath(touchedFieldsRef.current, name);
        return Boolean(touched);
      },
      isDirty: (name: string): boolean => {
        const dirty = getByPath(dirtyFieldsRef.current, name);
        return Boolean(dirty);
      },
      get submitCount() {
        return submitCountRef.current;
      },
      setValue: (name: string, value: unknown) => {
        rhf.setValue(
          name as FieldPath<TFieldValues>,
          value as PathValue<TFieldValues, FieldPath<TFieldValues>>
        );
      },
      getValue: (name: string) => {
        return rhf.getValues(name as FieldPath<TFieldValues>);
      },
      debug,
    }),
    // Identity-stable bridge: deps include only the long-lived references.
    // Removing the version strings from this list is the core of the
    // re-render optimization — the bridge no longer changes on every
    // keystroke, and consumers must use subscribeField/useDashFieldMeta to
    // observe per-field state changes.
    [engine, runtimeStore, rhf, adapter, debug, subscribeField]
  );

  // Build internal context value for @dashforge/forms hooks
  // Contains full RHF methods and adapter
  // Memoized to prevent unnecessary re-renders of consumers
  const internalContextValue = useMemo<DashFormContextValue<TFieldValues>>(
    () => ({
      engine,
      rhf,
      adapter,
      debug,
    }),
    [engine, rhf, adapter, debug]
  );

  // NEW: Initial evaluation cycle (Strict Mode safe - v3)
  // TIMING: Runs after mount, when RHF defaultValues available
  // VALUES: Available via Engine (if registered) or RHF (always available)
  // PROTECTION: Registry flag prevents double execution in Strict Mode
  useEffect(() => {
    if (!reactionRegistry) return;

    // CRITICAL: Check completion flag (Strict Mode re-entry protection - v3)
    if (reactionRegistry.hasInitialEvaluationCompleted()) {
      if (debug) {
        console.log(
          '[DashFormProvider] Initial evaluation already completed (Strict Mode re-entry), skipping'
        );
      }
      return;
    }

    if (debug) {
      console.log('[DashFormProvider] Running initial evaluation cycle', {
        timing: 'useEffect after mount',
        valueSource: 'Engine (if node exists) or RHF (always available)',
        guarantee: 'RHF defaultValues available immediately',
        note:
          'Value-driven, not mount-driven - decoupled from UI lifecycle',
        protection: 'Registry flag prevents double execution',
      });
    }

    // Execute initial evaluation ONCE per registry instance
    // Values available via:
    // - Engine nodes (if fields mounted and registered)
    // - RHF defaultValues (always available, fallback)
    // Flag prevents re-execution in Strict Mode
    reactionRegistry.evaluateAll();

    if (debug) {
      console.log(
        '[DashFormProvider] Initial evaluation triggered (async reactions may still be executing)'
      );
    }
  }, [reactionRegistry, debug]);

  // NEW: Subscribe to adapter value sync for incremental evaluation
  useEffect(() => {
    if (!reactionRegistry) return;

    if (debug) {
      console.log(
        '[DashFormProvider] Subscribing to adapter for reaction evaluation'
      );
    }

    const unsubscribe = adapter.addOnValueSyncListener((fieldName) => {
      if (debug) {
        console.log('[DashFormProvider] Field synced, evaluating reactions', {
          fieldName,
        });
      }

      // v4: O(1) watch index lookup + O(1) per reaction via reactionById map
      reactionRegistry.evaluateForField(fieldName);
    });

    return () => {
      if (debug) {
        console.log('[DashFormProvider] Unsubscribing from adapter');
      }
      unsubscribe();
    };
  }, [reactionRegistry, adapter, debug]);

  // Wrap with dual contexts:
  // - DashFormContext provides minimal bridge API for ui components
  // - InternalDashFormContext provides full RHF access for forms hooks
  return (
    <DashFormContext.Provider value={bridgeValue}>
      <InternalDashFormContext.Provider
        value={internalContextValue as DashFormContextValue}
      >
        {children}
      </InternalDashFormContext.Provider>
    </DashFormContext.Provider>
  );
}
