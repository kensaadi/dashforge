dashforge/.opencode/reports/reaction-v2-step-03-plan-v2.md
Application: dashforge  
Created: 2026-03-23  
Revised: 2026-03-23 (v2)  
Status: PLAN - Ready for Implementation  
Policy: /dashforge/.opencode/policies/reaction-v2.md (mandatory compliance)

---

Executive Summary
Problem Identified (Corrected):  
The 5 skipped integration tests fail because they use rhf.setValue() directly, which bypasses the real onChange chain. The original plan incorrectly proposed a test helper that would manually call syncValueToEngine(). This approach does NOT prove the real end-to-end flow.
Corrected Understanding:  
Step 03 must prove the complete event-driven chain using real field registration and real change events, not test shortcuts.
Solution (v2):  
Convert the skipped integration tests to use a minimal test harness that exercises the actual production flow:

- Real DashFormProvider
- Real field registration via useDashRegister (or simulated via registration contract)
- Real change events (synthetic events that trigger the onChange chain)
- Real runtime observation via useFieldRuntime
  Impact:
- ✅ Tests prove the REAL end-to-end flow (no shortcuts)
- ✅ Minimal production changes (only if wiring gap proven)
- ✅ Tests mirror actual component behavior
- ✅ 100% policy compliant (no reconciliation, no UI logic)

---

Current State Analysis
Production Wiring (Exists - Needs Real Test Proof)
The complete chain exists in production code:

1. Field Component → Uses useDashRegister(name)
2. useDashRegister (lines 117-131) → Wraps onChange:
   - Calls rhfRegister.onChange(event) (updates RHF)
   - Extracts value from event
   - Calls adapter.syncValueToEngine(name, value)
3. FormEngineAdapter (lines 134-159) → syncValueToEngine:
   - Updates engine with engine.updateNode()
   - Notifies all onValueSyncCallbacks (line 156-158)
4. DashFormProvider (lines 399-426) → Subscription:
   - Subscribes to adapter via addOnValueSyncListener()
   - Receives fieldName on value sync
   - Calls reactionRegistry.evaluateForField(fieldName)
5. ReactionRegistry → Executes matching reactions
   This flow exists but is NOT proven by integration tests.
   Test Problem (Why Tests Are Skipped - Corrected Analysis)
   The skipped tests use renderHook() with no real field components, then call rhf.setValue():
   // Current broken test:
   const { result } = renderHook(
   () => ({ form: useDashFormContext(), runtime: useFieldRuntime('target') }),
   { wrapper }
   );
   // ❌ NO FIELD REGISTERED - No useDashRegister, no onChange wiring
   await act(async () => {
   result.current.form.rhf.setValue('trigger', 'active'); // ❌ Bypasses onChange!
   });
   Why It Fails:

- No field component registered with useDashRegister
- rhf.setValue() updates RHF but doesn't trigger onChange
- The onChange → syncValueToEngine → listener chain never fires
- Reactions never execute
  What's Needed:
  Tests must register fields using the real registration mechanism, then trigger real change events.
  Affected Tests
  Test ID Description
  7.1 Field change triggers reaction
  7.4 Multiple reactions on same field
  7.5 Async staleness tracking
  7.6 RHF fallback for unmounted fields
  7.7 O(1) lookup performance

---

Implementation Plan (v2)
Approach: Minimal Test Harness with Real Registration
Create a test harness component that:

1. Uses useDashRegister to register fields with real onChange wiring
2. Exposes methods to trigger synthetic change events
3. Proves the complete event-driven chain
   NO manual calls to syncValueToEngine.  
   NO exposed internal adapter.  
   ONLY real registration + real events.
   Test Harness Design
   File: libs/dashforge/forms/src/reactions/**tests**/testHarness.tsx
   /\*\*

- Test harness: Proves real field registration and change event flow.
-
- This harness uses the REAL registration mechanism (useDashRegister)
- and triggers REAL change events to prove the complete chain:
-
- onChange → syncValueToEngine → adapter listener → evaluateForField
-
- This is NOT a shortcut - it exercises the actual production code path.
  \*/
  import { useEffect } from 'react';
  import { useDashRegister } from '../../hooks/useDashRegister';
  interface TestFieldHarnessProps {
  name: string;
  onRegistered?: (trigger: (value: unknown) => void) => void;
  }
  /\*\*
