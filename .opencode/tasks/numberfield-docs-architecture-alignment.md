NumberField Documentation Architecture Alignment Plan
Executive Summary
After thorough inspection of the NumberField implementation and current documentation, I've identified that the NumberField docs are largely accurate but require terminology updates and clarifications to align with:

1. Reactive V2 policy (.opencode/policies/reaction-v2.md)
2. Established patterns from TextField and Select docs updates
3. Developer-facing language consistency
   NumberField is simpler than Select (no runtime data loading) but shares TextField's foundation (DashForm integration, validation gating, visibility behavior).
   Scope: ~8 documentation files, estimated ~120-150 lines of changes (terminology + clarifications only)

---

1. Current Architecture Analysis
   NumberField Implementation (Verified from Source)
   File: libs/dashforge/ui/src/components/NumberField/NumberField.tsx
   Core Responsibilities:
1. Numeric Value Handling: Parses string input → number | null (never NaN)
1. Two Usage Modes:
   - Plain Mode: Standard controlled/uncontrolled React component
   - Bound Mode: DashForm integration via DashFormBridge
1. Form Closure v1 Error Gating: Shows errors when touched OR submitCount > 0
1. Prop Precedence: Explicit props override bridge-derived values
1. Visibility Control: Supports visibleWhen predicate for conditional rendering
1. Touch Tracking: Marks field as touched on blur
1. MUI Variants: Supports outlined, filled, standard
   Key Differences from TextField:

- NumberField is specialized for numeric input (type="number")
- No layout prop (NumberField uses MUI variant only, not Dashforge layout system)
- Numeric-specific: inputProps={{ min, max, step }}
- Empty value → null (not empty string)
  Key Differences from Select:
- No runtime data loading (no async options)
- No getOptionLabel/getOptionValue mappers
- No unresolved value policy concerns
- Simpler architectural surface

---

2. Documentation Accuracy Assessment
   ✅ Already Accurate (No Changes Needed)
1. NumberFieldExamples.tsx - Examples are correct and working
1. NumberFieldLayoutVariants.tsx - Correctly documents MUI variants
1. NumberFieldPlayground.tsx - Fully functional interactive playground
1. numberFieldPlayground.helpers.ts - Correct preset configurations
   ⚠️ Requires Terminology Updates
1. NumberFieldDocs.tsx - Hero description needs enhancement
1. NumberFieldCapabilities.tsx - Card 3 needs Reactive V2 alignment
1. NumberFieldNotes.tsx - Note 4 needs terminology update
1. NumberFieldScenarios.tsx - Accurate but could use minor clarifications
1. NumberFieldApi.tsx - Missing prop descriptions + needs section note

---

3. Reactive V2 Policy Compliance Review
   Current Compliance Status
   Policy Rule
   visibleWhen is component-level
   No automatic reconciliation claims
   No automatic reset claims
   Engine provides state, component renders
   Developer-facing language
   Terminology Gaps Identified
   Current Terminology Issues:

- Uses "Predictable Form Behavior" (vague)
- Missing "DashForm integration" language
- Missing "automatic field binding" clarity
- Missing "form-provided" vs "explicit prop" distinction
- Card 3 needs "Reactive Visibility" title (following TextField pattern)

---

4. File-by-File Implementation Plan
   4.1 NumberFieldDocs.tsx
   Application: web  
   Folder: web/src/pages/Docs/components/number-field  
   File: NumberFieldDocs.tsx
   Changes Required:

- Hero Description (lines 44-57): Update to match TextField pattern with developer-facing language
  Current:
  A specialized input component designed for numeric values. Provides
  built-in handling for min/max constraints, step increments, and
  numeric validation while preserving the same layout and behavior
  system used across Dashforge form inputs.
  Proposed:
  A specialized numeric input component built on MUI TextField. Supports
  standalone usage, seamless DashForm integration with automatic field
  binding and validation error gating, reactive visibility, and built-in
  numeric parsing (stores number | null, never NaN). Provides min/max
  constraints and step increments.
  Why: Clarifies the three core capabilities (standalone, DashForm, visibility) using developer-facing language consistent with TextField docs.
  Estimated Lines: ~5 lines

---

4.2 NumberFieldCapabilities.tsx
Application: web  
Folder: web/src/pages/Docs/components/number-field  
File: NumberFieldCapabilities.tsx
Changes Required:
Card 3: "Predictable Form Behavior" → "Reactive Visibility"
Current (lines 54-72):
{
title: 'Predictable Form Behavior',
status: 'Form-Connected',
// ...
description:
'Works seamlessly with DashForm and React Hook Form. Automatic type coercion, validation, and error display following form closure rules.',
points: [
'Automatic numeric type handling in forms',
'Reactive visibility with visibleWhen prop',
'Consistent error gating (touched + submitCount)',
],
}
Proposed:
{
title: 'Reactive Visibility',
status: 'Available Now',
statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
description:
'NumberField supports conditional rendering through the visibleWhen prop. Component-level visibility controlled by engine-driven predicates. Enables numeric field dependencies and dynamic form flows. Built on Reactive V2 architecture.',
points: [
'Conditional rendering via visibleWhen',
'Engine-driven predicates with access to all field state',
'Component decides rendering, engine provides state',
],
code: `<NumberField
  name="quantity"
  label="Quantity"
  visibleWhen={(engine) => 
    engine.getNode('orderType')?.value === 'bulk'
  }
/>`,
}
Why:

- Follows TextField "Reactive Visibility" pattern
- Uses precise terminology ("component-level visibility controlled by engine-driven predicates")
- Status changed to "Available Now" (matches TextField)
- Code example shows numeric-specific use case
  Note: Consider creating a new Card 3a for "DashForm Integration" to maintain three capabilities.
  Estimated Lines: ~25 lines

---

4.3 NumberFieldNotes.tsx
Application: web  
Folder: web/src/pages/Docs/components/number-field  
File: NumberFieldNotes.tsx
Changes Required:
Note 4: "Form Compatibility" → "DashForm Integration"
Current (lines 30-33):
{
title: 'Form Compatibility',
content:
'When used inside DashForm, NumberField automatically integrates with React Hook Form through the DashFormBridge. It handles value binding, type conversion, validation, and error display without explicit prop passing.',
},
Proposed:
{
title: 'DashForm Integration',
content:
'When used inside DashForm, NumberField automatically integrates through DashFormBridge. It handles automatic field binding, numeric type conversion (string → number | null), validation from form context, and error display following Form Closure v1 rules (errors show when touched OR submitted). Explicit props override form-provided values.',
},
Why:

- Uses "DashForm Integration" (developer-facing, consistent with TextField)
- Mentions "automatic field binding" and "form-provided values"
- Clarifies Form Closure v1 behavior
- Adds prop precedence note
  Optional: Add a new Note 7 about "Foundation Role" if NumberField is used as a base for other components.
  Estimated Lines: ~10 lines

---

4.4 NumberFieldScenarios.tsx
Application: web  
Folder: web/src/pages/Docs/components/number-field  
File: NumberFieldScenarios.tsx
Changes Required:
Minor terminology updates in scenario descriptions to use "DashForm integration" and "automatic field binding" language.
Current (lines 203-204):
description:
'NumberField integrates seamlessly with DashForm for basic numeric input. It automatically handles type conversion, stores values as number | null, and displays validation errors after blur.',
Proposed:
description:
'NumberField integrates seamlessly with DashForm through automatic field binding. It handles numeric type conversion (string → number | null), validation from form context, and error display following Form Closure v1 rules (errors show when touched OR submitted).',
Why: More precise terminology consistent with TextField docs.
Estimated Lines: ~15 lines across 2 scenarios

---

4.5 NumberFieldApi.tsx
Application: web  
Folder: web/src/pages/Docs/components/number-field  
File: NumberFieldApi.tsx
Changes Required:

1. Update prop descriptions (lines 17-93)
   Current Issues:

- error description is too brief
- helperText missing precedence note
- rules description too brief
- visibleWhen description too brief
  Proposed Updates:
  {
  name: 'error',
  type: 'boolean',
  defaultValue: 'false',
  description: 'If true, displays error state. Explicit prop overrides form-provided error state.',
  },
  {
  name: 'helperText',
  type: 'string',
  description: 'Helper text below input. Explicit prop overrides form-provided error messages.',
  },
  {
  name: 'rules',
  type: 'ValidationRules',
  description: 'Validation rules for DashForm integration (required, min, max, custom validators)',
  },
  {
  name: 'visibleWhen',
  type: '(engine) => boolean',
  description: 'Predicate for conditional rendering. Component evaluates this on engine state changes. Returns null when false.',
  },

2.  Add section note after table (following TextField pattern)
    Proposed (new content after line 232):
    <Box
    sx={{
        mt: 3,
        p: 2.5,
        borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
        border: isDark
          ? '1px solid rgba(139,92,246,0.20)'
          : '1px solid rgba(139,92,246,0.15)',
      }}
    > <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
          mb: 1,
        }}
    >
        Explicit vs Form-Provided Props
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.6,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
        }}
      >
        When NumberField is used inside DashForm, values are automatically bound
        from the form context. You can explicitly pass <code>error</code>,{' '}
        <code>helperText</code>, <code>value</code>, or <code>onChange</code> to
        override form-provided behavior.
      </Typography>
    </Box>
    Why: Clarifies prop precedence using developer-facing language ("form-provided").
    Estimated Lines: ~40 lines

---

4.6 Files Not Requiring Changes
No changes needed for:

1. NumberFieldExamples.tsx - Already accurate
2. NumberFieldLayoutVariants.tsx - Already accurate
3. NumberFieldPlayground.tsx - Already accurate
4. numberFieldPlayground.helpers.ts - Already accurate

---

5. Architecture Alignment Summary
   Usage Modes Documentation (Post-Update)
1. Standalone / Controlled Usage

- ✅ Already documented in Examples (Basic example)
- ✅ Correctly shows controlled mode with value and onChange

