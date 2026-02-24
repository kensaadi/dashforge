# Code Review: Dashforge UI Components - Priority Fix List

**Review Date:** February 24, 2026  
**Scope:** `libs/dashforge/ui`, `libs/dashforge/forms`, `libs/dashforge/ui-core`, `libs/dashforge/theme-mui`  
**Focus:** Deprecated MUI APIs, `any` type leaks, unsafe typing in public component APIs

---

## Summary

✅ **Deprecated MUI APIs:** NONE FOUND - codebase is current with MUI v5 patterns  
⚠️ **Type Safety Issues:** 11 findings across 4 priority levels  
🎯 **Critical Path:** Form integration layer (TextField/Select event handlers + DashFormProvider bridge)

---

## 1) Top Priority Fixes (P0)

### P0-1: TextField Select Event Handlers - Multiple `as never` Casts

**Package:** `@dashforge/ui`  
**File:** `libs/dashforge/ui/src/components/TextField/TextField.tsx`  
**Lines:** 122, 150, 155, 169, 173  
**Category:** Unsafe typing (critical form integration path)

**Why it matters:**  
Complete type safety bypass at core form integration boundary. All Select components rely on this. Masks MUI/RHF API changes.

**Evidence:**
```typescript
// Line 122
await registration.onChange(syntheticEvent as never);

// Line 150
registration.onBlur(syntheticEvent as never);

// Line 155
rest.SelectProps.onClose({} as never);

// Lines 169, 173
onChange={handleChange as never}
SelectProps={{ onClose: handleClose as never }}
```

**Direction:** Define explicit event bridge types (SelectChangeEvent → ChangeEvent), remove all `as never` casts.

---

### P0-2: DashFormProvider Bridge Registration - Cascading Type Casts

**Package:** `@dashforge/forms`  
**File:** `libs/dashforge/forms/src/core/DashFormProvider.tsx`  
**Lines:** 160, 169, 196  
**Category:** Unsafe typing (affects all field registrations)

**Why it matters:**  
Every field registration flows through this. Returns `as never` means zero type safety for all form fields. Breaks on RHF updates.

**Evidence:**
```typescript
// Line 160
const rhfRegister = rhf.register(fieldName, rules as never);

// Line 169
const result = await originalOnChange(event as never);

// Line 196
return { ...rhfRegister, onChange: wrappedOnChange } as never;
```

**Direction:** Import proper RHF types (RegisterOptions, UseFormRegisterReturn), cast to those instead of `never`.

---

### P0-3: Select MenuItem Value - `as any` Cast

**Package:** `@dashforge/ui`  
**File:** `libs/dashforge/ui/src/components/Select/Select.tsx`  
**Line:** 62  
**Category:** `any` leakage (public component behavior)

**Why it matters:**  
Generic type `T` bypassed with `any`, allows incompatible values. Every Select dropdown affected.

**Evidence:**
```typescript
<MenuItem key={String(option.value)} value={option.value as any}>
  {option.label}
</MenuItem>
```

**Direction:** Constrain generic `SelectProps<T extends string | number>` or cast to `string | number` explicitly.

---

### P0-4: Theme Component Merge Utility - `Record<string, any>` Generic

**Package:** `@dashforge/theme-mui`  
**File:** `libs/dashforge/theme-mui/src/adapter/utils/mergeComponents.ts`  
**Lines:** 9, 12  
**Category:** `any` leakage (propagates to all theme overrides)

**Why it matters:**  
Core theme utility. Every MUI component override uses this. `any` propagates throughout theme layer.

**Evidence:**
```typescript
export function mergeComponents<T extends Record<string, any>>(
  ...parts: Array<T | undefined>
): T {
  const out: any = {};
  // ...
}
```

**Direction:** Replace with `Record<string, unknown>`, add type guards where needed.

---

## 2) High Priority (P1)

### P1-1: Public Component Props - `rules?: unknown` Without Guidance

**Package:** `@dashforge/ui`  
**Files:** 
- `libs/dashforge/ui/src/components/TextField/TextField.tsx:13`
- `libs/dashforge/ui/src/components/Select/Select.tsx:14`

**Category:** `any` equivalent (unclear API contract)

**Why it matters:**  
Public prop on exported components. No IntelliSense, no validation guidance. Poor DX for consumers.

**Evidence:**
```typescript
export interface TextFieldProps extends Omit<MuiTextFieldProps, 'name'> {
  name: string;
  rules?: unknown;  // No hint what's valid
  visibleWhen?: (engine: Engine) => boolean;
}
```

