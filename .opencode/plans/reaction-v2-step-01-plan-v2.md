# Reactive V2 - Step 01 Implementation Plan (v2)
## Runtime Store and Adapter

**Date:** Mon Mar 23 2026  
**Task:** `dashforge/.opencode/tasks/reaction-v2-step-01-runtime-store-and-adapter.md`  
**Policy:** `dashforge/.opencode/policies/reaction-v2.md`  
**Status:** Planning Phase - Revised

**Revision Notes:**
- Runtime store is now fully lazy (no explicit registration)
- Adapter is pure pass-through (no ownership)
- Per-field subscriptions properly isolated
- Reduced bridge surface (controlled APIs only)

---

## Executive Summary

This plan details the implementation of the foundational runtime state layer for Reactive V2. The goal is to introduce a **Valtio-based atomic runtime store** that manages per-field runtime metadata (loading, error, runtime data) separate from RHF's form values, while exposing clean adapter APIs and hooks for future reaction system integration.

**Key Principle:** This step builds ONLY the runtime infrastructure. NO reactions, NO reconciliation, NO automatic resets, NO Select behavior changes.

**Architecture Principles:**
1. **Lazy runtime state** - Fields created on first access (get/set)
2. **Provider owns store** - Adapter is stateless pass-through
3. **Atomic subscriptions** - Per-field isolation (no global listeners)
4. **Minimal bridge** - Controlled APIs, no raw store exposure to UI

---

## 1. Architecture Overview

### 1.1 Current State (Phase 0)

```
┌─────────────────────────────────────────────────────────────┐
│ DashFormProvider                                            │
│  ├─ Creates Engine (Valtio-based reactive nodes)            │
│  ├─ Creates RHF via useForm() (form values, validation)     │
│  ├─ Creates FormEngineAdapter (bridges RHF ↔ Engine)        │
│  └─ Provides DashFormContext (bridge API for UI)            │
│                                                              │
│  Current Reactivity Model:                                  │
│  - RHF formState changes → Provider re-renders              │
│  - Version strings (JSON.stringify) → trigger UI re-renders │
│  - Engine nodes (Valtio) → useEngineNode subscriptions      │
└─────────────────────────────────────────────────────────────┘

Limitations:
- Version strings cause coarse-grained re-renders
- No dedicated runtime metadata layer (loading, fetch errors, etc.)
- Cannot support async option fetching without mixing concerns
```

### 1.2 Target State (After Step 01)

```
┌─────────────────────────────────────────────────────────────────┐
│ DashFormProvider (OWNS RUNTIME STORE)                          │
│  ├─ Creates Engine (reactive nodes for values)                  │
│  ├─ Creates RHF (form values, validation)                       │
│  ├─ Creates RuntimeStore (NEW - field runtime metadata)         │
│  ├─ Creates FormEngineAdapter (PASS-THROUGH to store)           │
│  └─ Provides DashFormContext (controlled runtime APIs)          │
│                                                                  │
│  New Runtime Layer (LAZY):                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ RuntimeStore (Valtio proxy)                               │ │
│  │  fields: {                                                 │ │
│  │    // Fields created on-demand (first get/set)            │ │
│  │    "countrySelect": {                                      │ │
│  │      status: 'loading' | 'ready' | 'error' | 'idle'       │ │
│  │      error: string | null                                  │ │
│  │      data: { options: [...] } | null                       │ │
│  │    }                                                        │ │
│  │  }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Subscription Model (PER-FIELD ISOLATED):                       │
│  - useFieldRuntime('country') → subscribes ONLY to 'country'    │
│  - useFieldRuntime('city') → subscribes ONLY to 'city'          │
│  - No cross-field notification pollution                        │
└─────────────────────────────────────────────────────────────────┘

Benefits:
- Atomic per-field runtime subscriptions
- Lazy field creation (no pre-registration)
- Adapter is stateless (provider owns store)
- Dedicated layer for async metadata
- No provider fan-out re-renders
```

---

## 2. Detailed Component Design

### 2.1 Runtime State Types

**Location:** `libs/dashforge/forms/src/runtime/runtime.types.ts` (NEW FILE)

**Key Types:**

```typescript
/**
 * Field runtime fetch status.
 * 
 * Lifecycle:
 * - 'idle': Initial state, no async work scheduled
 * - 'loading': Async operation in progress
 * - 'ready': Async operation completed successfully
 * - 'error': Async operation failed
 */
export type FieldFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Runtime state for a single field.
 * Separate from form values (managed by RHF).
 * 
 * @template TData - Type of runtime data (e.g., SelectFieldRuntimeData)
 */
export interface FieldRuntimeState<TData = unknown> {
  /**
   * Current fetch status for this field's runtime data.
   */
  status: FieldFetchStatus;

  /**
   * Runtime error message (NOT validation error).
   * Only set when status is 'error'.
   */
  error: string | null;

  /**
   * Runtime data payload (e.g., fetched options for Select).
   * Type depends on field type.
   */
  data: TData | null;
}

/**
 * Runtime data shape for Select fields.
 * 
 * @template TOption - Type of individual option object
 */
export interface SelectFieldRuntimeData<TOption = unknown> {
  /**
   * Array of options available for selection.
   */
  options: TOption[];
}

/**
 * Complete runtime store state.
 * Fields are created lazily on first access.
 */
export interface RuntimeStoreState {
  /**
   * Per-field runtime states (lazily created).
   * Key: field name (e.g., "country", "dependent.group0")
   * Value: FieldRuntimeState with optional generic data
   */
  fields: Record<string, FieldRuntimeState>;
}

/**
 * Configuration for runtime store creation.
 */
export interface RuntimeStoreConfig {
  /**
   * Enable debug logging.
   */
  debug?: boolean;
}
```

