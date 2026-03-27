# TextField Documentation Architecture Alignment Plan

**Status**: Ready for Approval  
**Date**: Mon Mar 23 2026  
**Task**: `textfield-docs-architecture-alignment.md`  
**Policy Compliance**: `reaction-v2.md`

---

## Executive Summary

The TextField component documentation requires alignment with current architectural reality following Reactive V2 integration and bridge-based form architecture. This plan outlines **surgical, minimum-complete updates** to reflect TextField's role as a foundational component while preserving existing structure and visual design.
**Key Differences from Select**:

- TextField does NOT have runtime options (not applicable to text input)
- Focus is on validation gating, layouts, and visibility behavior
- TextField is MORE fundamental than Select (acts as composition base)
- Documentation emphasizes foundation role, not runtime data loading
  **Key Changes Required**:
- Update "Predictive Ready" capability to "Reactive V2" (align with Select pattern)
- Clarify validation gating behavior (touched/submitted error display)
- Document layout modes architecturally (not just styling)
- Emphasize bridge-based DashForm integration
- Clarify visibleWhen as component-level, engine-driven
- Document TextField's role as Select mode composition foundation
- Update API reference for accuracy
  **Preserved**:
- Existing page structure (hero, sections, navigation)
- Visual design system (`DocsPreviewBlock`, theme, styling)
- All existing examples (verified for accuracy, minor updates only)
- Current demos (already accurate)

---

## Architecture Alignment Summary

### Current Architecture State (Reality)

**TextField Component Nature**:

1. **Foundation Component** - Base for composed behaviors (e.g., Select mode)
2. **Three Usage Modes**:
   - **Standalone/Controlled**: Standard React controlled component (value + onChange)
   - **DashForm Integration**: Automatic RHF binding via DashFormBridge
   - **Reactive/Conditional**: Supports visibleWhen for conditional rendering
3. **Bridge-Based Integration** - Uses DashFormBridge for form context
4. **Validation Gating** - Errors show only when touched OR submitted (Form Closure v1)
5. **Layout Modes** - Architectural concern: floating, stacked, inline
6. **Select Mode Composition** - TextField with `select` prop enables Select behavior
7. **NO Runtime Options** - Unlike Select, TextField doesn't load async option data

### Documentation Gaps (Current State)

**Critical Gaps**:

1. **TextFieldCapabilities.tsx** - "Predictive Ready" is vague/aspirational (should be "Reactive V2")
2. **TextFieldNotes.tsx** - "Predictive Forms" note is vague about visibleWhen
3. **TextFieldScenarios.tsx** - Already has visibility demo (accurate) but uses old "Predictive" terminology
4. **TextFieldApi.tsx** - Missing explicit documentation of bridge-based integration
5. **TextFieldDocs.tsx** - Hero description mentions "predictable state management" (vague)
   **Secondary Gaps**:

- Validation gating behavior mentioned but not emphasized
- Layout modes presented as visual variants, not architectural modes
- Foundation role (Select composition) not mentioned
- Bridge integration implicit, not explicit

### Alignment Strategy

**Preserve + Clarify**:

- Keep all existing sections and structure
- Update terminology from "Predictive" to "Reactive V2" where appropriate
- Clarify bridge-based integration explicitly
- Emphasize validation gating and layouts as architectural features
- Add foundation role note (Select composition)
  **Three-Mode Clarity**:
  Every relevant section will clearly distinguish:

1. **Standalone/Controlled** - Basic React patterns
2. **DashForm Integration** - Bridge-based RHF integration
3. **Reactive/Conditional** - visibleWhen behavior, engine-driven
   **Policy Compliance**:
   All Reactive V2 references will follow `reaction-v2.md`:

- visibleWhen is component-level (not engine-controlled visibility)
- No automatic reconciliation claims
- Engine provides state, component makes rendering decisions
- Distinction between runtime state (Select) and component visibility (TextField)

---

## File-by-File Update Plan

### 1. `TextFieldDocs.tsx` (Main Page Structure)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldDocs.tsx`  
**Current State**:

- Hero section exists with description (line 52-55)
- Current description: "An intelligent input component with seamless form integration, automatic error handling, and predictable state management."
- Quick-start code shows basic TextField (line 139-141)
- Page structure uses section-based layout
  **Required Changes**:

1. **Hero Description** (line 52-55):
   - Update vague "predictable state management" to be more specific
   - Emphasize bridge-based integration and validation gating
     **Updated Hero Description**:

```tsx
// Line 52-55: Update description
An intelligent input component built on MUI TextField. Supports standalone usage,
seamless DashForm integration through bridge architecture, validation error gating,
and reactive visibility. The foundation for composed field behaviors.
```

2. **Quick-Start Code** (line 139-141):
   - Keep existing simple example (correct for quick-start per user corrections)
   - Do NOT add complex examples here
     **Why**: Hero sets architectural tone. "Predictable state management" is too vague. Quick-start must stay simple.

---

### 2. `TextFieldCapabilities.tsx` (Progressive Adoption Model)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldCapabilities.tsx`  
**Current State**:

- 3 capability cards: "Controlled", "React Hook Form Ready", "Predictive Ready" (lines 14-75)
- Card 3 "Predictive Ready" uses vague language (lines 54-74)
- Card 3 status: "Architectural Direction" (aspirational tone)
- Card 3 code example shows visibleWhen (accurate)
  **Required Changes**:

1. **Update Card 3 Title**: "Predictive Ready" → "Reactive V2"
2. **Update Card 3 Status**: "Architectural Direction" → "Available Now"
3. **Update Card 3 Description**:
   - Remove aspirational language
   - Clarify current visibleWhen behavior
   - Emphasize component-level conditional rendering
   - Mention engine-driven predicates
4. **Update Card 3 Code Example**: Keep existing (already accurate)
   **Before** (lines 54-74):

```tsx
{
  title: 'Predictive Ready',
  status: 'Architectural Direction',
  description: 'TextField is architecturally positioned to participate in rule-driven workflows. Supports reactive visibility and is designed for future orchestration capabilities.',
  points: [
    'Reactive visibility with visibleWhen prop',
    'Built to support field-to-field dependencies',
    'Aligned with Dashforge predictive form vision',
  ],
  // ...
}
```

**After**:

```tsx
{
  title: 'Reactive V2',
  status: 'Available Now',
  statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
  statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
  statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
  description: 'TextField supports reactive conditional rendering through the visibleWhen prop. Component-level visibility controlled by engine-driven predicates. Enables field-to-field dependencies and dynamic form flows without manual state orchestration.',
  points: [
    'Conditional rendering via visibleWhen',
    'Engine-driven predicates with access to all field state',
    'Component decides rendering, engine provides state',
  ],
  code: `<TextField
  name="other"
  label="Other"
  visibleWhen={(engine) =>
    engine.getNode('category')?.value === 'other'
  }
/>`
}
```

## **Why**: "Predictive Ready" is misleading. Current reality is "Reactive V2" with clear visibleWhen behavior. Aligns with Select docs pattern.

### 3. `TextFieldNotes.tsx` (Implementation Notes)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldNotes.tsx`  
**Current State**:

- 6 implementation notes (lines 13-44)
- Note 2: "Form Integration" - accurate but could be more explicit about bridge
- Note 4: "Error Gating" - accurate (touched/submitted gating)
- Note 5: "Predictive Forms" - vague about visibleWhen
  **Required Changes**:

1. **Update Note 2 Title**: "Form Integration" → "DashForm Integration (Bridge-Based)"
2. **Update Note 2 Content**:
   - Make bridge architecture explicit
   - Clarify automatic registration
3. **Update Note 5 Title**: "Predictive Forms" → "Reactive Visibility (Reactive V2)"
4. **Update Note 5 Content**:
   - Clarify visibleWhen is component-level
   - Emphasize engine-driven predicates
   - Remove vague "dynamic form behavior" language
5. **Add Note 7**: "Foundation for Composed Behaviors"
   **Updated Note 2**:

```tsx
{
  title: 'DashForm Integration (Bridge-Based)',
  content: 'When used inside DashForm, TextField automatically integrates with React Hook Form through the DashFormBridge. The bridge handles field registration, value binding, validation state, and error display. No explicit prop passing required—components self-register on mount.',
}
```

**Updated Note 5**:

```tsx
{
  title: 'Reactive Visibility (Reactive V2)',
  content: 'TextField supports conditional rendering through the visibleWhen prop. This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
}
```

**New Note 7**:

```tsx
{
  title: 'Foundation for Composed Behaviors',
  content: 'TextField serves as the architectural foundation for composed field behaviors. For example, passing the select prop to TextField enables native select dropdown behavior, which is how the Select component is implemented. This composition pattern maintains consistency across field types while enabling specialized functionality.',
}
```

## **Why**: Notes must accurately reflect bridge architecture, visibleWhen behavior, and TextField's foundation role. Remove vague "Predictive Forms" terminology.

### 4. `TextFieldApi.tsx` (API Reference Table)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldApi.tsx`  
**Current State**:

- 12 props documented (lines 17-82)
- Props include: name, label, value, onChange, error, helperText, disabled, fullWidth, multiline, rows, rules, visibleWhen
- All current descriptions are accurate
- Missing: explicit precedence note, layout prop
  **Required Changes**:

1. **Add Missing Props**:
   - Add `layout` prop (currently missing from API table)
2. **Update Descriptions** for clarity:
   - `rules`: Clarify bridge integration
   - `visibleWhen`: Clarify component-level + engine-driven
   - `error`/`helperText`: Add precedence note
3. **Add Section Note**: Explicit vs Bridge-Provided Props
   **New Prop** (insert after `rows`):

```tsx
{
  name: 'layout',
  type: "'floating' | 'stacked' | 'inline'",
  defaultValue: "'floating'",
  description: 'Field layout mode. floating: standard MUI floating label (internal). stacked: external label above control. inline: external label to left of control. Layout is architectural, not just styling.',
}
```

**Updated Prop** (`rules`):

```tsx
{
  name: 'rules',
  type: 'ValidationRules',
  description: 'Validation rules for DashForm integration. Format follows React Hook Form rules contract. Only used when inside DashForm—ignored in standalone mode.',
}
```

**Updated Prop** (`visibleWhen`):

```tsx
{
  name: 'visibleWhen',
  type: '(engine: Engine) => boolean',
  description: 'Component-level conditional rendering predicate. Receives engine instance with access to all field state via getNode(name). When false, component renders null. Re-evaluates on dependency changes. Only works inside DashForm (requires engine).',
}
```

**Updated Props** (`error` / `helperText`):

```tsx
{
  name: 'error',
  type: 'boolean',
  defaultValue: 'false',
  description: 'If true, displays error state. Explicit error prop overrides bridge-provided error state. When inside DashForm without explicit prop, error is gated (shows only when touched OR submitted).',
}
{
  name: 'helperText',
  type: 'string',
  description: 'Helper text displayed below input. Explicit helperText prop overrides bridge-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
}
```

**New Section Note** (add before table):

```tsx
<Typography variant="body2" sx={{ mb: 2 /* styling */ }}>
  <strong>Explicit vs Bridge-Provided Props:</strong> When inside DashForm,
  TextField receives value, error, helperText, onChange, and onBlur from the
  bridge automatically. Explicit props always take precedence over
  bridge-provided values.
</Typography>
```

## **Why**: API reference must document all props accurately. `layout` is missing. Precedence and bridge behavior must be explicit for developer clarity.

### 5. `TextFieldExamples.tsx` (Basic Examples)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldExamples.tsx`  
**Current State**:

- 7 examples (lines 23-117): Basic, Disabled, Error State, Full Width, Inline Layout, Inline with Helper Text, Multiline
- All examples are accurate
- Examples use standalone TextField (no DashForm)
- No DashForm integration example
  **Required Changes**:
  **Decision**: Keep examples as-is (standalone focused).
  **Rationale**:
- Examples section traditionally shows standalone/controlled usage
- DashForm integration is demonstrated in Scenarios section (already exists)
- Adding DashForm example here would duplicate Scenarios content
- Current examples are accurate and serve their purpose (visual/layout exploration)
  **Minor Update** (optional, line 19 section intro):
- Add clarifying text: "These examples show TextField in standalone mode. For DashForm integration, see Form Integration scenario below."
  **Why**: Examples are already accurate. DashForm usage is better demonstrated in Scenarios. Avoid duplication.

---

### 6. `TextFieldScenarios.tsx` (Integration Scenarios)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldScenarios.tsx`  
**Current State**:

- 2 scenarios (lines 27-132): "React Hook Form Integration", "Predictive Form Behavior"
- Both scenarios are accurate and work correctly
- Scenario 2 uses "Predictive Form Behavior" title (outdated terminology)
- Both demos exist and are accurate (FormIntegrationDemo, PredictiveDemo)
  **Required Changes**:

1. **Update Scenario 2 Title**: "Predictive Form Behavior" → "Reactive Conditional Visibility"
2. **Update Scenario 2 Description**:
   - Replace "Predictive" with "Reactive V2" terminology
   - Clarify component-level conditional rendering
   - Emphasize engine-driven predicates
3. **Update Scenario 2 Code Comments**:
   - Clarify Engine API provides state access
   - Component makes rendering decision
     **Updated Scenario 2**:

```tsx
{
  id: 'reactive-conditional-visibility',
  title: 'Reactive Conditional Visibility',
  subtitle: 'Try it: Select a contact method and watch fields appear',
  description: 'TextField supports conditional rendering through the visibleWhen prop (Reactive V2). Fields render based on engine state—components query field values and make rendering decisions. Select "Email" or "Phone" to see conditional fields appear instantly without manual state orchestration.',
  demo: <PredictiveDemo />,
  code: `import { DashForm } from '@dashforge/forms';
