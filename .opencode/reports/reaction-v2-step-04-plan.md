Application: dashforge  
Created: 2026-03-23  
Status: PLAN - Ready for Review  
Policy: /dashforge/.opencode/policies/reaction-v2.md (mandatory compliance)  
Task: /dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md

---

Executive Summary
Objective:  
Integrate the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while preserving backward compatibility with static options.
Approach:  
Add an optional optionsFromFieldData prop to Select that switches between static mode (current behavior) and runtime mode (reads options from useFieldRuntime). This is a minimal, surgical change that preserves all existing usage.
Impact:

- ✅ Backward compatible (all existing Select usage continues working)
- ✅ Runtime-driven options support added
- ✅ No reconciliation or value reset logic
- ✅ No unresolved value UI policy (deferred to future step)
- ✅ Maintains policy compliance

---

Current State Analysis
Select Component Architecture
File: libs/dashforge/ui/src/components/Select/Select.tsx (105 lines)
Current Structure:
interface SelectOption<T> {
value: T;
label: string;
}
interface SelectProps<T> {
name: string;
rules?: unknown;
label?: string;
options: SelectOption<T>[]; // ← Always required, always static
visibleWhen?: (engine: Engine) => boolean;
layout?: FieldLayout;
// ... MUI TextField props
}
Current Behavior:

- Composed from TextField with select mode
- Takes options prop directly (always static)
- Renders MenuItem for each option
- No runtime integration
  Dependencies:
- TextField component (handles all form integration)
- @dashforge/ui-core (bridge contract only, no forms dependency)
  Runtime Infrastructure (Already Built)
  Available from Step 01:
- useFieldRuntime<TData>(name) hook - subscribes to runtime state
- FieldRuntimeState<TData> - status/error/data structure
- SelectFieldRuntimeData<TOption> - { options: TOption[] }
  Bridge APIs Available:
- bridge.getFieldRuntime<TData>(name) - read runtime state
- bridge.subscribeFieldRuntime(name, listener) - subscribe to changes
- Runtime store is atomic (Valtio-based, no React Context re-renders)

---

Implementation Plan
Strategy: Optional Runtime Mode
Add an optional optionsFromFieldData prop that switches Select between two modes:

1. Static Mode (default): Current behavior - options prop required, used directly
2. Runtime Mode: When optionsFromFieldData={true} - uses useFieldRuntime to get options
   Why This Approach:

- ✅ Backward compatible (no breaking changes)
- ✅ Explicit opt-in (clear intent)
- ✅ Minimal code changes
- ✅ Easy to test both modes

---

Change 1: Update Select Types
File: libs/dashforge/ui/src/components/Select/Select.tsx
Add SelectFieldRuntimeData Type:
/\*\*

- Runtime data shape for Select fields.
- Must match SelectFieldRuntimeData from @dashforge/forms.
  \*/
  export interface SelectFieldRuntimeData<TOption = unknown> {
  options: TOption[];
  }
  Update SelectProps:
  export interface SelectProps<T extends string | number = string | number>
  extends Omit<MuiTextFieldProps, ...> {
  name: string;
  rules?: unknown;
  label?: string;

// Option A: Static mode (existing behavior)
options?: SelectOption<T>[]; // ← Now optional

// Option B: Runtime mode (new behavior)
/\*\*

- If true, reads options from field runtime state via useFieldRuntime.
- When enabled, 'options' prop is ignored.
-
- Runtime data shape: { options: SelectOption[] }
-
- Example:
- ```tsx

  ```
- <Select name="city" optionsFromFieldData />
- ```
   */
  optionsFromFieldData?: boolean;
  ```

visibleWhen?: (engine: Engine) => boolean;
layout?: FieldLayout;
minWidth?: number;
}
Validation Logic:

- Either options XOR optionsFromFieldData must be provided
- Runtime error if both are missing
- Runtime error if both are provided

---

Change 2: Add Runtime Integration Hook
File: libs/dashforge/ui/src/components/Select/Select.runtime.ts (NEW)
Purpose: Encapsulate runtime option resolution logic
Implementation:
import { useFieldRuntime } from '@dashforge/forms';
import type { SelectFieldRuntimeData } from './Select';
import type { SelectOption } from './Select';
/\*\*

- Hook to resolve Select options from either static or runtime source.
-
- @param name - Field name
- @param staticOptions - Options from props
- @param useRuntime - Whether to use runtime options
- @returns Resolved options array
  \*/
  export function useSelectOptions<T extends string | number>(
  name: string,
  staticOptions: SelectOption<T>[] | undefined,
  useRuntime: boolean | undefined
  ): {
  options: SelectOption<T>[];
  isLoading: boolean;
  runtimeStatus: 'idle' | 'loading' | 'ready' | 'error';
  } {
  // Only call useFieldRuntime if runtime mode enabled
  // Hook is always called (not conditional) but only used when needed
  const runtime = useFieldRuntime<SelectFieldRuntimeData<SelectOption<T>>>(name);

// Validation: ensure exactly one source is provided
if (!useRuntime && !staticOptions) {
throw new Error(
`Select component for field "${name}" requires either "options" prop or "optionsFromFieldData={true}"`
);
}

if (useRuntime && staticOptions) {
throw new Error(
`Select component for field "${name}" cannot have both "options" prop and "optionsFromFieldData={true}". Use one or the other.`
);
}

// Static mode: use options from props
if (!useRuntime && staticOptions) {
return {
options: staticOptions,
isLoading: false,
runtimeStatus: 'idle',
};
}

// Runtime mode: use options from runtime state
if (useRuntime) {
const runtimeOptions = runtime.data?.options ?? [];

    return {
      options: runtimeOptions,
      isLoading: runtime.status === 'loading',
      runtimeStatus: runtime.status,
    };

}

// Should never reach here due to validation above
return {
options: [],
isLoading: false,
runtimeStatus: 'idle',
};
}
Why Separate File:

- Keeps Select.tsx focused on rendering
- Encapsulates runtime logic
- Easier to test in isolation
- Avoids circular dependency issues

---

Change 3: Update Select Component
File: libs/dashforge/ui/src/components/Select/Select.tsx
Import Runtime Hook:
import { useSelectOptions } from './Select.runtime';
Update Component Logic:
export function Select<T extends string | number = string | number>(
props: SelectProps<T>
) {
const {
name,
rules,
label,
options: staticOptions,
optionsFromFieldData,
visibleWhen,
layout,
fullWidth,
minWidth = 200,
sx,
...rest
} = props;
// Resolve options from static or runtime source
const { options, isLoading, runtimeStatus } = useSelectOptions(
name,
staticOptions,
optionsFromFieldData
);
// Compose Select from TextField with select mode enabled
// TextField handles all form integration, error binding, and gating
return (
<TextField
{...rest}
name={name}
rules={rules}
label={label}
visibleWhen={visibleWhen}
layout={layout}
fullWidth={fullWidth}
select
// Show loading state via disabled + helperText
// Only when runtime mode AND loading
disabled={rest.disabled || isLoading}
helperText={
isLoading
? 'Loading options...'
: rest.helperText
}
sx={{
        ...(!fullWidth && { minWidth: minWidth }),
        ...sx,
      }}
slotProps={{
        ...rest.slotProps,
        select: {
          native: false,
          ...(rest.slotProps?.select as Record<string, unknown> | undefined),
        },
      }} >
{options.map((option) => (
<MenuItem key={String(option.value)} value={option.value}>
{option.label}
</MenuItem>
))}
</TextField>
);
}
Loading State Behavior:

- When status === 'loading': disable field, show "Loading options..." helper text
- When status === 'ready': enable field, render options
- When status === 'error': enable field, show error (via TextField's existing error handling)
- When status === 'idle': no special handling (empty options = empty select)
  No Unresolved Value Handling Yet:
- Per task requirements, do NOT add warnings for unresolved values
- Do NOT add reconciliation logic
- Do NOT add automatic value reset
- Value resolution happens naturally via MUI Select behavior (shows empty if value not in options)

---

Change 4: Export Runtime Types
File: libs/dashforge/ui/src/components/Select/index.ts
Update Exports:
export { Select } from './Select';
export type { SelectProps, SelectOption, SelectFieldRuntimeData } from './Select';

---

Testing Plan
Test File Structure
New Test File: libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Purpose: Focused tests for runtime integration (separate from existing unit tests)
Test Cases

1. Static Mode Tests (Backward Compatibility)
   Test 1.1: Static options still work (no regression)
   it('renders static options when optionsFromFieldData is not set', () => {
   const options = [
   { value: 'us', label: 'United States' },
   { value: 'ca', label: 'Canada' },
   ];

render(<Select name="country" options={options} />);

// Verify options render correctly
// This is existing behavior - must not break
});
Test 1.2: Error if both options and optionsFromFieldData provided
it('throws error when both options and optionsFromFieldData are provided', () => {
const options = [{ value: 'us', label: 'US' }];

expect(() => {
render(
<Select 
        name="country" 
        options={options} 
        optionsFromFieldData 
      />
);
}).toThrow(/cannot have both/);
});
Test 1.3: Error if neither options nor optionsFromFieldData provided
it('throws error when neither options nor optionsFromFieldData are provided', () => {
expect(() => {
render(<Select name="country" />);
}).toThrow(/requires either/);
}); 2. Runtime Mode Tests (New Functionality)
Test 2.1: Reads options from runtime state
it('reads options from runtime state when optionsFromFieldData=true', async () => {
const runtime = {
status: 'ready',
data: {
options: [
{ value: 'us', label: 'United States' },
{ value: 'ca', label: 'Canada' },
],
},
error: null,
};

// Mock useFieldRuntime to return runtime data
const { result } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime }
);

// Verify options from runtime are rendered
await waitFor(() => {
expect(screen.getByText('United States')).toBeInTheDocument();
expect(screen.getByText('Canada')).toBeInTheDocument();
});
});
Test 2.2: Shows loading state during option fetch
it('shows loading state when runtime status is loading', () => {
const runtime = {
status: 'loading',
data: null,
error: null,
};

renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime }
);

// Verify loading indicator
expect(screen.getByText('Loading options...')).toBeInTheDocument();

// Verify field is disabled during loading
const select = screen.getByRole('combobox');
expect(select).toBeDisabled();
});
Test 2.3: Updates when runtime options change
it('updates options when runtime state changes', async () => {
const initialRuntime = {
status: 'ready',
data: { options: [{ value: 'us', label: 'US' }] },
error: null,
};

const { updateRuntime } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: initialRuntime }
);

// Initial option
expect(screen.getByText('US')).toBeInTheDocument();

// Update runtime options
updateRuntime('country', {
status: 'ready',
data: {
options: [
{ value: 'ca', label: 'Canada' },
{ value: 'mx', label: 'Mexico' },
],
},
error: null,
});

// Verify updated options
await waitFor(() => {
expect(screen.getByText('Canada')).toBeInTheDocument();
expect(screen.getByText('Mexico')).toBeInTheDocument();
expect(screen.queryByText('US')).not.toBeInTheDocument();
});
});
Test 2.4: Handles empty runtime options
it('renders empty select when runtime options array is empty', () => {
const runtime = {
status: 'ready',
data: { options: [] },
error: null,
};

renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime }
);

const select = screen.getByRole('combobox');
expect(select).toBeEnabled();

// No options rendered
// User can still interact but select is empty
});
Test 2.5: Handles idle runtime state (no data yet)
it('renders empty select when runtime status is idle', () => {
const runtime = {
status: 'idle',
data: null,
error: null,
};

renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime }
);

