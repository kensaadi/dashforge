# Autocomplete Architecture Review - Build Report

**Date:** 2026-03-27  
**Phase:** Phase 1 Implementation (Generic Option Support)  
**Status:** 🔴 **BLOCKED** - Input display issue

---

## Executive Summary

Phase 1 implementation is **80% complete** but blocked by a critical rendering issue. The normalization pipeline, generic types, and mapper functions are fully implemented and passing typecheck. However, MUI Autocomplete is displaying `[object Object]` in the input field instead of option labels, causing 7 test failures.

**Metrics:**

- ✅ Typecheck: **PASS** (0 errors)
- 🔴 Tests: **26 passing, 7 failing** (79% pass rate)
- 📊 Test Coverage: 33 tests total (target: 33 for Phase 1)

---

## Completed Work

### 1. Type System & Interfaces ✅

**NormalizedOption Interface** (Internal)

```typescript
interface NormalizedOption<TValue extends string | number> {
  value: TValue;
  label: string;
  disabled: boolean;
  raw: unknown; // Original option for renderOption customization
}
```

**Generic Component Signature**

```typescript
export function Autocomplete<
  TValue extends string | number = string,
  TOption = AutocompleteOption
>(props: AutocompleteProps<TValue, TOption>);
```

**AutocompleteProps Interface**

```typescript
export interface AutocompleteProps<
  TValue extends string | number = string,
  TOption = AutocompleteOption
> {
  // Core props
  name: string;
  options: TOption[];

  // Mapper functions
  getOptionValue?: (option: TOption) => TValue;
  getOptionLabel?: (option: TOption) => string;
  getOptionDisabled?: (option: TOption) => boolean;

  // Form integration
  value?: TValue | null;
  onChange?: (value: TValue | null) => void;

  // ... other props
}
```

### 2. Default Mappers ✅

Implemented with the approved correction:

```typescript
const defaultGetValue = (opt: TOption): TValue => {
  // For backward compatibility: if opt has a 'value' property, use it
  if (opt && typeof opt === 'object' && 'value' in opt) {
    return (opt as any).value as TValue;
  }
  // Otherwise treat opt itself as TValue (for primitive arrays)
  return opt as unknown as TValue;
};

const defaultGetLabel = (opt: TOption): string => String(opt ?? ''); // ✅ CORRECTED

const defaultGetDisabled = (_opt: TOption): boolean => false;
```

### 3. Normalization Pipeline ✅

Implemented with map → filter pattern and `useMemo` for stable references:

```typescript
const normalizedOptions: NormalizedOption<TValue>[] = useMemo(
  () =>
    options
      .map((opt): NormalizedOption<TValue> | null => {
        if (opt == null) return null;
        try {
          return {
            value: actualGetValue(opt),
            label: actualGetLabel(opt),
            disabled: actualGetDisabled(opt),
            raw: opt,
          };
        } catch {
          return null;
        }
      })
      .filter((opt): opt is NormalizedOption<TValue> => opt !== null),
  [options, actualGetValue, actualGetLabel, actualGetDisabled]
);
```

### 4. MUI Integration ✅ (Partial)

Updated both bound mode and plain mode to use normalized options:

```typescript
<MuiAutocomplete<NormalizedOption<TValue>, false, false, true>
  {...(rest as any)}
  freeSolo
  value={valueForAutocomplete}
  options={normalizedOptions}
  getOptionKey={(option) => String(option.value)}
  getOptionLabel={(option: NormalizedOption<TValue> | string) => {
    if (typeof option === 'string') return option;
    return option.label;
  }}
  renderOption={(props, option) => {
    const key = String(option.value);
    return (
      <li {...props} key={key}>
        {option.label}
      </li>
    );
  }}
  isOptionEqualToValue={(option, value) => option.value === value.value}
  getOptionDisabled={(option) => option.disabled}
  // ... handlers
/>
```