- TestFieldHarness: Registers a field and exposes a trigger for tests.
-
- This component:
- 1.  Uses real useDashRegister (production code)
- 2.  Provides a trigger function that fires real onChange events
- 3.  Proves the complete registration → change → sync → reaction flow
      \*/
      export function TestFieldHarness({ name, onRegistered }: TestFieldHarnessProps) {
      const { register } = useDashRegister(name);
      useEffect(() => {
      if (onRegistered) {
      // Expose trigger that fires real onChange with synthetic event
      const trigger = (value: unknown) => {
      if (register.onChange) {
      // Create synthetic event matching registration contract
      const syntheticEvent = {
      target: { name, value },
      type: 'change',
      };
      register.onChange(syntheticEvent);
      }
      };
      onRegistered(trigger);
      }
      }, [onRegistered, register, name]);
      // No UI needed - this is pure registration harness
      return null;
      }
      Why This Approach:

* ✅ Uses real useDashRegister (production code)
* ✅ Fires real onChange with synthetic events (matches real usage)
* ✅ Proves complete chain: registration → onChange → sync → listener → reaction
* ✅ No manual API calls (no shortcuts)
* ✅ Minimal and surgical (single test component)
  Test Modifications
  Update each skipped test to use the harness:
  Test 7.1 (lines 19-60) - Complete Rewrite
  BEFORE:
  it.skip('field change triggers reaction that updates runtime state', async () => {
  const reactions: ReactionDefinition[] = [
  {
  id: 'update-status',
  watch: ['trigger'],
  when: (ctx) => Boolean(ctx.getValue('trigger')),
  run: (ctx) => {
  ctx.setRuntime('target', { status: 'loading', data: null });
  },
  },
  ];
  const wrapper = ({ children }: { children: ReactNode }) => (
  <DashFormProvider
  defaultValues={{ trigger: '', target: '' }}
  reactions={reactions} >
  {children}
  </DashFormProvider>
  );
  const { result } = renderHook(
  () => ({
  form: useDashFormContext(),
  runtime: useFieldRuntime('target'),
  }),
  { wrapper }
  );
  // ❌ NO FIELD REGISTERED
  await act(async () => {
  result.current.form.rhf.setValue('trigger', 'active'); // ❌ WRONG
  });
  await waitFor(() => {
  expect(result.current.runtime.status).toBe('loading');
  });
  });
  AFTER:
  it('field change triggers reaction that updates runtime state', async () => {
  const reactions: ReactionDefinition[] = [
  {
  id: 'update-status',
  watch: ['trigger'],
  when: (ctx) => Boolean(ctx.getValue('trigger')),
  run: (ctx) => {
  ctx.setRuntime('target', { status: 'loading', data: null });
  },
  },
  ];
  let triggerField: ((value: unknown) => void) | null = null;
  const TestWrapper = ({ children }: { children: ReactNode }) => (
  <DashFormProvider
  defaultValues={{ trigger: '', target: '' }}
  reactions={reactions} >
  {/_ ✅ REGISTER REAL FIELD _/}
  <TestFieldHarness
  name="trigger"
  onRegistered={(trigger) => {
  triggerField = trigger;
  }}
  />
  {children}
  </DashFormProvider>
  );
  const { result } = renderHook(
  () => ({
  form: useDashFormContext(),
  runtime: useFieldRuntime('target'),
  }),
  { wrapper: TestWrapper }
  );
  // Initial state
  expect(result.current.runtime.status).toBe('idle');
  // ✅ TRIGGER REAL CHANGE EVENT
  await act(async () => {
  if (triggerField) {
  triggerField('active'); // Fires real onChange!
  }
  });
  // Wait for reaction to execute
  await waitFor(() => {
  expect(result.current.runtime.status).toBe('loading');
  });
  });
  Key Changes:

1. ✅ Added TestFieldHarness to register the 'trigger' field with real onChange
2. ✅ Captured trigger function via onRegistered callback
3. ✅ Replaced rhf.setValue() with triggerField('active') which fires real onChange
4. ✅ Proves complete flow: onChange → syncValueToEngine → listener → evaluateForField → reaction
   Test 7.4 (lines 140-179) - Multiple Reactions
   Changes:

- Add TestFieldHarness for 'trigger' field
- Capture trigger function
- Replace rhf.setValue() with triggerField(value)
  Pattern:
  <TestFieldHarness
  name="trigger"
  onRegistered={(trigger) => {
  triggerField = trigger;
  }}
  />
  // In test:
  await act(async () => {
  if (triggerField) {
  triggerField('active'); // ✅ Real onChange
  }
  });
  Test 7.5 (lines 183-259) - Async Staleness
  Changes:
- Add TestFieldHarness for 'query' field
- Replace both rhf.setValue('query', 'slow') and rhf.setValue('query', 'fast') with trigger calls
  Pattern:
  // Start slow request
  await act(async () => {
  if (triggerField) {
  triggerField('slow'); // ✅ Real onChange
  }
  });
  // Start fast request
  await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  if (triggerField) {
  triggerField('fast'); // ✅ Real onChange
  }
  });
  Test 7.6 (lines 263-316) - RHF Fallback
  Changes:
- Add TestFieldHarness for 'trigger' field
- Replace rhf.setValue() with trigger call
- NOTE: 'unmounted-field' should NOT have a harness (testing RHF fallback behavior)
  Test 7.7 (lines 320-388) - O(1) Performance
  Changes:
- Add TestFieldHarness for 'test-field'
- Replace rhf.setValue('test-field', 'changed') with trigger call
- Do NOT add harnesses for the 100 other fields (performance test focuses on single field)

---

Implementation Steps
Step 1: Create Test Harness Component
File: libs/dashforge/forms/src/reactions/**tests**/testHarness.tsx (NEW)
Content:

1. Import useDashRegister from ../../hooks/useDashRegister
2. Define TestFieldHarnessProps interface
3. Implement TestFieldHarness component:
   - Uses useDashRegister(name) to register field
   - Exposes trigger via onRegistered callback
   - Trigger fires real onChange with synthetic event
4. Add JSDoc explaining this is NOT a shortcut
   Lines: ~40-50 lines
   Critical:

- MUST use real useDashRegister
- MUST call real register.onChange()
- MUST NOT call syncValueToEngine() directly
  Step 2: Modify Integration Tests
  File: libs/dashforge/forms/src/reactions/**tests**/reactionIntegration.test.tsx
  Changes:

1. Import TestFieldHarness from ./testHarness
2. For each skipped test (7.1, 7.4, 7.5, 7.6, 7.7):
   - Remove .skip from it.skip()
   - Create trigger capture: let triggerField: ((value: unknown) => void) | null = null
   - Convert wrapper to named component
   - Add <TestFieldHarness> inside wrapper for watched field
   - Replace all rhf.setValue() calls with triggerField(value) inside act()
     Lines Changed: ~50-75 lines across 5 tests
     Pattern for All Tests:
     // Capture mechanism
     let triggerField: ((value: unknown) => void) | null = null;
     // Named wrapper with harness
     const TestWrapper = ({ children }: { children: ReactNode }) => (
     <DashFormProvider defaultValues={...} reactions={...}>
     <TestFieldHarness
     name="watched-field"
     onRegistered={(trigger) => { triggerField = trigger; }}
     />
     {children}
     </DashFormProvider>
     );
     // Use named wrapper
     const { result } = renderHook(..., { wrapper: TestWrapper });
     // Trigger change
     await act(async () => {
     if (triggerField) {
     triggerField('new-value');
     }
     });
     Step 3: Validation
     Run the following commands in sequence:

# 1. Typecheck

npx nx run @dashforge/forms:typecheck

# 2. Run reaction tests

npx nx run @dashforge/forms:test --testFile=createReactionRegistry.test.ts
npx nx run @dashforge/forms:test --testFile=reactionIntegration.test.tsx

# 3. Full test suite

npx nx run @dashforge/forms:test
Expected Results:

- ✅ Typecheck: 0 errors
- ✅ Unit tests: 47 passing
- ✅ Integration tests: 8 passing (all 7.x tests now passing)
- ✅ Full suite: All tests passing
  If Tests Still Fail:
  This would indicate a REAL wiring gap in production code (not just a test issue). In that case:

1. Diagnose the exact failure point
2. Make minimal surgical production change to close gap
3. Document change in build report
   Step 4: Documentation
   Create reaction-v2-step-03-build.md report with:
4. What was changed (test harness added, tests rewritten)
5. Why it was needed (prove real end-to-end flow)
6. Validation results (all tests passing)
7. Confirmation: Tests now exercise actual production code path
8. Any production changes made (if wiring gap found)

---

Policy Compliance Checklist
✅ No reconciliation logic introduced - N/A (test changes only)  
✅ No automatic value reset - N/A (test changes only)  
✅ No UI logic in reactions - N/A (test changes only)  
✅ No visibleWhen logic moved - N/A (test changes only)  
✅ RHF remains source of truth - Tests use real onChange chain  
✅ Runtime state separate from form - No changes to runtime store  
✅ Reactions are mechanical - N/A (test changes only)  
✅ Surgical approach - Only test harness + test rewrites  
✅ No unrelated refactors - Production code untouched (unless gap proven)  
✅ Tests prove real flow - ✅ YES (uses real registration + real onChange)

---

Risk Assessment
Low Risk

- ✅ Production code unchanged (unless real gap found)
- ✅ Test harness uses real production APIs (useDashRegister)
- ✅ No shortcuts or manual internal calls
- ✅ Proves actual usage patterns
  Potential Issues

