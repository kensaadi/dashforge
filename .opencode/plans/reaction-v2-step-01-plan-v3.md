# Reactive V2 - Step 01 Implementation Plan (v3 - FINAL)
## Runtime Store and Adapter

**Date:** Mon Mar 23 2026  
**Task:** `dashforge/.opencode/tasks/reaction-v2-step-01-runtime-store-and-adapter.md`  
**Policy:** `dashforge/.opencode/policies/reaction-v2.md`  
**Status:** Planning Phase - Final Revision

**Revision History:**
- **v1:** Initial plan with eager registration
- **v2:** Lazy store, adapter pass-through, per-field subscriptions
- **v3 (FINAL):** Clarified API usage boundaries, reset() semantics, type duplication rationale

**v3 Final Corrections:**
1. `setFieldRuntime` explicitly defined as internal orchestration API (NOT for UI)
2. `reset()` remains internal utility (no RHF coupling, no automatic lifecycle)
3. `FieldRuntimeState` duplication is deliberate boundary decision (NOT temporary)
4. Explicit confirmation of NO reconciliation, NO automatic resets, NO UI logic, NO provider re-renders

---

## Executive Summary

This plan details the implementation of the foundational runtime state layer for Reactive V2. The goal is to introduce a **Valtio-based atomic runtime store** that manages per-field runtime metadata (loading, error, runtime data) separate from RHF's form values, while exposing clean adapter APIs and hooks for future reaction system integration.

**Key Principle:** This step builds ONLY the runtime infrastructure. NO reactions, NO reconciliation, NO automatic resets, NO Select behavior changes.

**Architecture Principles:**
1. **Lazy runtime state** - Fields created on first access (get/set)
2. **Provider owns store** - Adapter is stateless pass-through
3. **Atomic subscriptions** - Per-field isolation (no global listeners)
4. **Minimal bridge** - Controlled APIs, no raw store exposure to UI
5. **Clear API boundaries** - Read (UI) vs Write (orchestration)

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
│  ├─ Creates FormEngineAdapter (PASS-THROUGH only)               │
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
│  API Usage Boundaries:                                          │
│  - UI components: useFieldRuntime() ONLY (read-only)            │
│  - Reactions/Engine: setFieldRuntime() (write orchestration)    │
│  - Subscription Model: Per-field isolated (no cross-pollution)  │
└─────────────────────────────────────────────────────────────────┘

Benefits:
- Atomic per-field runtime subscriptions
- Lazy field creation (no pre-registration)
- Adapter is stateless (provider owns store)
- Clear read/write boundaries
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
 * This is the CANONICAL definition in the forms layer.
 * A duplicate exists in ui-core/bridge for boundary contract (see Section 2.5).
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

### 2.2 Runtime Store Implementation (LAZY, CLEAR BOUNDARIES)

**Location:** `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (NEW FILE)

**Core Interface:**

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
   * Get current runtime state for a field (READ operation).
   * LAZY: Creates field with default state if doesn't exist.
   * 
   * USAGE: UI components via useFieldRuntime hook (primary),
   *        or reactions/engine for reading state (advanced).
   * 
   * @param name - Field name
   * @returns Current runtime state (snapshot, immutable)
   */
  getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (WRITE operation).
   * LAZY: Creates field if doesn't exist before merging.
   * 
   * ⚠️ INTERNAL ORCHESTRATION API
   * 
   * This method is EXCLUSIVELY for:
   * - Reaction handlers (future step 02)
   * - Engine orchestration logic
   * - Controlled internal flows
   * 
   * UI components MUST NOT call this directly.
   * UI components MUST use useFieldRuntime (read-only) only.
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
   * USAGE: Wrapped by useFieldRuntime hook (primary).
   *        Direct usage only in advanced scenarios.
   * 
   * @param name - Field name to watch
   * @param listener - Callback invoked on state change
   * @returns Unsubscribe function
   */
  subscribeFieldRuntime(name: string, listener: () => void): () => void;

  /**
   * Reset all runtime state to defaults.
   * 
   * ⚠️ INTERNAL UTILITY - NOT COUPLED TO FORM LIFECYCLE
   * 
   * This method:
   * - Clears all runtime fields
   * - Does NOT synchronize with RHF reset
   * - Does NOT introduce automatic lifecycle behavior
   * - MUST remain unused by default in this step
   * 
   * Future usage (if needed):
   * - Explicit manual reset scenarios
   * - Testing/cleanup utilities
   * 
   * NOT for automatic form reset integration.
   */
  reset(): void;

  /**
   * Get raw Valtio proxy (internal use only).
   * Exposed for testing and internal provider needs.
   * NOT exposed via bridge to UI.
   * 
   * @internal
   */
  getState(): RuntimeStoreState;
}
```