### 5. Test Suite ✅

**Intent E: Generic option support (10 new tests)**

All tests written following TDD approach:

1. ✅ accepts generic options with custom mappers (plain mode)
2. ✅ displays custom label for selected generic option
3. ✅ onChange receives mapped value (number type)
4. 🔴 disabled options are not selectable
5. ✅ filters out null/undefined options during normalization
6. ✅ uses default label mapper (String coercion)
7. ✅ uses default value mapper (identity)
8. ✅ binds to bridge value with generic type (bound mode)
9. ✅ updates bridge value with mapped generic value
10. 🔴 handles unresolved numeric value as null

**Existing Tests Status:**

- Intent A (Plain mode): 5/7 passing
- Intent B (Bound mode): 7/9 passing
- Intent C (Error gating): 5/5 passing ✅
- Intent D (Visibility): 2/2 passing ✅
- Intent E (Generic support): 8/10 passing

---

## Blocking Issue 🔴

### Problem: Input Display Shows `[object Object]`

**Symptoms:**

- Input field displays `[object Object]` instead of option labels
- Dropdown correctly shows labels (via `renderOption`)
- Tests expect input to show "Canada" but see "[object Object]"

**Failing Tests:**

1. Plain mode: selecting an option calls onChange with option.value
2. Plain mode: clearing sets value to null
3. Bound mode: registers and binds to bridge value
4. Bound mode: selecting option updates bridge value
5. Bound mode: explicit value prop overrides bridge value
6. Intent E: disabled options are not selectable (aria-disabled assertion)
7. Intent E: handles unresolved numeric value as null

**Example Failure:**

```
Expected: "Canada"
Received: "[object Object]"

// Test code
const input = screen.getByLabelText('Country') as HTMLInputElement;
expect(input.value).toBe('Canada'); // FAIL
```

### Investigation Attempts

**Attempt 1: Control `inputValue` prop**

- Result: Broke freeSolo typing behavior (9 failures instead of 7)
- Reason: MUI needs to manage inputValue internally for freeSolo mode

**Attempt 2: Custom `renderOption`**

- Result: Dropdown shows labels correctly, input still broken
- Reason: renderOption only affects dropdown, not input field

**Attempt 3: Add `getOptionKey` for stable keys**

- Result: Fixed React key warnings, but input still broken
- Reason: Keys don't affect input display logic

**Attempt 4: Change MUI type signature**

- From: `<NormalizedOption<TValue> | TValue, false, false, true>`
- To: `<NormalizedOption<TValue>, false, false, true>`
- Result: No change, input still broken

**Attempt 5: Move `{...rest}` before explicit props**

- Ensure our `getOptionLabel` isn't overridden by passthrough props
- Result: No change, input still broken

### Root Cause Theory

When we normalize options, we create NEW objects with `useMemo`. When we find a matching option using `.find()` and pass it to MUI's `value` prop:

```typescript
const matchingOption =
  normalizedOptions.find((opt) => opt.value === resolvedValue) || null;
const valueForAutocomplete: NormalizedOption<TValue> | null = matchingOption;
```

MUI should call `getOptionLabel(matchingOption)` to display the label in the input field, but instead it appears to be calling `toString()` on the object, resulting in `[object Object]`.

**Possible causes:**

1. MUI freeSolo mode expects `value` to be a primitive or null, not an object
2. MUI's internal logic isn't recognizing our normalized options as valid options
3. The TextField's input value is being set directly from the object reference
4. MUI version compatibility issue with our approach

---

## Technical Decisions

### 1. Keep `raw` Field in NormalizedOption ✅

**Decision:** Include `raw: unknown` field for future extensibility  
**Rationale:** Enables custom `renderOption` implementations and metadata display  
**Status:** Implemented

### 2. Default Label Mapper Correction ✅

**Decision:** Use `String(option ?? '')` instead of `''`  
**Rationale:** Handles null/undefined gracefully while coercing values to strings  
**Status:** Implemented

