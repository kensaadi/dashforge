dashforge/.opencode/reports/reaction-v2-step-04-plan-v2.md
Application: dashforge  
Created: 2026-03-23  
Status: PLAN v2 - Ready for Review  
Policy: /dashforge/.opencode/policies/reaction-v2.md (mandatory compliance)  
Task: /dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md

---

Executive Summary
Objective:  
Integrate the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while preserving backward compatibility with static options.
Approach:  
Add an optional optionsFromFieldData prop to Select that switches between static mode (current behavior) and runtime mode (reads options from useFieldRuntime). This is a minimal, surgical change focused solely on runtime option consumption.
Scope Constraints (v2 Corrections Applied):

- ✅ Runtime option consumption only
- ✅ Static options path preserved
- ✅ No user-facing helper text ("Loading options...", "No options available")
- ✅ No finalized loading UX or empty-state UX
- ✅ No requirement for reactions to transform data shape
- ✅ Component layer interprets option shape
- ✅ No unresolved-value policy
- ✅ No new UI messaging
- ✅ No reconciliation
- ✅ No automatic reset
  Policy Compliance:
- ✅ No automatic reconciliation
- ✅ Runtime state separate from form values
- ✅ RHF remains source of truth for form values
- ✅ No UI visibility control in reactions
- ✅ Unresolved values: UI shows empty selection, form value remains unchanged, NO automatic reset
- ✅ Reactions provide raw runtime data; components interpret shape

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

Change 1: Update Select Component Directly (No Separate Runtime File)
File: libs/dashforge/ui/src/components/Select/Select.tsx
Decision: Integrate runtime logic directly in Select component (no separate .runtime.ts file)
Rationale:

- Runtime logic is simple (call useFieldRuntime, extract options)
- No justification for separate file at current complexity
- Avoids over-engineering
- Keeps all Select logic in one place
  Updated SelectProps:
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
  - Runtime data is consumed as-is from runtime state.
  - Component interprets option shape for rendering.
  -
  - Example:
  - ```tsx

    ```
  - <Select name="city" optionsFromFieldData />
  - ```
       */
      optionsFromFieldData?: boolean;
      visibleWhen?: (engine: Engine) => boolean;
      layout?: FieldLayout;
      minWidth?: number;
    }
    Component Logic (Integrated):
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
      // Validation: ensure exactly one source is provided
      if (!optionsFromFieldData && !staticOptions) {
        throw new Error(
          `Select component for field "${name}" requires either "options" prop or "optionsFromFieldData={true}"`
        );
      }
      if (optionsFromFieldData && staticOptions) {
        throw new Error(
          `Select component for field "${name}" cannot have both "options" prop and "optionsFromFieldData={true}". Use one or the other.`
        );
      }
      // Runtime mode: consume options from runtime state
      const runtime = useFieldRuntime<{ options: SelectOption<T>[] }>(name);
    ```
  // Resolve options from static or runtime source
  const resolvedOptions = optionsFromFieldData
  ? (runtime.data?.options ?? [])
  : (staticOptions ?? []);
  // Derive loading state (runtime mode only)
  const isLoading = optionsFromFieldData && runtime.status === 'loading';
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
  // Pass loading state (no user-facing text)
  disabled={rest.disabled || isLoading}
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
  {resolvedOptions.map((option) => (
  <MenuItem key={String(option.value)} value={option.value}>
  {option.label}
  </MenuItem>
  ))}
  </TextField>
  );
  }
  Key Changes:

1. Import useFieldRuntime from @dashforge/forms
2. Make options prop optional
3. Add optionsFromFieldData boolean prop
4. Add validation (static XOR runtime)
5. Call useFieldRuntime when in runtime mode
6. Resolve options from static or runtime source
7. Derive isLoading from runtime status
8. Pass disabled state (field disabled during loading, no helper text)
9. Use resolvedOptions in map
   Lines Added: ~30 lines

- Validation: ~10 lines
- Runtime hook call: ~2 lines
- Option resolution: ~3 lines
- Loading state: ~2 lines
- JSDoc comment: ~8 lines
- Type updates: ~3 lines
- Import: ~2 lines
  Total After: ~135 lines

