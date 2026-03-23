Reaction V2 Step 05: Unresolved Value Policy - Implementation Plan v2
Status: PLANNING COMPLETE (v2 - Effect-Based Warning)
Date: 2026-03-23  
Task: dashforge/.opencode/tasks/reaction-v2-step-05-unresolved-value-policy.md  
Policy: dashforge/.opencode/policies/reaction-v2.md  
Previous Step: dashforge/.opencode/reports/reaction-v2-step-04-build-v2.md  
Previous Plan: dashforge/.opencode/reports/reaction-v2-step-05-plan.md (v1 - rejected)

---

v2 Changes from v1
Critical Corrections Applied:

1. ✅ NO console warnings during render (React best practice)
2. ✅ Move warning emission to useEffect (side effect isolation)
3. ✅ Keep render pure (computation only, no side effects)
4. ✅ Remove normalizedOptions.length > 0 prerequisite (empty options is valid warning scenario)
5. ✅ Unresolved detection based on policy only (runtime mode + ready + non-null value + no match)
6. ✅ Empty options array is valid warning case (developer should know)
7. ✅ Maintain all existing constraints (no reconciliation, no reset, no UI messaging, dev-only, production silent)
   Architectural Shift:
   Aspect v1 (Rejected)
   Warning location During render
   Render purity Violated (side effect in render)
   Detection computation In render (correct)
   Warning emission In render (wrong)
   Empty options handling Blocked warning

---

## Executive Summary

This plan defines the implementation of **unresolved value detection and developer warnings** for Select components using runtime-driven options (Reactive V2 Step 04).

### Key Objectives

1. ✅ Detect when a form value cannot be resolved against loaded runtime options
2. ✅ Emit development-only warnings for unresolved values (deduplicated, in useEffect)
3. ✅ Keep UI behavior neutral (no automatic reset, no UI messaging)
4. ✅ Maintain strict policy compliance (no reconciliation)
5. ✅ Keep render pure (no side effects)
6. ✅ Add comprehensive tests for unresolved value scenarios

### Scope Boundaries

**IN SCOPE:**

- Unresolved value detection logic (computed in render)
- Development-only console warnings (emitted in useEffect, deduplicated)
- Tests for unresolved value behavior
- Tests for warning emission (dev vs prod)
- Support empty options array as valid warning scenario
  **OUT OF SCOPE (FORBIDDEN):**
- Automatic value reconciliation
- Automatic value reset
- UI messaging ("not found", "invalid", etc.)
- Helper text for unresolved values
- Translation logic
- Business validation
- Value healing/correction
- Side effects during render

---

Current State Analysis
Step 04 Implementation Review
From libs/dashforge/ui/src/components/Select/Select.tsx:
Current runtime integration (lines 188-226):
// Hook called unconditionally (React rules)
const runtime = useFieldRuntime<SelectFieldRuntimeData>(name);
// Resolve options from static or runtime source
const sourceOptions = optionsFromFieldData ? rawRuntimeOptions : options || [];
// Normalize options with mappers
const normalizedOptions = sourceOptions
.map((rawOption) => ({
value: mapValue(rawOption),
label: mapLabel(rawOption),
disabled: mapDisabled(rawOption),
}))
.filter((opt) => opt.value !== undefined);
// Derive loading state
const isLoading = optionsFromFieldData && runtime?.status === 'loading';
What's missing:

1. No detection of unresolved values (form value vs available options)
2. No developer warnings when values don't match loaded options
3. No tests specifically for unresolved value scenarios with warnings
   What's working correctly:
4. ✅ MUI Select naturally displays empty selection for unresolved values
5. ✅ Form value remains unchanged (Step 04 test confirms this)
6. ✅ No automatic reset occurs
7. ✅ Runtime options load and normalize correctly
   Policy Requirements (Section 3.2, 3.3)
   From reaction-v2.md Section 3.2 - Unresolved Value:

- UI MUST display no selected value ✅ (already working via MUI default)
- Form value MUST remain unchanged ✅ (already working via Step 04)
- NO automatic reset ✅ (already enforced via Step 04)
  From reaction-v2.md Section 3.3 - Developer Warning:
- Emit console warning in development mode ONLY
- Must be deduplicated (no spam)
- Must NOT fire during loading
- Must ONLY fire when runtime status is ready and matching failed
- Must NEVER appear in production

---

Implementation Design

