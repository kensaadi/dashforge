## dashforge/.opencode/reports/reaction-v2-step-02-plan-v2.md

Reactive V2 - Step 02 Implementation Plan (v2)
Reaction Engine
Date: Mon Mar 23 2026  
Task: dashforge/.opencode/tasks/reaction-v2-step-02-reaction-engine.md  
Policy: dashforge/.opencode/policies/reaction-v2.md (MANDATORY)  
Status: 📋 PLAN (Read-only, no implementation)  
Version: v2 (Clarified initial evaluation lifecycle)

---

Executive Summary
This plan defines the implementation strategy for Step 02: Reaction Engine, building on the runtime store foundation from Step 01. The goal is to introduce a mechanical, condition-driven reaction system that executes side effects when watched fields change, WITHOUT introducing reconciliation, automatic value resets, or UI logic.
Key Architectural Decisions (User-Approved)

1. Provider owns reaction registry - DashFormProvider creates and manages reactions, similar to runtime store ownership
2. Initial evaluation after form initialization - Run initial evaluation cycle once after RHF defaultValues are synced to engine (see detailed lifecycle below)
3. Declarative registration via provider prop - Pass reactions={[...]} to DashFormProvider for clear, declarative lifecycle

---

Goals
Primary Goal
Create the minimum correct reaction engine required for Reactive V2 so that later steps can connect Select runtime data loading to field changes in a centralized, testable way.
Success Criteria (Must Have)

1. ✅ Reaction definition model implemented
2. ✅ Reaction registration via provider prop
3. ✅ Watch-based triggering (field changes execute reactions)
4. ✅ Optional when condition evaluation
5. ✅ Sync and async run handlers supported
6. ✅ Initial evaluation cycle on startup (deterministic lifecycle)
7. ✅ Async staleness primitives (beginAsync, isLatest)
8. ✅ All typechecks pass (0 errors)
9. ✅ Comprehensive unit tests (targeting 30+ tests)
10. ✅ EXPLICIT: No reconciliation logic introduced
11. ✅ EXPLICIT: No automatic value reset introduced
12. ✅ EXPLICIT: No UI logic in reactions
13. ✅ EXPLICIT: No provider-level state causing re-renders
14. ✅ Existing tests still pass (43/43 from Step 01)
    Should Have
15. Debug logging for reaction execution
16. Clear error messages for invalid reactions
17. JSDoc with usage examples
18. Integration test for realistic scenario
19. Performance considerations (avoid unnecessary evaluations)

---

Initial Evaluation Lifecycle (CRITICAL CLARIFICATION)
Deterministic Sequence
The initial evaluation cycle MUST follow this exact sequence:
Phase 1: Construction (Synchronous)
├─ 1. DashFormProvider receives defaultValues prop
├─ 2. RHF useForm() hook initializes with defaultValues
├─ 3. Engine created (createEngine)
├─ 4. RuntimeStore created (createRuntimeStore)
├─ 5. Adapter created (FormEngineAdapter)
└─ 6. ReactionRegistry created (createReactionRegistry)
└─ reactions registered, watch index built
└─ NO EVALUATION YET ⚠️
Phase 2: Field Registration (Synchronous, during render)
├─ 7. Form fields mount and call bridge.register()
├─ 8. Adapter.registerField() creates Engine nodes
└─ 9. Initial RHF values synced to Engine nodes
└─ Engine nodes now contain defaultValues
└─ NO REACTION EVALUATION YET ⚠️
Phase 3: Initial Evaluation (After Mount)
├─ 10. DashFormProvider useEffect runs (after initial render)
├─ 11. ReactionRegistry.evaluateAll() called ONCE
├─ 12. All reactions evaluated against current Engine state
└─ 13. Initial conditions checked, run() executed if true
└─ This is the ONLY initial evaluation ✅
Key Guarantees

1. Values are available - RHF defaultValues are already synced into Engine nodes by the time evaluateAll() runs
2. Deterministic timing - Initial evaluation happens ONCE in useEffect, after construction and field registration
3. No ambiguity - This is NOT "on first render" or "when values change" - it's a specific lifecycle hook
4. No double execution - Initial evaluation and field-change evaluation are separate code paths
   Implementation Strategy
   In DashFormProvider.tsx:
   // Phase 1: Construction (useMemo - synchronous)
   const reactionRegistry = useMemo(() => {
   if (!reactions || reactions.length === 0) return null;

const registry = createReactionRegistry<TFieldValues>({
debug,
getValue: (name) => {
const node = engine.getNode(name);
if (node) return node.value;
return rhf.getValues(name as FieldPath<TFieldValues>);
},
getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
});
// Register reactions (builds watch index, no evaluation)
registry.registerReactions(reactions);

if (debug) {
console.log('[DashFormProvider] ReactionRegistry created', {
reactionCount: reactions.length,
note: 'Initial evaluation will run in useEffect',
});
}
return registry;
}, [reactions, debug, engine, rhf, runtimeStore]);
// Phase 3: Initial Evaluation (useEffect - after mount)
useEffect(() => {
if (!reactionRegistry) return;
if (debug) {
console.log('[DashFormProvider] Running initial evaluation cycle', {
timing: 'after mount, values synced to engine',
guarantee: 'RHF defaultValues available in engine nodes',
});
}
// Execute initial evaluation ONCE
// At this point:
// - RHF has defaultValues
// - Engine nodes created and synced during field registration
// - All values are available for reactions to read
reactionRegistry.evaluateAll();
if (debug) {
console.log('[DashFormProvider] Initial evaluation complete');
}
}, [reactionRegistry, debug]);
Why This Approach

