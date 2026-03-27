# Autocomplete Stress Testing Page - Implementation Plan

**Task:** `autocomplete-docs-stress-page`  
**Mode:** PLAN  
**Status:** Plan Complete  
**Date:** 2026-03-27

---

## Executive Summary

This plan defines the implementation of a comprehensive Autocomplete stress testing page in the internal docs app (`docs/src/pages/autocomplete-stress/`). The page will follow existing documentation architecture patterns from `reactions-v2` and `form-stress` pages, demonstrating all currently supported Autocomplete features while respecting Reactive V2 policy constraints.

**Key Constraints:**

- This is a stress testing / playground environment (NOT final public docs)
- Must follow Reactive V2 policy (no automatic reset, display-only sanitization)
- Only includes currently supported features (NO multiple selection, NO async search)
- Must align with existing docs app architecture patterns

---

## Architecture Alignment

### Pattern Reference: `pages/reactions-v2/`

The implementation will mirror the proven architecture from the Reactive V2 docs page:

1. **Page Structure:**

   - Main page component as shell/container
   - MUI Box + Stack layout (maxWidth: 1200px)
   - Header with title + description
   - Alert component for policy notices
   - Composed of multiple self-contained example components

2. **Example Components:**

   - Each example in separate file
   - Uses `ExampleSection` wrapper for consistent styling
   - Contains own DashForm instance, types, and logic
   - Mock data imported from centralized source

3. **File Organization:**

   - Flat structure with clear naming
   - Reusable section wrapper component
   - Centralized mock data file
   - Barrel export for clean imports

4. **Routing:**
   - Registered in `docs/src/app/app.tsx`
   - Added to TopNav
   - Simple route path: `/autocomplete-stress`

---

## File Structure

```
docs/src/pages/autocomplete-stress/
  ├── AutocompleteStressPage.tsx        # Main page shell
  ├── ExampleSection.tsx                # Reusable section wrapper
  ├── mockDataSources.ts                # Mock data + helpers
  ├── StaticOptionsExample.tsx          # Example 1: Basic static options
  ├── FreeSoloExample.tsx               # Example 2: FreeSolo behavior
  ├── GenericOptionsExample.tsx         # Example 3: Generic options with mappers
  ├── RuntimeOptionsExample.tsx         # Example 4: Runtime options (Reactive V2)
  ├── LoadingStateExample.tsx           # Example 5: Loading state
  ├── UnresolvedValueExample.tsx        # Example 6: Unresolved value policy demo
  ├── DisabledOptionsExample.tsx        # Example 7: Disabled options
  └── index.ts                          # Barrel export
```

**Total Files:** 10 (1 page + 1 wrapper + 1 mock data + 7 examples + 1 barrel)

---

## File Specifications

### 1. AutocompleteStressPage.tsx

**Purpose:** Main page shell/container

**Responsibilities:**

- Layout structure (Box + Stack)
- Page header with title and description
- Alert component explaining page purpose
- Compose all example components
- No form logic (delegates to examples)

**Key Imports:**

- All example components
- MUI components (Box, Stack, Typography, Alert)

**Pattern Reference:** `pages/reactions-v2/ReactionV2.tsx`

---

### 2. ExampleSection.tsx

**Purpose:** Reusable wrapper for consistent example styling

**Responsibilities:**

- Paper container with padding
- Section title (Typography variant="h6")
- Optional description text
- Consistent spacing

**Props:**

```typescript
interface ExampleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

**Pattern Reference:** `pages/reactions-v2/ExampleSection.tsx`

---

### 3. mockDataSources.ts

**Purpose:** Centralized mock data and async helpers

**Contents:**

- `delay(ms: number)` helper
- Mock data arrays (countries, programming languages, products, etc.)
- Async fetch functions with simulated delays
- TypeScript interfaces for custom shapes

**Example Mock Data Sets:**

- Countries (string array)
- Programming languages (string array)
- Products (custom interface: `{ id: number; name: string; disabled: boolean }`)
- Categories (string array)
- API response shapes for runtime scenarios

**Pattern Reference:** `pages/reactions-v2/mockDataSources.ts`

---

### 4. StaticOptionsExample.tsx

**Purpose:** Demonstrate basic static options usage

**Scenario:**

- Simple string array options
- No mappers needed
- Bound to DashForm

**Form Schema:**

```typescript
interface FormData {
  country: string;
}
```

**Autocomplete Props:**

```typescript
<Autocomplete<string, string>
  name="country"
  label="Select Country"
  options={COUNTRIES}
  helperText="Basic static options (string array)"
