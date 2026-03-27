Autocomplete Architecture Review Plan
Task: autocomplete-architecture-review  
Mode: PLAN (READ-ONLY)  
Date: 2026-03-27  
Mandatory Policy: reaction-v2.md

---

Executive Summary
This architectural review analyzes the Autocomplete component's current implementation and defines a precise plan for adding runtime integration (Reactive V2) while preserving existing behavior.
Current Status:

- ✅ Solid foundation for freeSolo static mode (23 tests passing)
- ✅ Complete DashForm integration (bridge pattern implemented)
- ✅ Form Closure v1 compliant (error gating working)
- ❌ Missing: Generic option shapes
- ❌ Missing: Runtime integration (Reactive V2)
- ❌ Missing: Unresolved value handling
  Scope: Add generic option support and runtime integration following Select architectural principles. No refactoring of existing working code.

---

1. Source of Truth Matrix (CORRECTED)
   1.1 Value Source of Truth
   Mode Context Value Source Controlled By
   Standalone No DashForm value prop User (controlled)
   Standalone No DashForm MUI internal MUI (uncontrolled)
   DashForm Inside DashForm bridge.getValue(name) Bridge/RHF
   CRITICAL POLICY:
1. DashForm mode: Bridge is the ONLY source of truth
   - bridge.getValue(name) is authoritative
   - Component subscribes via version strings
   - NO external override allowed
1. Standalone mode: value prop or MUI internal state
   - Controlled: User provides value + onChange
   - Uncontrolled: MUI manages state internally
1. DANGEROUS COMBINATION: value prop in DashForm mode
   - Behavior: If provided, will cause conflicting state
   - Action: Emit ERROR-level dev warning
   - Rationale: Bridge and explicit prop fight for control → undefined behavior
     Dev Warning:
     if (process.env.NODE_ENV !== 'production') {
     if (bridge && explicitValue !== undefined) {
     console.error(
     `[Autocomplete "${name}"] DANGEROUS: value prop provided in DashForm mode. ` +
     `Bridge is the source of truth. Remove the value prop or use standalone mode.`
     );
     }
     }

---

1.2 Options Source of Truth
Mode Prop State Options Source
Static optionsFromFieldData={false} or undefined options prop
Runtime optionsFromFieldData={true} runtime.data.options via useFieldRuntime
Hard Misuse optionsFromFieldData={true} + No DashForm N/A
Soft Misuse optionsFromFieldData={true} + options prop Runtime (prop ignored)
Dev Warnings:
if (process.env.NODE_ENV !== 'production') {
// HARD MISUSE (error-level): Runtime mode requires DashForm
if (optionsFromFieldData && !bridge) {
console.error(
`[Autocomplete "${name}"] ERROR: optionsFromFieldData={true} requires DashFormProvider. ` +
`This component will not work correctly. Wrap in DashFormProvider or use static options.`
);
}

// SOFT MISUSE (warning-level): Runtime mode ignores options prop
if (optionsFromFieldData && options) {
console.warn(
`[Autocomplete "${name}"] WARNING: options prop is ignored when optionsFromFieldData={true}. ` +
`Remove the options prop to avoid confusion.`
);
}
}
Severity Levels:

- 🔴 ERROR (console.error): Hard misuse, component will not work
- 🟡 WARN (console.warn): Soft misuse, confusing but functional
- ⚠️ DANGEROUS (console.error): Conflicting state, undefined behavior

---

1.3 Display Value Resolution
Scenario Form Value Runtime Status Options State
Match found "us" ready [{value: "us", ...}]
No match (static) "custom" N/A [not matching]
No match (runtime loading) "us" loading []
No match (runtime ready) "us" ready [not matching]
Null value null any any
Rationale:

- Static mode: Trust developer; allow any text (freeSolo)
- Runtime mode: Assume value should match options; sanitize + warn if not

---

2. Generic Types Definition (CORRECTED)
   2.1 Type Parameters
   /\*\*

- TValue: Storage value type (what gets saved to form)
- - Must be string or number (form-compatible primitives)
- - Default: string (backward compatible)
    \*/
    type TValue = string | number;
    /\*\*
- TOption: Generic option shape (what developer provides)
- - Can be any shape: { id, name }, { value, label }, etc.
- - Component uses mapper functions to extract value/label/disabled
    \*/
    type TOption = unknown;

---