1. Unresolved Value Detection (Render - Pure Computation)
   Location: libs/dashforge/ui/src/components/Select/Select.tsx
   Strategy: Two-Phase Approach
   Phase 1: Compute Detection Data (In Render - Pure)
   // Compute unresolved state (pure - no side effects)
   // This happens during render and is safe
   const unresolvedDetection = useMemo(() => {
   // Only detect when using runtime options and runtime is ready
   if (!optionsFromFieldData || runtime?.status !== 'ready' || !bridge) {
   return null;
   }
   const currentValue = bridge.getValue(name);
   // Don't check null/undefined values
   if (currentValue == null) {
   return null;
   }
   // Check if value exists in normalized options
   const isResolved = normalizedOptions.some(
   (opt) => opt.value === currentValue
   );
   if (isResolved) {
   return null; // Value is resolved, nothing to warn about
   }
   // Value is unresolved - return detection data
   return {
   fieldName: name,
   fieldValue: currentValue,
   availableValues: normalizedOptions.map((opt) => opt.value),
   };
   }, [optionsFromFieldData, runtime?.status, bridge, name, normalizedOptions]);
   Key Points:

- ✅ Pure computation (no side effects)
- ✅ Happens in render (safe with useMemo)
- ✅ Returns detection data or null
- ✅ No console.warn here
- ✅ Empty options array (normalizedOptions.length === 0) is valid - will return unresolved detection
- ✅ NO prerequisite for normalizedOptions.length > 0
  Phase 2: Emit Warning (In useEffect - Side Effect)
  // Emit warning in effect (side effect isolation)
  useEffect(() => {
  if (!unresolvedDetection) {
  return; // Nothing to warn about
  }
  // Emit warning via utility function (handles deduplication)
  if (bridge) {
  warnUnresolvedValue(
  bridge,
  unresolvedDetection.fieldName,
  unresolvedDetection.fieldValue,
  unresolvedDetection.availableValues
  );
  }
  }, [unresolvedDetection, bridge]);
  Key Points:
- ✅ Side effect isolated in useEffect
- ✅ Only runs when unresolvedDetection changes
- ✅ Deduplication handled in utility function
- ✅ No warnings during render
- ✅ React-compliant pattern
  Why This Approach:

1. Render Purity: No side effects during render phase
2. React Compliance: Side effects belong in useEffect
3. Testability: Detection data can be verified separately from warning emission
4. Clarity: Clear separation between computation and side effects
5. Performance: useMemo prevents unnecessary recomputation
6. Empty Options Support: No artificial length check - if options are empty and value exists, that's a valid warning

---

2. Development Mode Detection
   Standard React/Vite Pattern:
   const isDevelopment = process.env.NODE_ENV !== 'production';
   Bundler Handling:

- Vite/Rollup will replace process.env.NODE_ENV at build time
- Production builds: process.env.NODE_ENV === 'production' → true
- Development builds: process.env.NODE_ENV !== 'production' → true
- Dead code elimination removes unreachable branches
  Test Environment:
- Vitest runs in NODE_ENV=test by default
- For testing production mode: Mock process.env.NODE_ENV = 'production'
- For testing development mode: Use default test environment

---

3. Warning Deduplication Strategy
   Problem: Without deduplication, warnings fire on every effect run, causing console spam.
   Solution: Module-level WeakMap + Set with Effect-Safe Deduplication
   // At module level (outside component)
   const warnedUnresolvedValues = new WeakMap<
   DashFormBridge,
   Set<string> // Set of "fieldName:value" keys
   > ();
   > /\*\*

- Emit development-only warning for unresolved values.
- Deduplicated per bridge instance and field:value combination.
- Effect-safe (called from useEffect, not render).
-
- Policy: reaction-v2.md Section 3.3
- - Dev-only (never in production)
- - Deduplicated (no console spam)
- - Only when runtime is ready and value doesn't match
- - Called from useEffect (not during render)
    \*/
    function warnUnresolvedValue(
    bridge: DashFormBridge,
    fieldName: string,
    fieldValue: unknown,
    availableValues: (string | number)[]
    ): void {
    // GUARD: Production mode (compile-time eliminated)
    if (process.env.NODE_ENV === 'production') {
    return;
    }
    // GUARD: Deduplication
    const key = `${fieldName}:${String(fieldValue)}`;
    let warned = warnedUnresolvedValues.get(bridge);

if (!warned) {
warned = new Set();
warnedUnresolvedValues.set(bridge, warned);
}
if (warned.has(key)) {
return; // Already warned
}
warned.add(key);
// Emit developer warning
const optionsDisplay = availableValues.length > 0
? availableValues.join(', ')
: '(empty - no options loaded)';
console.warn(
`[Dashforge Select] Unresolved value for field "${fieldName}".\n` +
`Current value "${String(fieldValue)}" does not match any loaded option.\n` +
`The form value remains unchanged (no automatic reset).\n` +
`Available options: ${optionsDisplay}`
);
}
Key Changes from v1:

- ✅ Function called from useEffect (not render)
- ✅ Deduplication still works (WeakMap + Set)
- ✅ Empty options array shows "(empty - no options loaded)" instead of crashing
  Why WeakMap:
- Keys are bridge instances (objects)
- When bridge is garbage collected, warnings Set is automatically cleaned up
- No memory leaks
- Per-form-instance isolation
  Why Set of strings:
- Tracks unique "fieldName:value" combinations
- Prevents duplicate warnings for same field+value
- Allows new warnings if value changes
  Effect-Safe Deduplication:
- Deduplication prevents warning spam even when effect re-runs
- Effect dependency on unresolvedDetection ensures stable warning behavior
- Only warns once per unique field+value combination

---

4. Warning Message Design
   Policy Requirements:

- Developer-oriented (NOT user-facing)
- Clear about what happened
- Explain policy (no automatic reset)
- Help developer understand available options
- Handle empty options gracefully
  Proposed Format (Non-Empty Options):
  [Dashforge Select] Unresolved value for field "city".
  Current value "unknown-city" does not match any loaded option.
  The form value remains unchanged (no automatic reset).
  Available options: nyc, sf, la
  Proposed Format (Empty Options - NEW):
  [Dashforge Select] Unresolved value for field "city".
  Current value "unknown-city" does not match any loaded option.
  The form value remains unchanged (no automatic reset).
  Available options: (empty - no options loaded)
  Key Elements:

1. ✅ Prefix: [Dashforge Select] - identifies source
2. ✅ Field name: helps developer locate issue
3. ✅ Current value: shows what's unresolved
4. ✅ Policy statement: "remains unchanged (no automatic reset)"
5. ✅ Available options: helps developer debug (handles empty array)
6. ✅ NOT translated (English only, developer tool)
7. ✅ NOT user-facing (console only)

---

5. Implementation Steps
   Step 5.1: Add Unresolved Value Detection to Select.tsx
   File: libs/dashforge/ui/src/components/Select/Select.tsx
   Changes:
1. Add bridge context import (line ~3-6):
   import { useDashFormContext } from '@dashforge/ui-core';
   import type { DashFormBridge } from '@dashforge/ui-core';
   import { useMemo, useEffect } from 'react';
1. Add module-level deduplication tracking (after imports, before component):
   // Module-level deduplication for unresolved value warnings (Step 05)
   // Tracks warned field:value combinations per bridge instance
   // WeakMap ensures automatic cleanup when bridge is garbage collected
   const warnedUnresolvedValues = new WeakMap<
   DashFormBridge,
   Set<string> // "fieldName:value" keys
   > ();
1. Add warning utility function (after deduplication tracking):
   /\*\*

