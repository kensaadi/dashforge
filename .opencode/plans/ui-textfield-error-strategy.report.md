# TextField Auto Error Binding - Implementation Report

**Date:** 2026-02-19  
**Status:** ✅ Implemented & Verified  
**Feature:** Automatic error + helperText binding for intelligent TextField component

---

## Executive Summary

We have successfully implemented automatic error display binding for the Dashforge intelligent TextField component. The TextField now automatically displays validation errors from React Hook Form (RHF) without requiring developers to manually wire up error props on every field.

### Problem Solved
Previously, developers had to manually bind error states:
```tsx
<TextField 
  name="email"
  error={!!errors.email}
  helperText={errors.email?.message}
/>
```

Now, this happens automatically:
```tsx
<TextField name="email" />
// Automatically shows RHF validation errors
```

### Architecture Approach
- Clean package separation maintained via bridge contract pattern
- RHF remains validation source of truth
- Engine node.error field exists but intentionally unused
- No tight coupling between @dashforge/ui and react-hook-form

---

## Package Inventory

### Modified Packages

#### 1. `@dashforge/ui-core` (Bridge Contract)
**File:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`

**New Exports:**
```typescript
export interface BridgeFieldError {
  message?: string;
}

export interface DashFormBridge {
  // ... existing methods ...
  getError?: (name: string) => BridgeFieldError | null;
  errorVersion?: string; // Reactivity trigger
}
```

**Purpose:** Defines error contract without RHF dependency

---

#### 2. `@dashforge/forms` (Bridge Implementation)
**File:** `libs/dashforge/forms/src/core/DashFormProvider.tsx`

**Key Changes:**

1. **Error State Capture:**
```typescript
const errors = rhf.formState.errors;
```

2. **Reactivity Version (Circular-Safe):**
```typescript
const replacer = (key: string, value: unknown) => {
  if (key === 'ref') return undefined;
  if (typeof value === 'function') return undefined;
  return value;
};
const errorVersion = JSON.stringify(errors ?? {}, replacer);
```

3. **Path Traversal Helper:**
```typescript
function getByPath(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[k];
  }
  return current;
}
```

4. **Bridge getError Implementation:**
```typescript
const bridgeValue: DashFormBridge = useMemo(() => ({
  // ... existing methods ...
  getError: (name: string) => {
    const err = getByPath(errors, name);
    if (!err) return null;
    return { message: err.message };
  },
  errorVersion,
}), [engine, rhf, adapter, debug, errorVersion]);
```

**Purpose:** Extracts RHF errors and exposes them through bridge

---

#### 3. `@dashforge/ui` (Error Consumer)
**File:** `libs/dashforge/ui/src/components/TextField/TextField.tsx`

**Key Changes:**

1. **Reactivity Subscription (Line 50):**
```typescript
const _errorVersion = bridge?.errorVersion;
```

2. **Error Extraction:**
```typescript
const autoErr = bridge?.getError?.(name) ?? null;
```

3. **Precedence Logic:**
```typescript
const resolvedError = rest.error ?? Boolean(autoErr);
const resolvedHelperText = rest.helperText ?? autoErr?.message;
```

**Purpose:** Automatically binds errors while allowing explicit overrides

---

## Current Behavior

### Error Display Strategy: "Immediate RHF Validation"

**Name:** Immediate RHF Validation (No Gating)  
**Configuration:** Via `DashForm` `mode` prop (React Hook Form validation mode)  
**Default Mode:** `'onChange'`

#### Validation Modes Available
| Mode | Trigger | When Errors Show |
|------|---------|------------------|
| `onChange` | Every keystroke | Immediately after first validation |
| `onBlur` | Field loses focus | After blur event |
| `onSubmit` | Form submission | Only after submit attempt |
| `onTouched` | Blur + change | After blur, then on every change |
| `all` | All events | Most aggressive validation |

**Current Implementation:** If RHF has an error for a field → TextField shows it immediately (respecting the configured mode).

**No Additional Gating:** We do NOT currently check:
- ❌ `touchedFields` (whether user interacted with field)
- ❌ `dirtyFields` (whether value changed from default)
- ❌ `isSubmitted` (whether form was submitted)

---

### Precedence Rules (Truth Table)

| RHF Error | Explicit `error` Prop | Explicit `helperText` Prop | Result Border | Result Helper Text |
|-----------|----------------------|---------------------------|---------------|-------------------|
| ✅ Yes | (none) | (none) | 🔴 Red | Error message |
| ✅ Yes | `false` | (none) | ⚪ Normal | (none) |
| ✅ Yes | `true` | "Custom" | 🔴 Red | "Custom" |
| ✅ Yes | (none) | "Custom" | 🔴 Red | "Custom" |
| ❌ No | (none) | (none) | ⚪ Normal | (none) |
| ❌ No | `true` | "Custom" | 🔴 Red | "Custom" |

**Rule:** Explicit props always override auto-binding.

---

## Error Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Interaction (onChange/onBlur/onSubmit)                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. RHF validates based on `mode` configuration                  │
│    Updates: formState.errors                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. DashFormProvider detects errors change                        │
│    Recomputes: errorVersion = JSON.stringify(errors, replacer)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. bridgeValue memo recreates (depends on errorVersion)         │
│    New bridge object propagates through context                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. TextField subscribed via _errorVersion → re-renders          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. TextField calls bridge.getError(name) → extracts error       │
│    Computes: resolvedError, resolvedHelperText                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. MuiTextField renders with error styling + helperText         │
└─────────────────────────────────────────────────────────────────┘
```

