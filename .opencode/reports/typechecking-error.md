# TypeScript Type Checking Errors Report

**Date:** 2026-03-27  
**Status:** Pre-existing errors (not introduced by recent changes)  
**Severity:** Medium (blocking typecheck but not runtime)

---

## Summary

This report documents all TypeScript type checking errors found in the Dashforge codebase. These are pre-existing errors that were present before the recent Snackbar fixes and are not related to the Alert IconButton hover fix.

**Total Errors Found:** 4 unique errors across 3 files

---

## Error Breakdown

### 1. Component Type Mismatch in Theme Adapter

**File:** `libs/dashforge/theme-mui/src/adapter/createMuiTheme.ts:120:7`  
**Error Code:** `TS2345`  
**Severity:** High

#### Error Message:

```
Argument of type 'Components<Omit<Theme, "components" | "palette"> & CssVarsTheme> | undefined'
is not assignable to parameter of type 'Partial<Record<string, ComponentFragment>> | undefined'.

Type 'Components<Omit<Theme, "components" | "palette"> & CssVarsTheme>'
is not assignable to type 'Partial<Record<string, ComponentFragment>>'.

Index signature for type 'string' is missing in type
'Components<Omit<Theme, "components" | "palette"> & CssVarsTheme>'.
```

#### Context:

```typescript
components: mergeComponents(
  getMuiButtonOverrides(dash),      // ❌ Line 120 - Type error here
  getMuiCardOverrides(dash),
  getMuiDividerOverrides(dash),
  getMuiOutlinedInputOverrides(dash),
  getMuiPaperOverrides(dash),
  // ... more overrides
```

#### Root Cause:

The `mergeComponents` function expects component overrides with a specific index signature `[key: string]: any`, but MUI's `Components<T>` type does not include this index signature. This is a type system mismatch between Dashforge's component merging utility and MUI's typed component system.

#### Impact:

- Blocks `tsc --build --emitDeclarationOnly`
- Does NOT affect runtime behavior
- Does NOT affect development (code works correctly)
- Only affects type declaration file generation

#### Possible Solutions:

1. Add type assertion: `mergeComponents(...overrides as Partial<Record<string, ComponentFragment>>[])`
2. Update `mergeComponents` function signature to accept MUI's `Components<T>` type
3. Add index signature to component override return types
4. Use generic constraint on `mergeComponents` that matches MUI's type structure

---

### 2. Declaration File Build Error

**File:** `libs/dashforge/theme-mui/src/lib/theme-mui.spec.tsx:3:31`  
**Error Code:** `TS6305`  
**Severity:** Medium

#### Error Message:

```
Output file '/Users/mcs/projects/web/dashforge/libs/dashforge/theme-mui/dist/lib/theme-mui.d.ts'
has not been built from source file
'/Users/mcs/projects/web/dashforge/libs/dashforge/theme-mui/src/lib/theme-mui.tsx'.
```

#### Context:

```typescript
import { render } from '@testing-library/react';

import DashforgeThemeMui from './theme-mui'; // ❌ Line 3 - Declaration file missing
```

#### Root Cause:

This is a **cascading error** caused by Error #1. Because the typecheck fails during declaration file generation (`tsc --build --emitDeclarationOnly`), the `.d.ts` file for `theme-mui.tsx` is never created. The test file then cannot find the declaration file for its import.

#### Impact:

- Blocks test file type checking
- Does NOT affect test execution (tests can still run)
- Cascades from the component type mismatch error

#### Solution:

Fix Error #1, and this error will resolve automatically.

---

### 3. Event Target Property Access Error

**File:** `web/src/pages/Docs/components/select/SelectExamples.tsx:45:28`  
**Error Code:** `TS2339`  
**Severity:** Low

#### Error Message:

```
Property 'label' does not exist on type 'EventTarget & (HTMLInputElement | HTMLTextAreaElement)'.
```

#### Context:

```typescript
<Select
  label="Country"
  name="country"
  value={country}
  onChange={(event) => {
    const { value, label } = event.target;  // ❌ Line 45 - 'label' doesn't exist
    console.log('event', event);
    setCountry(value);
  }}
  options={[
    // ...
```

#### Root Cause:

The `event.target` in the `onChange` handler is typed as `HTMLInputElement | HTMLTextAreaElement`, which don't have a `label` property. The developer is attempting to destructure `label` from `event.target`, but this property doesn't exist on standard HTML input/textarea elements.

#### Impact:

- Type error in documentation/example file
- Variable `label` is declared but never used (additional warning)
- Does NOT affect functionality (the code may work if Select provides custom event)

#### Possible Solutions:

1. Remove `label` from destructuring (if not needed)
2. Type assert `event.target` to include `label` property
3. Access label from a different source (e.g., find option by value)
4. Use custom event type that includes label property

#### Code Fix Example:

```typescript
onChange={(event) => {
  const { value } = event.target;  // ✅ Remove unused 'label'
  console.log('event', event);
  setCountry(value);
}}
```

---

### 4. Unused Variable Warning

**File:** `web/src/pages/Docs/components/select/SelectExamples.tsx:45:28`  
**Error Code:** Variable declared but not used  
**Severity:** Low

#### Error Message:

```
'label' is declared but its value is never read.
```

#### Root Cause:

The `label` variable destructured from `event.target` (see Error #3) is never used in the function body.

#### Solution:

Remove the unused `label` variable from the destructuring (see Error #3 fix).

---

## Additional LSP Warnings (Not Breaking Typecheck)

The following errors were reported by LSP (Language Server Protocol) but do NOT appear in `tsc` typecheck output. They may be editor-specific or resolved by different tsconfig settings:

### File: `libs/dashforge/ui/src/components/Snackbar/Snackbar.unit.test.tsx`

**Multiple occurrences of:**

- `'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.`
- `Property 'toBeInTheDocument' does not exist on type 'JestMatchers<HTMLElement | null>'.`

#### Context:

Test file is using global `React` instead of importing it, and jest-dom matchers may not be properly typed.

#### Impact:

- LSP warnings only
- Tests still run successfully
- Does NOT block typecheck command

#### Possible Solutions:

1. Add `import React from 'react';` at the top of the file
2. Ensure `@testing-library/jest-dom` types are imported
3. Update `tsconfig.json` to allow UMD globals in test files

---

## Status by Library

| Library                 | Typecheck Status | Errors | Notes                                 |
| ----------------------- | ---------------- | ------ | ------------------------------------- |
| `@dashforge/tokens`     | ✅ Pass          | 0      | No errors                             |
| `@dashforge/theme-core` | ✅ Pass          | 0      | No errors                             |
| `@dashforge/ui-core`    | ✅ Pass          | 0      | No errors                             |
| `@dashforge/forms`      | ✅ Pass          | 0      | No errors                             |
| `@dashforge/ui`         | ✅ Pass          | 0      | No errors                             |
| `@dashforge/theme-mui`  | ❌ Fail          | 2      | Error #1, #2 (cascading)              |
| `web`                   | ❌ Fail          | 2      | Error #3, #4 + cascade from theme-mui |

---

## Impact Assessment

### Build Impact

- **Development builds:** No impact (errors are type-only)
- **Production builds:** May impact if strict type checking is enforced
- **CI/CD:** May fail if typecheck is a required step

### Runtime Impact

- **None** - All errors are compile-time TypeScript issues
- Application runs correctly despite type errors
- No user-facing bugs

### Developer Experience Impact

- Type errors visible in IDE/editor
- May cause confusion for developers
- Blocks declaration file generation for theme-mui

---

## Recommendations

### Priority 1 (High): Fix Component Type Mismatch

**File:** `libs/dashforge/theme-mui/src/adapter/createMuiTheme.ts:120`

This is the root cause of multiple cascading errors. Fixing this will:

- Resolve Error #1 and Error #2
- Allow declaration files to be generated
- Unblock typecheck for theme-mui and web

**Suggested approach:**

1. Review `mergeComponents` function signature
2. Update to accept MUI's `Components<T>` type
3. Add proper generic constraints

### Priority 2 (Medium): Clean Up Example Code

**File:** `web/src/pages/Docs/components/select/SelectExamples.tsx:45`

Simple fix to remove unused variable and incorrect property access.

**Suggested fix:**

```typescript
onChange={(event) => {
  const { value } = event.target;  // Remove 'label'
  console.log('event', event);
  setCountry(value);
}}
```

### Priority 3 (Low): Fix Test File Warnings

**File:** `libs/dashforge/ui/src/components/Snackbar/Snackbar.unit.test.tsx`

Add proper imports for React and ensure jest-dom types are available.

---

## Verification Commands

```bash
# Check theme-mui library
npx nx run @dashforge/theme-mui:typecheck

# Check web app
npx nx run web:typecheck

# Check all projects
npx nx run-many --target=typecheck --all
```

---

## Conclusion

All errors documented in this report are **pre-existing** and **not related** to the recent Snackbar theme fixes or close button hover fix. The errors are:

1. **Type system mismatch** in component override merging (high priority)
2. **Cascading declaration file error** (resolves with #1)
3. **Incorrect property access** in example code (low priority)
4. **Unused variable** in example code (low priority)

None of these errors affect runtime behavior or user experience. They are purely compile-time TypeScript issues that should be addressed to maintain code quality and enable full type checking in CI/CD pipelines.

**Status:** Documented, not blocking current work  
**Next Action:** Prioritize fixing component type mismatch in createMuiTheme.ts

---

**Generated:** 2026-03-27  
**Last Updated:** 2026-03-27  
**Report Version:** 1.0