- Emit development-only warning for unresolved values.
- Deduplicated per bridge instance and field:value combination.
- Effect-safe (called from useEffect, not render).
-
- Policy: reaction-v2.md Section 3.3
- - Dev-only (never in production)
- - Deduplicated (no console spam)
- - Only when runtime is ready and value doesn't match
- - Called from useEffect (not during render)
    \*/
    function warnUnresolvedValue(
    bridge: DashFormBridge,
    fieldName: string,
    fieldValue: unknown,
    availableValues: (string | number)[]
    ): void {
    // GUARD: Production mode (compile-time eliminated)
    if (process.env.NODE_ENV === 'production') {
    return;
    }
    // GUARD: Deduplication
    const key = `${fieldName}:${String(fieldValue)}`;
    let warned = warnedUnresolvedValues.get(bridge);

if (!warned) {
warned = new Set();
warnedUnresolvedValues.set(bridge, warned);
}
if (warned.has(key)) {
return; // Already warned
}
warned.add(key);
// Emit developer warning
const optionsDisplay = availableValues.length > 0
? availableValues.join(', ')
: '(empty - no options loaded)';
console.warn(
`[Dashforge Select] Unresolved value for field "${fieldName}".\n` +
`Current value "${String(fieldValue)}" does not match any loaded option.\n` +
`The form value remains unchanged (no automatic reset).\n` +
`Available options: ${optionsDisplay}`
);
} 4. Add bridge access in component (after props destructuring, line ~170):
// Access bridge for unresolved value detection (Step 05)
const context = useDashFormContext();
const bridge = context?.bridge; 5. Add unresolved detection computation (after isLoading derivation, before return):
// PHASE 1: Compute unresolved detection data (pure - no side effects)
// Policy: reaction-v2.md Section 3.2, 3.3
// Detection conditions:
// - Using runtime options
// - Runtime status is 'ready'
// - Field has a non-null value
// - Value doesn't match any option (including when options are empty)
const unresolvedDetection = useMemo(() => {
// Only detect when using runtime options and runtime is ready
if (!optionsFromFieldData || runtime?.status !== 'ready' || !bridge) {
return null;
}
const currentValue = bridge.getValue(name);
// Don't check null/undefined values
if (currentValue == null) {
return null;
}
// Check if value exists in normalized options
// NOTE: If normalizedOptions is empty, isResolved will be false (correct)
const isResolved = normalizedOptions.some(
(opt) => opt.value === currentValue
);
if (isResolved) {
return null; // Value is resolved, nothing to warn about
}
// Value is unresolved - return detection data for effect
return {
fieldName: name,
fieldValue: currentValue,
availableValues: normalizedOptions.map((opt) => opt.value),
};
}, [optionsFromFieldData, runtime?.status, bridge, name, normalizedOptions]); 6. Add warning emission effect (after detection computation, before return):
// PHASE 2: Emit warning in effect (side effect isolation)
// This ensures warnings are not emitted during render (React best practice)
useEffect(() => {
if (!unresolvedDetection || !bridge) {
return; // Nothing to warn about or no bridge available
}
// Emit warning (deduplication handled in utility)
warnUnresolvedValue(
bridge,
unresolvedDetection.fieldName,
unresolvedDetection.fieldValue,
unresolvedDetection.availableValues
);
}, [unresolvedDetection, bridge]);
Why this structure:

- ✅ Detection computed in render (pure, memoized)
- ✅ Warning emitted in effect (side effect isolation)
- ✅ No side effects during render
- ✅ React-compliant pattern
- ✅ Clear separation of concerns
- ✅ Empty options array handled correctly (no artificial length check)

---