**Rationale:**
- Clean separation: runtime metadata vs. form values
- Type-safe: generic `TData` allows field-specific data shapes
- Future-proof: compatible with reaction system requirements
- Explicit status: 4-state lifecycle prevents undefined-chaos

---

### 2.2 Runtime Store Implementation (REVISED - LAZY)

**Location:** `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (NEW FILE)

**Core Interface (SIMPLIFIED):**

```typescript
/**
 * Default runtime state for a newly accessed field.
 * Safe defaults prevent undefined checks in consuming code.
 */
export const DEFAULT_FIELD_RUNTIME: FieldRuntimeState = {
  status: 'idle',
  error: null,
  data: null,
};

/**
 * Runtime store interface (LAZY, NO REGISTRATION).
 * Fields are created on-demand during get/set operations.
 */
export interface RuntimeStore {
  /**
   * Get current runtime state for a field.
   * LAZY: Creates field with default state if doesn't exist.
   * 
   * @param name - Field name
   * @returns Current runtime state (snapshot, immutable)
   */
  getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (merge semantics).
   * LAZY: Creates field if doesn't exist before merging.
   * 
   * @param name - Field name
   * @param patch - Partial state to merge
   */
  setFieldRuntime<TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ): void;

  /**
   * Subscribe to runtime state changes for a specific field.
   * ISOLATED: Only fires when THIS specific field changes.
   * 
   * @param name - Field name to watch
   * @param listener - Callback invoked on state change
   * @returns Unsubscribe function
   */
  subscribeFieldRuntime(name: string, listener: () => void): () => void;

  /**
   * Reset all runtime state to defaults.
   * Clears all fields (useful for form reset).
   */
  reset(): void;

  /**
   * Get raw Valtio proxy (internal use only).
   * Exposed for testing and internal provider needs.
   * NOT exposed via bridge to UI.
   */
  getState(): RuntimeStoreState;
}
```

**Implementation Strategy (REVISED):**

```typescript
import { proxy, subscribe, snapshot } from 'valtio';
import { subscribeKey } from 'valtio/utils'; // CRITICAL for per-field subscriptions

