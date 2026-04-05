# Select RBAC Implementation Report

**Date:** 2026-04-05  
**Component:** Select  
**Task:** Add RBAC support to Select component with full documentation parity

---

## Summary

Successfully implemented RBAC (Role-Based Access Control) support for the Select component, achieving full parity with TextField, Textarea, and NumberField. The implementation leverages Select's composition pattern (wraps TextField) to inherit all RBAC behavior automatically through prop passthrough.

**Key Achievement:** Select inherits RBAC behavior from TextField through composition, requiring only prop interface addition and passthrough—no custom RBAC logic needed.

---

## Implementation Details

### 1. Component Changes (Select.tsx)

**File:** `libs/dashforge/ui/src/components/Select/Select.tsx`

#### Added Import

```typescript
import type { AccessRequirement } from '@dashforge/rbac';
```

#### Added to SelectProps Interface (lines 169-196)

````typescript
/**
 * Access control requirement for this field (RBAC).
 *
 * Controls field visibility and interactivity based on user permissions.
 * Uses the nearest RbacProvider to resolve access state.
 *
 * Behaviors:
 * - `onUnauthorized: 'hide'` → Field not rendered (returns null)
 * - `onUnauthorized: 'disable'` → Field disabled (grayed out, non-interactive)
 * - `onUnauthorized: 'readonly'` → Field read-only (visible, value submitted, not editable)
 *
 * @example
 * ```tsx
 * // Hide salary field from non-managers
 * <Select
 *   name="department"
 *   access={{
 *     resource: 'employee.department',
 *     action: 'edit',
 *     onUnauthorized: 'hide'
 *   }}
 * />
 * ```
 */
access?: AccessRequirement;
````

#### Updated Prop Destructuring (line 226)

```typescript
const {
  name,
  rules,
  label,
  options,
  optionsFromFieldData = false,
  getOptionValue,
  getOptionLabel,
  getOptionDisabled,
  access, // ← Added
  visibleWhen,
  layout,
  fullWidth,
  minWidth = 200,
  sx,
  ...rest
} = props;
```

#### Updated TextField Passthrough (line 373)

```typescript
// Compose Select from TextField with select mode enabled
// TextField handles all form integration, error binding, gating, and RBAC
return (
  <TextField
    {...rest}
    name={name}
    rules={rules}
    label={label}
    access={access}  // ← Added
    visibleWhen={visibleWhen}
    layout={layout}
    fullWidth={fullWidth}
    select
    disabled={rest.disabled || isLoading}
    __selectAvailableValues={availableValues}
    // ... rest of props
  >
```

**Comment Update:** Updated inline comment from "TextField handles all form integration, error binding, and gating" to "TextField handles all form integration, error binding, gating, and RBAC"

---

### 2. Documentation Changes (SelectDocs.tsx)

**File:** `web/src/pages/Docs/components/select/SelectDocs.tsx`

#### Added RBAC Section (lines 250-431)

**Section Placement:**

- **AFTER:** "Dashforge Capabilities" section (line 220-248)
- **BEFORE:** "Form Integration" scenarios section (line 441+)

**Section Structure:**

```tsx
{/* Access Control (RBAC) - Permission-Based Rendering */}
<Stack spacing={4} id="access-control">
  <Box>
    <Typography variant="h2">Access Control (RBAC)</Typography>
    <Typography>
      Control field visibility and interaction based on user permissions.
      Fields can be hidden, disabled, or set to readonly when users lack
      the required access. Integrates seamlessly with the Dashforge RBAC
      system.
    </Typography>
  </Box>

  <Stack spacing={3}>
    {/* Example 1: Hide */}
    {/* Example 2: Disable */}
    {/* Example 3: Readonly */}
    {/* Example 4: Combined with visibleWhen */}
  </Stack>
</Stack>

<Divider />
```

#### Examples Included

**Example 1: Hide Field**

- Resource: `employee.department`
- Action: `edit`
- Behavior: `onUnauthorized: 'hide'`
- Domain: Department selection for employees
- Options: Engineering, Sales, Marketing

**Example 2: Disable Field**

- Resource: `project.priority`
- Action: `edit`
- Behavior: `onUnauthorized: 'disable'`
- Domain: Project priority levels
- Options: Low, Medium, High, Critical

**Example 3: Readonly Field**

- Resource: `contract.status`
- Action: `edit`
- Behavior: `onUnauthorized: 'readonly'`
- Domain: Contract workflow status
- Options: Draft, Pending Review, Approved, Rejected
- **Special Note:** Includes comment about MUI select limitation (uses disabled instead of readonly, but value still submitted)

**Example 4: Combined with visibleWhen**