Step 5.2: Add Focused Tests
File: libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Add new test suite:
describe('Unresolved Value Policy (Step 05)', () => {
// Save original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;
beforeEach(() => {
// Clear console.warn spy
vi.clearAllMocks();
});
afterEach(() => {
// Restore NODE_ENV
process.env.NODE_ENV = originalNodeEnv;
});
it('should display empty UI selection for unresolved value', () => {
const { container } = renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: 'unknown' },
},
initialRuntime: {
city: {
status: 'ready',
error: null,
data: {
options: [
{ value: 'nyc', label: 'New York' },
{ value: 'sf', label: 'San Francisco' },
],
},
},
},
}
);
// MUI Select stores value in hidden input
const hiddenInput = container.querySelector(
'input[name="city"]'
) as HTMLInputElement;

    // Value remains in form state (no reset)
    expect(hiddenInput?.value).toBe('unknown');

    // UI shows no selection (MUI default for unresolved)
    // This is implicit - no exception thrown, component renders

});
it('should NOT reset form value when value is unresolved', () => {
const { getFormValue } = renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: 'deleted-city' },
},
initialRuntime: {
city: {
status: 'ready',
error: null,
data: {
options: [
{ value: 'nyc', label: 'New York' },
],
},
},
},
}
);
// Form value must remain unchanged (policy: no automatic reset)
expect(getFormValue('city')).toBe('deleted-city');
});
it('should emit warning in development mode for unresolved value', async () => {
// Set development mode
process.env.NODE_ENV = 'development';

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithRuntime(
      <Select name="city" label="City" optionsFromFieldData />,
      {
        mockBridgeOptions: {
          defaultValues: { city: 'invalid' },
        },
        initialRuntime: {
          city: {
            status: 'ready',
            error: null,
            data: {
              options: [
                { value: 'nyc', label: 'New York' },
                { value: 'sf', label: 'San Francisco' },
              ],
            },
          },
        },
      }
    );
    // Warning emitted in effect (may need to wait)
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Dashforge Select] Unresolved value')
      );
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('city')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('invalid')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('nyc, sf')
    );
    consoleWarnSpy.mockRestore();

});
it('should NOT emit warning in production mode', async () => {
// Set production mode
process.env.NODE_ENV = 'production';

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithRuntime(
      <Select name="city" label="City" optionsFromFieldData />,
      {
        mockBridgeOptions: {
          defaultValues: { city: 'invalid' },
        },
        initialRuntime: {
          city: {
            status: 'ready',
            error: null,
            data: {
              options: [{ value: 'nyc', label: 'New York' }],
            },
          },
        },
      }
    );
    // Wait to ensure effect has run
    await waitFor(() => {
      // No warning in production
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    consoleWarnSpy.mockRestore();

});
it('should NOT emit warning when runtime is loading', async () => {
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: 'unknown' },
},
initialRuntime: {
city: {
status: 'loading', // Still loading
error: null,
data: null,
},
},
}
);
// Wait to ensure effect would have run if conditions were met
await waitFor(() => {
// No warning during loading
expect(consoleWarnSpy).not.toHaveBeenCalled();
});
consoleWarnSpy.mockRestore();
});
it('should NOT emit warning when value is null or undefined', async () => {
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: null }, // No value
},
initialRuntime: {
city: {
status: 'ready',
error: null,
data: {
options: [{ value: 'nyc', label: 'New York' }],
},
},
},
}
);
// Wait to ensure effect would have run
await waitFor(() => {
// No warning for null/undefined values
expect(consoleWarnSpy).not.toHaveBeenCalled();
});
consoleWarnSpy.mockRestore();
});
it('should emit warning when options are empty (valid scenario)', async () => {
// NEW TEST: Empty options array is a valid warning scenario
process.env.NODE_ENV = 'development';

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithRuntime(
      <Select name="city" label="City" optionsFromFieldData />,
      {
        mockBridgeOptions: {
          defaultValues: { city: 'some-value' },
        },
        initialRuntime: {
          city: {
            status: 'ready',
            error: null,
            data: {
              options: [], // Empty options array
            },
          },
        },
      }
    );
    // Warning should be emitted even with empty options
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Dashforge Select] Unresolved value')
      );
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('some-value')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('(empty - no options loaded)')
    );
    consoleWarnSpy.mockRestore();

});
it('should deduplicate warnings for same field and value', async () => {
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const { rerender } = renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: 'invalid' },
},
initialRuntime: {
city: {
status: 'ready',
error: null,
data: {
options: [{ value: 'nyc', label: 'New York' }],
},
},
},
}
);
// First render: warning emitted (in effect)
await waitFor(() => {
expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
});
// Force re-render (same props, same value)
rerender(
<Select name="city" label="City" optionsFromFieldData />
);
// Wait for effect to potentially run again
await new Promise(resolve => setTimeout(resolve, 50));
// Still only 1 warning (deduplicated)
expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
consoleWarnSpy.mockRestore();
});
it('should continue to work normally for resolved values', async () => {
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const { container } = renderWithRuntime(
<Select name="city" label="City" optionsFromFieldData />,
{
mockBridgeOptions: {
defaultValues: { city: 'nyc' }, // Valid value
},
initialRuntime: {
city: {
status: 'ready',
error: null,
data: {
options: [
{ value: 'nyc', label: 'New York' },
{ value: 'sf', label: 'San Francisco' },
],
},
},
},
}
);
// Wait for effect
await waitFor(() => {
// No warning for resolved values
expect(consoleWarnSpy).not.toHaveBeenCalled();
});
// Value is correctly set
const hiddenInput = container.querySelector(
'input[name="city"]'
) as HTMLInputElement;
expect(hiddenInput?.value).toBe('nyc');
consoleWarnSpy.mockRestore();
});
});
Test Coverage:

- ✅ Empty UI selection for unresolved value
- ✅ No automatic form value reset
- ✅ Warning emitted in development mode (async - waitFor)
- ✅ No warning in production mode (async - waitFor)
- ✅ No warning during loading
- ✅ No warning for null/undefined values
- ✅ NEW: Warning emitted for empty options array
- ✅ Warning deduplication (async - with timeout)
- ✅ Normal operation for resolved values
  Key Testing Changes from v1:
- ✅ All warning-related tests use await waitFor (effect is async)
- ✅ Added new test for empty options array scenario
- ✅ Deduplication test uses timeout to wait for potential second effect run

---

Step 5.3: Update Component JSDoc
File: libs/dashforge/ui/src/components/Select/Select.tsx
Update component JSDoc (line ~122-150):
Update "Runtime Options (Reactive V2)" section:

- Runtime Options (Reactive V2):
- - Set optionsFromFieldData={true} to read options from field runtime state
- - Supports generic option shapes via mapper functions (getOptionValue, getOptionLabel, getOptionDisabled)
- - Loading state disables the field (no UI messaging)
- - Unresolved values: UI displays no selected value, form value remains unchanged (no automatic reset)
- - Development-only warnings: If value cannot be resolved, a console warning is emitted (deduplicated, effect-based)
- - Empty options with non-null value triggers warning (helps detect data loading issues)
- - Production mode: No warnings, silent operation

---

6. Validation Plan
   Step 6.1: Typecheck
   npx nx run @dashforge/ui:typecheck
   Expected: 0 errors
   Potential Issues:

- useDashFormContext import might need type imports
- DashFormBridge type might need explicit import
- useMemo, useEffect imports from 'react'

---

Step 6.2: Run Existing Tests
npx nx run @dashforge/ui:test Select
Expected: All existing tests still pass

- Select.unit.test.tsx: 14/14 ✅
- Select.characterization.test.tsx: 4/4 ✅
- Select.test.tsx: 2/2 ✅
- Select.runtime.test.tsx: 14/14 ✅ (existing)
  Potential Issues:
- Existing tests might trigger new warnings (need to spy/mock console.warn)
- Tests that create unresolved scenarios might now log warnings
- May need to add console.warn spy to existing unresolved tests (Step 04 already has one)

---

Step 6.3: Run New Tests
npx nx run @dashforge/ui:test Select.runtime.test --testNamePattern="Unresolved Value Policy"
Expected: 9/9 new tests pass (added 1 test for empty options)

- Empty UI selection ✅
- No automatic reset ✅
- Development warning (async) ✅
- Production no warning (async) ✅
- No warning during loading ✅
- No warning for null values ✅
- NEW: Warning for empty options array ✅
- Warning deduplication (async) ✅
- Resolved values work normally ✅

---

7. File Change Summary
   Files to Modify
   File Lines
   libs/dashforge/ui/src/components/Select/Select.tsx ~268 → ~350
   libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx ~461 → ~750
   No New Files
   All changes are additive to existing files.

---

8. API Surface Changes
   Public API: No Breaking Changes ✅
   SelectProps Interface:

- No new required props
- No modified prop signatures
- No removed props
- Fully backward compatible
  Behavior Changes:
- New: Development-only console warnings for unresolved values (emitted in effect)
- New: Warning for empty options array with non-null value
- Unchanged: UI displays empty selection for unresolved
- Unchanged: Form value remains unchanged (no reset)
- Unchanged: Runtime options loading and normalization
  Internal Changes
  New Internal Utilities:
  // Module-level deduplication tracking
  const warnedUnresolvedValues: WeakMap<DashFormBridge, Set<string>>
  // Warning utility (effect-safe)
  function warnUnresolvedValue(
  bridge: DashFormBridge,
  fieldName: string,
  fieldValue: unknown,
  availableValues: (string | number)[]
  ): void
  New Dependencies:
- useDashFormContext from @dashforge/ui-core (already in package)
- DashFormBridge type from @dashforge/ui-core (already in package)
- useMemo, useEffect from react (already in package)

---

9. Risk Analysis
   Low Risk ✅
   Why Low Risk:
1. No behavior changes - only adds warnings (in effects)
1. No API changes - fully backward compatible
1. Development-only - production unaffected
1. Additive only - no refactoring of existing logic
1. Well-tested - 9 new focused tests (async-aware)
1. Policy-compliant - strict adherence to reaction-v2.md
1. React-compliant - side effects in useEffect, render stays pure
   Potential Issues & Mitigations
   Risk Likelihood
   Console spam from warnings Low
   Warning shows in production Low
   Bridge not available in some contexts Low
   Existing tests break due to warnings Medium
   Effect timing issues in tests Medium
   TypeScript errors from imports Low
   Memory leaks from WeakMap Very Low
   Effect runs too often Low

---

### 10. Policy Compliance Checklist

**From `reaction-v2.md` Section 3.2 (Unresolved Value):**

- ✅ UI displays no selected value (already working, preserved)
- ✅ Form value remains unchanged (already working, preserved)
- ✅ NO automatic reset (already working, preserved)
  **From `reaction-v2.md` Section 3.3 (Developer Warning):**
- ✅ Emit console warning in development only
- ✅ Value is not null
- ✅ Runtime status is `ready`
- ✅ No matching option exists
- ✅ Warning is deduplicated
- ✅ Warning does NOT fire during loading
- ✅ Warning NEVER appears in production
- ✅ **NEW:** Warning emitted in useEffect (not during render)
  **From `reaction-v2.md` Section 3.4 (No UI Messaging):**