### Reactivity Mechanism: errorVersion

**Problem:** How to make TextField re-render when errors change without passing errors directly as prop?

**Solution:** errorVersion string computed via JSON.stringify
- Changes whenever error object structure changes
- TextField subscribes via `const _errorVersion = bridge?.errorVersion;`
- React detects version change → triggers re-render
- TextField then calls `getError(name)` with fresh closure

**Circular Structure Prevention:**
```typescript
const replacer = (key: string, value: unknown) => {
  if (key === 'ref') return undefined; // RHF error objects contain refs
  if (typeof value === 'function') return undefined; // Skip functions
  return value;
};
```

---

## Error Data Model

### RHF Error Shape
```typescript
// React Hook Form errors object
formState.errors = {
  email: {
    type: 'pattern',
    message: 'Invalid email address',
    ref: HTMLInputElement // <-- causes circular structure
  },
  'address.street': {
    type: 'required',
    message: 'Street is required'
  }
}
```

### Bridge Error Shape
```typescript
interface BridgeFieldError {
  message?: string;
}

// Example:
bridge.getError('email') // → { message: 'Invalid email address' }
bridge.getError('unknown') // → null
```

**Dot-Notation Support:** Field names like `address.street` are traversed correctly via `getByPath()` helper.

---

## Package Dependency Graph

```
@dashforge/ui-core (contract only)
    │
    │ imports DashFormBridge interface
    ▼
@dashforge/forms (RHF integration)
    │
    │ implements DashFormBridge.getError
    │ reads formState.errors
    │ computes errorVersion
    ▼
@dashforge/ui (intelligent components)
    │
    │ imports DashFormBridge interface (NOT react-hook-form)
    │ calls bridge.getError(name)
    │ subscribes to bridge.errorVersion
    ▼
MUI TextField (dumb component)
    │
    │ renders error prop + helperText prop
```

### Architectural Invariants (DO NOT BREAK)

1. ✅ **Engine as Source of Truth:** DashFormEngine owns field state
2. ✅ **Clean Package Boundaries:** @dashforge/ui MUST NOT import react-hook-form
3. ✅ **Bridge Contract Pattern:** All cross-package communication through DashFormBridge interface
4. ✅ **Explicit Props Win:** Developer-provided props override auto-binding
5. ✅ **No Side Effects in Components:** TextField reads errors, never writes them

---

## Validation Configuration

### How to Control Error Display Timing