2.2 Component Signature
export function Autocomplete<
TValue extends string | number = string,
TOption = AutocompleteOption

> (
> props: AutocompleteProps<TValue, TOption>

## ): JSX.Element | null;

2.3 Props Interface (CORRECTED)
export interface AutocompleteProps<
TValue extends string | number = string,
TOption = AutocompleteOption

> extends Omit<MuiAutocompleteProps<...>, 'value' | 'onChange' | ...> {
> /\*\*

- Field name (required)
  \*/
  name: string;
  /\*\*
- Validation rules (optional)
  \*/
  rules?: unknown;
  /\*\*
- Conditional visibility
  \*/
  visibleWhen?: (engine: Engine) => boolean;
  // --- STATIC MODE ---
  /\*\*
- Static options (array of any shape)
- Ignored when optionsFromFieldData={true}
  \*/
  options?: TOption[];
  /\*\*
- Extract storage value from option
- Default: (opt) => opt.value
  \*/
  getOptionValue?: (option: TOption) => TValue | undefined;
  /\*\*
- Extract display label from option (must return string)
- Default: (opt) => String(opt.label)
  \*/
  getOptionLabel?: (option: TOption) => string;
  /\*\*
- Check if option is disabled
- Default: () => false
  \*/
  getOptionDisabled?: (option: TOption) => boolean;
  // --- RUNTIME MODE ---
  /\*\*
- If true, reads options from field runtime state.
- Requires DashFormProvider context.
- When enabled, 'options' prop is ignored.
  \*/
  optionsFromFieldData?: boolean;
  // --- CONTROLLED INTERFACE ---
  /\*\*
- Controlled value (storage type: TValue | null)
-
- ⚠️ STANDALONE MODE ONLY
- In DashForm mode, bridge controls the value.
- Providing this prop in DashForm mode will emit ERROR warning.
  \*/
  value?: TValue | null;
  /\*\*
- Value change callback
- Called with storage value (TValue | null), not option object
  \*/
  onChange?: (value: TValue | null) => void;
  /\*\*
- Blur callback (optional)
  \*/
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  // ... rest of MUI passthrough props
  }
  Type Consistency:

* ✅ TValue used consistently for storage values
* ✅ TOption used consistently for option shapes
* ✅ Mapper functions typed: (option: TOption) => TValue | undefined
* ✅ value prop typed: TValue | null
* ✅ onChange callback typed: (value: TValue | null) => void

---

3. Normalized Model Validation (JUSTIFIED)
   3.1 Required Model
   /\*\*

- Internal normalized option model.
- All options normalized to this shape before passing to MUI.
  \*/
  interface NormalizedOption<TValue extends string | number> {
  /\*\*
  - Storage value (TValue)
  - What gets saved to form on selection
    \*/
    value: TValue;
    /\*\*
  - Display label (string)
  - MUI getOptionLabel requires string return type
    \*/
    label: string;
    /\*\*
  - Original option object (preserved for custom rendering)
  -
  - JUSTIFICATION:
  - - Needed for MUI renderOption prop (custom option rendering)
  - - Needed for getOptionLabel when label is computed from multiple fields
  - - Needed for future tooltip/metadata display
  -
  - Example use case:
  - renderOption={(props, option) => (
  - <li {...props}>
  -     <div>{option.label}</div>
  -     <small>{option.raw.description}</small>
  - </li>
  - )}
    \*/
    raw: TOption;
    /\*\*
  - Disabled state (optional)
    \*/
    disabled?: boolean;
    }
    Decision:

* ✅ KEEP raw field — Needed for renderOption customization
* ✅ Justification provided above
* ✅ Future-proof for tooltip/metadata display
  Why Not Just Pass TOption Directly to MUI?
* ❌ MUI requires specific shape for getOptionLabel (string return)
* ❌ MUI requires specific shape for isOptionEqualToValue (consistent value comparison)
* ❌ freeSolo mode requires value to be NormalizedOption | string | null (mixed types)
* ✅ Normalization provides single pipeline for static and runtime options

---

3.2 Normalization Pipeline
// Default mappers with soft failure (return undefined, not throw)
const defaultGetOptionValue = (option: TOption): TValue | undefined => {
if (option && typeof option === 'object' && 'value' in option) {
return option.value as TValue;
}
return undefined; // Soft failure
};
const defaultGetOptionLabel = (option: TOption): string => {
if (option && typeof option === 'object' && 'label' in option) {
return String(option.label);
}
return ''; // Soft failure
};
const defaultGetOptionDisabled = (): boolean => false;
// Use provided mappers or defaults
const mapValue = getOptionValue || defaultGetOptionValue;
const mapLabel = getOptionLabel || defaultGetOptionLabel;
const mapDisabled = getOptionDisabled || defaultGetOptionDisabled;
// Normalize: map → filter undefined values
const normalizedOptions: NormalizedOption<TValue>[] = sourceOptions
.map((rawOption: TOption) => {
const value = mapValue(rawOption);
const label = mapLabel(rawOption);
const disabled = mapDisabled(rawOption);
return {
value,
label,
raw: rawOption, // Preserve original
disabled,
};
})
.filter((opt): opt is NormalizedOption<TValue> => opt.value !== undefined);

---

4. Runtime Behavior Definition
   4.1 optionsFromFieldData
   Implementation:
   // Hook ALWAYS called unconditionally (React rules)
   const runtime = useFieldRuntime<{ options: TOption[] }>(name);
   // Resolve options source based on mode
   const rawRuntimeOptions =
   optionsFromFieldData &&
   runtime?.data?.options &&
   Array.isArray(runtime.data.options)
   ? runtime.data.options
   : [];
   const sourceOptions: TOption[] = optionsFromFieldData
   ? rawRuntimeOptions
   : (options || []);
   // Same normalization pipeline for both sources
   const normalizedOptions = normalizeOptions(sourceOptions);
   Policy:

- ✅ Hook called unconditionally (React rules)
- ✅ When true, use runtime.data.options
- ✅ When false or undefined, use options prop
- ✅ Same normalization for both sources (single pipeline)

---

4.2 loadingFromFieldData
Implementation:
const isLoading = optionsFromFieldData && runtime?.status === 'loading';
<MuiAutocomplete
disabled={rest.disabled || isLoading}
// Entire field disabled during loading
/>
Policy:

- ✅ Disable field during loading (consistent with Select principles)
- ✅ No UI loading indicator (just disabled state)
- ✅ Clear visual feedback (disabled style)

---

4.3 Unresolved Value Handling
Detection Logic (Phase 1: Pure Computation):
const unresolvedDetection = useMemo(() => {
// Only detect in runtime mode when status is ready
if (!optionsFromFieldData || runtime?.status !== 'ready' || !bridge) {
return null;
}
const currentValue = bridge.getValue(name);
// Skip null/empty values
if (currentValue == null || currentValue === '') {
return null;
}
// Check if value matches any normalized option
const isResolved = normalizedOptions.some(
(opt) => opt.value === currentValue
);
if (isResolved) {
return null; // Value is resolved
}
// Value is unresolved
return {
fieldName: name,
fieldValue: currentValue as TValue,
availableValues: normalizedOptions.map((opt) => opt.value),
};
}, [optionsFromFieldData, runtime?.status, bridge, name, normalizedOptions]);
Warning (Phase 2: Side Effect in useEffect):
// Module-level deduplication map (WeakMap for GC)
const warnedUnresolvedValues = new WeakMap<DashFormBridge, Set<string>>();
function warnUnresolvedValue(
bridge: DashFormBridge,
fieldName: string,
fieldValue: TValue,
availableValues: TValue[]
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
return; // Already warned for this field:value combination
}
warned.add(key);
// Emit warning
const optionsDisplay = availableValues.length > 0
? availableValues.join(', ')
: '(empty - no options loaded)';
console.warn(
`[Dashforge Autocomplete] Unresolved value for field "${fieldName}".\n` +
`Current value "${String(fieldValue)}" does not match any loaded option.\n` +
`The form value remains unchanged (no automatic reset).\n` +
`Available options: ${optionsDisplay}`
);
}
// In component:
useEffect(() => {
if (!unresolvedDetection || !bridge) {
return;
}
warnUnresolvedValue(
bridge,
unresolvedDetection.fieldName,
unresolvedDetection.fieldValue,
unresolvedDetection.availableValues
);
}, [unresolvedDetection, bridge]);
Policy (reaction-v2.md Section 3.2, 3.3):