/>
```

**Success Criteria:**

- Dropdown shows all options
- Selection updates form value
- FreeSolo allows arbitrary text
- Value persists across interactions

---

### 5. FreeSoloExample.tsx

**Purpose:** Demonstrate FreeSolo behavior and user expectations

**Scenario:**

- User can type arbitrary text not in options
- Form accepts non-option values
- Clear explanation of FreeSolo mode

**Form Schema:**

```typescript
interface FormData {
  customInput: string;
}
```

**UI Elements:**

- Autocomplete with string options
- Alert explaining FreeSolo behavior
- Form state display showing arbitrary values accepted

**Success Criteria:**

- User can type text not in dropdown
- Form value updates with custom text
- No errors shown for non-option values

---

### 6. GenericOptionsExample.tsx

**Purpose:** Demonstrate generic options with mapper functions

**Scenario:**

- Custom option shape (e.g., `{ id: number; name: string }`)
- Uses `getOptionValue`, `getOptionLabel`, `getOptionDisabled`
- Shows disabled option behavior

**Form Schema:**

```typescript
interface FormData {
  productId: number;
}

interface Product {
  id: number;
  name: string;
  disabled: boolean;
}
```

**Autocomplete Props:**

```typescript
<Autocomplete<number, Product>
  name="productId"
  label="Select Product"
  options={PRODUCTS}
  getOptionValue={(product) => product.id}
  getOptionLabel={(product) => product.name}
  getOptionDisabled={(product) => product.disabled}
/>
```

**Success Criteria:**

- Dropdown shows product names
- Form stores product IDs (not objects)
- Disabled products cannot be selected
- Correct label shown for selected value

---

### 7. RuntimeOptionsExample.tsx

**Purpose:** Demonstrate Reactive V2 runtime options integration

**Scenario:**

- Autocomplete options populated from another field's value
- Uses `optionsFromFieldData` prop
- Parent field triggers data fetch
- Dependent Autocomplete updates options dynamically

**Form Schema:**

```typescript
interface FormData {
  category: string;
  subcategory: string;
}
```

**Reactions:**

```typescript
{
  source: 'category',
  target: 'subcategory',
  async reaction({ value, setFieldData }) {
    if (value) {
      const subcategories = await fetchSubcategories(value);
      setFieldData('subcategory', subcategories);
    } else {
      setFieldData('subcategory', []);
    }
  }
}
```

**Autocomplete Props:**

```typescript
<Autocomplete<string, string>
  name="subcategory"
  label="Select Subcategory"
  options={[]} // Static fallback
  optionsFromFieldData={true} // Use runtime data
/>
```

**Success Criteria:**

- Changing category triggers async fetch
- Subcategory dropdown updates with new options
- Loading state shown during fetch
- Empty options when no category selected

**Pattern Reference:** `pages/reactions-v2/CountryProvinceExample.tsx`

---

### 8. LoadingStateExample.tsx

**Purpose:** Demonstrate loading state behavior

**Scenario:**

- Simulate async data fetch
- Component disabled during loading
- Clear visual indication of loading state

**Form Schema:**

```typescript
interface FormData {
  language: string;
}
```

**UI Elements:**

- Button to trigger loading
- Autocomplete with `loading` prop
- Form state display

**Logic:**

```typescript
const [loading, setLoading] = useState(false);

const handleLoadData = async () => {
  setLoading(true);
  await fetchLanguages(); // Simulated delay
  setLoading(false);
};
```

**Autocomplete Props:**

```typescript
<Autocomplete<string, string>
  name="language"
  label="Select Language"
  options={languages}
  loading={loading}
/>
```

**Success Criteria:**

- Component disabled when loading
- MUI CircularProgress shown in dropdown
- User cannot interact during loading
- Normal behavior resumes after loading complete

---

### 9. UnresolvedValueExample.tsx

**Purpose:** Demonstrate Reactive V2 unresolved value policy

**Scenario:**

- Form value exists but not in current options
- Display sanitization shows fallback text
- No error message shown to user (per policy §3.4)
- Dev warning emitted in console (dev mode only)

**Form Schema:**

```typescript
interface FormData {
  status: string;
}
```

**Setup Logic:**

```typescript
const form = useForm<FormData>({
  defaultValues: {
    status: 'archived', // Not in current options
  },
});