const select = screen.getByRole('combobox');
expect(select).toBeEnabled();
expect(select).toHaveTextContent('');
}); 3. Integration Tests (End-to-End)
Test 3.1: Complete flow with DashFormProvider + reactions
it('integrates with DashFormProvider and reactions', async () => {
const reactions: ReactionDefinition[] = [
{
id: 'fetch-cities',
watch: ['country'],
when: (ctx) => Boolean(ctx.getValue('country')),
run: async (ctx) => {
const country = ctx.getValue<string>('country');

        ctx.setRuntime('city', { status: 'loading', data: null });

        // Simulate async fetch
        await new Promise(resolve => setTimeout(resolve, 10));

        const cities = country === 'us'
          ? [
              { value: 'nyc', label: 'New York' },
              { value: 'la', label: 'Los Angeles' },
            ]
          : [
              { value: 'tor', label: 'Toronto' },
              { value: 'van', label: 'Vancouver' },
            ];

        ctx.setRuntime('city', {
          status: 'ready',
          data: { options: cities },
        });
      },
    },

];

render(
<DashFormProvider
defaultValues={{ country: '', city: '' }}
reactions={reactions} >
<Select
name="country"
options={[
{ value: 'us', label: 'United States' },
{ value: 'ca', label: 'Canada' },
]}
/>
<Select name="city" optionsFromFieldData />
</DashFormProvider>
);

// Initially, city select is empty (idle)
const citySelect = screen.getByLabelText('City');
expect(citySelect).toHaveTextContent('');

// Select country
const user = userEvent.setup();
const countrySelect = screen.getByLabelText('Country');
await user.click(countrySelect);
await user.click(screen.getByText('United States'));

// Verify loading state
await waitFor(() => {
expect(screen.getByText('Loading options...')).toBeInTheDocument();
});

// Verify options loaded
await waitFor(() => {
expect(screen.queryByText('Loading options...')).not.toBeInTheDocument();
});

// Open city select and verify options
await user.click(citySelect);
expect(screen.getByText('New York')).toBeInTheDocument();
expect(screen.getByText('Los Angeles')).toBeInTheDocument();
}); 4. Policy Compliance Tests
Test 4.1: No automatic value reset (policy violation check)
it('does NOT reset field value when options change', async () => {
const initialRuntime = {
status: 'ready',
data: {
options: [
{ value: 'us', label: 'United States' },
{ value: 'ca', label: 'Canada' },
],
},
error: null,
};

const { updateRuntime, bridge } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: initialRuntime },
{ defaultValues: { country: 'us' } }
);

// Initial value is 'us'
expect(bridge.getValue('country')).toBe('us');

// Change options to exclude 'us'
updateRuntime('country', {
status: 'ready',
data: {
options: [
{ value: 'mx', label: 'Mexico' },
{ value: 'br', label: 'Brazil' },
],
},
error: null,
});

// Value should remain 'us' (unresolved but NOT reset)
await waitFor(() => {
expect(bridge.getValue('country')).toBe('us');
});

// MUI Select will show empty selection (value not in options)
// But form value is preserved
});
Test 4.2: No reconciliation logic
it('does NOT attempt to reconcile unresolved values', () => {
const runtime = {
status: 'ready',
data: {
options: [
{ value: 'ca', label: 'Canada' },
{ value: 'mx', label: 'Mexico' },
],
},
error: null,
};

const { bridge } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime },
{ defaultValues: { country: 'us' } } // Value not in options
);

// No reconciliation - value stays as-is
expect(bridge.getValue('country')).toBe('us');

// Select shows empty (MUI behavior for unmatched value)
const select = screen.getByRole('combobox');
expect(select).toHaveTextContent('');
});

---

Test Infrastructure
Test Utility: renderWithRuntime
File: libs/dashforge/ui/src/test-utils/renderWithRuntime.tsx (NEW or UPDATE existing)
Purpose: Test utility to render components with mocked runtime state
Implementation:
import { render } from '@testing-library/react';
import { DashFormProvider } from '@dashforge/forms';
import type { FieldRuntimeState } from '@dashforge/forms';
interface RuntimeMockOptions {
defaultValues?: Record<string, unknown>;
reactions?: ReactionDefinition[];
}
interface RuntimeMock {
[fieldName: string]: FieldRuntimeState;
}
export function renderWithRuntime(
component: React.ReactElement,
runtimeMock: RuntimeMock,
options?: RuntimeMockOptions
) {
// Create a simple provider that mocks useFieldRuntime behavior
// Implementation depends on existing test infrastructure

// Return:
// - All standard render utilities
// - updateRuntime(fieldName, newState) function
// - bridge access for assertions
}
Note: This may require extending existing test infrastructure. Check current test-utils implementation.

---

Validation Strategy
Typecheck
npx nx run @dashforge/ui:typecheck
Expected: 0 errors
Unit Tests (Existing)
npx nx run @dashforge/ui:test Select.unit.test
npx nx run @dashforge/ui:test Select.characterization.test
Expected: All existing tests continue passing (backward compatibility)
Runtime Tests (New)
npx nx run @dashforge/ui:test Select.runtime.test
Expected: All new runtime integration tests passing
Integration Tests (If Needed)
npx nx run @dashforge/forms:test
Expected: No regressions in forms package
Full UI Test Suite
npx nx run @dashforge/ui:test
Expected: All tests passing

---

File-by-File Summary
Files to Create
File
libs/dashforge/ui/src/components/Select/Select.runtime.ts
libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
libs/dashforge/ui/src/test-utils/renderWithRuntime.tsx
Total New: ~580 lines
Files to Modify
File
libs/dashforge/ui/src/components/Select/Select.tsx
libs/dashforge/ui/src/components/Select/index.ts
Total Modified: 2 files, ~37 lines added

---