---

Change 2: Runtime Data Shape Contract
File: libs/dashforge/ui/src/components/Select/Select.tsx
Add Type Definition:
/\*\*

- Runtime data shape for Select fields.
-
- Reactions/runtime producers provide raw data.
- Select component interprets option shape for rendering.
-
- The component expects options to have { value, label } shape.
- Reactions are NOT required to transform data - they provide raw options.
- The component layer is responsible for shape interpretation.
  \*/
  export interface SelectFieldRuntimeData<TOption = SelectOption<string | number>> {
  options: TOption[];
  }
  Responsibility Separation:

* Reactions/Runtime Producers: Provide raw runtime data (no transformation required)
* Select Component: Interprets option shape, renders MenuItems
* Contract: Runtime data contains options array; component expects { value, label } shape
  Lines Added: ~12 lines

---

Change 3: Export Runtime Types
File: libs/dashforge/ui/src/components/Select/index.ts
Update Exports:
export { Select } from './Select';
export type {
SelectProps,
SelectOption,
SelectFieldRuntimeData
} from './Select';
Lines Added: ~2 lines

---

Change 4: Loading and Empty State Behavior (No UI Messaging)
Loading State (status === 'loading'):

- Field is disabled (disabled={true})
- NO helper text displayed
- NO user-facing loading message
- Reason: UX not finalized; defer to future step
  Empty Options (options === []):
- Field remains enabled
- Select shows empty dropdown (MUI default)
- NO helper text displayed
- NO user-facing empty-state message
- Reason: UX not finalized; defer to future step
  Error State (status === 'error'):
- Field remains enabled
- Runtime error available via runtime.error (not displayed in this step)
- NO user-facing error message from runtime
- Reason: Error UX not finalized; defer to future step
  Unresolved Value (value not in options):
- MUI shows empty selection (no selected item rendered)
- Form value remains unchanged (no automatic reset)
- NO warning displayed
- NO reconciliation logic
- Policy Compliance: ✅ No automatic reconciliation

---

Testing Plan
Test File Structure
New Test File: libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Purpose: Focused tests for runtime integration (separate from existing unit tests)
Test Cases (~10 tests)

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
   });
2. Runtime Mode Tests (New Functionality)
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
   renderWithRuntime(
   <Select name="country" optionsFromFieldData />,
   { country: runtime }
   );
   // Verify options from runtime are rendered
   await waitFor(() => {
   expect(screen.getByText('United States')).toBeInTheDocument();
   expect(screen.getByText('Canada')).toBeInTheDocument();
   });
   });
   Test 2.2: Disables field during loading (no helper text)
   it('disables field when runtime status is loading', () => {
   const runtime = {
   status: 'loading',
   data: null,
   error: null,
   };
   renderWithRuntime(
   <Select name="country" optionsFromFieldData />,
   { country: runtime }
   );
   // Verify field is disabled during loading
   const select = screen.getByRole('combobox');
   expect(select).toBeDisabled();

// NO helper text displayed (UX not finalized)
expect(screen.queryByText('Loading options...')).not.toBeInTheDocument();
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
Test 2.4: Handles empty runtime options (no helper text)
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
// NO helper text displayed (UX not finalized)
expect(screen.queryByText('No options available')).not.toBeInTheDocument();
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
});
Test 2.6: Component interprets option shape
it('accepts runtime options with { value, label } shape', () => {
const runtime = {
status: 'ready',
data: {
options: [
{ value: 1, label: 'Option One' },
{ value: 2, label: 'Option Two' },
],
},
error: null,
};
renderWithRuntime(
<Select name="priority" optionsFromFieldData />,
{ priority: runtime }
);
// Component interprets shape and renders MenuItems
expect(screen.getByText('Option One')).toBeInTheDocument();
expect(screen.getByText('Option Two')).toBeInTheDocument();
}); 3. Policy Compliance Tests
Test 3.1: No automatic value reset (policy violation check)
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
const { updateRuntime, getFormValue } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: initialRuntime },
{ defaultValues: { country: 'us' } }
);
// Initial value is 'us'
expect(getFormValue('country')).toBe('us');
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
expect(getFormValue('country')).toBe('us');
});
// MUI Select will show empty selection (value not in options)
// But form value is preserved
});
Test 3.2: No reconciliation logic
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
const { getFormValue } = renderWithRuntime(
<Select name="country" optionsFromFieldData />,
{ country: runtime },
{ defaultValues: { country: 'us' } } // Value not in options
);
// No reconciliation - value stays as-is
expect(getFormValue('country')).toBe('us');
// Select shows empty (MUI behavior for unmatched value)
const select = screen.getByRole('combobox');
expect(select).toHaveTextContent('');
});
Test 3.3: Reactions provide raw data; component interprets shape
it('consumes raw runtime data without requiring transformation', () => {
// Reaction provides raw options array
const runtimeData = {
options: [
{ value: 'opt1', label: 'First' },
{ value: 'opt2', label: 'Second' },
],
};
const runtime = {
status: 'ready',
data: runtimeData, // Raw data from reaction
error: null,
};
renderWithRuntime(
<Select name="field" optionsFromFieldData />,
{ field: runtime }
);
// Component interprets shape and renders
expect(screen.getByText('First')).toBeInTheDocument();
expect(screen.getByText('Second')).toBeInTheDocument();
});
Test 3.4: Multiple Select fields with isolated runtime states
it('isolates runtime state per field', async () => {
const countryRuntime = {
status: 'ready',
data: { options: [{ value: 'us', label: 'US' }] },
error: null,
};
const cityRuntime = {
status: 'ready',
data: { options: [{ value: 'nyc', label: 'NYC' }] },
error: null,
};
renderWithRuntime(
<>
<Select name="country" optionsFromFieldData />
<Select name="city" optionsFromFieldData />
</>,
{
country: countryRuntime,
city: cityRuntime
}
);
// Each field has its own runtime state
expect(screen.getByText('US')).toBeInTheDocument();
expect(screen.getByText('NYC')).toBeInTheDocument();
});

