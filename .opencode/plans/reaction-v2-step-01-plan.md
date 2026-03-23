# Reactive V2 - Step 01 Implementation Plan
## Runtime Store and Adapter

**Date:** Mon Mar 23 2026  
**Task:** `dashforge/.opencode/tasks/reaction-v2-step-01-runtime-store-and-adapter.md`  
**Policy:** `dashforge/.opencode/policies/reaction-v2.md`  
**Status:** Planning Phase Complete

---

## Executive Summary

This plan details the implementation of the foundational runtime state layer for Reactive V2. The goal is to introduce a **Valtio-based atomic runtime store** that manages per-field runtime metadata (loading, error, runtime data) separate from RHF's form values, while exposing clean adapter APIs and hooks for future reaction system integration.

**Key Principle:** This step builds ONLY the runtime infrastructure. NO reactions, NO reconciliation, NO automatic resets, NO Select behavior changes.

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
│ DashFormProvider                                                │
│  ├─ Creates Engine (reactive nodes for values)                  │
│  ├─ Creates RHF (form values, validation)                       │
│  ├─ Creates RuntimeStore (NEW - field runtime metadata)         │
│  ├─ Creates FormEngineAdapter (bridges all 3 layers)            │
│  └─ Provides DashFormContext (exposes runtime APIs)             │
│                                                                  │
│  New Runtime Layer:                                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ RuntimeStore (Valtio proxy)                               │ │
│  │  fields: {                                                 │ │
│  │    "countrySelect": {                                      │ │
│  │      status: 'loading' | 'ready' | 'error' | 'idle'       │ │
│  │      error: string | null                                  │ │
│  │      data: { options: [...] } | null                       │ │
│  │    }                                                        │ │
│  │  }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Benefits:
- Atomic per-field runtime subscriptions
- Dedicated layer for async metadata
- Future-ready for reaction system
- No provider fan-out re-renders
```

---

## 2. Detailed Component Design

### 2.1 Runtime State Types

**Location:** `libs/dashforge/forms/src/runtime/runtime.types.ts` (NEW FILE)

**Key Types:**

```typescript
export type FieldFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface FieldRuntimeState<TData = unknown> {
  status: FieldFetchStatus;
  error: string | null;
  data: TData | null;
}

export interface SelectFieldRuntimeData<TOption = unknown> {
  options: TOption[];
}

export interface RuntimeStoreState {
  fields: Record<string, FieldRuntimeState>;
}
```

---

### 2.2 Runtime Store Implementation

**Location:** `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (NEW FILE)

**Core Interface:**

```typescript
export interface RuntimeStore {
  getFieldRuntime<TData = unknown>(name: string): FieldRuntimeState<TData>;
  setFieldRuntime<TData = unknown>(name: string, patch: Partial<FieldRuntimeState<TData>>): void;
  subscribeFieldRuntime(name: string, listener: () => void): () => void;
  registerField(name: string): void;
  unregisterField(name: string): void;
  getRegisteredFields(): string[];
  reset(): void;
  getState(): RuntimeStoreState;
}
```

**Implementation Strategy:**
- Valtio `proxy()` for reactive state
- Per-field subscriptions via `subscribe(state.fields, ...)`
- Safe defaults: `{ status: 'idle', error: null, data: null }`
- Immutable reads via `snapshot()`
- Debug logging when enabled

---

### 2.3 Adapter Integration

**Location:** `libs/dashforge/forms/src/core/FormEngineAdapter.ts` (MODIFY)

**Changes:**
1. Add private `runtimeStore: RuntimeStore | null` property
2. Add `attachRuntimeStore(store: RuntimeStore)` method
3. Modify `registerField()` to call `runtimeStore.registerField()`
4. Modify `unregisterField()` to call `runtimeStore.unregisterField()`
5. Add `getRuntimeStore()` accessor (internal use)

**No changes to `IFormEngineAdapter` interface** - adapter only manages lifecycle

---

### 2.4 DashFormProvider Integration

**Location:** `libs/dashforge/forms/src/core/DashFormProvider.tsx` (MODIFY)

**Changes:**
1. Create runtime store via `useMemo(() => createRuntimeStore({ debug }), [debug])`
2. Attach store to adapter: `adapter.attachRuntimeStore(runtimeStore)`
3. Expose runtime APIs in bridgeValue:
   ```typescript
   runtimeStore,
   getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
   setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
   subscribeFieldRuntime: (name, listener) => runtimeStore.subscribeFieldRuntime(name, listener)
   ```
4. Keep version strings (backward compatibility)

---

### 2.5 Bridge Type Updates

**Location:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (MODIFY)

**Changes:**
1. Add `FieldRuntimeState` type (duplicated to avoid circular dependency)
2. Add optional `runtimeStore?: any` property
3. Add optional runtime APIs: `getFieldRuntime?`, `setFieldRuntime?`, `subscribeFieldRuntime?`
4. Mark version strings as `@deprecated`

