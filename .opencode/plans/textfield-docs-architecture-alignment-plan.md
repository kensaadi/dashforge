# TextField Documentation Architecture Alignment Plan

**Status**: Ready for Approval (Updated)  
**Date**: Mon Mar 23 2026  
**Task**: `textfield-docs-architecture-alignment.md`  
**Policy Compliance**: `reaction-v2.md`  

---

## User Corrections Applied

**Correction 1**: Do not use "Reactive V2" as the capability card title for TextField.
- Use more precise title: "Reactive Visibility" or "Conditional Rendering"
- Mention Reactive V2 in description for architectural alignment only

**Correction 2**: Use "bridge-based integration" carefully.
- Keep it where architectural clarity matters (notes, API)
- Use developer-facing wording in hero/capabilities/scenarios:
  - "DashForm integration"
  - "automatic field binding"
  - "validation from form context"

---

## Executive Summary

The TextField component documentation requires alignment with current architectural reality following Reactive V2 integration and DashForm bridge architecture. This plan outlines **surgical, minimum-complete updates** to reflect TextField's role as a foundational component while preserving existing structure and visual design.

**Key Differences from Select**:
- TextField does NOT have runtime options (not applicable to text input)
- Focus is on validation gating, layouts, and visibility behavior
- TextField is MORE fundamental than Select (acts as composition base)
- Documentation emphasizes foundation role, not runtime data loading

**Key Changes Required**:
- Update "Predictive Ready" capability to **"Reactive Visibility"** (more precise than "Reactive V2")
- Clarify validation gating behavior (touched/submitted error display)
- Document layout modes architecturally (not just styling)
- Emphasize **DashForm integration** with automatic field binding
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
   - **DashForm Integration**: Automatic field binding via DashFormBridge
   - **Reactive Visibility**: Supports visibleWhen for conditional rendering
3. **Bridge Architecture** - Uses DashFormBridge for form context (technical detail)
4. **Validation Gating** - Errors show only when touched OR submitted (Form Closure v1)
5. **Layout Modes** - Architectural concern: floating, stacked, inline
6. **Select Mode Composition** - TextField with `select` prop enables Select behavior
7. **NO Runtime Options** - Unlike Select, TextField doesn't load async option data

### Documentation Gaps (Current State)

**Critical Gaps**:
1. **TextFieldCapabilities.tsx** - "Predictive Ready" is vague/aspirational (should be "Reactive Visibility")
2. **TextFieldNotes.tsx** - "Predictive Forms" note is vague about visibleWhen
3. **TextFieldScenarios.tsx** - Uses old "Predictive" terminology (should be "Reactive Visibility")
4. **TextFieldApi.tsx** - Missing explicit documentation of automatic field binding
5. **TextFieldDocs.tsx** - Hero description mentions "predictable state management" (vague)

**Secondary Gaps**:
- Validation gating behavior mentioned but not emphasized
- Layout modes presented as visual variants, not architectural modes
- Foundation role (Select composition) not mentioned
- DashForm integration implicit, not explicit

### Alignment Strategy

**Preserve + Clarify**:
- Keep all existing sections and structure
- Update terminology from "Predictive" to "Reactive Visibility" (component-specific)
- Use developer-facing language ("DashForm integration", "automatic field binding")
- Reserve "bridge-based integration" for technical notes/API sections
- Emphasize validation gating and layouts as architectural features
- Add foundation role note (Select composition)

**Three-Mode Clarity**:
Every relevant section will clearly distinguish:
1. **Standalone/Controlled** - Basic React patterns
2. **DashForm Integration** - Automatic field binding and validation
3. **Reactive Visibility** - visibleWhen behavior, engine-driven

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
   - Use developer-facing language (NOT "bridge-based integration")

**Updated Hero Description**:
```tsx
// Line 52-55: Update description
An intelligent input component built on MUI TextField. Supports standalone usage, 
seamless DashForm integration with automatic field binding, validation error gating, 
and reactive visibility. The foundation for composed field behaviors.
```