export function createRuntimeStore(
  config: RuntimeStoreConfig = {}
): RuntimeStore {
  const { debug = false } = config;

  // Create Valtio proxy for reactive state
  const state = proxy<RuntimeStoreState>({
    fields: {},
  });

  if (debug) {
    console.log('[RuntimeStore] Created', {
      timestamp: new Date().toISOString(),
    });
  }

  return {
    getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData> {
      // LAZY: Ensure field exists before reading
      if (!state.fields[name]) {
        state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
        if (debug) {
          console.log('[RuntimeStore] Lazy-created field on read', { name });
        }
      }

      // Return immutable snapshot
      return snapshot(state.fields[name]) as FieldRuntimeState<TData>;
    },

    setFieldRuntime<TData = unknown>(
      name: string,
      patch: Partial<FieldRuntimeState<TData>>
    ): void {
      // LAZY: Ensure field exists before writing
      if (!state.fields[name]) {
        state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
        if (debug) {
          console.log('[RuntimeStore] Lazy-created field on write', { name });
        }
      }

      // Merge patch into existing state
      Object.assign(state.fields[name], patch);

      if (debug) {
        console.log('[RuntimeStore] setFieldRuntime', {
          name,
          patch,
          newState: snapshot(state.fields[name]),
        });
      }
    },

    subscribeFieldRuntime(name: string, listener: () => void): () => void {
      if (debug) {
        console.log('[RuntimeStore] subscribeFieldRuntime', { name });
      }

      // CRITICAL: Use subscribeKey for per-field isolation
      // This ensures listener ONLY fires when state.fields[name] changes
      // NOT when other fields change
      return subscribeKey(state.fields, name, () => {
        if (debug) {
          console.log('[RuntimeStore] Field changed, notifying listener', {
            name,
            newState: snapshot(state.fields[name]),
          });
        }
        listener();
      });
    },

    reset(): void {
      state.fields = {};

      if (debug) {
        console.log('[RuntimeStore] reset');
      }
    },

    getState(): RuntimeStoreState {
      return state;
    },
  };
}
```

**Key Changes from v1:**
1. **REMOVED:** `registerField()`, `unregisterField()`, `getRegisteredFields()`
2. **LAZY:** Fields auto-created on first `get` or `set`
3. **ISOLATED:** `subscribeKey(state.fields, name, ...)` for per-field subscriptions
4. **SIMPLE:** No lifecycle management - just get/set/subscribe

**Critical Import:**
```typescript
import { subscribeKey } from 'valtio/utils';
```
This is the KEY to per-field subscription isolation. Without it, subscribing to `state.fields` fires on ALL field changes.

---

### 2.3 Adapter Integration (REVISED - PASS-THROUGH ONLY)

**Location:** `libs/dashforge/forms/src/core/FormEngineAdapter.ts` (MODIFY)

**Changes (MINIMAL):**

The adapter does NOT own the runtime store. It only receives it as a parameter for pass-through access in methods that need it (future use).

**Option A: No adapter changes at all**
- Adapter doesn't touch runtime store
- Runtime APIs go directly through bridge
- Simplest approach

**Option B: Adapter provides convenience accessors (if needed later)**
```typescript
export class FormEngineAdapter<TFieldValues extends FieldValues = FieldValues>
  implements IFormEngineAdapter<TFieldValues>
{
  private engine: Engine;
  private rhfMethods: UseFormReturn<TFieldValues>;
  private debug: boolean;
  private registeredFields: Set<string>; // Still tracks RHF fields

  constructor(
    engine: Engine,
    rhfMethods: UseFormReturn<TFieldValues>,
    options?: FormEngineAdapterOptions
  ) {
    this.engine = engine;
    this.rhfMethods = rhfMethods;
    this.debug = options?.debug ?? false;
    this.registeredFields = new Set<string>();
  }

  // NO runtime store property
  // NO attachRuntimeStore method
  // NO runtime-related logic

  registerField(name: FieldPath<TFieldValues>): void {
    const fieldName = String(name);
    this.registeredFields.add(fieldName);

    // Get initial value from RHF
    const initialValue = this.rhfMethods.getValues(name);

    // Create Engine node if it doesn't exist
    const existingNode = this.engine.getNode(fieldName);
    if (!existingNode) {
      this.engine.registerNode({
        id: fieldName,
        value: initialValue ?? '',
        visible: true,
        disabled: false,
      });
    }

    // NO runtime store registration (lazy creation instead)

    if (this.debug) {
      console.log('[FormEngineAdapter] registerField', {
        name: fieldName,
        initialValue,
        nodeCreated: !existingNode,
        totalRegistered: this.registeredFields.size,
      });
    }
  }

  unregisterField(name: FieldPath<TFieldValues>): void {
    const fieldName = String(name);
    const wasRegistered = this.registeredFields.delete(fieldName);

    // Remove Engine node if field was registered
    if (wasRegistered) {
      this.engine.unregisterNode(fieldName);
    }

    // NO runtime store cleanup (lazy lifecycle)

    if (this.debug) {
      console.log('[FormEngineAdapter] unregisterField', {
        name: fieldName,
        wasRegistered,
        totalRegistered: this.registeredFields.size,
      });
    }
  }

  // Rest of adapter methods unchanged...
}
```

**Key Changes from v1:**
1. **REMOVED:** `runtimeStore` property
2. **REMOVED:** `attachRuntimeStore()` method
3. **REMOVED:** `getRuntimeStore()` method
4. **REMOVED:** All runtime store interaction from `registerField`/`unregisterField`

**Rationale:**
- Adapter is now a pure pass-through (no ownership)
- Runtime store lifecycle managed entirely by provider
- Lazy creation eliminates need for explicit registration
- Simpler, cleaner separation of concerns

---

### 2.4 DashFormProvider Integration (REVISED - STORE OWNER)

**Location:** `libs/dashforge/forms/src/core/DashFormProvider.tsx` (MODIFY)

**Changes:**

```typescript
import { createRuntimeStore } from '../runtime/createRuntimeStore';
import type { RuntimeStore } from '../runtime/createRuntimeStore';

