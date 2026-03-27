## I see - the directory exists but I'm in READ-ONLY mode and cannot write files. Let me provide the plan as output to the user instead:

Reactive V2 - Step 02 Implementation Plan
Reaction Engine
Date: Mon Mar 23 2026  
Task: dashforge/.opencode/tasks/reaction-v2-step-02-reaction-engine.md  
Policy: dashforge/.opencode/policies/reaction-v2.md (MANDATORY)  
Status: 📋 PLAN (Read-only, no implementation)

---

Executive Summary
This plan defines the implementation strategy for Step 02: Reaction Engine, building on the runtime store foundation from Step 01. The goal is to introduce a mechanical, condition-driven reaction system that executes side effects when watched fields change, WITHOUT introducing reconciliation, automatic value resets, or UI logic.
Key Architectural Decisions (User-Approved)

1. Provider owns reaction registry - DashFormProvider creates and manages reactions, similar to runtime store ownership
2. Initial evaluation after form initialization - Run initial evaluation cycle once after RHF defaultValues are synced to engine
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
6. ✅ Initial evaluation cycle on startup
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

Architecture Overview
Component Responsibilities (Post-Step 02)
DashFormProvider (ORCHESTRATION HUB)
├─ Engine (reactive nodes for values) ← getValue source
├─ RHF (form values, validation) ← getValue fallback
├─ RuntimeStore (field runtime metadata) ← setRuntime target
├─ ReactionRegistry (NEW - reaction definitions + execution)
├─ FormEngineAdapter (MODIFIED - value sync callbacks)
└─ DashFormContext (bridge - no new APIs)
Reaction Flow:

1. User changes field value
2. RHF onChange → Engine sync (existing)
3. Adapter calls value sync callbacks
4. ReactionRegistry evaluates affected reactions
5. When condition passes → run() executes
6. run() calls setRuntime() to update runtime state
7. useFieldRuntime hook re-renders UI components

---

## Implementation Plan

I've created a comprehensive 9-phase implementation plan with detailed specifications for each component. Here's the high-level structure:

### **Phase 1: Type Definitions** (30-45 min)

- Create `libs/dashforge/forms/src/reactions/reaction.types.ts`
- Define `ReactionDefinition`, `ReactionWhenContext`, `ReactionRunContext`
- Define internal types: `WatchIndex`, `AsyncRequestTracker`

### **Phase 2: Reaction Registry Implementation** (1.5-2 hours)

- Create `libs/dashforge/forms/src/reactions/createReactionRegistry.ts`
- Implement lazy reaction evaluation (watch index for O(1) lookup)
- Implement async staleness tracking (beginAsync/isLatest)
- No React state - pure JS Map/Array structures

### **Phase 3: Provider Integration** (45-60 min)

- Modify `DashFormProvider.tsx` to accept `reactions` prop
- Create reaction registry in useMemo with injected dependencies
- Add initial evaluation in useEffect (runs once after mount)
- Subscribe to adapter value sync callbacks for incremental evaluation

### **Phase 4: Adapter Enhancement** (15-30 min)

