Reactive V2 - Step 02 Implementation Plan (v3)
Reaction Engine
Date: Mon Mar 23 2026  
Task: dashforge/.opencode/tasks/reaction-v2-step-02-reaction-engine.md  
Policy: dashforge/.opencode/policies/reaction-v2.md (MANDATORY)  
Status: 📋 PLAN (Read-only, no implementation)  
Version: v3 (Strict Mode protection, value-driven semantics, execution guarantees)

---

Executive Summary
This plan defines the implementation strategy for Step 02: Reaction Engine, building on the runtime store foundation from Step 01. The goal is to introduce a mechanical, condition-driven reaction system that executes side effects when watched fields change, WITHOUT introducing reconciliation, automatic value resets, or UI logic.
Key Architectural Decisions (User-Approved)

1. Provider owns reaction registry - DashFormProvider creates and manages reactions, similar to runtime store ownership
2. Initial evaluation after form initialization - Run initial evaluation cycle once after RHF defaultValues are synced to engine (with Strict Mode protection)
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
6. ✅ Initial evaluation cycle on startup (Strict Mode safe)
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

Initial Evaluation Lifecycle (CRITICAL - v3 CORRECTIONS)
Deterministic Sequence with Strict Mode Protection
The initial evaluation cycle MUST follow this exact sequence with guard against double execution:
Phase 1: Construction (Synchronous)
├─ 1. DashFormProvider receives defaultValues prop
├─ 2. RHF useForm() hook initializes with defaultValues
├─ 3. Engine created (createEngine)
├─ 4. RuntimeStore created (createRuntimeStore)
├─ 5. Adapter created (FormEngineAdapter)
└─ 6. ReactionRegistry created (createReactionRegistry)
├─ reactions registered, watch index built
├─ initialEvaluationCompleted flag initialized to FALSE
└─ NO EVALUATION YET ⚠️
Phase 2: Field Registration (Synchronous, during render)
├─ 7. Form fields mount and call bridge.register()
├─ 8. Adapter.registerField() creates Engine nodes
└─ 9. Initial RHF values synced to Engine nodes
├─ Engine nodes now contain defaultValues
└─ NO REACTION EVALUATION YET ⚠️
Phase 3: Initial Evaluation (useEffect - After Mount)
├─ 10. DashFormProvider useEffect runs
├─ 11. Check registry.hasInitialEvaluationCompleted()
│ ├─ If FALSE → proceed
│ └─ If TRUE → skip (Strict Mode re-entry protection)
├─ 12. ReactionRegistry.evaluateAll() called
├─ 13. Registry sets initialEvaluationCompleted = TRUE
├─ 14. All reactions evaluated against current Engine state
└─ 15. Initial conditions checked, run() executed if true
└─ This executes ONCE per registry instance ✅
Key Guarantees

1. Values are available - RHF defaultValues exist in RHF state; Engine nodes created during field registration contain synced values
2. Deterministic timing - Initial evaluation happens ONCE per registry instance in useEffect
3. Strict Mode safe - Registry tracks completion flag; useEffect re-entry is a no-op
4. Value-driven, not mount-driven - Reactions read from Engine/RHF, NOT from "all fields mounted"
5. No component coupling - Evaluation occurs when form values are available, independent of UI mount state
   Value Accessibility Semantics (CRITICAL CLARIFICATION)
   Reactions are value-driven, not UI-driven:

- getValue(name) reads from Engine first (if node exists), RHF fallback (always available)
- Initial evaluation does NOT wait for "all fields to mount"
- A field's value is available via RHF defaultValues immediately, even if UI component hasn't mounted yet
- Engine nodes are created during field registration (when components mount), but RHF always has the value
- This decouples reaction execution from component lifecycle
  Example:
  // defaultValues provided to DashFormProvider
  defaultValues: { country: 'USA', city: '', region: '' }
  // Initial evaluation runs
  reaction.run({
  getValue: (name) => {
  // Engine may not have node yet (field not mounted)
  const node = engine.getNode(name);
  if (node) return node.value;
      // Fallback to RHF (always available)
      return rhf.getValues(name); // Returns 'USA' for 'country'
  }
  })
  // This works even if CountrySelect hasn't mounted yet
  // Values come from RHF state, not from DOM
  Design Principle:
  Reactions operate on form state (RHF + Engine), not UI state (mounted components). This keeps the reaction system mechanical and decoupled from rendering.
  Implementation Strategy with Strict Mode Protection
  In createReactionRegistry.ts:
  export function createReactionRegistry<TFieldValues = FieldValues>(
  config: ReactionRegistryConfig & { /_ ... _/ }
  ): ReactionRegistry<TFieldValues> {
  const { debug = false, getValue, getFieldRuntime, setFieldRuntime } = config;
  const reactions: ReactionDefinition<TFieldValues>[] = [];
  const watchIndex: WatchIndex = new Map();
  const asyncTracker: AsyncRequestTracker = new Map();
  // NEW: Once-per-registry guard
  let initialEvaluationCompleted = false;
  return {
  // ... other methods ...
  evaluateAll(): void {
  // GUARD: Prevent double execution (Strict Mode protection)
  if (initialEvaluationCompleted) {
  if (debug) {
  console.log('[ReactionRegistry] Initial evaluation already completed, skipping');
  }
  return;
  }
  if (debug) {
  console.log('[ReactionRegistry] Evaluating all reactions (initial)', {
  count: reactions.length,
  });
  }
  // Mark as completed BEFORE execution to handle re-entry
  initialEvaluationCompleted = true;
  // Execute all reactions (no hierarchy, no ordering)
  for (const reaction of reactions) {
  void executeReaction(reaction);
  }
  if (debug) {
  console.log('[ReactionRegistry] Initial evaluation complete');
  }
  },
  hasInitialEvaluationCompleted(): boolean {
  return initialEvaluationCompleted;
  },
  reset(): void {
  reactions.length = 0;
  watchIndex.clear();
  asyncTracker.clear();
  initialEvaluationCompleted = false; // Reset flag
  if (debug) {
  console.log('[ReactionRegistry] Reset complete');
  }
  },
  };
  }
  In DashFormProvider.tsx:
  // Initial evaluation with Strict Mode protection
  useEffect(() => {
  if (!reactionRegistry) return;
  // Check if already completed (Strict Mode re-entry protection)
  if (reactionRegistry.hasInitialEvaluationCompleted()) {
  if (debug) {
  console.log('[DashFormProvider] Initial evaluation already completed (Strict Mode re-entry)');
  }
  return;
  }
  if (debug) {
  console.log('[DashFormProvider] Running initial evaluation cycle', {
  timing: 'useEffect after mount',
  guarantee: 'RHF state available, engine nodes created during field registration',
  note: 'Protected against Strict Mode double execution',
  });
  }
  // Execute initial evaluation ONCE per registry instance
  // Values available via:
  // - Engine nodes (if fields mounted and registered)
  // - RHF defaultValues (always available, fallback)
  reactionRegistry.evaluateAll();
  if (debug) {
  console.log('[DashFormProvider] Initial evaluation triggered');
  }
  }, [reactionRegistry, debug]);
  Why This Approach

1. Strict Mode safe - Registry flag prevents double execution when React re-runs effects in development
2. Values guaranteed available - RHF defaultValues always accessible; Engine nodes available for registered fields
3. No race conditions - Flag set before execution to handle re-entry during async reactions
4. Deterministic - Always runs exactly once per registry instance
5. Testable - Can verify completion flag and runtime state after mount
6. Value-driven - Decoupled from UI mount state; reactions read form values, not DOM state

---

Execution Semantics (CRITICAL CLARIFICATION)
No Ordering Guarantees
Both evaluateAll() and evaluateForField() provide NO ordering guarantees:

1.  Reactions execute in array order BUT asynchronously
    - void executeReaction(reaction) fires and forgets
    - Async reactions complete in unpredictable order
    - Do NOT assume reaction A completes before reaction B starts
2.  Reactions MUST NOT depend on other reactions
    - Each reaction is independent
    - NO chaining assumptions (e.g., "reaction B reads data written by reaction A")
    - NO dependency graph semantics
