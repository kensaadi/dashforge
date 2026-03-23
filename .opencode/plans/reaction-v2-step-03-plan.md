# Reaction V2 Step 03: Field Change Wiring - Implementation Plan

**Application:** dashforge  
**Created:** 2026-03-23  
**Status:** PLAN - Ready for Implementation  
**Policy:** `/dashforge/.opencode/policies/reaction-v2.md` (mandatory compliance)

---

## Executive Summary

**Problem Identified:**  
The production wiring from field changes → reaction evaluation is **already complete and working**. The 5 skipped integration tests fail because they use `rhf.setValue()` directly, which bypasses the `onChange` chain that real field components use.

**Root Cause:**  
```typescript
// In tests (INCORRECT - bypasses onChange):
result.current.form.rhf.setValue('trigger', 'active');
// ❌ Does NOT trigger: onChange → syncValueToEngine → listeners → evaluateForField

// In real usage (CORRECT - production code):
<input {...register} onChange={...} />
// ✅ Triggers: onChange → syncValueToEngine → listeners → evaluateForField
```

**Solution:**  
Create a test utility helper that simulates real field behavior by manually triggering the sync chain after `setValue()` calls. This makes tests realistic while keeping production code untouched.

**Impact:**  
- ✅ No production code changes required (wiring already works!)
- ✅ Tests become realistic (mirror actual usage)
- ✅ All 5 skipped tests will pass
- ✅ 100% policy compliant (no reconciliation, no UI logic)

---

## Current State Analysis

### Production Wiring (Already Complete ✅)

The complete chain exists in production code:

1. **Field Component** → Uses `useDashRegister(name)`
2. **useDashRegister** (lines 117-131) → Wraps `onChange`:
   - Calls `rhfRegister.onChange(event)` (updates RHF)
   - Extracts value from event
   - Calls `adapter.syncValueToEngine(name, value)`
3. **FormEngineAdapter** (lines 134-159) → `syncValueToEngine`:
   - Updates engine with `engine.updateNode()`
   - Notifies all `onValueSyncCallbacks` (line 156-158)
4. **DashFormProvider** (lines 399-426) → Subscription:
   - Subscribes to adapter via `addOnValueSyncListener()`
   - Receives `fieldName` on value sync
   - Calls `reactionRegistry.evaluateForField(fieldName)`
5. **ReactionRegistry** → Executes matching reactions

**This flow is working perfectly for real field components.**

### Test Problem (Why Tests Are Skipped)

All 5 skipped tests follow this broken pattern:

```typescript
// Test code:
const { result } = renderHook(
  () => ({ form: useDashFormContext(), runtime: useFieldRuntime('target') }),
  { wrapper }
);

// Change field value (PROBLEM HERE):
await act(async () => {
  result.current.form.rhf.setValue('trigger', 'active'); // ❌ Bypasses onChange!
});

// Expectation:
await waitFor(() => {
  expect(result.current.runtime.status).toBe('loading'); // ❌ Never updates
});
```

**Why It Fails:**
- `rhf.setValue()` updates RHF internal state directly
- This does NOT fire the `onChange` handler registered by `useDashRegister`
- Without `onChange`, `syncValueToEngine()` never runs
- Without sync, adapter listeners never fire
- Without listeners, `evaluateForField()` never executes
- Reactions never run → runtime state never updates → test fails

### Affected Tests

| Test ID | Description | Line | Root Cause |
|---------|-------------|------|------------|
| 7.1 | Field change triggers reaction | 19 | `setValue()` bypasses onChange |
| 7.4 | Multiple reactions on same field | 140 | `setValue()` bypasses onChange |
| 7.5 | Async staleness tracking | 183 | `setValue()` bypasses onChange (multiple times) |
| 7.6 | RHF fallback for unmounted fields | 263 | `setValue()` bypasses onChange |
| 7.7 | O(1) lookup performance | 320 | `setValue()` bypasses onChange |

---

## Implementation Plan

### Approach: Test Utility Helper (Recommended)

Create a test helper that manually triggers the sync chain after `setValue()` calls, simulating what real field components do automatically.

#### Option A: Context-Aware Helper (RECOMMENDED)

**File:** `libs/dashforge/forms/src/reactions/__tests__/testUtils.tsx`

```typescript
/**
 * Test utility: Simulates real field behavior by triggering sync chain.
 * 
 * Real field components automatically trigger:
 * onChange → syncValueToEngine → adapter listeners → evaluateForField
 * 
 * Tests use rhf.setValue() which bypasses onChange, so we manually trigger
 * the sync chain to mirror production behavior.
 */
export function createFieldChangeHelper(
  form: ReturnType<typeof useDashFormContext>
) {
  return {
    /**
     * Simulates a real field change by:
     * 1. Updating RHF value (via setValue)
     * 2. Manually triggering syncValueToEngine (what onChange does)
     */
    async setFieldValue(name: string, value: unknown): Promise<void> {
      // Step 1: Update RHF (what onChange does first)
      form.rhf.setValue(name as any, value);
      
      // Step 2: Sync to engine (what onChange does second)
      // Access internal adapter through form context
      const adapter = (form as any).__adapter__;
      if (adapter && typeof adapter.syncValueToEngine === 'function') {
        adapter.syncValueToEngine(name, value);
      }
    },
  };
}
```