2. **Quick-Start Code** (line 139-141):
   - Keep existing simple example (correct for quick-start per user corrections)
   - Do NOT add complex examples here

**Why**: Hero uses developer-facing language ("DashForm integration", "automatic field binding") instead of technical "bridge-based integration". Quick-start stays simple.

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
1. **Update Card 3 Title**: "Predictive Ready" → **"Reactive Visibility"** (precise, component-specific)
2. **Update Card 3 Status**: "Architectural Direction" → "Available Now"
3. **Update Card 3 Description**:
   - Remove aspirational language
   - Clarify current visibleWhen behavior
   - Mention Reactive V2 in description (architectural alignment context)
   - Emphasize component-level conditional rendering
   - Use developer-facing language
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
  title: 'Reactive Visibility',
  status: 'Available Now',
  statusColor: isDark ? 'rgba(139,92,246,0.90)' : 'rgba(109,40,217,0.95)',
  statusBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
  statusBorder: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.20)',
  description: 'TextField supports conditional rendering through the visibleWhen prop. Component-level visibility controlled by engine-driven predicates. Enables field-to-field dependencies and dynamic form flows without manual state orchestration. Built on Reactive V2 architecture.',
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

**Why**: "Reactive Visibility" is precise and component-specific (not overloaded "Reactive V2"). Mentions Reactive V2 in description for architectural context only.

---

### 3. `TextFieldNotes.tsx` (Implementation Notes)

**Application**: `web`  
**Folder**: `web/src/pages/Docs/components/text-field`  
**File**: `TextFieldNotes.tsx`  

**Current State**:
- 6 implementation notes (lines 13-44)
- Note 2: "Form Integration" - accurate but could be more explicit
- Note 4: "Error Gating" - accurate (touched/submitted gating)
- Note 5: "Predictive Forms" - vague about visibleWhen

**Required Changes**:
1. **Update Note 2 Title**: "Form Integration" → "DashForm Integration"
2. **Update Note 2 Content**:
   - Use developer-facing language ("automatic field binding")
   - Mention bridge-based integration as technical detail
   - Clarify validation from form context
3. **Update Note 5 Title**: "Predictive Forms" → "Reactive Visibility"
4. **Update Note 5 Content**:
   - Clarify visibleWhen is component-level
   - Emphasize engine-driven predicates
   - Mention Reactive V2 architecture in context
5. **Add Note 7**: "Foundation for Composed Behaviors"

**Updated Note 2**:
```tsx
{
  title: 'DashForm Integration',
  content: 'When used inside DashForm, TextField automatically binds to the form through the DashFormBridge. The component self-registers on mount, binding value, onChange, and onBlur handlers automatically. Validation errors from form context display as helperText. No explicit prop passing required—integration is seamless.',
}
```

**Updated Note 5**:
```tsx
{
  title: 'Reactive Visibility',
  content: 'TextField supports conditional rendering through the visibleWhen prop (part of Reactive V2 architecture). This is a component-level decision powered by engine-driven predicates. The engine provides access to all field state via getNode(name), and the component re-evaluates visibility on dependency changes. When visibleWhen returns false, the component renders null.',
}
```

**New Note 7**:
```tsx
{
  title: 'Foundation for Composed Behaviors',
  content: 'TextField serves as the architectural foundation for composed field behaviors. For example, passing the select prop to TextField enables native select dropdown behavior, which is how the Select component is implemented. This composition pattern maintains consistency across field types while enabling specialized functionality.',
}
```

**Why**: Note 2 uses developer-facing language ("automatic field binding", "validation from form context") with bridge mentioned as technical detail. Note 5 uses precise "Reactive Visibility" title with Reactive V2 mentioned in architectural context.