API Summary
New Public APIs
SelectProps (Modified):
interface SelectProps<T> {
// ... existing props ...

options?: SelectOption<T>[]; // ← Now optional (was required)

optionsFromFieldData?: boolean; // ← NEW: enables runtime mode
}
SelectFieldRuntimeData (New Export):
export interface SelectFieldRuntimeData<TOption = unknown> {
options: TOption[];
}
New Internal APIs
useSelectOptions Hook:
function useSelectOptions<T>(
name: string,
staticOptions: SelectOption<T>[] | undefined,
useRuntime: boolean | undefined
): {
options: SelectOption<T>[];
isLoading: boolean;
runtimeStatus: 'idle' | 'loading' | 'ready' | 'error';
}
No Changes to Existing APIs

- TextField props: unchanged
- Bridge APIs: unchanged
- Runtime store APIs: unchanged
- useFieldRuntime hook: unchanged

---

Policy Compliance Verification
✅ No Reconciliation Logic
Status: Compliant  
Evidence: No value reset or healing logic. Unresolved values remain as-is in form state.
✅ No Automatic Value Reset
Status: Compliant  
Evidence: When options change, field value is not modified. Test 4.1 verifies this.
✅ No UI Logic in Reactions
Status: Compliant (N/A)  
Evidence: This step does not modify reaction engine. Reactions remain mechanical.
✅ No visibleWhen Logic Moved
Status: Compliant  
Evidence: visibleWhen remains in component layer, handled by TextField.
✅ RHF Remains Source of Truth
Status: Compliant  
Evidence: Form values managed by RHF. Runtime only provides options, not values.
✅ Runtime State Separate from Form
Status: Compliant  
Evidence: Options stored in runtime layer, values in RHF. No mixing.
✅ Reactions Are Mechanical
Status: Compliant (N/A)  
Evidence: No changes to reaction definitions or execution.
✅ Surgical Approach
Status: Compliant  
Evidence: Minimal changes. Only Select and related test files modified.
✅ No Unrelated Refactors
Status: Compliant  
Evidence: TextField unchanged except composition. No broad refactoring.
✅ No Unresolved Value Warnings (Yet)
Status: Compliant  
Evidence: Dev warning logic explicitly deferred to future step per task requirements.

---

Out of Scope (Confirmed)
Per task requirements, the following are explicitly NOT included:

- ❌ Unresolved value warnings (deferred to future step)
- ❌ Reconciliation logic (forbidden by policy)
- ❌ Automatic value reset (forbidden by policy)
- ❌ visibleWhen changes (remains in UI layer)
- ❌ Translation/i18n (not system responsibility)
- ❌ Business validation (not component responsibility)
- ❌ Runtime error messaging beyond loading state
- ❌ Final UX policy for missing selected values
- ❌ TextField refactors (avoided unless strictly required)

---

Risk Assessment
Low Risk

- ✅ Backward compatible (options prop still works)
- ✅ Explicit opt-in (optionsFromFieldData flag)
- ✅ Runtime infrastructure already proven (Step 01-03)
- ✅ No production code behavior changes for existing usage
  Medium Risk
- ⚠️ Loading state UX (disabled field + helper text)
  - Mitigation: Simple, standard pattern. Tested explicitly.
- ⚠️ Unresolved value display (shows empty selection)
  - Mitigation: This is MUI's default behavior. No custom logic added. Final UX deferred to future step.
    Test Infrastructure Risk
- ⚠️ May need to extend test-utils for runtime mocking
  - Mitigation: Check existing test infrastructure first. Build minimal extension if needed.

---

Open Questions for User
Question 1: Loading State UX
When runtime options are loading, I propose:

- Disable the select field
- Show "Loading options..." as helper text
  Alternatives:
- A) Show loading spinner inside select (more complex)
- B) Show skeleton loader (requires additional UI component)
- C) Proposed approach (simple, standard)
  Recommendation: Option C (proposed)
  Do you approve this approach, or prefer a different loading indicator?

---

Question 2: Empty Options Behavior
When runtime options array is empty ([]), I propose:

- Keep select enabled
- Show no options (empty select)
- User can interact but nothing to select
  Alternatives:
- A) Disable select when options are empty
- B) Show "(No options available)" as helper text
- C) Proposed approach (neutral, no assumptions)
  Recommendation: Option C (proposed)
  Do you approve, or prefer explicit empty-state handling?

---

Question 3: Test Infrastructure
The plan assumes we can extend test-utils with a renderWithRuntime helper that mocks the runtime store.
If existing test-utils don't support this easily:

- Should I create a minimal test harness similar to Step 03's TestFieldHarness?
- Or should I use real DashFormProvider + reactions for all tests?
  Recommendation: Check existing test-utils first, extend minimally if possible.

---

Question 4: Generic Option Types
Currently, Select uses a simple SelectOption<T> type:
interface SelectOption<T> {
value: T;
label: string;
}
For runtime mode, reactions will provide options in this shape. This means:

- Reactions are responsible for transforming API responses into { value, label } objects
- Select component remains simple
  Is this acceptable, or should Select support generic option shapes with mapping functions (getOptionLabel, getOptionValue)?
  Recommendation: Keep it simple for Step 04. Generic mapping can be added later if needed.

---

Implementation Sequence

1. Create Runtime Hook (~30 min)
   - Write Select.runtime.ts
   - Implement useSelectOptions hook
   - Add validation logic
2. Update Select Component (~20 min)
   - Import runtime hook
   - Add optionsFromFieldData prop
   - Add runtime type export
   - Update rendering logic
3. Create Test Infrastructure (~45 min)
   - Extend test-utils or create runtime harness
   - Implement renderWithRuntime helper
   - Verify mocking works
4. Write Runtime Tests (~90 min)
   - Static mode backward compatibility (3 tests)
   - Runtime mode functionality (5 tests)
   - Integration test (1 test)
   - Policy compliance tests (2 tests)