1. Values guaranteed available - By the time useEffect runs, all form fields have mounted and registered, syncing defaultValues into engine
2. No race conditions - useEffect runs after render commit, so field registration is complete
3. Deterministic - Always runs exactly once, in predictable order
4. Testable - Can verify initial evaluation by checking runtime state after mount
5. Aligned with React lifecycle - Uses standard React patterns, not custom timing logic

---

Architecture Overview
Component Responsibilities (Post-Step 02)
DashFormProvider (ORCHESTRATION HUB)
├─ Engine (reactive nodes for values) ← getValue source
├─ RHF (form values, validation) ← getValue fallback
├─ RuntimeStore (field runtime metadata) ← setRuntime target
├─ ReactionRegistry (NEW - reaction definitions + execution)
│ ├─ registerReactions() - builds watch index
│ ├─ evaluateAll() - initial evaluation (once)
│ └─ evaluateForField() - incremental evaluation
├─ FormEngineAdapter (MODIFIED - value sync callbacks)
└─ DashFormContext (bridge - no new APIs)
Reaction Flow (Initial):

1. Provider mounts, creates registry
2. Fields mount, register with adapter
3. Adapter creates engine nodes with defaultValues
4. Provider useEffect runs
5. Registry.evaluateAll() executes all reactions
6. Reactions check conditions, execute run()
7. Runtime state updated via setRuntime()
   Reaction Flow (Field Change):
8. User changes field value
9. RHF onChange → Adapter syncValueToEngine
10. Adapter calls value sync callbacks
11. Registry.evaluateForField(fieldName) executes
12. Affected reactions evaluated (when condition check)
13. run() executes if condition true
14. Runtime state updated via setRuntime()
15. useFieldRuntime hook re-renders UI
    Data Flow Diagram
    ┌─────────────────────────────────────────────────────────────┐
    │ DashFormProvider Construction (Synchronous) │
    │ │
    │ 1. Create Engine │
    │ 2. Create RHF (with defaultValues) │
    │ 3. Create RuntimeStore │
    │ 4. Create Adapter │
    │ 5. Create ReactionRegistry ★ NEW │
    │ └─ registerReactions() (builds watch index) │
    │ └─ NO EVALUATION YET │
    └─────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────┐
    │ Field Registration Phase (During Render) │
    │ │
    │ Form fields mount → bridge.register() │
    │ ↓ │
    │ Adapter.registerField() │
    │ ↓ │
    │ Engine.registerNode(id, value=defaultValue) │
    │ ↓ │
    │ Engine nodes now contain RHF defaultValues │
    │ NO REACTION EVALUATION YET │
    └─────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────┐
    │ Initial Evaluation (useEffect - After Mount) ★ CRITICAL │
    │ │
    │ Provider useEffect runs │
    │ ↓ │
    │ ReactionRegistry.evaluateAll() │
    │ ↓ │
    │ For each reaction: │
    │ 1. Check when() condition (if present) │
    │ 2. If true/absent → execute run() │
    │ 3. run() reads getValue (from engine/RHF) │
    │ 4. run() calls setRuntime() to update state │
    │ ↓ │
    │ Initial runtime state populated │
    │ (e.g., fetch options based on defaultValues) │
    └─────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────┐
    │ Runtime Execution (Field Change - Incremental) │
    │ │
    │ User types → RHF onChange → Adapter.syncValueToEngine() │
    │ ↓ │
    │ Engine.updateNode() │
    │ ↓ │
    │ Adapter value sync callbacks fire │
    │ ↓ │
    │ Registry.evaluateForField(fieldName) │
    │ ↓ │
    │ Find reactions watching this field (watch index) │
    │ ↓ │
    │ For each affected reaction: │
    │ 1. Check when() condition │
    │ 2. If true → execute run() │
    │ 3. run() calls setRuntime() │
    │ ↓ │
    │ RuntimeStore updated │
    │ ↓ │
    │ useFieldRuntime hook re-renders components │
    └─────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────┐
    │ Async Staleness (Async run Handler) │
    │ │
    │ run() calls beginAsync('fetch-cities') → requestId=1 │
    │ ↓ │
    │ User changes field again │
    │ ↓ │
    │ run() calls beginAsync('fetch-cities') → requestId=2 │
    │ ↓ │
    │ First async completes, checks isLatest(1) │
    │ ↓ │
    │ isLatest returns false → ignore response │
    │ ↓ │
    │ Second async completes, checks isLatest(2) │
    │ ↓ │
    │ isLatest returns true → apply response │
    └─────────────────────────────────────────────────────────────┘

