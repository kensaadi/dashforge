# Autocomplete Web Docs Page - Implementation Plan

**Task:** `autocomplete-web-docs-page`  
**Mode:** PLAN  
**Date:** Fri Mar 27 2026  
**Status:** Ready for Implementation

---

## 1. Executive Summary

This plan outlines the creation of a **public-facing Autocomplete documentation page** for the web docs application (`web/src`). This is distinct from the internal stress testing page already completed in `docs/src`.

**Key Objectives:**

- Create curated, user-facing documentation following existing web docs architecture
- Document only currently supported Autocomplete features
- Ensure Reactive V2 policy compliance in all examples and documentation
- Match the quality and structure of existing component docs (Select, TextField, NumberField)

**Recommendation:** ✅ **GO** - All prerequisites met, architecture understood, scope clearly defined.

---

## 2. Existing Web Docs Architecture Signals

### 2.1 Directory Structure Pattern

Based on `web/src/pages/Docs/components/select/`:

```
web/src/pages/Docs/components/{component}/
  ├── {Component}Docs.tsx           # Main page component
  ├── {Component}Examples.tsx       # Curated examples section
  ├── {Component}LayoutVariants.tsx # Layout comparison section
  ├── {Component}Playground.tsx     # Interactive playground
  ├── {Component}Capabilities.tsx   # Dashforge features section
  ├── {Component}Scenarios.tsx      # Real-world scenarios
  ├── {Component}Api.tsx            # API reference
  ├── {Component}Notes.tsx          # Implementation notes
  └── demos/                        # Reusable demo components
      ├── {Component}ConditionalDemo.tsx
      ├── {Component}FormIntegrationDemo.tsx
      └── {Component}RuntimeDependentDemo.tsx
```

### 2.2 Main Page Structure Pattern

From `SelectDocs.tsx` (lines 1-200):

1. **Hero Section:**
   - Gradient-styled component name
   - Brief description (1-2 sentences)
2. **Quick Start:**

   - Minimal code example
   - Copy-paste ready
   - Shows most common usage

3. **Documentation Sections:**

   - Each section as separate imported component
   - Stack spacing={8} for major sections
   - h2 headings with descriptions

4. **Section Order:**
   - Examples (common patterns)
   - Layout Variants (visual comparisons)
   - Playground (interactive demo)
   - Capabilities (Dashforge-specific)
   - Scenarios (real-world use cases)
   - API Reference (props table)
   - Notes (technical details)

### 2.3 Examples Pattern

From `SelectExamples.tsx` (lines 1-150):

```typescript
const examples: Example[] = [
  {
    title: 'Basic Usage',
    description: 'Simple example with...',
    code: `<DashAutocomplete ... />`,
    component: <BasicDemo />,
  },
  // ... more examples
];

return (
  <Stack spacing={4}>
    {examples.map((example) => (
      <DocsPreviewBlock
        key={example.title}
        title={example.title}
        description={example.description}
        code={example.code}
      >
        {example.component}
      </DocsPreviewBlock>
    ))}
  </Stack>
);
```

### 2.4 Routing Pattern

From `DocsPage.tsx`:

1. Path matching: `/docs/components/autocomplete`
2. TOC items defined in same file
3. Sidebar registration in `DocsSidebar.model.ts`
4. Section links use hash navigation

### 2.5 Styling Conventions

- Theme-aware dark/light mode
- Gradient text: `background: linear-gradient(...)`, `backgroundClip: 'text'`
- Purple/violet accent colors
- Consistent spacing via Stack components
- Syntax-highlighted code blocks

---

## 3. Recommended Page Structure

### 3.1 File Structure