- ✅ Detect ONLY when optionsFromFieldData={true} AND runtime.status === 'ready'
- ✅ Skip during loading (no premature warnings)
- ✅ Skip for null/empty values
- ✅ Emit dev warning (console.warn, deduplicated per bridge instance)
- ✅ NO production warnings (process.env.NODE_ENV check)
- ✅ Form value NEVER changed (display sanitization only)

---

4.4 Display Sanitization
Implementation:
const displayValue: NormalizedOption<TValue> | string | null = useMemo(() => {
const rawValue = bridge?.getValue?.(name) ?? null;
// Runtime mode: sanitize during non-ready states
if (optionsFromFieldData && runtime?.status !== 'ready') {
return null; // Show empty during loading/idle/error
}
// Try to match value to a normalized option
const matchingOption = normalizedOptions.find(
(opt) => opt.value === rawValue
);
if (matchingOption) {
return matchingOption; // Show option object
}
// Unresolved value in runtime mode: sanitize to empty
if (optionsFromFieldData && runtime?.status === 'ready') {
return null; // Show empty (warning will fire in effect)
}
// Static mode: allow freeSolo text
return rawValue; // Show text as-is
}, [bridge, name, optionsFromFieldData, runtime?.status, normalizedOptions]);
Policy (reaction-v2.md Display Behavior):