3.  Async correctness relies on beginAsync/isLatest ONLY
    - If reaction needs to coordinate async operations, use staleness tracking
    - Do NOT rely on execution order for correctness
      Example - WRONG (assumes ordering):
      // ❌ WRONG - Reaction B assumes A has completed
      const reactionA = {
      id: 'fetch-options',
      watch: ['trigger'],
      run: async (ctx) => {
      const data = await fetchOptions();
      ctx.setRuntime('target', { status: 'ready', data: { options: data } });
      },
      };
      const reactionB = {
      id: 'use-options',
      watch: ['trigger'],
      run: (ctx) => {
      // ❌ WRONG - assumes reactionA has completed
      const runtime = ctx.getRuntime('target');
      const options = runtime.data?.options ?? [];
      // This may execute BEFORE reactionA completes!
      },
      };
      Example - CORRECT (independent reactions):
      // ✅ CORRECT - Each reaction is independent
      const reactionA = {
      id: 'fetch-cities',
      watch: ['country'],
      run: async (ctx) => {
      const country = ctx.getValue('country');
      const requestId = ctx.beginAsync('fetch-cities');


        ctx.setRuntime('city', { status: 'loading' });
        const data = await fetchCities(country);

        if (ctx.isLatest('fetch-cities', requestId)) {
          ctx.setRuntime('city', { status: 'ready', data: { options: data } });
        }
    },
    };
    const reactionB = {
    id: 'fetch-regions',
    watch: ['country'],
    run: async (ctx) => {
    const country = ctx.getValue('country');
    const requestId = ctx.beginAsync('fetch-regions');
        ctx.setRuntime('region', { status: 'loading' });
        const data = await fetchRegions(country);

        if (ctx.isLatest('fetch-regions', requestId)) {
          ctx.setRuntime('region', { status: 'ready', data: { options: data } });
        }
    },
    };
    // ✅ Both reactions are independent
    // ✅ Each uses staleness tracking
    // ✅ No assumptions about execution order
    Implementation Note:
    The registry uses void executeReaction(reaction) (fire-and-forget) to make the lack of ordering guarantees explicit. This is intentional and documented.
    JSDoc Clarification:
    /\*\*

- Evaluate all reactions (initial evaluation).
-
- EXECUTION SEMANTICS:
- - Reactions execute in array order but asynchronously (fire-and-forget)
- - NO guarantee that reaction A completes before reaction B starts
- - Reactions MUST be independent
- - Async correctness relies on beginAsync/isLatest only
-
- Called once after form initialization.
  \*/
  evaluateAll(): void;
  /\*\*
- Evaluate reactions affected by specific field change.
-
- EXECUTION SEMANTICS:
- - Affected reactions execute asynchronously (fire-and-forget)
- - NO ordering guarantees between reactions
- - Each reaction is independent
-
- @param fieldName - Name of field that changed
  \*/
  evaluateForField(fieldName: string): void;

---

Architecture Overview
Component Responsibilities (Post-Step 02)
DashFormProvider (ORCHESTRATION HUB)
├─ Engine (reactive nodes for values) ← getValue source (priority)
├─ RHF (form values, validation) ← getValue fallback (always available)
├─ RuntimeStore (field runtime metadata) ← setRuntime target
├─ ReactionRegistry (NEW - reaction definitions + execution)
│ ├─ registerReactions() - builds watch index
│ ├─ evaluateAll() - initial evaluation (once, Strict Mode safe)
│ ├─ evaluateForField() - incremental evaluation
│ └─ hasInitialEvaluationCompleted() - guard flag
├─ FormEngineAdapter (MODIFIED - value sync callbacks)
└─ DashFormContext (bridge - no new APIs)
Reaction Flow (Initial):

1. Provider mounts, creates registry (flag = false)
2. Fields mount, register with adapter, create engine nodes
3. Provider useEffect runs
4. Check hasInitialEvaluationCompleted() → false
5. Registry.evaluateAll() executes (sets flag = true)
6. Reactions read values (Engine first, RHF fallback)
7. Reactions execute run() (async, no ordering)
8. Runtime state updated via setRuntime()
   Reaction Flow (Field Change):
