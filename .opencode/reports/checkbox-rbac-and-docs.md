# Checkbox RBAC Implementation Report

**Date**: 2026-04-05  
**Component**: Checkbox  
**Status**: ✅ Complete

---

## Summary

Implemented RBAC (Role-Based Access Control) support for the Checkbox component, following the established pattern from TextField, Autocomplete, and Select. Added comprehensive documentation with 4 examples demonstrating all RBAC behaviors.

---

## Changes Made

### 1. Component Implementation (`libs/dashforge/ui/src/components/Checkbox/Checkbox.tsx`)

**Imports Added**:

- `AccessRequirement` type from `@dashforge/rbac`
- `useAccessState` hook from `../../hooks/useAccessState`

**Props Interface**:

- Added `access?: AccessRequirement` prop with JSDoc documentation
- JSDoc explicitly documents that `readonly` falls back to `disabled` (checkboxes lack native readonly semantics)

**Hook Integration**:

- Added `useAccessState(access)` call at top level (after other hooks, before early returns)
- Called unconditionally following React rules

**Visibility Logic**:

- Added early return for `!accessState.visible` (after existing `visibleWhen` check)
- Returns `null` when RBAC denies visibility

**Disabled State Logic**:

- Computed `effectiveDisabled` using OR logic:
  ```typescript
  const effectiveDisabled =
    Boolean(rest.disabled) || accessState.disabled || accessState.readonly;
  ```
- **Note**: `accessState.readonly` is included in disabled calculation because HTML checkboxes do not support true readonly semantics

**Application**:

- Applied `effectiveDisabled` to **bridge mode** MuiCheckbox (line 187)
- Applied `effectiveDisabled` to **plain mode** MuiCheckbox (line 218)
- Both render paths correctly implement RBAC

---

### 2. Documentation (`web/src/pages/Docs/components/checkbox/CheckboxDocs.tsx`)

**Section Added**: "Access Control (RBAC)"

- Placed after "Capabilities" section
- Placed before "Form Integration" section
- Section ID: `access-control`

**Examples Included**:

1. **Hide Example**:

   - Field: `acceptTerms`
   - Resource: `user.terms`
   - Behavior: Field hidden when user lacks `user.terms.view` permission

2. **Disable Example**:

   - Field: `isPublished`
   - Resource: `content.publish`
   - Behavior: Field disabled (grayed out, not clickable, value still submitted)

3. **Readonly Example**:

   - Field: `isVerified`
   - Resource: `user.verification`
   - Behavior: **Checkbox becomes disabled when readonly**
   - **Explicit note** in example: "checkboxes lack native readonly semantics"
   - Clarifies that value is still submitted (unlike disabled text inputs)

4. **Combined with visibleWhen Example**:
   - Parent field: `isCommercial`
   - Conditional field: `requiresApproval`
   - Resource: `license.approval`
   - Shows both UI logic (visibleWhen) and RBAC logic working independently

**Documentation Style**:

- Matches established pattern from TextField/Autocomplete/Select docs
- Uses realistic domain names (not foo/bar)
- Does NOT explain RBAC theory or internal hooks
- Focuses on practical usage

---

### 3. Table of Contents (`web/src/pages/Docs/DocsPage.tsx`)

**Updated**: `checkboxTocItems` array (line 85)

**Entry Added**:

```typescript
{ id: 'access-control', label: 'Access Control (RBAC)' }
```

**Placement**: After `capabilities`, before `react-hook-form-integration`

**Verification**: Section ID matches docs section exactly

---

## Checkbox-Specific RBAC Behavior

### Readonly Fallback to Disabled

**Technical Limitation**:

- Native HTML `<input type="checkbox">` does NOT support the `readOnly` attribute
- MDN specification lists readonly support only for: text, search, url, tel, email, date, month, week, time, datetime-local, number, password
- Checkboxes are explicitly excluded from this list

**Implementation Decision**:

- When `onUnauthorized: 'readonly'` is specified, Checkbox uses `disabled` as fallback
- This matches the pattern used by Select (which also lacks MUI-level readonly support)

**Behavior**:

- Checkbox appears grayed out (same visual as disabled)
- User cannot toggle the checkbox
- **Value is still submitted** (React controlled components submit disabled checkbox values)
- No visual distinction between disabled and readonly states

**Documentation**:

- Explicitly documented in JSDoc on `access` prop
- Explicitly noted in Example 3 of RBAC docs section
- Matches honest disclosure pattern from Select docs

**Rationale**:

- Safe and semantic (no CSS hacks or keyboard event workarounds)
- Consistent with Select pattern
- Better than alternatives:
  - `pointer-events: none` (doesn't prevent keyboard, not semantic)
  - Custom onClick prevention (fragile, complex, poor UX)

---

## Verification

### Typecheck

```bash
npx nx run @dashforge/ui:typecheck
```

**Result**: ✅ Passed (0 errors)

### Build

```bash
npx nx run web:build
```

**Result**: ✅ Passed

---

## Implementation Compliance

### Pattern Adherence

- ✅ Matches TextField/Autocomplete/Select RBAC pattern exactly
- ✅ Hook called unconditionally at top level
- ✅ Early returns for visibility after all hooks
- ✅ OR logic for disabled state merging
- ✅ Applied to ALL render modes (bridge + plain)

### Documentation Compliance

- ✅ 4 examples (hide, disable, readonly, combined)
- ✅ Realistic domain names used
- ✅ Readonly limitation explicitly documented
- ✅ Section placed correctly in docs structure
- ✅ TOC entry added with correct ID

### Type Safety

- ✅ No `any` or `as never` casts
- ✅ Explicit types used throughout
- ✅ No cascading type assertions

### Code Hygiene

- ✅ No console.log
- ✅ No stale closures
- ✅ Behavior preserved in refactor
- ✅ All tests still pass (checkbox has existing test coverage)

---

## Files Modified

1. `libs/dashforge/ui/src/components/Checkbox/Checkbox.tsx` (16 lines added, imports + prop + logic)
2. `web/src/pages/Docs/components/checkbox/CheckboxDocs.tsx` (~165 lines added, RBAC section)
3. `web/src/pages/Docs/DocsPage.tsx` (1 line added, TOC entry)

---

## Next Steps

Remaining components for RBAC implementation:

- RadioGroup
- Switch
- DateTimePicker

---

## Notes

### Readonly Semantics Comparison

| Component    | Readonly Support | Implementation                      |
| ------------ | ---------------- | ----------------------------------- |
| TextField    | ✅ Native        | `InputProps.readOnly: true`         |
| Textarea     | ✅ Native        | `InputProps.readOnly: true`         |
| NumberField  | ✅ Native        | `InputProps.readOnly: true`         |
| Autocomplete | ✅ MUI Custom    | `readOnly` + `InputProps.readOnly`  |
| Select       | ❌ Fallback      | Uses `disabled` (MUI limitation)    |
| **Checkbox** | ❌ Fallback      | Uses `disabled` (no native support) |

### Honest Documentation Policy

Following Dashforge principles:

- No pretending checkboxes support stronger readonly semantics than they can guarantee
- Explicit documentation of limitation in code and docs
- Preference for safe, semantic solution over CSS hacks
- Matches established Select pattern for component-specific limitations

---

**Report Complete** ✅