---

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
   - `rules`: Clarify DashForm integration
   - `visibleWhen`: Clarify component-level + engine-driven
   - `error`/`helperText`: Add precedence note with developer-facing language
3. **Add Section Note**: Explicit vs Auto-Bound Props (developer-facing language)

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
  description: 'If true, displays error state. Explicit error prop overrides form-provided error state. When inside DashForm without explicit prop, error is gated (shows only when touched OR submitted).',
}
{
  name: 'helperText',
  type: 'string',
  description: 'Helper text displayed below input. Explicit helperText prop overrides form-provided validation error message. When inside DashForm, validation errors display as helperText (gated by touched/submitted state).',
}
```

**New Section Note** (add before table - developer-facing language):
```tsx
<Typography variant="body2" sx={{ mb: 2, /* styling */ }}>
  <strong>Explicit vs Auto-Bound Props:</strong> When inside DashForm, 
  TextField receives value, error, helperText, onChange, and onBlur automatically 
  through field binding. Explicit props always take precedence over form-provided values.
</Typography>
```

**Why**: API reference can use technical term "bridge" in context but emphasizes developer-facing concepts ("auto-bound", "form-provided"). Descriptions focus on practical behavior.

---

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
   - Replace "Predictive" terminology
   - Use "Reactive Visibility" (component-specific)
   - Mention Reactive V2 in architectural context only
   - Clarify component-level conditional rendering
   - Use developer-facing language
3. **Update Scenario 2 Code Comments**:
   - Clarify Engine API provides state access
   - Component makes rendering decision

**Updated Scenario 2**:
```tsx
{
  id: 'reactive-conditional-visibility',
  title: 'Reactive Conditional Visibility',
  subtitle: 'Try it: Select a contact method and watch fields appear',
  description: 'TextField supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Email" or "Phone" to see conditional fields appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
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

**Why**: Uses precise "Reactive Conditional Visibility" title. Mentions Reactive V2 only in architectural context within description.

---

### Files 7-12: No Changes Required

**The following files are accurate and require no updates**:

7. **TextFieldLayoutVariants.tsx** - Layout demonstration is accurate
8. **TextFieldPlayground.tsx** - Standalone playground is appropriate (no DashForm complexity needed)
9. **demos/FormIntegrationDemo.tsx** - Demo accurately shows DashForm integration
10. **demos/PredictiveDemo.tsx** - Demo accurately shows conditional visibility (code is correct)
11. **textFieldPlayground.helpers.ts** - Utility code, no changes needed
12. **TextFieldDebug.tsx** - Debug component, not user-facing

---

## Validation Strategy

### Phase 1: Pre-Implementation Validation

**Before writing code, verify**:
1. ✅ Read all current docs files (DONE)
2. ✅ Read current TextField implementation (DONE)
3. ✅ Read policy requirements (DONE)
4. ✅ Identify all gaps (DONE in this plan)
5. ✅ Plan minimum-complete updates (DONE in this plan)
6. ✅ Apply user corrections (DONE in this update)

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
   - Verify terminology consistency ("Reactive Visibility" not "Predictive" or "Reactive V2" in titles)
   - Verify developer-facing language in hero/capabilities/scenarios
   - Verify technical language (bridge) only in notes/API where appropriate
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
   - Verify documented DashForm integration matches implementation
   - Verify documented layout behavior matches implementation

3. **Policy Compliance**:
   - Re-read `reaction-v2.md`
   - Verify visibleWhen is described as component-level (not engine-controlled)
   - Verify no claims about runtime option loading (TextField doesn't have this)
   - Verify engine provides state, component decides rendering

### Phase 4: Terminology Consistency Check

**Ensure terminology follows user corrections**:
1. **Capability Card Title**: "Reactive Visibility" (NOT "Reactive V2")
2. **Reactive V2 Mentions**: Only in descriptions for architectural context
3. **Developer-Facing Language** (hero/capabilities/scenarios):
   - "DashForm integration" ✅
   - "automatic field binding" ✅
   - "validation from form context" ✅
4. **Technical Language** (notes/API only):
   - "bridge-based integration" ✅ (where architectural clarity matters)
   - "bridge" or "DashFormBridge" ✅ (technical context)

### Phase 5: User Experience Validation

**Walk through as new developer**:
1. Start at top of page (hero)
2. Read quick-start → Should see simple TextField usage
3. Read examples → Should see standalone usage patterns
4. Try playground → Should explore visual/layout props
5. Read capabilities → Should understand three modes with clear language
6. Try scenarios → Should see DashForm integration + reactive visibility
7. Check API reference → Should find all props with clear descriptions
8. Read notes → Should understand integration, validation gating, layouts

**Success Criteria**:
- New developer can distinguish three usage modes
- DashForm integration is clear and developer-friendly
- Validation gating behavior is understandable
- Layout modes are understood as architectural, not just styling
- visibleWhen behavior is clear (component-level, engine-driven)
- Foundation role (Select composition) is mentioned
- Terminology is precise ("Reactive Visibility") and developer-facing

---

## Implementation Sequence

### Step 1: Terminology Updates (High Impact, Low Risk)
1. Update `TextFieldCapabilities.tsx` - Fix "Predictive Ready" → "Reactive Visibility"
2. Update `TextFieldNotes.tsx` - Fix note titles and content (developer-facing language)
3. Update `TextFieldScenarios.tsx` - Fix scenario 2 title and description

**Rationale**: Terminology alignment is critical. Low risk (text-only changes). Apply user corrections throughout.

### Step 2: API Documentation (Medium Impact, Low Risk)
4. Update `TextFieldApi.tsx` - Add missing props, update descriptions (appropriate technical language)

**Rationale**: API completeness is essential. Text and table updates only.

### Step 3: Hero and Content Polish (Low Impact, Low Risk)
5. Update `TextFieldDocs.tsx` - Fix hero description (developer-facing language)

**Rationale**: Minor text update. Low risk.

### Step 4: Validation & Testing
6. Run dev server and test all changes
7. Verify all demos work interactively
8. Read through entire page for consistency
9. Verify terminology follows user corrections
10. Compare API reference against TextField implementation
11. Verify policy compliance (no incorrect claims)

**Rationale**: Systematic validation before considering task complete.

---

## Risk Assessment

### Low Risk
- Terminology updates (pure text changes, following user corrections)
- API reference updates (table content only)
- Hero description update (single line, developer-facing)
- Implementation notes updates (text content, appropriate language)

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
3. **Terminology Review**: Verify all changes follow user corrections
4. **Rollback Plan**: Git commit after each major section
5. **Review Checklist**: Use validation strategy checklist before marking complete

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

### Terminology Alignment (User Corrections Applied)
✅ **Confirmed**: Terminology follows user corrections.
- **Capability card title**: "Reactive Visibility" (NOT "Reactive V2")
- **Reactive V2 mentions**: Only in descriptions for architectural context
- **Developer-facing language** (hero/capabilities/scenarios):
  - "DashForm integration" ✅
  - "automatic field binding" ✅
  - "validation from form context" ✅
- **Technical language** (notes/API only):
  - "bridge-based integration" ✅ (where architectural clarity matters)

---

## Success Criteria

### Documentation Completeness
- [ ] All three usage modes documented (standalone, DashForm, reactive visibility)
- [ ] DashForm integration explicitly documented (developer-facing language)
- [ ] Validation gating behavior clearly explained
- [ ] Layout modes presented as architectural features
- [ ] visibleWhen behavior accurately described (component-level, engine-driven)
- [ ] Foundation role documented (Select composition base)
- [ ] API reference complete (all props present with accurate descriptions)

### Terminology Consistency (User Corrections)
- [ ] "Reactive Visibility" used as capability card title (NOT "Reactive V2")
- [ ] "Reactive V2" mentioned only in descriptions for architectural context
- [ ] Developer-facing language in hero/capabilities/scenarios
- [ ] Technical language ("bridge") only in notes/API where appropriate

### Example Quality
- [ ] All existing examples remain accurate
- [ ] All code examples are copy-paste ready
- [ ] All demos work interactively without errors
- [ ] No duplication between Examples and Scenarios sections

### User Experience
- [ ] New developer can understand three modes within 5 minutes
- [ ] DashForm integration is discoverable and clear (developer-friendly language)
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

| File | Change Type | Risk Level | Lines Changed (Est.) |
|------|-------------|------------|----------------------|
| TextFieldDocs.tsx | Update | Low | ~5 |
| TextFieldCapabilities.tsx | Update | Low | ~25 |
| TextFieldNotes.tsx | Update | Low | ~30 |
| TextFieldScenarios.tsx | Update | Low | ~40 |
| TextFieldApi.tsx | Update | Low | ~35 |
| **TOTAL** | | | **~135 lines** |

**Note**: No new files. No files removed. Significantly less churn than Select docs update.

### B. Testing Checklist

**Before Implementation**:
- [x] Read all current docs files
- [x] Read current TextField implementation
- [x] Read policy requirements
- [x] Plan changes
- [x] Apply user corrections

**During Implementation**:
- [ ] Test each file change incrementally
- [ ] Verify code syntax (no TypeScript errors)
- [ ] Verify formatting matches existing style
- [ ] Run dev server after each change
- [ ] Verify terminology follows user corrections

**After Implementation**:
- [ ] Full page walkthrough as new user
- [ ] Test all interactive demos
- [ ] Verify all sections render correctly
- [ ] Check for typos and formatting issues
- [ ] Verify terminology consistency (user corrections applied)
- [ ] Compare API reference against TextField.tsx
- [ ] Verify policy compliance (visibleWhen described correctly)

### C. Key Terminology (User Corrections Applied)

**Capability Card Title**:
- ✅ Use: "Reactive Visibility" (precise, component-specific)
- ❌ Avoid: "Reactive V2" (too broad for component-level feature)

**Reactive V2 Context**:
- ✅ Mention in descriptions for architectural alignment
- ❌ Don't use as primary title or overemphasize

**Developer-Facing Language** (hero/capabilities/scenarios):
- ✅ "DashForm integration"
- ✅ "automatic field binding"
- ✅ "validation from form context"
- ✅ "form-provided" (instead of "bridge-provided")
- ❌ Avoid: "bridge-based integration" (technical jargon)

**Technical Language** (notes/API only):
- ✅ "bridge-based integration" (where architectural clarity matters)
- ✅ "DashFormBridge" (technical context)
- Use sparingly, only where precision is required

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
5. **Capability Card Title**:
   - Select: "Runtime & Reactive" (specific to runtime options)
   - TextField: "Reactive Visibility" (specific to conditional rendering)

**Similarities**:
1. Both mention Reactive V2 in architectural context
2. Both clarify DashForm integration (developer-facing language)
3. Both emphasize three usage modes
4. Both preserve existing structure
5. Both follow Reactive V2 policy

---

## Approval Required

This plan is ready for review and approval before implementation begins.

**User Corrections Applied**:
1. ✅ Capability card title: "Reactive Visibility" (NOT "Reactive V2")
2. ✅ Developer-facing language in user-facing sections
3. ✅ Technical language ("bridge") reserved for notes/API

**Key Questions for Stakeholders**:
1. Is the updated terminology ("Reactive Visibility") appropriate?
2. Is the balance between developer-facing and technical language correct?
3. Are there any other gaps not covered in this plan?
4. Is the foundation role (Select composition) sufficiently documented?

**Recommendation**: Approve and proceed with implementation in the sequence outlined.

---

**End of Plan**