**Implementation Strategy:**

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
      // Simple clear - no coupling to RHF, no automatic behavior
      state.fields = {};

      if (debug) {
        console.log('[RuntimeStore] reset (manual)');
      }
    },

    getState(): RuntimeStoreState {
      return state;
    },
  };
}
```

**Key Characteristics:**
1. **REMOVED:** `registerField()`, `unregisterField()`, `getRegisteredFields()`
2. **LAZY:** Fields auto-created on first `get` or `set`
3. **ISOLATED:** `subscribeKey(state.fields, name, ...)` for per-field subscriptions
4. **SIMPLE:** No lifecycle management - just get/set/subscribe/reset
5. **BOUNDARIES:** Clear JSDoc about read vs write usage

**Critical Import:**
```typescript
import { subscribeKey } from 'valtio/utils';
```
This is the KEY to per-field subscription isolation. Without it, subscribing to `state.fields` fires on ALL field changes.

---

### 2.3 Adapter Integration (NO CHANGES)

**Location:** `libs/dashforge/forms/src/core/FormEngineAdapter.ts` (NO MODIFICATIONS)

**Decision:** Adapter makes ZERO changes related to runtime store.

**Rationale:**
- Adapter is a pure pass-through (no ownership)
- Runtime store lifecycle managed entirely by provider
- Lazy creation eliminates need for explicit registration
- Simpler, cleaner separation of concerns

**Confirmation:** `FormEngineAdapter.ts` will NOT be modified in this step.

---

### 2.4 DashFormProvider Integration (STORE OWNER)

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

  // Create adapter (NO RUNTIME STORE INVOLVEMENT)
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
      // Read API (safe for UI consumption)
      getFieldRuntime: (name: string) => runtimeStore.getFieldRuntime(name),
      
      // Write API (orchestration only - NOT for UI)
      setFieldRuntime: (name: string, patch: unknown) =>
        runtimeStore.setFieldRuntime(name, patch),
      
      // Subscribe API (wrapped by useFieldRuntime)
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

**Key Points:**
1. Provider creates and owns runtime store
2. Adapter is stateless (doesn't know about runtime store)
3. Bridge exposes only controlled APIs (no raw store)
4. No automatic coupling to RHF reset or lifecycle events

---

### 2.5 Bridge Type Updates (DELIBERATE BOUNDARY DUPLICATION)

**Location:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (MODIFY)

**Changes:**

```typescript
/**
 * Field runtime state shape (BOUNDARY CONTRACT).
 * 
 * ⚠️ DELIBERATE DUPLICATION - NOT TEMPORARY
 * 
 * This type is INTENTIONALLY duplicated from @dashforge/forms/runtime
 * as a deliberate boundary decision required by package separation:
 * 
 * - CANONICAL DEFINITION: libs/dashforge/forms/src/runtime/runtime.types.ts
 * - BRIDGE CONTRACT: This file (ui-core boundary)
 * 
 * Why duplicate:
 * - ui-core CANNOT import from forms (circular dependency)
 * - Package boundaries must remain clean
 * - This is a stable, intentional contract shape
 * 
 * Maintenance requirement:
 * - Both definitions MUST stay aligned
 * - Any change to runtime shape MUST update BOTH sides in the same task
 * - Integration tests verify type compatibility
 * 
 * This is NOT a temporary workaround. This is the correct architecture.
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
   * Get runtime state for a field (READ operation).
   * Returns default state if field not yet accessed.
   * 
   * USAGE: UI components via useFieldRuntime hook (primary).
   * 
   * @param name - Field name
   * @returns Current runtime state
   */
  getFieldRuntime?<TData = unknown>(name: string): FieldRuntimeState<TData>;

  /**
   * Update runtime state for a field (WRITE operation).
   * Lazily creates field if doesn't exist.
   * 
   * ⚠️ INTERNAL ORCHESTRATION API
   * 
   * This method is EXCLUSIVELY for:
   * - Reaction handlers (future step 02)
   * - Engine orchestration logic
   * - Controlled internal flows
   * 
   * UI components MUST NOT call this directly.
   * UI components MUST use useFieldRuntime (read-only) only.
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
   * USAGE: Wrapped by useFieldRuntime hook (primary).
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

**Key Points:**
1. **REMOVED:** `runtimeStore?: RuntimeStore` (no raw store exposure)
2. **KEPT:** Only controlled APIs (`getFieldRuntime`, `setFieldRuntime`, `subscribeFieldRuntime`)
3. **DOCUMENTED:** Type duplication is deliberate, not temporary
4. **CLEAR:** `setFieldRuntime` marked as internal orchestration API

---

### 2.6 Component Hook (UI READ-ONLY API)

**Location:** `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (NEW FILE)

**Implementation:**

```typescript
import { useContext, useSyncExternalStore } from 'react';
import { DashFormContext } from '@dashforge/ui-core';
import type { FieldRuntimeState } from '../runtime/runtime.types';

/**
 * Hook to subscribe to runtime state for a specific field (READ-ONLY).
 * Uses useSyncExternalStore for concurrent-safe subscriptions.
 * 
 * ⚠️ UI COMPONENTS: This is your PRIMARY runtime API
 * 
 * This hook provides READ-ONLY access to runtime state.
 * UI components MUST NOT call setFieldRuntime directly.
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
 *   // Hook automatically subscribes to this field only
 *   const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
 *   
 *   if (runtime.status === 'loading') {
 *     return <CircularProgress />;
 *   }
 *   
 *   if (runtime.status === 'error') {
 *     return <Alert severity="error">{runtime.error}</Alert>;
 *   }
 *   
 *   const options = runtime.data?.options ?? [];
 *   return <Select name={name} options={options} />;
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

**Key Characteristics:**
- React 18+ concurrent-safe API
- Atomic subscriptions (only this field)
- Safe fallback (standalone mode)
- Type-safe (generic `TData`)
- **READ-ONLY** - UI components get state, don't set it

---

## 3. Implementation Sequence

| Phase | Task | Time | Files |
|-------|------|------|-------|
| 1 | Type Definitions | 30 min | `runtime/runtime.types.ts`, `runtime/index.ts` |
| 2 | Runtime Store (LAZY) | 1 hour | `runtime/createRuntimeStore.ts` + tests |
| 3 | Adapter (NO CHANGES) | 0 min | No modifications needed |
| 4 | Provider Integration | 30 min | `core/DashFormProvider.tsx` |
| 5 | Bridge Type Updates | 15 min | `ui-core/bridge/DashFormBridge.ts` |
| 6 | Component Hook | 30 min | `hooks/useFieldRuntime.ts` + tests |
| 7 | Testing | 1 hour | Integration tests, subscription isolation |
| 8 | Validation | 30 min | Full test suite, regression checks |

**Total:** ~4 hours

---

## 4. File Modification Summary

### New Files (6)
- `libs/dashforge/forms/src/runtime/runtime.types.ts` (~90 lines, added JSDoc)
- `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (~140 lines, boundary docs)
- `libs/dashforge/forms/src/runtime/index.ts` (~10 lines)
- `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (~70 lines, usage warnings)
- `libs/dashforge/forms/src/runtime/__tests__/createRuntimeStore.test.ts` (~180 lines)
- `libs/dashforge/forms/src/hooks/__tests__/useFieldRuntime.test.tsx` (~150 lines)

### Modified Files (3)
- `libs/dashforge/forms/src/core/DashFormProvider.tsx` (+25 lines, ~15 modified)
- `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (+60 lines, ~5 modified, extensive docs)
- `libs/dashforge/forms/src/index.ts` (+5 lines exports)

### NOT Modified
- `libs/dashforge/forms/src/core/FormEngineAdapter.ts` - **NO CHANGES**

**Total:** ~760 lines (including enhanced documentation)

---

## 5. API Surface & Usage Boundaries

### 5.1 Public Exports (from @dashforge/forms)

**Types:**
- `FieldFetchStatus`
- `FieldRuntimeState<TData>` (canonical definition)
- `SelectFieldRuntimeData<TOption>`
- `RuntimeStoreConfig`
- `RuntimeStore` (interface - internal/advanced use only)

**Functions:**
- `createRuntimeStore(config): RuntimeStore` (internal)
- `useFieldRuntime<TData>(name): FieldRuntimeState<TData>` ⭐ **PRIMARY PUBLIC API**

### 5.2 Bridge APIs (via DashFormContext)

Available on `bridge` object from `useContext(DashFormContext)`:
- `bridge.getFieldRuntime?<TData>(name): FieldRuntimeState<TData>` (read)
- `bridge.setFieldRuntime?<TData>(name, patch): void` ⚠️ (write - orchestration only)
- `bridge.subscribeFieldRuntime?(name, listener): () => void` (subscribe)

**NOT EXPOSED:**
- ~~`bridge.runtimeStore`~~ (removed - no raw store access)
- ~~`bridge.reset`~~ (not exposed - internal utility only)

### 5.3 Usage Patterns & Boundaries

#### ✅ CORRECT: UI Components (Read-Only)

```typescript
import { useFieldRuntime, SelectFieldRuntimeData } from '@dashforge/forms';

function MySelect({ name }) {
  // ✅ CORRECT: UI uses hook for READ-ONLY access
  const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
  
  if (runtime.status === 'loading') return <Skeleton />;
  if (runtime.status === 'error') return <Alert>{runtime.error}</Alert>;
  
  const options = runtime.data?.options ?? [];
  return <Select name={name} options={options} />;
}
```

#### ✅ CORRECT: Reaction Handlers (Orchestration Write)

```typescript
import type { ReactionRunContext } from '@dashforge/forms';

const reaction = {
  id: 'fetch-cities',
  watch: ['country'],
  run: async (ctx: ReactionRunContext) => {
    // ✅ CORRECT: Reactions use setRuntime for orchestration
    ctx.setRuntime('city', { status: 'loading' });
    
    try {
      const cities = await fetchCities(ctx.getValue('country'));
      ctx.setRuntime('city', {
        status: 'ready',
        data: { options: cities },
      });
    } catch (err) {
      ctx.setRuntime('city', {
        status: 'error',
        error: err.message,
      });
    }
  },
};
```

#### ❌ WRONG: UI Calling setFieldRuntime

```typescript
function MySelect({ name }) {
  const bridge = useContext(DashFormContext);
  
  // ❌ WRONG: UI components must NOT call setFieldRuntime
  useEffect(() => {
    bridge?.setFieldRuntime?.(name, { status: 'loading' }); // FORBIDDEN
  }, []);
  
  // ✅ CORRECT: UI should only use useFieldRuntime hook
  const runtime = useFieldRuntime(name);
}
```

#### ❌ WRONG: Automatic reset() Coupling

```typescript
// ❌ WRONG: Do NOT couple runtime reset to RHF reset
function DashFormProvider({ onReset }) {
  const rhf = useForm();
  const runtimeStore = createRuntimeStore();
  
  const handleReset = () => {
    rhf.reset(); // RHF reset
    runtimeStore.reset(); // ❌ FORBIDDEN automatic coupling
  };
  
  // This step: NO automatic lifecycle coupling
  // Future: If needed, explicit manual reset only
}
```

---

## 6. Testing Strategy

### 6.1 Runtime Store Tests

**File:** `runtime/__tests__/createRuntimeStore.test.ts`

**Coverage:**
1. **Store Creation**
   - Creates store with default config
   - Creates store with debug enabled
   - Initializes with empty fields

2. **Lazy Field Creation**
   - `getFieldRuntime()` creates field on first read
   - `setFieldRuntime()` creates field on first write
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

5. **Subscriptions (CRITICAL - PER-FIELD ISOLATION)**
   - `subscribeFieldRuntime('country', ...)` fires on 'country' change
   - `subscribeFieldRuntime('country', ...)` does NOT fire on 'city' change ⚠️ CRITICAL
   - `subscribeFieldRuntime('city', ...)` does NOT fire on 'country' change ⚠️ CRITICAL
   - Multiple subscribers to same field receive same update
   - Unsubscribe function stops notifications

6. **Reset (Internal Utility)**
   - `reset()` clears all fields
   - `reset()` notifies all active subscribers
   - No automatic coupling tested (remains manual only)

### 6.2 useFieldRuntime Hook Tests

**File:** `hooks/__tests__/useFieldRuntime.test.tsx`

**Coverage:**
- Standalone mode (no provider, default state)
- Form mode (subscriptions, re-renders)
- Subscription isolation (field A change doesn't re-render field B hook)
- Type safety (generic TData)
- Concurrent rendering (no tearing)
- Cleanup on unmount

### 6.3 Integration Tests

**File:** `__tests__/runtime-integration.test.tsx`

**Coverage:**
1. **Provider → Store → Hook Flow**
   - Provider creates runtime store
   - Lazy field creation on first hook usage
   - `useFieldRuntime` subscribes correctly
   - Updates propagate to component

2. **Subscription Isolation (CRITICAL)**
   - Component A: `useFieldRuntime('country')`
   - Component B: `useFieldRuntime('city')`
   - Setting 'country' runtime → only Component A re-renders
   - Setting 'city' runtime → only Component B re-renders

3. **Boundary Compliance**
   - UI components cannot access `setFieldRuntime` accidentally
   - Type duplication between forms and ui-core is verified compatible

4. **Backward Compatibility**
   - Version strings still work
   - Existing components don't break

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

## 7. Policy Compliance Verification (EXPLICIT)

### From `/dashforge/.opencode/policies/reaction-v2.md`:

**✅ CONFIRMED: NO reconciliation logic**
- Runtime store only holds metadata (status, error, data)
- NO logic that modifies form values based on runtime state
- NO automatic value fixing or healing
- Runtime and form values remain completely separate

**✅ CONFIRMED: NO automatic value reset**
- NO logic that resets field values automatically
- `reset()` method is internal utility, not coupled to form lifecycle
- NO automatic synchronization between RHF reset and runtime reset
- Runtime reset remains manual-only in this step

**✅ CONFIRMED: NO UI logic in runtime or adapter**
- Runtime store is pure state management (no rendering)
- Adapter makes NO changes (zero UI involvement)
- NO visibility control in runtime layer
- NO layout logic in runtime layer
- `visibleWhen` remains fully in components

**✅ CONFIRMED: NO provider fan-out state**
- Runtime store uses Valtio proxy (NOT React state)
- Per-field subscriptions via `subscribeKey` (isolated)
- Provider memoization prevents re-renders
- NO React Context state changes that cause re-renders

**✅ CONFIRMED: RHF remains source of truth for values**
- Runtime store holds ONLY: status, error, data
- Form field values remain in RHF formState
- NO duplication of field values in runtime store
- Runtime layer is orthogonal to form values

**✅ CONFIRMED: Runtime state is atomic**
- Valtio proxy with per-field subscriptions
- `subscribeKey` ensures isolation
- NO monolithic state updates
- Each field subscribes independently

**✅ CONFIRMED: Reactions are mechanical (not implemented yet)**
- This step creates infrastructure only
- NO reaction logic added
- NO watch/when/run evaluation
- Future step 02 will add reactions

---

## 8. Constraints Verification

### Task Scope ✅

**IN SCOPE - Implemented:**
- ✅ Field runtime state model
- ✅ Atomic runtime store (lazy, per-field subscriptions)
- ✅ Adapter (no changes - pass-through)
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
- ✅ NO automatic resets
- ✅ NO visibility logic changes

### Architecture ✅

- ✅ Extends existing architecture (not parallel)
- ✅ No circular dependencies
- ✅ Package boundaries respected (ui-core → forms → ui)
- ✅ Provider owns store lifecycle (adapter is stateless)
- ✅ Lazy field creation (no explicit registration)
- ✅ Per-field subscription isolation (`subscribeKey`)
- ✅ Clear API boundaries (read vs write)

---

## 9. Risks & Mitigation

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
- Extensive JSDoc documents this is deliberate (not temporary)
- Both definitions must be updated together (enforced by task requirement)
- Runtime validation in dev mode

### Risk 3: Misuse of setFieldRuntime in UI
**Likelihood:** Low | **Impact:** Medium

**Mitigation:**
- Extensive JSDoc warnings on `setFieldRuntime`
- Bridge type documentation makes usage clear
- Hook documentation emphasizes read-only pattern
- Code review will catch misuse

### Risk 4: reset() Misunderstood as Automatic
**Likelihood:** Low | **Impact:** Medium

**Mitigation:**
- JSDoc explicitly states "NO automatic coupling"
- Method remains unused in this step
- Documentation emphasizes manual-only usage
- No automatic lifecycle hooks introduced

---

## 10. Success Criteria

### Must Have ✅
1. All typechecks pass (0 errors)
2. All unit tests pass (0 failures, 0 skipped)
3. Runtime store supports per-field subscriptions (via `subscribeKey`)
4. **CRITICAL:** Subscription isolation verified (field A change doesn't notify field B)
5. Lazy field creation works (no explicit registration needed)
6. useFieldRuntime works in form and standalone modes
7. Adapter makes NO changes (stateless pass-through)
8. No breaking changes to existing components
9. Version strings remain functional
10. **EXPLICIT:** No reconciliation logic introduced
11. **EXPLICIT:** No automatic value reset introduced
12. **EXPLICIT:** No UI logic in runtime or adapter
13. **EXPLICIT:** No provider-level state causing re-renders
14. All policy constraints verified

### Should Have ✅
1. Debug logging available
2. Safe defaults (no undefined chaos)
3. Concurrent-safe hook
4. Integration tests
5. JSDoc examples
6. Clear API boundary documentation

### Nice to Have
1. Performance benchmarks (lazy vs eager)
2. Storybook examples
3. DevTools integration

---

## 11. Key Differences from v2 Plan

| Aspect | v2 Plan | v3 Plan (FINAL) |
|--------|---------|-----------------|
| **setFieldRuntime** | General write API | ⚠️ Explicitly marked as internal orchestration (NOT for UI) |
| **reset()** | General utility | ⚠️ Internal utility, NO RHF coupling, unused by default |
| **Type Duplication** | "Temporary" / "avoid circular dependency" | ⚠️ DELIBERATE boundary decision (NOT temporary) |
| **Policy Verification** | Implicit | ✅ EXPLICIT confirmation of NO reconciliation, NO resets, NO UI logic, NO re-renders |
| **API Boundaries** | Informal | ✅ Clear read (UI) vs write (orchestration) boundaries |
| **Documentation** | Basic | ✅ Extensive JSDoc with warnings and usage patterns |

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

### 🔵 BOUNDARY: Type Duplication is Deliberate

```typescript
// ✅ CORRECT - acknowledge this is intentional
/**
 * Field runtime state shape (BOUNDARY CONTRACT).
 * 
 * ⚠️ DELIBERATE DUPLICATION - NOT TEMPORARY
 * 
 * This type is INTENTIONALLY duplicated from @dashforge/forms/runtime
 * as a deliberate boundary decision required by package separation.
 * 
 * Both definitions MUST stay aligned.
 * Any change to runtime shape MUST update BOTH sides in the same task.
 */
