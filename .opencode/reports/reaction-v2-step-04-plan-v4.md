dashforge/.opencode/reports/reaction-v2-step-04-plan-v4.md
Application: dashforge  
Created: 2026-03-23  
Status: PLAN v4 - Ready for Review  
Policy: /dashforge/.opencode/policies/reaction-v2.md (mandatory compliance)  
Task: /dashforge/.opencode/tasks/reaction-v2-step-04-select-runtime-integration.md

---

Executive Summary
Objective:  
Integrate the existing Select component with the Reactive V2 runtime state layer to enable runtime-driven options while preserving backward compatibility with static options.
Approach:  
Add an optional optionsFromFieldData prop to Select that switches between static mode (current behavior) and runtime mode (reads options from useFieldRuntime). Support generic runtime option shapes via optional mapping functions (getOptionLabel, getOptionValue, optionally getOptionDisabled), while preserving the simple static { value, label } case as the default DX.
Scope Constraints:

- ✅ Runtime option consumption only
- ✅ Static options path preserved (simple { value, label } default)
- ✅ Runtime options path supports generic shapes via mapper functions
- ✅ Reactions provide raw option objects (any shape)
- ✅ Component layer interprets option shape via mappers
- ✅ Minimal, optional mapping support
- ✅ No XOR validation as centerpiece (minimal behavior)
- ✅ No user-facing helper text ("Loading options...", "No options available")
- ✅ No finalized loading/empty-state/unresolved-value UX
- ✅ No reconciliation
- ✅ No automatic reset
  Policy Compliance:
- ✅ No automatic reconciliation
- ✅ Runtime state separate from form values
- ✅ RHF remains source of truth for form values
- ✅ No UI visibility control in reactions
- ✅ Unresolved values: UI shows empty selection, form value unchanged
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
  - If no mappers provided, attempts to use { value, label } shape (default).
  -
  - Example (simple - default { value, label } shape):
  - ```tsx

    ```
  - <Select name="city" optionsFromFieldData />
  - ```

    ```
  -
  - Example (generic shape with mappers):
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
  - Default: attempts (option) => option.value
    \*/
    getOptionValue?: (option: unknown) => T;
    /\*\*
  - Extract label from runtime option object.
  - Only used when optionsFromFieldData is true.
  - Default: attempts (option) => option.label
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
    const defaultGetOptionValue = (option: unknown): T | undefined => {
    if (option && typeof option === 'object' && 'value' in option) {
    return option.value as T;
    }
    return undefined; // Soft failure
    };
    const defaultGetOptionLabel = (option: unknown): string => {
    if (option && typeof option === 'object' && 'label' in option) {
    return String(option.label);
    }
    return ''; // Soft failure
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
  ? rawOptions
  .map((rawOption) => ({
  value: resolveValue(rawOption),
  label: resolveLabel(rawOption),
  disabled: resolveDisabled(rawOption),
  }))
  .filter((opt) => opt.value !== undefined) // Filter out failed mappings
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
  // Pass loading state (NO user-facing text in this step)
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
5. Provide default mappers with soft failure (return undefined/empty instead of throwing)
6. Call useFieldRuntime to get runtime data
7. Resolve options from static or runtime source
8. Derive isLoading from runtime status
9. Map raw runtime options to normalized format using mappers
10. Filter out failed mappings (where value is undefined)
11. Pass disabled state to MenuItem (NO helper text)
12. No hard throwing behavior in default mappers
    Lines Added: ~65 lines

- Mapper props: ~15 lines (JSDoc + type)
- Default mapper functions: ~25 lines (with soft failure logic)
- Runtime hook call: ~2 lines
- Option resolution: ~5 lines
- Normalization logic: ~10 lines (with filtering)
- Loading state: ~2 lines (no helper text)
- Import: ~2 lines
- MenuItem disabled support: ~2 lines
  Total After: ~170 lines

---

Change 2: Component Consumption Contract (UI-facing type only)
File: libs/dashforge/ui/src/components/Select/Select.tsx
IMPORTANT: This type is a component consumption contract, NOT a separate canonical runtime definition. It describes how the Select component consumes runtime data.
/\*\*

- Component consumption contract for Select runtime options.
-
- This describes how Select consumes runtime data, not a canonical runtime type.
- Do NOT use this as a separate source of truth for runtime shape.
-
- Reactions/runtime producers provide raw data in any shape.
- Select component interprets option shape via mapper functions.
-
- The options array can contain any shape.
- By default, component attempts to use { value, label } shape.
- For custom shapes, provide getOptionValue/getOptionLabel/getOptionDisabled props.
-
- Example raw data from reaction (any shape):
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
* Select Component: Interprets option shape via mapper functions (UI-facing consumption contract)
* Default Case: Simple { value, label } shape (no mappers needed, soft failure if mismatch)
* Generic Case: Custom shapes (provide mappers)
* Note: This type is NOT a separate source of truth; it's a UI-facing consumption contract
  Lines Added: ~35 lines

---

Change 3: Export Types
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

Change 4: Behavior (No UI Messaging)
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
  Mapper Failure Behavior (shape mismatch):
- Default mappers return undefined/empty (soft failure)
- Failed options filtered out of rendering
- NO throwing errors in this step
- NO dev warnings in this step
- Reason: Error/warning policy not finalized; defer to future step
  Minimal Validation:
- No strict XOR validation throwing errors
- Behavior is minimal: if both options and optionsFromFieldData provided, runtime takes precedence
- Simple fallback logic, no validation police

---

Testing Plan
Test File Structure
New Test File: libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx
Purpose: Focused tests for runtime integration (separate from existing unit tests)
Test Cases (~12 tests)

1. Static Mode Tests (Backward Compatibility)
   Test 1.1: Static options still work (no regression)
   Test 1.2: Backward compatibility - no validation errors
2. Runtime Mode Tests (New Functionality)
   Test 2.1: Reads options from runtime state (simple shape)
   Test 2.2: Disables field during loading (NO helper text)
   Test 2.3: Updates when runtime options change
   Test 2.4: Handles empty runtime options (NO helper text)
   Test 2.5: Handles idle runtime state (no data yet)
3. Generic Option Shape Tests (New Functionality)
   Test 3.1: Supports generic option shape with mappers
   Test 3.2: Default mappers work with { value, label } shape
   Test 3.3: Handles option shape mismatch gracefully (soft failure)
4. Policy Compliance Tests
   Test 4.1: No automatic value reset (policy violation check)
   Test 4.2: No reconciliation logic
   Test 4.3: Reactions provide raw data; component interprets shape
   Test 4.4: Multiple Select fields with isolated runtime states

---

Test Infrastructure
Test Utility: renderWithRuntime
Decision: Extend existing test utilities minimally (check test-utils/ first)
Option A (Preferred): Extend renderWithBridge.tsx with runtime support  
Option B: Create minimal test harness similar to Step 03's TestFieldHarness

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
Total Modified: 2 files, ~104 lines added

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
SelectFieldRuntimeData (New Export - Component Consumption Contract):
// NOTE: UI-facing consumption contract, not separate canonical runtime type
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
Evidence: No value reset or healing logic. Unresolved values remain as-is in form state.
✅ No Automatic Value Reset
Evidence: When options change, field value is not modified. Test 4.1 verifies this.
✅ RHF Remains Source of Truth
Evidence: Form values managed by RHF. Runtime only provides options, not values.
✅ Runtime State Separate from Form
Evidence: Options stored in runtime layer, values in RHF. No mixing.
✅ Reactions Are Mechanical
Evidence: Reactions provide raw runtime data (any shape). No transformation required.
✅ Component Interprets Shape
Evidence: Select component interprets option shape via mapper functions. Reactions provide raw data.
✅ Generic Option Support
Evidence: Runtime options not locked to { value, label }. Generic shapes supported via mappers.
✅ No UI Messaging Added
Evidence: No "Loading options..." or "No options available" helper text. UX deferred to future step.
✅ No Aggressive Validation
Evidence: No strict XOR validation throwing errors. Minimal behavior, simple fallback logic.
✅ No Hard Mapper Failure Policy
Evidence: Default mappers use soft failure. Failed options filtered out. Error handling deferred.
✅ No Second Source of Truth
Evidence: SelectFieldRuntimeData documented as UI-facing consumption contract, not separate canonical runtime definition.

---

Out of Scope (Confirmed)

- ❌ User-facing helper text ("Loading options...", "No options available")
- ❌ Finalized loading UX (disabled field only, no messaging)
- ❌ Finalized empty-state UX (empty dropdown only, no messaging)
- ❌ Requirement for reactions to transform data shape
- ❌ Locking runtime options to { value, label } shape only
- ❌ XOR validation as centerpiece
- ❌ Hard failure policy for default runtime mappers
- ❌ Throwing errors as official behavior for shape mismatches
- ❌ Dev warnings for invalid runtime option shapes
- ❌ Finalized unresolved-value UX
- ❌ Unresolved value warnings
- ❌ Reconciliation logic (forbidden by policy)
- ❌ Automatic value reset (forbidden by policy)
- ❌ visibleWhen changes
- ❌ Translation/i18n
- ❌ Business validation
- ❌ Runtime error messaging beyond disabled state
- ❌ TextField refactors

---

Success Criteria

1. ✅ All existing Select tests pass (backward compatibility)
2. ✅ New runtime tests pass (~12 tests)
3. ✅ Typecheck passes with 0 errors
4. ✅ No reconciliation or value reset logic introduced
5. ✅ No user-facing UI messaging introduced
6. ✅ 100% policy compliance maintained
7. ✅ Static options continue working unchanged (simple { value, label })
8. ✅ Runtime options work with useFieldRuntime
9. ✅ Generic runtime option shapes supported via mappers
10. ✅ Default mappers work for simple { value, label } case (soft failure)
11. ✅ Shape mismatches handled gracefully (filter out, no throwing)
12. ✅ Loading state handled (disabled field, NO helper text)
13. ✅ Component interprets option shape; reactions provide raw data
14. ✅ No XOR validation as centerpiece (minimal behavior)
15. ✅ No hard mapper failure policy locked in
16. ✅ SelectFieldRuntimeData documented as UI-facing consumption contract

---

Implementation Sequence

1. Update Select Component (~70 min)
   - Import useFieldRuntime hook
   - Add optionsFromFieldData prop
   - Add optional mapper props (getOptionValue, getOptionLabel, getOptionDisabled)
   - Implement default mappers with soft failure
   - Add option resolution logic
   - Add normalization logic (apply mappers + filter failed mappings)
   - Add loading state (disabled field, NO helper text)
   - Export SelectFieldRuntimeData type (as UI-facing consumption contract)
   - Support disabled options in MenuItem
2. Create Test Infrastructure (~30 min)
   - Check existing test-utils/renderWithBridge.tsx
   - Extend with runtime support or create minimal harness
   - Implement updateRuntime and getFormValue helpers
3. Write Runtime Tests (~120 min)
   - Static mode backward compatibility (2 tests)
   - Runtime mode functionality (simple shape) (5 tests)
   - Generic option shape tests (3 tests, including soft failure test)
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

Plan Status: ✅ READY FOR REVIEW (v4)
Key Corrections Applied:

1. ✅ Runtime options NOT locked to SelectOption<{ value, label }>
2. ✅ Reactions/runtime producers NOT required to format data
3. ✅ Responsibility separation explicit (reactions=raw, component=interpret)
4. ✅ Minimal component-level mapping (getOptionLabel, getOptionValue, getOptionDisabled)
5. ✅ Simple static { value, label } case preserved as default DX
6. ✅ NO user-facing helper text introduced
7. ✅ NO finalized loading/empty-state/unresolved-value UX
8. ✅ NO XOR validation as centerpiece (minimal behavior)
9. ✅ SelectFieldRuntimeData typed as UI-facing consumption contract (NOT second source of truth)
   Awaiting user approval before proceeding to implementation.

---

END OF PLAN v4