```
web/src/pages/Docs/components/autocomplete/
  ├── AutocompleteDocs.tsx           # Main page (hero, quick start, section orchestration)
  ├── AutocompleteExamples.tsx       # Curated basic examples
  ├── AutocompleteLayoutVariants.tsx # Standard/outlined/filled variants
  ├── AutocompletePlayground.tsx     # Interactive configuration demo
  ├── AutocompleteCapabilities.tsx   # Dashforge-specific features
  ├── AutocompleteScenarios.tsx      # Real-world use cases
  ├── AutocompleteApi.tsx            # Props reference table
  ├── AutocompleteNotes.tsx          # Technical notes and warnings
  └── demos/
      ├── AutocompleteBasicDemo.tsx
      ├── AutocompleteFreeSoloDemo.tsx
      ├── AutocompleteGenericDemo.tsx
      ├── AutocompleteFormDemo.tsx
      ├── AutocompleteRuntimeDemo.tsx
      ├── AutocompleteLoadingDemo.tsx
      └── AutocompleteDisabledOptionsDemo.tsx
```

### 3.2 Routing Integration

**In `web/src/pages/Docs/DocsPage.tsx`:**

Add route:

```typescript
{
  path: '/docs/components/autocomplete',
  element: <AutocompleteDocs />,
  tocItems: [
    { id: 'examples', label: 'Examples' },
    { id: 'layout-variants', label: 'Layout Variants' },
    { id: 'playground', label: 'Playground' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'api', label: 'API Reference' },
    { id: 'notes', label: 'Implementation Notes' }
  ]
}
```

**In `web/src/pages/Docs/components/DocsSidebar.model.ts`:**

Add under "UI Components" → "Input" section:

```typescript
{
  label: 'Autocomplete',
  path: '/docs/components/autocomplete',
  icon: <AutocompleteIcon />
}
```

---

## 4. Recommended Documentation Sections

### 4.1 Hero & Quick Start (AutocompleteDocs.tsx)

**Hero:**

- Title: "Autocomplete"
- Description: "An enhanced select input with search and free-text capabilities, fully integrated with DashForm and Reactive V2."

**Quick Start:**

```typescript
<DashAutocomplete
  name="country"
  label="Country"
  options={['USA', 'Canada', 'Mexico']}
/>
```

### 4.2 Examples Section (AutocompleteExamples.tsx)

**6 curated examples (high signal only):**

1. **Basic Static Options**

   - Simple string array
   - Shows default behavior
   - Single selection

2. **FreeSolo Mode**

   - Allows custom text entry
   - Value can be string not in options
   - Clear "enter your own" UX

3. **Generic Options with Mappers**

   - Object array options
   - getOptionLabel / getOptionValue
   - Type-safe usage

4. **DashForm Integration**

   - Inside DashFormProvider
   - Validation rules
   - Error display

5. **Disabled Options**

   - Mixed enabled/disabled options
   - getOptionDisabled callback
   - Visual feedback

6. **Loading State**
   - isLoading prop
   - Loading indicator display
   - User feedback during data fetch

### 4.3 Layout Variants Section (AutocompleteLayoutVariants.tsx)

**3 visual comparisons:**

1. **Standard (default)**
2. **Outlined**
3. **Filled**

Side-by-side rendering with identical props except variant.

### 4.4 Playground Section (AutocompletePlayground.tsx)

**Interactive demo with controls for:**

- variant (standard/outlined/filled)
- label
- placeholder
- disabled
- required
- freeSolo
- isLoading
- options count (5/10/20/50)

Live code preview + rendered output.

### 4.5 Capabilities Section (AutocompleteCapabilities.tsx)

**Dashforge-specific features:**

1. **Reactive V2 Integration**

   - Runtime option updates via `use$runtime`
   - No automatic reset behavior
   - Display sanitization only

2. **Form Closure V1 Compliance**

   - Error gating (touched OR submitCount > 0)
   - Touch tracking on blur
   - Validation integration

3. **Unresolved Value Handling**

   - Console-only warnings (no UI messaging)
   - Value preserved even if not in options
   - Clear documentation of behavior

4. **Type Safety**
   - Generic support for option types
   - Explicit mapper contracts
   - No unsafe casts

### 4.6 Scenarios Section (AutocompleteScenarios.tsx)

**Real-world use cases:**

1. **Country/Region Selector**

   - Large static option set
   - Search functionality
   - Common UX pattern