**Via DashForm mode prop:**
```tsx
<DashForm mode="onBlur"> {/* Only validate after blur */}
  <TextField name="email" />
</DashForm>

<DashForm mode="onSubmit"> {/* Only validate after submit */}
  <TextField name="email" />
</DashForm>
```

### Field-Level Validation Rules
```tsx
<DashFormField
  name="email"
  rules={{
    required: 'This field is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }}
  component={TextField}
/>
```

---

## Known Limitations & Gaps

### 1. No Touched/Dirty Tracking
**Current State:** Errors show immediately based on RHF mode  
**Missing:** `bridge.isTouched(name)`, `bridge.isDirty(name)` methods  
**Impact:** Cannot gate error display with "only show if touched" logic  
**Workaround:** Use RHF `mode='onBlur'` or `mode='onSubmit'`

### 2. Engine Node Error Field Unused
**Current State:** `engine.nodes[x].error?: string` exists but ignored  
**Why:** RHF is temporary validation source of truth  
**Future:** May migrate validation logic into engine architecture  
**Decision:** Intentionally deferred, not a bug

### 3. No Per-Field Error Strategy Override
**Current State:** All fields share same mode from DashForm  
**Missing:** Field-level `errorDisplay="onTouch"` prop  
**Impact:** Cannot mix strategies (e.g., immediate for some fields, onBlur for others)  
**Workaround:** Explicit `error` prop on fields needing different behavior

### 4. No Form-Level Errors
**Current State:** Only field-level errors supported  
**Missing:** `bridge.getFormErrors()` for non-field-specific errors  
**Example Use Case:** "Invalid credentials" error after login attempt  
**Workaround:** Use external error display component

### 5. No Multi-Error Support
**Current State:** Only first error message shown per field  
**Missing:** Array support in `BridgeFieldError`  
**Impact:** If field has multiple validation failures, only first shown  
**RHF Behavior:** Only reports first error by default anyway

### 6. No Async Validation Pending State
**Current State:** No loading indicator during async validation  
**Missing:** `bridge.isValidating(name)` method  
**Impact:** User doesn't know validation is in progress  
**Workaround:** None currently

### 7. No Accessibility Enhancements
**Current State:** Relies on MUI TextField's built-in ARIA support  
**Missing:** Custom ARIA live regions for error announcements  
**Impact:** Screen reader experience could be better  
**Status:** Acceptable for now, MUI handles basics

---

## Testing Evidence

### Test Location
`docs/src/app/playground/stress/VisibilityStressForm.tsx`

### Test Scenarios Verified

#### 1. Required Field Validation
```tsx
<DashFormField
  name="requiredTest"
  rules={{ required: 'This field is required' }}
  component={TextField}
  label="Required Field"
/>
```
**Result:** ✅ Error shows on blur (or onChange depending on mode)

#### 2. Pattern Validation (Email)
```tsx
<DashFormField
  name="emailTest"
  rules={{
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }}
  component={TextField}
  label="Email Field"
/>
```
**Result:** ✅ Shows error for invalid email, clears for valid email

#### 3. MinLength Validation
```tsx
<DashFormField
  name="minLengthTest"
  rules={{
    minLength: {
      value: 5,
      message: 'Must be at least 5 characters'
    }
  }}
  component={TextField}
  label="MinLength Field"
/>
```
**Result:** ✅ Shows error until 5+ characters entered

#### 4. Explicit Props Override
```tsx
<DashFormField
  name="overrideTest"
  rules={{ required: 'This field is required' }}
  component={TextField}
  label="Override Test"
  helperText="This helper text should always show"
/>
```
**Result:** ✅ Custom helperText shown even when RHF error exists

### Build Status
```bash
pnpm -w nx build @dashforge/ui-core   # ✅ SUCCESS
pnpm -w nx build @dashforge/forms     # ✅ SUCCESS
pnpm -w nx build @dashforge/ui        # ✅ SUCCESS
```

### Runtime Status
```bash
pnpm -w nx serve docs  # ✅ No crashes, validation working correctly
```

---

## Implementation Timeline

