dashforge/.opencode/reports/reaction-v3-step-05-plan.md
Reaction V2 Step 05: Unresolved Value Policy - Implementation Plan
Status: PLANNING COMPLETE
Date: 2026-03-23  
Task: dashforge/.opencode/tasks/reaction-v2-step-05-unresolved-value-policy.md  
Policy: dashforge/.opencode/policies/reaction-v2.md  
Previous Step: dashforge/.opencode/reports/reaction-v2-step-04-build-v2.md

---

Executive Summary
This plan defines the implementation of unresolved value detection and developer warnings for Select components using runtime-driven options (Reactive V2 Step 04).
Key Objectives

1. ✅ Detect when a form value cannot be resolved against loaded runtime options
2. ✅ Emit development-only warnings for unresolved values (deduplicated)
3. ✅ Keep UI behavior neutral (no automatic reset, no UI messaging)
4. ✅ Maintain strict policy compliance (no reconciliation)
5. ✅ Add comprehensive tests for unresolved value scenarios
   Scope Boundaries
   IN SCOPE:

- Unresolved value detection logic
- Development-only console warnings (deduplicated)
- Tests for unresolved value behavior
- Tests for warning emission (dev vs prod)
  OUT OF SCOPE (FORBIDDEN):
- Automatic value reconciliation
- Automatic value reset
- UI messaging ("not found", "invalid", etc.)
- Helper text for unresolved values
- Translation logic
- Business validation
- Value healing/correction

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

1. Unresolved Value Detection
   Location: libs/dashforge/ui/src/components/Select/Select.tsx
   Logic to add (after line 226, before return statement):
   // Detect unresolved values (Step 05: Unresolved Value Policy)
   // Only check when:
   // - using runtime options
   // - runtime is ready (not loading/error/idle)
   // - field has a non-null/non-undefined value
   // - value doesn't match any normalized option
   const shouldCheckUnresolved =
   optionsFromFieldData &&
   runtime?.status === 'ready' &&
   normalizedOptions.length > 0;
   if (shouldCheckUnresolved) {
   // Need access to current form value
   // Problem: We don't have direct access to bridge here
   // Solution: Use a ref + useEffect to read value from DOM or add bridge context
   }
   CRITICAL DISCOVERY: The Select component doesn't have direct access to the current form value. It delegates to TextField, which has bridge access via useDashFormContext().
   Two Implementation Approaches:
   Approach A: Add Bridge Access to Select ⭐ RECOMMENDED

- Import useDashFormContext from @dashforge/ui-core
- Read current value via bridge?.getValue(name)
- Check if value exists in normalizedOptions
- Emit warning if unresolved
- Clean, straightforward, follows existing patterns
  Pros:
- Simple, direct value access
- Consistent with TextField's pattern
- No prop drilling
- Easy to test
  Cons:
- Select now directly uses bridge (previously delegated all to TextField)
- Adds one more hook call
  Approach B: Pass Value from Parent via Prop
- Add value?: T to SelectProps
- Parent must pass current value explicitly
- Check value against normalizedOptions
  Pros:
- No additional bridge coupling
  Cons:
- Requires API change (new prop)
- Breaks existing usage (needs value prop everywhere)
- Not practical for existing implementations
  DECISION: Use Approach A - Add bridge access to Select for value reading

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

3.  Warning Deduplication Strategy
    Problem: Without deduplication, warnings fire on every render, causing console spam.
    Solution: Component-level Set with WeakMap
    // At module level (outside component)
    const warnedUnresolvedValues = new WeakMap<
    object, // bridge instance
    Set<string> // Set of "fieldName:value" keys
    > ();
    > // Inside component
    > const warnUnresolvedValue = (
    > bridge: DashFormBridge,
    > fieldName: string,
    > fieldValue: unknown
    > ) => {
    > if (process.env.NODE_ENV === 'production') {
        return; // No warnings in production
    }
    const key = `${fieldName}:${String(fieldValue)}`;
    let warned = warnedUnresolvedValues.get(bridge);

if (!warned) {
warned = new Set();
warnedUnresolvedValues.set(bridge, warned);
}
if (warned.has(key)) {
return; // Already warned for this field:value combination
}
warned.add(key);
console.warn(
`[Dashforge Select] Unresolved value for field "${fieldName}". ` +
`Current value "${String(fieldValue)}" does not match any loaded option. ` +
`The form value remains unchanged (no automatic reset). ` +
`Available options: ${availableValues.join(', ')}`
);
};
Why WeakMap:

- Keys are bridge instances (objects)
- When bridge is garbage collected, warnings Set is automatically cleaned up
- No memory leaks
- Per-form-instance isolation
  Why Set of strings:
- Tracks unique "fieldName:value" combinations
- Prevents duplicate warnings for same field+value
- Allows new warnings if value changes
  Alternative Considered: useRef
- Would track per-component instance
- Doesn't survive remounts
- Less robust than WeakMap approach
  DECISION: Use WeakMap + Set pattern

---

4. Warning Message Design
   Policy Requirements:

- Developer-oriented (NOT user-facing)
- Clear about what happened
- Explain policy (no automatic reset)
- Help developer understand available options
  Proposed Format:
  [Dashforge Select] Unresolved value for field "city".
  Current value "unknown-city" does not match any loaded option.
  The form value remains unchanged (no automatic reset).
  Available options: nyc, sf, la
  Key Elements:

1. ✅ Prefix: [Dashforge Select] - identifies source
2. ✅ Field name: helps developer locate issue
3. ✅ Current value: shows what's unresolved
4. ✅ Policy statement: "remains unchanged (no automatic reset)"
5. ✅ Available options: helps developer debug
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
-
- Policy: reaction-v2.md Section 3.3
- - Dev-only (never in production)
- - Deduplicated (no console spam)
- - Only when runtime is ready and value doesn't match
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
console.warn(
`[Dashforge Select] Unresolved value for field "${fieldName}".\n` +
`Current value "${String(fieldValue)}" does not match any loaded option.\n` +
`The form value remains unchanged (no automatic reset).\n` +
`Available options: ${availableValues.join(', ')}`
);
} 4. Add bridge access in component (after props destructuring, line ~170):
// Access bridge for unresolved value detection (Step 05)
const context = useDashFormContext();
const bridge = context?.bridge; 5. Add unresolved value detection (after isLoading derivation, before return):
// Detect and warn for unresolved values (Step 05: Unresolved Value Policy)
// Policy: reaction-v2.md Section 3.2, 3.3
// - Only check when using runtime options
// - Only check when runtime status is 'ready'
// - Only check when field has a value
// - Only warn in development mode
// - Deduplicated per bridge+field+value
if (
optionsFromFieldData &&
runtime?.status === 'ready' &&
bridge &&
normalizedOptions.length > 0
) {
const currentValue = bridge.getValue(name);

// Check if value is non-null/undefined and not in options
if (currentValue != null) {
const isResolved = normalizedOptions.some(
(opt) => opt.value === currentValue
);
if (!isResolved) {
const availableValues = normalizedOptions.map((opt) => opt.value);
warnUnresolvedValue(bridge, name, currentValue, availableValues);
}
}
}
Why this location:

- After normalizedOptions is computed (need available options)
- After isLoading check (don't warn during loading)
- Before return (last logic before render)
- Clean separation from rendering logic

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
it('should emit warning in development mode for unresolved value', () => {
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
    // Warning should be emitted
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Dashforge Select] Unresolved value')
    );
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
it('should NOT emit warning in production mode', () => {
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
    // No warning in production
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();

});
it('should NOT emit warning when runtime is loading', () => {
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
// No warning during loading
expect(consoleWarnSpy).not.toHaveBeenCalled();
consoleWarnSpy.mockRestore();
});
it('should NOT emit warning when value is null or undefined', () => {
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
// No warning for null/undefined values
expect(consoleWarnSpy).not.toHaveBeenCalled();
consoleWarnSpy.mockRestore();
});
it('should deduplicate warnings for same field and value', () => {
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
// First render: warning emitted
expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
// Force re-render (same props, same value)
rerender(
<Select name="city" label="City" optionsFromFieldData />
);
// Still only 1 warning (deduplicated)
expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
consoleWarnSpy.mockRestore();
});
it('should continue to work normally for resolved values', () => {
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
// No warning for resolved values
expect(consoleWarnSpy).not.toHaveBeenCalled();
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
- ✅ Warning emitted in development mode
- ✅ No warning in production mode
- ✅ No warning during loading
- ✅ No warning for null/undefined values
- ✅ Warning deduplication
- ✅ Normal operation for resolved values

---

Step 5.3: Update Component JSDoc
File: libs/dashforge/ui/src/components/Select/Select.tsx
Update component JSDoc (line ~122-150):
Add to "Runtime Options (Reactive V2)" section:

- Runtime Options (Reactive V2):
- - Set optionsFromFieldData={true} to read options from field runtime state
- - Supports generic option shapes via mapper functions (getOptionValue, getOptionLabel, getOptionDisabled)
- - Loading state disables the field (no UI messaging)
- - Unresolved values: UI displays no selected value, form value remains unchanged (no automatic reset)
- - Development-only warnings: If value cannot be resolved, a console warning is emitted (deduplicated)
- - Production mode: No warnings, silent operation

---

6. Validation Plan
   Step 6.1: Typecheck
   npx nx run @dashforge/ui:typecheck
   Expected: 0 errors
   Potential Issues:

- useDashFormContext import might need type imports
- DashFormBridge type might need explicit import

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
- May need to add console.warn spy to existing unresolved tests

---

Step 6.3: Run New Tests
npx nx run @dashforge/ui:test Select.runtime.test --testNamePattern="Unresolved Value Policy"
Expected: 8/8 new tests pass

- Empty UI selection ✅
- No automatic reset ✅
- Development warning ✅
- Production no warning ✅
- No warning during loading ✅
- No warning for null values ✅
- Warning deduplication ✅
- Resolved values work normally ✅

---

7. File Change Summary
   Files to Modify
   File
   libs/dashforge/ui/src/components/Select/Select.tsx
   libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
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
- New: Development-only console warnings for unresolved values
- Unchanged: UI displays empty selection for unresolved
- Unchanged: Form value remains unchanged (no reset)
- Unchanged: Runtime options loading and normalization
  Internal Changes
  New Internal Utilities:
  // Module-level deduplication tracking
  const warnedUnresolvedValues: WeakMap<DashFormBridge, Set<string>>
  // Warning utility
  function warnUnresolvedValue(
  bridge: DashFormBridge,
  fieldName: string,
  fieldValue: unknown,
  availableValues: (string | number)[]
  ): void
  New Dependencies:
- useDashFormContext from @dashforge/ui-core (already in package)
- DashFormBridge type from @dashforge/ui-core (already in package)

---

9. Risk Analysis
   Low Risk ✅
   Why Low Risk:
1. No behavior changes - only adds warnings
1. No API changes - fully backward compatible
1. Development-only - production unaffected
1. Additive only - no refactoring of existing logic
1. Well-tested - 8 new focused tests
1. Policy-compliant - strict adherence to reaction-v2.md
   Potential Issues & Mitigations
   Risk Likelihood
   Console spam from warnings Low
   Warning shows in production Low
   Bridge not available in some contexts Low
   Existing tests break due to warnings Medium
   TypeScript errors from bridge import Low
   Memory leaks from WeakMap Very Low

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

---

11. Success Criteria
    Definition of Done:
1. ✅ Unresolved value detection implemented
1. ✅ Development-only warnings emit correctly
1. ✅ Production mode remains silent (no warnings)
1. ✅ Warning deduplication works (no spam)
1. ✅ No warnings during loading state
1. ✅ Form values never reset automatically
1. ✅ UI displays empty selection for unresolved (unchanged)
1. ✅ All existing tests pass (34/34)
1. ✅ All new tests pass (8/8)
1. ✅ Typecheck passes (0 errors)
1. ✅ Policy compliance verified
1. ✅ Build report created
   Total Expected Test Count: 42 tests (34 existing + 8 new)

---

12. Implementation Sequence
    Recommended Order:
1. Read Phase (Plan - Current)
   - ✅ Read task requirements
   - ✅ Read policy document
   - ✅ Analyze current implementation
   - ✅ Design solution
   - ✅ Create plan
1. Implementation Phase (Execution)
   - [ ] Add module-level deduplication tracking to Select.tsx
   - [ ] Add warnUnresolvedValue utility function to Select.tsx
   - [ ] Add bridge context access to Select component
   - [ ] Add unresolved value detection logic to Select component
   - [ ] Update Select component JSDoc
   - [ ] Add new test suite to Select.runtime.test.tsx
   - [ ] Add console.warn spy to existing unresolved tests if needed
1. Validation Phase
   - [ ] Run typecheck
   - [ ] Run all Select tests
   - [ ] Run new unresolved policy tests specifically
   - [ ] Verify warning output format
   - [ ] Verify production mode (no warnings)
   - [ ] Verify deduplication works
1. Documentation Phase
   - [ ] Create build report: reaction-v2-step-05-build.md
   - [ ] Document file changes
   - [ ] Document API changes (none expected)
   - [ ] Document test results
   - [ ] Confirm policy compliance
   - [ ] Create migration notes (none needed)

---

13. Open Questions & Decisions
    Q1: Should warning include stack trace?
    Answer: No

- Stack trace adds noise
- Developer can find field by name
- Message format is clear enough
- If needed, developer can add breakpoint
  Q2: Should warning be rate-limited per time window?
  Answer: No
- WeakMap + Set deduplication is sufficient
- Once per field+value combination is appropriate
- No need for time-based throttling
- Simpler implementation
  Q3: Should we log available values in warning?
  Answer: Yes
- Helps developer debug
- Shows what options were loaded
- Minimal performance cost
- Valuable context
  Q4: Should warning differentiate between error/idle/loading states?
  Answer: No
- Only warn when runtime is ready
- Other states (loading/error/idle) are transient
- Warning only meaningful when options are loaded
- Prevents false positives
  Q5: Should deduplication be per-session or per-component-instance?
  Answer: Per-session (WeakMap with bridge as key)
- Bridge represents form instance
- Multiple Select components in same form share deduplication
- Prevents spam when multiple Selects have same issue
- More robust than per-component tracking
  Q6: Should we support opt-out via prop?
  Answer: No
- Development warnings are not user-facing
- Should not be configurable
- Policy compliance is not optional
- Developers can filter console in browser if needed

---

14. Alternative Approaches Considered
    Alternative 1: useEffect-based Warning
    Approach:
    useEffect(() => {
    if (isUnresolved) {
    console.warn(...);
    }
    }, [currentValue, normalizedOptions]);
    Rejected Because:

- Adds complexity (effect hook)
- Harder to deduplicate
- Unnecessary effect lifecycle
- Direct check in render is simpler

---

Alternative 2: Warning in TextField Instead of Select
Approach:

- Add unresolved detection to TextField component
- Handle all select-mode warnings there
  Rejected Because:
- TextField doesn't know about runtime options
- TextField is generic (not runtime-aware)
- Select is responsible for runtime integration
- Separation of concerns

---

Alternative 3: Centralized Warning Service
Approach:

- Create separate warning utility module
- Register warnings via service
  Rejected Because:
- Over-engineering for single use case
- Adds complexity
- Module-level WeakMap is sufficient
- Not needed for Step 05 scope

---

Alternative 4: Runtime Status Includes Unresolved State
Approach:

- Add unresolved: boolean to runtime state
- Component reads and displays state
  Rejected Because:
- Violates policy (runtime state separate from form values)
- Runtime layer doesn't know about form values
- Crosses architectural boundaries
- Form value is RHF responsibility

---

15. Testing Strategy
    Test Categories
1. Behavior Tests (2 tests):

- Empty UI selection for unresolved value
- No automatic form value reset

2. Warning Emission Tests (4 tests):

- Warning in development mode
- No warning in production mode
- No warning during loading
- No warning for null/undefined values

3. Warning Quality Tests (1 test):

- Warning deduplication

4. Regression Tests (1 test):

- Resolved values work normally (no regressions)
  Vitest Configuration
  Mock Process.env:
  // In test file
  const originalNodeEnv = process.env.NODE_ENV;
  beforeEach(() => {
  vi.clearAllMocks();
  });
  afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  });
  // In specific test
  process.env.NODE_ENV = 'production'; // or 'development'
  Spy Console.warn:
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  // ... test assertions
  consoleWarnSpy.mockRestore();

---

### 16. Expected Build Report Outline

**File:** `dashforge/.opencode/reports/reaction-v2-step-05-build.md`
**Sections:**

1. Status: ✅ COMPLETE
2. Summary
3. Key Features Implemented
4. Files Modified
5. Test Results (42/42 tests passing)
6. Typecheck Results (0 errors)
7. Policy Compliance Verification
8. Warning Output Examples
9. Coverage Report
10. Architecture Notes (warning deduplication pattern)
11. Breaking Changes (none)
12. API Surface Changes (none)
13. Migration Guide (none needed)
14. Performance Impact (negligible)
15. Lessons Learned
16. Sign-Off

---

17. Pre-Implementation Checklist
    Before starting implementation, confirm:

- ✅ Task requirements fully understood
- ✅ Policy requirements fully understood
- ✅ Current implementation analyzed
- ✅ Solution design complete
- ✅ Test strategy defined
- ✅ Risk analysis complete
- ✅ Success criteria defined
- ✅ File changes identified
- ✅ No scope creep (no reconciliation, no reset, no UI messaging)
- ✅ Plan reviewed and approved

---

Summary
This plan defines a surgical, policy-compliant implementation of unresolved value detection and development-only warnings for Select components using runtime-driven options.
Key Points:

1. Minimal Changes: Only adds warning logic, no behavior changes
2. Policy Compliant: Strict adherence to reaction-v2.md Section 3.2, 3.3, 3.4
3. Well-Tested: 8 new focused tests, all existing tests pass
4. Production-Safe: Warnings only in development, compile-time eliminated in production
5. No Scope Creep: No reconciliation, no reset, no UI messaging
6. Backward Compatible: No API changes, no breaking changes
7. Clean Architecture: WeakMap deduplication, proper separation of concerns
   Ready for Implementation: ✅

---

Plan Status: COMPLETE  
Next Step: User approval → Implementation  
Estimated Implementation Time: 2-3 hours  
Estimated Testing Time: 1 hour  
Total Estimated Time: 3-4 hours
