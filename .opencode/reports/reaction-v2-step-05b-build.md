# Reactive V2 Step 05b Build Report

**Task:** MUI Out-of-Range Warning Fix  
**Date:** March 23, 2026  
**Status:** ✅ Complete

---

## Summary

Implemented display-layer sanitization to eliminate MUI Select console warnings when a form value doesn't match any available option. This surgical fix preserves the approved Reactive V2 policy: **RHF value remains unchanged, UI displays empty**.

---

## Policy Compliance

### Reactive V2 Policy (reaction-v2.md Section 3.2)

✅ **CRITICAL CONSTRAINTS MET:**

1. **RHF value MUST remain unchanged** - ✅ Confirmed
   - Display value sanitized to empty string
   - Bridge value (`bridge.getValue(name)`) unchanged
   - No automatic reconciliation or reset

2. **UI displays empty** - ✅ Confirmed
   - Select shows no selection when value is unresolved
   - MUI TextField receives empty string for unresolved values
   - Prevents "out-of-range value" console warnings

3. **No automatic reconciliation** - ✅ Confirmed
   - System does NOT fix or modify data
   - User must manually update value

4. **No UI error messaging** - ✅ Confirmed
   - No user-facing warnings about unresolved values
   - Developer console warnings remain (Step 05)

5. **Dev warnings only** - ✅ Confirmed
   - Step 05 dev warnings unchanged
   - Step 05b only suppresses MUI warnings (display layer)

---

## Implementation Details

### 1. Architecture

**Flow:**
```
Select (extracts available values from options)
  ↓
TextField (receives __selectAvailableValues internal prop)
  ↓
createSelectIntegration() (sanitizes display value)
  ↓
MUI TextField (receives sanitized value, no warnings)
```

**Key Principle:**
- **Display value** (passed to MUI) ≠ **RHF value** (stored in form state)
- Sanitization happens only at display layer
- Bridge value remains unchanged

### 2. Display Value Sanitization Logic

**Location:** `libs/dashforge/ui/src/components/TextField/textField.select.ts`

**Logic:**
```typescript
const displayValue =
  availableValues !== undefined &&
  rawValue !== '' &&
  rawValue != null &&
  !availableValues.includes(rawValue as string | number)
    ? '' // Unresolved: display as empty (MUI-safe)
    : rawValue; // Resolved or no validation: pass through
```

**When sanitization applies:**
- Static mode: always (options are always available)
- Runtime mode: only when `runtime.status === 'ready'`
- Does NOT apply during loading/idle/error states

### 3. Conditional Availability

**Location:** `libs/dashforge/ui/src/components/Select/Select.tsx:293-298`

**Logic:**
```typescript
const availableValues =
  !optionsFromFieldData || runtime?.status === 'ready'
    ? normalizedOptions.map((opt) => opt.value)
    : undefined;
```

**Rationale:**
- Static mode (`!optionsFromFieldData`): always sanitize
- Runtime mode (`optionsFromFieldData`): only sanitize when ready
- During loading: show raw value (acceptable - field is disabled)

---

## Changes Made

### Modified Files

#### 1. `libs/dashforge/ui/src/components/TextField/textField.types.ts`

**Change:** Added internal prop for Step 05b

```typescript
/**
 * @internal
 * Step 05b: Available values for display value sanitization (MUI warning suppression).
 * Passed from Select to TextField to createSelectIntegration.
 */
__selectAvailableValues?: (string | number)[];
```

**Impact:**
- New optional internal prop (not part of public API)
- Used only for Select integration
- Marked `@internal` to discourage external use

#### 2. `libs/dashforge/ui/src/components/TextField/TextField.tsx`

**Changes:** Extract and forward `__selectAvailableValues`

**Line ~57:** Extract from props
```typescript
const {
  // ... existing props
  __selectAvailableValues, // Step 05b
  ...restProps
} = props;
```

**Line ~146:** Pass to createSelectIntegration
```typescript
const selectIntegrationProps = createSelectIntegration({
  bridge,
  name,
  onChange,
  onBlur,
  disabled,
  label,
  availableValues: __selectAvailableValues, // Step 05b
});
```

**Impact:**
- No behavioral change for non-Select TextFields
- Only affects Select integration

#### 3. `libs/dashforge/ui/src/components/TextField/textField.select.ts`

**Changes:** Added display value sanitization

**Function signature update:**
```typescript
export function createSelectIntegration({
  bridge,
  name,
  onChange,
  onBlur,
  disabled,
  label,
  availableValues, // Step 05b: optional available values for sanitization
}: {
  bridge: DashFormBridge | undefined;
  name: string;
  onChange?: (event: unknown) => void;
  onBlur?: (event: unknown) => void;
  disabled?: boolean;
  label?: string;
  availableValues?: (string | number)[]; // Step 05b
})
```