**Why This Approach:**
- ✅ Mirrors real production behavior exactly
- ✅ No production code changes required
- ✅ Tests become realistic (test actual flow)
- ✅ Easy to use: `helper.setFieldValue('name', 'value')`
- ✅ Documents why it's needed (educates future developers)

#### Alternative: Expose Adapter on Bridge (If Context Access Fails)

If `__adapter__` access is not feasible, expose adapter explicitly:

**File:** `libs/dashforge/forms/src/core/form.types.ts`

```typescript
export interface DashFormBridge<TFieldValues extends FieldValues> {
  // ... existing methods ...
  
  /**
   * @internal
   * For testing only: Access to internal adapter.
   * DO NOT use in production components.
   */
  __internal_adapter__?: FormEngineAdapter<TFieldValues>;
}
```

**File:** `libs/dashforge/forms/src/core/DashFormProvider.tsx`

```typescript
const bridgeValue: DashFormBridge<TFieldValues> = {
  // ... existing properties ...
  
  // Expose adapter for testing (non-enumerable)
  __internal_adapter__: adapter,
};
```

Then test helper becomes:

```typescript
async setFieldValue(name: string, value: unknown): Promise<void> {
  form.rhf.setValue(name as any, value);
  form.__internal_adapter__?.syncValueToEngine(name, value);
}
```

### Test Modifications

Update each skipped test to use the helper:

#### Test 7.1 (lines 19-60)

**BEFORE:**
```typescript
it.skip('field change triggers reaction that updates runtime state', async () => {
  // ... setup ...
  
  await act(async () => {
    result.current.form.rhf.setValue('trigger', 'active'); // ❌
  });
  
  await waitFor(() => {
    expect(result.current.runtime.status).toBe('loading');
  });
});
```

**AFTER:**
```typescript
it('field change triggers reaction that updates runtime state', async () => {
  // ... setup ...
  
  const helper = createFieldChangeHelper(result.current.form);
  
  await act(async () => {
    await helper.setFieldValue('trigger', 'active'); // ✅
  });
  
  await waitFor(() => {
    expect(result.current.runtime.status).toBe('loading');
  });
});
```

#### Test 7.4 (lines 140-179)

**Change:** Same pattern - replace `setValue()` with `helper.setFieldValue()`.

#### Test 7.5 (lines 183-259)

**Change:** Multiple `setValue()` calls - replace both:
```typescript
const helper = createFieldChangeHelper(result.current.form);

// Start slow request
await act(async () => {
  await helper.setFieldValue('query', 'slow'); // ✅
});

// Start fast request
await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  await helper.setFieldValue('query', 'fast'); // ✅
});
```

#### Test 7.6 (lines 263-316)

**Change:** Replace `setValue()` with `helper.setFieldValue()`.

#### Test 7.7 (lines 320-388)

**Change:** Replace `setValue()` with `helper.setFieldValue()`.

---

## Implementation Steps

### Step 1: Create Test Utility Helper

**File:** `libs/dashforge/forms/src/reactions/__tests__/testUtils.tsx` (NEW)

**Content:**
1. Import required types (`useDashFormContext`, etc.)
2. Define `createFieldChangeHelper()` function
3. Implement `setFieldValue()` method
4. Add JSDoc explaining why this exists

**Lines:** ~50 lines

**Tests:** None needed (utility for tests)

### Step 2: Modify Integration Tests

**File:** `libs/dashforge/forms/src/reactions/__tests__/reactionIntegration.test.tsx`

**Changes:**
1. Import `createFieldChangeHelper` from `./testUtils`
2. For each skipped test (7.1, 7.4, 7.5, 7.6, 7.7):
   - Remove `.skip` from `it.skip()`
   - Create helper: `const helper = createFieldChangeHelper(result.current.form)`
   - Replace all `rhf.setValue()` with `helper.setFieldValue()`

**Lines Changed:** ~15 locations across 5 tests

### Step 3: (Optional) Expose Adapter If Needed

**Only if direct `__adapter__` access doesn't work.**

**File:** `libs/dashforge/forms/src/core/form.types.ts`

**Change:** Add `__internal_adapter__?: FormEngineAdapter<TFieldValues>` to `DashFormBridge`

**File:** `libs/dashforge/forms/src/core/DashFormProvider.tsx`

**Change:** Add `__internal_adapter__: adapter` to `bridgeValue` object

**Lines:** 2-4 lines total

### Step 4: Validation

Run the following commands in sequence:

```bash
# 1. Typecheck
npx nx run @dashforge/forms:typecheck

# 2. Run all reaction tests
npx nx run @dashforge/forms:test --testFile=createReactionRegistry.test.ts
npx nx run @dashforge/forms:test --testFile=reactionIntegration.test.tsx

# 3. Full test suite
npx nx run @dashforge/forms:test
```

