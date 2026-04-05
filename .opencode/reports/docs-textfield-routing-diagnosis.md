# TextField Routing Diagnosis — Complete Root Cause Analysis

**Date:** 2026-04-05  
**Application:** web/docs  
**Severity:** High — Component documentation completely inaccessible  
**Type:** Regression introduced in recent refactor

---

## Executive Summary

**Problem:** Clicking `TextField` in the docs sidebar navigates to the `Overview` page instead of the TextField component documentation.

**Root Cause:** TextField route matching and component rendering logic were **accidentally removed** in commit `73c212c` during the "Getting Started" refinement.

**Impact:** TextField documentation is completely inaccessible via sidebar navigation despite:

- The TextFieldDocs component existing and being complete
- The sidebar entry pointing to the correct path (`/docs/components/text-field`)
- The TOC items being defined for TextField

**Fix Complexity:** Simple — restore missing import, route check, and component rendering case.

---

## Symptom Analysis

### Observed Behavior

1. **User Action:** Click "TextField" in docs sidebar
2. **Expected:** Navigate to `/docs/components/text-field` and render `TextFieldDocs` component
3. **Actual:** Navigate to `/docs/components/text-field` BUT render `Overview` component

### URL Behavior

**Critical Detail:** The URL **does** change to `/docs/components/text-field`, but the wrong component renders.

This confirms:

- ✅ Sidebar navigation works correctly
- ✅ React Router routing works correctly
- ❌ DocsPage component resolution logic is broken

---

## Root Cause: Missing Route Resolution

### The Smoking Gun

**File:** `web/src/pages/Docs/DocsPage.tsx`

**Missing Pieces:**

1. **No import for TextFieldDocs component**

   ```typescript
   // Line 17: TextareaDocs is imported
   import { TextareaDocs } from './components/textarea/TextareaDocs';

   // Line 18: NumberFieldDocs is imported
   import { NumberFieldDocs } from './components/number-field/NumberFieldDocs';

   // MISSING: TextFieldDocs should be here
   // import { TextFieldDocs } from './components/text-field/TextFieldDocs';
   ```

2. **No route matching variable**

   ```typescript
   // Lines 375-426: Route matching logic
   const isNumberFieldDocs =
     location.pathname === '/docs/components/number-field';
   const isTextareaDocs = location.pathname === '/docs/components/textarea';
   const isSelectDocs = location.pathname === '/docs/components/select';
   // ... all other components have checks ...

   // MISSING: TextField route check
   // const isTextFieldDocs = location.pathname === '/docs/components/text-field';
   ```

3. **No TOC resolution case**

   ```typescript
   // Lines 428-490: TOC item resolution
   const tocItems = isNumberFieldDocs
     ? numberFieldTocItems
     : isTextareaDocs
     ? textareaTocItems
     : isSelectDocs
     ? selectTocItems
     : // ... all other components ...
       textFieldTocItems; // ← This is the FALLBACK

   // MISSING: Explicit TextField case
   // : isTextFieldDocs
   // ? textFieldTocItems
   ```

4. **No component rendering case**

   ```typescript
   // Lines 492-556: Component rendering logic
   const docsContent = isNumberFieldDocs ? (
     <NumberFieldDocs />
   ) : isTextareaDocs ? (
     <TextareaDocs />
   ) : isSelectDocs ? (
     <SelectDocs />
   ) // ... all other components ...
   ) : (
     <Overview />  // ← FALLBACK triggers for TextField
   );

   // MISSING: Explicit TextField case
   // : isTextFieldDocs ? (
   //   <TextFieldDocs />
   // )
   ```

### Why Overview Renders

**Fallback Logic:**

The component rendering uses a massive ternary chain with `<Overview />` as the final fallback (line 555).

When the route is `/docs/components/text-field`:

1. None of the `isXxxDocs` variables match (because `isTextFieldDocs` doesn't exist)
2. All ternary conditions fail
3. Falls through to the final `else` case
4. Renders `<Overview />`

**TOC Behavior:**

Interestingly, `textFieldTocItems` IS used as the fallback (line 490), which means:

- The TOC on the right sidebar shows TextField sections
- But the main content shows Overview
- This creates a bizarre mismatch where TOC doesn't match content

---

## Evidence: TextField Component Exists

### Component Files Verified

```bash
web/src/pages/Docs/components/text-field/
├── TextFieldDocs.tsx         ✅ Main component (exported correctly)
├── TextFieldApi.tsx          ✅ API reference section
├── TextFieldCapabilities.tsx ✅ Capabilities section
├── TextFieldExamples.tsx     ✅ Examples section
├── TextFieldLayoutVariants.tsx ✅ Layout variants
├── TextFieldNotes.tsx        ✅ Implementation notes
├── TextFieldPlayground.tsx   ✅ Interactive playground
├── TextFieldScenarios.tsx    ✅ Form integration scenarios
└── demos/                    ✅ Demo components
```

**Export Verification:**

```typescript
// TextFieldDocs.tsx, line 19
export function TextFieldDocs() {
```

**Sidebar Path Verified:**

```typescript
// DocsSidebar.model.ts, lines 94-98
{
  type: 'link',
  label: 'TextField',
  path: '/docs/components/text-field',  // ✅ Correct path
},
```

**TOC Items Verified:**

```typescript
// DocsPage.tsx, lines 49-59
const textFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' },
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**Everything exists and is correct.** Only the route resolution is missing.

---

## Regression Analysis

### When Did This Break?

**Commit Timeline:**

```bash
73c212c (HEAD) feat(Getting started): Refinement        ← BROKE TextField
9b832b4        feat(docs): Extends RBAC TextField       ← TextField WORKED
```

### Exact Changes in Breaking Commit

**Commit:** `73c212c` - "feat(Getting started): Refinement"

**Changes that broke TextField:**

1. **Removed import:**

   ```diff
   -import { TextFieldDocs } from './components/text-field/TextFieldDocs';
   ```

2. **Changed fallback:**
   ```diff
   -  ) : (
   -    <TextFieldDocs />
   +  ) : isAccessControlDashforge ? (
   +    <AccessControlDashforge />
   +  ) : isAccessControlPlayground ? (
   +    <AccessControlPlayground />
   +  ) : (
   +    <Overview />
     );
   ```

### Why This Happened

**Context:** The commit was focused on refining the "Getting Started" documentation funnel (Overview, Why Dashforge, Installation, Usage).

**Likely Scenario:**

1. Developer wanted to change the default docs page from TextField to Overview
2. Changed the fallback component from `<TextFieldDocs />` to `<Overview />`
3. Removed the TextField import since it "appeared unused"
4. **Forgot** that TextField still needed to be explicitly handled in the route resolution logic
5. TextField was previously acting as the fallback, so it never had explicit route matching

**The Bug:** TextField was only accessible **because it was the fallback**, not because it had proper route resolution. When the fallback changed to Overview, TextField became completely inaccessible.

---

## Why This Wasn't Caught

### Missing Safeguards

1. **No TypeScript Error**

   - The component isn't imported, but TypeScript doesn't flag this as an error
   - The code is syntactically valid (it just has incomplete logic)

2. **No Test Coverage**

   - No automated test verifies that all sidebar links navigate to the correct component
   - No test ensures every sidebar item has corresponding route resolution

3. **Visual QA Gap**

   - The commit focused on Getting Started pages
   - TextField is in a different section (UI Components)
   - Easy to miss during manual testing

4. **Sidebar Still Works**
   - The sidebar entry for TextField exists and is clickable
   - The URL changes correctly
   - Only the rendered component is wrong
   - This creates a silent failure that's not immediately obvious

---

## Impact Assessment

### Severity: High

**User Impact:**

- TextField documentation is completely inaccessible
- Users trying to learn about TextField get the wrong page
- Confusing UX (URL says text-field, content shows Overview)
- TOC mismatch (TextField sections listed, but Overview content shown)

**Scope:**

- **Only TextField is affected**
- All other components (Textarea, NumberField, Select, etc.) work correctly
- Getting Started pages work correctly
- Form System pages work correctly

**Duration:**

- Broken since commit `73c212c` (Getting started refinement)
- Unknown when that commit was deployed
- Bug exists in current codebase

---

## Comparison: Working vs Broken

### Other Components (Working Example: NumberField)

**Import:**

```typescript
import { NumberFieldDocs } from './components/number-field/NumberFieldDocs';
```

**Route Check:**

```typescript
const isNumberFieldDocs = location.pathname === '/docs/components/number-field';
```

**TOC Resolution:**

```typescript
const tocItems = isNumberFieldDocs
  ? numberFieldTocItems
  : // ... other checks