**Sanitization logic (lines ~65-89):**
```typescript
// Step 05b: Sanitize display value to prevent MUI "out-of-range" warnings
// When RHF value doesn't exist in available options → display empty string
// RHF value remains unchanged (policy: no automatic reset/reconciliation)
const displayValue =
  availableValues !== undefined &&
  rawValue !== '' &&
  rawValue != null &&
  !availableValues.includes(rawValue as string | number)
    ? '' // Unresolved: display as empty (MUI-safe)
    : rawValue; // Resolved or no validation: pass through

return {
  select: true,
  value: displayValue, // ← Sanitized for MUI
  // ... other props
};
```

**Impact:**
- Display value differs from RHF value when unresolved
- MUI warnings eliminated
- RHF value unchanged

#### 4. `libs/dashforge/ui/src/components/Select/Select.tsx`

**Changes:** Extract available values, pass to TextField

**Line ~293-298:** Conditional extraction
```typescript
// Extract available values for display value sanitization (Step 05b)
// Static mode: always sanitize
// Runtime mode: only sanitize when ready (not during loading/idle/error)
const availableValues =
  !optionsFromFieldData || runtime?.status === 'ready'
    ? normalizedOptions.map((opt) => opt.value)
    : undefined;
```

**Line ~369:** Pass to TextField
```typescript
<TextField
  {...textFieldProps}
  __selectAvailableValues={availableValues} // Step 05b
  // ... other props
/>
```

**Impact:**
- Select extracts available values from normalized options
- Only passes when appropriate (static mode or runtime ready)
- No impact on loading/error states

### Created Files

#### 1. `libs/dashforge/ui/src/components/Select/Select.unresolved-display.test.tsx`

**Purpose:** Focused test suite for Step 05b behavior

**Coverage:**
- Static mode tests (3 tests)
  - Resolved value displays correctly
  - Unresolved value displays empty, RHF unchanged
  - Empty/null values display empty

- Runtime mode tests (5 tests)
  - Resolved value when ready
  - Unresolved value when ready (displays empty, RHF unchanged)
  - Loading state (no sanitization, field disabled)
  - Empty options with non-empty value (displays empty)

- Generic option shape tests (2 tests)
  - Numeric values work correctly
  - Unresolved numeric values display empty

- MUI warning suppression test (1 test)
  - Verifies no MUI warning emitted for unresolved values

**Total:** 11 tests, all passing ✅

**Line count:** 297 lines

### Modified Test Files

#### 1. `libs/dashforge/ui/src/components/Select/Select.runtime.test.tsx`

**Changes:** Updated test assertions to match Step 05b behavior

**Line 414-419:** Updated "should display empty selection" test
```typescript
// OLD: expect(hiddenInput?.value).toBe('unknown-city');
// NEW: expect(hiddenInput?.value).toBe('');

// Display value should be empty (Step 05b: MUI warning suppression)
const hiddenInput = container.querySelector('input[name="city"]') as HTMLInputElement;
expect(hiddenInput?.value).toBe('');
```

**Line 498-508:** Updated "should display empty UI selection" test
```typescript
// OLD: expect(hiddenInput?.value).toBe('unknown');
// NEW: expect(hiddenInput?.value).toBe('');

// Display value should be empty (Step 05b: MUI warning suppression)
const hiddenInput = container.querySelector(
  'input[name="city"]'
) as HTMLInputElement;

expect(hiddenInput?.value).toBe('');
```

**Rationale:**
- Tests written during Step 05 expected old behavior (raw value in display)
- Test names already said "empty selection" - assertions were incorrect
- Updated to match Step 05b implementation

---

## Test Results

### Focused Test Suite (Step 05b)

**Command:** `npx nx run @dashforge/ui:test --testNamePattern="Select - Unresolved Value Display"`

**Result:** ✅ **11/11 tests passing**

```
✓ Select - Unresolved Value Display (Step 05b) (11 tests) 155ms
  ✓ Static mode (4 tests)
    ✓ resolved value displays correctly
    ✓ unresolved value displays empty, RHF value unchanged
    ✓ empty value displays empty
    ✓ null value displays empty
  ✓ Runtime mode (optionsFromFieldData) (5 tests)
    ✓ resolved value displays correctly when runtime ready
    ✓ unresolved value displays empty when runtime ready, RHF unchanged
    ✓ value displays as-is when runtime loading (no sanitization)
    ✓ empty options with non-empty value displays empty
  ✓ Generic option shape with mappers (2 tests)
    ✓ resolved numeric value displays correctly
    ✓ unresolved numeric value displays empty, RHF unchanged
  ✓ MUI warning suppression verification (1 test)
    ✓ does not emit MUI warning for unresolved value
```