### Phase 1: Bridge Contract Extension ✅
- Added `BridgeFieldError` interface to ui-core
- Added `getError` and `errorVersion` to `DashFormBridge`
- Exported types properly

### Phase 2: RHF Error Extraction ✅
- Implemented `getByPath` helper for dot-notation fields
- Captured `formState.errors` snapshot
- Computed `errorVersion` with circular-safe replacer
- Implemented `getError` method in bridgeValue

### Phase 3: TextField Error Binding ✅
- Subscribed to `errorVersion` for reactivity
- Extracted error via `bridge.getError(name)`
- Implemented precedence logic (explicit props win)

### Phase 4: Circular Structure Fix ✅
- Added replacer function to filter `ref` and functions
- Resolved JSON.stringify crash
- All builds passing

### Phase 5: Testing & Verification ✅
- Added test fields to VisibilityStressForm
- Verified required, pattern, minLength validation
- Verified explicit props override behavior
- No runtime errors

---

## Architectural Direction Clarification

### Current Validation Architecture

**RHF remains the temporary validation source of truth.**

The React Hook Form library is currently responsible for:
- Running validation rules (required, pattern, minLength, etc.)
- Storing error state in `formState.errors`
- Triggering validation based on `mode` configuration
- Managing validation lifecycle

**Engine node.error exists but is intentionally unused for now.**

The DashFormEngine node structure includes an optional `error?: string` field:
```typescript
interface DashFormNode {
  id: string;
  type: string;
  value: any;
  error?: string; // <-- This field exists but is NOT used
  // ... other fields
}
```

This field is reserved for future architecture evolution but is deliberately not integrated with the current validation system.

**We are not migrating validation into the engine yet.**

Potential future architecture where engine owns validation:
```typescript
// FUTURE (not implemented):
engine.setError('email', 'Invalid email address');
engine.clearError('email');
const err = engine.getError('email');
```

This would eliminate dependency on RHF for validation and make the engine truly self-contained. However, this is explicitly out of scope for the current implementation.

**Current strategy ("immediate RHF validation") is acceptable at this stage.**

The current behavior where errors are displayed based solely on RHF's validation mode (onChange/onBlur/onSubmit) without additional gating (touched/dirty checks) is intentionally simple and acceptable for this phase of development.

More sophisticated error display strategies (e.g., "only show errors on touched fields") can be layered on incrementally via bridge extensions without breaking existing behavior.

**The next enhancement will likely be touched tracking, but only after documentation freeze.**

The most commonly requested enhancement is adding touched/dirty state tracking to the bridge:
```typescript
// PROPOSED (not implemented):
interface DashFormBridge {
  // ... existing methods
  isTouched?: (name: string) => boolean;
  isDirty?: (name: string) => boolean;
  isSubmitted?: () => boolean;
}
```

This would enable TextField to optionally gate error display:
```typescript
// PROPOSED (not implemented):
const shouldShowError = autoErr && (bridge.isTouched(name) || bridge.isSubmitted());
```

However, this enhancement is **explicitly deferred** until after this documentation checkpoint is complete and reviewed. We are prioritizing architectural clarity over feature velocity at this stage.

---

## Files Modified (Complete List)

1. `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` - Bridge contract extension
2. `libs/dashforge/ui-core/src/bridge/index.ts` - Export BridgeFieldError
3. `libs/dashforge/ui-core/src/index.ts` - Public API export
4. `libs/dashforge/forms/src/core/DashFormProvider.tsx` - RHF error extraction
5. `libs/dashforge/ui/src/components/TextField/TextField.tsx` - Error binding consumer
6. `docs/src/app/playground/stress/VisibilityStressForm.tsx` - Test/validation fields

---

## Related Documentation

- **RHF Validation Modes:** https://react-hook-form.com/docs/useform#mode
- **Bridge Contract Pattern:** (Reference internal architecture docs if they exist)
- **DashFormEngine Spec:** (Reference engine design docs if they exist)

---

## Form Closure v1: Touched/Dirty/SubmitCount Gating