---

## Policy Compliance (Critical)

### From `dashforge/.opencode/policies/reaction-v2.md`

#### ✅ Reactions are mechanical (NOT semantic)

- Reactions ONLY observe watch fields and execute run when condition is true
- NO parent/child semantics
- NO domain meaning (e.g., "dependent field")
- NO data correction or healing

#### ✅ RHF remains source of truth for form values

- Reactions read values via getValue (from RHF)
- Reactions write runtime state via setRuntime (to RuntimeStore)
- NO value reconciliation
- NO automatic value mutation

#### ✅ Runtime state is separate from form values

- Reactions update runtime status/error/data ONLY
- NO modification of form values (unless explicitly coded for specific use case)

#### ✅ Runtime state must be atomic

- ReactionRegistry does NOT use React state
- NO provider re-renders triggered by reaction execution
- Subscriptions via Adapter callbacks (deterministic field change notifications)

#### ✅ No automatic reconciliation

- NO automatic reset of field values
- NO fixing inconsistent data
- NO enforcing value validity

#### ✅ No UI responsibility in reactions

- NO visibility control
- NO layout control
- NO UI state in reactions
- `visibleWhen` remains fully in components

---

Implementation Plan
Phase 1: Type Definitions (30-45 min)
File: libs/dashforge/forms/src/reactions/reaction.types.ts (NEW)
Types to Define:
/\*\*

- Context provided to when condition evaluation.
- Read-only access to form values.
  \*/
  export interface ReactionWhenContext {
  /\*\*
  - Get current value of a field.
  - Reads from Engine first, fallback to RHF.
  -
  - @param name - Field name
  - @returns Current value (unknown type, consumer must cast)
    \*/
    getValue: <T = unknown>(name: string) => T;
    }
    /\*\*
- Context provided to run execution.
- Read access to values/runtime, write access to runtime only.
  \*/
  export interface ReactionRunContext<TFieldValues = FieldValues> {
  /\*\*
  - Get current value of a field.
  - Same as when context.
    \*/
    getValue: <T = unknown>(name: string) => T;
    /\*\*
  - Get runtime state for a field (read-only).
  - Returns default state if field not yet accessed.
    \*/
    getRuntime: <TData = unknown>(name: string) => FieldRuntimeState<TData>;
    /\*\*
  - Update runtime state for a field (write).
  - ⚠️ INTERNAL ORCHESTRATION - reactions only
    \*/
    setRuntime: <TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
    ) => void;
    /\*\*
  - Begin async operation and get request ID.
  - Used for staleness tracking.
  -
  - @param key - Unique key for async operation (e.g., 'fetch-cities')
  - @returns Request ID for staleness check
    \*/
    beginAsync: (key: string) => number;
    /\*\*
  - Check if request is latest for given key.
  - Used to discard stale async responses.
  -
  - @param key - Async operation key
  - @param requestId - Request ID from beginAsync
  - @returns True if this is the latest request
    \*/
    isLatest: (key: string, requestId: number) => boolean;
    }
    /\*\*
- Reaction definition (mechanical, condition-driven).
-
- A reaction observes field changes and executes side effects
- when conditions are met. Reactions are NOT semantic - they
- do not encode business meaning or domain logic.
  \*/
  export interface ReactionDefinition<TFieldValues = FieldValues> {
  /\*\*
  - Unique identifier for this reaction.
  - Used for debugging and registry management.
    \*/
    id: string;
    /\*\*
  - Field names to watch for changes.
  - When any watched field changes, this reaction is evaluated.
  -
  - @example ['country', 'region']
    \*/
    watch: string[];
    /\*\*
  - Optional condition that must be true for run to execute.
  - If omitted, run always executes when watched field changes.
  -
  - @param ctx - Context with getValue
  - @returns True if run should execute
  -
  - @example
  - when: (ctx) => Boolean(ctx.getValue('country'))
    \*/
    when?: (ctx: ReactionWhenContext) => boolean;
    /\*\*
  - Effect to execute when condition is met.
  - Can be sync or async. Async handlers should use
  - beginAsync/isLatest for staleness tracking.
  -
  - @param ctx - Context with getValue, getRuntime, setRuntime, async helpers
  -
  - @example
  - run: async (ctx) => {
  - const country = ctx.getValue<string>('country');
  - const requestId = ctx.beginAsync('fetch-cities');
  -
  - ctx.setRuntime('city', { status: 'loading' });
  -
  - const cities = await fetchCities(country);
  -
  - if (ctx.isLatest('fetch-cities', requestId)) {
  -     ctx.setRuntime('city', {
  -       status: 'ready',
  -       data: { options: cities },
  -     });
  - }
  - }
    \*/
    run: (ctx: ReactionRunContext<TFieldValues>) => void | Promise<void>;
    }
    /\*\*