5. Run Validation (~15 min)
   - Typecheck
   - Existing Select tests
   - New runtime tests
   - Full UI test suite
6. Create Build Report (~30 min)
   - Document all changes
   - Show validation results
   - Confirm policy compliance
     Total Estimated Time: ~3.5 hours

---

Success Criteria

1. ✅ All existing Select tests pass (backward compatibility)
2. ✅ New runtime tests pass (11+ tests)
3. ✅ Typecheck passes with 0 errors
4. ✅ Integration test proves end-to-end flow works
5. ✅ No reconciliation or value reset logic introduced
6. ✅ No unresolved value warnings added
7. ✅ 100% policy compliance maintained
8. ✅ Static options continue working unchanged
9. ✅ Runtime options work with useFieldRuntime
10. ✅ Loading state handled gracefully

---

Next Steps After This Plan
If Plan Approved:

1. Answer open questions (if any)
2. Execute implementation following this plan
3. Run validation
4. Create build report
   Future Steps (Out of Scope):

- Step 05: Unresolved value warnings (dev mode only, policy section 3.3)
- Step 06: Error state handling enhancements
- Step 07: Generic option mapping (if needed)

---

Questions for User

1. Do you approve the loading state UX (disabled field + "Loading options..." text)?
2. Do you approve empty options behavior (enabled but empty select)?
3. Should I extend test-utils or create minimal test harness for runtime mocking?
4. Do you approve keeping SelectOption shape simple ({ value, label }), requiring reactions to format data?
5. Any other concerns or requirements before implementation?

---

Plan Status: ✅ READY FOR REVIEW
Awaiting user feedback on open questions before proceeding to implementation.

---

END OF PLAN
▣ Plan · claude-sonnet-4.5 · 3m 6s

---

Goal
Implement Reactive V2 Step 04: Select Runtime Integration for the Dashforge project, which integrates the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while maintaining backward compatibility with static options.
Instructions
Primary Task

- Read and follow the task document: dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md
- Comply strictly with mandatory policy: dashforge/.opencode/policies/reaction-v2.md
- Create an implementation plan only - DO NOT write code yet
- Output the plan as: dashforge/.opencode/reports/reaction-v2-step-04-plan.md
  Key Requirements from Task

1. Integrate existing Select component with useFieldRuntime hook
2. Support runtime-driven options for Select fields via new optionsFromFieldData prop
3. Keep support for existing static options (backward compatibility)
4. Preserve current Select/TextField architecture
5. Add focused tests for runtime option consumption
6. Do NOT implement: unresolved value warnings, reconciliation logic, automatic value reset, visibleWhen changes, translation/i18n, or final UX policies for missing selected values
   Critical Policy Constraints
   From reaction-v2.md:

- ✅ Reactions are mechanical (NOT semantic) - no business logic
- ✅ RHF remains source of truth for form values
- ✅ Runtime state separate from form values
- ✅ Runtime state must be atomic (Valtio-based, no React Context)
- ✅ NO automatic reconciliation - never reset field values
- ✅ NO UI responsibility - no visibility control in reactions
- ✅ Unresolved values: UI displays no selected value, form value remains unchanged, NO automatic reset
  Context from Previous Steps
- Step 01: Built runtime store foundation (atomic Valtio-based store)
- Step 02: Built reaction engine foundation (47 unit tests passing)
- Step 03: Closed field-change wiring gap (all 5 skipped integration tests now passing, proved real end-to-end flow using TestFieldHarness)
  Discoveries
  Select Component Current Architecture
  File: libs/dashforge/ui/src/components/Select/Select.tsx (105 lines)
  Current Structure:
- Simple component composed from TextField with select mode
- Takes options: SelectOption<T>[] prop directly (always required, always static)
- SelectOption<T> = { value: T, label: string }
- No runtime integration currently
- Renders MenuItem for each option
- All form integration handled by TextField component
  Dependencies:
- TextField component (handles form integration, error binding, validation gating)
- @dashforge/ui-core only (bridge contract, no forms dependency)
- No direct dependency on react-hook-form or @dashforge/forms
  Runtime Infrastructure Available (From Step 01)
  Hook: useFieldRuntime<TData>(name) - subscribes to runtime state for a field
  interface FieldRuntimeState<TData> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  data: TData | null;
  }
  interface SelectFieldRuntimeData<TOption> {
  options: TOption[];
  }
  Bridge APIs Available:
- bridge.getFieldRuntime<TData>(name) - read runtime state
- bridge.subscribeFieldRuntime(name, listener) - subscribe to changes
- Runtime store is atomic (Valtio-based), isolated per-field subscriptions
  TextField Architecture
  File: libs/dashforge/ui/src/components/TextField/TextField.tsx (263 lines)
- Handles all form integration via DashFormBridge
- Supports layout modes (floating/stacked/inline)
- Auto-binds validation errors and helper text
- Error display gating (shows errors only after touch or submit)
- Select mode uses createSelectIntegration helper for controlled value
- Integrates with Engine for visibility (visibleWhen prop)
  Test Infrastructure Available
- renderWithBridge utility exists for testing with form bridge
- Existing Select tests: unit tests, characterization tests
- TestFieldHarness pattern from Step 03 (proves real registration + onChange flow)
  Accomplished
  Completed Analysis ✅

1. ✅ Read and understood Step 04 task requirements
2. ✅ Read and internalized mandatory policy (reaction-v2.md)
3. ✅ Analyzed current Select component implementation (105 lines)
4. ✅ Analyzed current TextField component architecture (263 lines)
5. ✅ Reviewed useFieldRuntime hook from Step 01
6. ✅ Reviewed FieldRuntimeState and SelectFieldRuntimeData types
7. ✅ Examined bridge APIs available from ui-core
8. ✅ Reviewed existing Select test structure
9. ✅ Understood TextField's role in form integration
   Implementation Plan Created ✅
   Plan document created but not yet written to file (environment is read-only for reports folder).
   Plan output location: dashforge/.opencode/reports/reaction-v2-step-04-plan.md
   Plan Summary:
   The plan proposes adding an optional optionsFromFieldData boolean prop to Select that switches between:

- Static mode (default): Current behavior - options prop required, used directly
- Runtime mode: Uses useFieldRuntime to read options from runtime state
  Key Design Decisions:

1. Backward Compatible: options prop becomes optional, existing usage continues working
2. Explicit Opt-In: optionsFromFieldData={true} clearly signals runtime mode
3. New Hook: useSelectOptions() encapsulates option resolution logic (static vs runtime)
4. Loading State: Disabled field + "Loading options..." helper text when status === 'loading'
5. No Reconciliation: Unresolved values show empty selection (MUI default), form value preserved
6. Test Strategy: Separate test file (Select.runtime.test.tsx) with ~11 focused tests
   Files to Create (~580 lines):

- libs/dashforge/ui/src/components/Select/Select.runtime.ts (~80 lines) - useSelectOptions hook
- libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx (~400 lines) - runtime tests
- libs/dashforge/ui/src/test-utils/renderWithRuntime.tsx (~100 lines) - test utility
  Files to Modify (~37 lines added):
- libs/dashforge/ui/src/components/Select/Select.tsx - add runtime integration (~35 lines)
- libs/dashforge/ui/src/components/Select/index.ts - export runtime types (~2 lines)
  In Progress
- 🔄 Awaiting user approval of implementation plan
  Open Questions in Plan

1. Loading State UX: Approve disabled field + "Loading options..." text?
2. Empty Options Behavior: Approve enabled but empty select?
3. Test Infrastructure: Extend test-utils or create minimal test harness?
4. SelectOption Shape: Approve keeping simple { value, label } format (reactions format data)?
   Work Remaining
5. User Review: Answer open questions, approve or request changes to plan
6. Implementation: Execute approved plan (create hooks, modify Select, write tests)
7. Validation: Run typecheck + all tests
8. Build Report: Document implementation results
   Relevant Files / Directories
   Task & Policy Documents (Read-Only Reference)

- dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md - Current task spec (MUST FOLLOW)
- dashforge/.opencode/policies/reaction-v2.md - Mandatory policy (MUST COMPLY)
- dashforge/.opencode/reports/reaction-v2-step-03-build.md - Step 03 completion report (proved end-to-end flow)
  Select Component (Current Implementation - Analyze)
- libs/dashforge/ui/src/components/Select/Select.tsx - Current Select component (105 lines)
- libs/dashforge/ui/src/components/Select/index.ts - Export file (~5 lines)
- libs/dashforge/ui/src/components/Select/Select.unit.test.tsx - Existing unit tests
- libs/dashforge/ui/src/components/Select/Select.characterization.test.tsx - Existing characterization tests
- libs/dashforge/ui/src/components/Select/Select.test.tsx - Existing general tests
  TextField Component (Supporting Architecture - Analyze)