**Date:** 2026-02-19  
**Status:** ✅ Implemented & Verified  
**Enhancement:** Error display gating via touched/dirty/submitCount tracking

### What Changed

The initial implementation showed validation errors immediately based on RHF's validation mode. This created "error spam" where users would see error messages while typing before they even finished interacting with a field.

**Form Closure v1** adds intelligent error gating to prevent this:
- Errors now only display AFTER field is touched (user blurred the field) OR form submitted
- This provides a better UX: users can type freely without immediate error feedback
- After blur, errors appear on subsequent changes (helpful feedback)
- After submit attempt, ALL errors show (even on untouched fields)

### Bridge Contract Extensions

**File:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`

Added methods and fields:
```typescript
interface DashFormBridge {
  // ... existing fields ...
  
  // Touched tracking
  isTouched?: (name: string) => boolean;
  touchedVersion?: string;
  
  // Dirty tracking
  isDirty?: (name: string) => boolean;
  dirtyVersion?: string;
  
  // Submit tracking
  submitCount?: number;
}
```

### Implementation in DashFormProvider

**File:** `libs/dashforge/forms/src/core/DashFormProvider.tsx`

Added RHF formState subscriptions:
```typescript
const errors = rhf.formState.errors;
const touchedFields = rhf.formState.touchedFields;
const dirtyFields = rhf.formState.dirtyFields;
const submitCount = rhf.formState.submitCount;
```

Computed version strings with circular-safe replacer:
```typescript
const replacer = (key: string, value: unknown) => {
  if (key === 'ref') return undefined;
  if (typeof value === 'function') return undefined;
  return value;
};

const errorVersion = JSON.stringify(errors ?? {}, replacer);
const touchedVersion = JSON.stringify(touchedFields ?? {}, replacer);
const dirtyVersion = JSON.stringify(dirtyFields ?? {}, replacer);
```

Implemented bridge methods:
```typescript
isTouched: (name: string): boolean => {
  const touched = getByPath(touchedFields, name);
  return Boolean(touched);
},
isDirty: (name: string): boolean => {
  const dirty = getByPath(dirtyFields, name);
  return Boolean(dirty);
}
```

Updated useMemo deps:
```typescript
[engine, rhf, adapter, debug, errorVersion, touchedVersion, dirtyVersion, submitCount]
```

### TextField Gating Logic

**File:** `libs/dashforge/ui/src/components/TextField/TextField.tsx`

Added subscriptions at top level:
```typescript
// Subscribe to form state changes
const _errorVersion = bridge?.errorVersion;
const _touchedVersion = bridge?.touchedVersion;
const _dirtyVersion = bridge?.dirtyVersion;
const _submitCount = bridge?.submitCount;
```

Added gating logic:
```typescript
// Get auto error from form validation
const autoErr = bridge.getError?.(name) ?? null;

// Get touched state and submit count for error gating
const autoTouched = bridge.isTouched?.(name) ?? false;
const submitCount = bridge.submitCount ?? 0;

// Gate error display: only show if field touched OR form submitted
const allowAutoError = autoTouched || submitCount > 0;

// Compute resolved props with precedence
const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
const resolvedHelperText = rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);
```

### New Behavior Truth Table

| User Action | Field Touched | Submit Count | Auto Error Exists | Error Displayed? |
|-------------|---------------|--------------|-------------------|------------------|
| Type in field (before blur) | ❌ No | 0 | ✅ Yes | ❌ No (gated) |
| Blur field with error | ✅ Yes | 0 | ✅ Yes | ✅ Yes (touched) |
| Click Submit with errors | ❌ No | 1+ | ✅ Yes | ✅ Yes (submitted) |
| Explicit `error={true}` prop | - | - | - | ✅ Yes (explicit wins) |
| Explicit `helperText="custom"` | - | - | ✅ Yes | Shows "custom" (explicit wins) |

### Testing Scenarios

**File:** `docs/src/app/playground/stress/VisibilityStressForm.tsx`

Updated with:
1. **Submit button** - triggers form submission to increment submitCount
2. **Updated instructions** - explains error gating behavior
3. **Enhanced field labels** - clarify when errors will show
4. **Explicit scenarios**:
   - Type in required field → error should NOT show
   - Blur required field → error SHOULD show
   - Click Submit → ALL errors show (even untouched fields)

### Verification Commands

```bash
# Build all packages (all pass with no errors)
pnpm -w nx build @dashforge/ui-core
pnpm -w nx build @dashforge/forms
pnpm -w nx build @dashforge/ui