- Modify `FormEngineAdapter.ts` to add value sync callback system
- Add `addOnValueSyncListener` method
- Notify callbacks in `syncValueToEngine` after engine update
- Adapter remains stateless (callbacks don't introduce state)

### **Phase 5: Type Exports** (5-10 min)

- Export reaction types from package index
- Export registry factory for advanced usage

### **Phase 6: Unit Tests** (2-3 hours)

- Create `createReactionRegistry.test.ts` with 30+ tests
- Test coverage: registration, when conditions, run execution, async staleness, field change evaluation, error handling
- Integration test with realistic fetch scenario

### **Phase 7: Integration Tests** (1-1.5 hours)

- Test complete flow: field change → reaction → runtime update
- Mock dependencies but test real interaction patterns

### **Phase 8: Validation** (30-45 min)

- Run typechecks (all packages)
- Run test suite (expect 73+ tests passing)
- Manual validation checklist

### **Phase 9: Documentation** (30-45 min)

- Create implementation report
- Document API changes
- Include usage examples

---

## Total Estimated Time: 7-10 hours

Key Design Decisions

1. Registry Uses Injected Dependencies (Not Direct Imports)
   Rationale: Testability, flexibility, clean separation
   createReactionRegistry({
   getValue: (name) => engine.getNode(name)?.value ?? rhf.getValues(name),
   getFieldRuntime: (name) => runtimeStore.getFieldRuntime(name),
   setFieldRuntime: (name, patch) => runtimeStore.setFieldRuntime(name, patch),
   })
2. Adapter Callback Pattern for Field Change Notifications
   Rationale: Avoids engine subscription complexity, surgical and efficient
   // In adapter
   this.engine.updateNode(fieldName, { value });
   for (const callback of this.onValueSyncCallbacks) {
   callback(fieldName); // Registry gets exact field name
   }
3. Fire-and-Forget Async Execution
   Rationale: Don't block reaction evaluation, allow parallel execution
   void executeReaction(reaction); // No await
4. Simple Counter-Based Staleness Tracking
   Rationale: Minimal complexity, sufficient for async fetch scenarios
   beginAsync: (key) => {
   const requestId = (asyncTracker.get(key) ?? 0) + 1;
   asyncTracker.set(key, requestId);
   return requestId;
   }

---

## Policy Compliance Verification

From `dashforge/.opencode/policies/reaction-v2.md`:
✅ **Reactions are mechanical** - Only watch/when/run, no business semantics  
✅ **RHF remains source of truth** - Reactions read from RHF/Engine, write to RuntimeStore only  
✅ **Runtime state separate** - No form value modification  
✅ **Runtime state atomic** - Registry uses plain JS structures, no React state  
✅ **No automatic reconciliation** - No value resets, no data healing  
✅ **No UI responsibility** - No visibility control, no layout, visibleWhen stays in components

---

Example Usage
import { DashFormProvider, ReactionDefinition } from '@dashforge/forms';
const reactions: ReactionDefinition[] = [
{
id: 'fetch-cities-when-country-changes',
watch: ['country'],
when: (ctx) => Boolean(ctx.getValue<string>('country')),
run: async (ctx) => {
const country = ctx.getValue<string>('country');
const requestId = ctx.beginAsync('fetch-cities');

      ctx.setRuntime('city', { status: 'loading' });

      try {
        const cities = await fetchCities(country);

        if (ctx.isLatest('fetch-cities', requestId)) {
          ctx.setRuntime('city', {
            status: 'ready',
            data: { options: cities },
          });
        }
      } catch (err) {
        if (ctx.isLatest('fetch-cities', requestId)) {
          ctx.setRuntime('city', {
            status: 'error',
            error: err.message,
          });
        }
      }
    },

},
];
function App() {
return (
<DashFormProvider
defaultValues={{ country: '', city: '' }}
reactions={reactions} >
<CountrySelect name="country" />
<CitySelect name="city" />
</DashFormProvider>
);
}

---

## Risks & Mitigations

### Risk 1: Engine Subscription Doesn't Provide Changed Field Names

**Severity:** HIGH  
**Mitigation:** ✅ Use adapter callback pattern - adapter already knows which field changed  
**Status:** MITIGATED

### Risk 2: Async Reactions Completing Out of Order

**Severity:** MEDIUM  
**Mitigation:** ✅ Implement beginAsync/isLatest staleness tracking  
**Status:** MITIGATED

### Risk 3: Reaction Errors Crashing App

**Severity:** MEDIUM  
**Mitigation:** ✅ Wrap execution in try/catch, log errors, continue  
**Status:** MITIGATED

### Risk 4: Provider Re-renders Triggering Reaction Re-execution

**Severity:** MEDIUM  
**Mitigation:** ✅ Registry in useMemo with stable dependencies  
**Status:** MITIGATED

### Risk 5: Initial Evaluation Running Before defaultValues Synced

**Severity:** LOW  
**Mitigation:** ✅ Initial evaluation in useEffect (after render)  
**Status:** MITIGATED

---

Out of Scope (Deferred)

- Select component runtime integration (Step 03)
- Unresolved value warnings (Step 03)
- Value reconciliation (NEVER - policy violation)
- Automatic value reset (NEVER - policy violation)
- visibleWhen logic (remains in components)
- Dynamic reaction registration/removal
- Parent/child dependency semantics
- DSL abstractions (dependsOn, etc.)

---

Next Steps

1. User Review - Validate this plan aligns with expectations
2. Implementation - Execute phases 1-9 when approved
3. Step 03 Planning - Select component integration after Step 02 complete

---

PLAN COMPLETE - READY FOR REVIEW ✅
The plan is comprehensive, policy-compliant, and executable. The implementation is scoped to introduce ONLY the mechanical reaction engine without any reconciliation, value mutation, or UI logic. All design decisions prioritize testability, separation of concerns, and adherence to the Reactive V2 architectural principles.
▣ Plan · claude-sonnet-4.5 · 7m 34s