2. **Product Category Picker**

   - Nested/hierarchical options (flattened)
   - Disabled options based on availability
   - Form validation

3. **Runtime Dependent Options**

   - Options change based on other field value
   - Uses Reactive V2 runtime updates
   - Demonstrates no-reset policy

4. **User Role Assignment**
   - FreeSolo for custom roles
   - Validation on submit
   - Error handling

### 4.7 API Reference Section (AutocompleteApi.tsx)

**Props table format (matching Select pattern):**

| Prop              | Type                                 | Default    | Description                      |
| ----------------- | ------------------------------------ | ---------- | -------------------------------- |
| name              | string                               | required   | Field name for form registration |
| label             | string                               | -          | Input label text                 |
| options           | T[]                                  | required   | Array of available options       |
| value             | T                                    | -          | Controlled value                 |
| onChange          | (value: T \| null) => void           | -          | Change handler                   |
| freeSolo          | boolean                              | false      | Allow custom text entry          |
| getOptionLabel    | (option: T) => string                | identity   | Extract display label            |
| getOptionValue    | (option: T) => string                | identity   | Extract unique value             |
| getOptionDisabled | (option: T) => boolean               | -          | Determine if option disabled     |
| isLoading         | boolean                              | false      | Show loading indicator           |
| disabled          | boolean                              | false      | Disable entire input             |
| required          | boolean                              | false      | Mark as required                 |
| placeholder       | string                               | -          | Placeholder text                 |
| variant           | 'standard' \| 'outlined' \| 'filled' | 'standard' | Visual style                     |
| error             | boolean                              | -          | Error state (explicit)           |
| helperText        | string                               | -          | Helper/error text                |

**Generic signature:**

```typescript
function DashAutocomplete<T = string>(
  props: DashAutocompleteProps<T>
): JSX.Element;
```

### 4.8 Implementation Notes Section (AutocompleteNotes.tsx)

**Technical details and warnings:**

1. **Reactive V2 Policy Compliance:**

   - No automatic reset when options change
   - Display sanitization only (value preserved)
   - Console warnings for unresolved values (not user-facing)

2. **FreeSolo Behavior:**

   - Value can be string not in options
   - User is responsible for validation
   - Works with form validation rules

3. **Type Safety:**

   - Use generic options with explicit mappers
   - Avoid `any` in option types
   - Runtime checks for option uniqueness

4. **Performance:**

   - Large option sets (1000+) may impact performance
   - Consider virtualization for extreme cases (future)
   - Search is client-side only (no async filtering yet)

5. **Unsupported Features:**
   - Multiple mode (coming in future)
   - Async search/remote filtering (coming in future)
   - Option grouping (coming in future)

---

## 5. Required Demo Examples

### 5.1 Demo Files (in `demos/` subdirectory)

**7 focused demo files:**

1. **AutocompleteBasicDemo.tsx**

   - String array options
   - Minimal props
   - Shows default behavior
   - ~30 lines

2. **AutocompleteFreeSoloDemo.tsx**

   - freeSolo={true}
   - User can type custom value
   - Shows value outside options
   - ~40 lines

3. **AutocompleteGenericDemo.tsx**

   - Object array: `{ id: string, name: string, disabled?: boolean }`
   - getOptionLabel + getOptionValue
   - Type-safe usage
   - ~50 lines

4. **AutocompleteFormDemo.tsx**

   - DashFormProvider wrapper
   - Validation rules (required, custom)
   - Error display
   - Submit handler
   - ~80 lines

5. **AutocompleteRuntimeDemo.tsx**

   - Two autocompletes: category → subcategory
   - Subcategory options depend on category selection
   - Uses `use$runtime` for reactive updates
   - Demonstrates no-reset policy
   - ~100 lines

6. **AutocompleteLoadingDemo.tsx**

   - Button to toggle isLoading
   - Shows loading spinner
   - Simulates data fetch UX
   - ~40 lines

7. **AutocompleteDisabledOptionsDemo.tsx**
   - Mixed enabled/disabled options
   - getOptionDisabled callback
   - Visual feedback
   - ~50 lines