### Full Test Suite

**Command:** `npx nx run @dashforge/ui:test`

**Result:** ✅ **250/251 tests passing**

```
Test Files: 16 passed (17)
Tests: 250 passed (251)

Note: 1 failed test in DateTimePicker (pre-existing, unrelated to Step 05b)
```

**Select-related tests:** All passing ✅
- `Select.unresolved-display.test.tsx` - 11/11 ✅
- `Select.runtime.test.tsx` - 23/23 ✅ (updated 2 assertions)
- `Select.unit.test.tsx` - 14/14 ✅
- `Select.characterization.test.tsx` - 4/4 ✅
- `Select.test.tsx` - 2/2 ✅

**Total Select tests:** 54/54 passing ✅

### TypeScript Validation

**Command:** `npx nx run @dashforge/ui:typecheck`

**Result:** ✅ **0 errors**

```
✓ Successfully ran target typecheck for project @dashforge/ui
```

---

## API Changes

### Internal API (Not Public)

**Added:**
- `TextFieldProps.__selectAvailableValues` - Internal prop for Select integration

**Modified:**
- `createSelectIntegration()` - Added optional `availableValues` parameter

**No public API changes** - All modifications are internal implementation details.

---

## Behavioral Changes

### 1. Display Value vs RHF Value

**Before Step 05b:**
- Display value = RHF value (always)
- MUI warning when value not in options

**After Step 05b:**
- Display value = empty string (when value unresolved)
- RHF value = unchanged
- No MUI warning

### 2. Static Mode

**Behavior:** Always sanitize display value

**Example:**
```typescript
// RHF value: "deleted-option"
// Available options: ["option-1", "option-2", "option-3"]
// Display value: "" (empty)
// User sees: No selection
// Form state: "deleted-option" (unchanged)
```

### 3. Runtime Mode (Ready)

**Behavior:** Sanitize when runtime.status === 'ready'

**Example:**
```typescript
// Runtime status: 'ready'
// RHF value: "unknown-city"
// Available options: ["nyc", "sf"]
// Display value: "" (empty)
// Dev warning: "Unresolved value for field..." (from Step 05)
```

### 4. Runtime Mode (Loading)

**Behavior:** Do NOT sanitize during loading

**Example:**
```typescript
// Runtime status: 'loading'
// RHF value: "some-value"
// Available options: [] (not loaded yet)
// Display value: "some-value" (unchanged)
// Field: disabled (user cannot interact)
```

**Rationale:**
- Field is disabled during loading anyway
- MUI warning acceptable (field not interactive)
- Avoid premature sanitization

---

## Known Limitations

### 1. MUI Warning During Loading

**Issue:** MUI warning appears when `runtime.status === 'loading'` and value is non-empty

**Example:**
```
MUI: You have provided an out-of-range value `some-value` for the select (name="item") component.
The available values are "".
```

**Rationale:**
- Field is disabled during loading
- User cannot interact with field
- Sanitizing during loading would be premature
- Warning is acceptable in this state

**Test coverage:** Confirmed in `Select.unresolved-display.test.tsx:154`

### 2. Undefined Values in Static Mode

**Issue:** MUI warning for `undefined` values in plain mode (outside DashFormContext)

**Example:**
```
MUI: You have provided an out-of-range value `undefined` for the select (name="country") component.
```

**Scope:** Pre-existing issue, not introduced by Step 05b

**Impact:** Plain mode only (no bridge/form integration)

---

## Verification Checklist

✅ **Policy Compliance**
- [x] RHF value unchanged
- [x] UI displays empty for unresolved values
- [x] No automatic reconciliation
- [x] No UI error messaging
- [x] Dev warnings only (Step 05)

✅ **Implementation Quality**
- [x] TypeScript: 0 errors
- [x] Tests: 250/251 passing (1 unrelated failure)
- [x] No console.log
- [x] No unsafe casts (`any`, `as never`)
- [x] No cascading type assertions

✅ **Test Coverage**
- [x] Static mode coverage
- [x] Runtime mode coverage
- [x] Loading state coverage
- [x] Numeric value coverage
- [x] MUI warning suppression verified

✅ **Backward Compatibility**
- [x] No public API changes
- [x] Existing tests updated (2 assertions)
- [x] No behavioral regressions

---

## Conclusion

**Step 05b successfully implemented and tested.**

All critical policy constraints met:
- RHF value preservation ✅
- Display-layer sanitization ✅
- MUI warning suppression ✅
- No automatic reconciliation ✅

**Status:** Ready for merge 🚀
