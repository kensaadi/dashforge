Application: dashforge  
Created: 2026-03-23  
Status: PLAN v3 - Ready for Review  
Policy: /dashforge/.opencode/policies/reaction-v2.md (mandatory compliance)  
Task: /dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md

---

Executive Summary
Objective:  
Integrate the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while preserving backward compatibility with static options.
Approach:  
Add an optional optionsFromFieldData prop to Select that switches between static mode (current behavior) and runtime mode (reads options from useFieldRuntime). Support generic runtime option shapes via optional mapping functions (getOptionLabel, getOptionValue, getOptionDisabled), while preserving the simple static { value, label } case as the default DX.
Scope Constraints (v3 Corrections Applied):

- ✅ Runtime option consumption only
- ✅ Static options path preserved (simple { value, label } default)
- ✅ Runtime options path supports generic shapes via mapper functions
- ✅ Minimal, optional mapping support (not aggressive configuration)
- ✅ No strict XOR validation as centerpiece
- ✅ Component layer interprets option shape via mappers
- ✅ Reactions provide raw runtime data (any shape)
- ✅ No user-facing helper text
- ✅ No finalized loading UX or empty-state UX
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
- Renders MenuItem for each option using option.value and option.label
- No runtime integration
  Dependencies:
- TextField component (handles all form integration)
- @dashforge/ui-core (bridge contract only, no forms dependency)
  Existing Pattern: Autocomplete Component
  File: libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx
  Proven Pattern:
- Uses getOptionLabel() to extract display text from options
- Uses getOptionDisabled() to determine if option is disabled
- Supports generic option shapes while maintaining simple default case
  This pattern is already established in the codebase and proven.
  Runtime Infrastructure (Already Built)
  Available from Step 01:
- useFieldRuntime<TData>(name) hook - subscribes to runtime state
- FieldRuntimeState<TData> - status/error/data structure
- Generic runtime data support (no shape constraints)
  Bridge APIs Available:
- bridge.getFieldRuntime<TData>(name) - read runtime state
- bridge.subscribeFieldRuntime(name, listener) - subscribe to changes
- Runtime store is atomic (Valtio-based, no React Context re-renders)

---

Implementation Plan
Strategy: Optional Runtime Mode with Generic Option Support
Add an optional optionsFromFieldData prop that switches Select between two modes:

1. Static Mode (default): Current behavior - options prop provided, used directly with simple { value, label } shape
2. Runtime Mode: When optionsFromFieldData={true} - uses useFieldRuntime to get options, supports generic shapes via optional mapper functions
   Why This Approach:

- ✅ Backward compatible (no breaking changes)
- ✅ Explicit opt-in (clear intent)
- ✅ Minimal code changes
- ✅ Easy to test both modes
- ✅ Simple case remains simple (default { value, label })
- ✅ Generic shapes supported when needed (via mappers)
- ✅ Follows established Autocomplete pattern

---

Change 1: Update Select Component with Generic Option Support
File: libs/dashforge/ui/src/components/Select/Select.tsx
Decision: Integrate runtime logic directly in Select component (no separate .runtime.ts file)
Rationale:

- Runtime logic is simple (call useFieldRuntime, extract options, apply mappers)
- Mapper functions follow existing Autocomplete pattern
- No justification for separate file at current complexity
- Avoids over-engineering
- Keeps all Select logic in one place
  Updated SelectProps:
  export interface SelectProps<T extends string | number = string | number>
  extends Omit<MuiTextFieldProps, ...> {
  name: string;
  rules?: unknown;
  label?: string;
  // Static mode (existing behavior - simple default)
  options?: SelectOption<T>[]; // ← Now optional
  // Runtime mode (new behavior - generic support)
  /\*\*
  - If true, reads options from field runtime state via useFieldRuntime.
  - When enabled, 'options' prop is ignored.
  -
  - Runtime data is consumed as-is from runtime state.
  - Component interprets option shape via mapper functions.
  -
  - If no mappers provided, expects { value, label } shape (default).
  -
  - Example (simple):
  - ```tsx

    ```
  - <Select name="city" optionsFromFieldData />
  - ```

    ```
  -
  - Example (generic shape):
  - ```tsx

    ```
  - <Select
  - name="city"
  - optionsFromFieldData
  - getOptionValue={(opt) => opt.id}
  - getOptionLabel={(opt) => opt.name}
  - />
  - ```
     */
    optionsFromFieldData?: boolean;
    /**
    ```
  - Extract value from runtime option object.
  - Only used when optionsFromFieldData is true.
  - Default: (option) => option.value
    \*/
    getOptionValue?: (option: unknown) => T;
    /\*\*
  - Extract label from runtime option object.
  - Only used when optionsFromFieldData is true.
  - Default: (option) => option.label
    \*/
    getOptionLabel?: (option: unknown) => string;
    /\*\*
  - Determine if runtime option is disabled.
  - Only used when optionsFromFieldData is true.
  - Default: () => false
    \*/
    getOptionDisabled?: (option: unknown) => boolean;
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
    getOptionValue,
    getOptionLabel,
    getOptionDisabled,
    visibleWhen,
    layout,
    fullWidth,
    minWidth = 200,
    sx,
    ...rest
    } = props;
    // Default mappers (simple { value, label } shape)
    const defaultGetOptionValue = (option: unknown): T => {
    if (option && typeof option === 'object' && 'value' in option) {
    return option.value as T;
    }
    throw new Error(`Select: option missing 'value' property`);
    };
    const defaultGetOptionLabel = (option: unknown): string => {
    if (option && typeof option === 'object' && 'label' in option) {
    return String(option.label);
    }
    throw new Error(`Select: option missing 'label' property`);
    };
    const defaultGetOptionDisabled = (): boolean => false;
    // Resolve mappers (use provided or defaults)
    const resolveValue = getOptionValue ?? defaultGetOptionValue;
    const resolveLabel = getOptionLabel ?? defaultGetOptionLabel;
    const resolveDisabled = getOptionDisabled ?? defaultGetOptionDisabled;
    // Runtime mode: consume options from runtime state
    const runtime = useFieldRuntime<{ options: unknown[] }>(name);
  // Resolve options from static or runtime source
  const rawOptions = optionsFromFieldData
  ? (runtime.data?.options ?? [])
  : (staticOptions ?? []);
  // Derive loading state (runtime mode only)
  const isLoading = optionsFromFieldData && runtime.status === 'loading';
  // Map raw options to normalized format for rendering
  // In static mode: rawOptions are already SelectOption<T>[], no mapping needed
  // In runtime mode: apply mappers to raw option objects
  const normalizedOptions = optionsFromFieldData
  ? rawOptions.map((rawOption) => ({
  value: resolveValue(rawOption),
  label: resolveLabel(rawOption),
  disabled: resolveDisabled(rawOption),
  }))
  : (rawOptions as SelectOption<T>[]).map((opt) => ({
  value: opt.value,
  label: opt.label,
  disabled: false,
  }));
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
  {normalizedOptions.map((option) => (
  <MenuItem 
            key={String(option.value)} 
            value={option.value}
            disabled={option.disabled}
          >
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
4. Add optional mapper functions: getOptionValue, getOptionLabel, getOptionDisabled
5. Provide default mappers (expect simple { value, label } shape)
6. Call useFieldRuntime to get runtime data
7. Resolve options from static or runtime source
8. Derive isLoading from runtime status
9. Map raw runtime options to normalized format using mappers
10. Pass disabled state to MenuItem
11. No validation error throwing (behavior minimal)
    Lines Added: ~60 lines

- Mapper props: ~15 lines (JSDoc + type)
- Default mapper functions: ~20 lines
- Runtime hook call: ~2 lines
- Option resolution: ~5 lines
- Normalization logic: ~10 lines
- Loading state: ~2 lines
- Import: ~2 lines
- MenuItem disabled support: ~2 lines
  Total After: ~165 lines

---

Change 2: Runtime Data Shape Contract
File: libs/dashforge/ui/src/components/Select/Select.tsx
Add Type Definition:
/\*\*

- Runtime data shape for Select fields.
-
- Reactions/runtime producers provide raw data.
- Select component interprets option shape via mapper functions.
-
- The options array can contain any shape.
- By default, component expects { value, label } shape.
- For custom shapes, provide getOptionValue/getOptionLabel/getOptionDisabled props.
-
- Example raw data from reaction:
- ```

  ```
- {
- options: [
-     { id: 1, name: 'Option 1', active: true },
-     { id: 2, name: 'Option 2', active: false },
- ]
- }
- ```

  ```
-
- Example with mappers:
- ```tsx

  ```
- <Select
- name="item"
- optionsFromFieldData
- getOptionValue={(opt) => opt.id}
- getOptionLabel={(opt) => opt.name}
- getOptionDisabled={(opt) => !opt.active}
- />
- ```
   */
  export interface SelectFieldRuntimeData<TOption = unknown> {
    options: TOption[];
  }
  Responsibility Separation:
  ```

* Reactions/Runtime Producers: Provide raw runtime data (any shape, no transformation required)
* Select Component: Interprets option shape via mapper functions
* Default Case: Simple { value, label } shape (no mappers needed)
* Generic Case: Custom shapes (provide mappers)
* Contract: Runtime data contains options array of any shape
  Lines Added: ~30 lines

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
  No Aggressive Validation:
- No strict XOR validation throwing errors
- Behavior is minimal: if both options and optionsFromFieldData provided, runtime takes precedence (or ignore static)
- Simple fallback logic, no validation police

---

Testing Plan
Test File Structure
New Test File: libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Purpose: Focused tests for runtime integration (separate from existing unit tests)
Test Cases (~12 tests)

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
   expect(screen.getByText('United States')).toBeInTheDocument();
   expect(screen.getByText('Canada')).toBeInTheDocument();
   });
   Test 1.2: Backward compatibility - no validation errors
   it('allows both options and optionsFromFieldData without throwing (runtime takes precedence)', () => {
   const staticOptions = [{ value: 'static', label: 'Static' }];
   const runtime = {
   status: 'ready',
   data: { options: [{ value: 'runtime', label: 'Runtime' }] },
   error: null,
   };
   // Should not throw (no aggressive validation)
   renderWithRuntime(
   <Select 
         name="field" 
         options={staticOptions} 
         optionsFromFieldData 
       />,
   { field: runtime }
   );
   // Runtime options take precedence
   expect(screen.getByText('Runtime')).toBeInTheDocument();
   expect(screen.queryByText('Static')).not.toBeInTheDocument();
   });
2. Runtime Mode Tests (New Functionality)
   Test 2.1: Reads options from runtime state (simple shape)
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
}); 3. Generic Option Shape Tests (New Functionality)
Test 3.1: Supports generic option shape with mappers
it('supports generic option shapes via mapper functions', () => {
// Reaction provides raw data with custom shape
const runtime = {
status: 'ready',
data: {
options: [
{ id: 1, name: 'Option One', active: true },
{ id: 2, name: 'Option Two', active: false },
],
},
error: null,
};
renderWithRuntime(
<Select
name="item"
optionsFromFieldData
getOptionValue={(opt: any) => opt.id}
getOptionLabel={(opt: any) => opt.name}
getOptionDisabled={(opt: any) => !opt.active}
/>,
{ item: runtime }
);
// Component interprets shape via mappers
expect(screen.getByText('Option One')).toBeInTheDocument();
expect(screen.getByText('Option Two')).toBeInTheDocument();

// Option Two should be disabled
const optionTwo = screen.getByText('Option Two').closest('li');
expect(optionTwo).toHaveAttribute('aria-disabled', 'true');
});
Test 3.2: Default mappers work with { value, label } shape
it('uses default mappers when no custom mappers provided', () => {
const runtime = {
status: 'ready',
data: {
options: [
{ value: 1, label: 'Default One' },
{ value: 2, label: 'Default Two' },
],
},
error: null,
};
renderWithRuntime(
<Select name="priority" optionsFromFieldData />,
{ priority: runtime }
);
// Default mappers extract value/label properties
expect(screen.getByText('Default One')).toBeInTheDocument();
expect(screen.getByText('Default Two')).toBeInTheDocument();
});
Test 3.3: Throws helpful error if option shape mismatches default
it('throws error if option missing required properties and no mappers provided', () => {
const runtime = {
status: 'ready',
data: {
options: [
{ id: 1, name: 'Wrong Shape' }, // Missing value/label
],
},
error: null,
};
// Should throw during render (default mapper fails)
expect(() => {
renderWithRuntime(
<Select name="item" optionsFromFieldData />,
{ item: runtime }
);
}).toThrow(/option missing 'value' property/);
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
Test 4.3: Reactions provide raw data; component interprets shape
it('consumes raw runtime data without requiring transformation', () => {
// Reaction provides raw options array (any shape)
const runtimeData = {
options: [
{ productId: 'p1', displayName: 'Product 1' },
{ productId: 'p2', displayName: 'Product 2' },
],
};
const runtime = {
status: 'ready',
data: runtimeData, // Raw data from reaction
error: null,
};
renderWithRuntime(
<Select
name="product"
optionsFromFieldData
getOptionValue={(opt: any) => opt.productId}
getOptionLabel={(opt: any) => opt.displayName}
/>,
{ product: runtime }
);
// Component interprets shape via mappers
expect(screen.getByText('Product 1')).toBeInTheDocument();
expect(screen.getByText('Product 2')).toBeInTheDocument();
});
Test 4.4: Multiple Select fields with isolated runtime states
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
Total New: ~450 lines
Files to Modify
File
libs/dashforge/ui/src/components/Select/Select.tsx
libs/dashforge/ui/src/components/Select/index.ts
Total Modified: 2 files, ~94 lines added
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

// NEW: Optional mapper functions (runtime mode only)
getOptionValue?: (option: unknown) => T;
getOptionLabel?: (option: unknown) => string;
getOptionDisabled?: (option: unknown) => boolean;
}
SelectFieldRuntimeData (New Export):
export interface SelectFieldRuntimeData<TOption = unknown> {
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
Status: Compliant  
Evidence: Reactions provide raw runtime data (any shape). No transformation required.
✅ Component Interprets Shape
Status: Compliant  
Evidence: Select component interprets option shape via mapper functions. Reactions provide raw data.
✅ Generic Option Support
Status: Compliant  
Evidence: Runtime options not locked to { value, label }. Generic shapes supported via mappers.
✅ Surgical Approach
Status: Compliant  
Evidence: Minimal changes. Only Select and related test files modified. No separate runtime file.
✅ No Unrelated Refactors
Status: Compliant  
Evidence: TextField unchanged except composition. No broad refactoring.
✅ No UI Messaging Added
Status: Compliant  
Evidence: No "Loading options..." or "No options available" helper text. UX deferred to future step.
✅ No Aggressive Validation
Status: Compliant  
Evidence: No strict XOR validation throwing errors. Minimal behavior, simple fallback logic.

---

Out of Scope (Confirmed)
Per task requirements and v3 corrections, the following are explicitly NOT included:

- ❌ User-facing helper text ("Loading options...", "No options available")
- ❌ Finalized loading UX (disabled field only, no messaging)
- ❌ Finalized empty-state UX (empty dropdown only, no messaging)
- ❌ Requirement for reactions to transform data shape
- ❌ Locking runtime options to { value, label } shape only
- ❌ Aggressive XOR validation as centerpiece
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
- ✅ Follows established Autocomplete pattern
- ✅ Generic option support (not locked to one shape)
- ✅ No aggressive validation (minimal behavior)
  Test Infrastructure Risk
- ⚠️ May need to extend test-utils for runtime mocking
  - Mitigation: Check existing test infrastructure first. Build minimal extension if needed.

---

Implementation Sequence

1. Update Select Component (~60 min)
   - Import useFieldRuntime hook
   - Add optionsFromFieldData prop
   - Add optional mapper props (getOptionValue, getOptionLabel, getOptionDisabled)
   - Implement default mappers
   - Add option resolution logic
   - Add normalization logic (apply mappers)
   - Add loading state (disabled field, no helper text)
   - Export SelectFieldRuntimeData type
   - Support disabled options in MenuItem
2. Create Test Infrastructure (~30 min)
   - Check existing test-utils/renderWithBridge.tsx
   - Extend with runtime support or create minimal harness
   - Implement updateRuntime and getFormValue helpers
3. Write Runtime Tests (~120 min)
   - Static mode backward compatibility (2 tests)
   - Runtime mode functionality (simple shape) (5 tests)
   - Generic option shape tests (3 tests)
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
     Total Estimated Time: ~4.5 hours

---

Success Criteria

1. ✅ All existing Select tests pass (backward compatibility)
2. ✅ New runtime tests pass (~14 tests)
3. ✅ Typecheck passes with 0 errors
4. ✅ No reconciliation or value reset logic introduced
5. ✅ No user-facing UI messaging introduced
6. ✅ 100% policy compliance maintained
7. ✅ Static options continue working unchanged (simple { value, label })
8. ✅ Runtime options work with useFieldRuntime
9. ✅ Generic runtime option shapes supported via mappers
10. ✅ Default mappers work for simple { value, label } case
11. ✅ Loading state handled (disabled field, no helper text)
12. ✅ Component interprets option shape; reactions provide raw data
13. ✅ No aggressive validation (minimal behavior)

---

Key Changes from v2
Corrections Applied:

1. Added generic option shape support:
   - Runtime options not locked to { value, label } only
   - Optional mapper functions: getOptionValue, getOptionLabel, getOptionDisabled
   - Default mappers expect simple { value, label } shape
   - Custom mappers for generic shapes
2. Follows established Autocomplete pattern:
   - Uses same mapper function names as Autocomplete
   - Proven pattern already in codebase
   - Consistent DX across components
3. Removed aggressive XOR validation:
   - No strict validation throwing errors as centerpiece
   - Simple fallback logic: runtime takes precedence if both provided
   - Minimal behavior, no validation police
4. Clear responsibility separation:
   - Reactions provide raw runtime data (any shape)
   - Select component interprets shape via mappers
   - Default case simple (no mappers needed)
   - Generic case flexible (provide mappers)
5. Tests updated:
   - Added generic option shape tests (3 tests)
   - Verify mappers work correctly
   - Verify default mappers for simple case
   - Verify error handling for shape mismatch
   - ~14 tests total (was 13 in v2)
6. Lines increased:
   - ~94 lines added to Select.tsx (was ~44 in v2)
   - Mapper support adds ~40 lines
   - Normalization logic adds ~10 lines

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

Plan Status: ✅ READY FOR REVIEW (v3)
Awaiting user approval before proceeding to implementation.

---

END OF PLAN v3