- ✅ Component MUST NOT display "not found"
- ✅ Component MUST NOT display automatic error messages
- ✅ Component MUST NOT perform translations
  **From Task Out of Scope (Section "Out of scope"):**
- ✅ NO reconciliation implemented
- ✅ NO automatic value reset implemented
- ✅ NO visibleWhen changes
- ✅ NO translation or user-facing runtime messages
- ✅ NO helper text like "not found"
- ✅ NO loading/empty-state messaging
- ✅ NO business validation logic
- ✅ NO changes to reaction semantics
- ✅ NO runtime-driven form value healing
  **React Best Practices:**
- ✅ NO side effects during render
- ✅ Side effects isolated in useEffect
- ✅ Render function is pure (computation only)

---

11. Success Criteria
    Definition of Done:
1. ✅ Unresolved value detection implemented (useMemo - pure)
1. ✅ Development-only warnings emit correctly (useEffect - side effect)
1. ✅ Production mode remains silent (no warnings)
1. ✅ Warning deduplication works (no spam)
1. ✅ No warnings during loading state
1. ✅ Form values never reset automatically
1. ✅ UI displays empty selection for unresolved (unchanged)
1. ✅ Empty options array triggers warning (developer visibility)
1. ✅ All existing tests pass (34/34)
1. ✅ All new tests pass (9/9, async-aware)
1. ✅ Typecheck passes (0 errors)
1. ✅ Policy compliance verified
1. ✅ Render stays pure (no side effects)
1. ✅ Build report created
   Total Expected Test Count: 43 tests (34 existing + 9 new)

---

12. Implementation Sequence
    Recommended Order:
1. Read Phase (Plan - Current)
   - ✅ Read task requirements
   - ✅ Read policy document
   - ✅ Analyze current implementation
   - ✅ Design solution (v1)
   - ✅ Apply corrections (v2)
   - ✅ Create updated plan
1. Implementation Phase (Execution)
   - [ ] Add module-level deduplication tracking to Select.tsx
   - [ ] Add warnUnresolvedValue utility function to Select.tsx (effect-safe)
   - [ ] Add bridge context access to Select component
   - [ ] Add unresolved detection computation (useMemo) to Select component
   - [ ] Add warning emission effect (useEffect) to Select component
   - [ ] Update Select component JSDoc
   - [ ] Add new test suite to Select.runtime.test.tsx (async-aware tests)
   - [ ] Add console.warn spy to existing unresolved tests if needed
1. Validation Phase
   - [ ] Run typecheck
   - [ ] Run all Select tests
   - [ ] Run new unresolved policy tests specifically
   - [ ] Verify warning output format (including empty options message)
   - [ ] Verify production mode (no warnings)
   - [ ] Verify deduplication works
   - [ ] Verify warnings emitted in effect (not render)
1. Documentation Phase
   - [ ] Create build report: reaction-v2-step-05-build.md
   - [ ] Document file changes
   - [ ] Document API changes (none expected)
   - [ ] Document test results
   - [ ] Confirm policy compliance
   - [ ] Document effect-based warning pattern
   - [ ] Create migration notes (none needed)

---

13. Architecture Notes
    Two-Phase Pattern (v2)
    Phase 1: Detection (Render - Pure)
    const unresolvedDetection = useMemo(() => {
    // Pure computation
    // Returns detection data or null
    // NO side effects
    }, [dependencies]);
    Phase 2: Warning (Effect - Side Effect)
    useEffect(() => {
    if (unresolvedDetection) {
    // Side effect: console.warn
    warnUnresolvedValue(...);
    }
    }, [unresolvedDetection]);
    Why This Pattern:
1. Separation of Concerns: Detection vs warning emission
1. Render Purity: No side effects during render
1. React Compliance: Side effects in effects
1. Testability: Can verify detection independently
1. Performance: useMemo prevents unnecessary recomputation
   Empty Options Handling (v2 Addition)
   Scenario: Runtime is ready, options array is empty, field has value
   v1 Behavior (WRONG):

- Blocked by normalizedOptions.length > 0 check
- No warning emitted
- Developer unaware of issue
  v2 Behavior (CORRECT):
- No artificial length check
- Warning emitted: "Available options: (empty - no options loaded)"
- Developer aware of data loading issue
- Helps debug runtime/reaction problems

---

14. Open Questions & Decisions
    Q1: Why move warning to useEffect?
    Answer: React best practice

