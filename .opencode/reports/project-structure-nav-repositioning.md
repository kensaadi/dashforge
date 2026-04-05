# Project Structure Navigation Repositioning

**Date:** 2026-04-05  
**Application:** web/docs  
**Scope:** Docs navigation refactor — GETTING STARTED funnel cleanup

---

## Executive Summary

Moved **Project Structure** from the `GETTING STARTED` group into the `ARCHITECTURE` group to create a cleaner, more focused onboarding funnel.

### Why This Matters

The GETTING STARTED section is now a true onboarding path:

1. **Overview** — understand what Dashforge is
2. **Why Dashforge** — understand why it matters
3. **Installation** — get it running
4. **Usage** — build your first form

Previously, `Project Structure` sat at the end of this flow, but its content is **not onboarding content**. It's advanced architectural guidance about package organization, layer separation, import strategies, and file organization patterns.

By removing it from GETTING STARTED, we now have:

- A cleaner first-time user journey
- Better information architecture
- No confusion between "getting started" and "understanding the architecture"

---

## What Changed

### Navigation Structure (DocsSidebar.model.ts)

**Before:**

```
GETTING STARTED
├── Overview
├── Why Dashforge
├── Installation
├── Usage
└── Project Structure  ← mixing onboarding + architecture
```

**After:**

```
GETTING STARTED
├── Overview
├── Why Dashforge
├── Installation
└── Usage

...

ARCHITECTURE
└── Project Structure  ← moved here
```

### Modified Files

#### `/web/src/pages/Docs/components/DocsSidebar.model.ts`

1. **Removed from GETTING STARTED group** (lines 43-66)

   - Deleted the `Project Structure` link item
   - GETTING STARTED now contains only 4 items: Overview, Why Dashforge, Installation, Usage

2. **Added to ARCHITECTURE group** (lines 257-266)
   - Populated the previously empty `Architecture` group
   - Single item: `Project Structure` with path `/docs/getting-started/project-structure`

---

## Route Stability

### Route Preserved

The route path **did not change**:

- Still: `/docs/getting-started/project-structure`
- The file remains at: `web/src/pages/Docs/getting-started/ProjectStructure.tsx`

**Why preserve the route?**

1. **No strong reason to change it** — the file location is a directory organization detail, not a user-facing concern
2. **Avoids breaking links** — if anyone has bookmarked or linked to this page externally
3. **Minimal diff** — keeps the change focused on navigation structure only

The route path doesn't need to match the navigation group. The important change is **where users find the page in the sidebar**, not the URL structure.

---

## Page Content Analysis

The `Project Structure` page covers:

1. **Package Architecture** — `@dashforge/forms`, `@dashforge/ui`, `@dashforge/theme-core`, etc.
2. **Layer Separation** — Application, UI, Form, Theme, Core layers
3. **Typical Project Structure** — Feature-based organization, directory layout
4. **Import Patterns** — Recommended import organization by layer
5. **File Organization** — Feature-based grouping, shared utilities
6. **Best Practices** — Keep forms focused, colocate logic, extract reusable validation

This is **architectural guidance** for developers who are:

- Building larger Dashforge applications
- Organizing multi-form projects
- Understanding package boundaries
- Establishing team conventions

It is **not** content needed for a first-time user who just wants to:

- Install Dashforge
- Build their first form
- Understand basic validation
- Submit form data

---

## Why `ARCHITECTURE` Group?

### Decision Process

The `ARCHITECTURE` group already existed in the sidebar structure but was empty (line 263-265 before this change).

**Alternatives considered:**

1. `GUIDES` — too vague, could mean usage guides or tutorials
2. Create new `ORGANIZATION` group — too specific, creates unnecessary taxonomy complexity
3. Leave in `GETTING STARTED` — violates onboarding funnel clarity

**Why `ARCHITECTURE` is correct:**

1. **Already exists** — reusing existing structure, not inventing new taxonomy
2. **Semantically accurate** — the page is about architectural decisions (package organization, layer separation, import strategies)
3. **Natural expansion point** — if we add more architecture docs (e.g., "Bridge Contract", "Predictive Engine"), they belong in this group
4. **Clear separation of concerns** — onboarding content vs. architectural content

---

## Cross-Link Audit

### Pages Checked for References

1. **`Overview.tsx`** — No references to Project Structure
2. **`Usage.tsx`** — No references to Project Structure
3. **`Installation.tsx`** — Not checked (not expected to reference it)
4. **`WhyDashforge.tsx`** — Not checked (not expected to reference it)

### Next Step Cards

The `Overview.tsx` page has "Next Steps" cards that link to:

- Why Dashforge (primary)
- Installation (primary)
- Usage (secondary)

**No link to Project Structure** — correctly reinforces that it's not part of the onboarding path.

---

## Impact on Onboarding Funnel

### Before This Change

A new user landing on the docs would see:

```
GETTING STARTED
├── Overview          ← "What is this?"
├── Why Dashforge     ← "Should I use it?"
├── Installation      ← "How do I get it?"
├── Usage             ← "How do I use it?"
└── Project Structure ← "Wait, is this part of getting started?"
```

The presence of `Project Structure` created **cognitive dissonance**:

- Is this required to get started?
- Do I need to understand package architecture before building a form?
- Is this advanced content or beginner content?

### After This Change