### 5.2 Demo Component Reuse

Each demo should:

- Be self-contained (no external dependencies beyond Dashforge)
- Include inline data (countries, categories, etc.)
- Use clear variable names
- Include comments for non-obvious logic
- Be copy-paste ready for users

### 5.3 Differences from Internal Stress Page

**Internal Stress Page (docs/src):**

- 10 files, 6 examples
- Purpose: Validation and stress testing
- Includes edge cases and boundary tests
- Technical/internal audience

**Public Web Docs (web/src):**

- 7 demo files, 6 examples in Examples section
- Purpose: User education and onboarding
- Curated, high-signal examples only
- Public/end-user audience
- Cleaner, more polished presentation

**Examples NOT ported from stress page:**

- Edge case tests (empty options, null values, etc.)
- Stress tests (1000+ options)
- Internal validation scenarios

**Examples refined for public docs:**

- Runtime demo simplified to show core pattern only
- Form demo focused on common validation use case
- Generic demo uses realistic data model

---

## 6. Runtime / Reactive V2 Documentation Strategy

### 6.1 Core Message

**"Autocomplete fully supports Reactive V2 runtime updates with a no-reset policy."**

### 6.2 Documentation Approach

**In Capabilities Section:**

```markdown
## Reactive V2 Integration

DashAutocomplete supports runtime option updates via the `use$runtime` hook.

**Key Behaviors:**

1. **No Automatic Reset:**

   - When options change at runtime, the current value is NOT reset
   - This preserves user input even when parent state changes

2. **Display Sanitization:**

   - If the current value is no longer in the new option set, the display sanitizes gracefully
   - The underlying value is preserved (not mutated)

3. **Unresolved Value Warnings:**
   - Console warnings are logged for unresolved values (developer-facing only)
   - No user-facing error messages for unresolved values

**Example:**

User selects "California" from state options.
Parent field changes country to "Canada".
State options update to Canadian provinces.
Result: "California" value is preserved (not reset), but display shows sanitized state.
Console: Warning logged (dev-facing only).
```

**In Runtime Demo:**

Include clear code comments:

```typescript
// When category changes, subcategory options update via Reactive V2
// Note: subcategory VALUE is NOT reset automatically
// User must explicitly clear subcategory if desired behavior
```

**In Implementation Notes:**

Dedicated subsection:

````markdown
### Reactive V2 Policy Compliance

DashAutocomplete follows the Reactive V2 policy for runtime updates:

- **No reconciliation:** Values are never automatically reset when options change
- **Display-only sanitization:** UI shows sanitized state, value unchanged
- **Console-only warnings:** Unresolved values log to console (not user-facing)

This behavior is intentional to prevent data loss and unexpected form mutations.

If you need to reset the value when options change, you must do so explicitly:

```typescript
const { setFieldValue } = use$runtime();

useEffect(() => {
  if (categoryChanged) {
    setFieldValue('subcategory', null); // Explicit reset
  }
}, [categoryValue]);
```
````

````

### 6.3 Policy Compliance Checklist

- [ ] No automatic reset behavior in any demo
- [ ] No user-facing error messages for unresolved values
- [ ] Console warnings only (not UI messaging)
- [ ] Display sanitization clearly documented
- [ ] Runtime demo shows explicit reset pattern (optional)
- [ ] Implementation Notes section includes Reactive V2 policy reference

---

## 7. API Reference Strategy

### 7.1 Props Table Structure

Follow Select pattern from `SelectApi.tsx`:

- Markdown table format
- Columns: Prop | Type | Default | Description
- Group by category:
  1. Core Props (name, label, options, value, onChange)
  2. Behavior Props (freeSolo, disabled, required, isLoading)
  3. Option Mappers (getOptionLabel, getOptionValue, getOptionDisabled)
  4. Styling Props (variant, placeholder)
  5. Error/Validation Props (error, helperText)

### 7.2 Type Definitions

Include key type signatures:

```typescript
interface DashAutocompleteProps<T = string> {
  // Core
  name: string;
  label?: string;
  options: T[];
  value?: T | null;
  onChange?: (value: T | null) => void;

  // Behavior
  freeSolo?: boolean;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;

  // Mappers
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string;
  getOptionDisabled?: (option: T) => boolean;

  // Styling
  variant?: 'standard' | 'outlined' | 'filled';
  placeholder?: string;

  // Validation
  error?: boolean;
  helperText?: string;
}
````

### 7.3 Generic Usage Documentation

Explain generic parameter:

````markdown
## Generic Options

DashAutocomplete supports generic option types:

```typescript
interface Country {
  code: string;
  name: string;
  disabled?: boolean;
}

<DashAutocomplete<Country>
  name="country"
  label="Country"
  options={countries}
  getOptionLabel={(option) => option.name}
  getOptionValue={(option) => option.code}
  getOptionDisabled={(option) => option.disabled ?? false}
/>;
```
````

The component is fully type-safe when used with TypeScript.

````

---

## 8. Out of Scope

### 8.1 Unsupported Features (Do NOT Document)

The following features are NOT currently supported and should NOT be documented:

1. **Multiple Mode:**
   - Multiple selection (value as array)
   - Chip-based display for multiple values
   - Not implemented yet

2. **Async Search / Remote Filtering:**
   - Server-side search
   - Remote data fetching with debounce
   - Async option loading
   - Not implemented yet

3. **Option Grouping:**
   - Grouped options with headers
   - Nested option structure
   - Not implemented yet

4. **Virtualization:**
   - Virtual scrolling for large option sets
   - Performance optimization for 10k+ options
   - Not implemented yet

5. **Custom Render Functions:**
   - renderOption callback
   - renderInput customization
   - renderTags for multiple mode
   - Not implemented yet

6. **Advanced Filtering:**
   - Custom filter function
   - Fuzzy search
   - Highlight matched text
   - Not implemented yet

### 8.2 Mention in Implementation Notes

In `AutocompleteNotes.tsx`, include a "Future Features" subsection:

```markdown
## Future Features

The following features are planned but not yet available:

- **Multiple Mode:** Select multiple options (value as array)
- **Async Search:** Server-side search with debounce
- **Option Grouping:** Organized option display
- **Virtualization:** Performance optimization for large datasets
- **Custom Rendering:** Advanced option/input customization

Check the roadmap for updates on these features.
````

### 8.3 Stress Testing Examples (Do NOT Port)

Examples from internal stress page that should NOT be included:

- Edge case tests (empty options, null handling, etc.)
- Boundary tests (1000+ options)
- Internal validation scenarios
- Developer-only debugging examples
- Performance profiling demos

---

## 9. Implementation Phases

### Phase 1: File Structure Setup (30 minutes)

**Tasks:**

1. Create directory: `web/src/pages/Docs/components/autocomplete/`
2. Create 8 main component files (stubs with TypeScript interfaces)
3. Create `demos/` subdirectory
4. Create 7 demo files (stubs with basic structure)

**Deliverable:** File structure in place, TypeScript compiles without errors

### Phase 2: Main Page & Quick Start (45 minutes)

**Tasks:**

1. Implement `AutocompleteDocs.tsx`:
   - Hero section with gradient styling
   - Quick Start code block
   - Section orchestration (import and render sub-components)
2. Add routing to `DocsPage.tsx`:
   - Path matching
   - TOC items
3. Add sidebar entry to `DocsSidebar.model.ts`

**Deliverable:** Page accessible at `/docs/components/autocomplete`, basic structure visible

### Phase 3: Demo Components (2 hours)

**Tasks:**

1. Implement all 7 demo files in `demos/`:
   - AutocompleteBasicDemo.tsx
   - AutocompleteFreeSoloDemo.tsx
   - AutocompleteGenericDemo.tsx
   - AutocompleteFormDemo.tsx
   - AutocompleteRuntimeDemo.tsx
   - AutocompleteLoadingDemo.tsx
   - AutocompleteDisabledOptionsDemo.tsx