```

**Component Rendering:**

```typescript
const docsContent = isNumberFieldDocs ? (
  <NumberFieldDocs />
) : // ... other checks
```

### TextField (Broken)

**Import:** ❌ Missing  
**Route Check:** ❌ Missing  
**TOC Resolution:** ❌ Missing explicit case (uses fallback)  
**Component Rendering:** ❌ Missing explicit case (falls through to Overview)

---

## Architecture Analysis

### Current Pattern: Explicit Route Matching

DocsPage.tsx uses a **manual route resolution pattern**:

```typescript
// 1. Define route checks (one per page)
const isPageX = location.pathname === '/docs/section/page-x';

// 2. Map routes to TOC items (massive ternary)
const tocItems = isPageX ? pageXTocItems : // ...

// 3. Map routes to components (massive ternary)
const docsContent = isPageX ? <PageX /> : // ...
```

**Problems with this pattern:**

1. **Fragile:** Easy to forget a component when adding/refactoring
2. **Verbose:** 3 separate places to update for each page
3. **No type safety:** TypeScript can't catch missing routes
4. **No exhaustiveness check:** Missing routes silently fall back

**Benefits:**

1. Simple and explicit
2. No magic routing logic
3. Easy to understand data flow

### Alternative Approaches (Not Implemented)

**Option 1: Route configuration object**

```typescript
const DOCS_ROUTES = {
  '/docs/components/text-field': {
    component: TextFieldDocs,
    tocItems: textFieldTocItems,
  },
  // ...
};
```

**Option 2: React Router nested routes**

```typescript
<Route path="/docs/components">
  <Route path="text-field" element={<TextFieldDocs />} />
  {/* ... */}
</Route>
```

**Current approach is fine,** just needs to be applied consistently.

---

## Minimal Safe Fix

### Required Changes

**File:** `web/src/pages/Docs/DocsPage.tsx`

**Change 1: Add import (after line 16)**

```typescript
import { TextFieldDocs } from './components/text-field/TextFieldDocs';
```

**Change 2: Add route check (after line 375)**

```typescript
const isTextFieldDocs = location.pathname === '/docs/components/text-field';
```

**Change 3: Add TOC resolution case (after line 428)**

```typescript
const tocItems = isTextFieldDocs
  ? textFieldTocItems
  : isNumberFieldDocs
  ? numberFieldTocItems
  // ... rest of ternary chain