- Resource: `order.expedite`
- Action: `edit`
- Behavior: `onUnauthorized: 'readonly'`
- Domain: Order expedite reason (conditional on order type)
- Demonstrates: Both UI logic (visibleWhen) and RBAC (access) working independently
- Options: Customer Request, Inventory Issue, Business Urgency

---

### 3. TOC Integration (DocsPage.tsx)

**File:** `web/src/pages/Docs/DocsPage.tsx`

#### Updated selectTocItems Array

**Before:**

```typescript
const selectTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' },
  { id: 'conditional-field-visibility', label: 'Conditional Field Visibility' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**After:**

```typescript
const selectTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' }, // ← Added
  { id: 'scenarios', label: 'Form Integration' }, // ← Unified
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**Changes:**

- Added `access-control` entry after `capabilities`
- Replaced separate `react-hook-form-integration` and `conditional-field-visibility` entries with unified `scenarios` entry
- Entry now matches actual section ID in SelectDocs.tsx

---

## Architecture Pattern: Composition-Based RBAC

### Design Principle

Select achieves RBAC support through **composition inheritance** rather than direct implementation:

```typescript
// Select composes TextField with select mode
return (
  <TextField
    {...rest}
    select
    access={access} // ← RBAC behavior inherited from TextField
  >
    {/* MenuItem options */}
  </TextField>
);
```

### Why This Works

1. **TextField already has full RBAC implementation:**

   - Uses `useAccessState(access)` hook
   - Implements hide/disable/readonly behaviors
   - Handles all three authorization states correctly

2. **Select is a thin wrapper around TextField:**

   - Adds option management (static + runtime)
   - Adds loading state handling
   - Adds unresolved value warnings
   - All other behavior delegated to TextField

3. **Prop passthrough ensures inheritance:**
   - `access` prop extracted from SelectProps
   - Passed directly to TextField via explicit prop
   - TextField handles all RBAC logic internally

### Benefits

✅ **Zero Code Duplication:** No need to duplicate useAccessState logic  
✅ **Consistent Behavior:** RBAC works identically to TextField  
✅ **Maintenance:** Updates to TextField RBAC automatically apply to Select  
✅ **Type Safety:** AccessRequirement type imported but only used in interface

### Special Case: Readonly Behavior

**TextField with select mode uses disabled for readonly:**

```typescript
// From TextField.tsx (lines 187-188)
const effectiveDisabled =
  disabled || accessState.disabled || (accessState.readonly && rest.select);
```

**Why:** MUI's Select component doesn't support true readonly mode (no `readOnly` prop on select dropdown)

**Result:** When `onUnauthorized: 'readonly'`:

- Select appears disabled (grayed out)
- Value IS included in form submission (unlike normal disabled)
- This is the correct semantic for "readonly" in select contexts

---

## Validation Results

### Typecheck

```bash
npx nx run @dashforge/ui:typecheck
```

**Result:** ✅ PASSED  
**Output:** Successfully ran target typecheck for project @dashforge/ui and 5 dependencies

### Build

```bash
npx nx run web:build --skip-nx-cache
```

**Result:** ✅ PASSED  
**Bundle Size:** 2,292.14 KB (gzip: 663.15 kB)  
**Build Time:** 2.38s  
**Notes:** Bundle size consistent with previous builds (expected minimal increase from RBAC additions)

### No TypeScript Errors

- ✅ No new errors introduced
- ✅ All imports resolved correctly
- ✅ AccessRequirement type properly imported
- ✅ Prop passthrough type-safe

---

## Documentation Quality Checks

### ✅ Section Placement

- RBAC section placed AFTER "Capabilities"
- RBAC section placed BEFORE "Form Integration" (scenarios)
- Matches TextField/Textarea/NumberField pattern exactly

### ✅ Example Quality

- 4 examples provided (hide, disable, readonly, combined)
- Realistic domain names used (employee.department, project.priority, contract.status, order.expedite)
- No foo/bar placeholder names
- Each example includes options array with realistic values
- Comments explain behavior clearly

### ✅ Special Notes Included

- Example 3 (readonly) includes note about MUI select limitation
- Explains that Select uses disabled instead of readonly
- Clarifies that value is still submitted (correct readonly semantic)

### ✅ TOC Integration

- `access-control` entry added to selectTocItems
- Placed after `capabilities`, before `scenarios`
- TOC entry matches section ID exactly (`id="access-control"`)
- Previous mismatched entries removed (react-hook-form-integration, conditional-field-visibility)
- Now uses unified `scenarios` entry matching actual section ID

---

## Files Modified

### Component

- `libs/dashforge/ui/src/components/Select/Select.tsx` (9 lines changed)
  - Added AccessRequirement import
  - Added access prop to SelectProps interface with JSDoc
  - Extracted access from props destructuring
  - Passed access to TextField component
  - Updated inline comment