export function DashFormProvider<TFieldValues extends FieldValues = FieldValues>({
  children,
  engine: externalEngine,
  defaultValues,
  debug = false,
  mode = 'onChange',
}: DashFormProviderProps<TFieldValues>) {
  // ... existing engine creation ...

  // ... existing RHF initialization ...

  // ... existing formState subscriptions ...

  // NEW: Create runtime store (PROVIDER OWNS IT)
  // Memoized to maintain stable reference across renders
  const runtimeStore = useMemo(() => {
    const store = createRuntimeStore({ debug });

    if (debug) {
      console.log('[DashFormProvider] Created RuntimeStore', store);
    }

    return store;
  }, [debug]);

  // Create adapter (NO RUNTIME STORE ATTACHMENT)
  const adapter = useMemo(() => {
    const adapterInstance = new FormEngineAdapter(engine, rhf, { debug });

    if (debug) {
      console.log('[DashFormProvider] Created FormEngineAdapter', {
        adapter: adapterInstance,
      });
    }

    return adapterInstance;
  }, [engine, rhf, debug]); // Note: runtimeStore NOT in deps

  // MODIFIED: Build bridge value with CONTROLLED runtime APIs
  const bridgeValue = useMemo<DashFormBridge>(
    () => ({
      engine,
      
      // NEW: Expose CONTROLLED runtime APIs (NOT raw store)
      getFieldRuntime: (name: string) => runtimeStore.getFieldRuntime(name),
      setFieldRuntime: (name: string, patch: unknown) =>
        runtimeStore.setFieldRuntime(name, patch),
      subscribeFieldRuntime: (name: string, listener: () => void) =>
        runtimeStore.subscribeFieldRuntime(name, listener),
      
      // ... existing register, getError, etc. ...
      
      // Keep version strings for backward compatibility
      errorVersion,
      touchedVersion,
      dirtyVersion,
      valuesVersion,
      submitCount,
      
      debug,
    }),
    [
      engine,
      runtimeStore, // Include as dependency
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

  // ... rest unchanged ...
}
```

**Key Changes from v1:**
1. **REMOVED:** `runtimeStore` from adapter deps (adapter doesn't own it)
2. **REMOVED:** `adapter.attachRuntimeStore()` call
3. **CHANGED:** Bridge exposes only controlled APIs (NOT raw `runtimeStore`)
4. **OWNER:** Provider is single owner of runtime store lifecycle

**Rationale:**
- Provider creates and owns runtime store
- Adapter is stateless (doesn't know about runtime store)
- Bridge exposes controlled APIs only (no raw store)
- Cleaner ownership model

---

### 2.5 Bridge Type Updates (REVISED - MINIMAL SURFACE)

**Location:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (MODIFY)

**Changes:**

```typescript
/**
 * Field runtime state shape.
 * Duplicated here to avoid circular dependency.
 * Must match FieldRuntimeState from @dashforge/forms/runtime.
 */
export interface FieldRuntimeState<TData = unknown> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  data: TData | null;
}

export interface DashFormBridge {
  /**
   * The Dashforge Engine instance.
   */
  engine: Engine;

  // NEW: Runtime APIs (CONTROLLED, NO RAW STORE)
  /**
   * Get runtime state for a field.
   * Returns default state if field not yet accessed.
   * 
   * @param name - Field name
   * @returns Current runtime state
   */
  getFieldRuntime?<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field.
   * Lazily creates field if doesn't exist.
   * 
   * @param name - Field name
   * @param patch - Partial state to merge
   */
  setFieldRuntime?<TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ): void;

  /**
   * Subscribe to runtime state changes for a field.
   * Subscription is isolated to this specific field only.
   * 
   * @param name - Field name
   * @param listener - Callback on change
   * @returns Unsubscribe function
   */
  subscribeFieldRuntime?(name: string, listener: () => void): () => void;

  // ... existing properties (register, getError, etc.) ...

  /**
   * Version string for errors state.
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  errorVersion?: string;

  /**
   * Version string for touched state.
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  touchedVersion?: string;

  /**
   * Version string for dirty state.
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  dirtyVersion?: string;

  /**
   * Version string for values state.
   * @deprecated Will be replaced by useFieldRuntime hook
   */
  valuesVersion?: string;

  // ... rest unchanged ...
}
```

**Key Changes from v1:**
1. **REMOVED:** `runtimeStore?: RuntimeStore` (no raw store exposure)
2. **KEPT:** Only controlled APIs (`getFieldRuntime`, `setFieldRuntime`, `subscribeFieldRuntime`)
3. **SAFER:** UI cannot access raw store, only through controlled methods

**Rationale:**
- Minimal surface area reduces coupling
- UI uses hook (primary) or controlled APIs (advanced)
- No raw store access prevents misuse
- Cleaner abstraction boundary

---

### 2.6 Component Hook (UNCHANGED - WORKS WITH REVISED STORE)

**Location:** `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (NEW FILE)

**Implementation:**

```typescript
import { useContext, useSyncExternalStore } from 'react';
import { DashFormContext } from '@dashforge/ui-core';
import type { FieldRuntimeState } from '../runtime/runtime.types';

/**
 * Hook to subscribe to runtime state for a specific field.
 * Uses useSyncExternalStore for concurrent-safe subscriptions.
 * 
 * Subscriptions are ISOLATED per field - changes to other fields
 * will NOT trigger re-renders of this hook.
 * 
 * @template TData - Type of runtime data
 * @param name - Field name to subscribe to
 * @returns Current runtime state for the field
 * 
 * @example
 * ```tsx
 * function MySelect({ name }) {
 *   const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
 *   
 *   if (runtime.status === 'loading') {
 *     return <CircularProgress />;
 *   }
 *   
 *   const options = runtime.data?.options ?? [];
 *   return <Select options={options} />;
 * }
 * ```
 */
export function useFieldRuntime<TData = unknown>(
  name: string
): FieldRuntimeState<TData> {
  const bridge = useContext(DashFormContext);

  // Define subscribe function for useSyncExternalStore
  // Subscribes to this specific field only (isolated)
  const subscribe = (onStoreChange: () => void) => {
    if (!bridge?.subscribeFieldRuntime) {
      // No runtime store - return no-op unsubscribe
      return () => {};
    }

    // Subscribe to this specific field (via subscribeKey internally)
    return bridge.subscribeFieldRuntime(name, onStoreChange);
  };

  // Define getSnapshot function for useSyncExternalStore
  const getSnapshot = (): FieldRuntimeState<TData> => {
    if (!bridge?.getFieldRuntime) {
      // No runtime store - return default state
      return {
        status: 'idle',
        error: null,
        data: null,
      } as FieldRuntimeState<TData>;
    }

    return bridge.getFieldRuntime<TData>(name);
  };

  // Use React's concurrent-safe subscription mechanism
  const runtime = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return runtime;
}
```