- libs/dashforge/ui/src/components/TextField/TextField.tsx - TextField implementation (263 lines)
- libs/dashforge/ui/src/components/TextField/textField.types.ts - TextField type definitions
- libs/dashforge/ui/src/components/TextField/textField.validation.ts - Validation resolution
- libs/dashforge/ui/src/components/TextField/textField.select.ts - Select integration helper
  Runtime Infrastructure (Step 01 - Working, Don't Modify)
- libs/dashforge/forms/src/runtime/runtime.types.ts - Runtime state type definitions
- libs/dashforge/forms/src/runtime/createRuntimeStore.ts - Atomic runtime store implementation
- libs/dashforge/forms/src/hooks/useFieldRuntime.ts - Key hook for Select integration (84 lines)
  Bridge Contract (ui-core - Analyze)
- libs/dashforge/ui-core/src/bridge/DashFormBridge.ts - Bridge interface definition (233 lines)
- libs/dashforge/ui-core/src/bridge/index.ts - Bridge exports
  Test Utilities (Analyze/Extend)
- libs/dashforge/ui/src/test-utils/ - Existing test utilities directory
- libs/dashforge/ui/src/test-utils/renderWithBridge.tsx - Bridge testing utility (may need extension)
  Files to Create (Implementation Phase)
- libs/dashforge/ui/src/components/Select/Select.runtime.ts - Runtime hook (NEW)
- libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx - Runtime tests (NEW)
- libs/dashforge/ui/src/test-utils/renderWithRuntime.tsx - Test utility (NEW or extend existing)
  Files to Modify (Implementation Phase)
- libs/dashforge/ui/src/components/Select/Select.tsx - Add runtime integration
- libs/dashforge/ui/src/components/Select/index.ts - Add runtime type exports
  Output Target (Cannot Write - Read-Only)
- dashforge/.opencode/reports/reaction-v2-step-04-plan.md - Implementation plan (created in conversation, needs to be saved manually or output to chat)

---

Context for Next Agent
The implementation plan for Step 04 has been fully analyzed and designed. The plan proposes a minimal, backward-compatible approach:
Approach: Add optional optionsFromFieldData prop to Select that switches between static mode (current behavior) and runtime mode (uses useFieldRuntime to get options from runtime state).
Key Design Points:

- Backward compatible - all existing Select usage continues working
- Explicit opt-in via optionsFromFieldData={true} flag
- Validation enforces exactly one option source (static XOR runtime)
- Loading state shows disabled field + "Loading options..." text
- No reconciliation - unresolved values show empty selection, form value preserved
- Comprehensive test coverage (~11 tests) including policy compliance verification
  The plan document was created in the conversation but could not be written to file due to read-only environment restrictions on the reports folder.
  Next Steps:

1. User should review the plan (available in conversation history)
2. User should answer the 4 open questions about UX decisions
3. Once approved, implement according to the plan
4. Run validation (typecheck + tests)
5. Create build report
   The plan is complete, detailed, and ready for implementation once approved.
   ▣ Compaction · claude-sonnet-4.5 · 1m 1s
   I need to stop and ask for clarification because the implementation plan document was created but not yet written to file or fully presented to you.
   Let me output the complete implementation plan so you can review it:

---

Reaction V2 Step 04: Select Runtime Integration - Implementation Plan
Executive Summary
This plan integrates the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while maintaining full backward compatibility with static options.
Approach: Add an optional optionsFromFieldData boolean prop that switches Select between static mode (current behavior) and runtime mode (uses useFieldRuntime to consume options from runtime state).
Policy Compliance:

- ✅ No automatic reconciliation
- ✅ Runtime state separate from form values
- ✅ RHF remains source of truth for form values
- ✅ No UI visibility control in reactions
- ✅ Unresolved values: UI shows empty selection, form value preserved

---

Design Decisions

1. Backward Compatibility Strategy
   Decision: Make options prop optional, add new optionsFromFieldData boolean prop

- Static mode (default): options required, used directly (current behavior)
- Runtime mode: optionsFromFieldData={true}, options read from runtime state
- Validation: Exactly one option source required (static XOR runtime)
  Why: Existing Select usage continues working unchanged. Clear, explicit opt-in for runtime mode.

2. Option Resolution Hook
   Decision: Create useSelectOptions<T>() custom hook

- Encapsulates option resolution logic (static vs runtime)
- Returns: { options, loading, error }
- Handles runtime subscription via useFieldRuntime
  Why: Separates concerns, keeps Select component clean, testable in isolation.

3. Loading State UX
   Decision: When status === 'loading':

- Disable the select field (disabled={true})
- Show "Loading options..." as helper text
- No selected value displayed
  Question for User: Approve this UX? Alternative: show spinner inside select?

4. Empty Options Behavior
   Decision: When options array is empty:

- Field remains enabled
- Select shows empty dropdown (MUI default)
- No special UI treatment
  Question for User: Approve? Alternative: show "No options available" helper text?

5. Unresolved Value Handling
   Decision (Per Policy): When selected value not in options:

- MUI shows empty selection (no selected item rendered)
- Form value remains unchanged (no automatic reset)
- No warning displayed (policy: unresolved value warnings deferred)
  Policy Compliance: ✅ No automatic reconciliation

6. Error State Handling
   Decision: When status === 'error':

- Show error text via TextField's existing error display
- Field remains enabled (user can still interact)
- Options array empty (cannot select anything)
  Why: Leverages TextField's existing error infrastructure, consistent with current error handling.

7. Test Strategy
   Decision: Create separate Select.runtime.test.tsx file (~11 focused tests)

- Test utility: Extend or create renderWithRuntime() helper
- Mock runtime state via bridge.setFieldRuntimeState
- Test both static and runtime modes
- Verify policy compliance (no reconciliation, no automatic resets)
  Question for User: Extend existing test-utils/renderWithBridge.tsx or create minimal test harness?

---

Implementation Breakdown
Files to Create (~580 lines total)

1. libs/dashforge/ui/src/components/Select/Select.runtime.ts (~80 lines)
   Purpose: Runtime option resolution hook
   interface UseSelectOptionsParams<T> {
   name: string;
   options?: SelectOption<T>[];
   optionsFromFieldData?: boolean;
   }
   interface UseSelectOptionsResult<T> {
   options: SelectOption<T>[];
   loading: boolean;
   error: string | null;
   }
   export function useSelectOptions<T>(params: UseSelectOptionsParams<T>): UseSelectOptionsResult<T>
   Logic:

- Validate exactly one option source (static XOR runtime)
- If static mode: return { options, loading: false, error: null }
- If runtime mode:
  - Call useFieldRuntime<SelectFieldRuntimeData<T>>(name)
  - Extract options from runtimeState.data?.options ?? []
  - Return { options, loading: status === 'loading', error }
    Lines Breakdown:
- Type definitions: ~20 lines
- Validation logic: ~15 lines
- Static mode: ~5 lines
- Runtime mode: ~25 lines
- Exports: ~5 lines
- Comments/docs: ~10 lines

---

2. libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx (~400 lines)
   Purpose: Runtime integration tests
   Test Cases (~11 tests):
1. Static mode (backward compatibility)
   - Renders with static options prop (current behavior)
   - Validation fails if both static and runtime props provided
1. Runtime mode - basic
   - Renders in runtime mode with optionsFromFieldData={true}
   - Validation fails if no option source provided
1. Runtime mode - loading state
   - Shows disabled field when status === 'loading'
   - Shows "Loading options..." helper text
1. Runtime mode - ready state
   - Renders options from runtime state when status === 'ready'
   - Options update reactively when runtime state changes
1. Runtime mode - error state
   - Shows error text when status === 'error'
   - Field remains enabled with empty options
1. Runtime mode - unresolved value (policy compliance)
   - Form value preserved when not in options array
   - MUI shows empty selection (no selected item)
   - NO automatic value reset
1. Runtime mode - empty options
   - Field enabled with empty dropdown
   - No error shown
1. Runtime mode - option shape
   - Accepts options with { value, label } shape
   - Renders MenuItems correctly
1. Runtime mode - value selection
   - User can select from runtime options
   - onChange propagates to form
1. Runtime mode - isolation
   - Multiple Select fields with different runtime states
   - No cross-contamination
1. Runtime mode - subscription cleanup - Unsubscribes on unmount
   Lines Breakdown:

- Imports/setup: ~30 lines
- Test utilities/helpers: ~50 lines
- Test cases (11 × ~25 lines each): ~275 lines
- Mock data/fixtures: ~45 lines

---

3. libs/dashforge/ui/src/test-utils/renderWithRuntime.tsx (~100 lines)
   Purpose: Test utility for rendering components with runtime state
   Question for User: Should this extend existing renderWithBridge.tsx or be a separate minimal harness?
   Functionality:

- Create mock bridge with runtime support
- Helper to set runtime state: setFieldRuntime(name, state)
- Render component within DashFormProvider
- Return render result + runtime helpers
  Lines Breakdown:
- Imports: ~10 lines
- Mock bridge creation: ~30 lines
- Runtime state helpers: ~20 lines
- Render function: ~25 lines
- Exports/types: ~15 lines

---

Files to Modify (~37 lines added)

1. libs/dashforge/ui/src/components/Select/Select.tsx (~35 lines added)
   Current: 105 lines  
   After: ~140 lines
   Changes:
1. Import useSelectOptions hook (~1 line)
1. Add optionsFromFieldData?: boolean to SelectProps (~1 line)
1. Replace direct options usage with hook:
   const { options: resolvedOptions, loading, error } = useSelectOptions({
   name,
   options,
   optionsFromFieldData
   });
   (~5 lines)
1. Pass loading state to TextField:
   - disabled={disabled || loading} (~1 line)
   - helperText={loading ? 'Loading options...' : helperText} (~1 line)
1. Pass error state to TextField (if not already handled) (~3 lines)
1. Use resolvedOptions instead of options in map (~1 line)
1. Add JSDoc comments for new prop (~5 lines)
1. Type updates (~3 lines)
1. Validation error handling (~15 lines - throw if validation fails)
   Placement: Changes integrate cleanly before the TextField render, minimal disruption.

---

2. libs/dashforge/ui/src/components/Select/index.ts (~2 lines added)
   Current: ~5 lines  
   After: ~7 lines
   Changes:

- Export UseSelectOptionsResult type
- Export SelectFieldRuntimeData type (re-export from forms)

---

Test Execution Plan

1. Unit Tests
   npx nx run @dashforge/ui:test --testFile=Select.runtime.test.tsx
   Expected: All 11 new tests pass
2. Existing Tests
   npx nx run @dashforge/ui:test --testFile=Select
   Expected: All existing Select tests pass (no regression)
3. Type Check
   npx nx run @dashforge/ui:typecheck
   Expected: 0 errors
4. Full UI Test Suite
   npx nx run @dashforge/ui:test
   Expected: All tests pass, 0 skipped

---

Policy Compliance Verification
✅ No Automatic Reconciliation

- Test verifies: when selected value not in options, form value preserved
- Code never calls setValue() or resetField()
  ✅ Runtime State Separate from Form Values
- Options stored in runtime state, not form values
- Selection stored in form values, not runtime state
  ✅ RHF Source of Truth for Form Values
- All value changes go through RHF registration (onChange)
- No direct state mutations
  ✅ No UI Visibility Control
- Select does not implement visibility logic
- (TextField handles visibleWhen via Engine)
  ✅ Atomic Runtime State
- Uses useFieldRuntime hook (Valtio-based, per-field subscriptions)
- No React Context dependencies

---

Open Questions (Need User Approval)

1. Loading State UX
   Proposed: Disabled field + "Loading options..." helper text  
   Alternative: Show spinner icon inside select dropdown  
   Decision: ?
2. Empty Options Behavior
   Proposed: Enabled field with empty dropdown, no special message  
   Alternative: Show "No options available" helper text  
   Decision: ?
3. Test Infrastructure
   Proposed: Extend test-utils/renderWithBridge.tsx with runtime support  
   Alternative: Create separate minimal test harness  
   Decision: ?
4. SelectOption Shape
   Proposed: Keep simple { value: T, label: string } format  
   Note: Reactions must format data to match this shape  
   Decision: Approve?

---

Risk Assessment
Low Risk

- ✅ Backward compatible (all existing usage works)
- ✅ Explicit opt-in (no surprise behavior changes)
- ✅ Isolated changes (only Select + tests)
- ✅ Policy compliant (no reconciliation, no automatic resets)
  Medium Risk
- ⚠️ UX for unresolved values (empty selection may confuse users)
  - Mitigation: Documented behavior, deferred to later step per policy
- ⚠️ Loading state UX (needs user approval)
  - Mitigation: Clear question asked above
    Negligible Risk
- Runtime infrastructure proven in Step 03 (47 unit tests + 5 integration tests passing)
- TextField integration well-tested

---

Success Criteria

1. ✅ All 11 new runtime tests pass
2. ✅ All existing Select tests pass (no regression)
3. ✅ npx nx run @dashforge/ui:typecheck → 0 errors
4. ✅ npx nx run @dashforge/ui:test → all pass, 0 skipped
5. ✅ Policy compliance verified via tests
6. ✅ Backward compatibility verified via existing tests
7. ✅ Build report documents results

---

Next Steps After Approval

1. Answer open questions (4 decisions needed)
2. Create implementation: 3 new files, 2 modified files (~617 lines total)
3. Run validation: typecheck + all tests
4. Create build report: reaction-v2-step-04-build.md

---

## Ready for user review and approval.

Questions for You
Before I proceed to implementation, I need your decisions on these 4 open questions:

1. Loading State UX: When options are loading, should I show:
   - Option A: Disabled field + "Loading options..." helper text (proposed)
   - Option B: Show spinner icon inside select dropdown
   - Your choice: ?
2. Empty Options Behavior: When options array is empty, should I:
   - Option A: Show enabled field with empty dropdown, no special message (proposed)
   - Option B: Show "No options available" helper text
   - Your choice: ?
3. Test Infrastructure: Should I:
   - Option A: Extend existing test-utils/renderWithBridge.tsx with runtime support
   - Option B: Create separate minimal test harness for runtime tests
   - Your choice: ?
4. SelectOption Shape: Approve keeping simple { value: T, label: string } format?
   - This means reactions must format their data to match this shape
   - Your approval: Yes/No?
     Once you answer these questions, I'll proceed with implementation following the plan above. Does this plan look good to you overall?