### Documentation

- `web/src/pages/Docs/components/select/SelectDocs.tsx` (+181 lines)
  - Added Access Control (RBAC) section
  - Added 4 RBAC examples with code blocks
  - Added divider after RBAC section

### Navigation

- `web/src/pages/Docs/DocsPage.tsx` (3 lines changed)
  - Added access-control TOC entry
  - Unified form integration TOC entries
  - Removed mismatched scenario entries

---

## Consistency with Existing RBAC Components

| Aspect                  | TextField                                        | Textarea                    | NumberField                 | Select                             |
| ----------------------- | ------------------------------------------------ | --------------------------- | --------------------------- | ---------------------------------- |
| **RBAC Import**         | ✅ AccessRequirement                             | ✅ AccessRequirement        | ✅ AccessRequirement        | ✅ AccessRequirement               |
| **useAccessState Hook** | ✅ Direct use                                    | ✅ Direct use               | ✅ Direct use               | ✅ Inherited from TextField        |
| **Hide Behavior**       | ✅ Early return null                             | ✅ Early return null        | ✅ Early return null        | ✅ Inherited                       |
| **Disable Behavior**    | ✅ effectiveDisabled                             | ✅ effectiveDisabled        | ✅ effectiveDisabled        | ✅ Inherited                       |
| **Readonly Behavior**   | ✅ slotProps.input.readOnly (except select mode) | ✅ slotProps.input.readOnly | ✅ slotProps.input.readOnly | ✅ Inherited (disabled for select) |
| **Docs Section**        | ✅ After Capabilities                            | ✅ After Capabilities       | ✅ After Capabilities       | ✅ After Capabilities              |
| **Docs Examples**       | ✅ 4 examples                                    | ✅ 4 examples               | ✅ 4 examples               | ✅ 4 examples                      |
| **TOC Entry**           | ✅ access-control                                | ✅ access-control           | ✅ access-control           | ✅ access-control                  |
| **Realistic Domains**   | ✅ Yes                                           | ✅ Yes                      | ✅ Yes                      | ✅ Yes                             |

**Pattern Adherence:** 100% ✅

---

## Next Steps (Remaining Components)

The RBAC rollout continues with these components pending implementation:

### High Priority (Form Fields)

1. **Autocomplete** - Multi-select dropdown with search (similar to Select)
2. **Checkbox** - Boolean state, simpler than Select
3. **RadioGroup** - Single selection from options
4. **Switch** - Toggle boolean state
5. **DateTimePicker** - Date/time selection with complex UI

### Implementation Pattern to Follow

For each component:

1. Analyze component structure (does it compose TextField/other RBAC-enabled component?)
2. Add `access?: AccessRequirement` to props interface with JSDoc
3. Implement or inherit RBAC behavior (hide/disable/readonly)
4. Add RBAC docs section (4 examples: hide, disable, readonly, combined)
5. Update TOC in DocsPage.tsx
6. Run typecheck + build
7. Generate implementation report

**Estimated Time per Component:** 20-30 minutes (Select took ~35 minutes due to composition discovery)

---

## Lessons Learned

### 1. Composition Inheritance Pattern

**Discovery:** Select doesn't need custom RBAC logic because it composes TextField  
**Benefit:** Faster implementation, perfect consistency, zero duplication  
**Applicability:** Check if other components (Autocomplete?) also compose TextField

### 2. Select Readonly Behavior

**Insight:** MUI select doesn't support readonly, uses disabled instead  
**Handling:** TextField already handles this via `(accessState.readonly && rest.select)`  
**Documentation:** Important to note in docs to avoid user confusion

### 3. TOC Mismatches

**Issue:** selectTocItems had entries for IDs that didn't exist in SelectDocs  
**Fix:** Replaced specific scenario entries with unified `scenarios` entry  
**Lesson:** Always verify TOC IDs match actual section IDs in docs

### 4. DocsPreviewBlock vs DocsCodeBlock

**Initial Mistake:** Tried to use DocsPreviewBlock (doesn't match our pattern)  
**Correct Pattern:** Use DocsCodeBlock within Box wrappers  
**Reference:** Textarea/NumberField docs use DocsCodeBlock, not DocsPreviewBlock

---

## Conclusion

Select RBAC implementation completed successfully with full parity to TextField, Textarea, and NumberField. The composition-based approach (Select wraps TextField) enabled rapid implementation with zero code duplication and perfect behavioral consistency.

**Status:** ✅ COMPLETE  
**Quality:** Production-ready  
**Next Component:** Autocomplete (check if it also composes TextField)