- ✅ Sanitize during runtime loading/idle/error states
- ✅ Prevents MUI "out-of-range value" warnings
- ✅ Underlying form value MUST remain unchanged
- ✅ Display-layer only (no data mutation)

---

4.5 freeSolo vs Option-Derived Value
Current Behavior (PRESERVE):
MUI Autocomplete in freeSolo mode accepts mixed value types:

- NormalizedOption<TValue> object (when value matches option)
- string (when freeSolo text typed)
- null (when cleared)
  Display Value Policy:

1. Value matches option → Pass NormalizedOption object to MUI → Shows option label
2. Value is free text (static mode) → Pass raw string to MUI → Shows text as-is
3. Value doesn't match (runtime mode) → Pass null to MUI → Shows empty (sanitized)
   MUI Integration:
   <MuiAutocomplete<NormalizedOption<TValue> | string, false, false, true>
   freeSolo
   value={displayValue} // NormalizedOption | string | null
   options={normalizedOptions}

getOptionLabel={(option: NormalizedOption<TValue> | string) => {
if (typeof option === 'string') {
return option; // freeSolo text
}
return option.label; // Normalized option (always string)
}}

isOptionEqualToValue={(
option: NormalizedOption<TValue> | string,
value: NormalizedOption<TValue> | string
) => {
if (typeof value === 'string') {
if (typeof option === 'string') {
return option === value;
}
return option.value === value;
}
if (typeof option === 'object' && typeof value === 'object') {
return option.value === value.value;
}
return false;
}}

getOptionDisabled={(option: NormalizedOption<TValue> | string) => {
if (typeof option === 'object' && 'disabled' in option) {
return Boolean(option.disabled);
}
return false;
}}

// ... rest of MUI props
/>

---

5. Pattern Comparison
   5.1 vs TextField
   Feature TextField
   Bridge integration ✅ bridge.register
   Error gating ✅ touched || submitCount
   Synthetic events ✅ { target: { name, value } }
   Touch tracking ✅ registration.onBlur
   Source of truth ✅ Bridge in DashForm
   Conclusion: Autocomplete follows TextField architectural principles correctly.

---

5.2 vs Select
Feature Select
Generic type ✅ <T extends string | number>
Mappers ✅ get{Value,Label,Disabled}
Normalization ✅ Map→filter
optionsFromFieldData ✅ Yes
useFieldRuntime ✅ Yes
Loading state ✅ Disable field
Unresolved detection ✅ Yes
Display sanitization ✅ Yes
Conclusion: Follow Select architectural principles (normalization, runtime integration, sanitization), adapting for freeSolo-specific behavior where needed.

---

6. Implementation Plan
   Phase 1: Generic Option Support
   Objective: Add generic type parameters and mapper functions
   Changes:
1. Add normalized model
   interface NormalizedOption<TValue extends string | number> {
   value: TValue;
   label: string;
   raw: TOption; // Preserved for renderOption
   disabled?: boolean;
   }
1. Add generic type parameters
   export function Autocomplete<
   TValue extends string | number = string,
   TOption = AutocompleteOption
   > (props: AutocompleteProps<TValue, TOption>)
1. Add mapper props
   getOptionValue?: (option: TOption) => TValue | undefined;
   getOptionLabel?: (option: TOption) => string;
   getOptionDisabled?: (option: TOption) => boolean;