---

Test Infrastructure
Test Utility: renderWithRuntime
Decision: Extend existing test utilities minimally (check test-utils/ first)
Option A (Preferred): Extend renderWithBridge.tsx with runtime support
Option B: Create minimal test harness similar to Step 03's TestFieldHarness
Functionality Required:
interface RuntimeMock {
[fieldName: string]: FieldRuntimeState<unknown>;
}
function renderWithRuntime(
component: React.ReactElement,
runtimeMock: RuntimeMock,
options?: { defaultValues?: Record<string, unknown> }
): {
// Standard render utilities
...RenderResult,

// Runtime helpers
updateRuntime: (fieldName: string, newState: FieldRuntimeState) => void,
getFormValue: (fieldName: string) => unknown,
}
Implementation Note: Check existing test-utils first. Build minimal extension if needed.

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
Full UI Test Suite
npx nx run @dashforge/ui:test
Expected: All tests passing, 0 skipped

---

File-by-File Summary
Files to Create
File
libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Total New: ~350 lines
Files to Modify
File
libs/dashforge/ui/src/components/Select/Select.tsx
libs/dashforge/ui/src/components/Select/index.ts
Total Modified: 2 files, ~44 lines added
Test Infrastructure (May Extend)
File
libs/dashforge/ui/src/test-utils/renderWithBridge.tsx
Note: Check existing test infrastructure first before creating new utilities.

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
export interface SelectFieldRuntimeData<TOption = SelectOption<string | number>> {
options: TOption[];
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
Evidence: When options change, field value is not modified. Test 3.1 verifies this.
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
Status: Compliant  
Evidence: Reactions provide raw runtime data. No transformation required.
✅ Component Interprets Shape
Status: Compliant  
Evidence: Select component interprets option shape. Reactions not required to transform data.
✅ Surgical Approach
Status: Compliant  
Evidence: Minimal changes. Only Select and related test files modified. No separate runtime file.
✅ No Unrelated Refactors
Status: Compliant  
Evidence: TextField unchanged except composition. No broad refactoring.
✅ No UI Messaging Added
Status: Compliant  
Evidence: No "Loading options..." or "No options available" helper text. UX deferred to future step.

---

Out of Scope (Confirmed)
Per task requirements and v2 corrections, the following are explicitly NOT included:

- ❌ User-facing helper text ("Loading options...", "No options available")
- ❌ Finalized loading UX (disabled field only, no messaging)
- ❌ Finalized empty-state UX (empty dropdown only, no messaging)
- ❌ Requirement for reactions to transform data shape
- ❌ Unresolved value warnings (deferred to future step)
- ❌ Reconciliation logic (forbidden by policy)
- ❌ Automatic value reset (forbidden by policy)
- ❌ visibleWhen changes (remains in UI layer)
- ❌ Translation/i18n (not system responsibility)
- ❌ Business validation (not component responsibility)
- ❌ Runtime error messaging beyond disabled state
- ❌ TextField refactors (avoided unless strictly required)

---

Risk Assessment
Low Risk

- ✅ Backward compatible (options prop still works)
- ✅ Explicit opt-in (optionsFromFieldData flag)
- ✅ Runtime infrastructure already proven (Step 01-03)
- ✅ No production code behavior changes for existing usage
- ✅ No user-facing UI messaging (UX not finalized)
- ✅ Simple integration (no separate runtime file)
  Test Infrastructure Risk
- ⚠️ May need to extend test-utils for runtime mocking
  - Mitigation: Check existing test infrastructure first. Build minimal extension if needed.

---

Implementation Sequence

1. Update Select Component (~45 min)
   - Import useFieldRuntime hook
   - Add optionsFromFieldData prop
   - Add validation logic (static XOR runtime)
   - Add option resolution logic
   - Add loading state (disabled field, no helper text)
   - Export SelectFieldRuntimeData type
2. Create Test Infrastructure (~30 min)
   - Check existing test-utils/renderWithBridge.tsx
   - Extend with runtime support or create minimal harness
   - Implement updateRuntime and getFormValue helpers
3. Write Runtime Tests (~90 min)
   - Static mode backward compatibility (3 tests)
   - Runtime mode functionality (6 tests)
   - Policy compliance tests (4 tests)
4. Run Validation (~15 min)
   - Typecheck
   - Existing Select tests
   - New runtime tests
   - Full UI test suite
5. Create Build Report (~30 min)
   - Document all changes
   - Show validation results
   - Confirm policy compliance
     Total Estimated Time: ~3.5 hours

---

Success Criteria

1. ✅ All existing Select tests pass (backward compatibility)
2. ✅ New runtime tests pass (~13 tests)
3. ✅ Typecheck passes with 0 errors
4. ✅ No reconciliation or value reset logic introduced
5. ✅ No user-facing UI messaging introduced
6. ✅ 100% policy compliance maintained
7. ✅ Static options continue working unchanged
8. ✅ Runtime options work with useFieldRuntime
9. ✅ Loading state handled (disabled field, no helper text)
10. ✅ Component interprets option shape; reactions provide raw data

---

Key Changes from v1
Corrections Applied:

1. Removed user-facing helper text:
   - No "Loading options..." during loading
   - No "No options available" when empty
   - Field disabled during loading, no messaging
2. Removed requirement for reactions to transform data:
   - Reactions provide raw runtime data
   - Select component interprets option shape
   - Clear responsibility separation
3. No separate runtime file:
   - Runtime logic integrated directly in Select.tsx
   - Simple enough to not justify separate file
   - Avoids over-engineering
4. Scope tightened to runtime consumption only:
   - No finalized loading UX
   - No finalized empty-state UX
   - No unresolved-value policy
   - No new UI messaging
5. Tests updated:
   - Verify NO helper text displayed
   - Verify component interprets shape (not reactions)
   - ~13 tests total (reduced from 11, added shape interpretation tests)

---

Next Steps After This Plan
If Plan Approved:

1. Execute implementation following this plan
2. Run validation
3. Create build report
   Future Steps (Out of Scope):

- Step 05: Finalize loading UX with user-facing messaging
- Step 06: Finalize empty-state UX
- Step 07: Unresolved value warnings (dev mode only, policy section 3.3)
- Step 08: Error state handling enhancements

---

Plan Status: ✅ READY FOR REVIEW (v2)
Awaiting user approval before proceeding to implementation.

---

END OF PLAN v2