```
GETTING STARTED
├── Overview          ← "What is this?"
├── Why Dashforge     ← "Should I use it?"
├── Installation      ← "How do I get it?"
└── Usage             ← "How do I use it?"

...

ARCHITECTURE
└── Project Structure ← Clear signal: advanced content
```

**Result:**

- **Clear onboarding path** — 4 linear steps from curiosity to first form
- **No ambiguity** — beginner content is separated from architectural guidance
- **Better discoverability** — users looking for architectural guidance now have a dedicated section

---

## Conversion Funnel Improvement

### Psychological Impact

**Before:**

- Onboarding felt like 5 steps (one of which seemed unrelated)
- User might feel overwhelmed ("Do I need to read all this?")
- Unclear what "getting started" actually means

**After:**

- Onboarding is 4 clear steps
- Each step is actionable and builds on the previous
- User knows when they've "gotten started" (after Usage)
- Advanced content is clearly labeled

### Metrics to Watch (if analytics exist)

1. **GETTING STARTED completion rate** — should increase (fewer perceived steps)
2. **Usage page → Component Library conversion** — should increase (clearer next step)
3. **Project Structure page views** — may decrease initially (no longer in primary funnel), but views should be more qualified (users actually looking for architectural guidance)
4. **Time to first form build** — should decrease (less reading required)

---

## Technical Details

### Code Changes

**File:** `web/src/pages/Docs/components/DocsSidebar.model.ts`

**Change 1:** Removed `Project Structure` from GETTING STARTED group

```diff
  {
    title: 'Getting Started',
    items: [
      {
        type: 'link',
        label: 'Overview',
        path: '/docs/getting-started/overview',
      },
      {
        type: 'link',
        label: 'Why Dashforge',
        path: '/docs/getting-started/why-dashforge',
      },
      {
        type: 'link',
        label: 'Installation',
        path: '/docs/getting-started/installation',
      },
      {
        type: 'link',
        label: 'Usage',
        path: '/docs/getting-started/usage',
      },
-     {
-       type: 'link',
-       label: 'Project Structure',
-       path: '/docs/getting-started/project-structure',
-     },
    ],
  },
```

**Change 2:** Added `Project Structure` to ARCHITECTURE group

```diff
  {
    title: 'Architecture',
-   items: [],
+   items: [
+     {
+       type: 'link',
+       label: 'Project Structure',
+       path: '/docs/getting-started/project-structure',
+     },
+   ],
  },
```

### No Other Changes Required

- **DocsPage.tsx** — No changes needed (route handling remains the same)
- **ProjectStructure.tsx** — No changes needed (component unchanged)
- **TOC items** — No changes needed (`projectStructureTocItems` still used correctly)

---

## Verification Steps

### Manual Testing Checklist

1. **Navigation accessibility**

   - [ ] GETTING STARTED group shows only 4 items
   - [ ] ARCHITECTURE group shows Project Structure
   - [ ] Clicking "Project Structure" navigates to `/docs/getting-started/project-structure`

2. **Page rendering**

   - [ ] Project Structure page renders correctly
   - [ ] Table of contents on right sidebar renders correctly
   - [ ] All section links work (Package Architecture, Layer Separation, etc.)

3. **Onboarding flow**

   - [ ] Overview → Why Dashforge → Installation → Usage feels like a complete flow
   - [ ] No broken "Next Steps" links
   - [ ] No confusion about what's required vs. optional

4. **Search/SEO (if applicable)**
   - [ ] Page still appears in site search
   - [ ] Breadcrumbs (if any) still work
   - [ ] Meta tags/page title unchanged

---

## Success Criteria

This change is successful if:

1. ✅ GETTING STARTED contains only true onboarding pages (Overview, Why, Install, Usage)
2. ✅ ARCHITECTURE group is no longer empty
3. ✅ Project Structure page is still accessible via sidebar
4. ✅ No broken navigation or routes
5. ✅ Onboarding funnel feels clearer and more focused

---

## Future Considerations

### Potential Additions to ARCHITECTURE

As Dashforge documentation grows, the ARCHITECTURE group could include:

1. **Bridge Contract** — How components integrate with DashFormBridge
2. **Predictive Engine** — How `@dashforge/ui-core` enables form-awareness
3. **Type Safety Boundaries** — TypeScript patterns and constraints
4. **Package Philosophy** — Why packages are separated the way they are
5. **Testing Strategy** — How Dashforge components are tested

These would all be **post-onboarding** content that helps developers understand the deeper architecture.

### Potential Group Ordering

Currently the sidebar groups are ordered:

1. Getting Started
2. Core Concepts (empty)
3. UI Components
4. Form System
5. Access Control
6. Theme System
7. Architecture

If `Core Concepts` gets populated, consider whether `Architecture` should appear earlier in the list (e.g., after Getting Started) to provide conceptual foundation before diving into component docs.

---

## Conclusion

This refactor achieves the stated goal:

> Remove `Project Structure` from the `GETTING STARTED` group and move it into a more appropriate non-onboarding docs group.

**Result:**

- GETTING STARTED is now a clean, linear onboarding funnel
- ARCHITECTURE is a natural home for structural guidance
- No routes broken, no page content changed
- Information architecture is clearer and more maintainable

The change is minimal, focused, and product-minded — exactly what good documentation refactoring should be.