2. Test each demo in isolation
3. Verify TypeScript types

**Deliverable:** All demo components render correctly, no TypeScript errors

### Phase 4: Examples Section (1 hour)

**Tasks:**

1. Implement `AutocompleteExamples.tsx`:
   - 6 example entries with title, description, code, component
   - Use `DocsPreviewBlock` wrapper
   - Match Select pattern exactly
2. Test rendering and code display

**Deliverable:** Examples section complete with side-by-side code/output

### Phase 5: Layout Variants & Playground (1 hour)

**Tasks:**

1. Implement `AutocompleteLayoutVariants.tsx`:
   - 3 variants side-by-side
   - Visual comparison layout
2. Implement `AutocompletePlayground.tsx`:
   - Interactive controls for common props
   - Live code preview
   - Rendered output

**Deliverable:** Layout variants and playground sections functional

### Phase 6: Capabilities & Scenarios (1.5 hours)

**Tasks:**

1. Implement `AutocompleteCapabilities.tsx`:
   - Reactive V2 integration documentation
   - Form Closure V1 compliance
   - Unresolved value handling
   - Type safety features
2. Implement `AutocompleteScenarios.tsx`:
   - 4 real-world use case examples
   - Detailed explanations

**Deliverable:** Capabilities and scenarios sections complete

### Phase 7: API Reference & Notes (1 hour)

**Tasks:**

1. Implement `AutocompleteApi.tsx`:
   - Props table with all API surface
   - Type definitions
   - Generic usage documentation
2. Implement `AutocompleteNotes.tsx`:
   - Reactive V2 policy compliance section
   - FreeSolo behavior notes
   - Type safety guidance
   - Performance considerations
   - Future features list

**Deliverable:** API reference and implementation notes complete

### Phase 8: Polish & Review (1 hour)

**Tasks:**

1. Review all sections for consistency
2. Verify Reactive V2 policy compliance
3. Check styling (gradient text, spacing, dark mode)
4. Proofread all text content
5. Test all interactive demos
6. Verify navigation and TOC links
7. Cross-browser smoke test

**Deliverable:** Documentation page ready for production

### Phase 9: Verification (30 minutes)

**Tasks:**

1. Run typecheck: `npx nx run web:typecheck`
2. Run tests: `npx nx run web:test`
3. Run build: `npx nx run web:build`
4. Manual QA in dev mode
5. Check all links and navigation

**Deliverable:** All checks pass, page ready to merge

---

## 10. Final Recommendation

### 10.1 GO Decision: ✅

**Justification:**

1. **Architecture Understood:**

   - Existing web docs patterns clearly identified
   - File structure and component patterns documented
   - Routing and navigation mechanisms understood

2. **Scope Clearly Defined:**

   - Only supported features included
   - Unsupported features explicitly excluded
   - Differences from internal stress page documented

3. **Policy Compliance:**

   - Reactive V2 policy thoroughly reviewed
   - Documentation strategy ensures compliance
   - No automatic reset, console-only warnings, display sanitization

4. **Resources Available:**

   - Reference implementation (Select docs) available
   - Demo patterns established
   - Reusable components (DocsPreviewBlock) ready

5. **Estimated Effort:**
   - Total: ~9 hours for complete implementation
   - Phased approach allows incremental progress
   - Low risk of scope creep

### 10.2 Success Criteria

Implementation is successful when:

- [ ] Page accessible at `/docs/components/autocomplete`
- [ ] All 7 demo files render without errors
- [ ] Examples section shows 6 curated examples with code + output
- [ ] Layout variants and playground are interactive
- [ ] Capabilities section documents Reactive V2 integration correctly
- [ ] API reference is complete and accurate
- [ ] Implementation notes include policy compliance section
- [ ] TypeScript compiles without errors
- [ ] All interactive demos function correctly
- [ ] Navigation and TOC links work
- [ ] Dark mode styling works
- [ ] Build succeeds without warnings

### 10.3 Risks & Mitigations