9. User changes field value
10. RHF onChange → Adapter syncValueToEngine
11. Adapter calls value sync callbacks
12. Registry.evaluateForField(fieldName) executes
13. Affected reactions evaluated (async, no ordering)
14. run() executes if when condition true
15. Runtime state updated via setRuntime()
16. useFieldRuntime hook re-renders UI
    Data Flow Diagram
    ┌─────────────────────────────────────────────────────────────┐
    │ DashFormProvider Construction (Synchronous) │
    │ │
    │ 1. Create Engine │
    │ 2. Create RHF (with defaultValues) │
    │ └─ RHF state contains all defaultValues │
    │ 3. Create RuntimeStore │
    │ 4. Create Adapter │
    │ 5. Create ReactionRegistry ★ NEW │
    │ ├─ registerReactions() (builds watch index) │
    │ ├─ initialEvaluationCompleted = FALSE │
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
    │ Engine nodes created with RHF defaultValues │
    │ RHF state ALWAYS has values (independent of mount) │
    │ NO REACTION EVALUATION YET │
    └─────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────┐
    │ Initial Evaluation (useEffect - Strict Mode Safe) ★ │
    │ │
    │ Provider useEffect runs │
    │ ↓ │
    │ Check hasInitialEvaluationCompleted() │
    │ ↓ │
    │ If TRUE → skip (Strict Mode re-entry) │
    │ If FALSE → proceed │
    │ ↓ │
    │ ReactionRegistry.evaluateAll() │
    │ ↓ │
    │ Set initialEvaluationCompleted = TRUE │
    │ ↓ │
    │ For each reaction (async, no ordering): │
    │ 1. Check when() condition (if present) │
    │ 2. If true/absent → execute run() │
    │ 3. run() reads getValue: │
    │ - Engine.getNode(name)?.value (if registered) │
    │ - RHF.getValues(name) (fallback, always available) │
    │ 4. run() calls setRuntime() to update state │
    │ ↓ │
    │ Initial runtime state populated │
    │ (value-driven, not mount-driven) │
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
    │ For each reaction (async, no ordering): │
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
- NO ordering dependencies between reactions

#### ✅ RHF remains source of truth for form values

- Reactions read values via getValue (Engine first, RHF fallback)
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
- Reactions are value-driven, not mount-driven

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
  - Reads from Engine first (if node exists), fallback to RHF (always available).
  -
  - VALUE SEMANTICS (value-driven, not mount-driven):
  - - Engine node may not exist if field hasn't mounted yet
  - - RHF defaultValues always available immediately
  - - This decouples reactions from component mount lifecycle
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
  - Same as when context - value-driven, not mount-driven.
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
  - ASYNC CORRECTNESS:
  - - Each beginAsync() increments request ID
  - - Use isLatest() to check if response is still valid
  - - This is the ONLY mechanism for async coordination
  - - Do NOT rely on reaction execution order
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
-
- EXECUTION SEMANTICS:
- - Reactions execute asynchronously (fire-and-forget)
- - NO ordering guarantees between reactions
- - Each reaction MUST be independent
- - Do NOT assume other reactions have completed
- - Async correctness relies on beginAsync/isLatest only
-
- VALUE SEMANTICS:
- - Reactions are value-driven, not mount-driven
- - getValue() reads from form state (Engine/RHF), not UI state
- - Decoupled from component mount lifecycle
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
    - EXECUTION SEMANTICS:
    - - This may execute in parallel with other reactions
    - - Do NOT assume execution order
    - - Do NOT depend on other reactions completing first
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
* JSDoc explicitly documents execution and value semantics

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
-
- STRICT MODE PROTECTION:
- - Executes only once per registry instance
- - Subsequent calls are no-ops (returns immediately)
- - Protected against React Strict Mode double execution
-
- EXECUTION SEMANTICS:
- - Reactions execute asynchronously (fire-and-forget)
- - NO ordering guarantees between reactions
- - Each reaction is independent
-
- VALUE SEMANTICS:
- - Reactions read from Engine (if node exists) or RHF (fallback)
- - Value-driven, not mount-driven
-
- Should be called once after form initialization.
  \*/
  evaluateAll(): void;
  /\*\*
- Evaluate reactions affected by specific field change.
-
- EXECUTION SEMANTICS:
- - Affected reactions execute asynchronously (fire-and-forget)
- - NO ordering guarantees between reactions
-
- @param fieldName - Name of field that changed
  \*/
  evaluateForField(fieldName: string): void;
  /\*\*