1. Implement normalization pipeline
   - Default mappers with soft failure
   - Map → filter pattern
   - Apply to both DashForm and standalone modes
1. Update MUI integration
   - Pass normalizedOptions to MUI
   - Update getOptionLabel to use .label
   - Update isOptionEqualToValue to use .value
   - Update getOptionDisabled to use .disabled
     Testing:

- Add Intent E: Generic option shapes (+10 tests)
  - Default { value, label } shape works
  - Custom shape with mappers works
  - Soft failure (undefined value filtered)
  - Non-string labels converted to string
  - Backward compatibility with AutocompleteOption
  - Both DashForm and standalone modes
    Success Criteria:
- ✅ All 23 existing tests pass
- ✅ 10 new tests pass (target: 33 total)
- ✅ Typecheck passes
- ✅ Backward compatible
  Estimated Effort: 4-6 hours  
  Risk: 🟡 Medium

---

Phase 2: Runtime Integration (Reactive V2)
Objective: Add runtime-driven options following Select architectural principles
Changes:

1. Add optionsFromFieldData prop
2. Integrate useFieldRuntime hook
   const runtime = useFieldRuntime<{ options: TOption[] }>(name);
3. Resolve options source
   const sourceOptions = optionsFromFieldData
   ? (runtime?.data?.options || [])
   : (options || []);
4. Add loading state
   const isLoading = optionsFromFieldData && runtime?.status === 'loading';
5. Add display sanitization
   - Compute displayValue based on runtime status
   - Sanitize to null during loading/idle/error
   - Sanitize to null when unresolved in ready state
6. Add unresolved detection
   - useMemo for pure detection logic
   - useEffect for warning side effect
   - Deduplicated per bridge instance
7. Add dev warnings
   - ERROR: optionsFromFieldData without DashForm
   - WARN: optionsFromFieldData + options prop
   - ERROR: value prop in DashForm mode
     Testing:

- Add Intent F: Runtime option loading (+5 tests)
  - Options loaded from runtime correctly
  - Loading state disables field
  - Runtime status tracked correctly
- Add Intent G: Display sanitization (+5 tests)
  - Sanitize during loading
  - Sanitize during idle/error
  - No sanitization when ready and resolved
  - Form value unchanged during sanitization
- Add Intent H: Unresolved value detection (+7 tests)
  - Warning when value doesn't match (runtime ready)
  - No warning during loading
  - No warning for null values
  - No warning in static mode
  - Warning deduplicated
  - Production mode (no warnings)
- Add Intent I: Dev warnings (+3 tests)
  - ERROR when runtime mode without DashForm
  - WARN when runtime + options prop
  - ERROR when value prop in DashForm
    Success Criteria:
- ✅ All phase 1 tests pass
- ✅ 20 new tests pass (target: 53 total)
- ✅ Typecheck passes
- ✅ Reactive V2 policy compliant
- ✅ MUI warnings suppressed
- ✅ Form value never reset
- ✅ Dev warnings working correctly
  Estimated Effort: 6-8 hours  
  Risk: 🟡 Medium

---

7. Dev Warnings Summary (SEVERITY)
   7.1 Error-Level Warnings
1. optionsFromFieldData without DashForm (HARD MISUSE)
   if (optionsFromFieldData && !bridge) {
   console.error(
   `[Autocomplete "${name}"] ERROR: optionsFromFieldData={true} requires DashFormProvider. ` +
   `This component will not work correctly. Wrap in DashFormProvider or use static options.`
   );
   }
   Severity: 🔴 ERROR (console.error)  
   Impact: Component will not work correctly  
   Fix: Wrap in DashFormProvider or remove optionsFromFieldData

---

2. value prop in DashForm mode (DANGEROUS)
   if (bridge && explicitValue !== undefined) {
   console.error(
   `[Autocomplete "${name}"] DANGEROUS: value prop provided in DashForm mode. ` +
   `Bridge is the source of truth. Remove the value prop or use standalone mode.`
   );
   }
   Severity: ⚠️ DANGEROUS (console.error)  
   Impact: Conflicting state, undefined behavior  
   Fix: Remove value prop (bridge controls value in DashForm mode)

---