### 3. Use `useMemo` for Stable References ✅

**Decision:** Wrap normalization in `useMemo` with proper dependencies  
**Rationale:** Ensures normalized option objects maintain reference equality across renders  
**Status:** Implemented

### 4. MUI Type Signature

**Decision:** `<NormalizedOption<TValue>, false, false, true>`  
**Rationale:** Options are always `NormalizedOption[]`, freeSolo allows string values  
**Status:** Implemented but may need revision

---

## Files Modified

### Implementation Files

- `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx` (527 lines)
  - Added NormalizedOption interface
  - Added generic type parameters
  - Added mapper props
  - Implemented normalization pipeline
  - Updated MUI integration

### Test Files

- `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.unit.test.tsx` (690 lines)
  - Added Intent E tests (10 tests)
  - Total: 33 tests (26 passing, 7 failing)

---

## Next Steps (Blocked)

### Immediate: Fix Input Display Issue

**Option A: Debug MUI Integration**

1. Add logging to `renderInput` params
2. Check if `params.inputProps.value` is set correctly
3. Investigate MUI internals for freeSolo + object options
4. Consider explicit `inputValue` control with `onInputChange` synchronization

**Option B: Alternative Architecture**

1. Keep original options (don't normalize)
2. Create runtime lookup map: `Map<TValue, {label, disabled}>`
3. Use original options in MUI, apply transformations on demand
4. Trade memory for compatibility

**Option C: Hybrid Approach**

1. Normalize only for MUI's `options` prop
2. Pass `inputValue` explicitly for display
3. Maintain separate value state for form integration

### After Fix: Continue Phase 1

- [ ] Fix 7 failing tests
- [ ] Verify all 23 original tests still pass
- [ ] Run full test suite
- [ ] Document the solution
- [ ] Move to Phase 2 (Runtime Integration)

---

## Phase 1 Acceptance Criteria

| Criterion                                   | Status             |
| ------------------------------------------- | ------------------ |
| Typecheck passes                            | ✅ PASS            |
| All tests pass                              | 🔴 **26/33** (79%) |
| No skipped tests                            | ✅ PASS            |
| No console.log                              | ✅ PASS            |
| No unsafe casts in public boundaries        | ✅ PASS            |
| Generic types work with custom options      | ✅ PASS            |
| Mapper functions implemented                | ✅ PASS            |
| Default mappers use correction              | ✅ PASS            |
| Backward compatible with AutocompleteOption | 🔴 **BLOCKED**     |

---

## Recommendations

### Immediate Action Required

The blocking issue must be resolved before proceeding to Phase 2. Recommended approach:

1. **Research MUI Autocomplete freeSolo behavior** with object options
2. **Add detailed logging** to understand what MUI receives
3. **Consult MUI documentation** for freeSolo + object value patterns
4. **Consider simplified test case** to isolate the issue

### If Issue Persists

If the normalization approach proves incompatible with MUI:

1. **Revert to alternative architecture** (Option B above)
2. **Document MUI limitations** with normalized options
3. **Update architectural plan** with lessons learned
4. **Implement runtime transformation** instead of normalization

---

## Conclusion

Phase 1 implementation is **technically complete** but **functionally blocked**. The normalization pipeline, type system, and mapper functions are correctly implemented and passing typecheck. However, a critical integration issue with MUI Autocomplete's input display prevents the feature from working correctly.

**Recommendation:** PAUSE Phase 2 implementation until the input display issue is resolved. This is a foundational issue that will affect all subsequent work.

**Estimated Time to Resolve:** 2-4 hours (debugging) or 4-6 hours (alternative architecture)

---

**Report Generated:** 2026-03-27  
**Build Artifacts:**

- Source: `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx`
- Tests: `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.unit.test.tsx`
- Test Results: 26/33 passing (79%)