const STATUS_OPTIONS = ['active', 'pending', 'completed']; // No 'archived'
```

**UI Elements:**

- Alert explaining unresolved value policy
- Autocomplete with mismatched value
- Button to inspect form state
- Dev console reference

**Success Criteria:**

- Component shows "(Value not resolved)" in text field
- No error styling or message
- Form value remains 'archived' (unchanged)
- Dev warning logged once (deduplicated)

**Pattern Reference:** `pages/reactions-v2/UnresolvedValueExample.tsx`

**Policy Reference:** `.opencode/policies/reaction-v2.md` §1.5, §3.4

---

### 10. DisabledOptionsExample.tsx

**Purpose:** Demonstrate disabled options behavior

**Scenario:**

- Some options marked as disabled
- User cannot select disabled options
- Disabled options visually distinct

**Form Schema:**

```typescript
interface FormData {
  planId: number;
}

interface Plan {
  id: number;
  name: string;
  disabled: boolean;
  reason?: string;
}
```

**Autocomplete Props:**

```typescript
<Autocomplete<number, Plan>
  name="planId"
  label="Select Plan"
  options={PLANS}
  getOptionValue={(plan) => plan.id}
  getOptionLabel={(plan) => plan.name}
  getOptionDisabled={(plan) => plan.disabled}
/>
```

**Success Criteria:**

- Disabled options shown in dropdown (grayed out)
- Disabled options cannot be clicked
- Tooltip or helper text explains why disabled
- Form value only accepts enabled options

---

### 11. index.ts

**Purpose:** Barrel export

**Contents:**

```typescript
export { default as AutocompleteStressPage } from './AutocompleteStressPage';
```

**Pattern Reference:** `pages/reactions-v2/index.ts`

---

## Routing Integration

### Changes Required in `docs/src/app/app.tsx`

**Location:** Inside `<Routes>` component

**Add Route:**

```typescript
<Route path="/autocomplete-stress" element={<AutocompleteStressPage />} />
```

**Add Import:**

```typescript
import { AutocompleteStressPage } from '../pages/autocomplete-stress';
```

**Add TopNav Link:**

```typescript
<Button color="inherit" component={Link} to="/autocomplete-stress">
  Autocomplete Stress