import { TextField, Select } from '@dashforge/ui';
function ContactForm() {
  return (
    <DashForm defaultValues={{ contactMethod: '', phone: '', email: '' }}>
      <Select
        name="contactMethod"
        label="Preferred Contact Method"
        options={[
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' }
        ]}
      />
      {/* Email field: renders only when email is selected */}
      <TextField
        name="email"
        label="Email Address"
        rules={{ required: 'Email is required' }}
        visibleWhen={(engine) => {
          const node = engine.getNode('contactMethod');
          return node?.value === 'email';
        }}
      />
      {/* Phone field: renders only when phone is selected */}
      <TextField
        name="phone"
        label="Phone Number"
        rules={{ required: 'Phone is required' }}
        visibleWhen={(engine) => {
          const node = engine.getNode('contactMethod');
          return node?.value === 'phone';
        }}
      />
    </DashForm>
  );
}
// The Engine API provides:
// - getNode(name): Access any field's state
// - Component re-renders on dependency changes
// - Component makes rendering decision (engine provides state)`,
  whyItMatters: 'Build adaptive forms where field visibility responds to user input. The component handles conditional rendering—you define the predicate. No manual state orchestration required.',
}
```

## **Why**: "Predictive Form Behavior" is outdated terminology. "Reactive Conditional Visibility" accurately reflects visibleWhen behavior. Aligns with Reactive V2 architecture.

### Files 7-12: No Changes Required

**The following files are accurate and require no updates**: 7. **TextFieldLayoutVariants.tsx** - Layout demonstration is accurate 8. **TextFieldPlayground.tsx** - Standalone playground is appropriate (no DashForm complexity needed) 9. **demos/FormIntegrationDemo.tsx** - Demo accurately shows DashForm integration 10. **demos/PredictiveDemo.tsx** - Demo accurately shows conditional visibility (code is correct) 11. **textFieldPlayground.helpers.ts** - Utility code, no changes needed 12. **TextFieldDebug.tsx** - Debug component, not user-facing

---

## Validation Strategy

### Phase 1: Pre-Implementation Validation

**Before writing code, verify**:

1. ✅ Read all current docs files (DONE)
2. ✅ Read current TextField implementation (DONE)
3. ✅ Read policy requirements (DONE)
4. ✅ Identify all gaps (DONE in this plan)
5. ✅ Plan minimum-complete updates (DONE in this plan)

### Phase 2: Implementation Validation

**During implementation**:

1. **Visual Verification**:
   - Run dev server: `npx nx serve web`
   - Navigate to TextField docs page
   - Verify all sections render correctly
   - Verify typography, spacing, colors match existing design
   - Test all interactive demos
2. **Functional Verification**:
   - Test FormIntegrationDemo (should work as-is)
   - Test PredictiveDemo (should work as-is)
   - Verify validation gating behavior (blur to trigger errors)
   - Verify submit triggers errors on untouched fields
   - Verify visibleWhen conditional rendering
3. **Content Verification**:
   - Read through entire page as end-user
   - Verify terminology consistency ("Reactive V2" not "Predictive")
   - Verify three usage modes are clear
   - Check for typos, broken formatting, inconsistencies

### Phase 3: Accuracy Verification

**Compare documentation against implementation**:

1. **API Reference Accuracy**:
   - Open `TextField.tsx` implementation
   - Compare props table against actual component props (TextFieldProps interface)
   - Verify type signatures match
   - Verify default values match
   - Verify descriptions match actual behavior
2. **Behavior Accuracy**:
   - Read `textField.validation.ts`
   - Verify documented validation gating matches implementation
   - Read `TextField.tsx` (lines 45-291)
   - Verify documented bridge integration matches implementation
   - Verify documented layout behavior matches implementation
3. **Policy Compliance**:
   - Re-read `reaction-v2.md`
   - Verify visibleWhen is described as component-level (not engine-controlled)
   - Verify no claims about runtime option loading (TextField doesn't have this)
   - Verify engine provides state, component decides rendering

### Phase 4: Cross-Reference Check

**Ensure consistency across all files**:

1. All files use consistent terminology:
   - "Reactive V2" (not "Predictive" or "Predictive Forms")
   - "bridge-based integration" (not just "form integration")
   - "validation gating" (not "error handling")
   - "component-level conditional rendering" (not "engine-controlled visibility")
2. All code examples use consistent patterns
3. All examples are copy-paste ready (valid syntax)
4. All type signatures match real implementation

### Phase 5: User Experience Validation

**Walk through as new developer**:

1. Start at top of page (hero)
2. Read quick-start → Should see simple TextField usage
3. Read examples → Should see standalone usage patterns
4. Try playground → Should explore visual/layout props
5. Read capabilities → Should understand three modes
6. Try scenarios → Should see DashForm integration + reactive visibility
7. Check API reference → Should find all props with clear descriptions
8. Read notes → Should understand bridge integration, validation gating, layouts
   **Success Criteria**:

- New developer can distinguish three usage modes
- Bridge-based integration is clear and explicit
- Validation gating behavior is understandable
- Layout modes are understood as architectural, not just styling
- visibleWhen behavior is clear (component-level, engine-driven)
- Foundation role (Select composition) is mentioned
- No confusion about "Predictive" vs "Reactive V2"

---

## Implementation Sequence

### Step 1: Terminology Updates (High Impact, Low Risk)

1. Update `TextFieldCapabilities.tsx` - Fix "Predictive Ready" → "Reactive V2"
2. Update `TextFieldNotes.tsx` - Fix note titles and content
3. Update `TextFieldScenarios.tsx` - Fix scenario 2 title and description
   **Rationale**: Terminology alignment is critical. Low risk (text-only changes).

### Step 2: API Documentation (Medium Impact, Low Risk)

4. Update `TextFieldApi.tsx` - Add missing props, update descriptions
   **Rationale**: API completeness is essential. Text and table updates only.

### Step 3: Hero and Content Polish (Low Impact, Low Risk)

5. Update `TextFieldDocs.tsx` - Fix hero description
   **Rationale**: Minor text update. Low risk.

### Step 4: Validation & Testing

6. Run dev server and test all changes
7. Verify all demos work interactively
8. Read through entire page for consistency
9. Compare API reference against TextField implementation
10. Verify policy compliance (no incorrect Reactive V2 claims)
    **Rationale**: Systematic validation before considering task complete.

---

## Risk Assessment

### Low Risk

- Terminology updates (pure text changes)
- API reference updates (table content only)
- Hero description update (single line)
- Implementation notes updates (text content)

### No Changes Required (Zero Risk)

- TextFieldExamples.tsx (already accurate)
- TextFieldLayoutVariants.tsx (already accurate)
- TextFieldPlayground.tsx (already accurate)
- FormIntegrationDemo.tsx (already accurate)
- PredictiveDemo.tsx (already accurate)
- textFieldPlayground.helpers.ts (utility code)

### Mitigation Strategies

1. **Incremental Testing**: Test each file change before moving to next
2. **Visual Comparison**: Compare before/after screenshots for layout consistency
3. **Rollback Plan**: Git commit after each major section
4. **Review Checklist**: Use validation strategy checklist before marking complete

---

## Out of Scope (Confirmed)

### Will NOT Be Changed

1. ✅ TextField component implementation (no new features)
2. ✅ Reactive V2 engine behavior (no architecture changes)
3. ✅ DashForm core (no form engine changes)
4. ✅ Documentation routing (no route changes)
5. ✅ Documentation visual design (preserve current theme/styling)
6. ✅ Other component docs (only TextField)
7. ✅ TextFieldExamples.tsx (already accurate, standalone-focused)
8. ✅ TextFieldLayoutVariants.tsx (already accurate)
9. ✅ TextFieldPlayground.tsx (decision: keep standalone-focused)
10. ✅ FormIntegrationDemo.tsx (already accurate)
11. ✅ PredictiveDemo.tsx (already accurate)
12. ✅ textFieldPlayground.helpers.ts (utility code)
13. ✅ TextFieldDebug.tsx (not user-facing)

### Will NOT Be Introduced

1. ✅ Runtime options (TextField doesn't have this capability)
2. ✅ New TextField props (document existing only)
3. ✅ New demos (existing demos are accurate)
4. ✅ Marketing redesign (preserve structure)
5. ✅ DashForm integration in playground (keep simple)
6. ✅ Backend integrations (not applicable)

---

## Notes & Confirmations

### Structure Preservation

✅ **Confirmed**: Existing docs page structure will be preserved.

- All sections remain (hero, quick-start, examples, playground, capabilities, scenarios, API, notes, layout variants)
- Section order unchanged
- Visual design system unchanged
- Navigation unchanged

### Behavioral Integrity

✅ **Confirmed**: No new TextField core behavior will be introduced.

- Documentation reflects **current** implementation only
- All examples use **existing** component capabilities
- No new props or features added to component

### Authoritative Reference

✅ **Confirmed**: After completion, TextField docs will be the authoritative reference.

- Developers can trust all examples work as shown
- API reference will be complete and accurate
- Behavioral patterns (validation gating, layouts, visibleWhen) explained
- Three usage modes clearly distinguished
- Foundation role (Select composition) documented

### Policy Compliance

✅ **Confirmed**: All Reactive V2 documentation follows `reaction-v2.md` policy.

- visibleWhen described as component-level (not engine-controlled)
- No claims about runtime option loading (TextField doesn't have this)
- Engine provides state access, component decides rendering
- Distinction between TextField visibility and Select runtime options clear

### Terminology Alignment

✅ **Confirmed**: Aligns with Select documentation terminology.

- "Reactive V2" replaces "Predictive" / "Predictive Ready"
- "Bridge-based integration" used consistently
- "Validation gating" used for error display behavior
- "Component-level conditional rendering" for visibleWhen

---

## Success Criteria

### Documentation Completeness

- [ ] All three usage modes documented (standalone, DashForm, reactive)
- [ ] Bridge-based integration explicitly documented
- [ ] Validation gating behavior clearly explained
- [ ] Layout modes presented as architectural features
- [ ] visibleWhen behavior accurately described (component-level, engine-driven)
- [ ] Foundation role documented (Select composition base)
- [ ] API reference complete (all props present with accurate descriptions)

### Terminology Consistency

- [ ] "Reactive V2" used instead of "Predictive" / "Predictive Ready"
- [ ] "Bridge-based integration" used for form integration
- [ ] "Validation gating" used for error display behavior
- [ ] Consistent with Select documentation terminology

### Example Quality

- [ ] All existing examples remain accurate
- [ ] All code examples are copy-paste ready
- [ ] All demos work interactively without errors
- [ ] No duplication between Examples and Scenarios sections

### User Experience

- [ ] New developer can understand three modes within 5 minutes
- [ ] Bridge integration is discoverable and clear
- [ ] Validation gating behavior is non-surprising (clearly explained)
- [ ] Layout modes understood as architectural, not just styling
- [ ] visibleWhen behavior is clear and accurate
- [ ] Foundation role is mentioned but not overemphasized

### Technical Accuracy

- [ ] API reference matches implementation (verified against TextField.tsx)
- [ ] Behavioral descriptions match implementation
- [ ] Type signatures are correct
- [ ] Default values are correct
- [ ] No claims about unsupported features (e.g., runtime options)

### Policy Compliance

- [ ] visibleWhen described as component-level (not engine-controlled)
- [ ] No claims about runtime option loading (TextField doesn't support this)
- [ ] Engine provides state, component decides rendering (distinction clear)
- [ ] Terminology aligns with Reactive V2 policy

---

## Appendices

### A. File Modification Summary

| File                      | Change Type | Risk Level | Lines Changed (Est.) |
| ------------------------- | ----------- | ---------- | -------------------- |
| TextFieldDocs.tsx         | Update      | Low        | ~5                   |
| TextFieldCapabilities.tsx | Update      | Low        | ~25                  |
| TextFieldNotes.tsx        | Update      | Low        | ~30                  |
| TextFieldScenarios.tsx    | Update      | Low        | ~40                  |
| TextFieldApi.tsx          | Update      | Low        | ~35                  |
| **TOTAL**                 |             |            | **~135 lines**       |

**Note**: No new files. No files removed. Significantly less churn than Select docs update.

### B. Testing Checklist

**Before Implementation**:

- [x] Read all current docs files
- [x] Read current TextField implementation
- [x] Read policy requirements
- [x] Plan changes
      **During Implementation**:
- [ ] Test each file change incrementally
- [ ] Verify code syntax (no TypeScript errors)
- [ ] Verify formatting matches existing style
- [ ] Run dev server after each change
      **After Implementation**:
- [ ] Full page walkthrough as new user
- [ ] Test all interactive demos
- [ ] Verify all sections render correctly
- [ ] Check for typos and formatting issues
- [ ] Compare API reference against TextField.tsx
- [ ] Verify policy compliance (visibleWhen described correctly)

### C. Key Terminology

Use these terms consistently across all documentation:
| Preferred Term | Avoid These Terms |
|----------------|-------------------|
| Reactive V2 | Predictive, Predictive Ready, Predictive Forms |
| bridge-based integration | automatic integration, form integration |
| validation gating | error handling, automatic error display |
| component-level conditional rendering | engine-controlled visibility, reactive visibility |
| layout modes | layout styles, layout variants |
| standalone usage | plain usage, uncontrolled usage |
| DashForm integration | form usage, React Hook Form usage |

### D. TextField vs Select Documentation Differences

**Key Differences**:

1. **Runtime Options**: Select has them, TextField does NOT
2. **Focus Areas**:
   - Select: runtime data loading, option mappers, unresolved values
   - TextField: validation gating, layouts, foundation role
3. **Documentation Scope**:
   - Select: Added runtime examples, demos, API props (~350 lines)
   - TextField: Terminology updates, clarifications only (~135 lines)
4. **Foundation Role**:
   - TextField is MORE fundamental (composition base)
   - Select is built ON TextField (with select prop)
     **Similarities**:
5. Both align "Predictive Ready" → "Reactive V2"
6. Both clarify bridge-based integration
7. Both emphasize three usage modes
8. Both preserve existing structure
9. Both follow Reactive V2 policy

---

## Approval Required

This plan is ready for review and approval before implementation begins.
**Key Questions for Stakeholders**:

1. Is the scope appropriate (terminology updates + clarifications only)?
2. Should TextFieldPlayground remain standalone-focused, or add DashForm integration?
3. Are there any other gaps not covered in this plan?
4. Is the foundation role (Select composition) sufficiently documented without overemphasis?
   **Recommendation**: Approve and proceed with implementation in the sequence outlined.

---

**End of Plan**
Perfect! I've successfully created a comprehensive plan for the TextField documentation alignment. Let me summarize what we've accomplished:

---

Summary: TextField Documentation Alignment Plan Complete
What We've Done So Far
Completed Work:

1. ✅ Select Component Documentation - Aligned with Reactive V2 (~380 lines, 6 files modified + 1 new demo)
2. ✅ TextField Planning Phase - Comprehensive plan created and saved
   Current Status: Planning Phase Complete
   I've created a detailed plan for TextField documentation alignment that:
   Key Findings:

- Much less work than Select (~135 lines vs ~380 lines)
- No new demos needed (existing demos are accurate)
- Focus on terminology updates ("Predictive" → "Reactive V2")
- Clarification-focused (not adding new examples)
  Files Requiring Updates (5 total):

1. TextFieldDocs.tsx - Update hero description (~5 lines)
2. TextFieldCapabilities.tsx - Update "Predictive Ready" card (~25 lines)
3. TextFieldNotes.tsx - Update 2 notes + add 1 new note (~30 lines)
4. TextFieldScenarios.tsx - Update scenario 2 terminology (~40 lines)
5. TextFieldApi.tsx - Add layout prop + update descriptions (~35 lines)
   Files Already Accurate (7 files require NO changes):

- TextFieldExamples.tsx
- TextFieldLayoutVariants.tsx
- TextFieldPlayground.tsx
- FormIntegrationDemo.tsx
- PredictiveDemo.tsx
- textFieldPlayground.helpers.ts
- TextFieldDebug.tsx
  Plan Document Location
  📄 Plan saved to: /Users/mcs/projects/web/dashforge/.opencode/plans/textfield-docs-architecture-alignment-plan.md
  The plan includes:
- Executive Summary - Scope and key differences from Select
- Architecture Alignment Summary - Current state, gaps, strategy
- File-by-File Update Plan - Detailed changes for each file
- Validation Strategy - 5-phase validation approach
- Implementation Sequence - Step-by-step execution order
- Risk Assessment - Low risk (terminology updates only)
- Appendices - Testing checklist, terminology guide, comparison with Select
  Key Insights from Planning
  TextField is fundamentally different from Select:

1. No runtime options (TextField doesn't load async data like Select does)
2. More fundamental (TextField is the composition base for Select)
3. Lighter documentation update (terminology alignment vs feature documentation)
4. Already mostly accurate (existing demos work correctly)
   Pattern Consistency:

- Aligns "Predictive Ready" → "Reactive V2" (consistent with Select)
- Emphasizes bridge-based integration (consistent pattern)
- Clarifies three usage modes (consistent structure)
- Follows reaction-v2.md policy (mandatory compliance)
  Next Steps (When Ready to Implement)
  Implementation would follow this sequence:

1. Step 1: Terminology updates (Capabilities, Notes, Scenarios)
2. Step 2: API documentation (add layout prop, update descriptions)
3. Step 3: Hero polish (update description)
4. Step 4: Validation & testing (run dev server, verify all changes)
   Estimated Implementation Time: ~1-2 hours (much less than Select's ~3-4 hours)

---

Questions Before Proceeding
Would you like me to:

1. Start implementation now - Begin making the documented changes?
2. Review the plan first - You review the plan document and provide feedback?
3. Answer specific questions - Clarify any aspects of the plan?
4. Move to a different task - The plan is complete and can be implemented later?
   The plan is comprehensive and ready for execution whenever you're ready to proceed!