2. DashForm Integration

- ⚠️ Needs terminology update - Change "Form Compatibility" → "DashForm Integration"
- ⚠️ Add "automatic field binding" and "form-provided values" language
- ✅ Scenarios already demonstrate this correctly

3. Numeric-Specific Behavior

- ✅ Already documented accurately
  - Numeric Parsing note explains number | null storage
  - Empty Values note explains null handling
  - Min/Max Validation note explains dual-layer constraints
  - Examples show inputProps={{ min, max, step }}

4. Visibility Behavior

- ⚠️ Needs update - Currently buried in Card 3
- Proposed: Create dedicated "Reactive Visibility" card following TextField pattern
- Clarify: component-level conditional rendering, engine-driven predicates

5. Layout Behavior

- ✅ Already documented accurately
- NumberField uses MUI variant prop (not Dashforge layout system)
- Layout Variants section correctly explains outlined, filled, standard

---

6. Validation Strategy
   Pre-Implementation Validation
1. ✅ Source Code Review: Verified NumberField implementation matches docs
1. ✅ Policy Compliance: Confirmed alignment with Reactive V2 policy
1. ✅ Pattern Consistency: Checked TextField and Select docs for established patterns
   Post-Implementation Validation
1. Build Verification:
   npx nx build web
   Expected: 0 errors (no TypeScript issues)
1. Visual Verification:
   - Navigate to NumberField docs page in dev server
   - Verify all sections render correctly
   - Check capability cards display properly
   - Verify code examples are readable
1. Content Accuracy:
   - Confirm terminology is consistent across all sections
   - Verify no outdated architectural claims remain
   - Check that all code examples are copy-paste ready
1. Cross-Reference Check:
   - Compare NumberField docs terminology with TextField docs
   - Ensure consistent use of "DashForm integration", "automatic field binding", "form-provided"

---

7. Implementation Checklist
   Phase 1: Terminology Updates (Core Alignment)

- [ ] NumberFieldDocs.tsx: Update hero description (~5 lines)
- [ ] NumberFieldCapabilities.tsx: Update Card 3 to "Reactive Visibility" (~25 lines)
- [ ] NumberFieldNotes.tsx: Update Note 4 terminology (~10 lines)
      Phase 2: API Documentation Enhancement
- [ ] NumberFieldApi.tsx: Update prop descriptions (~20 lines)
- [ ] NumberFieldApi.tsx: Add "Explicit vs Form-Provided Props" section (~20 lines)
      Phase 3: Scenario Clarifications
- [ ] NumberFieldScenarios.tsx: Update scenario descriptions (~15 lines)
      Phase 4: Validation
- [ ] Run build command
- [ ] Visual inspection in dev server
- [ ] Cross-reference with TextField docs
- [ ] Confirm policy compliance

---

8. Comparison with TextField/Select Updates
   Component Files Modified Lines Changed Complexity
   Select 7 ~380 High
   TextField 5 ~145 Medium
   NumberField 5 ~120-150 Low
   NumberField Characteristics:

- Simpler than Select: No runtime data loading, no mapper functions
- Similar to TextField: DashForm integration, visibility, error gating
- Numeric-Specific: Parsing behavior, min/max/step, null handling

---

9. Notes and Confirmations
   ✅ Confirmations
1. Existing docs structure will be preserved - No layout redesign
1. No new core NumberField behavior - Documentation alignment only
1. Docs become authoritative reference - After update, docs accurately reflect implementation
1. Surgical but complete changes - Minimum necessary updates for policy compliance
1. All examples remain working - No breaking changes to interactive demos
   📋 Open Questions for User
1. Capability Cards: Should we keep 3 cards or split into 4?
   - Option A (3 cards): Keep current structure, update Card 3 to "Reactive Visibility"
   - Option B (4 cards): Add dedicated "DashForm Integration" card, make "Reactive Visibility" Card 4
1. Layout Documentation: NumberField doesn't use Dashforge layout prop (only MUI variant). Should we add a note clarifying this difference from TextField?
1. Foundation Role: Is NumberField used as a composition base for other components (like TextField is for Select)? If so, should we add a note similar to TextField's "Foundation for Composed Behaviors"?

---

10. Suggested Implementation Sequence
1. ✅ Planning Complete - This document serves as the plan
1. Await User Approval - Confirm plan before implementation
1. Phase 1: Core terminology updates (Docs, Capabilities, Notes)
1. Phase 2: API documentation enhancement
1. Phase 3: Scenario clarifications
1. Phase 4: Build and validation
1. Create Build Report - Document in .opencode/reports/numberfield-docs-architecture-alignment-build.md

---

Summary
The NumberField documentation is largely accurate and requires targeted terminology updates (~120-150 lines across 5 files) to align with:

- Reactive V2 policy compliance
- Developer-facing language consistency (TextField/Select pattern)
- Explicit vs form-provided props distinction
- Component-level visibility behavior clarification
  No new behavior, no structural redesign, no breaking changes.
  The update will make NumberField docs the authoritative reference for developers using numeric inputs in Dashforge forms.