</Button>
```

**Pattern Reference:** Lines 414-429 in `app.tsx` (reactions-v2 route)

---

## Implementation Phases

### Phase 1: Page Scaffold (2-3 hours)

**Deliverables:**

1. Create `pages/autocomplete-stress/` directory
2. Implement `AutocompleteStressPage.tsx` (shell only)
3. Implement `ExampleSection.tsx` (reusable wrapper)
4. Create `mockDataSources.ts` with helpers and basic data
5. Create `index.ts` barrel export
6. Add routing in `app.tsx`
7. Verify page loads with placeholder content

**Verification:**

- Navigate to `/autocomplete-stress` successfully
- Page renders with header and empty sections
- No console errors

---

### Phase 2: Examples Implementation (6-8 hours)

**Deliverables:**

1. Implement `StaticOptionsExample.tsx`
2. Implement `FreeSoloExample.tsx`
3. Implement `GenericOptionsExample.tsx`
4. Implement `RuntimeOptionsExample.tsx` (most complex)
5. Implement `LoadingStateExample.tsx`
6. Implement `UnresolvedValueExample.tsx`
7. Implement `DisabledOptionsExample.tsx`
8. Populate `mockDataSources.ts` with all required data
9. Wire all examples into main page

**Implementation Order:**

1. Static → FreeSolo → Generic (foundational)
2. Loading → Disabled (isolated features)
3. Runtime → Unresolved (complex, policy-driven)

**Verification per Example:**

- Component renders without errors
- Form submission works
- Expected behavior matches success criteria
- No type errors

---

### Phase 3: Verification & Cleanup (2-3 hours)

**Deliverables:**

1. Run full typecheck: `npx nx run docs:typecheck`
2. Test all examples manually
3. Verify policy compliance (Reactive V2)
4. Add inline comments for clarity
5. Ensure consistent styling across examples
6. Verify routing and navigation
7. Clean up any debug code or console logs

**Final Checks:**

- [ ] All 7 examples functional
- [ ] No TypeScript errors
- [ ] No console errors (except expected dev warnings)
- [ ] Consistent UI/UX across examples
- [ ] Alert messages clear and accurate
- [ ] Form state displays work correctly
- [ ] Page navigable from TopNav

---

## Success Criteria

### Functional Requirements

- [ ] Page loads at `/autocomplete-stress` without errors
- [ ] All 7 examples render and function correctly
- [ ] Autocomplete component accepts user input in all scenarios
- [ ] Form values update correctly on selection
- [ ] FreeSolo mode allows arbitrary text input
- [ ] Generic options with mappers work correctly
- [ ] Runtime options populate from reactions
- [ ] Loading state disables component
- [ ] Unresolved values show sanitized display (no error messages)
- [ ] Disabled options cannot be selected

### Technical Requirements

- [ ] Zero TypeScript errors
- [ ] Zero console errors (except expected dev warnings)
- [ ] Follows existing docs app architecture patterns
- [ ] Uses `ExampleSection` wrapper consistently
- [ ] Mock data centralized in `mockDataSources.ts`
- [ ] Routing integrated in `app.tsx`
- [ ] Barrel export used for clean imports

### Policy Compliance

- [ ] Reactive V2 policy §1.5: No automatic reconciliation
- [ ] Reactive V2 policy §3.4: No UI error messaging for unresolved values
- [ ] Display sanitization is UI-only (form state unchanged)
- [ ] Dev warnings emitted in dev mode only

### Documentation Quality

- [ ] Page header clearly explains purpose
- [ ] Each example has descriptive title and explanation
- [ ] Alert components used for policy notices
- [ ] Form state displays aid understanding
- [ ] Code comments explain non-obvious logic

---

## Out of Scope

The following features are **explicitly excluded** from this implementation:

- ❌ Multiple selection mode
- ❌ Async search / remote filtering
- ❌ Autocomplete groups (category headers)
- ❌ Custom rendering templates
- ❌ Infinite scroll / virtualization
- ❌ Speculative future APIs

These may be addressed in future iterations after the component supports them.

---

## Risk Mitigation

### Risk: Scope Creep

**Mitigation:**

- Strictly follow current Autocomplete API
- No speculative features
- Focus on stress testing, not final docs

### Risk: Policy Violations

**Mitigation:**

- Reference `.opencode/policies/reaction-v2.md` continuously
- Model `UnresolvedValueExample` after existing `reactions-v2` version
- No automatic reset logic
- No user-facing error messages for unresolved values

### Risk: Architecture Divergence

**Mitigation:**

- Use `reactions-v2` page as primary reference
- Copy proven patterns (section wrapper, mock data structure)
- Keep file organization flat and consistent

---

## Estimated Timeline

**Total Time:** 10-14 hours

- Phase 1 (Scaffold): 2-3 hours
- Phase 2 (Examples): 6-8 hours
- Phase 3 (Verification): 2-3 hours

**Breakdown by Example:**

- Static Options: 30 min
- FreeSolo: 45 min
- Generic Options: 1 hour
- Loading State: 45 min
- Disabled Options: 45 min
- Runtime Options: 2 hours (most complex)
- Unresolved Value: 1.5 hours (policy-driven)

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Get approval** for scope and approach
3. **Transition to BUILD mode** (`autocomplete-docs-stress-page` with MODE=BUILD)
4. **Execute Phase 1** (scaffold)
5. **Execute Phase 2** (examples)
6. **Execute Phase 3** (verification)
7. **Manual QA** of completed page
8. **Update task status** to DONE

---

## References

### Pattern Sources

- `docs/src/pages/reactions-v2/ReactionV2.tsx` - Main page structure
- `docs/src/pages/reactions-v2/ExampleSection.tsx` - Section wrapper
- `docs/src/pages/reactions-v2/mockDataSources.ts` - Mock data pattern
- `docs/src/pages/reactions-v2/CountryProvinceExample.tsx` - Runtime options pattern
- `docs/src/pages/reactions-v2/UnresolvedValueExample.tsx` - Unresolved value pattern
- `docs/src/pages/form-stress/FormStressPage.tsx` - Alternative page structure
- `docs/src/app/app.tsx` - Routing setup

### Component Source

- `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx` - Component API

### Policy Source

- `.opencode/policies/reaction-v2.md` - Reactive V2 policy (§1.5, §3.4)

### Task Source

- `.opencode/tasks/autocomplete-docs-stress-page.md` - Task specification

---

**Plan Status:** ✅ Complete  
**Ready for BUILD:** Yes  
**Blockers:** None