**Why this still works:**
- `bridge.subscribeFieldRuntime` uses `subscribeKey` internally (per-field isolation)
- `bridge.getFieldRuntime` lazily creates field on first access
- No changes needed to hook implementation

**Rationale:**
- React 18+ concurrent-safe API
- Atomic subscriptions (only this field)
- Safe fallback (standalone mode)
- Type-safe (generic `TData`)

---

## 3. Implementation Sequence (REVISED)

| Phase | Task | Time | Files |
|-------|------|------|-------|
| 1 | Type Definitions | 30 min | `runtime/runtime.types.ts`, `runtime/index.ts` |
| 2 | Runtime Store (LAZY) | 1 hour | `runtime/createRuntimeStore.ts` + tests |
| 3 | Adapter (NO CHANGES) | 5 min | Review only - no runtime code needed |
| 4 | Provider Integration | 30 min | `core/DashFormProvider.tsx` |
| 5 | Bridge Type Updates | 10 min | `ui-core/bridge/DashFormBridge.ts` |
| 6 | Component Hook | 30 min | `hooks/useFieldRuntime.ts` + tests |
| 7 | Testing | 1 hour | Integration tests, subscription isolation |
| 8 | Validation | 30 min | Full test suite, regression checks |

**Total:** ~4 hours (reduced from 4.5h due to simpler adapter)

---

## 4. File Modification Summary (REVISED)

### New Files (6)
- `libs/dashforge/forms/src/runtime/runtime.types.ts` (~80 lines)
- `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (~120 lines, simpler)
- `libs/dashforge/forms/src/runtime/index.ts` (~10 lines)
- `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (~60 lines)
- `libs/dashforge/forms/src/runtime/__tests__/createRuntimeStore.test.ts` (~180 lines)
- `libs/dashforge/forms/src/hooks/__tests__/useFieldRuntime.test.tsx` (~150 lines)

### Modified Files (3 - REDUCED from 4)
- `libs/dashforge/forms/src/core/DashFormProvider.tsx` (+25 lines, ~15 modified)
- `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (+40 lines, ~5 modified)
- `libs/dashforge/forms/src/index.ts` (+5 lines exports)

### NOT Modified
- `libs/dashforge/forms/src/core/FormEngineAdapter.ts` - **NO CHANGES** (adapter doesn't touch runtime)

**Total:** ~730 lines (reduced from ~810 due to simpler design)

---

## 5. API Surface (REVISED)

### Public Exports (from @dashforge/forms)

**Types:**
- `FieldFetchStatus`
- `FieldRuntimeState<TData>`
- `SelectFieldRuntimeData<TOption>`
- `RuntimeStoreConfig`
- `RuntimeStore` (interface - for advanced/internal use only)

**Functions:**
- `createRuntimeStore(config): RuntimeStore` (internal, not typically used by consumers)
- `useFieldRuntime<TData>(name): FieldRuntimeState<TData>` (PRIMARY PUBLIC API)

### Bridge APIs (via DashFormContext)

Available on `bridge` object from `useContext(DashFormContext)`:
- `bridge.getFieldRuntime?<TData>(name): FieldRuntimeState<TData>`
- `bridge.setFieldRuntime?<TData>(name, patch): void`
- `bridge.subscribeFieldRuntime?(name, listener): () => void`

**NOT EXPOSED:**
- ~~`bridge.runtimeStore`~~ (removed - no raw store access)

### Usage Examples

**In UI components (RECOMMENDED):**
```typescript
import { useFieldRuntime, SelectFieldRuntimeData } from '@dashforge/forms';

function MySelect({ name }) {
  // Hook automatically subscribes to this field only
  const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
  
  if (runtime.status === 'loading') return <Skeleton />;
  if (runtime.status === 'error') return <Alert>{runtime.error}</Alert>;
  
  const options = runtime.data?.options ?? [];
  return <Select name={name} options={options} />;
}
```

**In future reaction handlers (ADVANCED):**
```typescript
import type { ReactionRunContext } from '@dashforge/forms';

