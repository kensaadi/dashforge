import { createContext, useMemo, useEffect } from 'react';
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
  const rhf = useForm<TFieldValues>({
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
    mode,
  });

  // Subscribe to formState fields to ensure reactivity
  const errors = rhf.formState.errors;
  const touchedFields = rhf.formState.touchedFields;
  const dirtyFields = rhf.formState.dirtyFields;
  const submitCount = rhf.formState.submitCount;

  // Watch all form values to ensure reactivity when values change
  const values = rhf.watch();

  // Safe replacer function to avoid circular structure errors from HTMLElement refs
  const replacer = (key: string, value: unknown) => {
    if (key === 'ref') return undefined;
    if (typeof value === 'function') return undefined;
    return value;
  };

  // Derive version strings synchronously from formState
  // Changes whenever RHF re-renders with new state, triggering consumer re-renders
  const errorVersion = JSON.stringify(errors ?? {}, replacer);
  const touchedVersion = JSON.stringify(touchedFields ?? {}, replacer);
  const dirtyVersion = JSON.stringify(dirtyFields ?? {}, replacer);
  const valuesVersion = JSON.stringify(values ?? {}, replacer);

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
      getError: (name: string): BridgeFieldError | null => {
        const err = getByPath(errors, name);

        // Check if error has a message property
        if (err && typeof err === 'object' && 'message' in err) {
          const msg = (err as { message: unknown }).message;
          if (typeof msg === 'string') {
            return { message: msg };
          }
        }

        return null;
      },
      errorVersion,
      isTouched: (name: string): boolean => {
        const touched = getByPath(touchedFields, name);
        return Boolean(touched);
      },
      isDirty: (name: string): boolean => {
        const dirty = getByPath(dirtyFields, name);
        return Boolean(dirty);
      },
      touchedVersion,
      dirtyVersion,
      valuesVersion,
      submitCount,
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
    [
      engine,
      runtimeStore,
      rhf,
      adapter,
      debug,
      errorVersion,
      touchedVersion,
      dirtyVersion,
      valuesVersion,
      submitCount,
    ]
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