1. Test Complexity: Tests become more verbose (wrapper + harness + trigger capture)
   - Mitigation: Clear pattern, copy-paste friendly, well-documented
2. Timing: act() and waitFor() may need adjustment for async reactions
   - Mitigation: Existing tests (7.2, 7.3) already handle this correctly
3. Real Wiring Gap: Tests might fail even with harness, revealing production issue
   - Mitigation: This is GOOD - we discover real gaps and fix them surgically
     Validation Strategy
4. Fix test 7.1 first as proof-of-concept
5. If 7.1 passes → pattern is correct, apply to remaining tests
6. If 7.1 fails → diagnose whether production wiring gap exists
7. Make minimal production fix only if gap proven

---

Success Criteria

1. ✅ All 5 skipped integration tests pass (7.1, 7.4, 7.5, 7.6, 7.7)
2. ✅ Existing 2 passing tests remain passing (7.2, 7.3)
3. ✅ All 47 unit tests remain passing
4. ✅ Typecheck passes with 0 errors
5. ✅ Tests prove REAL end-to-end flow (no shortcuts)
6. ✅ Tests use real useDashRegister + real onChange
7. ✅ No manual syncValueToEngine() calls in tests
8. ✅ No exposed internal adapter
9. ✅ 100% policy compliance maintained

---

Out of Scope (Confirmed)
This plan does NOT include:

- ❌ Final Select UI behavior
- ❌ Unresolved value warnings
- ❌ Reconciliation logic
- ❌ Automatic value reset
- ❌ visibleWhen implementation
- ❌ Translation/i18n
- ❌ Advanced business rules
- ❌ Value healing
- ❌ Production component changes (unless wiring gap proven)

---

File Summary
Files to Create

1. libs/dashforge/forms/src/reactions/**tests**/testHarness.tsx (~40-50 lines)
   - TestFieldHarness component
   - Uses real useDashRegister
   - Exposes trigger for real onChange events
     Files to Modify
1. libs/dashforge/forms/src/reactions/**tests**/reactionIntegration.test.tsx
   - Import TestFieldHarness
   - Remove .skip from 5 tests
   - Rewrite tests to use harness + trigger pattern
   - ~50-75 lines changed across 5 tests
     Files to Modify (Only if Wiring Gap Proven)

- TBD - depends on test results
- Would be documented in implementation phase

---

Key Differences from v1 Plan
Aspect v1 (REJECTED)
Approach Test helper manually calls syncValueToEngine()
Internal APIs Exposes **internal_adapter** on bridge
Test Strategy Shortcut around registration
Production Changes None (assumes wiring works)
End-to-End Proof ❌ No - bypasses onChange chain

---

## Implementation Sequence

1. **Create Test Harness** (~30 min)
   - Write `testHarness.tsx`
   - Use real `useDashRegister`
   - Expose trigger via callback
   - Add comprehensive JSDoc
2. **Fix Test 7.1 First** (~20 min)
   - Import harness
   - Remove `.skip`
   - Add harness to wrapper
   - Replace `setValue()` with trigger
   - Run test to validate approach
3. **Fix Remaining Tests** (~45 min)
   - Apply same pattern to 7.4, 7.5, 7.6, 7.7
   - Test 7.5 has 2 trigger calls
   - Test 7.7 needs only 1 harness (performance test)
4. **Handle Failures (If Any)** (~variable)
   - If tests fail → diagnose production wiring gap
   - Make surgical fix
   - Re-run validation
5. **Full Validation** (~15 min)
   - Typecheck
   - All reaction tests
   - Full forms test suite
6. **Create Build Report** (~30 min)
   - Document all changes
   - Show validation results
   - Confirm policy compliance
   - Note any production changes

---

Questions for User
None - the corrected plan addresses all feedback:

1. ✅ No test helper with manual syncValueToEngine() calls
2. ✅ No exposed internal adapter
3. ✅ Real registration + real events + real runtime observation
4. ✅ Proves actual event-driven chain
5. ✅ Surgical and minimal
6. ✅ Full policy compliance
   Ready to implement.

---

Next Step
When ready to implement: Execute the plan above sequentially, starting with creating the test harness, then fixing test 7.1 to validate the approach, then fixing the remaining 4 tests.
Validation command after implementation:
npx nx run @dashforge/forms:typecheck && \
npx nx run @dashforge/forms:test --testFile=reactionIntegration.test.tsx
Expected: 0 type errors, 8 integration tests passing (all 7.x tests now passing), proving the real end-to-end flow.

---

END OF PLAN v2