const reaction = {
  id: 'fetch-cities',
  watch: ['country'],
  run: async (ctx: ReactionRunContext) => {
    // Set loading state
    ctx.setRuntime('city', { status: 'loading' });
    
    try {
      const cities = await fetchCities(ctx.getValue('country'));
      
      // Set ready state with data
      ctx.setRuntime('city', {
        status: 'ready',
        data: { options: cities },
      });
    } catch (err) {
      // Set error state
      ctx.setRuntime('city', {
        status: 'error',
        error: err.message,
      });
    }
  },
};
```

**NOT recommended (but possible):**
```typescript
// Direct bridge access (advanced use only)
const bridge = useContext(DashFormContext);
const runtime = bridge?.getFieldRuntime?.('country');
bridge?.setFieldRuntime?.('city', { status: 'loading' });
```

---

## 6. Testing Strategy (UPDATED)

### 6.1 Runtime Store Tests (UPDATED)

**File:** `runtime/__tests__/createRuntimeStore.test.ts`

**Coverage:**
1. **Store Creation**
   - Creates store with default config
   - Creates store with debug enabled
   - Initializes with empty fields

2. **Lazy Field Creation**
   - `getFieldRuntime()` creates field on first read ✨ NEW
   - `setFieldRuntime()` creates field on first write ✨ NEW
   - Fields start with default state
   - Multiple calls to get/set are idempotent

3. **Read Operations**
   - `getFieldRuntime()` returns default for new field
   - `getFieldRuntime()` returns immutable snapshot
   - Modifying snapshot doesn't affect store

4. **Write Operations**
   - `setFieldRuntime()` merges partial updates
   - `setFieldRuntime()` preserves unspecified properties
   - Lazy creation before merge

5. **Subscriptions (CRITICAL - PER-FIELD ISOLATION)** ✨ UPDATED
   - `subscribeFieldRuntime('country', ...)` fires on 'country' change
   - `subscribeFieldRuntime('country', ...)` does NOT fire on 'city' change ✨ CRITICAL
   - `subscribeFieldRuntime('city', ...)` does NOT fire on 'country' change ✨ CRITICAL
   - Multiple subscribers to same field receive same update
   - Unsubscribe function stops notifications
   - Subscription cleanup on unsubscribe

6. **Reset**
   - `reset()` clears all fields
   - `reset()` notifies all active subscribers

### 6.2 useFieldRuntime Hook Tests (UNCHANGED)

**File:** `hooks/__tests__/useFieldRuntime.test.tsx`

**Coverage:**
- Standalone mode (no provider, default state)
- Form mode (subscriptions, re-renders)
- Subscription isolation (field A change doesn't re-render field B hook)
- Type safety (generic TData)
- Concurrent rendering (no tearing)
- Cleanup on unmount

### 6.3 Integration Tests (UPDATED)

**File:** `__tests__/runtime-integration.test.tsx`

**Coverage:**
1. **Provider → Store → Hook Flow**
   - Provider creates runtime store
   - Lazy field creation on first hook usage ✨ NEW
   - `useFieldRuntime` subscribes correctly
   - Updates propagate to component

2. **Subscription Isolation (CRITICAL)** ✨ NEW
   - Component A: `useFieldRuntime('country')`
   - Component B: `useFieldRuntime('city')`
   - Setting 'country' runtime → only Component A re-renders
   - Setting 'city' runtime → only Component B re-renders

3. **No Adapter Coupling** ✨ NEW
   - Adapter register/unregister does NOT affect runtime store
   - Runtime fields independent of RHF field lifecycle

4. **Backward Compatibility**
   - Version strings still work
   - Existing components don't break
   - Bridge APIs are optional

### 6.4 Validation

```bash
# Must pass with 0 errors
npx nx run @dashforge/forms:typecheck
npx nx run @dashforge/ui-core:typecheck
npx nx run @dashforge/ui:typecheck

# Must pass with 0 failures, 0 skipped
npx nx run @dashforge/forms:test