- Configuration for reaction registry.
  \*/
  export interface ReactionRegistryConfig {
  /\*\*
  - Enable debug logging.
    \*/
    debug?: boolean;
    }
    Additional Internal Types:
    /\*\*
- Internal mapping of field name → reaction IDs.
- Used for efficient lookup of reactions affected by field change.
  \*/
  type WatchIndex = Map<string, Set<string>>;
  /\*\*
- Async request tracking state.
- Maps async operation key → latest request ID.
  _/
  type AsyncRequestTracker = Map<string, number>;
  Exports:
  export type {
  ReactionWhenContext,
  ReactionRunContext,
  ReactionDefinition,
  ReactionRegistryConfig,
  };
  File: libs/dashforge/forms/src/reactions/index.ts (NEW)
  export _ from './reaction.types';
  export \* from './createReactionRegistry';
  Validation:

* All types must compile with strict TypeScript
* Generic constraints must be explicit
* No any types
* No unsafe casts

---

Phase 2: Reaction Registry Implementation (1.5-2 hours)
File: libs/dashforge/forms/src/reactions/createReactionRegistry.ts (NEW)
Interface:
export interface ReactionRegistry<TFieldValues = FieldValues> {
/\*\*

- Register multiple reactions in a batch.
- Builds internal watch index for efficient lookup.
- Does NOT trigger evaluation.
-
- @param reactions - Array of reaction definitions
  \*/
  registerReactions(reactions: ReactionDefinition<TFieldValues>[]): void;
  /\*\*
- Evaluate all reactions (initial evaluation).
- Should be called once after form initialization.
-
- Evaluates every reaction:
- - Check when condition (if present)
- - Execute run if condition true or absent
-
- Does NOT introduce hierarchy or root field semantics.
  \*/
  evaluateAll(): void;
  /\*\*
- Evaluate reactions affected by specific field change.
-
- @param fieldName - Name of field that changed
  \*/
  evaluateForField(fieldName: string): void;
  /\*\*
- Get all registered reactions (for debugging/testing).
  \*/
  getReactions(): ReactionDefinition<TFieldValues>[];
  /\*\*
- Reset registry (clear all reactions).
- Used for testing and cleanup.
  \*/
  reset(): void;
  }
  Implementation Strategy:
  export function createReactionRegistry<TFieldValues = FieldValues>(
  config: ReactionRegistryConfig & {
  // Dependencies injected for testability
  getValue: (name: string) => unknown;
  getFieldRuntime: <TData>(name: string) => FieldRuntimeState<TData>;
  setFieldRuntime: <TData>(name: string, patch: Partial<FieldRuntimeState<TData>>) => void;
  }
  ): ReactionRegistry<TFieldValues> {
  const { debug = false, getValue, getFieldRuntime, setFieldRuntime } = config;
  // Internal state (NOT React state)
  const reactions: ReactionDefinition<TFieldValues>[] = [];
  const watchIndex: WatchIndex = new Map();
  const asyncTracker: AsyncRequestTracker = new Map();
  // Build context factories
  function createWhenContext(): ReactionWhenContext {
  return { getValue: (name) => getValue(name) };
  }
  function createRunContext(): ReactionRunContext<TFieldValues> {
  return {
  getValue: (name) => getValue(name),
  getRuntime: (name) => getFieldRuntime(name),
  setRuntime: (name, patch) => setFieldRuntime(name, patch),
  beginAsync: (key: string) => {
  const requestId = (asyncTracker.get(key) ?? 0) + 1;
  asyncTracker.set(key, requestId);
  if (debug) {
  console.log('[ReactionRegistry] beginAsync', { key, requestId });
  }
  return requestId;
  },
  isLatest: (key: string, requestId: number) => {
  const latest = asyncTracker.get(key) ?? 0;
  const isLatest = requestId === latest;
  if (debug) {
  console.log('[ReactionRegistry] isLatest', { key, requestId, latest, isLatest });
  }
  return isLatest;
  },
  };
  }
  // Execute single reaction
  async function executeReaction(reaction: ReactionDefinition<TFieldValues>): Promise<void> {
  if (debug) {
  console.log('[ReactionRegistry] Evaluating reaction', { id: reaction.id });
  }
  // Check when condition (if present)
  if (reaction.when) {
  const whenCtx = createWhenContext();
  const conditionResult = reaction.when(whenCtx);
        if (debug) {
          console.log('[ReactionRegistry] When condition result', {
            id: reaction.id,
            result: conditionResult,
          });
        }
        if (!conditionResult) {
          if (debug) {
            console.log('[ReactionRegistry] Skipping reaction (condition false)', {
              id: reaction.id,
            });
          }
          return;
        }
      }
      // Execute run
      if (debug) {
        console.log('[ReactionRegistry] Executing run', { id: reaction.id });
      }
      const runCtx = createRunContext();


    try {
      const result = reaction.run(runCtx);

      // Handle async run
      if (result && typeof result.then === 'function') {
        await result;
      }

      if (debug) {
        console.log('[ReactionRegistry] Run completed', { id: reaction.id });
      }
    } catch (error) {
      console.error('[ReactionRegistry] Run failed', {
        id: reaction.id,
        error,
      });
      // Don't rethrow - reactions should not crash the app
    }

}
return {
registerReactions(reactionList: ReactionDefinition<TFieldValues>[]): void {
if (debug) {
console.log('[ReactionRegistry] Registering reactions', {
count: reactionList.length,
});
}
// Add to internal array
reactions.push(...reactionList);
// Build watch index for efficient lookup
for (const reaction of reactionList) {
for (const fieldName of reaction.watch) {
if (!watchIndex.has(fieldName)) {
watchIndex.set(fieldName, new Set());
}
watchIndex.get(fieldName)!.add(reaction.id);
}
}
if (debug) {
console.log('[ReactionRegistry] Watch index built', {
fields: Array.from(watchIndex.keys()),
});
}
},
evaluateAll(): void {
if (debug) {
console.log('[ReactionRegistry] Evaluating all reactions', {
count: reactions.length,
});
}
// Execute all reactions (no hierarchy, no ordering)
for (const reaction of reactions) {
// Fire and forget (don't await - allow parallel execution)
void executeReaction(reaction);
}
},
evaluateForField(fieldName: string): void {
if (debug) {
console.log('[ReactionRegistry] Evaluating reactions for field', {
fieldName,
});
}
// Find reactions watching this field
const reactionIds = watchIndex.get(fieldName);
if (!reactionIds || reactionIds.size === 0) {
if (debug) {
console.log('[ReactionRegistry] No reactions watching field', {
fieldName,
});
}
return;
}
if (debug) {
console.log('[ReactionRegistry] Found reactions for field', {
fieldName,
count: reactionIds.size,
ids: Array.from(reactionIds),
});
}
// Execute affected reactions
for (const reactionId of reactionIds) {
const reaction = reactions.find((r) => r.id === reactionId);
if (reaction) {
// Fire and forget
void executeReaction(reaction);
}
}
},
getReactions(): ReactionDefinition<TFieldValues>[] {
return [...reactions];
},
reset(): void {
reactions.length = 0;
watchIndex.clear();
asyncTracker.clear();
if (debug) {
console.log('[ReactionRegistry] Reset complete');
}
},
};
}
Key Design Decisions:

1. No React state - Registry uses plain arrays/maps, not reactive state
2. Injected dependencies - getValue, getFieldRuntime, setFieldRuntime passed in constructor for testability
3. Fire-and-forget async - Reactions execute without blocking (use void executeReaction())
4. No error propagation - Failed reactions log error but don't crash app
5. Watch index - Map<fieldName, Set<reactionIds>> for O(1) lookup
6. Async staleness - Simple counter-based tracking per operation key
   Edge Cases Handled:

- Multiple reactions watching same field (all execute)
- Async reactions completing out of order (isLatest check)
- Reaction throws error (caught, logged, app continues)
- Field with no watchers (no-op)
- Empty reactions array (safe no-op)

---

Phase 3: Provider Integration (45-60 min)
File: libs/dashforge/forms/src/core/DashFormProvider.tsx (MODIFY)
Changes Required:

1. Add reactions prop:
   export interface DashFormProviderProps<TFieldValues extends FieldValues = FieldValues> {
   children: ReactNode;
   engine?: Engine;
   defaultValues?: DefaultValues<TFieldValues>;
   debug?: boolean;
   mode?: 'onChange' | 'onBlur' | 'onSubmit';

// NEW: Reaction definitions
reactions?: ReactionDefinition<TFieldValues>[];
} 2. Create reaction registry in useMemo:
// After runtimeStore creation, before bridgeValue
// NEW: Create reaction registry (PROVIDER OWNS IT)
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
// Try engine first, fallback to RHF
const node = engine.getNode(name);
if (node) return node.value;
return rhf.getValues(name as FieldPath<TFieldValues>);
},
getFieldRuntime: (name: string) => runtimeStore.getFieldRuntime(name),
setFieldRuntime: (name: string, patch: unknown) => runtimeStore.setFieldRuntime(name, patch),
});
// Register all reactions (builds watch index, no evaluation)
registry.registerReactions(reactions);
if (debug) {
console.log('[DashFormProvider] Created ReactionRegistry', {
reactionCount: reactions.length,
note: 'Initial evaluation will run in useEffect after mount',
});
}
return registry;
}, [reactions, debug, engine, rhf, runtimeStore]); 3. Add initial evaluation in useEffect:
// NEW: Initial evaluation cycle (runs once after mount)
// At this point:
// - RHF has initialized with defaultValues
// - Form fields have mounted and registered
// - Engine nodes created with defaultValues synced
// - All values available for reactions to read
useEffect(() => {
if (!reactionRegistry) return;
if (debug) {
console.log('[DashFormProvider] Running initial evaluation cycle', {
timing: 'useEffect after mount',
guarantee: 'RHF defaultValues synced into engine nodes',
});
}
// Execute initial evaluation ONCE
reactionRegistry.evaluateAll();
if (debug) {
console.log('[DashFormProvider] Initial evaluation complete');
}
}, [reactionRegistry, debug]); 4. Subscribe to adapter for incremental evaluation:
// NEW: Subscribe to adapter value sync for incremental evaluation
useEffect(() => {
if (!reactionRegistry) return;
if (debug) {
console.log('[DashFormProvider] Subscribing to adapter for reaction evaluation');
}
const unsubscribe = adapter.addOnValueSyncListener((fieldName) => {
if (debug) {
console.log('[DashFormProvider] Field synced, evaluating reactions', {
fieldName,
});
}
reactionRegistry.evaluateForField(fieldName);
});
return () => {
if (debug) {
console.log('[DashFormProvider] Unsubscribing from adapter');
}
unsubscribe();
};
}, [reactionRegistry, adapter, debug]);
Dependencies Updated:
const bridgeValue = useMemo<DashFormBridge>(
() => ({ /_ ... existing ... _/ }),
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
// NOTE: reactionRegistry NOT in dependencies (no bridge exposure)
]
);
Summary of Provider Changes:

- Add reactions prop to props interface
- Create reaction registry in useMemo (with injected deps)
- Run initial evaluation in useEffect (once, after mount, values guaranteed available)
- Subscribe to adapter value sync for incremental evaluation
- NO bridge API changes (reactions are internal orchestration)

---

Phase 4: Adapter Enhancement (15-30 min)
File: libs/dashforge/forms/src/core/FormEngineAdapter.ts (MODIFY)
Changes Required:

1. Add callback array:
   private onValueSyncCallbacks: ((fieldName: string) => void)[] = [];
2. Add listener registration method:
   /\*\*

- Add listener for value sync events.
- Called after syncValueToEngine updates engine node.
- Used by reaction system for incremental evaluation.
-
- @param callback - Function called with changed field name
- @returns Unsubscribe function
-
- @internal
  \*/
  addOnValueSyncListener(callback: (fieldName: string) => void): () => void {
  this.onValueSyncCallbacks.push(callback);

if (this.debug) {
console.log('[FormEngineAdapter] Value sync listener added', {
totalListeners: this.onValueSyncCallbacks.length,
});
}
return () => {
const index = this.onValueSyncCallbacks.indexOf(callback);
if (index > -1) {
this.onValueSyncCallbacks.splice(index, 1);

      if (this.debug) {
        console.log('[FormEngineAdapter] Value sync listener removed', {
          totalListeners: this.onValueSyncCallbacks.length,
        });
      }
    }

};
} 3. Notify callbacks in syncValueToEngine:
syncValueToEngine(name: FieldPath<TFieldValues>, value: unknown): void {
const fieldName = String(name);
if (!this.registeredFields.has(fieldName)) {
if (this.debug) {
console.warn(
`[FormEngineAdapter] Attempted to sync unregistered field: ${fieldName}`
);
}
return;
}
if (this.debug) {
console.log(
`[FormEngineAdapter] Syncing value to engine: ${fieldName}`,
value
);
}
this.engine.updateNode(fieldName, { value });

// NEW: Notify listeners (for reaction evaluation)
for (const callback of this.onValueSyncCallbacks) {
callback(fieldName);
}
}
Validation:

- Adapter remains stateless (callbacks don't introduce state)
- Clean unsubscribe pattern
- Minimal changes (3 additions, 1 modification)

---

Phase 5: Type Exports (5-10 min)
File: libs/dashforge/forms/src/index.ts (MODIFY)
Add Exports:
// Reaction Types
export type {
ReactionDefinition,
ReactionWhenContext,
ReactionRunContext,
ReactionRegistryConfig,
} from './reactions/reaction.types';
// Reaction Registry (advanced/internal use)
export type { ReactionRegistry } from './reactions/createReactionRegistry';
export { createReactionRegistry } from './reactions/createReactionRegistry';
Note: Registry factory exported for testing, but typical users only need ReactionDefinition type.

---

Phase 6: Unit Tests (2-3 hours)
File: libs/dashforge/forms/src/reactions/**tests**/createReactionRegistry.test.ts (NEW)
Test Coverage (Target: 30+ tests):
6.1 Registry Creation

- ✅ Creates registry with default config
- ✅ Creates registry with debug enabled
- ✅ Registry starts empty
  6.2 Reaction Registration
- ✅ Registers single reaction
- ✅ Registers multiple reactions in batch
- ✅ Builds watch index correctly
- ✅ Handles reactions with multiple watch fields
- ✅ getReactions returns all registered reactions
  6.3 When Condition Evaluation
- ✅ Executes run when condition is true
- ✅ Skips run when condition is false
- ✅ Executes run when condition is omitted (always true)
- ✅ When context provides getValue access
- ✅ When condition can read multiple fields
  6.4 Run Execution
- ✅ Executes sync run handler
- ✅ Executes async run handler (awaits completion)
- ✅ Run context provides getValue
- ✅ Run context provides getRuntime
- ✅ Run context provides setRuntime
- ✅ Multiple reactions can watch same field (all execute)
  6.5 Async Staleness Tracking
- ✅ beginAsync returns incrementing request IDs
- ✅ isLatest returns true for latest request
- ✅ isLatest returns false for stale request
- ✅ Multiple async operations tracked separately by key
- ✅ Async staleness prevents stale data overwrites
  6.6 Field Change Evaluation
- ✅ evaluateForField executes matching reactions
- ✅ evaluateForField ignores non-watched fields
- ✅ evaluateForField handles field with no watchers (no-op)
- ✅ evaluateForField respects when conditions
  6.7 Initial Evaluation
- ✅ evaluateAll executes all reactions
- ✅ evaluateAll respects when conditions
- ✅ evaluateAll works with empty registry (no-op)
  6.8 Error Handling
- ✅ Reaction error does not crash registry
- ✅ Reaction error is logged (console.error)
- ✅ Other reactions continue after one fails
  6.9 Edge Cases
- ✅ Empty reactions array (safe no-op)
- ✅ Reaction watches non-existent field (no crash)
- ✅ getValue returns undefined for missing field
- ✅ Reset clears all state

---

Phase 7: Integration Tests (1-1.5 hours)
File: libs/dashforge/forms/src/reactions/**tests**/reactionIntegration.test.ts (NEW)
Integration Test Scenarios:

1. Complete flow: field change → reaction → runtime update
2. Initial evaluation populates runtime state based on defaultValues
3. Multiple reactions watching same field execute correctly
4. Async staleness prevents stale data overwrites in realistic scenario

---

Phase 8: Validation & Testing (30-45 min)
Commands to Run:

# Typecheck all packages

npx nx run @dashforge/forms:typecheck
npx nx run @dashforge/ui-core:typecheck
npx nx run @dashforge/ui:typecheck

# Run all tests

npx nx run @dashforge/forms:test

# Expected results:

# - 0 type errors

# - 73+ tests passing (43 from Step 01 + 30+ new)

# - 0 skipped tests

Manual Validation Checklist:

- [ ] All typechecks pass
- [ ] All tests pass (including Step 01 tests)
- [ ] No console warnings during test run
- [ ] Debug logging works when enabled
- [ ] Error handling graceful (reactions don't crash app)
- [ ] Initial evaluation runs once after mount
- [ ] Initial evaluation has access to defaultValues

---

Phase 9: Documentation & Final Report (30-45 min)
File: dashforge/.opencode/reports/reaction-v2-step-02-build.md (CREATE)
Report must include:

- File-by-file changes with line counts
- API summary (public/internal)
- Policy compliance verification (explicit checklist)
- Test results
- Usage examples
- Conclusion and next steps

---

Implementation Sequence Summary

1. Phase 1: Type definitions (30-45 min)
2. Phase 2: Reaction registry implementation (1.5-2 hours)
3. Phase 3: Provider integration (45-60 min)
4. Phase 4: Adapter enhancement (15-30 min)
5. Phase 5: Type exports (5-10 min)
6. Phase 6: Unit tests (2-3 hours)
7. Phase 7: Integration tests (1-1.5 hours)
8. Phase 8: Validation (30-45 min)
9. Phase 9: Documentation (30-45 min)
   Total Estimated Time: 7-10 hours

---

Risks & Mitigations
Risk 1: Initial Evaluation Runs Before Values Available
Severity: HIGH (MITIGATED)  
Mitigation: ✅ Use useEffect (after mount) - by then, fields have registered and defaultValues synced to engine  
Status: MITIGATED - Lifecycle explicitly documented
Risk 2: Async Reactions Completing Out of Order
Severity: MEDIUM  
Mitigation: ✅ Implement beginAsync/isLatest staleness tracking primitives  
Status: MITIGATED
Risk 3: Reaction Errors Crashing App
Severity: MEDIUM  
Mitigation: ✅ Wrap reaction execution in try/catch, log errors, continue execution  
Status: MITIGATED
Risk 4: Provider Re-renders Triggering Reaction Re-execution
Severity: MEDIUM  
Mitigation: ✅ Registry in useMemo with stable dependencies, reactions array should be memoized by user  
Status: MITIGATED
Risk 5: Adapter Callbacks Creating Memory Leaks
Severity: LOW  
Mitigation: ✅ Clean unsubscribe pattern in useEffect cleanup  
Status: MITIGATED

---

Open Questions & Recommendations
Q1: Should reactions array be memoized by user?
Answer: YES - Strongly recommend users wrap reactions in useMemo or define outside component to avoid re-creating registry on every render.
Example:
const reactions = useMemo<ReactionDefinition[]>(() => [
{
id: 'fetch-cities',
watch: ['country'],
when: (ctx) => Boolean(ctx.getValue('country')),
run: async (ctx) => {
// ...
},
},
], []);
<DashFormProvider reactions={reactions}>
Q2: Should we batch evaluateForField calls?
Answer: NOT IN THIS STEP - Adapter already triggers callbacks synchronously after value sync. Batching can be added later if performance issues arise.
Q3: How to handle reaction removal/updates?
Answer: OUT OF SCOPE for Step 02. For now, reactions are registered once during provider construction. Dynamic reactions deferred to future step if needed.

---

Success Metrics
Must Have (All Required)

- [ ] All types compile with 0 errors
- [ ] All tests pass (43 from Step 01 + 30+ new = 73+)
- [ ] Reaction definitions accepted via provider prop
- [ ] Watch-based triggering works (field change → reaction execution)
- [ ] When conditions work (true = execute, false = skip)
- [ ] Sync run handlers work
- [ ] Async run handlers work
- [ ] beginAsync/isLatest staleness tracking works
- [ ] Initial evaluation runs once after mount with values available
- [ ] No reconciliation logic
- [ ] No automatic value reset
- [ ] No UI logic in reactions
- [ ] No provider state causing re-renders
- [ ] Debug logging available
      Should Have (Nice to Have)
- [ ] Integration test with realistic scenario
- [ ] Clear JSDoc examples
- [ ] Error messages helpful
- [ ] Performance optimization notes

---

Out of Scope (Deferred)
The following are explicitly OUT OF SCOPE for Step 02:

- Select component runtime integration (Step 03)
- Unresolved value warnings (Step 03)
- Value reconciliation (NEVER - policy violation)
- Automatic value reset (NEVER - policy violation)
- visibleWhen logic (remains in components)
- UI rendering behavior
- Translation/i18n
- Parent/child dependency semantics
- DSL abstractions (dependsOn, etc.)
- Provider React state fan-out
- Business validation logic
- Dynamic reaction registration/removal

---

Next Steps (After Step 02 Complete)

1. Review & Approval: Validate implementation against plan
2. Commit: feat(forms): add Reactive V2 reaction engine (watch, when, run, async staleness)
3. Step 03 Planning: Select component runtime integration
   - Connect Select to useFieldRuntime
   - Implement unresolved value behavior
   - Add dev-only warnings
4. Step 04: TextField migration (if needed)
5. Step 05: Deprecate version strings (final cleanup)

---

Appendix: Example Reaction
import type { ReactionDefinition } from '@dashforge/forms';
const fetchCitiesReaction: ReactionDefinition = {
id: 'fetch-cities-when-country-changes',

// Watch country field for changes
watch: ['country'],

// Only fetch if country has a value
when: (ctx) => {
const country = ctx.getValue<string>('country');
return Boolean(country);
},

// Fetch cities and update city field runtime
run: async (ctx) => {
const country = ctx.getValue<string>('country');
const requestId = ctx.beginAsync('fetch-cities');

    // Set loading state
    ctx.setRuntime('city', { status: 'loading' });

    try {
      const response = await fetch(`/api/cities?country=${country}`);
      const cities = await response.json();

      // Only apply if this is still the latest request
      if (ctx.isLatest('fetch-cities', requestId)) {
        ctx.setRuntime('city', {
          status: 'ready',
          data: { options: cities },
        });
      }
    } catch (error) {
      // Only apply error if this is still the latest request
      if (ctx.isLatest('fetch-cities', requestId)) {
        ctx.setRuntime('city', {
          status: 'error',
          error: error.message,
        });
      }
    }

},
};
// Usage in app
<DashFormProvider
defaultValues={{ country: '', city: '' }}
reactions={[fetchCitiesReaction]}

>   <CountrySelect name="country" />
>   <CitySelect name="city" />

## </DashFormProvider>

END OF PLAN v2
KEY CLARIFICATION SUMMARY:
The initial evaluation lifecycle is now explicitly defined:

1. Construction phase creates registry (no evaluation)
2. Field registration syncs defaultValues into engine nodes
3. Provider useEffect runs ONCE after mount
4. Registry.evaluateAll() executes with values guaranteed available
   This is deterministic, testable, and aligned with the approved decision to run initial evaluation after form initialization.
