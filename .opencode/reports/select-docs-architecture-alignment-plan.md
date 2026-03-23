# Select Documentation Architecture Alignment Plan

**Status**: Ready for Approval  
**Date**: Mon Mar 23 2026  
**Task**: `select-docs-architecture-alignment.md`  
**Policy Compliance**: `reaction-v2.md`

---

## Executive Summary

The Select component documentation is outdated following significant architectural evolution through Reactive V2 implementation. This plan outlines **surgical, minimum-complete updates** to align documentation with current reality while preserving existing structure and visual design.
**Key Changes Required**:

- Add Reactive V2 runtime options documentation (`optionsFromFieldData`)
- Add generic option mapper documentation (`getOptionValue`, `getOptionLabel`, `getOptionDisabled`)
- Document unresolved value policy accurately (no auto-reset, no reconciliation)
- Update "Predictive Ready" capability to reflect current runtime architecture
- Add runtime/reactive examples to demonstrate actual capabilities
- Update API reference to include missing props
- Clarify three usage modes (controlled, DashForm, runtime/reactive)
  **Preserved**:
- Existing page structure (hero, sections, navigation)
- Visual design system (`DocsPreviewBlock`, theme, styling)
- All existing examples (enhanced, not replaced)
- Current demos (updated for accuracy)

---

## Architecture Alignment Summary

### Current Architecture State (Reality)

**Select Component Evolution**:

1. **Built on TextField** - Select composes TextField with `select` mode
2. **Three Usage Modes**:
   - **Plain/Controlled**: Standard React controlled component (value + onChange)
   - **DashForm Integration**: Automatic RHF binding via DashFormBridge
   - **Runtime/Reactive**: Options loaded via reactions with `optionsFromFieldData`
3. **Static Options** - Traditional `options` prop (backward compatible)
4. **Runtime Options** - `optionsFromFieldData` enables async/reactive option loading
5. **Generic Option Shapes** - Component-level mappers (`getOptionValue`, `getOptionLabel`, `getOptionDisabled`)
6. **Unresolved Value Policy** (Policy-Driven):
   - Display shows empty when value doesn't match loaded options
   - Form value remains unchanged (no auto-reset)
   - No automatic reconciliation
   - Dev-only console warnings (never in production)
   - No user-facing "not found" messages

### Documentation Gaps (Current State)

**Critical Gaps**:

1. **SelectCapabilities.tsx** - "Predictive Ready" section is vague/aspirational
2. **SelectExamples.tsx** - No runtime-driven examples
3. **SelectApi.tsx** - Missing `optionsFromFieldData`, mapper props
4. **SelectNotes.tsx** - No mention of runtime options or unresolved value policy
5. **SelectDocs.tsx** - Quick-start only shows static options
6. **No Runtime Examples** - Entire docs show only static options
   **Secondary Gaps**:

- No documentation of generic option shape support
- No explanation of loading state behavior
- No examples of real-world runtime scenarios
- Unresolved value behavior not explained

### Alignment Strategy

**Preserve + Enhance**:

- Keep all existing sections and structure
- Add runtime/reactive content where it naturally fits
- Update vague/outdated content to reflect reality
- Add new examples alongside existing ones (not replacing)
  **Three-Mode Clarity**:
  Every relevant section will clearly distinguish:

1. **Controlled/Standalone** - Basic React patterns
2. **DashForm Integration** - Current RHF integration
3. **Runtime/Reactive** - Reactive V2 capabilities
   **Policy Compliance**:
   All Reactive V2 documentation will follow `reaction-v2.md`:

- No automatic reconciliation claims
- No automatic reset claims
- Accurate unresolved value policy
- Dev-only warning behavior
- Runtime state vs form value distinction

---

## File-by-File Update Plan

### 1. `SelectDocs.tsx` (Main Page Structure)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectDocs.tsx`  
**Current State**:

- Hero section exists
- Quick-start code shows only static options
- Page structure uses section-based layout
  **Required Changes**:

1. **Quick-Start Code** (lines ~80-100):
   - Keep existing static example as "Basic Usage"
   - Add second code block: "Runtime-Driven Options"
   - Show minimal `optionsFromFieldData` example
   - Keep it simple (don't explain full reaction system yet)
     **Example Addition**:

```tsx
// Add after existing quick-start
{
  title: 'Runtime-Driven Options',
  code: `<Select
  name="country"
  label="Country"
  optionsFromFieldData="countryField"
  getOptionValue={(opt) => opt.id}
  getOptionLabel={(opt) => opt.name}
/>`
}
```

## **Why**: Developers need to see runtime capabilities immediately, not buried deep in docs.

### 2. `SelectExamples.tsx` (Basic Examples)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectExamples.tsx`  
**Current State**:

- 6 static examples (basic, with helper, disabled, error, full-width, multiple variants)
- All use hardcoded `options` prop
- No runtime/reactive examples
  **Required Changes**:

1. **Keep All Existing Examples** (preserve backward compatibility showcase)
2. **Add Section**: "Runtime Options" (new examples after existing 6)
3. **Add Example 7**: "Runtime-Driven Options"
   - Show `optionsFromFieldData` with mock runtime data
   - Use `getOptionValue` / `getOptionLabel` for generic shape
   - Include loading state display
4. **Add Example 8**: "Custom Option Shape"
   - Demonstrate non-standard option shape
   - Use all three mappers (`getOptionValue`, `getOptionLabel`, `getOptionDisabled`)
     **Example Code**:

```tsx
// Example 7: Runtime-Driven Options
<DashForm
  defaultValues={{ department: '' }}
  reactions={[
    {
      id: 'load-departments',
      watch: [],
      run: async (ctx) => {
        ctx.setRuntime('department', { status: 'loading' });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        ctx.setRuntime('department', {
          status: 'ready',
          data: {
            options: [
              { id: 'eng', name: 'Engineering', active: true },
              { id: 'sales', name: 'Sales', active: true },
              { id: 'support', name: 'Support', active: false },
            ],
          },
        });
      },
    },
  ]}
>
  <Select
    name="department"
    label="Department"
    optionsFromFieldData="department"
    getOptionValue={(opt) => opt.id}
    getOptionLabel={(opt) => opt.name}
    getOptionDisabled={(opt) => !opt.active}
  />
</DashForm>
```

## **Why**: Current examples don't demonstrate runtime capabilities at all. Developers need practical, copy-paste examples.

### 3. `SelectCapabilities.tsx` (Progressive Adoption Model)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectCapabilities.tsx`  
**Current State**:

- 3 capability cards: "Controlled Usage", "React Hook Form", "Predictive Ready"
- "Predictive Ready" card is vague/aspirational (lines ~80-110)
- Doesn't explain current Reactive V2 architecture
  **Required Changes**:

1. **Update Card 3 Title**: "Predictive Ready" → "Runtime & Reactive"
2. **Update Card 3 Description**:
   - Remove vague/aspirational language
   - Explain current `optionsFromFieldData` capability
   - Mention generic option shape support
   - Link to runtime examples
3. **Update Card 3 Code Example**:
   - Show actual `optionsFromFieldData` usage
   - Include mapper functions
   - Keep it concise (not full reaction example)
     **Before** (lines ~80-110):

```tsx
{
  title: 'Predictive Ready',
  description: 'Enable smart defaults and reactive behaviors...',
  // Vague code example
}
```

**After**:

```tsx
{
  title: 'Runtime & Reactive',
  description: 'Load options dynamically based on form state or external data. Select supports runtime-driven options through Reactive V2, enabling conditional data loading, dependent dropdowns, and async option fetching. Options can be any shape—use mapper functions to adapt.',
  code: `<Select
  name="city"
  label="City"
  optionsFromFieldData="cityField"
  getOptionValue={(opt) => opt.cityId}
  getOptionLabel={(opt) => opt.cityName}
  visibleWhen={(engine) => {
    return engine.getNode('country')?.value !== '';
  }}
/>`,
  badge: 'Reactive V2'
}
```

## **Why**: "Predictive Ready" is misleading. Current reality is "Runtime & Reactive" with clear capabilities.

### 4. `SelectApi.tsx` (API Reference Table)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectApi.tsx`  
**Current State**:

- Props table with ~15-20 props
- Missing Reactive V2 props:
  - `optionsFromFieldData`
  - `getOptionValue`
  - `getOptionLabel`
  - `getOptionDisabled`
- `visibleWhen` signature may be outdated
  **Required Changes**:

1. **Add Missing Props** (insert alphabetically):

```ts
{
  name: 'optionsFromFieldData',
  type: 'string',
  defaultValue: undefined,
  description: 'Runtime field name to load options from. When provided, options are loaded from field runtime state instead of static options prop. Enables async/reactive option loading through Reactive V2.'
},
{
  name: 'getOptionValue',
  type: '(option: T) => string | number',
  defaultValue: '(opt) => opt.value',
  description: 'Extracts the value from each option object. Required when using generic option shapes with optionsFromFieldData. Enables arbitrary option object structures.'
},
{
  name: 'getOptionLabel',
  type: '(option: T) => string',
  defaultValue: '(opt) => opt.label',
  description: 'Extracts the display label from each option object. Required when using generic option shapes with optionsFromFieldData.'
},
{
  name: 'getOptionDisabled',
  type: '(option: T) => boolean',
  defaultValue: '(opt) => false',
  description: 'Determines if an option should be disabled. Optional. Works with both static options and runtime options.'
},
```

2. **Update `visibleWhen` Description** (if outdated):

```ts
{
  name: 'visibleWhen',
  type: '(engine: Engine) => boolean',
  defaultValue: undefined,
  description: 'Conditional visibility predicate. When false, component renders null. Receives engine instance with access to all field state via getNode(name). Re-evaluates on dependency changes.'
}
```

3. **Add Section Header**: "Runtime & Reactive Props" (group the 4 new props)
   **Why**: API reference must be complete and accurate. Missing props = incomplete documentation.

---

### 5. `SelectNotes.tsx` (Implementation Notes)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectNotes.tsx`  
**Current State**:

- 8 implementation notes
- No mention of runtime options
- No mention of unresolved value policy
- All notes are accurate but incomplete
  **Required Changes**:

1. **Add Note 9**: "Runtime Options & Generic Shapes"

```tsx
{
  title: 'Runtime Options & Generic Shapes',
  content: 'Select supports runtime-driven options via the optionsFromFieldData prop. Options can be any shape—use getOptionValue, getOptionLabel, and optionally getOptionDisabled to map your data structure. This enables async loading, dependent dropdowns, and integration with any data source without forcing a specific option format.'
}
```

2. **Add Note 10**: "Unresolved Value Behavior"

```tsx
{
  title: 'Unresolved Value Behavior',
  content: 'If a field value does not match any loaded option, the Select displays empty while the form value remains unchanged. No automatic reset or reconciliation occurs. This is intentional—data consistency is a business concern, not a UI concern. In development mode, a console warning is emitted (never in production).'
}
```

3. **Add Note 11**: "Loading State Display"

```tsx
{
  title: 'Loading State Display',
  content: 'During runtime loading (idle/loading/error states), the Select display is sanitized to empty if the current value does not match available options. This prevents MUI out-of-range warnings. The underlying form value remains unchanged throughout the loading lifecycle. The field may be disabled during loading.'
}
```

## **Why**: Developers need to understand runtime behavior and unresolved value policy. Current notes don't cover this critical architecture.

### 6. `SelectScenarios.tsx` (Integration Scenarios)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectScenarios.tsx`  
**Current State**:

- 2 scenarios: "React Hook Form Integration", "Conditional Field Visibility"
- Both demos work correctly
- Both use static options only
- No runtime/reactive scenario
  **Required Changes**:

1. **Keep Existing Scenarios** (both are accurate)
2. **Add Scenario 3**: "Runtime-Driven Dependent Dropdowns"
   - Show two Selects: "Country" and "City"
   - City options load based on selected country
   - Use mock data (no backend)
   - Demonstrate `optionsFromFieldData` + reaction pattern
   - Show loading state handling
   - Show unresolved value behavior if user changes country
     **New Scenario**:

```tsx
{
  id: 'runtime-dependent-dropdowns',
  title: 'Runtime-Driven Dependent Dropdowns',
  subtitle: 'Try it: Select a country and watch cities load dynamically',
  description: 'Select supports dependent dropdowns through runtime options. When one field changes, reactions can load new options for dependent fields. This example shows country/city selection with async option loading and proper loading state handling.',
  demo: <SelectRuntimeDependentDemo />,
  code: `// Full example with reaction...`,
  whyItMatters: 'Build complex forms with dependent data loading. The framework handles reactivity, loading states, and data flow—you define the dependencies.'
}
```

3. **Create Demo Component**: `demos/SelectRuntimeDependentDemo.tsx`
   - Mock country data: US, Canada, UK
   - Mock city data per country (simulated async fetch)
   - Show loading state during fetch
   - Demonstrate unresolved value when country changes
     **Why**: Current scenarios don't demonstrate runtime capabilities. This is the most requested feature pattern.

---

### 7. `SelectPlayground.tsx` (Interactive Playground)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectPlayground.tsx`  
**Current State**:

- Interactive playground with prop controls
- Presets: basic, disabled, error, full-width
- Controls: label, placeholder, helperText, layout, variant, boolean toggles
- Uses static options only
- Code generation works
  **Required Changes**:
  **Decision**: Keep playground static-focused (no runtime complexity).
  **Rationale**:
- Playground is for exploring visual/layout props
- Runtime behavior is better demonstrated in Scenarios section
- Adding runtime state to playground would overcomplicate it
- Current playground serves its purpose well
  **Minor Update**:
- Add comment in code generation explaining runtime props exist:

```tsx
// Note: This playground focuses on visual/layout props.
// For runtime options (optionsFromFieldData), see Scenarios section.
```

## **Why**: Playground complexity doesn't justify runtime addition. Scenarios section is better suited for runtime demonstrations.

### 8. `SelectLayoutVariants.tsx` (Layout Examples)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `SelectLayoutVariants.tsx`  
**Current State**:

- Demonstrates 3 layouts: floating, stacked, inline
- All examples are static
- Visual comparisons work well
- No changes needed
  **Required Changes**:
  **None**. This file is accurate and serves its purpose (layout demonstration).
  **Rationale**: Layout variants are independent of option loading strategy. Static examples are sufficient.

---

### 9. `demos/SelectFormIntegrationDemo.tsx` (Form Demo)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `demos/SelectFormIntegrationDemo.tsx`  
**Current State**:

- Interactive DashForm demo with 2 Selects (country, language)
- Validation works
- Submit shows data
- All correct
  **Required Changes**:
  **None**. Demo is accurate and demonstrates DashForm integration correctly.
  **Rationale**: This demo focuses on form integration, not runtime options. It serves its purpose.

---

### 10. `demos/SelectConditionalDemo.tsx` (Conditional Visibility Demo)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `demos/SelectConditionalDemo.tsx`  
**Current State**:

- Shows conditional TextField visibility based on Select value
- Shipping method → delivery date / special instructions
- Uses `visibleWhen` correctly
- All accurate
  **Required Changes**:
  **None**. Demo accurately demonstrates conditional visibility.
  **Rationale**: Conditional visibility is separate from runtime options. Current demo is correct.

---

### 11. `selectPlayground.helpers.ts` (Playground Helpers)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `selectPlayground.helpers.ts`  
**Current State**:

- Type definitions for playground state
- Preset configurations
- Code generation function
- All accurate
  **Required Changes**:
  **None**. Helpers are utility code and don't need updates.
  **Rationale**: Playground isn't being updated for runtime, so helpers don't need changes.

---

### 12. NEW FILE: `demos/SelectRuntimeDependentDemo.tsx`

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/select`  
**File**: `demos/SelectRuntimeDependentDemo.tsx` (NEW)  
**Purpose**: Demonstrate runtime-driven dependent dropdowns.
**Implementation**:

```tsx
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashForm } from '@dashforge/forms';
import { Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
interface City {
  cityId: string;
  cityName: string;
  countryCode: string;
}
// Mock data
const MOCK_CITIES: City[] = [
  { cityId: 'nyc', cityName: 'New York', countryCode: 'us' },
  { cityId: 'la', cityName: 'Los Angeles', countryCode: 'us' },
  { cityId: 'tor', cityName: 'Toronto', countryCode: 'ca' },
  { cityId: 'van', cityName: 'Vancouver', countryCode: 'ca' },
  { cityId: 'lon', cityName: 'London', countryCode: 'uk' },
  { cityId: 'man', cityName: 'Manchester', countryCode: 'uk' },
];
export function SelectRuntimeDependentDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';
  return (
    <Box sx={{ p: { xs: 3, md: 4 } /* styling */ }}>
      <DashForm
        defaultValues={{ country: '', city: '' }}
        reactions={[
          {
            id: 'load-cities',
            watch: ['country'],
            when: (ctx) => ctx.getValue('country') !== '',
            run: async (ctx) => {
              const country = ctx.getValue<string>('country');

              // Set loading
              ctx.setRuntime('city', {
                status: 'loading',
                data: null,
              });
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 800));
              // Filter cities by country
              const cities = MOCK_CITIES.filter(
                (c) => c.countryCode === country
              );
              // Update runtime
              ctx.setRuntime('city', {
                status: 'ready',
                data: { options: cities },
              });
            },
          },
        ]}
      >
        <Stack spacing={2.5}>
          <Select
            name="country"
            label="Country"
            fullWidth
            options={[
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
            ]}
          />
          <Select
            name="city"
            label="City"
            fullWidth
            optionsFromFieldData="city"
            getOptionValue={(opt: City) => opt.cityId}
            getOptionLabel={(opt: City) => opt.cityName}
            visibleWhen={(engine) => {
              return engine.getNode('country')?.value !== '';
            }}
          />
          <Typography
            variant="caption"
            sx={
              {
                /* styling */
              }
            }
          >
            Notice: When you change country, the city field shows loading state,
            then displays cities for the selected country. If you had a city
            selected and switch countries, the display clears but the form value
            remains (no automatic reset).
          </Typography>
        </Stack>
      </DashForm>
    </Box>
  );
}
```

## **Why**: This is the missing piece—actual runtime demonstration with dependent dropdowns, loading states, and unresolved value behavior.

## Validation Strategy

### Phase 1: Pre-Implementation Validation

**Before writing code, verify**:

1. ✅ Read all current docs files (DONE)
2. ✅ Read current Select implementation (DONE)
3. ✅ Read policy requirements (DONE)
4. ✅ Identify all gaps (DONE in this plan)
5. ✅ Plan minimum-complete updates (DONE in this plan)

### Phase 2: Implementation Validation

**During implementation**:

1. **Visual Verification**:
   - Run dev server: `npx nx serve web`
   - Navigate to Select docs page
   - Verify all sections render correctly
   - Test all interactive demos
   - Verify code blocks display correctly
2. **Functional Verification**:
   - Test FormIntegrationDemo (should work as-is)
   - Test ConditionalDemo (should work as-is)
   - Test NEW RuntimeDependentDemo (verify loading, dependent options, unresolved behavior)
   - Test all new examples in SelectExamples.tsx
3. **Content Verification**:
   - Read through entire page as end-user
   - Verify runtime capabilities are clear
   - Verify unresolved value policy is explained
   - Verify three usage modes are distinct
   - Check for typos, broken links, inconsistencies

### Phase 3: Accuracy Verification

**Compare documentation against implementation**:

1. **API Reference Accuracy**:
   - Open `Select.tsx` implementation
   - Compare props table against actual component props
   - Verify type signatures match
   - Verify default values match
2. **Behavior Accuracy**:
   - Read `Select.unresolved-display.test.tsx`
   - Verify documented unresolved behavior matches tests
   - Read `Select.runtime-loading.test.tsx`
   - Verify documented loading behavior matches tests
3. **Policy Compliance**:
   - Re-read `reaction-v2.md`
   - Verify no documentation claims automatic reconciliation
   - Verify no documentation claims automatic reset
   - Verify runtime state vs form value distinction is clear

### Phase 4: Cross-Reference Check

**Ensure consistency across all files**:

1. All files use consistent terminology:
   - "runtime options" (not "dynamic options" or "async options")
   - "unresolved value" (not "invalid value" or "missing option")
   - "Reactive V2" (not "reactions system" or "reactive engine")
2. All code examples use consistent patterns
3. All examples are copy-paste ready (valid syntax)
4. All type signatures match real implementation

### Phase 5: User Experience Validation

**Walk through as new developer**:

1. Start at top of page (hero)
2. Read quick-start → Should see both static and runtime
3. Read examples → Should see progressive complexity
4. Try playground → Should explore visual props
5. Read capabilities → Should understand three modes
6. Try scenarios → Should see real-world patterns
7. Check API reference → Should find all props
8. Read notes → Should understand edge cases
   **Success Criteria**:

- New developer can distinguish three usage modes
- Runtime capabilities are discoverable
- Unresolved value policy is clear and non-surprising
- All examples work when copy-pasted
- No confusion about reconciliation/reset

---

## Implementation Sequence

### Step 1: Foundation Updates (High Impact, Low Risk)

1. Update `SelectApi.tsx` - Add missing props to API reference
2. Update `SelectNotes.tsx` - Add 3 new implementation notes
3. Update `SelectCapabilities.tsx` - Fix "Predictive Ready" card
   **Rationale**: These are documentation-only changes with no demo code. Low risk of breaking anything.

### Step 2: Example Enhancements (Medium Impact, Medium Risk)

4. Update `SelectDocs.tsx` - Add runtime quick-start code block
5. Update `SelectExamples.tsx` - Add 2 runtime examples
   **Rationale**: Adding examples alongside existing ones. Isolated changes.

### Step 3: New Demo (High Impact, Medium-High Risk)

6. Create `demos/SelectRuntimeDependentDemo.tsx` - New file
7. Update `SelectScenarios.tsx` - Add scenario 3 with new demo
   **Rationale**: New demo component needs testing. Integration with scenarios page needs verification.

### Step 4: Validation & Polish

8. Run dev server and test all changes
9. Verify all demos work interactively
10. Read through entire page for consistency
11. Fix any typos, broken code, or inconsistencies
    **Rationale**: Systematic validation before considering task complete.

---

## Risk Assessment

### Low Risk

- API reference updates (pure documentation)
- Implementation notes additions (pure documentation)
- Capability card updates (text only)

### Medium Risk

- Adding examples to SelectExamples.tsx (new code blocks, need testing)
- Adding quick-start code to SelectDocs.tsx (needs verification)

### Medium-High Risk

- Creating new RuntimeDependentDemo (new component, needs full testing)
- Integrating new demo into scenarios (needs UI/flow verification)

### Mitigation Strategies

1. **Incremental Testing**: Test each file change before moving to next
2. **Demo Isolation**: Build RuntimeDependentDemo standalone first, integrate second
3. **Rollback Plan**: Git commit after each major section (foundation, examples, demo)
4. **Review Checklist**: Use validation strategy checklist before marking complete

---

## Out of Scope (Confirmed)

### Will NOT Be Changed

1. ✅ Select component implementation (no new features)
2. ✅ Reactive V2 engine behavior (no architecture changes)
3. ✅ DashForm core (no form engine changes)
4. ✅ Documentation routing (no route changes)
5. ✅ Documentation visual design (preserve current theme/styling)
6. ✅ Other component docs (only Select)
7. ✅ SelectLayoutVariants.tsx (already accurate)
8. ✅ SelectFormIntegrationDemo.tsx (already accurate)
9. ✅ SelectConditionalDemo.tsx (already accurate)
10. ✅ selectPlayground.helpers.ts (utility code, no changes needed)
11. ✅ SelectPlayground.tsx (decision: keep static-focused)

### Will NOT Be Introduced

1. ✅ Automatic value reconciliation (explicitly forbidden by policy)
2. ✅ Automatic value reset (explicitly forbidden by policy)
3. ✅ New Select props (document existing only)
4. ✅ New demos beyond RuntimeDependentDemo (one new demo sufficient)
5. ✅ Marketing redesign (preserve structure)
6. ✅ Backend integrations (mock data only)

---

## Notes & Confirmations

### Structure Preservation

✅ **Confirmed**: Existing docs page structure will be preserved.

- All sections remain (hero, quick-start, examples, playground, capabilities, scenarios, API, notes, layout variants)
- Section order unchanged
- Visual design system unchanged
- Navigation unchanged

### Behavioral Integrity

✅ **Confirmed**: No new Select core behavior will be introduced.

- Documentation reflects **current** implementation only
- All examples use **existing** component capabilities
- No new props or features added to component

### Authoritative Reference

✅ **Confirmed**: After completion, Select docs will be the authoritative reference.

- Developers can trust all examples work as shown
- API reference will be complete and accurate
- Behavioral edge cases (unresolved values, loading states) explained
- Three usage modes clearly distinguished

### Policy Compliance

✅ **Confirmed**: All Reactive V2 documentation follows `reaction-v2.md` policy.

- No automatic reconciliation claims
- No automatic reset claims
- Unresolved value policy accurately documented
- Runtime state vs form value distinction clear
- Dev-only warning behavior correctly described

---

## Success Criteria

### Documentation Completeness

- [ ] All three usage modes documented (controlled, DashForm, runtime)
- [ ] Runtime options capability documented (`optionsFromFieldData`)
- [ ] Generic option mappers documented (3 mapper functions)
- [ ] Unresolved value policy documented (no auto-reset)
- [ ] Loading state behavior documented
- [ ] API reference complete (all props present)

### Example Quality

- [ ] Static examples remain intact (backward compatibility)
- [ ] Runtime examples added (2+ examples)
- [ ] Dependent dropdown demo works (new scenario)
- [ ] All code examples are copy-paste ready
- [ ] All demos work interactively without errors

### User Experience

- [ ] New developer can understand three modes within 5 minutes
- [ ] Runtime capabilities are discoverable (not buried)
- [ ] Unresolved value behavior is non-surprising (clearly explained)
- [ ] Examples progress from simple to complex
- [ ] Page flows logically from concept to implementation

### Technical Accuracy

- [ ] API reference matches implementation (verified against Select.tsx)
- [ ] Behavioral descriptions match tests (verified against test files)
- [ ] Type signatures are correct
- [ ] Default values are correct
- [ ] No claims about unsupported features

### Policy Compliance

- [ ] Zero mentions of "automatic reconciliation"
- [ ] Zero mentions of "automatic reset"
- [ ] Unresolved value = empty display + unchanged form value (clearly stated)
- [ ] Runtime state vs form value distinction clear
- [ ] Dev-only warnings documented correctly

---

## Appendices

### A. File Modification Summary

| File                           | Change Type | Risk Level  | Lines Changed (Est.) |
| ------------------------------ | ----------- | ----------- | -------------------- |
| SelectDocs.tsx                 | Addition    | Low         | +20                  |
| SelectExamples.tsx             | Addition    | Medium      | +60                  |
| SelectCapabilities.tsx         | Update      | Low         | ~30                  |
| SelectApi.tsx                  | Addition    | Low         | +40                  |
| SelectNotes.tsx                | Addition    | Low         | +30                  |
| SelectScenarios.tsx            | Addition    | Medium      | +50                  |
| SelectRuntimeDependentDemo.tsx | NEW         | Medium-High | +120                 |
| **TOTAL**                      |             |             | **~350 lines**       |

### B. Testing Checklist

**Before Implementation**:

- [x] Read all current docs files
- [x] Read current Select implementation
- [x] Read policy requirements
- [x] Plan changes
      **During Implementation**:
- [ ] Test each file change incrementally
- [ ] Verify code syntax (no TypeScript errors)
- [ ] Verify imports are correct
- [ ] Run dev server after each major change
      **After Implementation**:
- [ ] Full page walkthrough as new user
- [ ] Test all interactive demos
- [ ] Verify all code blocks display correctly
- [ ] Check for typos and broken links
- [ ] Compare API reference against implementation
- [ ] Verify policy compliance (no reconciliation claims)

### C. Key Terminology

Use these terms consistently across all documentation:
| Preferred Term | Avoid These Terms |
|----------------|-------------------|
| runtime options | dynamic options, async options, remote options |
| unresolved value | invalid value, missing option, not found |
| Reactive V2 | reactions system, reactive engine, predictive forms |
| form value | field value, input value, state value |
| runtime state | async state, fetched state, reactive state |
| display value | rendered value, shown value, UI value |
| component-level mappers | option adapters, shape converters |
| no automatic reset | no auto-fix, no reconciliation, no data healing |

### D. Code Example Standards

All code examples must follow these standards:

1. **Syntax**: Valid TypeScript/TSX (no pseudo-code)
2. **Imports**: Include all necessary imports
3. **Types**: Use proper type annotations where helpful
4. **Formatting**: Use Prettier-compatible formatting
5. **Comments**: Explain non-obvious behavior only
6. **Length**: Keep examples focused (< 50 lines preferred)
7. **Data**: Use mock data (no real API calls)
8. **Naming**: Use descriptive, realistic names (not foo/bar)

---

## Approval Required

This plan is ready for review and approval before implementation begins.
**Key Questions for Stakeholders**:

1. Is the scope appropriate (not too narrow, not too broad)?
2. Is the new RuntimeDependentDemo necessary, or should we skip it?
3. Should SelectPlayground remain static-focused, or add runtime controls?
4. Are there any other gaps not covered in this plan?
   **Recommendation**: Approve and proceed with implementation in the sequence outlined.

---

**End of Plan**
Perfect! I've completed the comprehensive implementation plan for aligning the Select component documentation with the current Reactive V2 architecture.
Summary
I've created a detailed, surgical plan for updating the Select component documentation located at:
.opencode/plans/select-docs-architecture-alignment-plan.md
What We Accomplished
Analysis Phase (Completed):

- ✅ Read all 11 existing documentation files
- ✅ Read Select component implementation
- ✅ Read Reactive V2 policy (reaction-v2.md)
- ✅ Read task specification
- ✅ Identified critical gaps (runtime options, unresolved value policy, generic mappers)
- ✅ Identified secondary gaps (loading behavior, examples, API reference)
  Plan Creation (Completed):
- ✅ Comprehensive file-by-file update strategy (12 files analyzed, 7 requiring updates, 1 new file)
- ✅ Architecture alignment summary (current state vs documentation gaps)
- ✅ Risk assessment (low to medium-high risk categorization)
- ✅ Validation strategy (5-phase approach)
- ✅ Implementation sequence (4 steps, logical ordering)
- ✅ Success criteria checklist (26 criteria across 5 categories)
  Key Plan Highlights
  Files Requiring Updates (7 files):

1. SelectDocs.tsx - Add runtime quick-start example
2. SelectExamples.tsx - Add 2 runtime examples (generic shapes, loading states)
3. SelectCapabilities.tsx - Replace "Predictive Ready" with "Runtime & Reactive"
4. SelectApi.tsx - Add 4 missing props (optionsFromFieldData + 3 mappers)
5. SelectNotes.tsx - Add 3 implementation notes (runtime, unresolved, loading)
6. SelectScenarios.tsx - Add scenario 3 (dependent dropdowns demo)
7. NEW: SelectRuntimeDependentDemo.tsx - Create interactive runtime demo
   Files Requiring No Changes (4 files):

- SelectLayoutVariants.tsx (already accurate)
- SelectFormIntegrationDemo.tsx (already accurate)
- SelectConditionalDemo.tsx (already accurate)
- selectPlayground.helpers.ts (utility, no updates needed)
  Estimated Impact: ~350 lines of changes across 7 files
  Policy Compliance
  The plan strictly follows reaction-v2.md:
- ✅ No automatic reconciliation claims
- ✅ No automatic reset claims
- ✅ Accurate unresolved value policy (display empty, form value unchanged)
- ✅ Runtime state vs form value distinction
- ✅ Dev-only warning behavior
  Next Steps (Awaiting Your Input)
  The plan is ready for approval. Before implementation, I'd like your feedback on:

1. Is the scope appropriate? (not too narrow, not too broad)
2. Should we create the new RuntimeDependentDemo? (adds ~120 lines, demonstrates key runtime pattern)
3. Should SelectPlayground remain static-focused? (current recommendation: yes, keep it simple)
4. Any other gaps or concerns?
   Would you like me to proceed with implementation, or would you like to review/adjust the plan first?