**Type Duplication Rationale:**
- ui-core cannot import from forms (circular dependency)
- Duplicate type with integration test to verify sync
- Alternative (shared types package) rejected - too heavy for this case

---

### 2.6 Component Hook

**Location:** `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (NEW FILE)

**Implementation:**

```typescript
export function useFieldRuntime<TData = unknown>(
  name: string
): FieldRuntimeState<TData> {
  const bridge = useContext(DashFormContext);
  const runtimeStore = bridge?.runtimeStore;

  const subscribe = (onStoreChange: () => void) => {
    if (!runtimeStore?.subscribeFieldRuntime) {
      return () => {};
    }
    return runtimeStore.subscribeFieldRuntime(name, onStoreChange);
  };

  const getSnapshot = (): FieldRuntimeState<TData> => {
    if (!runtimeStore?.getFieldRuntime) {
      return { status: 'idle', error: null, data: null };
    }
    return runtimeStore.getFieldRuntime<TData>(name);
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

**Why `useSyncExternalStore`?**
- React 18+ concurrent-safe API
- Abstraction layer (UI doesn't need to know about Valtio)
- Prevents tearing in concurrent rendering

---

## 3. Implementation Sequence

| Phase | Task | Time | Files |
|-------|------|------|-------|
| 1 | Type Definitions | 30 min | `runtime/runtime.types.ts`, `runtime/index.ts` |
| 2 | Runtime Store | 1 hour | `runtime/createRuntimeStore.ts` + tests |
| 3 | Adapter Integration | 30 min | `core/FormEngineAdapter.ts` |
| 4 | Provider Integration | 45 min | `core/DashFormProvider.tsx` |
| 5 | Bridge Type Updates | 15 min | `ui-core/bridge/DashFormBridge.ts` |
| 6 | Component Hook | 30 min | `hooks/useFieldRuntime.ts` + tests |
| 7 | Testing | 1 hour | Integration tests, typecheck |
| 8 | Validation | 30 min | Full test suite, regression checks |

**Total:** ~4.5 hours

---

## 4. File Modification Summary

### New Files (6)
- `libs/dashforge/forms/src/runtime/runtime.types.ts` (~80 lines)
- `libs/dashforge/forms/src/runtime/createRuntimeStore.ts` (~150 lines)
- `libs/dashforge/forms/src/runtime/index.ts` (~10 lines)
- `libs/dashforge/forms/src/hooks/useFieldRuntime.ts` (~60 lines)
- `libs/dashforge/forms/src/runtime/__tests__/createRuntimeStore.test.ts` (~200 lines)
- `libs/dashforge/forms/src/hooks/__tests__/useFieldRuntime.test.tsx` (~150 lines)

### Modified Files (4)
- `libs/dashforge/forms/src/core/FormEngineAdapter.ts` (+40 lines, ~10 modified)
- `libs/dashforge/forms/src/core/DashFormProvider.tsx` (+30 lines, ~20 modified)
- `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` (+50 lines, ~5 modified)
- `libs/dashforge/forms/src/index.ts` (+5 lines exports)

**Total:** ~810 lines (including tests)

---

## 5. API Surface

### Public Exports (from @dashforge/forms)

**Types:**
- `FieldFetchStatus`
- `FieldRuntimeState<TData>`
- `SelectFieldRuntimeData<TOption>`
- `RuntimeStoreConfig`
- `RuntimeStore` (interface)

**Functions:**
- `createRuntimeStore(config): RuntimeStore` (for advanced use)
- `useFieldRuntime<TData>(name): FieldRuntimeState<TData>` (PRIMARY API)

### Bridge APIs (via DashFormContext)

Available on `bridge` object from `useContext(DashFormContext)`:
- `bridge.runtimeStore?: RuntimeStore`
- `bridge.getFieldRuntime?<TData>(name): FieldRuntimeState<TData>`
- `bridge.setFieldRuntime?<TData>(name, patch): void`
- `bridge.subscribeFieldRuntime?(name, listener): () => void`

### Usage Examples

**In UI components (recommended):**
```typescript
function MySelect({ name }) {
  const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
  
  if (runtime.status === 'loading') return <Skeleton />;
  if (runtime.status === 'error') return <Alert>{runtime.error}</Alert>;
  
  const options = runtime.data?.options ?? [];
  return <Select name={name} options={options} />;
}
```

**In future reaction handlers:**
```typescript
const reaction = {
  id: 'fetch-cities',
  watch: ['country'],
  run: async (ctx) => {
    ctx.setRuntime('city', { status: 'loading' });
    try {
      const cities = await fetchCities(ctx.getValue('country'));
      ctx.setRuntime('city', { status: 'ready', data: { options: cities } });
    } catch (err) {
      ctx.setRuntime('city', { status: 'error', error: err.message });
    }
  },
};
```

---

## 6. Testing Strategy

### 6.1 Runtime Store Tests

**File:** `runtime/__tests__/createRuntimeStore.test.ts`

**Coverage:**
- Store creation (default config, debug mode)
- Field registration (idempotency, unregister)
- Read operations (default state, immutability)
- Write operations (merge semantics, partial updates)
- Subscriptions (per-field, isolation, cleanup)
- Reset functionality

### 6.2 useFieldRuntime Hook Tests

**File:** `hooks/__tests__/useFieldRuntime.test.tsx`

**Coverage:**
- Standalone mode (no provider, default state)
- Form mode (subscriptions, re-renders)
- Type safety (generic TData)
- Concurrent rendering (no tearing)
- Cleanup on unmount

### 6.3 Integration Tests

**File:** `__tests__/runtime-integration.test.tsx`

**Coverage:**
- Provider → Store → Hook flow
- Adapter field lifecycle (register/unregister)
- Backward compatibility (version strings still work)

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

## 7. Constraints Verification

### Policy Compliance ✅

**From `/dashforge/.opencode/policies/reaction-v2.md`:**

- ✅ NO reconciliation logic
- ✅ NO automatic value reset
- ✅ NO visibleWhen logic moved
- ✅ NO provider fan-out state (Valtio atomic)
- ✅ RHF remains source of truth for values
- ✅ Runtime state is atomic
- ✅ Reactions are mechanical (not implemented yet)

### Task Scope ✅

**IN SCOPE - Implemented:**
- ✅ Field runtime state model
- ✅ Atomic runtime store
- ✅ Adapter APIs (get/set/subscribe)
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

---

## 8. Risks & Mitigation

### Risk 1: Valtio Subscription Performance
**Likelihood:** Low | **Impact:** Medium

**Mitigation:**
- Valtio designed for fine-grained subscriptions
- Engine uses same pattern successfully
- Will add performance tests

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

---

## 9. Success Criteria

### Must Have ✅
1. All typechecks pass (0 errors)
2. All unit tests pass (0 failures, 0 skipped)
3. Runtime store supports per-field subscriptions
4. useFieldRuntime works in form and standalone modes
5. Adapter correctly manages field lifecycle
6. No breaking changes to existing components
7. Version strings remain functional
8. No reconciliation/resets/visibility logic added
9. All policy constraints verified

### Should Have ✅
1. Debug logging available
2. Safe defaults (no undefined chaos)
3. Concurrent-safe hook
4. Integration tests
5. JSDoc examples

### Nice to Have
1. Performance benchmarks
2. Storybook examples
3. DevTools integration

---

## 10. Open Questions

### Q1: Valtio Subscription Strategy
**Plan:** Use `subscribe(state.fields, ...)` relying on Valtio's proxy tracking  
**Alternative:** Manual Map of listeners per field  
**Recommendation:** Valtio tracking (simpler, proven)  
**Confirm?** ✓ Use Valtio / ✗ Manual map

### Q2: Type Duplication
**Plan:** Duplicate `FieldRuntimeState` in ui-core bridge  
**Alternative:** Shared @dashforge/types package  
**Recommendation:** Duplicate with integration test  
**Confirm?** ✓ Duplicate / ✗ Shared package

### Q3: Version String Timeline
**Plan:** Mark deprecated, remove in Step 04 after migration  
**Alternative:** Keep indefinitely or major version only  
**Recommendation:** Remove after TextField/Select migration  
**Confirm?** ✓ Remove Step 04 / ✗ Keep / ✗ Major version

### Q4: Debug Logging
**Plan:** Per-provider debug flag (from DashFormProvider)  
**Alternative:** Global environment variable  
**Recommendation:** Per-provider (current pattern)  
**Confirm?** ✓ Per-provider / ✗ Global

---

## 11. Follow-Up Tasks (Out of Scope)

1. **Step 02:** Reaction registration and execution engine
2. **Step 03:** Select component runtime integration
3. **Step 04:** TextField migration to useFieldRuntime
4. **Step 05:** Deprecate version strings

---

## 12. Next Steps

**After plan approval:**

1. Address open questions (Q1-Q4)
2. Create feature branch: `feature/reactive-v2-step-01-runtime-store`
3. Implement per phase sequence (Section 3)
4. Run validation continuously
5. Create implementation report
6. Commit: `feat(forms): add Reactive V2 runtime store and adapter APIs`

**Estimated Time:** 4.5 hours  
**Approach:** Single focused session

---

## 13. References

### Task Files
- Task: `.opencode/tasks/reaction-v2-step-01-runtime-store-and-adapter.md`
- Policy: `.opencode/policies/reaction-v2.md`

### Key Files
- DashFormProvider: `libs/dashforge/forms/src/core/DashFormProvider.tsx`
- FormEngineAdapter: `libs/dashforge/forms/src/core/FormEngineAdapter.ts`
- DashFormBridge: `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`
- Engine Store: `libs/dashforge/ui-core/src/store/createStore.ts`

### Dependencies
- Valtio: v2.3.0 (already installed ✓)
- React: useSyncExternalStore (built-in React 18+ ✓)

---

**Plan Status:** ✅ Ready for Review  
**Next Action:** User approval → Implementation