**Direction:** Import `RegisterOptions` from react-hook-form or add JSDoc with examples. Consider keeping `unknown` but document contract.

---

### P1-2: FieldRegistration Index Signature - Overly Permissive

**Package:** `@dashforge/ui-core`  
**File:** `libs/dashforge/ui-core/src/bridge/DashFormBridge.ts:14`  
**Category:** Unsafe typing (bridge contract)

**Why it matters:**  
Bridge interface allows arbitrary properties. Defeats type checking at integration boundary. Intentional but risky.

**Evidence:**
```typescript
export interface FieldRegistration {
  name: string;
  onChange?: (event: unknown) => void | Promise<unknown>;
  onBlur?: (event: unknown) => void;
  ref?: (instance: unknown) => void;
  [key: string]: unknown; // Allow additional RHF properties
}
```

**Direction:** Keep loose for library agnosticism but add explicit TSDoc explaining the trade-off and when to cast.

---

## 3) Medium Priority (P2)

### P2-1: Debug Console.log in Production Code

**Package:** `@dashforge/ui`  
**Files:**
- `libs/dashforge/ui/src/components/Select/Select.tsx:45`
- `libs/dashforge/ui/src/components/TextField/TextField.tsx:43-44`

**Category:** Code quality (not type safety)

**Why it matters:**  
Select has unconditional log. TextField logs every render in dev. Console noise, potential perf impact.

**Evidence:**
```typescript
// Select.tsx:45 - ALWAYS logs
console.log('Select props:', rest);

// TextField.tsx:43-44 - Dev only but verbose
if (process.env.NODE_ENV !== 'production') {
  console.log('TextField render:', name);
}
```

**Direction:** Remove Select log. Gate TextField log behind DEBUG_RENDERS env var or remove.

---

### P2-2: Subscription Pattern - Multiple @ts-expect-error Directives

**Package:** `@dashforge/ui`  
**File:** `libs/dashforge/ui/src/components/TextField/TextField.tsx:54-63`  
**Category:** Code quality (intentional but could be cleaner)

**Why it matters:**  
Five @ts-expect-error directives for intentional subscriptions. Works but is code smell. Confusing for maintainers.

**Evidence:**
```typescript
// @ts-expect-error - Intentionally unused, for subscription only
const _errorVersion = bridge?.errorVersion;
// @ts-expect-error - Intentionally unused, for subscription only
const _touchedVersion = bridge?.touchedVersion;
// ... 3 more
```

**Direction:** Use `void` operator or extract to custom hook `useFormStateSubscription(bridge)`.

---

## 4) Low Priority (P3)

### P3-1: Event Value Extraction - Verbose Type Narrowing

**Package:** `@dashforge/ui`  
**Files:**
- `libs/dashforge/ui/src/components/TextField/TextField.tsx:104-112`
- `libs/dashforge/forms/src/core/DashFormProvider.tsx:172-184`

**Category:** Code quality (DRY opportunity)

**Why it matters:**  
Defensive code repeated in multiple places. Verbose but safe. Could be utility function.

**Evidence:**
```typescript
let value: unknown;
if (event && typeof event === 'object' && 'target' in event) {
  const target = (event as { target: unknown }).target;
  if (target && typeof target === 'object' && 'value' in target) {
    value = (target as { value: unknown }).value;
  }
}
```

**Direction:** Extract to `extractEventValue(event: unknown): unknown` utility in ui-core.

---

### P3-2: visibleWhen Prop - Minimal Documentation

**Package:** `@dashforge/ui`  
**Files:**
- `libs/dashforge/ui/src/components/TextField/TextField.tsx:14`
- `libs/dashforge/ui/src/components/Select/Select.tsx:17`

**Category:** Documentation (typing is correct)

**Why it matters:**  
Function prop without docs. Runtime handles errors gracefully, but not obvious from signature.

**Evidence:**
```typescript
visibleWhen?: (engine: Engine) => boolean;
```

**Direction:** Add JSDoc explaining throw behavior defaults to visible, provide example.

---

## Verification Commands

After fixes, run:

```bash
# Type check all packages
nx run-many -t typecheck

# Build all packages
nx run-many -t build

# Run tests
nx run-many -t test

# Check for remaining any/never casts
rg "as (any|never)" libs/dashforge/ui libs/dashforge/forms
```

---

## Fix Strategy Recommendation

**Week 1 (P0):**  
Fix critical type casts in form integration layer. High risk but contained scope.

**Week 2 (P1):**  
Improve public API typing and documentation. Low risk, high DX impact.

**Week 3 (P2-P3):**  
Polish and cleanup. Can be deferred if timeline is tight.

---

**End of Report**