- Check if initial evaluation has completed.
- Used for Strict Mode re-entry protection.
-
- @returns True if evaluateAll() has been called
  \*/
  hasInitialEvaluationCompleted(): boolean;
  /\*\*
- Get all registered reactions (for debugging/testing).
  \*/
  getReactions(): ReactionDefinition<TFieldValues>[];
  /\*\*
- Reset registry (clear all reactions and state).
- Resets initialEvaluationCompleted flag.
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

// NEW: Strict Mode protection flag
let initialEvaluationCompleted = false;
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
// CRITICAL: Strict Mode protection
if (initialEvaluationCompleted) {
if (debug) {
console.log('[ReactionRegistry] Initial evaluation already completed, skipping (Strict Mode protection)');
}
return;
}
if (debug) {
console.log('[ReactionRegistry] Evaluating all reactions (initial)', {
count: reactions.length,
note: 'Setting completion flag before execution',
});
}
// Mark as completed BEFORE execution to handle re-entry
initialEvaluationCompleted = true;
// Execute all reactions (no hierarchy, no ordering, async)
for (const reaction of reactions) {
// Fire and forget (don't await - allow parallel execution)
void executeReaction(reaction);
}
if (debug) {
console.log('[ReactionRegistry] Initial evaluation triggered (async reactions may still be executing)');
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
// Execute affected reactions (async, no ordering)
for (const reactionId of reactionIds) {
const reaction = reactions.find((r) => r.id === reactionId);
if (reaction) {
// Fire and forget
void executeReaction(reaction);
}
}
},
hasInitialEvaluationCompleted(): boolean {
return initialEvaluationCompleted;
},
getReactions(): ReactionDefinition<TFieldValues>[] {
return [...reactions];
},
reset(): void {
reactions.length = 0;
watchIndex.clear();
asyncTracker.clear();
initialEvaluationCompleted = false; // Reset flag
if (debug) {
console.log('[ReactionRegistry] Reset complete (including completion flag)');
}
},
};
}
Key Design Decisions:

1. Strict Mode protection - initialEvaluationCompleted flag prevents double execution
2. Flag set before execution - Handles re-entry during async reactions
3. No React state - Registry uses plain arrays/maps, not reactive state
4. Injected dependencies - getValue, getFieldRuntime, setFieldRuntime passed in constructor
5. Fire-and-forget async - Explicit void executeReaction() for no ordering guarantees
6. No error propagation - Failed reactions log error but don't crash app
7. Watch index - Map<fieldName, Set<reactionIds>> for O(1) lookup
8. Async staleness - Simple counter-based tracking per operation key
   Edge Cases Handled:

- React Strict Mode double execution (flag protection)
- Multiple reactions watching same field (all execute, async, no ordering)
- Async reactions completing out of order (isLatest check)
- Reaction throws error (caught, logged, app continues)
- Field with no watchers (no-op)
- Empty reactions array (safe no-op)
- useEffect re-entry during async execution (flag already set)

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
// VALUE SEMANTICS: Engine first (if node exists), RHF fallback (always available)
// This decouples reactions from component mount lifecycle
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
note: 'Initial evaluation will run in useEffect (Strict Mode safe)',
});
}
return registry;
}, [reactions, debug, engine, rhf, runtimeStore]); 3. Add initial evaluation in useEffect with Strict Mode protection:
// NEW: Initial evaluation cycle (Strict Mode safe)
// TIMING: Runs after mount, when RHF defaultValues available
// VALUES: Available via Engine (if registered) or RHF (always available)
// PROTECTION: Registry flag prevents double execution in Strict Mode
useEffect(() => {
if (!reactionRegistry) return;
// CRITICAL: Check completion flag (Strict Mode re-entry protection)
if (reactionRegistry.hasInitialEvaluationCompleted()) {
if (debug) {
console.log('[DashFormProvider] Initial evaluation already completed (Strict Mode re-entry), skipping');
}
return;
}
if (debug) {
console.log('[DashFormProvider] Running initial evaluation cycle', {
timing: 'useEffect after mount',
valueSource: 'Engine (if node exists) or RHF (always available)',
guarantee: 'RHF defaultValues available immediately',
note: 'Value-driven, not mount-driven - decoupled from UI lifecycle',
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
console.log('[DashFormProvider] Initial evaluation triggered (async reactions may still be executing)');
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
- Create reaction registry in useMemo (with injected deps, value-driven semantics)
- Run initial evaluation in useEffect (once per registry, Strict Mode safe)
- Check completion flag before evaluation (protection)
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
- ✅ initialEvaluationCompleted starts false
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
- ✅ Multiple reactions can watch same field (all execute, async)
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
  6.7 Initial Evaluation (with Strict Mode Protection)
- ✅ evaluateAll executes all reactions
- ✅ evaluateAll respects when conditions
- ✅ evaluateAll works with empty registry (no-op)
- ✅ evaluateAll sets initialEvaluationCompleted flag
- ✅ evaluateAll called twice is no-op (Strict Mode protection)
- ✅ hasInitialEvaluationCompleted returns correct state
  6.8 Error Handling
- ✅ Reaction error does not crash registry
- ✅ Reaction error is logged (console.error)
- ✅ Other reactions continue after one fails
  6.9 Edge Cases
- ✅ Empty reactions array (safe no-op)
- ✅ Reaction watches non-existent field (no crash)
- ✅ getValue returns undefined for missing field
- ✅ Reset clears all state including completion flag
  6.10 Value Semantics
- ✅ getValue reads from Engine if node exists
- ✅ getValue falls back to RHF if node missing
- ✅ Reactions work before fields mount (RHF fallback)

---

Phase 7: Integration Tests (1-1.5 hours)
File: libs/dashforge/forms/src/reactions/**tests**/reactionIntegration.test.ts (NEW)
Integration Test Scenarios:

1. Complete flow: field change → reaction → runtime update
2. Initial evaluation populates runtime state based on defaultValues
3. Initial evaluation with Strict Mode simulation (call twice, verify single execution)
4. Multiple reactions watching same field execute correctly (async, no ordering)
5. Async staleness prevents stale data overwrites in realistic scenario
6. Value accessibility: reaction reads from RHF when field not mounted yet

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
- [ ] Initial evaluation runs once after mount (Strict Mode safe)
- [ ] Initial evaluation has access to defaultValues via RHF
- [ ] hasInitialEvaluationCompleted() works correctly
- [ ] Strict Mode simulation test passes

---

Phase 9: Documentation & Final Report (30-45 min)
File: dashforge/.opencode/reports/reaction-v2-step-02-build.md (CREATE)
Report must include:

- File-by-file changes with line counts
- API summary (public/internal)
- Policy compliance verification (explicit checklist)
  - ✅ No reconciliation logic
  - ✅ No automatic value reset
  - ✅ No UI logic in reactions
  - ✅ No provider fan-out state
  - ✅ Reactions are mechanical
  - ✅ Value-driven, not mount-driven
  - ✅ No ordering dependencies
- Strict Mode protection verification
- Value semantics verification
- Execution semantics verification
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
Risk 1: React Strict Mode Double Execution
Severity: HIGH (NOW MITIGATED)  
Mitigation: ✅ Registry tracks initialEvaluationCompleted flag; useEffect checks flag before calling evaluateAll()  
Status: MITIGATED - Explicit guard implemented
Risk 2: Values Not Available at Initial Evaluation
Severity: HIGH (NOW MITIGATED)  
Mitigation: ✅ getValue reads from Engine first, RHF fallback (always available); value-driven, not mount-driven  
Status: MITIGATED - Decoupled from component mount lifecycle
Risk 3: Async Reactions Completing Out of Order
Severity: MEDIUM  
Mitigation: ✅ Implement beginAsync/isLatest staleness tracking primitives  
Status: MITIGATED
Risk 4: Reaction Errors Crashing App
Severity: MEDIUM  
Mitigation: ✅ Wrap reaction execution in try/catch, log errors, continue execution  
Status: MITIGATED
Risk 5: Provider Re-renders Triggering Reaction Re-execution
Severity: MEDIUM  
Mitigation: ✅ Registry in useMemo with stable dependencies; reactions array should be memoized by user  
Status: MITIGATED
Risk 6: Adapter Callbacks Creating Memory Leaks
Severity: LOW  
Mitigation: ✅ Clean unsubscribe pattern in useEffect cleanup  
Status: MITIGATED
Risk 7: Ordering Dependencies Between Reactions
Severity: MEDIUM (NOW MITIGATED)  
Mitigation: ✅ Explicit fire-and-forget (void executeReaction); JSDoc documents no ordering guarantees  
Status: MITIGATED - Documentation and implementation aligned

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
Q4: What if user needs guaranteed ordering between reactions?
Answer: NOT SUPPORTED - By design. If strict ordering is needed, user must:

1. Combine logic into single reaction, OR
2. Use nested async/await within single reaction, OR
3. Re-evaluate architecture (reactions may not be the right tool)

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
- [ ] Initial evaluation runs once per registry (Strict Mode safe)
- [ ] hasInitialEvaluationCompleted() returns correct state
- [ ] getValue works with Engine-first, RHF-fallback semantics
- [ ] No ordering guarantees explicitly documented and tested
- [ ] No reconciliation logic
- [ ] No automatic value reset
- [ ] No UI logic in reactions
- [ ] No provider state causing re-renders
- [ ] Debug logging available
      Should Have (Nice to Have)
- [ ] Integration test with realistic scenario
- [ ] Strict Mode simulation test
- [ ] Value semantics test (RHF fallback when field not mounted)
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
- Ordering guarantees between reactions (NEVER - by design)
- DSL abstractions (dependsOn, etc.)
- Provider React state fan-out
- Business validation logic
- Dynamic reaction registration/removal

---

Next Steps (After Step 02 Complete)

1. Review & Approval: Validate implementation against plan
2. Commit: feat(forms): add Reactive V2 reaction engine (watch, when, run, async staleness, Strict Mode safe)
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
// getValue reads from Engine (if node exists) or RHF (always available)
when: (ctx) => {
const country = ctx.getValue<string>('country');
return Boolean(country);
},

// Fetch cities and update city field runtime
// This reaction is independent - does not depend on other reactions
run: async (ctx) => {
const country = ctx.getValue<string>('country');
const requestId = ctx.beginAsync('fetch-cities');

    // Set loading state
    ctx.setRuntime('city', { status: 'loading' });

    try {
      const response = await fetch(`/api/cities?country=${country}`);
      const cities = await response.json();

      // Only apply if this is still the latest request
      // This is the ONLY mechanism for async coordination
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
// reactions array should be memoized or defined outside component
const reactions = [fetchCitiesReaction];
function App() {
return (
<DashFormProvider
defaultValues={{ country: 'USA', city: '' }}
reactions={reactions} >
<CountrySelect name="country" />
<CitySelect name="city" />
</DashFormProvider>
);
}

---

## **END OF PLAN v3**

Summary of v3 Corrections

1. Strict Mode Protection (CRITICAL)

- ✅ Added initialEvaluationCompleted flag to registry
- ✅ evaluateAll() checks flag and returns early if true
- ✅ Flag set before execution to handle re-entry
- ✅ Provider useEffect checks hasInitialEvaluationCompleted() before calling evaluateAll()
- ✅ Test coverage for double-call scenario

2. Value Semantics Clarification (CRITICAL)

- ✅ Explicitly documented getValue reads from Engine first, RHF fallback
- ✅ Clarified reactions are value-driven, not mount-driven
- ✅ Decoupled from component mount lifecycle
- ✅ RHF defaultValues always available, even if field not mounted
- ✅ JSDoc and examples emphasize value accessibility

3. Execution Semantics Clarification (CRITICAL)

- ✅ Explicitly documented NO ordering guarantees
- ✅ Fire-and-forget async execution (void executeReaction)
- ✅ Reactions MUST be independent
- ✅ Async correctness relies on beginAsync/isLatest ONLY
- ✅ JSDoc warnings against ordering dependencies
- ✅ Examples show correct independent patterns

---

PLAN v3 COMPLETE - READY FOR IMPLEMENTATION ✅
All corrections applied:

1. ✅ Strict Mode protection with explicit lifecycle guard
2. ✅ Value-driven semantics (not mount-driven) clarified
3. ✅ Execution semantics (no ordering) clarified
   Policy compliant:

- ✅ No reconciliation
- ✅ No automatic value reset
- ✅ No UI logic
- ✅ Mechanical reactions only
- ✅ Value-driven, not UI-driven