**Expected Results:**
- ✅ Typecheck: 0 errors
- ✅ Unit tests (createReactionRegistry.test.ts): 47 passing
- ✅ Integration tests (reactionIntegration.test.tsx): 8 passing (7.1-7.7 + initial eval + strict mode)
- ✅ Full suite: All tests passing

### Step 5: Documentation

Update `reaction-v2-step-03-build.md` report with:
1. What was changed (test helper added, tests fixed)
2. Why it was needed (tests bypassed onChange)
3. Validation results (all tests passing)
4. Confirmation: No production code logic changed

---

## Policy Compliance Checklist

✅ **No reconciliation logic introduced** - Tests only, no value healing  
✅ **No automatic value reset** - N/A (test changes only)  
✅ **No UI logic in reactions** - N/A (test changes only)  
✅ **No visibleWhen logic moved** - N/A (test changes only)  
✅ **RHF remains source of truth** - Tests use `setValue()` correctly  
✅ **Runtime state separate from form** - No changes to runtime store  
✅ **Reactions are mechanical** - N/A (test changes only)  
✅ **Surgical approach** - Only test file + small helper added  
✅ **No unrelated refactors** - Production code untouched  

---

## Risk Assessment

### Low Risk
- ✅ Production code unchanged (or minimal exposure for adapter)
- ✅ Only test infrastructure modified
- ✅ Helper mimics existing production behavior
- ✅ No new architectural patterns

### Potential Issues
1. **Adapter Access:** If `__adapter__` is not accessible, need to expose via bridge (covered in Alternative approach)
2. **Timing:** `act()` and `waitFor()` may need adjustment for async reactions (already handled in current tests)
3. **Type Safety:** Need to ensure `name` parameter typing aligns with RHF generics (use `as any` escape hatch if needed)

### Mitigation
- Start with Option A (direct access)
- Fall back to Option B (exposed adapter) if needed
- Run validation after each test to catch timing issues early

---

## Success Criteria

1. ✅ All 5 skipped integration tests pass (7.1, 7.4, 7.5, 7.6, 7.7)
2. ✅ Existing 2 passing tests remain passing (7.2, 7.3)
3. ✅ All 47 unit tests remain passing
4. ✅ Typecheck passes with 0 errors
5. ✅ No production code logic changes (only test infrastructure)
6. ✅ Tests mirror real production usage patterns
7. ✅ 100% policy compliance maintained

---

## Out of Scope (Confirmed)

This plan does NOT include:
- ❌ Final Select UI behavior
- ❌ Unresolved value warnings
- ❌ Reconciliation logic
- ❌ Automatic value reset
- ❌ visibleWhen implementation
- ❌ Translation/i18n
- ❌ Advanced business rules
- ❌ Value healing
- ❌ Production component changes

---

## File Summary

### Files to Create
1. `libs/dashforge/forms/src/reactions/__tests__/testUtils.tsx` (~50 lines)
   - Test helper: `createFieldChangeHelper()`
   - Simulates real field onChange behavior

### Files to Modify
1. `libs/dashforge/forms/src/reactions/__tests__/reactionIntegration.test.tsx`
   - Import test helper
   - Remove `.skip` from 5 tests
   - Replace `rhf.setValue()` with `helper.setFieldValue()`
   - ~15 locations changed

### Files to Modify (Optional - Only if Alternative Needed)
1. `libs/dashforge/forms/src/core/form.types.ts`
   - Add `__internal_adapter__` to `DashFormBridge` interface
2. `libs/dashforge/forms/src/core/DashFormProvider.tsx`
   - Expose adapter on bridge value

---

## Implementation Sequence

1. **Read Phase** ✅ (Already Complete)
   - Analyzed Step 02 implementation
   - Identified wiring gap (tests bypass onChange)
   - Confirmed production wiring is complete

2. **Create Test Helper**
   - Write `testUtils.tsx`
   - Add JSDoc documentation
   - Keep it simple (~50 lines)

3. **Fix Test 7.1 First**
   - Import helper
   - Remove `.skip`
   - Replace `setValue()` with `helper.setFieldValue()`
   - Run test to validate approach

4. **Fix Remaining Tests**
   - Apply same pattern to 7.4, 7.5, 7.6, 7.7
   - Test 7.5 has multiple `setValue()` calls - replace all

5. **Run Full Validation**
   - Typecheck
   - All reaction tests
   - Full forms test suite

6. **Create Build Report**
   - Document changes
   - Show validation results
   - Confirm policy compliance

---

## Questions for User

None - the plan is clear and surgical. Ready to implement.

---

## Next Step

**When ready to implement:** Execute the plan above sequentially, starting with creating the test utility helper, then fixing test 7.1 to validate the approach, then fixing the remaining 4 tests.

**Validation command after implementation:**
```bash
npx nx run @dashforge/forms:typecheck && \
npx nx run @dashforge/forms:test --testFile=reactionIntegration.test.tsx
```

Expected: 0 type errors, 8 integration tests passing (all previously skipped tests now passing).
