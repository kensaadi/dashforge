# Docs Architecture Policies Creation Report

**Date**: 2026-03-28  
**Status**: ✅ COMPLETED

---

## File Created

**Path**: `.opencode/policies/docs-architecture.policies.md`  
**Size**: ~16KB  
**Format**: Markdown  
**Language**: English  
**Tone**: Senior engineering standards, strict, non-negotiable

---

## Sections Confirmed

All required sections included and enforced:

### ✅ 1. Overview

- Philosophy defined: explicit composition, no hidden orchestration, primitives over frameworks
- Clear statement of architectural intent

### ✅ 2. Core Principles

- 5 mandatory requirements defined
- Explicit rules for React composition
- Config-driven patterns forbidden
- Readability requirements enforced
- Hidden abstractions prohibited
- Custom section ownership clarified

### ✅ 3. Shared Primitives Rules

- Exactly 4 allowed primitives listed:
  - DocsHeroSection
  - DocsSection
  - DocsDivider
  - DocsCalloutBox
- Primitive requirements: single responsibility, 2-5 props max, zero conditional logic
- Extraction criteria: 3+ usages, zero variability, stable contract
- Complexity management rules: create new component, never add props

### ✅ 4. Forbidden Patterns

- 5 explicitly rejected abstractions documented:
  - DocsPageLayout orchestrator
  - Config-driven sections
  - Dynamic rendering engines
  - Generic one-size-fits-all wrappers
  - Smart primitives
- Forbidden prop patterns listed:
  - variant props with 3+ variants
  - mode/type props controlling layout
  - config/options objects
  - children as render props
  - structure-altering callbacks

### ✅ 5. Section Ownership Rules

- "Always Local" sections defined:
  - Quick Start
  - Interactive Playground
  - Complex wrapped sections
  - Implementation Notes
- "Always Shared" patterns defined:
  - Hero section
  - Standard section headers
  - Dividers
  - Callout boxes

### ✅ 6. Composition Pattern (Example)

- Canonical structure provided with complete example
- Pattern rules documented (8 rules)
- Clear guidance for when to use primitives vs local code

### ✅ 7. Anti-Patterns

- 4 concrete bad examples provided:
  - Over-abstracted DocsSection
  - "Smart" primitives
  - Hidden layout logic
  - Excessive prop-driven behavior
- Each anti-pattern includes:
  - Code example (WRONG)
  - Reason why forbidden
  - Correct approach

### ✅ 8. Extension Rules

- "When to Add a New Primitive" - 5 criteria
- "Preferred: Duplication Over Wrong Abstraction" - clear guidance
- Abstraction threshold checklist (5 questions)
- Refactoring discipline: DO/DO NOT lists

### ✅ 9. Acceptance Criteria for Future Tasks

- Pre-implementation checklist (4 items)
- Implementation checklist (11 items)
- Post-implementation checklist (8 items)
- Review checklist (8 items)
- Clear rejection policy for violations

---

## Additional Sections Included

### ✅ 10. Enforcement

- Policy status: MANDATORY
- Scope: All docs-related work
- Violation policy: Must be reverted
- Review authority defined
- Individual contributor restrictions

### ✅ 11. References

- Implementation examples listed
- Shared primitives location
- Related reports referenced
- Related components documented

### ✅ 12. Version History

- v1.0 (2026-03-28) documented
- Initial policy establishment details
- Reference implementation noted
- Status: ENFORCED

---

## Enforced Rules Summary

### Core Architectural Rules (5)

1. **Docs pages MUST be explicit React components**
2. **Docs pages MUST NOT be config-driven**
3. **Page structure MUST be readable at a glance**
4. **No hidden abstraction layers**
5. **Custom sections MUST remain local**

### Shared Primitives Rules (4)

1. **DocsHeroSection** - Hero with gradient title
2. **DocsSection** - Standard section wrapper
3. **DocsDivider** - Theme-aware divider
4. **DocsCalloutBox** - Typed callout boxes

### Primitive Requirements (6)

1. Single, clear responsibility
2. 2-5 props maximum
3. Zero conditional rendering logic
4. Pure presentational components
5. No state management (except theme)
6. No orchestration of child behavior

### Extraction Criteria (5)

1. Proven duplication (3+ components)
2. Zero variability (100% identical structure)
3. Stable contract (props unlikely to change)
4. Clear boundaries (single responsibility obvious)
5. No flags needed (no conditional rendering)

### Forbidden Patterns (5)

1. **DocsPageLayout** orchestrator
2. **Config-driven sections** (sections: [])
3. **Dynamic rendering engines**
4. **Generic wrappers** with excessive flags
5. **Smart primitives** with business logic

### Always Local Sections (4)

1. **Quick Start** - Too variable, custom theming
2. **Interactive Playground** - Unique to form fields
3. **Complex wrapped sections** - Custom styling
4. **Implementation Notes** - Styling variations

### Always Shared Patterns (4)

1. **Hero section** - Zero variability
2. **Standard section headers** - 100% identical
3. **Dividers** - Pure styling
4. **Callout boxes** - Type-based styling

---

## Policy Characteristics

### ✅ Strict and Prescriptive

- Uses imperative language: MUST, MUST NOT, FORBIDDEN
- No "maybe", "could", "should consider"
- Clear boundaries with zero ambiguity
- Non-negotiable rules explicitly stated

### ✅ Structured for Engineers

- Technical focus, no beginner explanations
- Code examples for good and bad patterns
- Checklists for systematic enforcement
- Clear rationale for each restriction

### ✅ Easy to Scan and Enforce

- Clear section hierarchy
- Numbered lists for criteria
- Checkboxes for acceptance criteria
- Concrete code examples
- Bold keywords (MUST, FORBIDDEN, WRONG, CORRECT)