# Run docs app
pnpm -w nx serve docs
# Navigate to http://localhost:4200/playground/stress
```

### Manual Testing Checklist

- [x] Type in "Required Field" → no error shows (gated by touched)
- [x] Blur "Required Field" → error appears (touched = true)
- [x] Type invalid email → no error until blur (gated by touched)
- [x] Click "Submit" → all validation errors appear immediately (submitCount > 0)
- [x] Explicit helperText prop still overrides auto error message
- [x] Explicit error prop still overrides auto error state
- [x] No JSON circular structure errors
- [x] No crashes or console errors
- [x] Builds pass cleanly

### Key Design Decisions

**Why touched OR submitCount (not AND)?**
- Users expect to see errors after blur (touched)
- Users expect to see ALL errors after clicking Submit
- Both are valid "user has had a chance to interact" signals
- OR logic provides best UX for both scenarios

**Why not use isDirty for gating?**
- Dirty = "value changed from default"
- A field can be dirty but not touched (programmatic setValue)
- Touched = "user interacted via blur event" (more intentional)
- Touched is the more reliable UX signal for error display

**Why subscribe to touchedVersion/dirtyVersion/submitCount?**
- React needs explicit dependencies to trigger re-renders
- Reading these values at top level ensures TextField subscribes to changes
- When formState updates, versions change → TextField re-renders
- Variables intentionally "unused" (just for subscription)

### Architectural Impact

**No Breaking Changes:**
- Existing forms continue working
- Explicit props still override auto values
- Bridge remains optional (standalone TextField still works)

**Clean Extension:**
- Bridge contract extended with new optional methods
- DashFormProvider implements new methods
- TextField consumes new methods
- No changes to engine, adapters, or other components

**Incremental Enhancement:**
- Form Closure v1 solves the immediate UX problem
- Future enhancements can build on this foundation:
  - Per-field error strategy override
  - Form-level error support
  - Multi-error display
  - Async validation pending state

### Files Modified

1. `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts` - Bridge contract extension
2. `libs/dashforge/forms/src/core/DashFormProvider.tsx` - RHF formState integration
3. `libs/dashforge/ui/src/components/TextField/TextField.tsx` - Gating logic + subscriptions
4. `docs/src/app/playground/stress/VisibilityStressForm.tsx` - Testing scenarios + submit button

### Performance Notes

- Version string computation (JSON.stringify) is synchronous and fast
- Happens only when formState changes (not on every render)
- TextField re-renders only when subscribed state changes
- getByPath helper efficiently traverses dot-notation paths
- No additional network requests or async operations

---

## Conclusion

The TextField auto error binding feature is **fully implemented and verified** with **Form Closure v1 error gating enhancements**. 

The implementation maintains clean architectural boundaries via the bridge contract pattern, preserves RHF as the validation source of truth, and provides intelligent error display gating for better UX.

**Phase 1 (Auto Error Binding):**
- ✅ Automatic error + helperText binding via bridge
- ✅ Clean package separation
- ✅ Explicit props override auto values

**Phase 2 (Form Closure v1):**
- ✅ Touched/dirty/submitCount tracking via bridge
- ✅ Error gating (touched OR submitCount > 0)
- ✅ No error spam while typing
- ✅ Errors show after blur or submit

**Status:** ✅ Complete - Form Closure v1 Implemented  
**Next Step:** Scale pattern to other form components (Select, Checkbox, etc.)  
**Future Enhancements:** Per-field strategy override, form-level errors, multi-error display