```

**Change 4: Add component rendering case (after line 492)**

```typescript
const docsContent = isTextFieldDocs ? (
  <TextFieldDocs />
) : isNumberFieldDocs ? (
  <NumberFieldDocs />
) // ... rest of ternary chain
```

### Placement Strategy

**Where to insert TextField cases?**

**Option A: Alphabetical order**

- TextField comes after Switch, before Textarea
- Keeps component list organized

**Option B: Logical grouping (by component type)**

- Input components together: TextField, Textarea, NumberField, Select, etc.
- Matches sidebar subgroup structure

**Option C: First position (most common component)**

- TextField is likely the most-used component
- Check it first for performance

**Recommendation: Option B (Logical grouping)**

- Insert TextField check right after the route checks section starts
- Or group with other Input components (near Textarea, NumberField)
- Matches sidebar structure, making it easier to maintain consistency

### Testing the Fix

**Manual Test:**

1. Click "TextField" in sidebar
2. Verify URL is `/docs/components/text-field`
3. Verify page title shows "TextField"
4. Verify TOC shows TextField sections
5. Verify content shows TextField documentation (not Overview)

**Regression Check:**

1. Test that Overview still loads at `/docs/getting-started/overview`
2. Test that all other component pages still work
3. Test that sidebar navigation to other pages isn't affected

---

## Related Issues to Check

### Potential Similar Bugs

**Question:** Are any other components missing route resolution?

**Verification needed:**

Compare sidebar entries vs. DocsPage route checks:

**Sidebar Components:**

- TextField ❌ (confirmed missing)
- Textarea ✅
- NumberField ✅
- Select ✅
- Autocomplete ✅
- Checkbox ✅
- RadioGroup ✅
- Switch ✅
- DateTimePicker ✅
- AppShell ✅
- Breadcrumbs ✅
- TopBar ✅
- ConfirmDialog ✅
- Snackbar ✅
- Button ✅

**Conclusion:** Only TextField is affected.

---

## Prevention Recommendations

### Immediate (This Fix)

1. ✅ Restore TextField route resolution
2. ✅ Test manually that TextField page loads
3. ✅ Verify Overview fallback still works for invalid routes

### Short Term (Future PRs)

1. **Code review checklist item:**

   - "Verify all sidebar entries have corresponding route resolution"
   - "Verify all component imports are used in rendering logic"

2. **Manual testing checklist:**
   - Click every sidebar link before merging docs changes
   - Verify URL and rendered content match

### Long Term (Architecture)

1. **Create automated test:**

   ```typescript
   test('all sidebar links render correct components', () => {
     // Extract all paths from docsSidebarTree
     // For each path, verify correct component renders
   });
   ```

2. **TypeScript exhaustiveness check:**

   - Use discriminated unions
   - Make TypeScript enforce that all routes are handled

3. **Route configuration consolidation:**

   - Single source of truth for route → component mapping
   - Reduces manual updates across 3 different locations

4. **Consider React Router nested routes:**
   - Let React Router handle path matching
   - Eliminates manual `location.pathname` checks

---

## Conclusion

### Summary

**Problem:** TextField docs inaccessible due to missing route resolution  
**Root Cause:** Accidentally removed during "Getting Started" refactor (commit `73c212c`)  
**Impact:** High (complete loss of TextField documentation access)  
**Scope:** Single component affected  
**Fix Complexity:** Simple (add 4 lines across 4 sections)  
**Regression Risk:** Low (restoring previous working state)

### Root Cause Statement

TextField route resolution was removed when changing the DocsPage fallback component from `<TextFieldDocs />` to `<Overview />`. The developer removed the import and changed the fallback, but forgot that TextField never had explicit route matching—it was only accessible because it **was** the fallback. When the fallback changed, TextField became completely inaccessible.

### Next Steps

1. **Review this diagnosis** ✅ (current step)
2. **Implement the minimal fix** (add 4 changes to DocsPage.tsx)
3. **Test manually** (click TextField in sidebar, verify it loads)
4. **Consider adding test coverage** (prevent similar regressions)

---

## Appendix: Code References

### File Paths

- **Broken file:** `web/src/pages/Docs/DocsPage.tsx`
- **Sidebar config:** `web/src/pages/Docs/components/DocsSidebar.model.ts`
- **TextField component:** `web/src/pages/Docs/components/text-field/TextFieldDocs.tsx`

### Key Line Numbers (DocsPage.tsx)

- Line 17: Where TextField import should be
- Lines 49-59: textFieldTocItems definition ✅
- Line 375+: Where isTextFieldDocs check should be
- Line 428+: Where TOC mapping should include TextField
- Line 492+: Where component rendering should include TextField
- Line 490: textFieldTocItems used as fallback ⚠️
- Line 555: Overview used as fallback ⚠️

### Git References

- **Breaking commit:** `73c212c` - feat(Getting started): Refinement
- **Last working commit:** `9b832b4` - feat(docs): Extends RBAC TextField implementation