### ✅ Reusable Across Future Tasks

- Self-contained reference document
- No external dependencies
- Complete decision rationale included
- Links to implementation examples
- Version history for evolution

---

## Protection Against Regressions

This policy file prevents:

### ❌ DocsPageLayout Re-Introduction

- Explicitly forbidden in "Forbidden Patterns" section
- Rationale documented
- Anti-pattern example provided
- Review checklist includes check

### ❌ Over-Abstracted Components

- Primitive requirements limit complexity (2-5 props)
- Forbidden prop patterns listed
- "Smart primitives" explicitly rejected
- Complexity management rules enforce new components over prop creep

### ❌ Config-Driven Sections

- Core principle #2: "MUST NOT be config-driven"
- Forbidden pattern #2: "Config-driven sections"
- Anti-pattern #3: "Hidden layout logic"
- Review checklist: "No config objects present?"

### ❌ Hidden Page Structure

- Core principle #3: "MUST be readable at a glance"
- Canonical structure example provided
- Explicit JSX composition required
- Review checklist: "Structure immediately clear?"

### ❌ Premature Abstraction

- Extension rules: 3+ usages required
- Duplication preferred over wrong abstraction
- 5-question abstraction threshold
- Section ownership rules prevent extraction of variable patterns

---

## Tone Verification

### ✅ Senior Engineering Standards

- Technical language throughout
- Assumes engineering expertise
- No hand-holding or beginner explanations
- Focuses on architectural decisions and tradeoffs

### ✅ Strict and Non-Negotiable

- Enforcement section defines mandatory compliance
- Violation policy: must be reverted
- No exceptions without explicit architectural review
- Individual contributors cannot circumvent

### ✅ No Ambiguity

- Every rule uses imperative language (MUST/MUST NOT)
- Forbidden patterns explicitly listed
- Anti-patterns provided as concrete examples
- Clear acceptance criteria checklists

### ✅ Professional Authority

- Written as engineering standards document
- Policy status: ENFORCED
- Review authority defined
- Version history for accountability

---

## File Metrics

**Total Sections**: 12  
**Required Sections**: 9 (all included)  
**Additional Sections**: 3 (Enforcement, References, Version History)  
**Core Rules**: 5  
**Primitive Requirements**: 6  
**Forbidden Patterns**: 5  
**Anti-Pattern Examples**: 4  
**Checklists**: 4  
**Code Examples**: 7  
**Lines**: ~560  
**Words**: ~3,800

---

## Validation Checklist

### Content Validation

✅ All required sections present  
✅ Sections in correct order  
✅ English language throughout  
✅ Markdown formatting correct  
✅ Code examples properly formatted  
✅ Checklists use checkbox syntax  
✅ Headings follow hierarchy

### Tone Validation

✅ Strict and prescriptive language  
✅ No fluff or beginner explanations  
✅ Structured for engineers  
✅ Non-negotiable statements  
✅ Senior engineering standards tone  
✅ No ambiguous language

### Technical Validation

✅ Core principles clearly defined  
✅ Shared primitives enumerated  
✅ Forbidden patterns explicitly listed  
✅ Section ownership rules clear  
✅ Composition pattern provided  
✅ Anti-patterns with examples  
✅ Extension rules documented  
✅ Acceptance criteria complete

### Enforcement Validation

✅ Policy status: MANDATORY  
✅ Violation consequences defined  
✅ Review authority established  
✅ Contributor restrictions clear  
✅ Review checklist comprehensive

---

## Success Criteria

### ✅ Primary Goal: Lock Architectural Decisions

The policy file successfully:

- Codifies the explicit composition architecture
- Prevents config-driven regression
- Locks the 4-primitive decision
- Forbids page-level orchestration
- Preserves local ownership of custom sections

### ✅ Secondary Goal: Reusable Reference

The policy file provides:

- Self-contained decision rationale
- Complete implementation guidance
- Clear review criteria
- Concrete code examples
- Systematic enforcement checklists

### ✅ Tertiary Goal: Future-Proof

The policy file ensures:

- New contributors understand constraints
- PRs can be systematically reviewed
- Regressions are immediately identifiable
- Evolution requires explicit architectural review
- Version history tracks changes

---

## Next Steps

### Immediate

1. ✅ Policy file created at `.opencode/policies/docs-architecture.policies.md`
2. ✅ Confirmation report generated
3. Team can reference policy for all future docs work

### Ongoing

1. Reference this policy in all docs-related tasks
2. Include policy link in PR templates
3. Cite specific sections when rejecting violating PRs
4. Update version history when policy evolves

### Future

1. Create enforcement automation (linting rules)
2. Add policy validation to CI/CD
3. Periodic review for relevance (quarterly)
4. Expand examples as new patterns emerge

---

## Conclusion

**Status**: ✅ POLICY FILE SUCCESSFULLY CREATED AND ENFORCED

The Dashforge Docs Architecture Policies file has been created at:

**`.opencode/policies/docs-architecture.policies.md`**

The file is:

- **Complete**: All 9 required sections + 3 additional sections
- **Strict**: Non-negotiable rules with clear enforcement
- **Comprehensive**: 5 core rules, 4 primitives, 5 forbidden patterns
- **Reusable**: Self-contained reference for all future work
- **Future-proof**: Version history, extension rules, evolution guidance

This policy file is now the **single source of truth** for all Dashforge documentation architecture decisions and will prevent regressions such as:

- DocsPageLayout re-introduction
- Config-driven sections
- Over-abstracted primitives
- Hidden page structure
- Premature generalization

All future docs work MUST comply with this policy.

---

**Report Generated**: 2026-03-28  
**Policy Version**: 1.0  
**Status**: ENFORCED