export interface FieldRuntimeState<TData = unknown> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  data: TData | null;
}

// ❌ WRONG - don't describe as "temporary workaround"
// "TODO: Remove duplication when possible" // BAD
```

### 🟣 ORCHESTRATION: setFieldRuntime Usage

```typescript
// ✅ CORRECT - reaction handler (future step)
const reaction = {
  run: async (ctx) => {
    ctx.setRuntime('city', { status: 'loading' }); // OK - orchestration
  }
};

// ❌ WRONG - UI component
function MySelect({ name }) {
  const bridge = useContext(DashFormContext);
  bridge?.setFieldRuntime?.(name, { status: 'loading' }); // FORBIDDEN
  
  // ✅ CORRECT - use hook instead
  const runtime = useFieldRuntime(name);
}
```

---

## 13. Follow-Up Tasks (Out of Scope)

1. **Step 02:** Reaction registration and execution engine
   - Define ReactionDefinition types
   - Implement reaction registry
   - Add watch/when/run evaluation
   - Integrate with runtime store via `setFieldRuntime`

2. **Step 03:** Select component runtime integration
   - Modify Select to use `useFieldRuntime`
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

1. Confirm v3 corrections address all concerns
2. Create feature branch: `feature/reactive-v2-step-01-runtime-store-v3`
3. Implement per phase sequence (Section 3)
4. **CRITICAL:** Verify subscription isolation test passes
5. **CRITICAL:** Verify NO reconciliation, NO automatic resets
6. Run validation tests continuously
7. Create implementation report
8. Commit: `feat(forms): add Reactive V2 runtime store (lazy, boundary-aware, orchestration APIs)`

**Estimated Time:** ~4 hours  
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
- **Valtio Utils:** `subscribeKey` for per-field isolation ⚠️ CRITICAL
- React: useSyncExternalStore (built-in React 18+ ✓)

---

**Plan Status:** ✅ Final Revision (v3) - Ready for Implementation  
**Key Clarifications:** API boundaries, reset() semantics, type duplication rationale, explicit policy compliance  
**Next Action:** User approval → Implementation