# Verify no regressions
npx nx run-many --target=test --all
```

---

## 7. Constraints Verification (UPDATED)

### Policy Compliance ✅

**From `/dashforge/.opencode/policies/reaction-v2.md`:**

- ✅ NO reconciliation logic
- ✅ NO automatic value reset
- ✅ NO visibleWhen logic moved
- ✅ NO provider fan-out state (per-field subscriptions via `subscribeKey`)
- ✅ RHF remains source of truth for values
- ✅ Runtime state is atomic (per-field isolated subscriptions)
- ✅ Reactions are mechanical (not implemented yet)

### Task Scope ✅

**IN SCOPE - Implemented:**
- ✅ Field runtime state model
- ✅ Atomic runtime store (lazy, per-field subscriptions)
- ✅ Adapter APIs (no-op / pass-through)
- ✅ Component hook (useFieldRuntime)
- ✅ Compatible with existing architecture
- ✅ Preserves current behavior

**OUT OF SCOPE - NOT Implemented:**
- ✅ NO reaction registration/execution
- ✅ NO watch/when/run logic
- ✅ NO bootstrap evaluation
- ✅ NO async orchestration (beyond primitives)
- ✅ NO Select component changes
- ✅ NO value reconciliation

### Architecture ✅

- ✅ Extends existing architecture (not parallel)
- ✅ No circular dependencies
- ✅ Package boundaries respected (ui-core → forms → ui)
- ✅ Provider owns store lifecycle (adapter is stateless)
- ✅ Lazy field creation (no explicit registration)
- ✅ Per-field subscription isolation (`subscribeKey`)

---

## 8. Risks & Mitigation (UPDATED)

### Risk 1: Valtio subscribeKey Not Working as Expected
**Likelihood:** Low | **Impact:** High

**Mitigation:**
- `subscribeKey` is documented Valtio feature
- Will add explicit test: change field A, verify field B listener doesn't fire
- Engine uses similar patterns successfully
- Fallback: Manual listener map if subscribeKey fails

### Risk 2: Type Duplication Drift
**Likelihood:** Medium | **Impact:** Low

**Mitigation:**
- Integration test verifies type compatibility
- Document sync requirement
- Runtime validation in dev mode

### Risk 3: Backward Compatibility
**Likelihood:** Low | **Impact:** High

**Mitigation:**
- Keep version strings functional (deprecated but working)
- NO changes to TextField/Select in this step
- Migration in separate follow-up

### Risk 4: React Concurrent Edge Cases
**Likelihood:** Low | **Impact:** Medium

**Mitigation:**
- useSyncExternalStore is React's recommended API
- Valtio snapshots are immutable
- Add concurrent rendering tests

### Risk 5: Lazy Creation Performance (NEW)
**Likelihood:** Low | **Impact:** Low

**Mitigation:**
- Lazy creation is O(1) (simple object property set)
- Only happens once per field
- No measurable impact vs. eager registration

---

## 9. Success Criteria (UPDATED)

### Must Have ✅
1. All typechecks pass (0 errors)
2. All unit tests pass (0 failures, 0 skipped)
3. Runtime store supports per-field subscriptions (via `subscribeKey`)
4. **CRITICAL:** Subscription isolation verified (field A change doesn't notify field B)
5. Lazy field creation works (no explicit registration needed)
6. useFieldRuntime works in form and standalone modes
7. Adapter does NOT manage runtime store (stateless pass-through)
8. No breaking changes to existing components
9. Version strings remain functional
10. No reconciliation/resets/visibility logic added
11. All policy constraints verified

### Should Have ✅
1. Debug logging available
2. Safe defaults (no undefined chaos)
3. Concurrent-safe hook
4. Integration tests
5. JSDoc examples

### Nice to Have
1. Performance benchmarks (lazy vs eager)
2. Storybook examples
3. DevTools integration

---

## 10. Key Differences from v1 Plan

| Aspect | v1 Plan | v2 Plan (CORRECTED) |
|--------|---------|---------------------|
| **Field Lifecycle** | Explicit registration via `registerField()` / `unregisterField()` | ✅ Lazy creation on first access (get/set) |
| **Adapter Role** | Owns runtime store reference, calls register/unregister | ✅ Stateless pass-through (no runtime knowledge) |
| **Store Owner** | Shared between provider and adapter | ✅ Provider is sole owner |
| **Subscriptions** | `subscribe(state.fields, ...)` (potentially fires on all changes) | ✅ `subscribeKey(state.fields, name, ...)` (isolated per field) |
| **Bridge Surface** | Exposes raw `runtimeStore` object | ✅ Only controlled APIs (no raw store) |
| **Store Interface** | 9 methods (including register/unregister) | ✅ 5 methods (simpler, lazy) |
| **Adapter Changes** | +40 lines, 3 new methods | ✅ 0 lines (no changes) |
| **Complexity** | Higher (lifecycle management) | ✅ Lower (lazy, simpler) |

---

## 11. Open Questions (RESOLVED)

### Q1: Valtio Subscription Strategy ✅ RESOLVED
**v1 Plan:** Use `subscribe(state.fields, ...)` relying on Valtio's proxy tracking  
**v2 Plan:** Use `subscribeKey(state.fields, name, ...)` for guaranteed isolation  
**Decision:** ✅ Use `subscribeKey` (explicit per-field isolation)

### Q2: Type Duplication ✅ UNCHANGED
**Plan:** Duplicate `FieldRuntimeState` in ui-core bridge  
**Alternative:** Shared @dashforge/types package  
**Decision:** ✅ Duplicate with integration test

### Q3: Version String Timeline ✅ UNCHANGED
**Plan:** Mark deprecated, remove in Step 04 after migration  
**Decision:** ✅ Remove after TextField/Select migration

### Q4: Debug Logging ✅ UNCHANGED
**Plan:** Per-provider debug flag (from DashFormProvider)  
**Decision:** ✅ Per-provider (current pattern)

### Q5: Store Lifecycle (NEW) ✅ RESOLVED
**v1 Plan:** Adapter participates in lifecycle via attach/register/unregister  
**v2 Plan:** Provider solely owns store, lazy creation, no explicit registration  
**Decision:** ✅ Provider owns, lazy creation

---

## 12. Critical Implementation Notes

### 🔴 CRITICAL: Per-Field Subscription Isolation

**Must use `subscribeKey` from `valtio/utils`:**

```typescript
import { subscribeKey } from 'valtio/utils';