- Warnings are side effects
- Side effects belong in useEffect
- Render should be pure (computation only)
- Console.warn during render can cause issues
- Effect timing is more predictable
  Q2: Will effect-based warning work with deduplication?
  Answer: Yes
- WeakMap + Set deduplication still works
- Effect may run multiple times, deduplication prevents spam
- Dependency on unresolvedDetection ensures stable behavior
  Q3: Should we warn for empty options array?
  Answer: Yes (v2 correction)
- Developer should know when options are empty
- Helps debug runtime/reaction issues
- Empty options + non-null value = potential bug
- Warning message handles empty array gracefully
  Q4: Will tests need async assertions?
  Answer: Yes
- useEffect is asynchronous
- Tests must use waitFor for warning assertions
- Deduplication test needs timeout to wait for potential second effect
- Production mode test needs waitFor to ensure effect ran
  Q5: Does useMemo add performance overhead?
  Answer: Minimal, beneficial
- Prevents unnecessary detection recalculation
- Dependencies are already tracked values
- Memoization is standard React pattern
- Performance gain outweighs cost

---

15. v1 vs v2 Comparison
    Aspect v1 (Rejected)
    Warning Location During render (inline)
    Render Purity ❌ Violated (side effect)
    Detection Inline computation
    Empty Options Check normalizedOptions.length > 0
    Empty Options Warning ❌ Blocked
    React Compliance ❌ Side effect in render
    Test Strategy Synchronous assertions
    Test Count 8 tests
    Deduplication Same (WeakMap + Set)
    Performance Inline computation

---

### 16. Expected Build Report Outline

**File:** `dashforge/.opencode/reports/reaction-v2-step-05-build.md`
**Sections:**

1. Status: ✅ COMPLETE
2. Summary
3. v2 Corrections Applied (effect-based, empty options support)
4. Key Features Implemented
5. Files Modified
6. Test Results (43/43 tests passing)
7. Typecheck Results (0 errors)
8. Policy Compliance Verification
9. React Compliance Verification (render purity)
10. Warning Output Examples (including empty options)
11. Coverage Report
12. Architecture Notes (two-phase pattern, effect-based warning)
13. Breaking Changes (none)
14. API Surface Changes (none)
15. Migration Guide (none needed)
16. Performance Impact (negligible, positive from useMemo)
17. Lessons Learned (render purity, effect-based side effects)
18. Sign-Off

---

17. Pre-Implementation Checklist
    Before starting implementation, confirm:

- ✅ Task requirements fully understood
- ✅ Policy requirements fully understood
- ✅ Current implementation analyzed
- ✅ Solution design complete (v2 corrections applied)
- ✅ Test strategy defined (async-aware)
- ✅ Risk analysis complete
- ✅ Success criteria defined
- ✅ File changes identified
- ✅ No scope creep (no reconciliation, no reset, no UI messaging)
- ✅ Render purity maintained (no side effects in render)
- ✅ Effect-based warning pattern understood
- ✅ Empty options support confirmed
- ✅ Plan reviewed and approved

---

Summary
This plan (v2) defines a surgical, policy-compliant, React-compliant implementation of unresolved value detection and development-only warnings for Select components using runtime-driven options.
Key Points:

1. Minimal Changes: Only adds warning logic (effect-based), no behavior changes
2. Policy Compliant: Strict adherence to reaction-v2.md Section 3.2, 3.3, 3.4
3. React Compliant: Side effects in useEffect, render stays pure
4. Empty Options Support: No artificial length check, warns when options are empty
5. Well-Tested: 9 new focused tests (async-aware), all existing tests pass
6. Production-Safe: Warnings only in development, compile-time eliminated in production
7. No Scope Creep: No reconciliation, no reset, no UI messaging
8. Backward Compatible: No API changes, no breaking changes
9. Clean Architecture: Two-phase pattern (detection + warning), WeakMap deduplication
   v2 Improvements over v1:
10. ✅ Render Purity: No side effects during render
11. ✅ Effect-Based Warning: console.warn in useEffect (React best practice)
12. ✅ Empty Options Support: Removed artificial length check
13. ✅ Better Testing: Async-aware tests with waitFor
14. ✅ Performance: useMemo for detection computation
    Ready for Implementation: ✅

---

Plan Status: COMPLETE (v2)  
Next Step: User approval → Implementation  
Estimated Implementation Time: 2-3 hours  
Estimated Testing Time: 1-1.5 hours (async tests need more care)  
Total Estimated Time: 3.5-4.5 hours