| Risk                                      | Likelihood | Impact | Mitigation                                     |
| ----------------------------------------- | ---------- | ------ | ---------------------------------------------- |
| Scope creep (adding unsupported features) | Medium     | Medium | Strict adherence to scope section; peer review |
| Reactive V2 policy violations             | Low        | High   | Dedicated policy review in Phase 8; checklist  |
| Inconsistent styling with existing docs   | Low        | Low    | Copy styling patterns exactly from Select docs |
| TypeScript errors in generic usage        | Medium     | Medium | Test generic demos thoroughly in Phase 3       |
| Demo complexity too high                  | Low        | Medium | Keep demos focused; avoid over-engineering     |

### 10.4 Next Steps

1. **Approve this plan** (stakeholder review)
2. **Begin Phase 1** (file structure setup)
3. **Proceed sequentially through phases**
4. **Conduct peer review after Phase 8**
5. **Merge to main after Phase 9 verification**

---

## Appendix A: Key Files Reference

### Files to Create (14 total)

**Main Components (8):**

1. `web/src/pages/Docs/components/autocomplete/AutocompleteDocs.tsx`
2. `web/src/pages/Docs/components/autocomplete/AutocompleteExamples.tsx`
3. `web/src/pages/Docs/components/autocomplete/AutocompleteLayoutVariants.tsx`
4. `web/src/pages/Docs/components/autocomplete/AutocompletePlayground.tsx`
5. `web/src/pages/Docs/components/autocomplete/AutocompleteCapabilities.tsx`
6. `web/src/pages/Docs/components/autocomplete/AutocompleteScenarios.tsx`
7. `web/src/pages/Docs/components/autocomplete/AutocompleteApi.tsx`
8. `web/src/pages/Docs/components/autocomplete/AutocompleteNotes.tsx`

**Demo Components (7):** 9. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteBasicDemo.tsx` 10. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteFreeSoloDemo.tsx` 11. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteGenericDemo.tsx` 12. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteFormDemo.tsx` 13. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteRuntimeDemo.tsx` 14. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteLoadingDemo.tsx` 15. `web/src/pages/Docs/components/autocomplete/demos/AutocompleteDisabledOptionsDemo.tsx`

### Files to Modify (2)

1. `web/src/pages/Docs/DocsPage.tsx` (add route and TOC items)
2. `web/src/pages/Docs/components/DocsSidebar.model.ts` (add sidebar entry)

### Files to Reference (No Modifications)

1. `web/src/pages/Docs/components/select/SelectDocs.tsx` (main page pattern)
2. `web/src/pages/Docs/components/select/SelectExamples.tsx` (examples pattern)
3. `web/src/pages/Docs/components/select/SelectApi.tsx` (API reference pattern)
4. `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx` (API surface)
5. `.opencode/policies/reaction-v2.md` (policy reference)

---

## Appendix B: Reactive V2 Policy Quick Reference

**From `.opencode/policies/reaction-v2.md`:**

### Core Principles

1. **No Automatic Reset:**

   - When options change at runtime, the current value is NOT reset
   - Prevents data loss and unexpected mutations

2. **Display Sanitization Only:**

   - If value not in new options, display sanitizes gracefully
   - Underlying value preserved (not mutated)

3. **Console-Only Warnings:**

   - Unresolved values log to console (developer-facing)
   - NO user-facing error messages for unresolved values

4. **Explicit Reset Only:**
   - If reset desired, must be done explicitly by developer
   - Use `setFieldValue(name, null)` or similar

### Documentation Requirements

- Document no-reset behavior clearly
- Show explicit reset pattern in runtime demos
- Warn developers about unresolved value behavior
- Do NOT suggest automatic reconciliation

### Testing Requirements

- Unit tests must verify no-reset behavior
- Console warning tests required
- Display sanitization tests required
- No UI error messaging for unresolved values

---

**End of Plan**

**Status:** Ready for Implementation  
**Estimated Effort:** 9 hours (phased approach)  
**Recommendation:** ✅ GO