7.2 Warning-Level Warnings 3. optionsFromFieldData + options prop (SOFT MISUSE)
if (optionsFromFieldData && options) {
console.warn(
`[Autocomplete "${name}"] WARNING: options prop is ignored when optionsFromFieldData={true}. ` +
`Remove the options prop to avoid confusion.`
);
}
Severity: 🟡 WARN (console.warn)  
Impact: Confusing but functional (runtime takes precedence)  
Fix: Remove options prop to avoid confusion

---

4. Unresolved value (INFORMATIONAL)
   console.warn(
   `[Dashforge Autocomplete] Unresolved value for field "${fieldName}".\n` +
   `Current value "${String(fieldValue)}" does not match any loaded option.\n` +
   `The form value remains unchanged (no automatic reset).\n` +
   `Available options: ${optionsDisplay}`
   );
   Severity: 🟡 WARN (console.warn)  
   Impact: Informational (data quality issue, not component issue)  
   Fix: Ensure form value matches loaded options, or accept freeSolo text in static mode

---

8. Policy Compliance Checklist
   Reactive V2 Policy (reaction-v2.md)
   Section 1.2 — RHF Remains Source of Truth:

- ✅ Bridge.getValue used for form values
- ✅ Component does not duplicate form state
  Section 1.3 — Runtime State Separate:
- ✅ Runtime state read via useFieldRuntime (read-only)
- ✅ Runtime state used ONLY for options display
  Section 1.5 — No Automatic Reconciliation:
- ✅ Display sanitization does NOT mutate form value
- ✅ Form value preserved even when unresolved
- ✅ NO automatic reset
  Section 3.2 — Unresolved Value Behavior:
- ✅ UI displays no selected value (empty)
- ✅ Form value remains unchanged
- ✅ NO automatic reset
  Section 3.3 — Dev Warnings:
- ✅ Console warning emitted (deduplicated per bridge)
- ✅ Only when runtime.status === 'ready'
- ✅ Never during loading
- ✅ Never in production (process.env.NODE_ENV check)
  Display Sanitization (end of policy):
- ✅ Sanitize during loading/idle/error states
- ✅ Prevents MUI "out-of-range value" warnings
- ✅ Underlying form value MUST remain unchanged

---

9. Risks and Mitigations
   Risk Severity Mitigation
   Source of truth ambiguity 🔴 CRITICAL Clear matrix: bridge in DashForm, prop in standalone
   Accidental value reset 🔴 CRITICAL Sanitize display only, never mutate form value
   Production warnings 🔴 CRITICAL Gate ALL warnings with NODE_ENV check
   freeSolo vs unresolved ambiguity 🔴 HIGH Runtime mode only policy, explicit in plan
   Type safety with generics 🟡 MEDIUM Consistent TValue/TOption usage throughout
   Test coverage gaps 🟡 MEDIUM TDD-first, 53+ tests target

---

## 10. Out of Scope

**NOT in this plan:**

- ❌ Refactoring existing code structure
- ❌ Extracting helper modules
- ❌ Optimizing performance
- ❌ `multiple` mode
- ❌ Async search
- ❌ Remote filtering
- ❌ Layout modes
  **Rationale:** Focus on adding runtime support with minimal changes to working code.

---

11. Success Metrics
    Phase 1 Complete:

- ✅ Generic types work (TValue, TOption)
- ✅ Mapper functions work
- ✅ 33 tests passing
- ✅ Typecheck passes
- ✅ Backward compatible
  Phase 2 Complete:
- ✅ Runtime integration works
- ✅ 53 tests passing
- ✅ Policy compliant (reaction-v2.md)
- ✅ MUI warnings suppressed
- ✅ Unresolved values handled
- ✅ Dev warnings working (3 levels)
- ✅ Source of truth clear and enforced
  Overall:
- ✅ Feature parity with Select (runtime support)
- ✅ Zero breaking changes
- ✅ Reactive V2 compliant
- ✅ Clear source of truth

---

12. Next Steps
1. ✅ Review this corrected plan
1. ✅ Validate source-of-truth matrix (Section 1)
1. ✅ Validate generic types (Section 2)
1. ✅ Validate normalized model justification (Section 3)
1. ✅ Validate dev warning severity (Section 7)
1. ✅ Begin Phase 1 implementation (TDD-first)

---

Total Estimated Effort: 10-14 hours  
Overall Risk: 🟡 MEDIUM  
Ready for Implementation: ✅ YES (after plan approval)

---

END OF CORRECTED PLAN