// ✅ CORRECT - isolated per field
subscribeFieldRuntime(name: string, listener: () => void): () => void {
  return subscribeKey(state.fields, name, listener);
}

// ❌ WRONG - fires on ALL field changes
subscribeFieldRuntime(name: string, listener: () => void): () => void {
  return subscribe(state.fields, listener); // BAD - not isolated
}
```

**Test to verify:**
```typescript
test('subscription isolation', () => {
  const store = createRuntimeStore();
  const countryListener = jest.fn();
  const cityListener = jest.fn();

  store.subscribeFieldRuntime('country', countryListener);
  store.subscribeFieldRuntime('city', cityListener);

  // Change country - only country listener should fire
  store.setFieldRuntime('country', { status: 'loading' });
  expect(countryListener).toHaveBeenCalledTimes(1);
  expect(cityListener).toHaveBeenCalledTimes(0); // CRITICAL

  // Change city - only city listener should fire
  store.setFieldRuntime('city', { status: 'loading' });
  expect(countryListener).toHaveBeenCalledTimes(1); // Still 1
  expect(cityListener).toHaveBeenCalledTimes(1); // CRITICAL
});
```

### 🟡 IMPORTANT: Lazy Field Creation

Fields must be created on first access (not pre-registered):

```typescript
// ✅ CORRECT - lazy creation
getFieldRuntime(name: string): FieldRuntimeState {
  if (!state.fields[name]) {
    state.fields[name] = { ...DEFAULT_FIELD_RUNTIME };
  }
  return snapshot(state.fields[name]);
}

// ❌ WRONG - requires pre-registration
getFieldRuntime(name: string): FieldRuntimeState {
  if (!state.fields[name]) {
    throw new Error(`Field ${name} not registered`); // BAD
  }
  return snapshot(state.fields[name]);
}
```

### 🟢 GOOD: Provider Ownership

Provider creates and owns store (adapter doesn't touch it):

```typescript
// ✅ CORRECT in DashFormProvider
const runtimeStore = useMemo(() => createRuntimeStore({ debug }), [debug]);

// Bridge exposes controlled APIs
const bridgeValue = useMemo(() => ({
  getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
  setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
  subscribeFieldRuntime: (name, listener) => runtimeStore.subscribeFieldRuntime(name, listener),
}), [runtimeStore]);

// ❌ WRONG - don't do this
// adapter.attachRuntimeStore(runtimeStore); // BAD - no ownership
```

---

## 13. Follow-Up Tasks (Out of Scope)

1. **Step 02:** Reaction registration and execution engine
   - Define ReactionDefinition types
   - Implement reaction registry
   - Add watch/when/run evaluation
   - Integrate with runtime store

2. **Step 03:** Select component runtime integration
   - Modify Select to use useFieldRuntime
   - Implement option resolution logic
   - Add unresolved value warning (dev only)
   - Remove version string dependencies

3. **Step 04:** TextField migration to useFieldRuntime
   - Replace version string subscriptions
   - Use useFieldRuntime for error/touched state
   - Verify no behavior changes

4. **Step 05:** Deprecate version strings
   - Mark as deprecated in TypeScript
   - Add console warnings in dev mode
   - Document migration path

---

## 14. Next Steps

**After plan approval:**

1. Confirm v2 corrections address all concerns
2. Create feature branch: `feature/reactive-v2-step-01-runtime-store-v2`
3. Implement per phase sequence (Section 3)
4. **CRITICAL:** Verify subscription isolation test passes
5. Run validation tests continuously
6. Create implementation report
7. Commit: `feat(forms): add Reactive V2 runtime store (lazy, isolated subscriptions)`

**Estimated Time:** ~4 hours (reduced from 4.5h)  
**Approach:** Single focused session

---

## 15. References

### Task Files
- Task: `.opencode/tasks/reaction-v2-step-01-runtime-store-and-adapter.md`
- Policy: `.opencode/policies/reaction-v2.md`

### Key Files
- DashFormProvider: `libs/dashforge/forms/src/core/DashFormProvider.tsx`
- FormEngineAdapter: `libs/dashforge/forms/src/core/FormEngineAdapter.ts` (NO CHANGES)
- DashFormBridge: `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`
- Engine Store: `libs/dashforge/ui-core/src/store/createStore.ts` (reference for patterns)

### Dependencies
- Valtio: v2.3.0 (already installed ✓)
- **Valtio Utils:** `subscribeKey` for per-field isolation ✨ CRITICAL
- React: useSyncExternalStore (built-in React 18+ ✓)

---

**Plan Status:** ✅ Revised (v2) - Ready for Review  
**Key Changes:** Lazy creation, adapter pass-through, per-field isolation, minimal bridge  
**Next Action:** User approval → Implementation
